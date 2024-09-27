import { TicketAsPage } from '../../components'

const TicketShow = ({ ticket }) => <TicketAsPage {...ticket} />

TicketShow.getInitialProps = async (context, axios) => {
  const { ticketId } = context.query
  const { data: ticket } = await axios(`/api/tickets/${ticketId}`)
  return { ticket }
}
export default TicketShow
