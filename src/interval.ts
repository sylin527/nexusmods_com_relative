/**
 * Creadit: https://github.com/aweiu/setPromiseInterval/blob/master/src/set-promise-interval.ts
 * 参考其代码, 根据 Observable 编程思想更改 API
 */

import { delay } from './util.ts'

let id = 0
const runningTasks = new Set<number>()
/* 用于存储每次执行的结果, 执行一次, 就重写一次结果 */
const runningHandlers = new Map<number, unknown>()

async function run(id: number, ...[handler, ms]: Parameters<typeof interval>) {
  while (runningTasks.has(id)) {
    const startTime = Date.now()
    runningHandlers.set(id, handler())
    await delay(ms - Date.now() + startTime)
  }
}
/* OOP 编程, 备用
class Interval {
  id: number
  Interval(handler: () => void, ms: number) {
  }

  async clear() {
  }
*/

// 函数式编程
export function interval(handler: (...args: unknown[]) => unknown, ms: number) {
  id += 1
  runningTasks.add(id)
  run(id, handler, ms)
  // 虽然可以直接返回这个函数, 不过 API 不友好
  return {
    async clear() {
      if (runningTasks.has(id)) {
        runningTasks.delete(id)
        await runningHandlers.get(id)
        runningHandlers.delete(id)
      }
    },
  }
}

// 是 async generator 写的, 留着备用
// export async function* interval_Test(handler: () => Promise<unknown>, ms: number) {
//   while (true) {
//     await delay(ms)
//     yield handler()
//   }
// }
