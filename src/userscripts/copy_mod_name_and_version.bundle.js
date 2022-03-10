// ==UserScript==
// @name         [sylin527] nexusmods.com Copy mod name and version
// @namespace    https://www.nexusmods.com/
// @version      1.1
// @description  Copy mod name and version.
// @author       sylin527
// @include      https://www.nexusmods.com/*/mods/*
// @icon         https://www.nexusmods.com/favicon.ico
// @grant        window.onurlchange
// @license      GPLv3
// @run-at       document-idle
// ==/UserScript==
;(function(){

const modNameSelector = 'head>meta[property="og:title"]';
const modInfoContainerSelector = 'section#section';
const modVersionSelector = 'div#pagetitle>ul.stats.clearfix>li.stat-version>div.statitem>div.stat';
document.querySelector(modInfoContainerSelector);
function getModName() {
    return document.querySelector(modNameSelector).getAttribute('content');
}
function getModVersion() {
    return document.querySelector(modVersionSelector).innerText;
}
const rootUiId = 'sylin527CopyRoot';
const createUiRoot = function() {
    const rootDiv = document.createElement('div');
    rootDiv.setAttribute('id', rootUiId);
    const button = document.createElement('button');
    button.innerText = 'Copy';
    const message = document.createElement('span');
    message.innerText = 'Copied mod name and version';
    rootDiv.append(button, message);
    const pagetitle = document.querySelector('#pagetitle');
    const nameNextElem = pagetitle.querySelector('ul.stats');
    pagetitle.insertBefore(rootDiv, nameNextElem);
    const h1 = pagetitle.querySelector('h1:nth-of-type(1)');
    h1.style.display = 'inline-block';
    const marginLeft = h1.clientWidth + 16 + 'px';
    pagetitle.insertBefore(document.createElement('div'), rootDiv);
    const newStyle = document.createElement('style');
    document.head.appendChild(newStyle);
    const sheet = newStyle.sheet;
    let ruleIndex = sheet.insertRule(`
    #${rootUiId} {
      margin: -50.6px 0 0 ${marginLeft};
      font-family: 'Roboto',sans-serif;
      font-size: 14px;
      line-height: 1.15;
      height: 50.6px;
    }
    `);
    sheet.insertRule(`
    #${rootUiId} > button {
      background-color: #8197ec;
      border: none;
      border-radius: 3px;
      padding: 0 1.2rem;
      line-height: 33px;
      vertical-align: middle;
      font-weight: 400;
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
const uiRoot = createUiRoot();
let modNameAndVersion = null;
const getCopyText = function() {
    if (null === modNameAndVersion) {
        modNameAndVersion = `${getModName()} ${getModVersion()}`;
    }
    return modNameAndVersion;
};
const bindEvent = function() {
    const button = uiRoot.querySelector('button');
    const message = uiRoot.querySelector('span');
    button.addEventListener('click', ()=>{
        navigator.clipboard.writeText(getCopyText()).then(()=>{
            message.style.display = 'inline';
            setTimeout(()=>message.style.display = 'none'
            , 1000);
        }, ()=>console.log('%c[Error] Copy failed.', 'color: red')
        );
    });
};
function main() {
    bindEvent();
    const scriptInfo = 'Load userscript: [sylin527] nexusmods.com Copy mod name and version';
    console.log('%c [Info] ' + scriptInfo, 'color: green');
}
main();

})()
