// ==UserScript==
// @name         [sylin527] nexusmods.com Simplify files tab
// @namespace    https://www.nexusmods.com/
// @version      1.1
// @description  Simplify files tab for saving by SingleFileZ or SingleFile. Remove unnecessary UI, add the real filename to file description, show all file description, etc. Recommend to instanll "[sylin527] nexusmods.com Tweak page title" to get more detailed page title.
// @author       sylin527
// @include      https://www.nexusmods.com/*/mods/*
// @icon         https://www.nexusmods.com/favicon.ico
// @grant        window.onurlchange
// @license      GPLv3
// @run-at       document-idle
// ==/UserScript==
;(function(){
const HEADER_SELECTOR = 'header#head';
const MAIN_CONTENT_SELECTOR = 'div#mainContent';
const MOD_INFO_CONTAINER_SELECTOR = 'section#section';
const MODTABS_SELECTOR = '#section div.tabs ul.modtabs';
const FOOTER_SELECTOR = 'footer#rj-footer';
document.querySelector(MOD_INFO_CONTAINER_SELECTOR);
function whenClickModTabs(handler) {
    document.querySelector(MODTABS_SELECTOR)?.addEventListener('click', (event)=>{
        handler(event);
    });
}
const FILES_TAB_SELECTOR = 'div.tabcontent.tabcontent-mod-page';
const PREMIUM_BANNER_SELECTOR = 'div.tabcontent div.premium-banner.container';
const MOD_FILES_SELECTOR = 'div#mod_files';
`${MOD_FILES_SELECTOR} div.file-category-header>div:nth-of-type(1)`;
const SORT_BY_RELATIVE_SELECTOR = `div.file-category-header>div:nth-of-type(1)`;
const FILE_DT_RELATIVE_SELECTOR = 'dl.accordion>dt';
const DOWNLOADED_ICON_RELATIVE_SELECTOR = 'div>i.material-icons';
const DATE_DOWNLOADED_RELATIVE_SELECTOR = 'div>div.file-download-stats>ul>li.stat-downloaded';
const TOGGLE_FILE_DD_RELATIVE_SELECTOR = 'div>div.acc-status';
const FILE_DD_RELATIVE_SELECTOR = 'dl.accordion>dd';
const FILE_DESCRIPTION_RELATIVE_SELECTOR = 'div.tabbed-block:first-child';
const DOWNLOAD_BUTTONS_CONTAINER_RELATIVE_SELECTOR = `div.tabbed-block:nth-of-type(2)`;
const PREVIEW_FILE_RELATIVE_SELECTOR = 'div.tabbed-block:last-child';
const FILES_TAB_URL_REGEXP = /(?<schema>(https|http):\/\/)(?<domain>(www.)?nexusmods.com)\/\w+\/mods\/[0-9]+(\?tab=files)$/;
const modFilesElem = document.querySelector(MOD_FILES_SELECTOR);
const removePremiumBanner = function() {
    if (null == modFilesElem) return;
    document.querySelector(PREMIUM_BANNER_SELECTOR)?.remove();
};
const removeAllSortBys = function() {
    if (null == modFilesElem) return;
    const arrayLike = modFilesElem.querySelectorAll(SORT_BY_RELATIVE_SELECTOR);
    for(let i = 0; i < arrayLike.length; i++){
        arrayLike[i].remove();
    }
};
const simplifyFileDts = function() {
    if (null == modFilesElem) return;
    const dts = modFilesElem.querySelectorAll(FILE_DT_RELATIVE_SELECTOR);
    for(let i = 0; i < dts.length; i++){
        dts[i].querySelector(DOWNLOADED_ICON_RELATIVE_SELECTOR)?.remove();
        dts[i].querySelector(DATE_DOWNLOADED_RELATIVE_SELECTOR)?.remove();
        dts[i].querySelector(TOGGLE_FILE_DD_RELATIVE_SELECTOR)?.remove();
        dts[i].style.background = '#2d2d2d';
    }
};
const simplifyFileDds = function() {
    if (null == modFilesElem) return;
    const dds = modFilesElem.querySelectorAll(FILE_DD_RELATIVE_SELECTOR);
    for(let i = 0; i < dds.length; i++){
        const previewFileElem = dds[i].querySelector(PREVIEW_FILE_RELATIVE_SELECTOR);
        const realFilename = previewFileElem?.querySelector('a')?.getAttribute('data-url');
        const fileDescElem = dds[i].querySelector(FILE_DESCRIPTION_RELATIVE_SELECTOR);
        const realFilenameP = document.createElement('p');
        if (typeof realFilename === 'string') {
            realFilenameP.innerText = realFilename;
            realFilenameP.style.color = '#8197ec';
            realFilenameP.style.marginTop = '20px';
        }
        fileDescElem?.append(realFilenameP);
        previewFileElem?.remove();
        dds[i].querySelector(DOWNLOAD_BUTTONS_CONTAINER_RELATIVE_SELECTOR)?.remove();
        dds[i].style.display = 'block';
    }
};
const setFilesTabAsTopElement = function() {
    const filesTab = document.querySelector(FILES_TAB_SELECTOR);
    const body = document.querySelector('body');
    if (null !== filesTab && null !== body) {
        filesTab.style.maxWidth = '1300px';
        filesTab.style.margin = '0 auto';
        body.style.marginTop = '0';
        body.insertBefore(filesTab, body.firstChild);
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
};
function isFilesTab(url) {
    return FILES_TAB_URL_REGEXP.test(url);
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
const checkUrl = async function() {
    const style = entryElem.style;
    await delay(500);
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
        uiRootElem.remove();
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
