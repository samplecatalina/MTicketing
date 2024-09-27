export enum Subjects {
  TicketCreated = 'ticket:created',
  TicketUpdated = 'ticket:updated',
  OrderCreated = 'order:created',
  OrderCancelled = 'order:cancelled',
  ExpirationComplete = 'expiration:complete',
  PaymentCreated = 'payment:created'
}

export enum OrderStatus {
  //order created but corresponding ticket has not been reserved
  Created = 'created',
  /*
    catch all
    anytime the ticket the order is trying to reserve has already
    been reserved,
    or when the user had cancelled the order,
    or the order has expired
  */
  Cancelled = 'cancelled',

  //order successfully reserve the corresonding ticket
  AwaitingPayment = 'awaiting:payment',

  //order has reserved the ticket and the user has paid
  Complete = 'complete'
}
