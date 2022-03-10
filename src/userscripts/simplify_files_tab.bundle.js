// ==UserScript==
// @name         [sylin527] nexusmods.com Simplify files tab
// @namespace    https://www.nexusmods.com/
// @version      1.3
// @description  Simplify files tab for saving by SingleFileZ or SingleFile. Remove unnecessary UI, show all file description, etc. After saving, you can show/hide the real filenames. Recommend to instanll "[sylin527] nexusmods.com Tweak page title" to get more detailed page title.
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

const headerSelector = 'header#head';
const mainContentSelector = 'div#mainContent';
const modInfoContainerSelector = 'section#section';
const modtabsSelector = '#section div.tabs ul.modtabs';
const footerSelector = 'footer#rj-footer';
document.querySelector(modInfoContainerSelector);
function whenClickModTabs(handler) {
    document.querySelector(modtabsSelector)?.addEventListener('click', (event)=>{
        handler(event);
    });
}
const filesTabSelector = 'div.tabcontent.tabcontent-mod-page';
const premiumBannerSelector = `${filesTabSelector} div.premium-banner.container`;
const modFilesSelector = 'div#mod_files';
`${modFilesSelector} div.file-category-header>div:nth-of-type(1)`;
const sortByRelativeSelector = `div.file-category-header>div:nth-of-type(1)`;
const fileDtRelativeSelector = 'dl.accordion>dt';
const downloadedIconRelativeSelector = 'div>i.material-icons';
const dateDownloadedRelativeSelector = 'div>div.file-download-stats>ul>li.stat-downloaded';
const toggleFileDdRelativeSelector = 'div>div.acc-status';
const fileDdRelativeSelector = 'dl.accordion>dd';
const fileDescriptionRelativeSelector = 'div.tabbed-block:nth-of-type(1)';
const downloadButtonsContainerRelativeSelector = `div.tabbed-block:nth-of-type(2)`;
const previewFileRelativeSelector = 'div.tabbed-block:last-child';
const filesTabUrlRegexp = /((https|http):\/\/)((www.)?nexusmods.com)\/\w+\/mods\/[0-9]+(\?tab=files)$/;
let modFilesElem = null;
const getmodFilesElement = function() {
    if (null === modFilesElem) {
        modFilesElem = document.querySelector(modFilesSelector);
    }
    return modFilesElem;
};
const removePremiumBanner = function() {
    document.querySelector(premiumBannerSelector)?.remove();
};
const removeAllSortBys = function() {
    modFilesElem = getmodFilesElement();
    const arrayLike = modFilesElem.querySelectorAll(sortByRelativeSelector);
    for(let i = 0; i < arrayLike.length; i++){
        arrayLike[i].remove();
    }
};
const simplifyFileDts = function() {
    modFilesElem = getmodFilesElement();
    const dts = modFilesElem.querySelectorAll(fileDtRelativeSelector);
    for(let i = 0; i < dts.length; i++){
        dts[i].querySelector(downloadedIconRelativeSelector)?.remove();
        dts[i].querySelector(dateDownloadedRelativeSelector)?.remove();
        dts[i].querySelector(toggleFileDdRelativeSelector)?.remove();
        dts[i].style.background = '#2d2d2d';
    }
};
const addShowRealFilenameToggle = function() {
    const input = document.createElement('input');
    input.setAttribute('class', 'sylin527_show_toggle');
    input.setAttribute('type', 'checkbox');
    const i = document.createElement('i');
    i.setAttribute('class', 'sylin527_show_text');
    i.setAttribute('checked_text', 'Hide Real Filenames');
    i.setAttribute('unchecked_text', 'Show Real Filenames');
    modFilesElem = getmodFilesElement();
    modFilesElem.insertBefore(i, modFilesElem.firstChild);
    modFilesElem.insertBefore(input, modFilesElem.firstChild);
    const newStyle = document.createElement('style');
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
      display: block;
    }
    `, ++ruleIndex);
};
const simplifyFileDds = function() {
    modFilesElem = getmodFilesElement();
    const dds = modFilesElem.querySelectorAll(fileDdRelativeSelector);
    const realClass = 'sylin527_real_filename';
    const newStyle = document.createElement('style');
    document.head.appendChild(newStyle);
    const sheet = newStyle.sheet;
    sheet?.insertRule(`
    p.${realClass} {
      color: #8197ec;
      margin-top: 20xp;
      display: none;
    }
    `, 0);
    for(let i = 0; i < dds.length; i++){
        const previewFileElem = dds[i].querySelector(previewFileRelativeSelector);
        const realFilename = previewFileElem?.querySelector('a')?.getAttribute('data-url');
        const fileDescElem = dds[i].querySelector(fileDescriptionRelativeSelector);
        const realFilenameP = document.createElement('p');
        if (typeof realFilename === 'string') {
            realFilenameP.setAttribute('class', realClass);
            realFilenameP.innerText = realFilename;
        }
        fileDescElem?.append(realFilenameP);
        previewFileElem?.remove();
        dds[i].querySelector(downloadButtonsContainerRelativeSelector)?.remove();
        dds[i].style.display = 'block';
    }
    addShowRealFilenameToggle();
};
const setFilesTabAsTopElement = function() {
    const filesTab = document.querySelector(filesTabSelector);
    const body = document.querySelector('body');
    if (null !== filesTab && null !== body) {
        filesTab.style.maxWidth = '1300px';
        filesTab.style.margin = '0 auto';
        body.style.marginTop = '0';
        body.insertBefore(filesTab, body.firstChild);
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
};
function isFilesTab(url) {
    return filesTabUrlRegexp.test(url);
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
function delay(ms) {
    return new Promise((resolve)=>setTimeout(resolve, ms)
    );
}
const uiRootElem = createUIRootElement();
const createEntryElement = function(uiRootElement) {
    const button = document.createElement('button');
    button.setAttribute('id', 'simplifyFilesTab');
    button.innerText = 'Simplify Files Tab';
    uiRootElement.appendChild(button);
    return button;
};
const entryElem = createEntryElement(uiRootElem);
let oldUrl = window.location.href;
const checkUrl = function() {
    const style = entryElem.style;
    function checkTab(url) {
        if (isFilesTab(url)) {
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
const simplifyFilesTab = function() {
    entryElem.addEventListener('click', ()=>{
        removePremiumBanner();
        removeAllSortBys();
        simplifyFileDts();
        simplifyFileDds();
        setFilesTabAsTopElement();
        removeSylin527Ui();
    });
    checkUrl();
};
function main() {
    simplifyFilesTab();
    const scriptInfo = 'Load userscript: [sylin527] nexusmods.com Simplify files tab';
    console.log('%c [Info] ' + scriptInfo, 'color: green');
}
main();

})()
