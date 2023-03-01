import { getNexusmodsUrl } from "../../site_shared.ts"
import { getAuthor, getLicense, getNamespace, isProduction } from "../userscripts_shared.ts"

export const name = `Download No Wait by ${getAuthor()}${isProduction ? "" : " Development Version"}`

export const version = `0.2.0.23.2.17`

export const description = `Download No Wait. No memory leak, performance. When you open mod files page or click files tab, it will add buttons, texted "Download No Wait", below file description. Also works on archived files.`

export function getHeader() {
  return `// ==UserScript==
// @name        ${name}
// @namespace   ${getNamespace()}
// @match       ${getNexusmodsUrl()}/*/mods*?tab=files&file_id=*
// @match       ${getNexusmodsUrl()}/*/mods*?tab=files
// @match       ${getNexusmodsUrl()}/*/mods*
// @run-at      document-idle
// @version     ${version}
// @license     ${getLicense()}
// @grant       unsafeWindow
// @grant       GM_getValue
// @grant       GM_setValue
// @icon        ${getNexusmodsUrl()}/favicon.ico
// @author      ${getAuthor()}
// @description ${description}
// ==/UserScript==
`
}

