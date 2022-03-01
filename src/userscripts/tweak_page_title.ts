/// <reference lib="dom" />

import { getBriefOverview, hasDescriptionTab } from '../mod_page/description_tab.ts'
import {
  getModName,
  getModVersion,
  whenClickModTabs,
} from '../mod_page/tabs_shared_content.ts'
import { delay } from '../util.ts'

const title = document.querySelector('title')
const modName = getModName()
const modVersion = getModVersion()
let briefOverview: string
let oldUrl = window.location.href

/**
 * 仅包含 description tab 的页面才能获取 simple description.
 */
const tweakTitle = function () {
  innerTweakTitle(oldUrl)
  whenClickModTabs(async () => {
    // 等待 nexusmods.com 改变 window.location.href
    await delay(300)
    const newUrl = window.location.href
    if (oldUrl !== newUrl) {
      innerTweakTitle(newUrl)
    }
    oldUrl = newUrl
  })
}

function innerTweakTitle(url: string) {
  if (hasDescriptionTab(url)) {
    if (!briefOverview) {
      getBriefOverview().then((value) => {
        briefOverview = value
        title!.innerText = `${modName} ${modVersion}: ${briefOverview}`
      })
    } else {
      title!.innerText = `${modName} ${modVersion}: ${briefOverview}`
    }
  } else {
    /*
      匹配 'any_string/mods/64238?tab=files', 'any_string/mods/64238?tab=posts'
      但不匹配 'any_string/mods/64238?tab=description'  
        
      [lyne408] 
      此处还需要匹配 `tab=` 后的 非 description, 所以需要 `[a-zA-z]{1,20}`
    */
    const tabReg = new RegExp(/(tab=(?!description)[a-zA-z]{1,20})$/, 'ig')
    const found = window.location.href.match(tabReg)
    if (found)
      /* Value format if `found[0]`: tab=files, tab=posts, etc. */
      title!.innerText = `${modName} ${modVersion} ${found[0]}`
  }
}

const main = function () {
  tweakTitle()
  const scriptInfo =
    'Load userscript: [sylin527] nexusmods.com Tweak page title'
  console.log('%c [Info] ' + scriptInfo, 'color: green')
}

main()
