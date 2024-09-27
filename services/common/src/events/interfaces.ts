import { Subjects, OrderStatus } from './types'

export interface Event {
  subject: Subjects
  data: any
}

export interface TicketCreatedEvent {
  subject: Subjects.TicketCreated
  data: {
    id: string
    title: string
    price: number
    userId: string
    version: number
  }
}

export interface TicketUpdatedEvent {
  subject: Subjects.TicketUpdated
  data: {
    id: string
    title: string
    price: number
    userId: string
    version: number
    orderId?: string
  }
}

export interface OrderCreatedEvent {
  subject: Subjects.OrderCreated
  data: {
    id: string
    version: number
    status: OrderStatus
    userId: string
    expiresAt: string //will be used as JSON
    ticket: { id: string; price: number }
  }
}

export interface OrderCancelledEvent {
  subject: Subjects.OrderCancelled
  data: {
    id: string
    version: number
    ticket: { id: string }
  }
}

export interface ExpirationCompleteEvent {
  subject: Subjects.ExpirationComplete
  data: { orderId: string }
}

export interface PaymentCreatedEvent {
  subject: Subjects.PaymentCreated
  data: {
    id: string
    stripeId: string
    orderId: string
  }
}
