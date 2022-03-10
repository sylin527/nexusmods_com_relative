/**
 * 两种方案:
 *  1. 生成 markdown 文件
 *  2. 原 tab=files 网页去掉不需要的内容.
 *
 * 暂时采用第二种.
 */
/// <reference lib="dom" />

import {
  isFilesTab,
  removeAllSortBys,
  removePremiumBanner,
  setFilesTabAsTopElement,
  simplifyFileDds,
  simplifyFileDts,
} from '../mod_page/files_tab.ts'
import { whenClickModTabs } from '../mod_page/tabs_shared_content.ts'
import { createUIRootElement, removeSylin527Ui } from './ui.ts'
import { delay } from '../util.ts'

const uiRootElem = createUIRootElement()

const createEntryElement = function (
  uiRootElement: HTMLDivElement
): HTMLButtonElement {
  const button = document.createElement('button')
  button.setAttribute('id', 'simplifyFilesTab')
  button.innerText = 'Simplify Files Tab'
  uiRootElement.appendChild(button)
  return button
}



const entryElem = createEntryElement(uiRootElem)

let oldUrl = window.location.href

const checkUrl = function () {
  const style = entryElem.style
  // 貌似文件信息都是后来获取的, 延迟下
  //await delay(500)
  function checkTab(url: string) {
    if (isFilesTab(url)) {
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

const simplifyFilesTab = function () {
  entryElem.addEventListener('click', () => {
    removePremiumBanner()
    removeAllSortBys()
    simplifyFileDts()
    simplifyFileDds()
    setFilesTabAsTopElement()
    removeSylin527Ui()
  })
  checkUrl()
}

function main() {
  simplifyFilesTab()
  const scriptInfo =
    'Load userscript: [sylin527] nexusmods.com Simplify files tab'
  console.log('%c [Info] ' + scriptInfo, 'color: green')
}

main()
