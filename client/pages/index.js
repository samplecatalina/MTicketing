import { TicketAsRow } from '../components'

const LandingPage = ({ tickets }) => {
  return (
    <>
      <h1>Landing page!!</h1>
      <table className='table'>
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket, index) => (
            <TicketAsRow {...ticket} key={index} />
          ))}
        </tbody>
      </table>
    </>
  )
}

LandingPage.getInitialProps = async (context, axios, currentUser) => {
  const { data } = await axios.get('/api/tickets')
  return { tickets: data, currentUser }
}

export default LandingPage
