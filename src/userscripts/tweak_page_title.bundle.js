// ==UserScript==
// @name        [sylin527] nexusmods.com Tweak page title
// @namespace   https://www.nexusmods.com/
// @match       https://www.nexusmods.com/*/mods/*
// @run-at      document-idle
// @grant       window.onurlchange
// @version     1.2
// @license     GPLv3
// @icon        https://www.nexusmods.com/favicon.ico
// @author      sylin527
// @description Dynamicly tweak page title at opening or when clicking tab buttons. Title format if has description tab: <mod_name> <mod_version>: <berif_overview>. Title format of other tabs: <mod_name> <mod_version> <tab>.
// ==/UserScript==
;(function(){

const modNameSelector = 'head>meta[property="og:title"]';
const modInfoContainerSelector = 'section#section';
const modVersionSelector = 'div#pagetitle>ul.stats.clearfix>li.stat-version>div.statitem>div.stat';
const modtabsSelector = '#section div.tabs ul.modtabs';
const modPageUrlRegexp = /((https|http):\/\/)((www.)?nexusmods.com)\/\w+\/mods\/([0-9]+(\/)?(\?)?(tab=description)?)$/;
document.querySelector(modInfoContainerSelector);
function getModName() {
    return document.querySelector(modNameSelector).getAttribute('content');
}
function getModVersion() {
    return document.querySelector(modVersionSelector).innerText;
}
function whenClickModTabs(handler) {
    document.querySelector(modtabsSelector)?.addEventListener('click', (event)=>{
        handler(event);
    });
}
function delay(ms) {
    return new Promise((resolve)=>setTimeout(resolve, ms)
    );
}
const tabDescriptionContainerSelector = 'div.container.tab-description';
const briefOverviewRelativeSelector = 'p:nth-of-type(1)';
let tabDescContainer = null;
function getTabDescContainer() {
    return tabDescContainer ? tabDescContainer : document.querySelector(tabDescriptionContainerSelector);
}
function hasDescriptionTab(url) {
    return modPageUrlRegexp.test(url);
}
async function getBriefOverview() {
    while(!tabDescContainer){
        await delay(333);
        tabDescContainer = getTabDescContainer();
    }
    const sde = tabDescContainer.querySelector(briefOverviewRelativeSelector);
    return sde.innerText.trimEnd();
}
const title = document.querySelector('title');
const modName = getModName();
const modVersion = getModVersion();
let briefOverview;
let oldUrl = window.location.href;
const tweakTitle = function() {
    innerTweakTitle(oldUrl);
    whenClickModTabs(async ()=>{
        await delay(300);
        const newUrl = window.location.href;
        if (oldUrl !== newUrl) {
            innerTweakTitle(newUrl);
        }
        oldUrl = newUrl;
    });
};
function innerTweakTitle(url) {
    if (hasDescriptionTab(url)) {
        if (!briefOverview) {
            getBriefOverview().then((value)=>{
                briefOverview = value;
                title.innerText = `${modName} ${modVersion}: ${briefOverview}`;
            });
        } else {
            title.innerText = `${modName} ${modVersion}: ${briefOverview}`;
        }
    } else {
        const tabReg = new RegExp(/(tab=(?!description)[a-zA-z]{1,20})$/, 'ig');
        const found = window.location.href.match(tabReg);
        if (found) title.innerText = `${modName} ${modVersion} ${found[0]}`;
    }
}
const main = function() {
    tweakTitle();
    const scriptInfo = 'Load userscript: [sylin527] nexusmods.com Tweak page title';
    console.log('%c [Info] ' + scriptInfo, 'color: green');
};
main();

})()
