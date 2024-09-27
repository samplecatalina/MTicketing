import { useState, useEffect } from 'react'
const DELAY_MS = 15 * 60 * 1000

const Order = ({ expiresAt }) => {
  const [progress, setProgress] = useState(0)
  const [timeLeft, setTimeLeft] = useState('')
  const END = new Date(expiresAt)

  const findTimeLeft = () => {
    const now = new Date()
    let msLeft = END - now
    msLeft = Math.round(msLeft / 1000)
    setTimeLeft(msLeft)

    let progress = 100 * (1 - (END - now) / DELAY_MS)
    progress = Math.round(progress)
    setProgress(progress)
  }

  useEffect(() => {
    // Call find time to display time immediately
    // Otherwise would need to wait 1s
    findTimeLeft()
    const timerId = setInterval(findTimeLeft, 1000)

    /*
      clean timer
      only called when we navigate away from component
      to call it when rerendering too, need to put in array
      useEffect arg
    */
    return () => {
      clearInterval(timerId)
    }
  }, [])

  if (timeLeft < 0) return <div>Order Expired</div>

  return (
    <>
      <div>Time left to pay {timeLeft} seconds</div>
      <div className='progress' style={{ height: '20px' }}>
        <div
          className='progress-bar'
          role='progressbar'
          style={{ width: `${progress}%` }}
          aria-valuenow={timeLeft}
          aria-valuemin='0'
          aria-valuemax='100'></div>
      </div>
    </>
  )
}

export default Order
