/// <reference lib="dom" />

import {
  getModName,
  getModVersion,
  isModPage,
  removeFeature,
  removeModActions,
  removeModGallery,
  setModInfoContainerAsTopElement,
  whenClickModTabs,
} from '../mod_page/tabs_shared_content.ts'

import {
  simplifyTabDescription,
  showSpoilers,
  replaceYoutubeVideosToUrls,
} from '../mod_page/description_tab.ts'

import { createUIRootElement, removeSylin527Ui } from './ui.ts'
import { delay } from '../util.ts'

function tweakTitleText() {
  const title = document.querySelector('title')
  title!.innerText = `${getModName()} ${getModVersion()}`
}

const uiRootElem = createUIRootElement()

const createEntryElement = function (
  uiRootElement: HTMLDivElement
): HTMLButtonElement {
  const entryElemId = 'simplifyModPage'
  const button = document.createElement('button')
  button.setAttribute('id', entryElemId)
  button.innerText = 'Simplify Mod Page'
  uiRootElement.appendChild(button)
  return button
}

const entryElem = createEntryElement(uiRootElem)

/*
  [lyne408]
  new RegExp(/Deno/, 'ig').test('Deno') // true
  new RegExp(/Deno/, 'ig').test('Deno, other strings') // true
  需要完整匹配, 不允许多余的文字, 则限制 beginning 和 end.
  new RegExp(/Deno$/, 'ig').test('Deno, other strings') // false
*/

/*
  User Script 的 include 指令实在太弱了.
  自行检查 url
*/

let oldUrl = window.location.href

const checkUrl = function () {
  // await delay(500)
  const style = entryElem.style
  function checkTab(url: string) {
    if (isModPage(url)) {
      style.display = 'block'
    } else {
      style.display = 'none'
    }
  }
  checkTab(oldUrl)
  whenClickModTabs(async () => {
    // 等待 nexusmods.com 改变 window.location.href
    await delay(500)
    const newUrl = window.location.href
    if (oldUrl !== newUrl) {
      checkTab(newUrl)
    }
    oldUrl = newUrl
  })
}

const simplifyModPage = function () {
  entryElem.addEventListener('click', () => {
    tweakTitleText()
    removeFeature()
    removeModActions()
    removeModGallery()
    simplifyTabDescription()
    showSpoilers()
    replaceYoutubeVideosToUrls()
    setModInfoContainerAsTopElement()
    removeSylin527Ui()
  })
  checkUrl()
}

function main() {
  simplifyModPage()
  const scriptInfo =
    'Load userscript: [sylin527] nexusmods.com Simplify mod pages'
  console.log('%c [Info] ' + scriptInfo, 'color: green')
}

main()
