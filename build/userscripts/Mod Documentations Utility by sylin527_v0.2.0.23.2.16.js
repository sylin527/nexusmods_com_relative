// ==UserScript==
// @name        Mod Documentations Utility by sylin527
// @namespace   https://www.nexusmods.com
// @match       https://www.nexusmods.com/*/mods/*
// @match       https://www.nexusmods.com/*/articles/*
// @run-at      document-idle
// @version     0.2.0.23.2.16
// @license     GPLv3
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_download
// @grant       unsafeWindow
// @icon        https://www.nexusmods.com/favicon.ico
// @author      sylin527
// @description Help to save the mod documentations to local disk.    Simplify mod page, files tab, posts tab, forum tab, article page.    Show requirements, changelogs, file descriptions and spoilers, replace thumbnails to original, replace embedded YouTube videos to links, remove unnecessary contents.    After saving those pages by SingleFile, you can show/hide requirements, changelogs, spoilers, real file names downloaded, etc.
// ==/UserScript==
(() => {
  // src/site_shared.ts
  function getNexusmodsUrl() {
    return `https://www.nexusmods.com`;
  }
  function getMainContentDiv() {
    return document.getElementById("mainContent");
  }
  var _section = null;
  function getSection() {
    !_section && (_section = getMainContentDiv().querySelector(":scope > section"));
    return _section;
  }
  function getCommentContainerComponent(commentContainerDiv = document.getElementById("comment-container")) {
    if (!commentContainerDiv)
      return null;
    const headNavDiv = commentContainerDiv.querySelector(":scope > div.head-nav");
    const bottomNavDiv = commentContainerDiv.querySelector(":scope > div.bottom-nav");
    const allCommentLis = commentContainerDiv.querySelectorAll(":scope > ol > li.comment");
    const stickyCommentLis = [];
    const authorCommentLis = [];
    const otherCommentLis = [];
    for (const commentLi of allCommentLis) {
      const classList = commentLi.classList;
      if (classList.contains("comment-sticky")) {
        stickyCommentLis.push(commentLi);
      } else if (classList.contains("comment-author")) {
        authorCommentLis.push(commentLi);
      } else {
        otherCommentLis.push(commentLi);
      }
    }
    return {
      commentContainerDiv,
      get commentCount() {
        return parseInt(
          document.getElementById("comment-count").getAttribute("data-comment-count")
        );
      },
      headNavDiv,
      bottomNavDiv,
      stickyCommentLis,
      authorCommentLis,
      otherCommentLis
    };
  }
  function getCommentContentTextDiv(commentLi) {
    return commentLi.querySelector(":scope > div.comment-content > div.comment-content-text");
  }

  // src/api/mod_api.ts
  async function getFiles(gameDomainName, modId, apiKey) {
    const res = await fetch(`https://api.nexusmods.com/v1/games/${gameDomainName}/mods/${modId}/files.json`, {
      headers: {
        apikey: apiKey
      }
    });
    return await res.json();
  }
  function generateModUrl(gameDomainName, modId) {
    return `https://www.nexusmods.com/${gameDomainName}/mods/${modId}`;
  }
  function generateFileUrl(gameDomainName, modId, fileId) {
    return `${getNexusmodsUrl()}/${gameDomainName}/mods/${modId}?tab=files&file_id=${fileId}`;
  }

  // src/ui.ts
  var { body: bodyElement, head: headElement } = document;
  var titleElement = headElement.querySelector("title");
  var primaryColor = "#8197ec";
  var primaryHoverColor = "#a4b7ff";
  var highlightColor = "#d98f40";
  var highlightHoverColor = "#ce7f45";
  var mainContentMaxWidth = "1340px";
  function overPrimaryComponent(element) {
    const style = element.style;
    element.addEventListener("mouseover", function() {
      style.backgroundColor = primaryHoverColor;
    });
    element.addEventListener("mouseleave", function() {
      style.backgroundColor = primaryColor;
    });
  }
  var containerManager = {
    containers: [],
    removeAll() {
      this.containers.forEach(({ element }) => {
        element.remove();
      });
    },
    showAll() {
      this.containers.forEach((container) => container.show());
    },
    hideAll() {
      this.containers.forEach((container) => container.hide());
    },
    add(container) {
      this.containers.push(container);
    },
    addBlocked(element) {
      this.containers.push({
        element,
        show() {
          element.style.display = "block";
        },
        hide() {
          element.style.display = "none";
        }
      });
    }
  };
  function getActionContainerId() {
    return "sylin527ActionContainer";
  }
  function insertActionContainerStyle() {
    const newStyle = document.createElement("style");
    headElement.appendChild(newStyle);
    const sheet = newStyle.sheet;
    const containerId = getActionContainerId();
    let ruleIndex = sheet.insertRule(
      `
    #${containerId} {
      display: block;
      position: fixed;
      right: 5px;
      top: 56px;
      font-size: 13px;
      font-weight: 400;
      background: transparent;
      z-index: 999;
      direction: rtl;
    }
    `
    );
    sheet.insertRule(
      `
    #${containerId} > *{
      display: block;
      margin-top: 5px;
    }
    `,
      ++ruleIndex
    );
    sheet.insertRule(
      `
    #${containerId} button.action {
    padding: 8px;
    cursor: pointer;
    background: ${primaryColor};
    border-radius: 3px;
    border: 1px solid ${primaryHoverColor};
    color: #eaeaea;
    `,
      ++ruleIndex
    );
    sheet.insertRule(
      `
    #${containerId} button.action:hover {
    background: ${primaryHoverColor};
    `,
      ++ruleIndex
    );
    sheet.insertRule(
      `
    #${containerId} span.message {
      background-color: rgba(51, 51, 51, 0.5);
      color: rgb(255, 47, 151);
      padding: 8px;
      border-radius: 4px;
      display: inline;
      margin: 0 7px;
      visibility: hidden;
    }
    `,
      ++ruleIndex
    );
  }
  function createActionContainer() {
    const containerId = getActionContainerId();
    let container = document.getElementById(containerId);
    if (null === container) {
      container = document.createElement("div");
      container.setAttribute("id", containerId);
      container.style.zIndex = "999";
      insertActionContainerStyle();
    }
    return container;
  }
  var _actionContainer = null;
  function insertActionContainer() {
    if (!_actionContainer) {
      _actionContainer = createActionContainer();
      bodyElement.append(_actionContainer);
      containerManager.addBlocked(_actionContainer);
    }
    return _actionContainer;
  }
  function createActionComponent(name) {
    const actionButton = document.createElement("button");
    actionButton.innerText = name;
    actionButton.className = "action";
    return actionButton;
  }
  function createActionWithMessageComponent(name) {
    const containerDiv = document.createElement("div");
    const actionButton = createActionComponent(name);
    const messageSpan = document.createElement("span");
    messageSpan.className = "message";
    containerDiv.append(actionButton, messageSpan);
    return {
      element: containerDiv,
      actionButton,
      messageSpan
    };
  }

  // src/mod_page/tabs_shared.ts
  function getModUrlRegExp() {
    return /^((https|http):\/\/(www.)?nexusmods.com\/[a-z0-9]+\/mods\/[0-9]+)/;
  }
  function isModUrl(url) {
    return getModUrlRegExp().test(url);
  }
  var _gameDomainName = null;
  function getGameDomainName() {
    _gameDomainName ||= _gameDomainName = new URL(location.href).pathname.split("/")[1];
    return _gameDomainName;
  }
  var _modId = null;
  function getModId() {
    _modId ||= _modId = parseInt(getSection().getAttribute("data-mod-id"));
    return _modId;
  }
  function getFeaturedBelowDiv() {
    return getSection().querySelector(":scope > div.wrap > div:nth-of-type(2).wrap");
  }
  var _breadcrumbUl = null;
  function getBreadcrumbUl() {
    _breadcrumbUl ||= _breadcrumbUl = document.getElementById("breadcrumb");
    return _breadcrumbUl;
  }
  var _gameName = null;
  function getGameName() {
    _gameName ||= getBreadcrumbUl().querySelector(":scope > li:nth-of-type(2)").innerText;
    return _gameName;
  }
  var _pageTitleDiv = null;
  function getPageTitleDiv() {
    _pageTitleDiv ||= _pageTitleDiv = document.getElementById("pagetitle");
    return _pageTitleDiv;
  }
  var _featureDiv = null;
  function getFeatureDiv() {
    _featureDiv ||= _featureDiv = document.getElementById("feature");
    return _featureDiv;
  }
  function getModStatsUl() {
    return getPageTitleDiv().querySelector(":scope > ul.stats");
  }
  var _modActionsUl = null;
  function getModActionsUl() {
    _modActionsUl ||= _modActionsUl = getPageTitleDiv().querySelector(":scope > ul.modactions");
    return _modActionsUl;
  }
  function getModActionsComponent() {
    const modActionsUl = getModActionsUl();
    return {
      element: modActionsUl,
      get addMediaLi() {
        return document.getElementById("action-media");
      },
      get trackLi() {
        return modActionsUl.querySelector(":scope > li[id^=action-track]");
      },
      get untrackLi() {
        return modActionsUl.querySelector(":scope > li[id^=action-untrack]");
      },
      get downloadLabelLi() {
        return modActionsUl.querySelector(":scope > li.dllabel");
      },
      get vortexLi() {
        return document.getElementById("action-nmm");
      },
      get manualDownloadLi() {
        return document.getElementById("action-manual");
      }
    };
  }
  var _modName = null;
  function getModName() {
    if (!_modName) {
      const meta = headElement.querySelector(`meta[property="og:title"]`);
      if (meta) {
        _modName = meta.getAttribute("content");
      } else {
        _modName = getBreadcrumbUl().querySelector(":scope > li:last-child").innerText;
      }
    }
    return _modName;
  }
  var _modVersionDiv = null;
  function getModVersionDiv() {
    _modVersionDiv ||= _modVersionDiv = getModStatsUl().querySelector(
      ":scope > li.stat-version > div.statitem > div.stat"
    );
    return _modVersionDiv;
  }
  var _modVersion = null;
  function getModVersion() {
    _modVersion ||= _modVersion = getModVersionDiv().innerText;
    return _modVersion;
  }
  function getFileInfoDiv() {
    return document.getElementById("fileinfo");
  }
  function getModGalleryDiv() {
    return document.getElementById("sidebargallery");
  }
  function getThumbnailGalleryUl() {
    const modGalleryDiv = getModGalleryDiv();
    return modGalleryDiv ? modGalleryDiv.querySelector(":scope > ul.thumbgallery") : null;
  }
  function getThumbnailComponent(thumbnailLi) {
    return {
      element: thumbnailLi,
      get figure() {
        return thumbnailLi.querySelector(":scope > figure");
      },
      get anchor() {
        return this.figure.querySelector(":scope > a");
      },
      get img() {
        return this.anchor.querySelector(":scope > img");
      },
      originalImageSrc: thumbnailLi.getAttribute("data-src"),
      title: thumbnailLi.getAttribute("data-sub-html"),
      src: thumbnailLi.getAttribute(" data-exthumbimage")
    };
  }
  var _modVersionWithDate = null;
  function getModVersionWithDate() {
    if (!_modVersionWithDate) {
      const dateTimeElement = getFileInfoDiv().querySelector(
        ":scope > div.timestamp:nth-of-type(1) > time"
      );
      const date = new Date(Date.parse(dateTimeElement.dateTime));
      _modVersionWithDate = `${getModVersion()}(${date.getFullYear().toString().substring(2)}.${date.getMonth() + 1}.${date.getDate()})`;
    }
    return _modVersionWithDate;
  }
  function getTabsDiv() {
    return getFeaturedBelowDiv().querySelector(":scope > div:nth-of-type(2) > div.tabs");
  }
  var _modTabsUl = null;
  function getModTabsUl() {
    _modTabsUl ||= _modTabsUl = getTabsDiv().querySelector(":scope > ul.modtabs");
    return _modTabsUl;
  }
  var _tabContentDiv = null;
  function getTabContentDiv() {
    return _tabContentDiv ||= _tabContentDiv = bodyElement.querySelector(
      "div.tabcontent.tabcontent-mod-page"
    );
  }
  function getCurrentTab() {
    const modTabsUl = getModTabsUl();
    const tabSpan = modTabsUl.querySelector(":scope > li > a.selected > span.tab-label");
    return tabSpan.innerText.toLowerCase();
  }
  function getTabFromTabLi(tabLi) {
    const tabSpan = tabLi.querySelector(":scope > a[data-target] > span.tab-label");
    return tabSpan.innerText.toLowerCase();
  }
  function clickTabLi(callback) {
    const modTabsUl = getModTabsUl();
    const tabLis = modTabsUl.querySelectorAll(":scope > li[id^=mod-page-tab]");
    for (const tabLi of tabLis) {
      tabLi.addEventListener("click", (event) => {
        callback(getTabFromTabLi(tabLi), event);
      });
    }
  }

  // src/mod_page/files_tab.ts
  function isFilesTab() {
    return getCurrentTab() === "files" && getModFilesDiv() !== null && getArchivedFilesContainerDiv() === null;
  }
  function getModFilesDiv() {
    return document.getElementById("mod_files");
  }
  function getPremiumBannerDiv() {
    const tabContentDiv = getTabContentDiv();
    return tabContentDiv.querySelector("div.premium-banner.container");
  }
  function getAllSortByDivs() {
    const modFilesDiv = getModFilesDiv();
    return modFilesDiv ? modFilesDiv.querySelectorAll("div.file-category-header > div:nth-of-type(1)") : null;
  }
  function getAllFileHeaderDts() {
    const modFilesDiv = getModFilesDiv();
    return modFilesDiv ? modFilesDiv.querySelectorAll("dl.accordion > dt") : null;
  }
  function getAllFileDescriptionDds() {
    const modFilesDiv = getModFilesDiv();
    return modFilesDiv ? modFilesDiv.querySelectorAll("dl.accordion > dd") : null;
  }
  function getDownloadButtonContainerDiv(fileDescriptionDd) {
    return fileDescriptionDd.querySelector("div.tabbed-block:nth-of-type(2)");
  }
  function getFileId(headerDtOrDescriptionDd) {
    return parseInt(headerDtOrDescriptionDd.getAttribute("data-id"));
  }
  function getFileDescriptionDiv(fileDescriptionDd) {
    return fileDescriptionDd.querySelector("div.files-description");
  }
  function getFileDescriptionComponent(fileDescriptionDd) {
    const fileId = getFileId(fileDescriptionDd);
    const fileDescriptionDiv = getFileDescriptionDiv(fileDescriptionDd);
    const downloadButtonContainerDiv = getDownloadButtonContainerDiv(fileDescriptionDd);
    const previewFileDiv = fileDescriptionDd.querySelector("div.tabbed-block:last-child");
    const realFilename = previewFileDiv.querySelector("a").getAttribute("data-url");
    downloadButtonContainerDiv.querySelector("ul > li:last-child > a");
    return {
      fileId,
      fileDescriptionDiv,
      downloadButtonContainerDiv,
      previewFileDiv,
      realFilename
    };
  }
  function getOldFilesComponent() {
    const element = document.getElementById("file-container-old-files");
    if (!element)
      return null;
    const categoryHeaderDiv = element.querySelector(":scope > div.file-category-header");
    return {
      element,
      categoryHeaderDiv,
      get headerH2() {
        return categoryHeaderDiv.querySelector(":scope > h2:first-child");
      },
      get sortByContainerDiv() {
        return categoryHeaderDiv.querySelector(":scope > div:last-child");
      }
    };
  }
  function getFileArchiveSection() {
    return document.getElementById("files-tab-footer");
  }

  // src/mod_page/archived_files_tab.ts
  function isArchivedFilesUrl(url) {
    const searchParams = new URL(url).searchParams;
    return isModUrl(url) && searchParams.get("tab") === "files" && searchParams.get("category") === "archived";
  }
  function getArchivedFilesContainerDiv() {
    return document.getElementById("file-container-archived-files");
  }
  function isArchivedFilesTab() {
    return getCurrentTab() === "files" && getModFilesDiv() !== null && getArchivedFilesContainerDiv() !== null;
  }

  // src/util.ts
  var illegalCharReplacerMapping = {
    "?": "\uFF1F",
    "*": "\uFF0A",
    ":": "\uFF1A",
    "<": "\uFF1C",
    ">": "\uFF1E",
    '"': "\uFF02",
    "/": " \u2215 ",
    "\\": " \u29F5 ",
    "|": "\uFF5C"
  };
  function replaceIllegalChars(pathArg) {
    pathArg = pathArg.trim();
    return pathArg.replace(
      /(\?)|(\*)|(:)|(<)|(>)|(")|(\/)|(\\)|(\|)/g,
      (found) => illegalCharReplacerMapping[found]
    );
  }
  function removeAllChildNodes(node) {
    while (node.hasChildNodes()) {
      node.firstChild.remove();
    }
  }
  function observeDirectChildNodes(targetNode, callback) {
    const observer = new MutationObserver((mutationList) => {
      callback(mutationList, observer);
    });
    observer.observe(targetNode, {
      childList: true,
      attributes: false,
      subtree: false
    });
    return observer;
  }
  function observeAddDirectChildNodes(targetNode, callback) {
    return observeDirectChildNodes(targetNode, (mutationList, observer) => {
      for (let index = 0; index < mutationList.length; index++) {
        const mutation = mutationList[index];
        const isAddNodesMutation = mutation.addedNodes.length > 0;
        if (isAddNodesMutation) {
          callback(mutationList, observer);
          break;
        }
      }
    });
  }

  // src/mod_page/description_tab.ts
  function isDescriptionTab() {
    return getCurrentTab() === "description";
  }
  function getTabDescriptionContainerDiv() {
    return getTabContentDiv().querySelector(
      ":scope > div.container.tab-description"
    );
  }
  function getAboutThisModH2() {
    return document.getElementById("description_tab_h2");
  }
  function getBriefOverview() {
    const tabDescriptionContainerDiv = getTabDescriptionContainerDiv();
    if (!tabDescriptionContainerDiv)
      return null;
    const briefOverviewP = tabDescriptionContainerDiv.querySelector(":scope > p:nth-of-type(1)");
    return briefOverviewP.innerText.trimEnd();
  }
  function getActionsUl() {
    const tabDescriptionContainerDiv = getTabDescriptionContainerDiv();
    return tabDescriptionContainerDiv ? tabDescriptionContainerDiv.querySelector(":scope > ul.actions") : null;
  }
  function getShareButtonAnchor() {
    const tabDescriptionContainerDiv = getTabDescriptionContainerDiv();
    return tabDescriptionContainerDiv ? tabDescriptionContainerDiv.querySelector(":scope > a.button-share") : null;
  }
  function getDescriptionDl() {
    const tabDescriptionContainerDiv = getTabDescriptionContainerDiv();
    return tabDescriptionContainerDiv ? tabDescriptionContainerDiv.querySelector(":scope > div.accordionitems > dl.accordion") : null;
  }
  function getDescriptionDtDdMap() {
    const descriptionDl = getDescriptionDl();
    if (!descriptionDl)
      return null;
    const descriptionDtDdMap = /* @__PURE__ */ new Map();
    const children = descriptionDl.children;
    for (let i = 0; i < children.length; i = i + 2) {
      descriptionDtDdMap.set(children[i], children[i + 1]);
    }
    return descriptionDtDdMap;
  }
  function getModsRequiringThisDiv() {
    const descriptionDtDdMap = getDescriptionDtDdMap();
    if (!descriptionDtDdMap)
      return null;
    for (const [dt, dd] of descriptionDtDdMap) {
      if (dt.innerText.trim().startsWith("Requirements")) {
        const tabbedBlockDivs = dd.querySelectorAll(":scope > div.tabbed-block");
        for (const tabbedBlockDiv of tabbedBlockDivs) {
          const text = tabbedBlockDiv.querySelector(":scope > h3:nth-of-type(1)").innerText;
          if (text === "Mods requiring this file") {
            return tabbedBlockDiv;
          }
        }
      }
    }
    return null;
  }
  function getPermissionDescriptionComponent() {
    const descriptionDtDdMap = getDescriptionDtDdMap();
    if (!descriptionDtDdMap)
      return null;
    for (const [dt, dd] of descriptionDtDdMap) {
      if (dt.innerText.trim().startsWith("Permissions and credits")) {
        const tabbedBlockDivs = dd.querySelectorAll(":scope > div.tabbed-block");
        let permissionDiv = null, authorNotesDiv = null, authorNotesContentP = null, fileCreditsDiv = null, fileCreditsContentP = null, donationDiv = null;
        for (const tabbedBlockDiv of tabbedBlockDivs) {
          const partTitle = tabbedBlockDiv.querySelector(":scope > h3").innerText;
          switch (partTitle) {
            case "Credits and distribution permission": {
              permissionDiv = tabbedBlockDiv;
              break;
            }
            case "Author notes": {
              authorNotesDiv = tabbedBlockDiv;
              authorNotesContentP = authorNotesDiv.querySelector(":scope > p");
              break;
            }
            case "File credits": {
              fileCreditsDiv = tabbedBlockDiv;
              fileCreditsContentP = fileCreditsDiv.querySelector(":scope > p");
              break;
            }
            case "Donation Points system": {
              donationDiv = tabbedBlockDiv;
              break;
            }
          }
        }
        return {
          titleDt: dt,
          descriptionDd: dd,
          permissionDiv,
          authorNotesDiv,
          authorNotesContentP,
          fileCreditsDiv,
          fileCreditsContentP,
          donationDiv
        };
      }
    }
    return null;
  }
  function getModDescriptionContainerDiv() {
    return getTabContentDiv().querySelector(
      ":scope > div.container.mod_description_container"
    );
  }

  // ../../../../Workspaces/@lyne408/userscript_lib/mod.ts
  function setValue(name, value) {
    return GM_setValue(name, value);
  }
  function getValue(name) {
    return GM_getValue(name);
  }
  async function downloadFiles(items, simultaneous, eachSuccess, eachFail) {
    const successes = [];
    const fails = [];
    for (let i = 0; i < items.length; i = i + simultaneous) {
      await Promise.all(
        items.slice(i, i + simultaneous).map((file) => {
          const { url, name } = file;
          return new Promise((resolve) => {
            GM_download({
              url,
              name,
              saveAs: false,
              onload() {
                successes.push(file);
                eachSuccess && eachSuccess(file);
                resolve(0);
              },
              onerror() {
                fails.push(file);
                eachFail && eachFail(file);
                resolve(-1);
              }
            });
          });
        })
      );
    }
    return {
      successes,
      fails
    };
  }

  // src/mod_page/tabs_shared_actions.ts
  function setTabsDivAsTopElement() {
    const modTabsUl = getModTabsUl();
    modTabsUl.style.height = "45px";
    bodyElement.classList.remove("new-head");
    bodyElement.style.margin = "0 auto";
    bodyElement.style.maxWidth = mainContentMaxWidth;
    const tabsDivClone = getTabsDiv().cloneNode(true);
    removeAllChildNodes(bodyElement);
    bodyElement.appendChild(tabsDivClone);
  }
  function createCopyModNameAndVersionComponent() {
    const { actionButton, messageSpan, element } = createActionWithMessageComponent("Copy Mod Name And Version");
    messageSpan.innerText = "Copied";
    actionButton.addEventListener("click", () => {
      navigator.clipboard.writeText(`${getModName()} ${getModVersionWithDate()}`).then(
        () => {
          messageSpan.style.visibility = "visible";
          setTimeout(() => messageSpan.style.visibility = "hidden", 1e3);
        },
        () => console.log("%c[Error] Copy failed.", "color: red")
      );
    });
    return element;
  }
  function tweakTitleInner(currentTab) {
    if (currentTab === "description") {
      let briefOverview = getBriefOverview();
      briefOverview = briefOverview ? briefOverview.replaceAll(/\r\n|\n/g, " ") : "";
      titleElement.innerText = `${getModName()} ${getModVersionWithDate()}: ${briefOverview}`;
    } else {
      titleElement.innerText = `${getModName()} ${getModVersionWithDate()} tab=${currentTab}`;
    }
  }
  function tweakTitleAfterClickingTab() {
    let oldTab = getCurrentTab();
    tweakTitleInner(oldTab);
    clickTabLi(async (clickedTab) => {
      if (oldTab !== clickedTab) {
        if (clickedTab === "description" && getBriefOverview() === null) {
          await clickedTabContentLoaded();
        }
        oldTab = clickedTab;
        tweakTitleInner(clickedTab);
      }
    });
  }
  function hideModActionsSylin527NotUse() {
    const { addMediaLi, downloadLabelLi, vortexLi, manualDownloadLi } = getModActionsComponent();
    addMediaLi && (addMediaLi.style.display = "none");
    downloadLabelLi.style.display = "none";
    manualDownloadLi.style.display = "none";
    vortexLi && (vortexLi.style.display = "none");
  }
  function createShowAllGalleryThumbnailsComponent() {
    const button = createActionComponent("Show All Thumbnails");
    button.addEventListener("click", () => {
      const thumbGalleryUl = getThumbnailGalleryUl();
      thumbGalleryUl.style.height = "max-content";
      thumbGalleryUl.style.width = "auto";
      thumbGalleryUl.style.zIndex = "99999";
      const thumbLis = thumbGalleryUl.querySelectorAll(":scope > li.thumb");
      for (const thumbLi of thumbLis) {
        const component = getThumbnailComponent(thumbLi);
        const { figure, anchor, img } = component;
        thumbLi.style.height = "auto";
        thumbLi.style.width = "auto";
        thumbLi.style.marginBottom = "7px";
        figure.style.height = "auto";
        anchor.style.top = "0";
        anchor.style.transform = "unset";
        img.style.maxHeight = "unset";
      }
    });
    return button;
  }
  function insertCheckboxToThumbnails() {
    const thumbGalleryUl = getThumbnailGalleryUl();
    if (!thumbGalleryUl)
      return null;
    const componentsWithCheckedProperty = [];
    const thumbLis = thumbGalleryUl.querySelectorAll(":scope > li.thumb");
    for (const thumbLi of thumbLis) {
      const component = getThumbnailComponent(thumbLi);
      const { figure } = component;
      const input = document.createElement("input");
      input.setAttribute("type", "checkbox");
      input.setAttribute("style", "position: absolute; top: 4px; right: 4px; width: 20px; height: 20px; cursor: pointer;");
      input.addEventListener("click", (event) => {
        event.stopPropagation();
      }, { capture: true });
      figure.appendChild(input);
      componentsWithCheckedProperty.push(Object.defineProperty(component, "checked", {
        get() {
          return input.checked;
        },
        set(value) {
          input.checked = value;
        }
      }));
    }
    return componentsWithCheckedProperty;
  }
  function createSelectAllImagesComponent(components) {
    const button = createActionComponent("Select All Images");
    button.addEventListener("click", () => {
      for (const component of components) {
        component.checked = true;
      }
    });
    return button;
  }
  function getGalleryTitle() {
    return `_gallery_of_${getModName()} ${getModVersionWithDate()}`;
  }
  function downloadSelectedImages(components, relativeDirectory, eachSuccess, eachFail) {
    const allThumbnailCount = components.length;
    const digits = allThumbnailCount.toString().length;
    const checkedImages = [];
    for (let i = 0; i < allThumbnailCount; i++) {
      const { checked, originalImageSrc, title } = components[i];
      if (checked) {
        const extWithDot = originalImageSrc.substring(originalImageSrc.lastIndexOf("."));
        const num = (i + 1).toString().padStart(digits, "0");
        const name = `${relativeDirectory}/${num}_${replaceIllegalChars(title)}${extWithDot}`;
        checkedImages.push({ url: originalImageSrc, name });
      }
    }
    return downloadFiles(checkedImages, 3, eachSuccess, eachFail);
  }
  function createDownloadSelectedImagesComponent() {
    const fragment = document.createDocumentFragment();
    const { actionButton: downloadButton, messageSpan, element: downloadDiv } = createActionWithMessageComponent(
      "Download Selected Images"
    );
    fragment.append(downloadDiv);
    const modGalleryDiv = getModGalleryDiv();
    const hasGallery = isModUrl(location.href) && modGalleryDiv;
    if (!hasGallery) {
      downloadButton.innerText = "Download Selected Images (Gallery Not Found)";
      downloadButton.style.display = "none";
      return fragment;
    }
    const componentsHasCheckedProperty = insertCheckboxToThumbnails();
    const selectButton = createSelectAllImagesComponent(componentsHasCheckedProperty);
    fragment.insertBefore(selectButton, downloadDiv);
    downloadButton.addEventListener("click", () => {
      messageSpan.style.visibility = "visible";
      const selectedCount = componentsHasCheckedProperty.filter(({ checked }) => checked).length;
      if (selectedCount === 0) {
        messageSpan.innerText === `Selected: 0`;
        return;
      }
      const downloadedCountSpan = document.createElement("span");
      downloadedCountSpan.innerText = "0";
      const failedCountSpan = document.createElement("span");
      failedCountSpan.innerText = "0";
      messageSpan.innerText = "";
      messageSpan.append(
        `Selected: ${selectedCount}`,
        " ",
        "Downloaded: ",
        downloadedCountSpan,
        " ",
        "Failed: ",
        failedCountSpan
      );
      let downloadedCount = 0;
      let failedCount = 0;
      const relativeDirectory = selectedCount <= 3 ? `${getGameName()}/${getModName()} ${getModVersionWithDate()}` : `${getGameName()}/${getGalleryTitle()}`;
      downloadSelectedImages(componentsHasCheckedProperty, relativeDirectory, () => {
        downloadedCount++;
        downloadedCountSpan.innerText = downloadedCount.toString();
        downloadedCount === selectedCount && (messageSpan.innerText = `Done: ${selectedCount}/${selectedCount}`);
      }, () => {
        failedCount++;
        failedCountSpan.innerText = failedCount.toString();
      });
    });
    return fragment;
  }
  function removeFeature() {
    const featureDiv = getFeatureDiv();
    featureDiv?.removeAttribute("style");
    featureDiv?.setAttribute("id", "nofeature");
  }
  function removeModActions() {
    getModActionsUl().remove();
  }
  function removeModGallery() {
    getModGalleryDiv()?.remove();
  }
  function clickedTabContentLoaded() {
    return new Promise((resolve) => {
      observeAddDirectChildNodes(getTabContentDiv(), (mutationList, observer) => {
        console.log("tabContentDiv add childNodes mutationList:", mutationList);
        observer.disconnect();
        resolve(0);
      });
    });
  }
  async function controlComponentDisplayAfterClickingTab(component, isShow) {
    const style = component.style;
    async function _inner(currentTab) {
      ;
      await isShow(currentTab) ? style.display = "block" : style.display = "none";
    }
    await _inner(getCurrentTab());
    clickTabLi(async (clickedTab) => {
      await _inner(clickedTab);
    });
  }

  // src/shared.ts
  function isSylin527() {
    const value = getValue("isSylin527");
    return typeof value === "boolean" ? value : false;
  }

  // src/site_shared_actions.ts
  function setSectionAsTopElement() {
    bodyElement.classList.remove("new-head");
    bodyElement.style.margin = "0 auto";
    bodyElement.style.maxWidth = mainContentMaxWidth;
    const sectionBackup = getSection().cloneNode(true);
    removeAllChildNodes(bodyElement);
    bodyElement.appendChild(sectionBackup);
  }
  function getSpoilerToggleClassName() {
    return "sylin527_show_spoiler_toggle";
  }
  var hasInsertedShowSpoilerToggleStyle = false;
  function insertShowSpoilerToggleStyle() {
    if (hasInsertedShowSpoilerToggleStyle)
      return;
    const newStyle = document.createElement("style");
    headElement.appendChild(newStyle);
    const sheet = newStyle.sheet;
    const showSpoilerToggle = getSpoilerToggleClassName();
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
      background-color: ${primaryColor};
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
      background-color: ${highlightColor};
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
    hasInsertedShowSpoilerToggleStyle = true;
  }
  function showSpoilers(container) {
    insertShowSpoilerToggleStyle();
    const spoilers = container.querySelectorAll("div.bbc_spoiler");
    for (let i = 0; i < spoilers.length; i++) {
      const spoiler = spoilers[i];
      spoiler.querySelector("div.bbc_spoiler_show")?.remove();
      const input = document.createElement("input");
      input.className = getSpoilerToggleClassName();
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
      watchA.style.display = "block";
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
  function simplifyDescriptionContent(contentContainerElement) {
    replaceYoutubeVideosToAnchor(contentContainerElement);
    replaceThumbnailUrlsToImageUrls(contentContainerElement);
    showSpoilers(contentContainerElement);
  }
  function simplifyComment() {
    const commentContainerComponent = getCommentContainerComponent();
    if (!commentContainerComponent)
      return;
    const { headNavDiv, bottomNavDiv, stickyCommentLis, authorCommentLis, otherCommentLis } = commentContainerComponent;
    headNavDiv.remove();
    bottomNavDiv.remove();
    for (const stickyCommentLi of stickyCommentLis) {
      const commentContentTextDiv = getCommentContentTextDiv(stickyCommentLi);
      simplifyDescriptionContent(commentContentTextDiv);
    }
    for (const authorCommentLi of authorCommentLis) {
      const commentContentTextDiv = getCommentContentTextDiv(authorCommentLi);
      simplifyDescriptionContent(commentContentTextDiv);
    }
    otherCommentLis.forEach((nonAuthorCommentLi) => nonAuthorCommentLi.remove());
  }

  // src/mod_page/files_tab_actions.ts
  function addShowRealFilenameToggle() {
    const modFilesDiv = getModFilesDiv();
    if (!modFilesDiv)
      return;
    const input = document.createElement("input");
    input.className = "sylin527_show_toggle";
    input.setAttribute("type", "checkbox");
    input.checked = false;
    const i = document.createElement("i");
    i.className = "sylin527_show_text";
    i.setAttribute("unchecked_text", "Hide Real Filenames");
    i.setAttribute("checked_text", "Show Real Filenames");
    modFilesDiv.insertBefore(i, modFilesDiv.firstChild);
    modFilesDiv.insertBefore(input, modFilesDiv.firstChild);
    const { styleSheets } = document;
    const sheet = styleSheets[styleSheets.length - 1];
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
  input.sylin527_show_toggle ~ i.sylin527_show_text {
    font-style: normal;
    font-size: 18px;
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
    background-color: ${primaryColor};
    content: attr(unchecked_text);
    border-radius: 3px;
  }
  `,
      ++ruleIndex
    );
    sheet.insertRule(
      `
  input.sylin527_show_toggle:hover ~ i.sylin527_show_text::after {
    background-color: ${primaryHoverColor};
  }
  `,
      ++ruleIndex
    );
    sheet.insertRule(
      `
  input.sylin527_show_toggle:checked ~ i.sylin527_show_text::after {
    background-color: ${highlightColor};
    content: attr(checked_text);
  }
  `,
      ++ruleIndex
    );
    sheet.insertRule(
      `
  input.sylin527_show_toggle:hover:checked ~ i.sylin527_show_text::after {
    background-color: ${highlightHoverColor};
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
  function removePremiumBanner() {
    getPremiumBannerDiv()?.remove();
  }
  function removeAllSortBys() {
    const divs = getAllSortByDivs();
    divs && Array.from(divs).forEach((sortByDiv) => sortByDiv.remove());
  }
  function simplifyAllFileHeaders() {
    const fileHeaderDts = getAllFileHeaderDts();
    if (!fileHeaderDts)
      return;
    for (const fileHeaderDt of fileHeaderDts) {
      fileHeaderDt.style.background = "#2d2d2d";
    }
  }
  function getRealFilenameClassName() {
    return "sylin527_real_filename";
  }
  function insertRealFilenamePStyle() {
    const newStyle = document.createElement("style");
    headElement.appendChild(newStyle);
    const sheet = newStyle.sheet;
    sheet?.insertRule(
      `
    p.${getRealFilenameClassName()} {
      color: #8197ec;
      margin-top: 20xp;
    }
    `,
      0
    );
  }
  function createRealFilenameP(realFilename, fileUrl) {
    const realFilenameP = document.createElement("p");
    realFilenameP.className = getRealFilenameClassName();
    const newFileUrlAnchor = document.createElement("a");
    newFileUrlAnchor.href = fileUrl;
    newFileUrlAnchor.innerText = realFilename;
    realFilenameP.appendChild(newFileUrlAnchor);
    return realFilenameP;
  }
  function simplifyAllFileDescriptions() {
    const fileDescriptionDds = getAllFileDescriptionDds();
    if (!fileDescriptionDds)
      return;
    insertRealFilenamePStyle();
    const gameDomainName = getGameDomainName();
    const modId = getModId();
    for (const fileDescriptionDd of fileDescriptionDds) {
      const { fileDescriptionDiv, downloadButtonContainerDiv, previewFileDiv, realFilename, fileId } = getFileDescriptionComponent(fileDescriptionDd);
      simplifyDescriptionContent(fileDescriptionDiv);
      downloadButtonContainerDiv.remove();
      fileDescriptionDiv.append(createRealFilenameP(realFilename, generateFileUrl(gameDomainName, modId, fileId)));
      previewFileDiv.remove();
      fileDescriptionDd.style.display = "block";
    }
    addShowRealFilenameToggle();
  }
  function insertRemoveOldFilesComponent() {
    const oldFilesComponent = getOldFilesComponent();
    if (!oldFilesComponent)
      return null;
    const removeButton = document.createElement("button");
    removeButton.className = "btn inline-flex";
    removeButton.style.textTransform = "unset";
    removeButton.style.verticalAlign = "super";
    removeButton.style.borderRadius = "3px";
    removeButton.innerText = "Remove";
    overPrimaryComponent(removeButton);
    const { element, categoryHeaderDiv, sortByContainerDiv } = oldFilesComponent;
    categoryHeaderDiv.insertBefore(removeButton, sortByContainerDiv);
    categoryHeaderDiv.insertBefore(document.createTextNode(" "), removeButton);
    removeButton.addEventListener("click", () => {
      element.remove();
    });
  }
  function simplifyFilesTab() {
    removePremiumBanner();
    removeAllSortBys();
    simplifyAllFileHeaders();
    simplifyAllFileDescriptions();
    getFileArchiveSection()?.remove();
    containerManager.hideAll();
    setTabsDivAsTopElement();
  }
  function createSimplifyFilesTabComponent() {
    const button = createActionComponent("Simplify Files Tab");
    button.addEventListener("click", () => {
      simplifyFilesTab();
    });
    isFilesTab() ? insertRemoveOldFilesComponent() : button.style.display = "none";
    controlComponentDisplayAfterClickingTab(
      button,
      async (clickedTab) => {
        const bFilesTab = clickedTab === "files" && await clickedTabContentLoaded() === 0 && isFilesTab();
        bFilesTab && insertRemoveOldFilesComponent();
        return bFilesTab;
      }
    );
    return button;
  }

  // src/mod_page/archived_files_tab_actions.ts
  function getApiKey() {
    return getValue("apikey");
  }
  async function getArchivedFileIdRealFilenameMap(gameDomainName, modId) {
    const apiKey = getApiKey();
    if (!apiKey || apiKey === "")
      return null;
    const resultJson = await getFiles(gameDomainName, modId, apiKey);
    const { files } = resultJson;
    const map = /* @__PURE__ */ new Map();
    for (const { file_id, category_id, file_name } of files) {
      category_id === 7 && map.set(file_id, file_name);
    }
    return map;
  }
  async function simplifyAllFileDescriptions2() {
    const fileDescriptionDds = getAllFileDescriptionDds();
    if (!fileDescriptionDds)
      return;
    insertRealFilenamePStyle();
    const gameDomainName = getGameDomainName();
    const modId = getModId();
    const oldFileIdRealFilenameMap = await getArchivedFileIdRealFilenameMap(gameDomainName, modId);
    for (const fileDescriptionDd of fileDescriptionDds) {
      const fileDescriptionDiv = getFileDescriptionDiv(fileDescriptionDd);
      simplifyDescriptionContent(fileDescriptionDiv);
      getDownloadButtonContainerDiv(fileDescriptionDd).remove();
      const fileId = getFileId(fileDescriptionDd);
      const realFilename = oldFileIdRealFilenameMap ? oldFileIdRealFilenameMap.get(fileId) : "File Link";
      fileDescriptionDiv.append(createRealFilenameP(realFilename, generateFileUrl(gameDomainName, modId, fileId)));
      fileDescriptionDd.style.display = "block";
    }
    addShowRealFilenameToggle();
  }
  function tweakTitleIfArchivedFilesTab() {
    isArchivedFilesUrl(location.href) && (titleElement.innerText = `${getModName()} ${getModVersionWithDate()} tab=archived_files`);
  }
  function createSimplifyArchivedFilesTabComponent() {
    const button = createActionComponent("Simplify Archived Files Tab");
    button.addEventListener("click", async () => {
      removePremiumBanner();
      removeAllSortBys();
      simplifyAllFileHeaders();
      await simplifyAllFileDescriptions2();
      containerManager.hideAll();
      setTabsDivAsTopElement();
    });
    !isArchivedFilesTab() && (button.style.display = "none");
    controlComponentDisplayAfterClickingTab(
      button,
      async (clickedTab) => clickedTab === "files" && await clickedTabContentLoaded() === 0 && isArchivedFilesTab()
    );
    return button;
  }

  // src/mod_page/article_page.ts
  function getArticleUrlRegExp() {
    return /^((https|http):\/\/(www.)?nexusmods.com\/[a-z0-9]+\/articles\/[0-9]+)/;
  }
  function isArticleUrl(url) {
    return getArticleUrlRegExp().test(url);
  }
  function getArticleContainerDiv() {
    return getSection().querySelector("div.container");
  }
  function getArticleElement() {
    return getArticleContainerDiv().querySelector(":scope > article");
  }
  function getArticleTitle() {
    return getPageTitleDiv().querySelector(":scope > h1").innerText;
  }
  function getCommentContainerDiv() {
    return document.getElementById("comment-container");
  }

  // src/mod_page/article_page_actions.ts
  function simplifyArticlePage() {
    simplifyDescriptionContent(getArticleElement());
    titleElement.innerText = getArticleTitle();
    getModActionsUl().remove();
    getCommentContainerDiv()?.remove();
    setSectionAsTopElement();
  }
  function createSimplifyArticlePageComponent() {
    const button = createActionComponent("Simplify Article Page");
    button.addEventListener("click", () => {
      simplifyArticlePage();
      containerManager.hideAll();
    });
    return button;
  }

  // src/mod_page/description_tab_actions.ts
  function showAllDescriptionDds() {
    const dtDdMap = getDescriptionDtDdMap();
    if (!dtDdMap || dtDdMap.size === 0)
      return;
    const newStyle = document.createElement("style");
    headElement.appendChild(newStyle);
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
    for (const [dt, dd] of dtDdMap) {
      dt.style.background = "#2d2d2d";
      dd.style.display = "block";
      dd.removeAttribute("style");
      const newPar = document.createElement("div");
      const toggle = document.createElement("input");
      toggle.setAttribute("class", accordionToggle);
      toggle.setAttribute("type", "checkbox");
      dd.parentElement.insertBefore(toggle, dd);
      newPar.append(dt, toggle, dd);
      getDescriptionDl()?.append(newPar);
    }
  }
  function simplifyTabDescription() {
    getAboutThisModH2()?.remove();
    getActionsUl()?.remove();
    getShareButtonAnchor()?.remove();
    const descriptionDl = getDescriptionDl();
    if (descriptionDl) {
      getModsRequiringThisDiv()?.remove();
      const permissionDescriptionComponent = getPermissionDescriptionComponent();
      if (permissionDescriptionComponent) {
        const { authorNotesContentP, fileCreditsContentP } = permissionDescriptionComponent;
        authorNotesContentP && simplifyDescriptionContent(authorNotesContentP);
        fileCreditsContentP && simplifyDescriptionContent(fileCreditsContentP);
      }
      showAllDescriptionDds();
    }
  }
  function simplifyModDescription() {
    const modDescriptionContainerDiv = getModDescriptionContainerDiv();
    if (modDescriptionContainerDiv) {
      simplifyDescriptionContent(modDescriptionContainerDiv);
    }
  }
  function setLocationToModUrlIfDescriptionTab() {
    const modUrl = generateModUrl(getGameDomainName(), getModId());
    getCurrentTab() === "description" && history.replaceState(null, "", modUrl);
    clickTabLi(async (clickedTab) => {
      clickedTab === "description" && await clickedTabContentLoaded() === 0 && history.replaceState(null, "", modUrl);
    });
  }

  // src/mod_page/file_tab.ts
  function isFileUrl(url) {
    const searchParams = new URL(url).searchParams;
    return isModUrl(url) && searchParams.get("tab") === "files" && searchParams.has("file_id");
  }
  function getFileIdFromUrl(url) {
    const fileId = new URL(url).searchParams.get("file_id");
    return fileId ? parseInt(fileId) : null;
  }

  // src/mod_page/file_tab_actions.ts
  function tweakTitleIfFileTab() {
    isFileUrl(location.href) && (titleElement.innerText = `${getModName()} ${getModVersionWithDate()} file=${getFileIdFromUrl(location.href)}`);
  }

  // src/mod_page/forum_tab.ts
  function getModTopicsDiv() {
    return document.getElementById("tab-modtopics");
  }
  function getTopicsTabH2() {
    return document.getElementById("topics_tab_h2");
  }
  function isForumTab() {
    return getCurrentTab() === "forum" && getTopicsTabH2() !== null;
  }
  function getTopicTable() {
    return document.getElementById("mod_forum_topics");
  }
  function getAllTopicAnchors() {
    const topicTable = getTopicTable();
    if (!topicTable)
      return null;
    const topicAnchorsOfTHead = topicTable.tHead.querySelectorAll(
      ":scope > tr > td.table-topic > a.go-to-topic"
    );
    const topicAnchorsOfTBody = topicTable.tBodies[0].querySelectorAll(
      ":scope > tr > td.table-topic > a.go-to-topic"
    );
    return Array.from(topicAnchorsOfTHead).concat(Array.from(topicAnchorsOfTBody));
  }
  function clickTopicAnchor(callback) {
    const allTopicAnchors = getAllTopicAnchors();
    if (allTopicAnchors) {
      for (const topicAnchor of allTopicAnchors) {
        topicAnchor.addEventListener("click", (event) => {
          callback(topicAnchor, event);
        });
      }
    }
  }

  // src/mod_page/forum_topic_tab.ts
  function isForumTopicTab() {
    return getCurrentTab() === "forum" && getTopicsTabH2() === null;
  }

  // src/mod_page/forum_tab_actions.ts
  function modTopicsDivAddedDirectChildNodes() {
    return new Promise((resolve) => {
      observeAddDirectChildNodes(getModTopicsDiv(), (mutationList, observer) => {
        console.log("modTopicsDiv add childNodes mutationList:", mutationList);
        observer.disconnect();
        resolve(0);
      });
    });
  }

  // src/mod_page/posts_tab.ts
  function isPostsTab() {
    return getCurrentTab() === "posts";
  }

  // src/mod_page/posts_tab_actions.ts
  function hasStickyOrAuthorComments() {
    const commentContainerComponent = getCommentContainerComponent();
    if (!commentContainerComponent)
      return false;
    const { authorCommentLis, stickyCommentLis } = commentContainerComponent;
    return authorCommentLis.length + stickyCommentLis.length > 0;
  }
  function createSimplifyPostsTabComponent() {
    const button = createActionComponent("Simplify Posts Tab");
    button.addEventListener("click", () => {
      simplifyComment();
      containerManager.hideAll();
      setTabsDivAsTopElement();
    });
    (!isPostsTab() || isPostsTab() && !hasStickyOrAuthorComments()) && (button.style.display = "none");
    controlComponentDisplayAfterClickingTab(
      button,
      async (clickedTab) => clickedTab === "posts" && await clickedTabContentLoaded() === 0 && hasStickyOrAuthorComments()
    );
    return button;
  }

  // src/mod_page/forum_topic_tab_actions.ts
  function createSimplifyForumTopicTabComponent() {
    const button = createActionComponent("Simplify Forum Topic Tab");
    button.addEventListener("click", () => {
      simplifyComment();
      containerManager.hideAll();
      setTabsDivAsTopElement();
    });
    (!isForumTopicTab() || isForumTopicTab() && !hasStickyOrAuthorComments()) && (button.style.display = "none");
    function _addClickTopicAnchorEvent() {
      clickTopicAnchor(async () => {
        await modTopicsDivAddedDirectChildNodes();
        isForumTopicTab() && hasStickyOrAuthorComments() && (button.style.display = "block");
      });
    }
    isForumTab() && _addClickTopicAnchorEvent();
    clickTabLi(async (clickedTab) => {
      button.style.display = "none";
      clickedTab === "forum" && await clickedTabContentLoaded() === 0 && isForumTab() && _addClickTopicAnchorEvent();
    });
    return button;
  }

  // src/mod_page/mod_page_actions.ts
  function simplifyModPage() {
    removeFeature();
    removeModActions();
    removeModGallery();
    simplifyTabDescription();
    simplifyModDescription();
    titleElement.innerText = `${getModName()} ${getModVersionWithDate()}`;
    containerManager.hideAll();
    setSectionAsTopElement();
  }
  function createSimplifyModPageComponent() {
    const button = createActionComponent("Simplify Mod Page");
    button.addEventListener("click", () => {
      simplifyModPage();
    });
    !isDescriptionTab() && (button.style.display = "none");
    let isNewPage = true;
    controlComponentDisplayAfterClickingTab(button, async (clickedTab) => {
      if (isNewPage) {
        isNewPage = false;
        return clickedTab === "description";
      } else {
        return clickedTab === "description" && await clickedTabContentLoaded() === 0;
      }
    });
    return button;
  }

  // src/userscripts/mod_documentation_utility/userscript.main.ts
  function initStorage() {
    const apiKey = getApiKey();
    !apiKey && setValue("apikey", "");
  }
  function initModDocumentationUtility() {
    initStorage();
    const href = location.href;
    const actionContainer = insertActionContainer();
    if (isModUrl(href)) {
      tweakTitleAfterClickingTab();
      setLocationToModUrlIfDescriptionTab();
      actionContainer.append(createCopyModNameAndVersionComponent(), createShowAllGalleryThumbnailsComponent());
      if (isSylin527()) {
        actionContainer.appendChild(createDownloadSelectedImagesComponent());
        hideModActionsSylin527NotUse();
      }
      actionContainer.append(
        createSimplifyModPageComponent(),
        createSimplifyFilesTabComponent(),
        createSimplifyArchivedFilesTabComponent(),
        createSimplifyPostsTabComponent(),
        createSimplifyForumTopicTabComponent()
      );
      tweakTitleIfFileTab();
      tweakTitleIfArchivedFilesTab();
    } else if (isArticleUrl(href)) {
      actionContainer.appendChild(createSimplifyArticlePageComponent());
    }
  }
  function main() {
    initModDocumentationUtility();
    const scriptInfo = "Load userscript: sylin527's Mod Documentations Utility";
    console.log("%c [Info] " + scriptInfo, "color: green");
    console.log("%c [Info] URL: " + location.href, "color: green");
  }
  main();
})();
