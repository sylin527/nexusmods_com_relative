// ==UserScript==
// @name        New script
// @namespace   Violentmonkey Scripts
// @match       *://*/*
// @grant       GM_download
// @version     1.0
// @author      -
// @description 2/6/2023, 4:08:25 AM
// ==/UserScript==
;(function () {
  "use strict"
  GM_download({
    url: "https://staticdelivery.nexusmods.com/mods/1704/images/thumbnails/73865/73865-1667347411-1492517934.png",
    name: "./_SSE/(ESM) The Modern Scrolls Full Version SE 3.6.9(23.2.1)/73865-1667347411-1492517934.png",
    saveAs: false,
    onload() {
      console.log("GM_download successfully")
    },
    onerror() {
      console.log("GM_download error")
    },
    onprogress() {
      console.log("GM_download progress")
    },
    ontimeout() {
      console.log("GM_download timeout")
    }
  })
})()

