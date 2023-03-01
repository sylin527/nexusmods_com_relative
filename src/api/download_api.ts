/**
 *
 * @param gameId
 * @param fileId
 * @returns
 *
 * POST 可, GET 不行
 *
 * {"url":"https:\/\/cf-files.nexusmods.com\/cdn\/1704\/61479\/Mu Joint Fix-61479-2-0-13-1674354374.7z?md5=Xl_S9ADXQ-r7UcSfVFWYzw&expires=1674431420&user_id=111862668&rip=154.23.127.234"}
 *
 * `expires=1674431420`, 其中的时间是 second, 不是 ms, 过期时间大概是 4 个小时
 */
export async function generateDownloadUrl(gameId: number, fileId: number): Promise<string> {
  const res = await fetch("/Core/Libs/Common/Managers/Downloads?GenerateDownloadUrl", {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
    },
    body: `game_id=${gameId}&fid=${fileId}`,
    method: "POST"
  })

  const resJson = (await res.json()) as { url: string }

  return resJson.url
}

