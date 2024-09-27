import StripeCheckout from 'react-stripe-checkout'
import { useRouter } from 'next/router'

import { Order } from '../../components'
import { useRequest } from '../../hooks'

const OrderShow = ({ order, currentUser, stripeKey }) => {
  const router = useRouter()
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: { orderId: order.id },
    onSuccess: () => router.push('/orders')
  })
  return (
    <>
      <Order {...order} />
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey={stripeKey}
        amount={order.ticket.price * 100} // cents
        email={currentUser.email}
      />
      {errors}
    </>
  )
}

OrderShow.getInitialProps = async (context, axios) => {
  const { orderId } = context.query
  const { data: order } = await axios.get(`/api/orders/${orderId}`)
  return { order, stripeKey: process.env.STRIPE_PUB_KEY }
}
export default OrderShow
