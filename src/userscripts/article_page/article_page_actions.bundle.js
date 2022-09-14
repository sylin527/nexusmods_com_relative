// ==UserScript==
// @name         [sylin527] nexusmods.com Simplify Article Page for Saving
// @namespace    https://www.nexusmods.com/
// @version      1.0.1.2022.9.10
// @description  Simplify Article Page for Saving
// @author       sylin527
// @include      https://www.nexusmods.com/*/articles/*
// @icon         https://www.nexusmods.com/favicon.ico
// @grant        window.onurlchange
// @license      GPLv3
// @run-at       document-idle
// ==/UserScript==
(() => {
  // ../shared.ts
  var body = document.body;
  function setSectionAsTopElement() {
    const section = document.getElementById("section");
    body.classList.remove("new-head");
    body.style.margin = "0 auto";
    body.style.maxWidth = "1300px";
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

  // ../ui.ts
  var createUIRootElement = function() {
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
    return entryElem;
  };
  var hideSylin527Ui = function() {
    const roots = document.querySelectorAll("div[id^=sylin527]");
    for (let i = 0; i < roots.length; i++) {
      roots[i].style.display = "none";
    }
  };

  // article_page_actions.ts
  var { head, body: body2 } = document;
  function simplifyArticlePage() {
    const section = document.getElementById("section");
    showSpoilers(section);
    replaceYoutubeVideosToAnchor(section);
    const pageTitle = document.getElementById("pagetitle");
    const titleH1 = pageTitle.querySelector("h1");
    head.querySelector("title").innerText = titleH1.innerText;
    pageTitle.querySelector("ul.modactions")?.remove();
    document.getElementById("comment-container")?.remove();
    setSectionAsTopElement();
  }
  var createEntryElement = function(uiRootElement) {
    const button = document.createElement("button");
    button.setAttribute("id", "simplifyArticlePage");
    button.innerText = "Simplify Article Page";
    uiRootElement.appendChild(button);
    return button;
  };
  function bindEvent() {
    const uiRootElem = createUIRootElement();
    body2.appendChild(uiRootElem);
    const entryElem = createEntryElement(uiRootElem);
    entryElem.addEventListener("click", () => {
      simplifyArticlePage();
      hideSylin527Ui();
    });
  }
  function main() {
    bindEvent();
    const scriptInfo = "Load userscript: [sylin527] nexusmods.com Simplify Article Page for Saving";
    console.log("%c [Info] " + scriptInfo, "color: green");
  }
  main();
})();
