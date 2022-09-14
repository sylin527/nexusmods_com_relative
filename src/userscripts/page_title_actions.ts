import {
  getBriefOverview,
  getTemplateDescriptionContainer,
  isDescriptionTab,
} from "./description_tab.ts";
import {
  clickModTabs,
  getCurrentTab,
  getModName,
  getModVersion,
  getTabContentContainer,
} from "./tabs_shared.ts";

// title element cache
const title = document.head.querySelector("title") as HTMLTitleElement;
// modName cache
const modName = getModName();
// modVersion cache
const modVersion = getModVersion();
let briefOverview: string | null = null;
let oldTab = getCurrentTab();

async function tweakTitleInner(currentTab: string) {
  if (isDescriptionTab(currentTab)) {
    if (!briefOverview) {
      const tcc = getTabContentContainer();
      const tdc = await getTemplateDescriptionContainer(tcc);
      briefOverview = getBriefOverview(tdc).trim();
    }
    // Firefox 保存书签时, 若书签名包含换行, 直接省略换行符.
    // 这样处理不友好, 这边换为空格
    briefOverview.replaceAll(/\r\n|\n/g, " ");
    title.innerText = `${modName} ${modVersion}: ${briefOverview}`;
  } else {
    title.innerText = `${modName} ${modVersion} tab=${currentTab}`;
  }
}

export const tweakTitle = function () {
  tweakTitleInner(oldTab);
  clickModTabs((newTab) => {
    if (oldTab !== newTab) {
      oldTab = newTab;
      tweakTitleInner(newTab);
    }
  });
};

// const main = function () {
//   tweakTitle();
//   const scriptInfo =
//     "Load userscript: [sylin527] nexusmods.com Tweak page title";
//   console.log("%c [Info] " + scriptInfo, "color: green");
// };

// main();
