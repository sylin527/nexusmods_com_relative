export const average = function (exec: (...params: any[]) => unknown, times: number): number {
  const start = Date.now()
  for (let i = 0; i < times; i++) {
    exec()
  }
  return (Date.now() - start) / times
}
export const spend = function (exec: (...params: any[]) => unknown): number {
  const start = Date.now()
  exec()
  return Date.now() - start
}
