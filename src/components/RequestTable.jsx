import { normalizeStatus } from '../lib/status.js'

export default function RequestTable({ requests, busyId, onDecide }) {
  if (requests.length === 0) return <p className="muted">No requests with this status.</p>

  return (
    <div className="table-wrap">
      <table className="requests">
        <thead>
          <tr>
            <th scope="col">Team</th>
            <th scope="col">Requester</th>
            <th scope="col">Destination</th>
            <th scope="col">Dates</th>
            <th scope="col">Reason</th>
            <th scope="col">Est. cost</th>
            <th scope="col">Comments</th>
            <th scope="col">Approver</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => {
            const pending = normalizeStatus(r.status) === 'Pending'
            const busy = busyId === r.id
            return (
              <tr key={r.id}>
                <td>{r.tab}</td>
                <td>{r.requester}</td>
                <td>{r.destination}</td>
                <td>{[r.startDate, r.endDate].filter(Boolean).join(' – ')}</td>
                <td className="wide">{r.reason}</td>
                <td>{r.estCost}</td>
                <td className="wide">{r.comments}</td>
                <td>{r.approver}</td>
                <td>
                  {pending ? (
                    <span className="actions">
                      <button
                        type="button"
                        className="approve"
                        disabled={busy}
                        onClick={() => onDecide(r, 'Approved')}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="reject"
                        disabled={busy}
                        onClick={() => onDecide(r, 'Rejected')}
                      >
                        Reject
                      </button>
                    </span>
                  ) : (
                    normalizeStatus(r.status)
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
