export class ConfigError extends Error {}

// All sheet access goes through the Apps Script web app (apps-script/Code.gs),
// which runs as the sheet owner's Google account.
export async function callScript(payload) {
  const url = process.env.APPS_SCRIPT_URL
  const secret = process.env.APPS_SCRIPT_SECRET
  if (!url || !secret) {
    throw new ConfigError('APPS_SCRIPT_URL and APPS_SCRIPT_SECRET must be set')
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, secret }),
    redirect: 'follow',
  })

  let data
  try {
    data = JSON.parse(await res.text())
  } catch {
    throw new Error(
      'The Apps Script did not return JSON. Check that it is deployed as a web app ' +
        'that executes as you, with access set to "Anyone".',
    )
  }
  if (data.error) throw Object.assign(new Error(data.error), { code: data.code })
  return data
}
