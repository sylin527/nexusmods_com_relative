import { MainSite } from './sites.ts'

/**
 * 暂未使用, 备用
 */
export interface IMod {
  name: string
  gameName: string
  version: string
  gallery: null
  authorImages: null
  userImages: null
}

export const widgetsPath = '/Core/Libs/Common/Widgets/'

export const widgetsBaseUrl = MainSite.siteUrl + widgetsPath

export const getAuthorImagesUrl = function (
  gameId: number,
  modId: number
): string {
  return `${widgetsBaseUrl}/ModImagesList?RH_ModImagesList1=game_id:${gameId},id:${modId}`
}

export const getUserImagesUrl = function (
  gameId: number,
  modId: number
): string {
  // like https://www.nexusmods.com/Core/Libs/Common/Widgets/ModImagesList?RH_ModImagesList2=game_id:1704,id:35082
  return `${widgetsBaseUrl}/ModImagesList?RH_ModImagesList2=game_id:${gameId},id:${modId}`
}

export const getDescriptionTabUrl = function (
  gameId: number,
  modId: number
): string {
  return `${widgetsBaseUrl}/ModDescriptionTab?id=${modId}&game_id=${gameId}`
}

export const getFilesTabUrl = function (gameId: number, modId: number): string {
  return `${widgetsBaseUrl}/ModFilesTab?id=${modId}&game_id=${gameId}`
}

export const getImagesTabUrl = function (
  gameId: number,
  modId: number
): string {
  // like https://www.nexusmods.com/Core/Libs/Common/Widgets/ModImagesTab?id=35082&game_id=1704
  return `${widgetsBaseUrl}/ModImagesTab?id=${modId}&game_id=${gameId}`
}

export const getVideosTabUrl = function (
  gameId: number,
  modId: number
): string {
  return `${widgetsBaseUrl}/ModVideosTab?id=${modId}&game_id=${gameId}`
}

export const getDocsTabUrl = function (gameId: number, modId: number): string {
  return `${widgetsBaseUrl}/ModDocumentationTab?id=${modId}&game_id=${gameId}`
}
export const getBugsTabUrl = function (gameId: number, modId: number): string {
  return `${widgetsBaseUrl}/ModBugsTab?id=${modId}&game_id=${gameId}`
}
export const getLogsTabUrl = function (gameId: number, modId: number): string {
  return `${widgetsBaseUrl}/ModActionLogTab?id=${modId}&game_id=${gameId}`
}
export const getStatsTabUrl = function (gameId: number, modId: number): string {
  /*

     json:   https://staticstats.nexusmods.com/mod_monthly_stats/1704/35082.json
     json:   https://www.nexusmods.com/Core/Libs/Common/Widgets/Graph?GetModReleases&game_id=1704&mod_id=35082&startdate=0&enddate=1615479414

        */
  return `${widgetsBaseUrl}/ModStatsTab?id=${modId}&game_id=${gameId}`
}

// TODO
export const getPostsTabUrl = function (gameId: number, modId: number): string {
  return `${widgetsBaseUrl}/CommentContainer?id=tabbed=1&object_id=${modId}&game_id=${gameId}&object_type=1&thread_id=8629923&skip_opening_post=1`
}
