export const msFromNowUntil = (end: string) =>
  new Date(end).getTime() - new Date().getTime()
