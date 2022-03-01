// ==UserScript==
// @name         [sylin527] nexusmods.com Simplify mod pages
// @namespace    https://www.nexusmods.com/
// @version      1.0
// @description  Simplify mod pages for saving by SingleFileZ or SingleFile. Remove unnecessary UI. After saving, you can show/hide details of "Requirements", "Donations", etc.
// @author       sylin527
// @include      https://www.nexusmods.com/*/mods/*
// @icon         https://www.nexusmods.com/favicon.ico
// @grant        window.onurlchange
// @license      GPLv3
// @run-at       document-idle
// ==/UserScript==
;(function(){
// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const MOD_NAME_SELECTOR = 'head>meta[property="og:title"]';
const HEADER_SELECTOR = 'header#head';
const MAIN_CONTENT_SELECTOR = 'div#mainContent';
const MOD_INFO_CONTAINER_SELECTOR = 'section#section';
const GALLERY_CONTAINER_SELECTOR = 'div#sidebargallery';
const MOD_VERSION_SELECTOR = 'div#pagetitle>ul.stats.clearfix>li.stat-version>div.statitem>div.stat';
const MOD_ACTIONS_SELECTOR = 'div#pagetitle>ul.modactions';
const MODTABS_SELECTOR = '#section div.tabs ul.modtabs';
const FOOTER_SELECTOR = 'footer#rj-footer';
const MOD_PAGE_URL_REGEXP = /(?<schema>(https|http):\/\/)(?<domain>(www.)?nexusmods.com)\/\w+\/mods\/([0-9]+(\/)?(\?)?(tab=description)?)$/;
const modInfoContainer = document.querySelector(MOD_INFO_CONTAINER_SELECTOR);
function getModName() {
    return document.querySelector(MOD_NAME_SELECTOR).getAttribute('content');
}
function getModVersion() {
    return document.querySelector(MOD_VERSION_SELECTOR).innerText;
}
function removeFeature() {
    if (null === modInfoContainer) return;
    const featureDiv = modInfoContainer.querySelector('#feature');
    featureDiv?.removeAttribute('style');
    featureDiv?.setAttribute('id', 'nofeature');
}
function removeModActions() {
    document.querySelector(MOD_ACTIONS_SELECTOR)?.remove();
}
function removeModGallery() {
    if (null === modInfoContainer) return;
    modInfoContainer.querySelector(GALLERY_CONTAINER_SELECTOR)?.remove();
}
function setModInfoContainerAsTopElement() {
    if (null === modInfoContainer) return;
    const body = document.querySelector('body');
    if (null !== body) {
        modInfoContainer.style.maxWidth = '1300px';
        modInfoContainer.style.margin = '0 auto';
        body.style.marginTop = '0';
        body.insertBefore(modInfoContainer, body.firstChild);
        document.querySelector(HEADER_SELECTOR)?.remove();
        document.querySelector(MAIN_CONTENT_SELECTOR)?.remove();
        document.querySelector(FOOTER_SELECTOR)?.remove();
        const scripts = document.querySelectorAll('script');
        for(let i = 0; i < scripts.length; i++){
            scripts[i].remove();
        }
        const noscripts = document.querySelectorAll('noscript');
        for(let i1 = 0; i1 < noscripts.length; i1++){
            noscripts[i1].remove();
        }
    }
}
function whenClickModTabs(handler) {
    document.querySelector(MODTABS_SELECTOR)?.addEventListener('click', (event)=>{
        handler(event);
    });
}
function isModPage(url) {
    return MOD_PAGE_URL_REGEXP.test(url);
}
function delay(ms) {
    return new Promise((resolve)=>setTimeout(resolve, ms)
    );
}
const TAB_DESCRIPTION_CONTAINER_SELECTOR = 'div.container.tab-description';
const ABOUT_THIS_MOD_RELATIVE_SELECTOR = 'h2#description_tab_h2';
const DOWNLOADED_OR_NOT_RELATIVE_SELECTOR = 'div.modhistory';
const REPORT_ABUSE_RELATIVE_SELECTOR = 'ul.actions';
const SHARE_BUTTON_RELATIVE_SELECTOR = 'a.btn.inline-flex.button-share';
const ACCORDION_RELATIVE_SELECTOR = 'dl.accordion';
const MOD_DESCRIPTION_CONTAINER_SELECTOR = 'div.container.mod_description_container';
let tabDescContainer;
function getTabDescContainer() {
    return tabDescContainer ? tabDescContainer : document.querySelector(TAB_DESCRIPTION_CONTAINER_SELECTOR);
}
function removeModsRequiringThis(accordion) {
    const firstDt = accordion.querySelector('dt:nth-of-type(1)');
    const hasRequirementsDt = firstDt?.innerText.trim().startsWith('Requirements');
    if (hasRequirementsDt) {
        const divs = accordion.querySelectorAll('dd:nth-of-type(1)>div.tabbed-block');
        if (divs) for(let i = 0; i < divs.length; i++){
            const text = divs[i].querySelector('h3:nth-of-type(1)').innerText;
            if (text === 'Mods requiring this file') divs[i].remove();
        }
    }
}
function showAllAccordionDds(accordion) {
    const dts = accordion.querySelectorAll('dt');
    if (dts.length === 0) return;
    const dds = accordion.querySelectorAll('dd');
    const newStyle = document.createElement('style');
    document.head.appendChild(newStyle);
    const sheet = newStyle.sheet;
    sheet?.insertRule(`
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
    sheet?.insertRule(`
input.sylin527_show_toggle:checked ~ dd{
  display: none;
}
  `);
    for(let i = 0; i < dts.length; i++){
        dts[i].style.background = '#2d2d2d';
        dds[i].style.display = 'block';
        dds[i].removeAttribute('style');
        const newPar = document.createElement('div');
        const toggle = document.createElement('input');
        toggle.setAttribute('class', 'sylin527_show_toggle');
        toggle.setAttribute('type', 'checkbox');
        dds[i].parentElement.insertBefore(toggle, dds[i]);
        newPar.append(dts[i], toggle, dds[i]);
        accordion.append(newPar);
    }
}
function simplifyTabDescription() {
    tabDescContainer = getTabDescContainer();
    const tdc = tabDescContainer;
    tdc.querySelector(ABOUT_THIS_MOD_RELATIVE_SELECTOR)?.remove();
    tdc.querySelector(DOWNLOADED_OR_NOT_RELATIVE_SELECTOR)?.remove();
    tdc.querySelector(REPORT_ABUSE_RELATIVE_SELECTOR)?.remove();
    tdc.querySelector(SHARE_BUTTON_RELATIVE_SELECTOR)?.remove();
    const accordion = tdc.querySelector(ACCORDION_RELATIVE_SELECTOR);
    if (accordion) {
        removeModsRequiringThis(accordion);
        showAllAccordionDds(accordion);
    }
}
let modDescContainer;
function getModDescContainer() {
    return modDescContainer ? modDescContainer : document.querySelector(MOD_DESCRIPTION_CONTAINER_SELECTOR);
}
function showSpoilers() {
    modDescContainer = getModDescContainer();
    const contentDivs = modDescContainer.querySelectorAll('div.bbc_spoiler>div:nth-of-type(2)');
    for(let i = 0; i < contentDivs.length; i++){
        contentDivs[i].style.display = 'block';
    }
}
function replaceYoutubeVideosToUrls() {
    modDescContainer = getModDescContainer();
    const youtubeIframes = modDescContainer.querySelectorAll('iframe.youtube_video');
    if (youtubeIframes.length === 0) return;
    for(let i = 0; i < youtubeIframes.length; i++){
        const embedUrl = youtubeIframes[i].getAttribute('src');
        const parts = embedUrl.split('/');
        const videoId = parts[parts.length - 1];
        const watchA = document.createElement('a');
        const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
        watchA.setAttribute('href', watchUrl);
        watchA.innerText = watchUrl;
        const parent = youtubeIframes[i].parentNode;
        const grandparent = parent.parentNode;
        grandparent && grandparent.replaceChild(watchA, parent);
    }
}
const createUIRootElement = function() {
    const sylin527UiContainer = '#sylin527UiContainer';
    let entryElem1 = document.querySelector(sylin527UiContainer);
    if (null === entryElem1) {
        entryElem1 = document.createElement('div');
        entryElem1.setAttribute('id', 'sylin527UiContainer');
        const newStyle = document.createElement('style');
        document.head.appendChild(newStyle);
        const sheet = newStyle.sheet;
        sheet?.insertRule(`
      #sylin527UiContainer {
        display: block;
        position: fixed;
        right: 5px;
        top: 56px;
        font-size: 13px;
        font-weight: 400;
        max-width: 200px;
        background: transparent;
      }
      `, 0);
        sheet?.insertRule(`#sylin527UiContainer > a, #sylin527UiContainer > button {
        display: none;
        padding: 8px;
        cursor: pointer;
        background: #2093a6;
        border-radius: 3px;
        border: 1px solid #808080;
        color: #eaeaea;
        float: right;
        margin-top: 5px;
      }
      `, 0);
        document.createElement('body').append(entryElem1);
    }
    return entryElem1;
};
function tweakTitleText() {
    const title = document.querySelector('title');
    title.innerText = `${getModName()} ${getModVersion()}`;
}
const uiRootElem = createUIRootElement();
const createEntryElement = function(uiRootElement) {
    const entryElemId = 'simplifyModPage';
    const button = document.createElement('button');
    button.setAttribute('id', entryElemId);
    button.innerText = 'Simplify Mod Page';
    uiRootElement.appendChild(button);
    return button;
};
const entryElem = createEntryElement(uiRootElem);
let oldUrl = window.location.href;
const checkUrl = async function() {
    await delay(500);
    const style = entryElem.style;
    function checkTab(url) {
        if (isModPage(url)) {
            style.display = 'block';
        } else {
            style.display = 'none';
        }
    }
    checkTab(oldUrl);
    whenClickModTabs(async ()=>{
        await delay(500);
        const newUrl = window.location.href;
        if (oldUrl !== newUrl) {
            checkTab(newUrl);
        }
        oldUrl = newUrl;
    });
};
const simplifyModPage = function() {
    entryElem.addEventListener('click', ()=>{
        tweakTitleText();
        removeFeature();
        removeModActions();
        removeModGallery();
        simplifyTabDescription();
        showSpoilers();
        replaceYoutubeVideosToUrls();
        setModInfoContainerAsTopElement();
        uiRootElem.remove();
    });
    checkUrl();
};
function main() {
    simplifyModPage();
    const scriptInfo = 'Load userscript: [sylin527] nexusmods.com Simplify mod pages';
    console.log('%c [Info] ' + scriptInfo, 'color: green');
}
main();

})()
