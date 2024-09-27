import { useState } from 'react'
import { useRouter } from 'next/router'
import { useRequest } from '../hooks'

const signForm = ({ url, action }) => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { errors, doRequest } = useRequest({
    url,
    method: 'post',
    body: { email, password },
    onSuccess: () => router.push('/')
  })
  const onSubmit = async event => {
    event.preventDefault()
    doRequest()
  }

  return (
    <form onSubmit={onSubmit}>
      <h1>{action}</h1>
      <div className='form-group'>
        <label>Email Address</label>
        <input
          type='text'
          className='form-control'
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>
      <div className='form-group'>
        <label>Password</label>
        <input
          type='password'
          className='form-control'
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>
      {errors}
      <button className='btn btn-primary'>{action}</button>
    </form>
  )
}

export default signForm
