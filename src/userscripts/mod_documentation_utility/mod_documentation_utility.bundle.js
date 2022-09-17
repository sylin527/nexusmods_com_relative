// ==UserScript==
// @name        sylin527's Mod Documentations Utility
// @namespace   https://www.nexusmods.com/
// @include     https://www.nexusmods.com/*/mods/*
// @include     https://www.nexusmods.com/*/articles/*
// @run-at      document-idle
// @icon        https://www.nexusmods.com/favicon.ico
// @grant       none
// @license     GPLv3
// @version     0.1.0.beta.2022.9.17
// @author      sylin527
// @description Help to save the mod documentations to local disk. Simplify mod page, files tab, posts tab, forum tab, article page, show requirements, changelogs, file descriptions and spoilers, replace thumbnails to original, replace embedded YouTube videos to links, remove unnecessary contents. After saving those pages by SingleFile, you can show/hide requirements, changelogs, spoilers, real file names downloaded, etc.
// ==/UserScript==
(() => {
  // ../shared.ts
  var body = document.body;
  var infoButtonBackground = "#8197ec";
  var warningButtonBackground = "#d98f40";
  var mainContentMaxWidth = "1340px";
  function setSectionAsTopElement() {
    const section = document.getElementById("section");
    body.classList.remove("new-head");
    body.style.margin = "0 auto";
    body.style.maxWidth = mainContentMaxWidth;
    const sectionBackup = section.cloneNode(true);
    body.innerHTML = "";
    body.appendChild(sectionBackup);
  }
  var showSpoilerToggle = "sylin527_show_spoiler_toggle";
  function addShowSpoilerToggleStyle() {
    const newStyle = document.createElement("style");
    document.head.appendChild(newStyle);
    const sheet = newStyle.sheet;
    let ruleIndex = sheet.insertRule(
      `
    input.${showSpoilerToggle},
    input.${showSpoilerToggle} ~ i.sylin527_show_text,
    input.${showSpoilerToggle} ~ i.sylin527_show_text::after {
      border: 0;
      cursor: pointer;
      box-sizing: border-box;
      display: inline-block;
      height: 27px;
      width: 60px;
      z-index: 999;
      position: relative;
      vertical-align: middle;
      text-align: center;
    }
    `
    );
    sheet.insertRule(
      `
    input.${showSpoilerToggle} {
      margin-left: 1px;
      z-index: 987654321;
      opacity: 0;
    }
    `,
      ++ruleIndex
    );
    sheet.insertRule(
      `
    input.${showSpoilerToggle} ~ i.sylin527_show_text {
      font-style: normal;
      margin-left: -60px;
    }
    `,
      ++ruleIndex
    );
    sheet.insertRule(
      `
    input.${showSpoilerToggle} ~ i.sylin527_show_text::after {
      content: attr(unchecked_text);
      background-color: ${infoButtonBackground};
      font-size: 12px;
      color: #E6E6E6;
      border-radius: 3px;
      font-weight: 400;
      line-height: 27px;
    }
    `,
      ++ruleIndex
    );
    sheet.insertRule(
      `
    input.${showSpoilerToggle}:checked ~ i.sylin527_show_text::after {
      content: attr(checked_text);
      background-color: ${warningButtonBackground};
    }
    `,
      ++ruleIndex
    );
    sheet.insertRule(
      `
    input.${showSpoilerToggle}:checked ~ div.bbc_spoiler_content {
      display: none;
    }
    `,
      ++ruleIndex
    );
    sheet.insertRule(
      `
    div.bbc_spoiler_content {
      display: block;
    }
    `,
      ++ruleIndex
    );
  }
  function showSpoilers(container) {
    addShowSpoilerToggleStyle();
    const spoilers = container.querySelectorAll("div.bbc_spoiler");
    for (let i = 0; i < spoilers.length; i++) {
      const spoiler = spoilers[i];
      spoiler.querySelector("div.bbc_spoiler_show")?.remove();
      const input = document.createElement("input");
      input.setAttribute("class", showSpoilerToggle);
      input.setAttribute("type", "checkbox");
      const iElement = document.createElement("i");
      iElement.setAttribute("class", "sylin527_show_text");
      iElement.setAttribute("checked_text", "Show");
      iElement.setAttribute("unchecked_text", "Hide");
      const content = spoiler.querySelector("div.bbc_spoiler_content");
      spoiler.insertBefore(input, content);
      spoiler.insertBefore(iElement, content);
      content.removeAttribute("style");
    }
  }
  function replaceYoutubeVideosToAnchor(container) {
    const youtubeIframes = container.querySelectorAll("iframe.youtube_video");
    if (youtubeIframes.length === 0)
      return;
    for (let i = 0; i < youtubeIframes.length; i++) {
      const embedUrl = youtubeIframes[i].getAttribute("src");
      const parts = embedUrl.split("/");
      const videoId = parts[parts.length - 1];
      const watchA = document.createElement("a");
      const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
      watchA.setAttribute("href", watchUrl);
      watchA.innerText = watchUrl;
      const parent = youtubeIframes[i].parentNode;
      const grandparent = parent.parentNode;
      grandparent && grandparent.replaceChild(watchA, parent);
    }
  }
  function replaceThumbnailUrlsToImageUrls(container) {
    const imgs = container.querySelectorAll("img");
    for (let i = 0; i < imgs.length; i++) {
      const src = imgs[i].src;
      if (src.startsWith("https://staticdelivery.nexusmods.com") && src.includes("thumbnails")) {
        imgs[i].src = src.replace("thumbnails/", "");
      }
    }
  }

  // ../util.ts
  var delay = function delay2(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
  var linkContent = function(anchorElement, content) {
    const blob = new Blob([content]);
    anchorElement.setAttribute("target", "_blank");
    anchorElement.setAttribute("href", URL.createObjectURL(blob));
    return anchorElement;
  };
  var illegalCharMarkMapping = {
    "?": "[QUESTION_MARK]",
    "*": "[ASTERISK]",
    ":": "[COLON]",
    "<": "[LEFT_ANGLE_BRACKET]",
    ">": "[RIGHT_ANGLE_BRACKET]",
    '"': "[QUOTE]",
    "/": "[SLASH]",
    "\\": "[BACKSLASH]",
    "|": "[VERTICAL_BAR]"
  };
  var replaceIllegalCharToMark = function(entityName) {
    entityName = entityName.trim();
    return entityName.replace(/(\?)|(\*)|(:)|(<)|(>)|(")|(\/)|(\\)|(\|)/g, (match) => illegalCharMarkMapping[match]);
  };
  var isSylin527 = false;

  // ../files_tab.ts
  var filesTabSelector = "div.tabcontent.tabcontent-mod-page";
  var premiumBannerSelector = `${filesTabSelector} div.premium-banner.container`;
  var modFilesSelector = "div#mod_files";
  var sortBySelector = `${modFilesSelector} div.file-category-header>div:nth-of-type(1)`;
  var sortByRelativeSelector = `div.file-category-header>div:nth-of-type(1)`;
  var fileDtRelativeSelector = "dl.accordion>dt";
  var downloadedIconRelativeSelector = "div>i.material-icons";
  var dateDownloadedRelativeSelector = "div>div.file-download-stats>ul>li.stat-downloaded";
  var fileDdRelativeSelector = "dl.accordion>dd";
  var fileDescriptionRelativeSelector = "div.tabbed-block:nth-of-type(1)";
  var downloadButtonsContainerRelativeSelector = `div.tabbed-block:nth-of-type(2)`;
  var previewFileRelativeSelector = "div.tabbed-block:last-child";
  function isFilesTab(tab) {
    return tab === "files";
  }
  var modFilesElem = null;
  function getModFilesElement() {
    if (null === modFilesElem) {
      modFilesElem = document.querySelector(modFilesSelector);
    }
    return modFilesElem;
  }
  function removePremiumBanner() {
    document.querySelector(premiumBannerSelector)?.remove();
  }
  function removeAllSortBys(modFilesElem2) {
    const arrayLike = modFilesElem2.querySelectorAll(sortByRelativeSelector);
    for (let i = 0; i < arrayLike.length; i++) {
      arrayLike[i].remove();
    }
  }
  function simplifyFileDts(modFilesElem2) {
    const dts = modFilesElem2.querySelectorAll(fileDtRelativeSelector);
    for (let i = 0; i < dts.length; i++) {
      dts[i].querySelector(downloadedIconRelativeSelector)?.remove();
      dts[i].querySelector(dateDownloadedRelativeSelector)?.remove();
      dts[i].style.background = "#2d2d2d";
    }
  }
  function addShowRealFilenameToggle(modFilesElem2) {
    const input = document.createElement("input");
    input.setAttribute("class", "sylin527_show_toggle");
    input.setAttribute("type", "checkbox");
    const i = document.createElement("i");
    i.setAttribute("class", "sylin527_show_text");
    i.setAttribute("checked_text", "Show Real Filenames");
    i.setAttribute("unchecked_text", "Hide Real Filenames");
    modFilesElem2.insertBefore(i, modFilesElem2.firstChild);
    modFilesElem2.insertBefore(input, modFilesElem2.firstChild);
    const newStyle = document.createElement("style");
    document.head.appendChild(newStyle);
    const sheet = newStyle.sheet;
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
    sheet.insertRule(
      `
    input.sylin527_show_toggle:checked ~ div dd p.sylin527_real_filename {
      display: none;
    }
    `,
      ++ruleIndex
    );
  }
  function simplifyFileDds(modFilesElem2) {
    showSpoilers(modFilesElem2);
    const dds = modFilesElem2.querySelectorAll(fileDdRelativeSelector);
    const realClass = "sylin527_real_filename";
    const newStyle = document.createElement("style");
    document.head.appendChild(newStyle);
    const sheet = newStyle.sheet;
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
      const fd = dds[i].querySelector("div.files-description");
      if (fd) {
        replaceYoutubeVideosToAnchor(fd);
        replaceThumbnailUrlsToImageUrls(fd);
      }
      const previewFileElem = dds[i].querySelector(previewFileRelativeSelector);
      const realFilename = previewFileElem?.querySelector("a")?.getAttribute("data-url");
      const fileDescElem = dds[i].querySelector(fileDescriptionRelativeSelector);
      const downContainer = dds[i].querySelector(downloadButtonsContainerRelativeSelector);
      let fileUrl = "";
      if (downContainer) {
        const fileUrlAnchor = downContainer.querySelector("ul>li:last-child>a");
        fileUrl = fileUrlAnchor.href;
        downContainer.remove();
      }
      const realFilenameP = document.createElement("p");
      if (typeof realFilename === "string") {
        realFilenameP.setAttribute("class", realClass);
        if (isSylin527) {
          const a = document.createElement("a");
          a.href = fileUrl;
          a.innerText = realFilename;
          realFilenameP.appendChild(a);
        } else {
          realFilenameP.innerText = realFilename;
        }
      }
      fileDescElem?.append(realFilenameP);
      previewFileElem?.remove();
      dds[i].style.display = "block";
    }
    addShowRealFilenameToggle(modFilesElem2);
  }

  // ../tabs_shared.ts
  var { body: body2, head } = document;
  var modInfoContainerSelector = "section#section";
  var galleryContainerSelector = "div#sidebargallery";
  var modVersionSelector = "div#pagetitle>ul.stats.clearfix>li.stat-version>div.statitem>div.stat";
  var modActionsSelector = "div#pagetitle>ul.modactions";
  var tabsContainerSelector = "div.tabs";
  var modTabsSelector = "#section div.tabs ul.modtabs";
  var tabContentContainerSelector = "div.tabcontent.tabcontent-mod-page";
  var modPageUrlRegexp = /^((https|http):\/\/(www.)?nexusmods.com\/[a-z0-9]+\/mods\/[0-9]+)/;
  function isModPageUrl(url) {
    return modPageUrlRegexp.test(url);
  }
  var modInfoContainer = null;
  function getModInfoContainer() {
    if (!modInfoContainer) {
      modInfoContainer = body2.querySelector(modInfoContainerSelector);
    }
    return modInfoContainer;
  }
  var modName = null;
  function getModName() {
    if (!modName) {
      const meta = head.querySelector(`meta[property="og:title"]`);
      if (meta) {
        modName = meta.getAttribute("content");
      } else {
        const ul = document.getElementById("breadcrumb");
        const li = ul.querySelector("li:last-child");
        modName = li.innerText;
      }
    }
    return modName;
  }
  var modVersion = null;
  function getModVersion() {
    if (!modVersion) {
      modVersion = body2.querySelector(modVersionSelector).innerText;
    }
    return modVersion;
  }
  var modVersionWithDate = null;
  function getModVersionWithDate() {
    if (!modVersionWithDate) {
      const fileInfoDiv = document.getElementById("fileinfo");
      const dateTimeElement = fileInfoDiv.querySelector("div.timestamp:nth-of-type(1)>time");
      const date = new Date(Date.parse(dateTimeElement.dateTime));
      modVersionWithDate = `${getModVersion()}(${date.getFullYear().toString().substring(2)}.${date.getMonth() + 1}.${date.getDate()})`;
    }
    return modVersionWithDate;
  }
  function removeFeature(modInfoContainer2) {
    const featureDiv = modInfoContainer2.querySelector("#feature");
    featureDiv?.removeAttribute("style");
    featureDiv?.setAttribute("id", "nofeature");
  }
  function removeModActions(modInfoContainer2) {
    modInfoContainer2.querySelector(modActionsSelector)?.remove();
  }
  function removeModGallery(modInfoContainer2) {
    modInfoContainer2.querySelector(galleryContainerSelector)?.remove();
  }
  function simplifyModInfo() {
    const mic = getModInfoContainer();
    removeFeature(mic);
    removeModActions(mic);
    removeModGallery(mic);
  }
  function setTabsContainerAsTopElement() {
    const tabsContainer = body2.querySelector(tabsContainerSelector);
    const modtabs = tabsContainer.querySelector("ul.modtabs");
    modtabs.style.height = "45px";
    body2.classList.remove("new-head");
    body2.style.margin = "0 auto";
    body2.style.maxWidth = mainContentMaxWidth;
    const tabsBackup = tabsContainer.cloneNode(true);
    body2.innerHTML = "";
    body2.appendChild(tabsBackup);
  }
  var modTabs = null;
  function getModTabs() {
    if (modTabs === null) {
      modTabs = body2.querySelector(modTabsSelector);
    }
    return modTabs;
  }
  function getCurrentTab() {
    const modTabs2 = getModTabs();
    const tabSpan = modTabs2.querySelector("li a.selected span");
    return tabSpan.innerText.toLowerCase();
  }
  function clickModTabs(callback) {
    const modTabs2 = getModTabs();
    modTabs2.addEventListener("click", (e) => {
      const target = e.target;
      let tabSpan;
      if (target instanceof HTMLAnchorElement) {
        tabSpan = target.querySelector("span:first-child");
      } else {
        tabSpan = target.parentElement.querySelector("span:first-child");
      }
      const newTab = tabSpan.innerText.toLowerCase();
      callback(newTab, e);
    });
  }
  var tabContentContainer = null;
  function getTabContentContainer() {
    if (!tabContentContainer) {
      tabContentContainer = body2.querySelector(tabContentContainerSelector);
    }
    return tabContentContainer;
  }

  // ../ui.ts
  var actionContainer = null;
  function createActionContainer() {
    const containerId = "sylin527ActionContainer";
    let container = document.getElementById(containerId);
    if (null === container) {
      container = document.createElement("div");
      container.setAttribute("id", containerId);
      const newStyle = document.createElement("style");
      document.head.appendChild(newStyle);
      const sheet = newStyle.sheet;
      let ruleIndex = sheet.insertRule(
        `
      #${containerId} {
        display: block;
        position: fixed;
        right: 5px;
        top: 56px;
        font-size: 13px;
        font-weight: 400;
        max-width: 200px;
        background: transparent;
        z-index: 999;
      }
      `
      );
      sheet.insertRule(
        `#${containerId} > a, #${containerId} > button {
        display: block;
        padding: 8px;
        cursor: pointer;
        background: #2093a6;
        border-radius: 3px;
        border: 1px solid #808080;
        color: #eaeaea;
        float: right;
        margin-top: 5px;
      }
      `,
        ++ruleIndex
      );
    }
    container.style.zIndex = "999";
    document.body.append(container);
    actionContainer = container;
    return actionContainer;
  }
  function getActionContainer() {
    if (actionContainer === null)
      actionContainer = createActionContainer();
    return actionContainer;
  }
  var hideSylin527Ui = function() {
    const roots = document.querySelectorAll("div[id^=sylin527]");
    for (let i = 0; i < roots.length; i++) {
      roots[i].style.display = "none";
    }
  };

  // ../files_tab_actions.ts
  var createEntryElement = function() {
    const button = document.createElement("button");
    button.setAttribute("id", "simplifyFilesTab");
    button.innerText = "Simplify Files Tab";
    return button;
  };
  var oldTab = "";
  function checkTab(entryElement) {
    const style = entryElement.style;
    function checkTabInner(currentTab) {
      if (isFilesTab(currentTab)) {
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
  var simplifyFilesTab = function() {
    const uiRoot = getActionContainer();
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

  // ../forum_tab.ts
  function isForumTab(tab) {
    return tab === "forum";
  }
  function simplify() {
    document.body.querySelector("#tab-modtopics > span")?.remove();
    const container = document.getElementById(
      "comment-container"
    );
    container.querySelector("div.head-nav")?.remove();
    container.querySelector("div.bottom-nav")?.remove();
    const authorComments = container.querySelectorAll(
      "ol>li.comment-author"
    );
    for (let i = 0; i < authorComments.length; i++) {
      showSpoilers(authorComments[i]);
      replaceYoutubeVideosToAnchor(authorComments[i]);
      replaceThumbnailUrlsToImageUrls(authorComments[i]);
    }
    const nonAuthorComments = container.querySelectorAll(
      "ol>li:not(.comment-author)"
    );
    for (let i = 0; i < nonAuthorComments.length; i++) {
      nonAuthorComments[i].remove();
    }
  }

  // ../forum_tab_actions.ts
  var oldTab2 = "";
  var createEntryElement2 = function() {
    const entryElemId = "simplifyForumTab";
    const button = document.createElement("button");
    button.setAttribute("id", entryElemId);
    button.innerText = "Simplify Forum Tab";
    return button;
  };
  function checkTab2(entryElement) {
    const style = entryElement.style;
    function checkTabInner(currentTab) {
      if (isForumTab(currentTab)) {
        style.display = "block";
      } else {
        style.display = "none";
      }
    }
    oldTab2 = getCurrentTab();
    checkTabInner(oldTab2);
    clickModTabs((newTab) => {
      if (oldTab2 !== newTab) {
        oldTab2 = newTab;
        checkTabInner(newTab);
      }
    });
  }
  var simplifyForumTab = function() {
    const uiRoot = getActionContainer();
    const entryElem = createEntryElement2();
    uiRoot.appendChild(entryElem);
    entryElem.addEventListener("click", () => {
      simplify();
      hideSylin527Ui();
      setTabsContainerAsTopElement();
    });
    checkTab2(entryElem);
  };

  // ../generate_gallery_html/gallery_html.ts
  function getDefaultStyle() {
    return `
    html, body {
        padding: 0;
        margin: 0;
        box-sizing: border-box;
        background: #222121;
    }
    body {
        padding: 8px;
    }
    img {
        max-width: calc(100% - 0px);
        border: 2px solid #959595;
        border-radius: 2px;
        box-sizing: border-box;
        margin-bottom: 8px;
    }
    img:last-child {
      margin-bottom: 0px;
    }
  `;
  }
  function generateImgElements(gallery) {
    const imgElements = [];
    const { descriptions, urls } = gallery;
    for (let i = 0; i < descriptions.length; i++) {
      imgElements.push(
        `<img alt="${descriptions[i]}" title="${descriptions[i]}" src="${urls[i]}"  />`
      );
    }
    return imgElements;
  }
  function generate({
    title: title2,
    style = getDefaultStyle(),
    descriptions,
    urls
  }) {
    const htmlParts = [];
    const encoding = '<meta charset="UTF-8">';
    htmlParts.push(encoding);
    const titleElem = `<title>${title2}</title>`;
    htmlParts.push(titleElem);
    const styleElem = `<style>${style}</style>`;
    htmlParts.push(styleElem);
    const imgElements = generateImgElements({ descriptions, urls });
    htmlParts.push(...imgElements);
    return htmlParts.join("\n");
  }

  // ../generate_gallery_html/generate_gallery_html.ts
  var { body: body3 } = document;
  function generateGallery() {
    const liArrayLike = body3.querySelectorAll("#sidebargallery>ul.thumbgallery>li.thumb");
    const descriptions = [];
    const urls = [];
    for (let i = 0; i < liArrayLike.length; i++) {
      const liElem = liArrayLike[i];
      const dataSrc = liElem.getAttribute("data-src");
      const innerImgElem = liElem.querySelector("figure>a>img");
      if (null !== innerImgElem) {
        const titleAttr = innerImgElem.getAttribute("title");
        if (null !== titleAttr) {
          descriptions.push(titleAttr);
        } else {
          descriptions.push("");
        }
      }
      if (null !== dataSrc) {
        urls.push(dataSrc);
      }
    }
    return {
      descriptions,
      urls
    };
  }
  var generateGalleryHtmlInner = function(modGallery) {
    const titleText = `_gallery_of_${getModName()}_${getModVersion()}`;
    const { descriptions, urls } = modGallery;
    const len = descriptions.length;
    for (let i = 0; i < len; i++) {
      descriptions[i] = `${(i + 1).toString().padStart(len.toString().length, "0")}_${replaceIllegalCharToMark(
        descriptions[i]
      )}`;
    }
    return generate({ title: titleText, descriptions, urls });
  };
  var createEntryElement3 = function() {
    const anchor = document.createElement("a");
    anchor.innerText = "Generate Gallery HTML";
    return anchor;
  };
  var generateGalleryHtml = function() {
    const uiRoot = getActionContainer();
    const entryElem = createEntryElement3();
    uiRoot.appendChild(entryElem);
    const htmlContent = generateGalleryHtmlInner(generateGallery());
    if (null !== htmlContent) {
      linkContent(entryElem, htmlContent);
    }
  };

  // ../description_tab.ts
  var templateDescriptionContainerSelector = "div.container.tab-description";
  var aboutThisModRelativeSelector = "h2#description_tab_h2";
  var downloadedOrNotRelativeSelector = "div.modhistory";
  var reportAbuseRelativeSelector = "ul.actions";
  var shareButtonRelativeSelector = "a.btn.inline-flex.button-share";
  var briefOverviewRelativeSelector = "p:nth-of-type(1)";
  var accordionRelativeSelector = "dl.accordion";
  var authorDefinedDescriptionContainerSelector = "div.container.mod_description_container";
  function isDescriptionTab(tab) {
    return tab === "description";
  }
  var templateDescriptionContainer = null;
  var authorDefinedDescriptionContainer = null;
  async function getTemplateDescriptionContainer(tabContentContainer2, delayMs = 100) {
    while (!templateDescriptionContainer) {
      await delay(delayMs);
      templateDescriptionContainer = tabContentContainer2.querySelector(
        templateDescriptionContainerSelector
      );
    }
    return templateDescriptionContainer;
  }
  function getAuthorDefinedDescriptionContainer(tabContentContainer2) {
    if (!authorDefinedDescriptionContainer) {
      authorDefinedDescriptionContainer = tabContentContainer2.querySelector(
        authorDefinedDescriptionContainerSelector
      );
    }
    return authorDefinedDescriptionContainer;
  }
  var briefOverview = null;
  function getBriefOverview(templateDescriptionContainer2) {
    if (!briefOverview) {
      const sde = templateDescriptionContainer2.querySelector(briefOverviewRelativeSelector);
      briefOverview = sde.innerText.trimEnd();
    }
    return briefOverview;
  }
  function removeModsRequiringThis(accordion) {
    const firstDt = accordion.querySelector("dt:nth-of-type(1)");
    const hasRequirementsDt = firstDt?.innerText.trim().startsWith("Requirements");
    if (hasRequirementsDt) {
      const divs = accordion.querySelectorAll("dd:nth-of-type(1)>div.tabbed-block");
      if (divs) {
        for (let i = 0; i < divs.length; i++) {
          const text = divs[i].querySelector("h3:nth-of-type(1)").innerText;
          if (text === "Mods requiring this file")
            divs[i].remove();
        }
      }
    }
  }
  function showAllAccordionDds(accordion) {
    const dts = accordion.querySelectorAll("dt");
    if (dts.length === 0)
      return;
    const dds = accordion.querySelectorAll("dd");
    const newStyle = document.createElement("style");
    document.head.appendChild(newStyle);
    const sheet = newStyle.sheet;
    const accordionToggle = "sylin527_show_accordion_toggle";
    let ruleIndex = sheet.insertRule(`
    input.${accordionToggle} {
      cursor: pointer;
      display: block;
      height: 43.5px;
      margin: -44.5px 0 1px 0; 
      width: 100%;
      z-index: 999;
      position: relative;
      opacity: 0;
    }
  `);
    sheet.insertRule(
      `
    input.${accordionToggle}:checked ~ dd{
      display: none;
    }
  `,
      ++ruleIndex
    );
    for (let i = 0; i < dts.length; i++) {
      dts[i].style.background = "#2d2d2d";
      dds[i].style.display = "block";
      dds[i].removeAttribute("style");
      const newPar = document.createElement("div");
      const toggle = document.createElement("input");
      toggle.setAttribute("class", accordionToggle);
      toggle.setAttribute("type", "checkbox");
      dds[i].parentElement.insertBefore(toggle, dds[i]);
      newPar.append(dts[i], toggle, dds[i]);
      accordion.append(newPar);
    }
  }

  // ../mod_page_actions.ts
  var createCopyContainer = function() {
    const containerId = "sylin527CopyContainer";
    const rootDiv = document.createElement("div");
    rootDiv.setAttribute("id", containerId);
    const button = document.createElement("button");
    button.innerText = "Copy";
    const message = document.createElement("span");
    message.innerText = "Copied mod name and version";
    rootDiv.append(button, message);
    const pagetitle = document.getElementById("pagetitle");
    const nameNextElem = pagetitle.querySelector("ul.stats");
    pagetitle.insertBefore(rootDiv, nameNextElem);
    const h1 = pagetitle.querySelector("h1:nth-of-type(1)");
    h1.style.display = "inline-block";
    const marginLeft = h1.clientWidth + 16 + "px";
    self.addEventListener("load", () => {
      rootDiv.style.marginLeft = h1.clientWidth + 16 + "px";
    });
    pagetitle.insertBefore(document.createElement("div"), rootDiv);
    const newStyle = document.createElement("style");
    document.head.appendChild(newStyle);
    const sheet = newStyle.sheet;
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
  var title = document.head.querySelector("title");
  var briefOverview2 = null;
  var oldTab3 = "";
  async function tweakTitleInner(currentTab) {
    if (isDescriptionTab(currentTab)) {
      if (!briefOverview2) {
        const tcc = getTabContentContainer();
        const tdc = await getTemplateDescriptionContainer(tcc);
        briefOverview2 = getBriefOverview(tdc).trim();
      }
      briefOverview2.replaceAll(/\r\n|\n/g, " ");
      title.innerText = `${getModName()} ${getModVersionWithDate()}: ${briefOverview2}`;
    } else {
      title.innerText = `${getModName()} ${getModVersionWithDate()} tab=${currentTab}`;
    }
  }
  var tweakTitle = function() {
    oldTab3 = getCurrentTab();
    tweakTitleInner(oldTab3);
    clickModTabs((newTab) => {
      if (oldTab3 !== newTab) {
        oldTab3 = newTab;
        tweakTitleInner(newTab);
      }
    });
  };
  var copyModNameAndVersion = function() {
    const uiRoot = createCopyContainer();
    const button = uiRoot.querySelector("button");
    const message = uiRoot.querySelector("span");
    button.addEventListener("click", () => {
      navigator.clipboard.writeText(`${getModName()} ${getModVersionWithDate()}`).then(
        () => {
          message.style.display = "inline";
          setTimeout(() => message.style.display = "none", 1e3);
        },
        () => console.log("%c[Error] Copy failed.", "color: red")
      );
    });
  };
  function checkTab3(entryElement) {
    const style = entryElement.style;
    function checkTabInner(currentTab) {
      if (isDescriptionTab(currentTab)) {
        style.display = "block";
      } else {
        style.display = "none";
      }
    }
    oldTab3 = getCurrentTab();
    checkTabInner(oldTab3);
    clickModTabs((newTab) => {
      if (oldTab3 !== newTab) {
        oldTab3 = newTab;
        checkTabInner(newTab);
      }
    });
  }
  function simplifyTemplateDescription(tdContainer) {
    tdContainer.querySelector(aboutThisModRelativeSelector)?.remove();
    tdContainer.querySelector(downloadedOrNotRelativeSelector)?.remove();
    tdContainer.querySelector(reportAbuseRelativeSelector)?.remove();
    tdContainer.querySelector(shareButtonRelativeSelector)?.remove();
    const accordion = tdContainer.querySelector(accordionRelativeSelector);
    if (accordion) {
      removeModsRequiringThis(accordion);
      showAllAccordionDds(accordion);
    }
  }
  function simplifyAuthorDefinedDescription(addContainer) {
    showSpoilers(addContainer);
    replaceYoutubeVideosToAnchor(addContainer);
    replaceThumbnailUrlsToImageUrls(addContainer);
  }
  function createEntryElement4() {
    const entryElemId = "simplifyModPage";
    const button = document.createElement("button");
    button.setAttribute("id", entryElemId);
    button.innerText = "Simplify Mod Page";
    return button;
  }
  function simplifyModPage() {
    const uiRoot = getActionContainer();
    const entryElem = createEntryElement4();
    uiRoot.appendChild(entryElem);
    entryElem.addEventListener("click", async () => {
      simplifyModInfo();
      const tabContentContainer2 = getTabContentContainer();
      const tdContainer = await getTemplateDescriptionContainer(tabContentContainer2);
      simplifyTemplateDescription(tdContainer);
      const addContainer = getAuthorDefinedDescriptionContainer(tabContentContainer2);
      simplifyAuthorDefinedDescription(addContainer);
      title.innerText = `${getModName()} ${getModVersionWithDate()}`;
      setSectionAsTopElement();
      hideSylin527Ui();
    });
    checkTab3(entryElem);
  }

  // ../posts_tab.ts
  function isPostsTab(tab) {
    return tab === "posts";
  }
  function simplify2() {
    const container = document.getElementById("comment-container");
    container.querySelector("div.head-nav")?.remove();
    container.querySelector("div.bottom-nav")?.remove();
    showSpoilers(container);
    const stickyLis = container.querySelectorAll("ol>li.comment-sticky");
    for (let i = 0; i < stickyLis.length; i++) {
      replaceYoutubeVideosToAnchor(stickyLis[i]);
      replaceThumbnailUrlsToImageUrls(stickyLis[i]);
    }
    const unstickyLis = container.querySelectorAll("ol>li:not(.comment-sticky)");
    for (let i = 0; i < unstickyLis.length; i++) {
      unstickyLis[i].remove();
    }
  }

  // ../posts_tab_actions.ts
  var oldTab4 = "";
  var createEntryElement5 = function() {
    const button = document.createElement("button");
    button.setAttribute("id", "simplifyPostsTab");
    button.innerText = "Simplify Posts Tab";
    return button;
  };
  function checkTab4(entryElement) {
    const style = entryElement.style;
    function checkTabInner(currentTab) {
      if (isPostsTab(currentTab)) {
        style.display = "block";
      } else {
        style.display = "none";
      }
    }
    oldTab4 = getCurrentTab();
    checkTabInner(oldTab4);
    clickModTabs((newTab) => {
      if (oldTab4 !== newTab) {
        oldTab4 = newTab;
        checkTabInner(newTab);
      }
    });
  }
  var simplifyPostsTab = function() {
    const uiRoot = getActionContainer();
    const entryElem = createEntryElement5();
    uiRoot.appendChild(entryElem);
    entryElem.addEventListener("click", () => {
      simplify2();
      hideSylin527Ui();
      setTabsContainerAsTopElement();
    });
    checkTab4(entryElem);
  };

  // ../article_page_actions.ts
  var { head: head2 } = document;
  var articlePageUrlRegexp = /^((https|http):\/\/(www.)?nexusmods.com\/[a-z0-9]+\/articles\/[0-9]+)/;
  function isArticlePageUrl(url) {
    return articlePageUrlRegexp.test(url);
  }
  function simplify3() {
    const section = document.getElementById("section");
    const content = section.querySelector("div.container");
    showSpoilers(content);
    replaceYoutubeVideosToAnchor(content);
    replaceThumbnailUrlsToImageUrls(content);
    const pageTitle = document.getElementById("pagetitle");
    const titleH1 = pageTitle.querySelector("h1");
    head2.querySelector("title").innerText = titleH1.innerText;
    pageTitle.querySelector("ul.modactions")?.remove();
    document.getElementById("comment-container")?.remove();
    setSectionAsTopElement();
  }
  var createEntryElement6 = function() {
    const button = document.createElement("button");
    button.setAttribute("id", "simplifyArticlePage");
    button.innerText = "Simplify Article Page";
    return button;
  };
  function simplifyArticlePage() {
    const uiRoot = getActionContainer();
    const entryElem = createEntryElement6();
    uiRoot.appendChild(entryElem);
    entryElem.addEventListener("click", () => {
      simplify3();
      hideSylin527Ui();
    });
  }

  // mod_documentation_utility.ts
  function modDocumentationUtility() {
    const href = location.href;
    if (isModPageUrl(href)) {
      tweakTitle();
      if (isSylin527) {
        generateGalleryHtml();
      }
      copyModNameAndVersion();
      simplifyModPage();
      simplifyFilesTab();
      simplifyPostsTab();
      simplifyForumTab();
    } else if (isArticlePageUrl(href)) {
      simplifyArticlePage();
    }
  }
  function main() {
    modDocumentationUtility();
    const scriptInfo = "Load userscript: sylin527's Mod Documentations Utility";
    console.log("%c [Info] " + scriptInfo, "color: green");
    console.log("%c [Info] URL: " + location.href, "color: green");
  }
  main();
})();
