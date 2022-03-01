import { interval } from './interval.ts'
import { delay } from './util.ts'

type UrlResult = { oldUrl: string; newUrl: string } | null



/**
 * 每隔一段时间, 检查 url 是否变化
 *
 * @param duration {number}
 * @returns {UrlResult}
 */
export async function resolveUrlChange(ms: number): Promise<UrlResult> {
  const location = window.location
  const startTime = new Date().getTime()
  const oldUrl = location.href
  await delay(ms - new Date().getTime() + startTime)
  const newUrl = location.href
  return oldUrl !== newUrl ? { oldUrl, newUrl } : null
}

export function whenUrlChange(
  handler: (result: UrlResult) => void,
  ms: number
) {
  return interval(async () => {
    handler(await resolveUrlChange(ms))
  }, ms)
}

type HashResult = { oldHash: string; newHash: string } | null

/**
 * 每隔一段时间, 检查 hash 是否变化
 * Firefox v94 原生不支持 window.onhashchange, 网上一些 Polyfill 都是定时监听 hash 变化
 * @param duration {number}
 * @returns {HashResult}
 */
export async function resolveHashChange(ms: number): Promise<HashResult> {
  const location = window.location
  const startTime = new Date().getTime()
  const oldHash = location.hash
  await delay(ms - new Date().getTime() + startTime)
  const newHash = location.hash
  return newHash !== oldHash ? { oldHash, newHash } : null
}

export function whenHashChange(
  handler: (result: HashResult) => void,
  ms: number
) {
  return interval(async () => {
    handler(await resolveHashChange(ms))
  }, ms)
}