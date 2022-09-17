import {
  clickModTabs,
  getCurrentTab,
  getModName,
  getModVersionWithDate,
  getTabContentContainer,
  simplifyModInfo,
} from "./tabs_shared.ts";

import {
  replaceThumbnailUrlsToImageUrls,
  replaceYoutubeVideosToAnchor,
  setSectionAsTopElement,
  showSpoilers,
} from "./shared.ts";

import {
  aboutThisModRelativeSelector,
  accordionRelativeSelector,
  downloadedOrNotRelativeSelector,
  getAuthorDefinedDescriptionContainer,
  getBriefOverview,
  getTemplateDescriptionContainer,
  isDescriptionTab,
  removeModsRequiringThis,
  reportAbuseRelativeSelector,
  shareButtonRelativeSelector,
  showAllAccordionDds,
} from "./description_tab.ts";

import { getActionContainer, hideSylin527Ui } from "./ui.ts";

/**
 * <div id="sylin527CopyRoot">
 *  <button>Copy</button>
 *  <span>Copied mod name and version.</span>
 * </div>
 */
const createCopyContainer = function (): HTMLDivElement {
  const containerId = "sylin527CopyContainer";
  const rootDiv = document.createElement("div");
  rootDiv.setAttribute("id", containerId);
  const button = document.createElement("button");
  button.innerText = "Copy";
  const message = document.createElement("span");
  message.innerText = "Copied mod name and version";
  rootDiv.append(button, message);
  const pagetitle = document.getElementById("pagetitle");
  // 表示 mod name 的 <h1> 的后一个兄弟元素
  const nameNextElem = pagetitle!.querySelector("ul.stats");
  pagetitle!.insertBefore(rootDiv, nameNextElem);

  const h1 = pagetitle!.querySelector<HTMLElement>("h1:nth-of-type(1)") as HTMLHeadingElement;
  // 先把本组件根元素添加进 #pagetitle, 之后再修改这个 <h1> 为 inline-block 以获取 <h1> 的内容宽度
  h1.style.display = "inline-block";
  const marginLeft = h1.clientWidth! + 16 + "px";
  // 控制台键入: document.querySelector('#pagetitle > h1:nth-child(2)').clientWidth
  // 不回车, 让其实时执行
  // 刷新页面, 发现刚载入时有个 clientWidth, 设为 clientWidth1, window load event 后设为 clientWidth2,
  // 两个值不一样了, clientWidth1 比 clientWidth2 大
  self.addEventListener("load", () => {
    rootDiv.style.marginLeft = h1.clientWidth + 16 + "px";
  });

  // 避免 rootDiv.remove() 之后, h1 错位
  pagetitle!.insertBefore(document.createElement("div"), rootDiv);

  const newStyle = document.createElement("style");
  document.head.appendChild(newStyle);
  const sheet = newStyle.sheet!;
  let ruleIndex = sheet.insertRule(
    `
    #${containerId} {
      margin-left: ${marginLeft};
      font-family: 'Roboto',sans-serif;
      font-size: 14px;
      line-height: 1.15;
      position: absolute;
      margin-top: -51px;
    }
    `
  );
  sheet.insertRule(
    `
    #${containerId} > button {
      background-color: #337ab7;
      border: none;
      border-radius: 3px;
      padding: 0 1.2rem;
      line-height: 34px;
      vertical-align: middle;
      font-weight: 400;
      border-color: #2e6da4;
    }
    `,
    ++ruleIndex
  );
  sheet.insertRule(
    `
    #${containerId} > span {
      background-color: rgba(51, 51, 51, 0.5);
      color: hotpink;
      padding: 8px;
      border-radius: 5px;
      margin-left: 1rem;
      display: none;
    }
    `,
    ++ruleIndex
  );
  return rootDiv;
};

// title element cache
const title = document.head.querySelector("title") as HTMLTitleElement;

// briefOverview cache
let briefOverview: string | null = null;

/*
  [lyne408]
  new RegExp(/Deno/, 'ig').test('Deno') // true
  new RegExp(/Deno/, 'ig').test('Deno, other strings') // true
  需要完整匹配, 不允许多余的文字, 则限制 beginning 和 end.
  new RegExp(/Deno$/, 'ig').test('Deno, other strings') // false
*/

let oldTabForTitle = "";

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
    title.innerText = `${getModName()} ${getModVersionWithDate()}: ${briefOverview}`;
  } else {
    title.innerText = `${getModName()} ${getModVersionWithDate()} tab=${currentTab}`;
  }
}

export function tweakTitle() {
  oldTabForTitle = getCurrentTab();
  tweakTitleInner(oldTabForTitle);
  clickModTabs((newTab) => {
    if (oldTabForTitle !== newTab) {
      oldTabForTitle = newTab;
      tweakTitleInner(newTab);
    }
  });
}

