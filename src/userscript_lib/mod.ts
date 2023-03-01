/// <reference types="./tampermonkey.d.ts" />

export function setValue(name: string, value: unknown) {
  return GM_setValue(name, value)
}

export function getValue<TValue>(name: string): TValue | undefined {
  return GM_getValue<TValue>(name) as TValue | undefined
}

export interface DownloadItem {
  url: string
  name: string
}

export async function downloadFiles(
  items: DownloadItem[],
  simultaneous: number,
  eachSuccess?: (item: DownloadItem) => unknown,
  eachFail?: (item: DownloadItem) => unknown,
): Promise<{
  successes: DownloadItem[]
  fails: DownloadItem[]
}> {
  const successes: DownloadItem[] = []
  const fails: DownloadItem[] = []
  for (let i = 0; i < items.length; i = i + simultaneous) {
    await Promise.all(
      items.slice(i, i + simultaneous).map((file) => {
        const { url, name } = file
        return new Promise((resolve) => {
          GM_download({
            url,
            name,
            saveAs: false,
            onload() {
              successes.push(file)
              eachSuccess && eachSuccess(file)
              resolve(0)
            },
            onerror() {
              fails.push(file)
              eachFail && eachFail(file)
              resolve(-1)
            },
          })
        })
      }),
    )
  }
  return {
    successes,
    fails,
  }
}
