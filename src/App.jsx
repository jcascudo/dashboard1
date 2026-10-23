import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchRequests, updateStatus } from './lib/api.js'
import { normalizeStatus, summarize } from './lib/status.js'
import StatusSummary from './components/StatusSummary.jsx'
import RequestTable from './components/RequestTable.jsx'
import FlashButton from './components/FlashButton.jsx'

const PASSCODE_KEY = 'approverPasscode'

function readPasscode() {
  try {
    return sessionStorage.getItem(PASSCODE_KEY) || ''
  } catch {
    return ''
  }
}

function storePasscode(value) {
  try {
    sessionStorage.setItem(PASSCODE_KEY, value)
  } catch {
    // storage unavailable; the passcode just won't persist across reloads
  }
}

export default function App() {
  const [requests, setRequests] = useState([])
  const [demo, setDemo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState('Pending')
  const [passcode, setPasscode] = useState(readPasscode)
  const [busyId, setBusyId] = useState(null)
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await fetchRequests()
      setRequests(result.requests)
      setDemo(result.demo)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const summary = useMemo(() => summarize(requests), [requests])
  const visible = useMemo(
    () => requests.filter((r) => normalizeStatus(r.status) === selected),
    [requests, selected],
  )

  function changePasscode(value) {
    setPasscode(value)
    storePasscode(value)
  }

  async function decide(request, status) {
    setNotice('')
    if (!demo && !passcode) {
      setNotice('Enter the approver passcode above before approving or rejecting.')
      return
    }
    setBusyId(request.id)
    try {
      if (!demo) await updateStatus(request, status, passcode)
      setRequests((prev) => prev.map((r) => (r.id === request.id ? { ...r, status } : r)))
      setNotice(`${request.requester} (${request.tab}) marked ${status}.`)
    } catch (err) {
      setNotice(err.message)
      if (err.status === 409 || err.status === 404) load()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <main>
      <header className="page-header">
        <h1>Travel Request Dashboard</h1>
        <button type="button" onClick={load} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </header>

      {demo && (
        <p className="banner">
          Showing sample data. Connect the Google Sheet (see README) to see real requests.
        </p>
      )}
      {error && <p className="banner error" role="alert">{error}</p>}

      <StatusSummary summary={summary} selected={selected} onSelect={setSelected} />

      <section className="drill" aria-live="polite">
        <div className="drill-header">
          <h2>
            {selected} requests ({visible.length})
          </h2>
          {!demo && (
            <label className="passcode">
              Approver passcode
              <input
                type="password"
                value={passcode}
                onChange={(e) => changePasscode(e.target.value)}
                autoComplete="off"
              />
            </label>
          )}
        </div>
        {notice && <p className="notice">{notice}</p>}
        <RequestTable requests={visible} busyId={busyId} onDecide={decide} />
      </section>

      <FlashButton />
    </main>
  )
}
