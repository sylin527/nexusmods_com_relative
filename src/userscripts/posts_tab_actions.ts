import { clickModTabs, getCurrentTab, setTabsContainerAsTopElement } from "./tabs_shared.ts";
import { getActionContainer, hideSylin527Ui } from "./ui.ts";
import { isPostsTab, simplify } from "./posts_tab.ts";

let oldTab = "";

const createEntryElement = function (): HTMLButtonElement {
  const button = document.createElement("button");
  button.setAttribute("id", "simplifyPostsTab");
  button.innerText = "Simplify Posts Tab";
  return button;
};

function checkTab(entryElement: HTMLElement) {
  const style = entryElement.style;
  function checkTabInner(currentTab: string) {
    if (isPostsTab(currentTab)) {
      style.display = "block";
    } else {
      style.display = "none";
    }
  }
  oldTab = getCurrentTab();
  checkTabInner(oldTab);
  clickModTabs((newTab) => {
    if (oldTab !== newTab) {
      oldTab = newTab;
      checkTabInner(newTab);
    }
  });
}

export const simplifyPostsTab = function () {
  const uiRoot = getActionContainer();
  const entryElem = createEntryElement();
  uiRoot.appendChild(entryElem);
  entryElem.addEventListener("click", () => {
    simplify();
    hideSylin527Ui();
    setTabsContainerAsTopElement();
  });
  checkTab(entryElem);
};
