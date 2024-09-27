import { useRouter } from 'next/router'

import { useRequest } from '../hooks'

const Ticket = ({ title, price, id }) => {
  const router = useRouter()
  const { doRequest, errors } = useRequest({
    url: '/api/orders',
    method: 'post',
    body: { ticketId: id },
    onSuccess: order => router.push('/orders/[orderId]', `/orders/${order.id}`)
  })

  return (
    <div>
      <h1>{title}</h1>
      <h4>{price}</h4>
      {errors}
      <button className='btn btn-primary' onClick={() => doRequest()}>
        Purchase
      </button>
    </div>
  )
}

export default Ticket
