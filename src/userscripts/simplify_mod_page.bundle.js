// ==UserScript==
// @name         [sylin527] nexusmods.com Simplify mod pages
// @namespace    https://www.nexusmods.com/
// @version      1.3
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

const modNameSelector = 'head>meta[property="og:title"]';
const headerSelector = 'header#head';
const mainContentSelector = 'div#mainContent';
const modInfoContainerSelector = 'section#section';
const galleryContainerSelector = 'div#sidebargallery';
const modVersionSelector = 'div#pagetitle>ul.stats.clearfix>li.stat-version>div.statitem>div.stat';
const modActionsSelector = 'div#pagetitle>ul.modactions';
const modtabsSelector = '#section div.tabs ul.modtabs';
const footerSelector = 'footer#rj-footer';
const modPageUrlRegexp = /((https|http):\/\/)((www.)?nexusmods.com)\/\w+\/mods\/([0-9]+(\/)?(\?)?(tab=description)?)$/;
const modInfoContainer = document.querySelector(modInfoContainerSelector);
function getModName() {
    return document.querySelector(modNameSelector).getAttribute('content');
}
function getModVersion() {
    return document.querySelector(modVersionSelector).innerText;
}
function removeFeature() {
    if (null === modInfoContainer) return;
    const featureDiv = modInfoContainer.querySelector('#feature');
    featureDiv?.removeAttribute('style');
    featureDiv?.setAttribute('id', 'nofeature');
}
function removeModActions() {
    document.querySelector(modActionsSelector)?.remove();
}
function removeModGallery() {
    if (null === modInfoContainer) return;
    modInfoContainer.querySelector(galleryContainerSelector)?.remove();
}
function setModInfoContainerAsTopElement() {
    if (null === modInfoContainer) return;
    const body = document.querySelector('body');
    if (null !== body) {
        modInfoContainer.style.maxWidth = '1300px';
        modInfoContainer.style.margin = '0 auto';
        body.style.marginTop = '0';
        body.insertBefore(modInfoContainer, body.firstChild);
        document.querySelector(headerSelector)?.remove();
        document.querySelector(mainContentSelector)?.remove();
        document.querySelector(footerSelector)?.remove();
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
    document.querySelector(modtabsSelector)?.addEventListener('click', (event)=>{
        handler(event);
    });
}
function isModPage(url) {
    return modPageUrlRegexp.test(url);
}
function delay(ms) {
    return new Promise((resolve)=>setTimeout(resolve, ms)
    );
}
const tabDescriptionContainerSelector = 'div.container.tab-description';
const aboutThisModRelativeSelector = 'h2#description_tab_h2';
const downloadedOrNotRelativeSelector = 'div.modhistory';
const reportAbuseRelativeSelector = 'ul.actions';
const shareButtonRelativeSelector = 'a.btn.inline-flex.button-share';
const accordionRelativeSelector = 'dl.accordion';
const modDescriptionContainerSelector = 'div.container.mod_description_container';
let tabDescContainer = null;
function getTabDescContainer() {
    return tabDescContainer ? tabDescContainer : document.querySelector(tabDescriptionContainerSelector);
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
    tdc.querySelector(aboutThisModRelativeSelector)?.remove();
    tdc.querySelector(downloadedOrNotRelativeSelector)?.remove();
    tdc.querySelector(reportAbuseRelativeSelector)?.remove();
    tdc.querySelector(shareButtonRelativeSelector)?.remove();
    const accordion = tdc.querySelector(accordionRelativeSelector);
    if (accordion) {
        removeModsRequiringThis(accordion);
        showAllAccordionDds(accordion);
    }
}
let modDescContainer = null;
function getModDescContainer() {
    if (null === modDescContainer) {
        modDescContainer = document.querySelector(modDescriptionContainerSelector);
    }
    return modDescContainer;
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
      }
      `);
        sheet.insertRule(`#sylin527UiContainer > a, #sylin527UiContainer > button {
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
      `, ++ruleIndex);
        document.createElement('body').append(entryElem1);
    }
    return entryElem1;
};
const removeSylin527Ui = function() {
    const roots = document.querySelectorAll('div[id^=sylin527]');
    for(let i = 0; i < roots.length; i++){
        roots[i].remove();
    }
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
const checkUrl = function() {
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
        removeSylin527Ui();
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
