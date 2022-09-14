// ==UserScript==
// @name        [sylin527] nexusmods.com Mod Documentation Utility
// @namespace   https://www.nexusmods.com/
// @match       https://www.nexusmods.com/*/mods/*
// @run-at      document-idle
// @icon        https://www.nexusmods.com/favicon.ico
// @grant       none
// @license     GPLv3
// @version     0.1.0.2022.9.15
// @author      sylin527
// @description Mod Documentation Utility. Simplify mod page, files tab, post tab, forum tab. Then save the page by SingFile or other tools.
// ==/UserScript==
(() => {
  // ../shared.ts
  var body = document.body;
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
  function showSpoilers(container) {
    const contentDivs = container.querySelectorAll("div.bbc_spoiler>div:nth-of-type(2)");
    for (let i = 0; i < contentDivs.length; i++) {
      contentDivs[i].style.display = "block";
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
  var isSylin527 = true;

  // ../files_tab/files_tab.ts
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
    if (modFilesElem === null) {
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
    let ruleIndex = sheet.insertRule(`
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
    `);
    sheet.insertRule(`
    input.sylin527_show_toggle {
      margin: 0 auto;
      z-index: 987654321;
      opacity: 0;
    }
    `, ++ruleIndex);
    sheet.insertRule(`
    i.sylin527_show_text {
      font-style: normal;
      font-size: 18px;
      background-color: #8197ec;
      text-align: center;
      line-height: 40px;
      border-radius: 5px;
      font-weight: 400;
      margin: -40px auto -60px auto;
    }
    `, ++ruleIndex);
    sheet.insertRule(`
    input.sylin527_show_toggle ~ i.sylin527_show_text::after {
      content: attr(unchecked_text);
    }
    `, ++ruleIndex);
    sheet.insertRule(`
    input.sylin527_show_toggle:checked ~ i.sylin527_show_text::after {
      content: attr(checked_text);
    }
    `, ++ruleIndex);
    sheet.insertRule(`
    input.sylin527_show_toggle:checked ~ div dd p.sylin527_real_filename {
      display: none;
    }
    `, ++ruleIndex);
  }
  function simplifyFileDds(modFilesElem2) {
    const dds = modFilesElem2.querySelectorAll(fileDdRelativeSelector);
    const realClass = "sylin527_real_filename";
    const newStyle = document.createElement("style");
    document.head.appendChild(newStyle);
    const sheet = newStyle.sheet;
    sheet?.insertRule(`
    p.${realClass} {
      color: #8197ec;
      margin-top: 20xp;
    }
    `, 0);
    for (let i = 0; i < dds.length; i++) {
      const fd = dds[i].querySelector("div.files-description");
      if (fd) {
        showSpoilers(fd);
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
  var modInfoContainer = null;
  function getModInfoContainer() {
    if (!modInfoContainer) {
      modInfoContainer = body2.querySelector(modInfoContainerSelector);
    }
    return modInfoContainer;
  }
  function getModName() {
    const meta = head.querySelector(`meta[property="og:title"]`);
    if (meta)
      return meta.getAttribute("content");
    const ul = document.getElementById("breadcrumb");
    const li = ul.querySelector("li:last-child");
    return li.innerText;
  }
  function getModVersion() {
    return body2.querySelector(modVersionSelector).innerText;
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
  var uiRoot = null;
  function createUIRootElement() {
    const sylin527UiContainer = "#sylin527UiContainer";
    let entryElem = document.querySelector(sylin527UiContainer);
    if (entryElem === null) {
      entryElem = document.createElement("div");
      entryElem.setAttribute("id", "sylin527UiContainer");
      const newStyle = document.createElement("style");
      document.head.appendChild(newStyle);
      const sheet = newStyle.sheet;
      let ruleIndex = sheet.insertRule(`
      #sylin527UiContainer {
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
      `);
      sheet.insertRule(`#sylin527UiContainer > a, #sylin527UiContainer > button {
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
      `, ++ruleIndex);
    }
    entryElem.style.zIndex = "999";
    document.body.append(entryElem);
    uiRoot = entryElem;
    return entryElem;
  }
  function getUiRootElement() {
    if (uiRoot === null)
      uiRoot = createUIRootElement();
    return uiRoot;
  }
  var hideSylin527Ui = function() {
    const roots = document.querySelectorAll("div[id^=sylin527]");
    for (let i = 0; i < roots.length; i++) {
      roots[i].style.display = "none";
    }
  };

  // ../files_tab/files_tab_actions.ts
  var createEntryElement = function() {
    const button = document.createElement("button");
    button.setAttribute("id", "simplifyFilesTab");
    button.innerText = "Simplify Files Tab";
    return button;
  };
  var oldTab = getCurrentTab();
  function checkTab(entryElement) {
    const style = entryElement.style;
    function checkTabInner(currentTab) {
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
  var simplifyFilesTab = function() {
    const uiRoot2 = getUiRootElement();
    const entryElem = createEntryElement();
    uiRoot2.appendChild(entryElem);
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

  // ../forum_tab/forum_tab.ts
  function isForumTab(tab) {
    return tab === "forum";
  }
  function simplify() {
    document.body.querySelector("#tab-modtopics > span")?.remove();
    const container = document.getElementById("comment-container");
    container.querySelector("div.head-nav")?.remove();
    container.querySelector("div.bottom-nav")?.remove();
    const authorComments = container.querySelectorAll("ol>li.comment-author");
    for (let i = 0; i < authorComments.length; i++) {
      showSpoilers(authorComments[i]);
      replaceYoutubeVideosToAnchor(authorComments[i]);
      replaceThumbnailUrlsToImageUrls(authorComments[i]);
    }
    const nonAuthorComments = container.querySelectorAll("ol>li:not(.comment-author)");
    for (let i = 0; i < nonAuthorComments.length; i++) {
      nonAuthorComments[i].remove();
    }
  }

  // ../forum_tab/forum_tab_actions.ts
  var oldTab2 = getCurrentTab();
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
    checkTabInner(oldTab2);
    clickModTabs((newTab) => {
      if (oldTab2 !== newTab) {
        oldTab2 = newTab;
        checkTabInner(newTab);
      }
    });
  }
  var simplifyForumTab = function() {
    const uiRoot2 = getUiRootElement();
    const entryElem = createEntryElement2();
    uiRoot2.appendChild(entryElem);
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
    for (let i = 0; i < gallery.length; i += 2) {
      imgElements.push(`<img alt="${gallery[i + 1]}" title="${gallery[i + 1]}" src="${gallery[i]}"  />`);
    }
    return imgElements;
  }
  function generate({
    title: title2,
    style = getDefaultStyle(),
    gallery
  }) {
    const htmlParts = [];
    const encoding = '<meta charset="UTF-8">';
    htmlParts.push(encoding);
    const titleElem = `<title>${title2}</title>`;
    htmlParts.push(titleElem);
    const styleElem = `<style>${style}</style>`;
    htmlParts.push(styleElem);
    const imgElements = generateImgElements(gallery);
    htmlParts.push(...imgElements);
    return htmlParts.join("\n");
  }

  // ../generate_gallery_html/generate_gallery_html.ts
  var { body: body3 } = document;
  function generateGallery() {
    const liArrayLike = body3.querySelectorAll("#sidebargallery>ul.thumbgallery>li.thumb");
    const gallery = [];
    for (let i = 0; i < liArrayLike.length; i++) {
      const liElem = liArrayLike[i];
      const dataSrc = liElem.getAttribute("data-src");
      const innerImgElem = liElem.querySelector("figure>a>img");
      if (innerImgElem !== null) {
        const titleAttr = innerImgElem.getAttribute("title");
        if (titleAttr !== null) {
          gallery.push(titleAttr);
        } else {
          gallery.push("");
        }
      }
      if (dataSrc !== null) {
        gallery.push(dataSrc);
      }
    }
    return gallery;
  }
  var generateGalleryHtmlInner = function(modGallery) {
    const titleText = `_gallery_of_${getModName()}_${getModVersion()}`;
    const len = modGallery.length;
    for (let i = 0; i < len; i += 2) {
      modGallery[i] = `${(i % 2 + 1).toString().padStart(len.toString().length, "0")}_${replaceIllegalCharToMark(modGallery[i])}`;
    }
    return generate({ title: titleText, gallery: modGallery });
  };
  var createEntryElement3 = function() {
    const anchor = document.createElement("a");
    anchor.innerText = "Generate Gallery HTML";
    return anchor;
  };
  var generateGalleryHtml = function() {
    const uiRoot2 = getUiRootElement();
    const entryElem = createEntryElement3();
    uiRoot2.appendChild(entryElem);
    const htmlContent = generateGalleryHtmlInner(generateGallery());
    if (htmlContent !== null) {
      linkContent(entryElem, htmlContent);
    }
  };

  // ../description_tab/description_tab.ts
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
      templateDescriptionContainer = tabContentContainer2.querySelector(templateDescriptionContainerSelector);
    }
    return templateDescriptionContainer;
  }
  function getAuthorDefinedDescriptionContainer(tabContentContainer2) {
    if (!authorDefinedDescriptionContainer) {
      authorDefinedDescriptionContainer = tabContentContainer2.querySelector(authorDefinedDescriptionContainerSelector);
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
    let ruleIndex = sheet.insertRule(`
    input.sylin527_show_toggle {
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
    sheet.insertRule(`
    input.sylin527_show_toggle:checked ~ dd{
      display: none;
    }
  `, ++ruleIndex);
    for (let i = 0; i < dts.length; i++) {
      dts[i].style.background = "#2d2d2d";
      dds[i].style.display = "block";
      dds[i].removeAttribute("style");
      const newPar = document.createElement("div");
      const toggle = document.createElement("input");
      toggle.setAttribute("class", "sylin527_show_toggle");
      toggle.setAttribute("type", "checkbox");
      dds[i].parentElement.insertBefore(toggle, dds[i]);
      newPar.append(dts[i], toggle, dds[i]);
      accordion.append(newPar);
    }
  }

  // ../mod_page/mod_page_actions.ts
  var createCopyUiRoot = function() {
    const rootUiId = "sylin527CopyRoot";
    const rootDiv = document.createElement("div");
    rootDiv.setAttribute("id", rootUiId);
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
    let ruleIndex = sheet.insertRule(`
    #${rootUiId} {
      margin-left: ${marginLeft};
      font-family: 'Roboto',sans-serif;
      font-size: 14px;
      line-height: 1.15;
      position: absolute;
      margin-top: -51px;
    }
    `);
    sheet.insertRule(`
    #${rootUiId} > button {
      background-color: #337ab7;
      border: none;
      border-radius: 3px;
      padding: 0 1.2rem;
      line-height: 34px;
      vertical-align: middle;
      font-weight: 400;
      border-color: #2e6da4;
    }
    `, ++ruleIndex);
    sheet.insertRule(`
    #${rootUiId} > span {
      background-color: rgba(51, 51, 51, 0.5);
      color: hotpink;
      padding: 8px;
      border-radius: 5px;
      margin-left: 1rem;
      display: none;
    }
    `, ++ruleIndex);
    return rootDiv;
  };
  var copyModNameAndVersion = function() {
    const uiRoot2 = createCopyUiRoot();
    let modNameAndVersion = null;
    const button = uiRoot2.querySelector("button");
    const message = uiRoot2.querySelector("span");
    const getCopyText = function() {
      if (modNameAndVersion === null) {
        modNameAndVersion = `${getModName()} ${getModVersion()}`;
      }
      return modNameAndVersion;
    };
    button.addEventListener("click", () => {
      navigator.clipboard.writeText(getCopyText()).then(() => {
        message.style.display = "inline";
        setTimeout(() => message.style.display = "none", 1e3);
      }, () => console.log("%c[Error] Copy failed.", "color: red"));
    });
  };
  var oldTab3 = getCurrentTab();
  function checkTab3(entryElement) {
    const style = entryElement.style;
    function checkTabInner(currentTab) {
      if (isDescriptionTab(currentTab)) {
        style.display = "block";
      } else {
        style.display = "none";
      }
    }
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
  function tweakTitleText() {
    const title2 = document.querySelector("title");
    title2.innerText = `${getModName()} ${getModVersion()}`;
  }
  function createEntryElement4() {
    const entryElemId = "simplifyModPage";
    const button = document.createElement("button");
    button.setAttribute("id", entryElemId);
    button.innerText = "Simplify Mod Page";
    return button;
  }
  function simplifyModPage() {
    const uiRoot2 = getUiRootElement();
    const entryElem = createEntryElement4();
    uiRoot2.appendChild(entryElem);
    entryElem.addEventListener("click", async () => {
      simplifyModInfo();
      const tabContentContainer2 = getTabContentContainer();
      const tdContainer = await getTemplateDescriptionContainer(tabContentContainer2);
      simplifyTemplateDescription(tdContainer);
      const addContainer = getAuthorDefinedDescriptionContainer(tabContentContainer2);
      simplifyAuthorDefinedDescription(addContainer);
      tweakTitleText();
      setSectionAsTopElement();
      hideSylin527Ui();
    });
    checkTab3(entryElem);
  }

  // ../page_title/page_title_actions.ts
  var title = document.head.querySelector("title");
  var modName = getModName();
  var modVersion = getModVersion();
  var briefOverview2 = null;
  var oldTab4 = getCurrentTab();
  async function tweakTitleInner(currentTab) {
    if (isDescriptionTab(currentTab)) {
      if (!briefOverview2) {
        const tcc = getTabContentContainer();
        const tdc = await getTemplateDescriptionContainer(tcc);
        briefOverview2 = getBriefOverview(tdc).trim();
      }
      briefOverview2.replaceAll(/\r\n|\n/g, " ");
      title.innerText = `${modName} ${modVersion}: ${briefOverview2}`;
    } else {
      title.innerText = `${modName} ${modVersion} tab=${currentTab}`;
    }
  }
  var tweakTitle = function() {
    tweakTitleInner(oldTab4);
    clickModTabs((newTab) => {
      if (oldTab4 !== newTab) {
        oldTab4 = newTab;
        tweakTitleInner(newTab);
      }
    });
  };

  // ../posts_tab/posts_tab.ts
  function isPostsTab(tab) {
    return tab === "posts";
  }
  function simplify2() {
    const container = document.getElementById("comment-container");
    container.querySelector("div.head-nav")?.remove();
    container.querySelector("div.bottom-nav")?.remove();
    const stickyLis = container.querySelectorAll("ol>li.comment-sticky");
    for (let i = 0; i < stickyLis.length; i++) {
      showSpoilers(stickyLis[i]);
      replaceYoutubeVideosToAnchor(stickyLis[i]);
      replaceThumbnailUrlsToImageUrls(stickyLis[i]);
    }
    const unstickyLis = container.querySelectorAll("ol>li:not(.comment-sticky)");
    for (let i = 0; i < unstickyLis.length; i++) {
      unstickyLis[i].remove();
    }
  }

  // ../posts_tab/posts_tab_actions.ts
  var oldTab5 = getCurrentTab();
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
    checkTabInner(oldTab5);
    clickModTabs((newTab) => {
      if (oldTab5 !== newTab) {
        oldTab5 = newTab;
        checkTabInner(newTab);
      }
    });
  }
  var simplifyPostsTab = function() {
    const uiRoot2 = getUiRootElement();
    const entryElem = createEntryElement5();
    uiRoot2.appendChild(entryElem);
    entryElem.addEventListener("click", () => {
      simplify2();
      hideSylin527Ui();
      setTabsContainerAsTopElement();
    });
    checkTab4(entryElem);
  };

  // mod_documentation_utility.ts
  function modDocumentationUtility() {
    tweakTitle();
    if (isSylin527) {
      generateGalleryHtml();
    }
    copyModNameAndVersion();
    simplifyModPage();
    simplifyFilesTab();
    simplifyPostsTab();
    simplifyForumTab();
  }
  function main() {
    modDocumentationUtility();
    const scriptInfo = "Load userscript: [sylin527] nexusmods.com Mod Documentation Utility";
    console.log("%c [Info] " + scriptInfo, "color: green");
  }
  main();
})();
