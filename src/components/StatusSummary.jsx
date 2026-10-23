export default function StatusSummary({ summary, selected, onSelect }) {
  const total = summary.reduce((sum, s) => sum + s.count, 0)

  return (
    <table className="summary">
      <caption>Requests by status</caption>
      <thead>
        <tr>
          <th scope="col">Status</th>
          <th scope="col" className="num">Requests</th>
        </tr>
      </thead>
      <tbody>
        {summary.map(({ status, count }) => (
          <tr key={status} className={status === selected ? 'selected' : ''}>
            <th scope="row">
              <button
                type="button"
                className="link"
                aria-pressed={status === selected}
                onClick={() => onSelect(status)}
              >
                {status}
              </button>
            </th>
            <td className="num">{count}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row">Total</th>
          <td className="num">{total}</td>
        </tr>
      </tfoot>
    </table>
  )
}
