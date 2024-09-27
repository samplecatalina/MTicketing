import { Ticket, TicketAttrs } from '../models'
import { fakeId } from '../lib'

export default async (
  attrs: TicketAttrs = { title: 'concert', price: 20, id: fakeId() }
) => {
  const ticket = Ticket.build(attrs)
  await ticket.save()
  return ticket
}