export const copyModNameAndVersion = function () {
  const uiRoot = createCopyContainer();
  const button = uiRoot.querySelector("button");
  const message = uiRoot.querySelector("span");
  button!.addEventListener("click", () => {
    navigator.clipboard.writeText(`${getModName()} ${getModVersionWithDate()}`).then(
      () => {
        message!.style.display = "inline";
        setTimeout(() => (message!.style.display = "none"), 1000);
      },
      () => console.log("%c[Error] Copy failed.", "color: red")
    );
  });
};

let oldTab = "";

/*
  User Script 的 include 指令实在太弱了.
  自行检查 url
*/
function checkTab(entryElement: HTMLElement) {
  const style = entryElement.style;
  function checkTabInner(currentTab: string) {
    if (isDescriptionTab(currentTab)) {
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

function simplifyTemplateDescription(tdContainer: HTMLDivElement) {
  tdContainer.querySelector(aboutThisModRelativeSelector)?.remove();
  tdContainer.querySelector(downloadedOrNotRelativeSelector)?.remove();
  tdContainer.querySelector(reportAbuseRelativeSelector)?.remove();
  tdContainer.querySelector(shareButtonRelativeSelector)?.remove();
  const accordion = tdContainer.querySelector<HTMLDListElement>(accordionRelativeSelector);
  if (accordion) {
    removeModsRequiringThis(accordion);
    showAllAccordionDds(accordion);
  }
}

function simplifyAuthorDefinedDescription(addContainer: HTMLDivElement) {
  showSpoilers(addContainer);
  replaceYoutubeVideosToAnchor(addContainer);
  replaceThumbnailUrlsToImageUrls(addContainer);
}

function createEntryElement(): HTMLButtonElement {
  const entryElemId = "simplifyModPage";
  const button = document.createElement("button");
  button.setAttribute("id", entryElemId);
  button.innerText = "Simplify Mod Page";
  return button;
}

// 从逻辑来讲, 应该是 UI 逻辑分离, 懒得写了
// 如果有 thumb gallery, 添加按钮, 并 bind event
// 点击按钮的逻辑: 页面最宽为 body 宽度, 所有 thumbnails 都以原图显示在页面
export function showAllGalleryThumbnails() {
  const pageTitleDiv = document.getElementById("pagetitle") as HTMLDivElement;
  const modActionsUl = pageTitleDiv.querySelector("ul.modactions") as HTMLUListElement;
  const thumbGallery = document.body.querySelector<HTMLUListElement>("#sidebargallery>ul.thumbgallery");
  // 作者不上传 mod 图片时, 应该没有 #sidebargallery>ul.thumbgallery
  if (thumbGallery) {
    const li = document.createElement("li");
    li.className = "btn inline-flex";
    li.innerText = "Show All Thumbnails";
    li.setAttribute(
      "style",
      "position:absolute;right:127px;bottom:65px;background-color:rgb(51, 122, 183);border:medium none rgb(46, 109, 164);border-radius:3px;"
    );
    modActionsUl.insertBefore(li, modActionsUl.firstChild);
    li.addEventListener("click", () => {
      const mainContent = document.getElementById("mainContent") as HTMLDivElement;
      mainContent.style.maxWidth = "none";
      thumbGallery.style.height = "max-content";
      thumbGallery.style.width = "auto";
      const thumbLis = thumbGallery.querySelectorAll("li");
      for (let i = 0; i < thumbLis.length; i++) {
        thumbLis[i].style.height = "auto";
        thumbLis[i].style.width = "auto";

        const figure = thumbLis[i].querySelector("figure") as HTMLElement;
        figure.style.height = "auto";

        const a = figure.querySelector("a") as HTMLAnchorElement;
        a.style.top = "0";
        a.style.transform = "none";
        const img = a.querySelector("img") as HTMLImageElement;
        img.style.maxHeight = "none";
      }
    });
  }
}

export function simplifyModPage() {
  const uiRoot = getActionContainer();
  const entryElem = createEntryElement();
  uiRoot.appendChild(entryElem);
  entryElem.addEventListener("click", async () => {
    simplifyModInfo();
    const tabContentContainer = getTabContentContainer();
    const tdContainer = await getTemplateDescriptionContainer(tabContentContainer);
    simplifyTemplateDescription(tdContainer);
    const addContainer = getAuthorDefinedDescriptionContainer(tabContentContainer);
    simplifyAuthorDefinedDescription(addContainer);
    title.innerText = `${getModName()} ${getModVersionWithDate()}`;
    setSectionAsTopElement();
    hideSylin527Ui();
  });
  checkTab(entryElem);
}
