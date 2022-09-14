/**
 * 两种方案:
 *  1. 生成 markdown 文件. 描述不仅仅是纯文本, 较为复杂. 不推荐
 *  2. 原 tab=files 网页去掉不需要的内容. 推荐
 *
 * 暂时采用第二种.
 */

import {
  getModFilesElement,
  isFilesTab,
  removeAllSortBys,
  removePremiumBanner,
  simplifyFileDds,
  simplifyFileDts,
} from "./files_tab.ts";
import {
  clickModTabs,
  getCurrentTab,
  setTabsContainerAsTopElement,
} from "./tabs_shared.ts";
import { getUiRootElement, hideSylin527Ui } from "./ui.ts";

const createEntryElement = function (): HTMLButtonElement {
  const button = document.createElement("button");
  button.setAttribute("id", "simplifyFilesTab");
  button.innerText = "Simplify Files Tab";
  return button;
};
let oldTab = getCurrentTab();
function checkTab(entryElement: HTMLElement) {
  const style = entryElement.style;
  function checkTabInner(currentTab: string) {
    if (isFilesTab(currentTab)) {
      style.display = "block";
    } else {
      style.display = "none";
    }
  }
  checkTabInner(oldTab);

  clickModTabs((newTab) => {
    if (oldTab !== newTab) {
      oldTab = newTab;
      checkTabInner(newTab);
    }
  });
}

export const simplifyFilesTab = function () {
  const uiRoot = getUiRootElement();
  const entryElem = createEntryElement();
  uiRoot.appendChild(entryElem);
  entryElem.addEventListener("click", () => {
    removePremiumBanner();
    const modFilesElement = getModFilesElement();
    removeAllSortBys(modFilesElement);
    simplifyFileDts(modFilesElement);
    simplifyFileDds(modFilesElement);
    setTabsContainerAsTopElement();
    hideSylin527Ui();
  });
  checkTab(entryElem);
};
