/*
<div class="tabs">
  <ul class="modtabs"></ul>
  <div class="tabcontent tabcontent-mod-page" aria-live="assertive" role="status">
    <div id="mod_files">
      <div id="file-container-main-files">
        <div class="file-category-header">
          <h2>Main files</h2>
          <div>
            <label>Sort by</label>
            <!-- Sort by Name, Date uploaded, Unique DLs, Total DLs, Version, Size -->
            <select id="file-sort-by-main-files"></select>
            <!-- Asc, Desc -->
            <select id="file-sort-dir-main-files"></select>
          </div>
        </div>
        <div class="accordionitems">
          <dl class="accordion">
            <!-- file info -->
            <dt id="file-expander-header-294916"></dt>
            <!-- file description -->
            <dd class="clearfix open" data-id="294916"></dd>
          </dl>
        </div>
      </div>
      <div id="file-container-optional-files"></div>
      <div id="file-container-old-files"></div>
    </div>
  </div>
</div>

*/

import {
  infoButtonBackground,
  replaceThumbnailUrlsToImageUrls,
  replaceYoutubeVideosToAnchor,
  showSpoilers,
  warningButtonBackground,
} from "./shared.ts";
import { isSylin527 } from "./util.ts";

/**
 * files tab root element selector
 */
export const filesTabSelector = "div.tabcontent.tabcontent-mod-page";

export const premiumBannerSelector = `${filesTabSelector} div.premium-banner.container`;

export const modFilesSelector = "div#mod_files";

export const sortBySelector = `${modFilesSelector} div.file-category-header>div:nth-of-type(1)`;

/**
 * relative to modFilesSelector
 */
export const sortByRelativeSelector = `div.file-category-header>div:nth-of-type(1)`;

/* --------------------------------- File Info ---------------------------- */
/**
 * relative to modFilesSelector
 */
export const fileDtRelativeSelector = "dl.accordion>dt";

/**
 * relative to fileDtRelativeSelector
 */
export const securityIconRelativeSelector = "div>div.result.inline-flex";

/**
 * relative to fileDtRelativeSelector
 *
 * 可能没有
 */
export const downloadedIconRelativeSelector = "div>i.material-icons";

/**
 * relative to fileDtRelativeSelector
 *
 * 可能没有
 */
export const dateDownloadedRelativeSelector = "div>div.file-download-stats>ul>li.stat-downloaded";

/**
 * relative to fileDtRelativeSelector
 */
export const toggleFileDdRelativeSelector = "div>div.acc-status";

/* ----------- File Description, Download Buttons, Preview File ----------------- */

/**
 * relative to modFilesSelector
 */
export const fileDdRelativeSelector = "dl.accordion>dd";
/**
 * relative to fileDdRelativeSelector
 * 如果没有任何文件描述, 就是这个空元素.
 */
export const fileDescriptionRelativeSelector = "div.tabbed-block:nth-of-type(1)";

/**
 * relative to fileDdRelativeSelector
 */
export const downloadButtonsContainerRelativeSelector = `div.tabbed-block:nth-of-type(2)`;

/**
 * relative to fileDdRelativeSelector
 */
export const previewFileRelativeSelector = "div.tabbed-block:last-child";

// https://www.nexusmods.com/skyrimspecialedition/mods/14449?tab=files
// https://www.nexusmods.com/skyrimspecialedition/mods/14449/?tab=files 可能是历史原因, 导致多了一个 '/'
// 可能是历史原因, 甚至有时候切换 tab 时, url 不变...
export const filesTabUrlRegexp = /((https|http):\/\/)((www.)?nexusmods.com)\/\w+\/mods\/[0-9]+(\/)?(\?tab=files)$/;

export function isFilesTab(tab: string): boolean {
  return tab === "files";
}

let modFilesElem: HTMLDivElement | null = null;

export function getModFilesElement(): HTMLDivElement {
  if (null === modFilesElem) {
    modFilesElem = document.querySelector<HTMLDivElement>(modFilesSelector)!;
  }
  return modFilesElem;
}

export function removePremiumBanner() {
  document.querySelector<HTMLDivElement>(premiumBannerSelector)?.remove();
}

export function removeAllSortBys(modFilesElem: HTMLDivElement) {
  const arrayLike = modFilesElem.querySelectorAll<HTMLDivElement>(sortByRelativeSelector);
  for (let i = 0; i < arrayLike.length; i++) {
    arrayLike[i].remove();
  }
}

// Simplify File Info
export function simplifyFileDts(modFilesElem: HTMLDivElement) {
  // <dt>
  const dts = modFilesElem.querySelectorAll<HTMLElement>(fileDtRelativeSelector);
  for (let i = 0; i < dts.length; i++) {
    // 移除这个影响感官
    // dts[i].querySelector(securityIconRelativeSelector)?.remove();
    dts[i].querySelector(downloadedIconRelativeSelector)?.remove();
    dts[i].querySelector(dateDownloadedRelativeSelector)?.remove();
    // 移除这个影响感官
    // dts[i].querySelector(toggleFileDdRelativeSelector)?.remove()

    dts[i].style.background = "#2d2d2d";
  }
}

