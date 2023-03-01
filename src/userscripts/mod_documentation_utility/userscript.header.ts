import { getNexusmodsUrl } from "../../site_shared.ts"
import { getAuthor, getLicense, getNamespace, isProduction } from "../userscripts_shared.ts"

export const name = `Mod Documentations Utility by ${getAuthor()}${isProduction ? "" : " Development Version"}`

export const version = `0.2.0.23.2.16`

export const description = `Help to save the mod documentations to local disk.    Simplify mod page, files tab, posts tab, forum tab, article page.    Show requirements, changelogs, file descriptions and spoilers, replace thumbnails to original, replace embedded YouTube videos to links, remove unnecessary contents.    After saving those pages by SingleFile, you can show/hide requirements, changelogs, spoilers, real file names downloaded, etc.`

export function getHeader() {
  return `// ==UserScript==
// @name        ${name}
// @namespace   ${getNamespace()}
// @match       ${getNexusmodsUrl()}/*/mods/*
// @match       ${getNexusmodsUrl()}/*/articles/*
// @run-at      document-idle
// @version     ${version}
// @license     ${getLicense()}
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_download
// @grant       unsafeWindow
// @icon        ${getNexusmodsUrl()}/favicon.ico
// @author      ${getAuthor()}
// @description ${description}
// ==/UserScript==
`
}
