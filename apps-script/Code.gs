/**
 * Travel dashboard API. Paste into the WIP sheet's Apps Script project
 * (Extensions > Apps Script) and deploy as a web app that executes as you.
 *
 * Script property required: SECRET (shared with the Vercel app as APPS_SCRIPT_SECRET).
 */

var ALLOWED_STATUSES = ['Approved', 'Rejected'];

function doGet() {
  return json_({ ok: true, message: 'Travel dashboard API is running' });
}

function doPost(e) {
  var out;
  try {
    var body = JSON.parse(e.postData.contents);
    var secret = PropertiesService.getScriptProperties().getProperty('SECRET');
    if (!secret || body.secret !== secret) throw failure_(401, 'Unauthorized');

    if (body.action === 'list') out = { requests: listRequests_() };
    else if (body.action === 'setStatus') out = setStatus_(body);
    else throw failure_(400, 'Unknown action');
  } catch (err) {
    out = { error: err.message, code: err.code || 500 };
  }
  return json_(out);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function failure_(code, message) {
  var err = new Error(message);
  err.code = code;
  return err;
}

function norm_(v) {
  return String(v == null ? '' : v).trim().toLowerCase();
}

// Each tab has a title/KPI band above a header row that contains "Requester".
// Columns are located by header name so a moved column does not break the app.
function parseTab_(sheet) {
  var values = sheet.getDataRange().getDisplayValues();
  var headerIdx = -1;
  for (var i = 0; i < values.length; i++) {
    if (values[i].some(function (c) { return norm_(c) === 'requester'; })) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) return { requests: [], statusCol: -1 };

  var header = values[headerIdx].map(norm_);
  function col(test) {
    for (var c = 0; c < header.length; c++) if (test(header[c])) return c;
    return -1;
  }
  var idx = {
    requester: col(function (h) { return h === 'requester'; }),
    department: col(function (h) { return h === 'department'; }),
    destination: col(function (h) { return h.indexOf('destination') === 0; }),
    startDate: col(function (h) { return h === 'start date'; }),
    endDate: col(function (h) { return h === 'end date'; }),
    reason: col(function (h) { return h === 'reason for travel'; }),
    estCost: col(function (h) { return h === 'est. cost'; }),
    comments: col(function (h) { return h === 'comments'; }),
    status: col(function (h) { return h === 'approval status'; }),
    approver: col(function (h) { return h === 'approver'; }),
  };

  function get(row, i) {
    return i === -1 ? '' : String(row[i] == null ? '' : row[i]).trim();
  }

  var tab = sheet.getName();
  var requests = [];
  for (var r = headerIdx + 1; r < values.length; r++) {
    var row = values[r];
    var requester = get(row, idx.requester);
    if (!requester) continue;
    requests.push({
      id: tab + '!' + (r + 1),
      tab: tab,
      row: r + 1,
      requester: requester,
      department: get(row, idx.department),
      destination: get(row, idx.destination),
      startDate: get(row, idx.startDate),
      endDate: get(row, idx.endDate),
      reason: get(row, idx.reason),
      estCost: get(row, idx.estCost),
      comments: get(row, idx.comments),
      status: get(row, idx.status),
      approver: get(row, idx.approver),
    });
  }
  return { requests: requests, statusCol: idx.status };
}

function listRequests_() {
  var all = [];
  SpreadsheetApp.getActiveSpreadsheet().getSheets().forEach(function (sheet) {
    all = all.concat(parseTab_(sheet).requests);
  });
  return all;
}

function setStatus_(body) {
  if (ALLOWED_STATUSES.indexOf(body.status) === -1) {
    throw failure_(400, 'status must be one of: ' + ALLOWED_STATUSES.join(', '));
  }
  var row = Number(body.row);
  if (!body.tab || !isFinite(row) || row < 1 || Math.floor(row) !== row) {
    throw failure_(400, 'tab and row are required');
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(body.tab);
    if (!sheet) throw failure_(404, 'That tab was not found. Refresh and try again.');

    // Re-read the row and confirm it is still the same pending request before writing,
    // so a re-sorted sheet or a second approver cannot cause a wrong update.
    var parsed = parseTab_(sheet);
    var target = null;
    parsed.requests.forEach(function (r) {
      if (r.row === row) target = r;
    });
    if (parsed.statusCol === -1 || !target) {
      throw failure_(404, 'That request was not found. Refresh and try again.');
    }
    if (target.requester !== body.requester) {
      throw failure_(409, 'The sheet has changed. Refresh and try again.');
    }
    if (norm_(target.status) !== 'pending') {
      throw failure_(
        409,
        'This request is already "' + (target.status || 'no status') + '". Refresh to see the latest.'
      );
    }

    sheet.getRange(row, parsed.statusCol + 1).setValue(body.status);
    return { ok: true, id: target.id, status: body.status };
  } finally {
    lock.releaseLock();
  }
}
