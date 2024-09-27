import { useState } from 'react'
import { useRouter } from 'next/router'

import { useRequest } from '../hooks'

const TicketForm = () => {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const { doRequest, errors } = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: { title, price },
    onSuccess: () => router.push('/')
  })

  const onBlur = () => {
    // round to 2 decimmals
    const value = parseFloat(price)
    if (isNaN(value)) return
    setPrice(value.toFixed(2))
  }

  const onSubmit = e => {
    e.preventDefault()
    doRequest()
  }

  return (
    <div>
      <h1>Create a ticket</h1>
      <form onSubmit={onSubmit}>
        <div className='form-group'>
          <label>Title</label>
          <input
            className='form-control'
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <div className='form-group'>
          <label>Price</label>
          <input
            type='number'
            step='0.01'
            onBlur={onBlur}
            className='form-control'
            value={price}
            onChange={e => setPrice(e.target.value)}
          />
        </div>
        {errors}
        <button className='btn btn-primary'>Submit</button>
      </form>
    </div>
  )
}

export default TicketForm
