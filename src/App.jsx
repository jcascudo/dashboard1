import { useEffect, useRef, useState } from 'react'

const FLASH_MS = 400

export default function App() {
  const [flashing, setFlashing] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  function handleClick() {
    clearTimeout(timer.current)
    setFlashing(true)
    timer.current = setTimeout(() => setFlashing(false), FLASH_MS)
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <button
        className={flashing ? 'flash-button flashing' : 'flash-button'}
        onClick={handleClick}
      >
        Press me
      </button>
    </main>
  )
}
