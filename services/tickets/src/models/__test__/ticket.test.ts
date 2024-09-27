import { Ticket } from '../ticket'

it('implements optimistic concurency control', async done => {
  // Create instance of ticket and save to DB
  const ticket = Ticket.build({ title: 'test', price: 1, userId: '1234' })
  await ticket.save()

  // Fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id)
  const secondInstance = await Ticket.findById(ticket.id)

  // Make 2 separate changes
  firstInstance!.set({ price: 10 })
  secondInstance!.set({ price: 15 })

  // Save 1st ticket: success
  await firstInstance!.save()

  // Save 2nd: fail

  // expect(async () => {
  //   await secondInstance!.save()
  // }).toThrow()

  try {
    await secondInstance!.save()
  } catch (err) {
    return done()
  }
  throw new Error('Should not reach this point')
})

it('increments the version number on multiple saves', async () => {
  const ticket = Ticket.build({ title: 'test', price: 1, userId: '1234' })
  await ticket.save()
  expect(ticket.version).toEqual(0)

  await ticket.save()
  expect(ticket.version).toEqual(1)

  await ticket.save()
  expect(ticket.version).toEqual(2)
})
