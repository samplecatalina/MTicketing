const ShowOrders = ({ orders }) => {
  return (
    <ul>
      {orders.map(({ id, ticket, status }) => (
        <li key={id}>
          {ticket.title} - {status}
        </li>
      ))}
    </ul>
  )
}

ShowOrders.getInitialProps = async (context, axios) => {
  const { data: orders } = await axios.get('/api/orders')
  return { orders }
}

export default ShowOrders
