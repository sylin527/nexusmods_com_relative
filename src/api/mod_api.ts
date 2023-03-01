import { getNexusmodsUrl } from "../site_shared.ts"

/**
 * 如:
 *
 * ```json
 * {
 *   "id": [
 *     24152,
 *     1704
 *   ],
 *   "uid": 7318624296536,
 *   "file_id": 24152,
 *   "name": "Cutting Room Floor Locations",
 *   "version": "1",
 *   "category_id": 6,
 *   "category_name": null,
 *   "is_primary": false,
 *   "size": 123,
 *   "file_name": "Landscape Fixes For Grass mods - Cutting Room Floor Locations-9005-1.7z",
 *   "uploaded_timestamp": 1492145479,
 *   "uploaded_time": "2017-04-14T04:51:19.000+00:00",
 *   "mod_version": "1",
 *   "external_virus_scan_url": "https://www.virustotal.com/file/ * e5384b1c7bf79565f652d63f532144322001130b16e186a3cd189546e759a80e/analysis/1492145762/",
 *   "description": "Frost River farm and Barleydark farm",
 *   "size_kb": 123,
 *   "size_in_bytes": 126004,
 *   "changelog_html": null,
 *   "content_preview_link": "https://file-metadata.nexusmods.com/file/nexus-files-s3-meta/1704/9005/Landscape Fixes  * For Grass mods - Cutting Room Floor Locations-9005-1.7z.json"
 * }
 * ```
 */
interface File {
  id: number[]
  uid: number
  file_id: number
  name: string
  version: string
  /**
   * 应该是, 为 1 表示 main file, 为 7 表示 archived file
   */
  category_id: number
  category_name: null | string
  is_primary: boolean
  size: number
  file_name: string
  uploaded_timestamp: number
  uploaded_time: string
  mod_version: string
  external_virus_scan_url: string
  description: string
  size_kb: number
  size_in_bytes: number
  changelog_html: null | string
  content_preview_link: string
}

/**
 * 如:
 *
 * ```json
 * {
 *   "old_file_id": 320765,
 *   "new_file_id": 320767,
 *   "old_file_name": "Landscape Fixes For Grass Mods-9005-5-1-1664635939.zip",
 *   "new_file_name": "Landscape Fixes For Grass Mods-9005-5-1-1664636452.zip",
 *   "uploaded_timestamp": 1664636453,
 *   "uploaded_time": "2022-10-01T15:00:53.000+00:00"
 * }
 * ```
 *
 * 对于 Archived File, 其 `<dt>` 的 `data-id` 属性, 对应的是 `old_file_id`,
 * 真实的 file name, 对应的是 `new_file_name`
 */
interface FileUpdate {
  old_file_id: number
  new_file_id: number
  old_file_name: string
  new_file_name: string
  uploaded_timestamp: number
  uploaded_time: string
}

interface GetFilesResponseJson {
  // 返回的 files 是空数组
  files: File[]
  file_updates: FileUpdate[]
}

/**
 * @param gameDomainName 如: `skyrimspecialedition`
 * @param modId
 * @param apikey
 * @returns
 */
export async function getFiles(gameDomainName: string, modId: number, apiKey: string) {
  const res = await fetch(`https://api.nexusmods.com/v1/games/${gameDomainName}/mods/${modId}/files.json`, {
    headers: {
      apikey: apiKey,
    },
  })
  return await (res.json() as Promise<GetFilesResponseJson>)
}

/**
 * @param gameDomainName 如: `skyrimspecialedition`
 * @param modId
 * @param apikey
 * @returns
 */
export async function getOldFiles(gameDomainName: string, modId: number, apiKey: string) {
  const res = await fetch(
    `https://api.nexusmods.com/v1/games/${gameDomainName}/mods/${modId}/files.json?category=old_version`,
    {
      headers: {
        apikey: apiKey,
      },
    },
  )
  return await (res.json() as Promise<GetFilesResponseJson>)
}

export function generateModUrl(gameDomainName: string, modId: number) {
  return `https://www.nexusmods.com/${gameDomainName}/mods/${modId}`
}

export function generateFileUrl(gameDomainName: string, modId: number, fileId: number) {
  return `${getNexusmodsUrl()}/${gameDomainName}/mods/${modId}?tab=files&file_id=${fileId}`
}

export function getWidgetsUrl() {
  return `${getNexusmodsUrl()}/Core/Libs/Common/Widgets`
}

export function generateImagesTabUrl(gameId: number, modId: number): string {
  // like https://www.nexusmods.com/Core/Libs/Common/Widgets/ModImagesTab?id=35082&game_id=1704
  return `${getWidgetsUrl()}/ModImagesTab?id=${modId}&game_id=${gameId}`
}

export function generateAuthorImagesUrl(gameId: number, modId: number): string {
  return `${getWidgetsUrl()}/ModImagesList?RH_ModImagesList1=game_id:${gameId},id:${modId}`
}

export function generateUserImagesUrl(gameId: number, modId: number): string {
  // like https://www.nexusmods.com/Core/Libs/Common/Widgets/ModImagesList?RH_ModImagesList2=game_id:1704,id:35082
  return `${getWidgetsUrl()}/ModImagesList?RH_ModImagesList2=game_id:${gameId},id:${modId}`
}

export function generateDescriptionTabUrl(gameId: number, modId: number): string {
  return `${getWidgetsUrl()}/ModDescriptionTab?id=${modId}&game_id=${gameId}`
}

export function generateFilesTabUrl(gameId: number, modId: number): string {
  return `${getWidgetsUrl()}/ModFilesTab?id=${modId}&game_id=${gameId}`
}

export function generateVideosTabUrl(gameId: number, modId: number): string {
  return `${getWidgetsUrl()}/ModVideosTab?id=${modId}&game_id=${gameId}`
}

export function generateDocsTabUrl(gameId: number, modId: number): string {
  return `${getWidgetsUrl()}/ModDocumentationTab?id=${modId}&game_id=${gameId}`
}
export function generateBugsTabUrl(gameId: number, modId: number): string {
  return `${getWidgetsUrl()}/ModBugsTab?id=${modId}&game_id=${gameId}`
}
export function generateLogsTabUrl(gameId: number, modId: number): string {
  return `${getWidgetsUrl()}/ModActionLogTab?id=${modId}&game_id=${gameId}`
}
export function generateStatsTabUrl(gameId: number, modId: number): string {
  // json: https://staticstats.nexusmods.com/mod_monthly_stats/1704/35082.json
  // json: https://www.nexusmods.com/Core/Libs/Common/Widgets/Graph?GetModReleases&game_id=1704&mod_id=35082&startdate=0&enddate=1615479414
  return `${getWidgetsUrl()}/ModStatsTab?id=${modId}&game_id=${gameId}`
}
