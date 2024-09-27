import { Publisher, Subjects, ExpirationCompleteEvent } from '../../../../common/src'

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete
}