function addShowRealFilenameToggle(modFilesElem: HTMLDivElement) {
  /*
    <input class="sylin527_show_toggle" type="checkbox" /><i class="sylin527_show_text"
      checked_text="Show Real Filenames"
      unchecked_text="Hide Real Filenames"></i>
  */
  const input = document.createElement("input");
  input.setAttribute("class", "sylin527_show_toggle");
  input.setAttribute("type", "checkbox");
  const i = document.createElement("i");
  i.setAttribute("class", "sylin527_show_text");
  // unchecked 时显示, checked 之后隐藏
  i.setAttribute("checked_text", "Show Real Filenames");

  i.setAttribute("unchecked_text", "Hide Real Filenames");

  modFilesElem.insertBefore(i, modFilesElem.firstChild);
  modFilesElem.insertBefore(input, modFilesElem.firstChild);

  const newStyle = document.createElement("style");
  document.head.appendChild(newStyle);
  const sheet = newStyle.sheet!;
  let ruleIndex = sheet.insertRule(
    `
    input.sylin527_show_toggle,
    input.sylin527_show_toggle ~ i.sylin527_show_text,
    input.sylin527_show_toggle ~ i.sylin527_show_text::after {
      border: 0;
      cursor: pointer;
      box-sizing: border-box;
      display: block;
      height: 40px;
      width: 300px;
      z-index: 999;
      position: relative;
    }
    `
  );

  sheet.insertRule(
    `
    input.sylin527_show_toggle {
      margin: 0 auto;
      z-index: 987654321;
      opacity: 0;
    }
    `,
    ++ruleIndex
  );
  sheet.insertRule(
    `
    i.sylin527_show_text {
      font-style: normal;
      font-size: 18px;
      background-color: ${infoButtonBackground};
      text-align: center;
      line-height: 40px;
      border-radius: 5px;
      font-weight: 400;
      margin: -40px auto -60px auto;
    }
    `,
    ++ruleIndex
  );
  sheet.insertRule(
    `
    input.sylin527_show_toggle ~ i.sylin527_show_text::after {
      content: attr(unchecked_text);
    }
    `,
    ++ruleIndex
  );
  sheet.insertRule(
    `
    input.sylin527_show_toggle:checked ~ i.sylin527_show_text {
      background-color: ${warningButtonBackground};
    }
    `,
    ++ruleIndex
  );
  sheet.insertRule(
    `
    input.sylin527_show_toggle:checked ~ i.sylin527_show_text::after {
      content: attr(checked_text);
    }
    `,
    ++ruleIndex
  );
  // 由于 SingFileZ 默认移除隐藏的内容, 必须先显示. 需要时在隐藏.
  sheet.insertRule(
    `
    input.sylin527_show_toggle:checked ~ div dd p.sylin527_real_filename {
      display: none;
    }
    `,
    ++ruleIndex
  );
}

// Simplify File Description
export function simplifyFileDds(modFilesElem: HTMLDivElement) {
  showSpoilers(modFilesElem);
  // <dd>
  const dds = modFilesElem.querySelectorAll<HTMLElement>(fileDdRelativeSelector);

  const realClass = "sylin527_real_filename";

  const newStyle = document.createElement("style");
  document.head.appendChild(newStyle);
  const sheet = newStyle.sheet;
  // 由于 SingFileZ 默认移除隐藏的内容, 必须先显示. 需要时在隐藏.
  sheet?.insertRule(
    `
    p.${realClass} {
      color: #8197ec;
      margin-top: 20xp;
    }
    `,
    0
  );

  for (let i = 0; i < dds.length; i++) {
    const fd = dds[i].querySelector<HTMLDivElement>("div.files-description");
    if (fd) {
      replaceYoutubeVideosToAnchor(fd);
      replaceThumbnailUrlsToImageUrls(fd);
    }
    const previewFileElem = dds[i].querySelector<HTMLDivElement>(previewFileRelativeSelector);
    const realFilename = previewFileElem?.querySelector("a")?.getAttribute("data-url");
    const fileDescElem = dds[i].querySelector<HTMLParagraphElement>(fileDescriptionRelativeSelector);

    // Remove all download buttons
    const downContainer = dds[i].querySelector<HTMLDivElement>(downloadButtonsContainerRelativeSelector);

    let fileUrl = "";
    if (downContainer) {
      /*
      <li>
        <a class="btn inline-flex" href="https://www.nexusmods.com/skyrimspecialedition/mods/38980?tab=files&amp;file_id=154503">
          <svg title="" class="icon icon-manual"></svg>
          <span class="flex-label">Manual download</span>
        </a>
      </li>
       */
      const fileUrlAnchor = downContainer.querySelector("ul>li:last-child>a") as HTMLAnchorElement;
      fileUrl = fileUrlAnchor.href;
      downContainer.remove();
    }

    const realFilenameP = document.createElement("p");
    // 两个 style 属性, 没必要
    // realFilenameP.setAttribute('class','sylin527-real-filename')
    if (typeof realFilename === "string") {
      realFilenameP.setAttribute("class", realClass);

      // [sylin527]
      // 即便 mod 被 delete, 依然可以根据 file url (mod id 和 file id) 下载文件,
      // 这其实算是一个漏洞, 这导致有些不符合 nexusmods 协议的 mod 也可能被下载
      // 甚至有时候可以根据时间浏览器输入 url 请求暴力枚举 file id
      if (isSylin527) {
        const a = document.createElement("a");
        a.href = fileUrl;
        a.innerText = realFilename;
        // 自用可以像下面这样写, 但为了是这个漏洞维持, 公开脚本不要这样搞
        realFilenameP.appendChild(a);
      } else {
        // 稍微留点后门吧...
        realFilenameP.setAttribute("file-url", fileUrl);
        realFilenameP.innerText = realFilename;
      }
    }

    // append real filename to of file description.
    fileDescElem?.append(realFilenameP);

    /*
    [sylin527] 一定先用完在删除元素, 否则可能导致选择器不对.
    */
    // Remove all preview file buttons
    previewFileElem?.remove();

    // Show all file descriptions
    dds[i].style.display = "block";
  }
  addShowRealFilenameToggle(modFilesElem);
}
