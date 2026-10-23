# dashboard1

Travel request dashboard (React + Vite) that reads the **WIP Travel request approval** Google Sheet.

- Table of request counts per status (Pending, Approved, Rejected, any other status, and "No status").
  "Denied" and "Declined" are grouped under Rejected.
- Click a status to drill into the list of requests with that status.
- Pending requests have **Approve** / **Reject** buttons that write the new value to the
  *Approval Status* column of the sheet.

## How it works

A small **Google Apps Script** ([apps-script/Code.gs](apps-script/Code.gs)) lives inside the sheet and is deployed
as a web app that **executes as the sheet owner's Google account**. It reads every tab (columns are found by
header name) and updates one status cell at a time. It only writes if the row still holds the same requester and
the request is still Pending.

Two Vercel serverless functions sit between the dashboard and the script:

- `api/requests.js` loads all requests.
- `api/status.js` checks the approver passcode, then asks the script to update a status.

Every approval is made by the account that deployed the script. The passcode (Vercel) and a shared secret
(between Vercel and the script) stop other people from reading or changing the sheet through the web app URL.

## One-time setup

1. Open the WIP sheet, then **Extensions > Apps Script**. Replace the default code with the contents of
   `apps-script/Code.gs` and save.
2. In **Project Settings** (gear icon) > **Script Properties**, add `SECRET` with a long random value.
3. **Deploy > New deployment > Web app**: *Execute as* **Me**, *Who has access* **Anyone**. Deploy and
   authorize when asked. Copy the web app URL (it ends in `/exec`).
4. Opening that URL in a browser should show `{"ok":true,...}`.
5. In Vercel > Project > Settings > Environment Variables, add `APPS_SCRIPT_URL`, `APPS_SCRIPT_SECRET`
   (same value as `SECRET`) and `APPROVER_PASSCODE`. Redeploy.

After editing `Code.gs` later, use **Deploy > Manage deployments > Edit > New version** so the live web app
picks up the change.

Keep the web app URL, secret and passcode out of the repo. Also turn on Vercel Deployment Protection so the
dashboard is not public: the passcode only guards writes, and the request list is readable by anyone who can
open the site.

## Develop

```bash
npm install
npm run dev
```

Plain `npm run dev` has no API, so the app shows sample data. To run against the real sheet locally,
copy `.env.example` to `.env.local`, fill it in, and use `npx vercel dev`.

## Build

```bash
npm run build
```
