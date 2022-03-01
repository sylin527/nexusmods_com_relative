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

export const WIDGETS_PATH = '/Core/Libs/Common/Widgets/'

export const WIDGETS_BASE_URL = MainSite.SITE_URL + WIDGETS_PATH

export const getAuthorImagesUrl = function (
  gameId: number,
  modId: number
): string {
  return `${WIDGETS_BASE_URL}/ModImagesList?RH_ModImagesList1=game_id:${gameId},id:${modId}`
}

export const getUserImagesUrl = function (
  gameId: number,
  modId: number
): string {
  // like https://www.nexusmods.com/Core/Libs/Common/Widgets/ModImagesList?RH_ModImagesList2=game_id:1704,id:35082
  return `${WIDGETS_BASE_URL}/ModImagesList?RH_ModImagesList2=game_id:${gameId},id:${modId}`
}

export const getDescriptionTabUrl = function (
  gameId: number,
  modId: number
): string {
  return `${WIDGETS_BASE_URL}/ModDescriptionTab?id=${modId}&game_id=${gameId}`
}

export const getFilesTabUrl = function (gameId: number, modId: number): string {
  return `${WIDGETS_BASE_URL}/ModFilesTab?id=${modId}&game_id=${gameId}`
}

export const getImagesTabUrl = function (
  gameId: number,
  modId: number
): string {
  // like https://www.nexusmods.com/Core/Libs/Common/Widgets/ModImagesTab?id=35082&game_id=1704
  return `${WIDGETS_BASE_URL}/ModImagesTab?id=${modId}&game_id=${gameId}`
}

export const getVideosTabUrl = function (
  gameId: number,
  modId: number
): string {
  return `${WIDGETS_BASE_URL}/ModVideosTab?id=${modId}&game_id=${gameId}`
}

export const getDocsTabUrl = function (gameId: number, modId: number): string {
  return `${WIDGETS_BASE_URL}/ModDocumentationTab?id=${modId}&game_id=${gameId}`
}
export const getBugsTabUrl = function (gameId: number, modId: number): string {
  return `${WIDGETS_BASE_URL}/ModBugsTab?id=${modId}&game_id=${gameId}`
}
export const getLogsTabUrl = function (gameId: number, modId: number): string {
  return `${WIDGETS_BASE_URL}/ModActionLogTab?id=${modId}&game_id=${gameId}`
}
export const getStatsTabUrl = function (gameId: number, modId: number): string {
  /*

     json:   https://staticstats.nexusmods.com/mod_monthly_stats/1704/35082.json
     json:   https://www.nexusmods.com/Core/Libs/Common/Widgets/Graph?GetModReleases&game_id=1704&mod_id=35082&startdate=0&enddate=1615479414

        */
  return `${WIDGETS_BASE_URL}/ModStatsTab?id=${modId}&game_id=${gameId}`
}

// TODO
export const getPostsTabUrl = function (gameId: number, modId: number): string {
  return `${WIDGETS_BASE_URL}/CommentContainer?id=tabbed=1&object_id=${modId}&game_id=${gameId}&object_type=1&thread_id=8629923&skip_opening_post=1`
}
