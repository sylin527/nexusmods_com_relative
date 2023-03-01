// deno-lint-ignore-file no-extra-semi

import { getBriefOverview } from "./description_tab.ts"
import {
  clickTabLi,
  getCurrentTab,
  getFeatureDiv,
  getGameName,
  getModActionsComponent,
  getModActionsUl,
  getModGalleryDiv,
  getModName,
  getModTabsUl,
  getModVersionWithDate,
  getTabContentDiv,
  getTabsDiv,
  getThumbnailComponent,
  getThumbnailGalleryUl,
  isModUrl,
  Tab,
  ThumbnailComponent,
} from "./tabs_shared.ts"
import {
  bodyElement,
  createActionComponent,
  createActionWithMessageComponent,
  mainContentMaxWidth,
  titleElement,
} from "../ui.ts"
import { observeAddDirectChildNodes, removeAllChildNodes, replaceIllegalChars } from "../util.ts"
import { downloadFiles, DownloadItem } from "../userscript_lib/mod.ts"

/**
 * 设置 `div.tabs` 为 `body` 顶层子元素
 *
 * 不删 `ul.modtabs` 信息, 保留 mod url
 *
 * 注意: 应在 DOM 相关的操作完成之后再使用
 */
export function setTabsDivAsTopElement() {
  const modTabsUl = getModTabsUl()
  modTabsUl.style.height = "45px"
  bodyElement.classList.remove("new-head")
  bodyElement.style.margin = "0 auto"
  bodyElement.style.maxWidth = mainContentMaxWidth
  const tabsDivClone = getTabsDiv().cloneNode(true)
  removeAllChildNodes(bodyElement)
  bodyElement.appendChild(tabsDivClone)
}

// [lyne408]
// 伪元素的 `content` 属性值为 `attr(attr_name)`,
// 元素的 `attr_name` 属性值变化时, 伪元素的 `content` 属性值也变化,
// 就好像 setter 一样

export function createCopyModNameAndVersionComponent(): HTMLDivElement {
  const { actionButton, messageSpan, element } = createActionWithMessageComponent("Copy Mod Name And Version")
  messageSpan.innerText = "Copied"
  actionButton.addEventListener("click", () => {
    navigator.clipboard.writeText(`${getModName()} ${getModVersionWithDate()}`).then(
      () => {
        messageSpan.style.visibility = "visible"
        setTimeout(() => (messageSpan.style.visibility = "hidden"), 1000)
      },
      () => console.log("%c[Error] Copy failed.", "color: red"),
    )
  })
  return element
}

// [lyne408]
// new RegExp(/Deno/, 'ig').test('Deno') // true
// new RegExp(/Deno/, 'ig').test('Deno, other strings') // true
// 需要完整匹配, 不允许多余的文字, 则限制 beginning 和 end.
// new RegExp(/Deno$/, 'ig').test('Deno, other strings') // false

/**
 * @param currentTab
 *
 * 因 Firefox 保存书签时, 若书签名包含换行, 直接省略换行符
 *
 * 这里替换 brief overview 中的换行为空格
 */
function tweakTitleInner(currentTab: string) {
  if (currentTab === "description") {
    let briefOverview = getBriefOverview()
    briefOverview = briefOverview ? briefOverview.replaceAll(/\r\n|\n/g, " ") : ""
    titleElement.innerText = `${getModName()} ${getModVersionWithDate()}: ${briefOverview}`
  } else {
    titleElement.innerText = `${getModName()} ${getModVersionWithDate()} tab=${currentTab}`
  }
}

/**
 * tweak title after open mod urls (mod page or any tabs) or click tabs
 */
export function tweakTitleAfterClickingTab() {
  let oldTab = getCurrentTab()
  tweakTitleInner(oldTab)
  clickTabLi(async (clickedTab) => {
    if (oldTab !== clickedTab) {
      if (clickedTab === "description" && getBriefOverview() === null) {
        await clickedTabContentLoaded()
      }
      oldTab = clickedTab
      tweakTitleInner(clickedTab)
    }
  })
}

export function hideModActionsSylin527NotUse() {
  const { addMediaLi, downloadLabelLi, vortexLi, manualDownloadLi } = getModActionsComponent()
  addMediaLi && (addMediaLi.style.display = "none")
  downloadLabelLi.style.display = "none"
  manualDownloadLi.style.display = "none"
  vortexLi && (vortexLi.style.display = "none")
}

/**
 * 从逻辑来讲, 应该是 UI 逻辑分离, 暂时懒得写了
 * 如果有 thumb gallery, 添加按钮, 并 bind event
 * 点击按钮的逻辑: 页面最宽为 body 宽度, 所有 thumbnails 都以原图显示在页面
 *
 * 作者不上传 mod 图片时, 应该没有 `#sidebargallery > ul.thumbgallery`
 *
 * 如果没有 gallery, 返回 null
 */
export function createShowAllGalleryThumbnailsComponent(): HTMLButtonElement {
  const button = createActionComponent("Show All Thumbnails")
  button.addEventListener("click", () => {
    const thumbGalleryUl = getThumbnailGalleryUl()!
    thumbGalleryUl.style.height = "max-content"
    thumbGalleryUl.style.width = "auto"
    thumbGalleryUl.style.zIndex = "99999"
    const thumbLis = thumbGalleryUl.querySelectorAll<HTMLLIElement>(":scope > li.thumb")
    for (const thumbLi of thumbLis) {
      const component = getThumbnailComponent(thumbLi)
      const { figure, anchor, img } = component
      thumbLi.style.height = "auto"
      thumbLi.style.width = "auto"
      thumbLi.style.marginBottom = "7px"

      figure.style.height = "auto"

      anchor.style.top = "0"
      anchor.style.transform = "unset"

      img.style.maxHeight = "unset"
    }
  })

  return button
}

type ThumbnailComponentWithCheckedProperty = ThumbnailComponent & { checked: boolean }

// [lyne408]
// `Object.assign()` 只应该用在属性为字面量的数据对象上
// 如 `Object.assign(obj1, obj2)`, 不应在 obj2 里定义 getter, 会直接取值, 变成一个字面量
// 这种情况获取的永远是初始值
// 若确实需要新定义 getter 属性, 用 `Object.defineProperty()` 再 `as` 新类型
// componentsHasCheckedKey.push(Object.assign(component, {
//   get checked() {
//     return input.checked
//   },
// }))

/**
 * 默认是选中的
 * 返回的对象的属性 checked 是一个 getter
 */
function insertCheckboxToThumbnails(): ThumbnailComponentWithCheckedProperty[] | null {
  const thumbGalleryUl = getThumbnailGalleryUl()
  if (!thumbGalleryUl) return null
  const componentsWithCheckedProperty: ThumbnailComponentWithCheckedProperty[] = []
  const thumbLis = thumbGalleryUl.querySelectorAll<HTMLLIElement>(":scope > li.thumb")
  for (const thumbLi of thumbLis) {
    const component = getThumbnailComponent(thumbLi)
    const { figure } = component
    const input = document.createElement("input")
    input.setAttribute("type", "checkbox")
    input.setAttribute("style", "position: absolute; top: 4px; right: 4px; width: 20px; height: 20px; cursor: pointer;")
    input.addEventListener("click", (event) => {
      event.stopPropagation()
    }, { capture: true })
    figure.appendChild(input)

    componentsWithCheckedProperty.push(Object.defineProperty(component, "checked", {
      get() {
        return input.checked
      },
      set(value: boolean) {
        input.checked = value
      },
    }) as ThumbnailComponentWithCheckedProperty)
  }
  return componentsWithCheckedProperty
}

function createSelectAllImagesComponent(components: ThumbnailComponentWithCheckedProperty[]): HTMLButtonElement {
  const button = createActionComponent("Select All Images")
  button.addEventListener("click", () => {
    for (const component of components) {
      component.checked = true
    }
  })
  return button
}

export interface Image {
  url: string
  name: string
}

function getGalleryTitle(): string {
  return `_gallery_of_${getModName()} ${getModVersionWithDate()}`
}

// [lyne408]
// GM_download(details) 的 details 的 name 属性, 以 `./` 开头会出错, 相对路径不以 './' 开头即可

/**
 * @param components
 * @param relativeDirectory  will `replaceIllegalChars()`
 * @param eachSuccess
 * @param eachFail
 * @returns
 */
function downloadSelectedImages(
  components: ThumbnailComponentWithCheckedProperty[],
  relativeDirectory: string,
  eachSuccess?: (item: DownloadItem) => unknown,
  eachFail?: (item: DownloadItem) => unknown,
) {
  const allThumbnailCount = components.length
  const digits = allThumbnailCount.toString().length
  const checkedImages: Image[] = []
  for (let i = 0; i < allThumbnailCount; i++) {
    const { checked, originalImageSrc, title } = components[i]
    if (checked) {
      const extWithDot = originalImageSrc.substring(originalImageSrc.lastIndexOf("."))
      const num = (i + 1).toString().padStart(digits, "0")
      const name = `${relativeDirectory}/${num}_${replaceIllegalChars(title)}${extWithDot}`
      checkedImages.push({ url: originalImageSrc, name })
    }
  }

  return downloadFiles(checkedImages, 3, eachSuccess, eachFail)
}

export function createDownloadSelectedImagesComponent(): DocumentFragment {
  // const openButton = document.createElement("button")
  // openButton.innerText = "Open Selected Images Gallery HTML"
  // overPrimaryComponent(openButton)
  // openButton.addEventListener("click", () => {
  //   const htmlContent = generateGalleryHtml(
  //     getGalleryTitle(),
  //     componentsHasCheckedProperty.filter((component) => component.checked).map((
  //       { originalImageSrc, title },
  //     ) => ({ url: originalImageSrc, name: replaceIllegalChar(title) })),
  //   )
  //   const url = URL.createObjectURL(new Blob([htmlContent]))
  //   window.open(url, "_blank")
  // })

  const fragment = document.createDocumentFragment()
  const { actionButton: downloadButton, messageSpan, element: downloadDiv } = createActionWithMessageComponent(
    "Download Selected Images",
  )

  fragment.append(downloadDiv)

  const modGalleryDiv = getModGalleryDiv()
  const hasGallery = isModUrl(location.href) && modGalleryDiv

  if (!hasGallery) {
    downloadButton.innerText = "Download Selected Images (Gallery Not Found)"
    downloadButton.style.display = "none"
    return fragment
  }

  const componentsHasCheckedProperty = insertCheckboxToThumbnails()!
  const selectButton = createSelectAllImagesComponent(componentsHasCheckedProperty)
  fragment.insertBefore(selectButton, downloadDiv)

  downloadButton.addEventListener("click", () => {
    messageSpan.style.visibility = "visible"
    const selectedCount = componentsHasCheckedProperty.filter(({ checked }) => checked).length
    if (selectedCount === 0) {
      messageSpan.innerText === `Selected: 0`
      return
    }
    const downloadedCountSpan = document.createElement("span")
    downloadedCountSpan.innerText = "0"
    const failedCountSpan = document.createElement("span")
    failedCountSpan.innerText = "0"
    messageSpan.innerText = ""
    messageSpan.append(
      `Selected: ${selectedCount}`,
      " ",
      "Downloaded: ",
      downloadedCountSpan,
      " ",
      "Failed: ",
      failedCountSpan,
    )
    let downloadedCount = 0
    let failedCount = 0
    const relativeDirectory = selectedCount <= 3
      ? `${getGameName()}/${getModName()} ${getModVersionWithDate()}`
      : `${getGameName()}/${getGalleryTitle()}`
    downloadSelectedImages(componentsHasCheckedProperty, relativeDirectory, () => {
      downloadedCount++
      downloadedCountSpan.innerText = downloadedCount.toString()
      downloadedCount === selectedCount && (messageSpan.innerText = `Done: ${selectedCount}/${selectedCount}`)
    }, () => {
      failedCount++
      failedCountSpan.innerText = failedCount.toString()
    })
  })

  return fragment
}

/**
 * 如果有 div#feature, 清除其 style 属性, 更改其 id 为 nofeature 以使用 nofeature 样式.
 *
 * 对比 div#feature, div#nofeature 样式为: 清除背景, 减小 height.
 */
export function removeFeature(): void {
  const featureDiv = getFeatureDiv()
  featureDiv?.removeAttribute("style")
  featureDiv?.setAttribute("id", "nofeature")
}

export function removeModActions() {
  getModActionsUl().remove()
}

export function removeModGallery() {
  getModGalleryDiv()?.remove()
}

/**
 * 点击 tab 时, Nexusmods 先删除原 tabContentDiv.querySelectorAll("div"), 再新增
 *
 * 点 tab 后, 有一个 MutationRecord[], 一般含有两个 MutationRecord.
 * 第一个 MutationRecord 是删除 tabContentDiv 下的原 tab 的 childNodes
 * 第二个 MutationRecord 是增加新 tab 的 的childNodes 到 ContentDiv
 */
export function clickedTabContentLoaded(): Promise<0> {
  return new Promise((resolve) => {
    observeAddDirectChildNodes(getTabContentDiv(), (mutationList, observer) => {
      console.log("tabContentDiv add childNodes mutationList:", mutationList)
      observer.disconnect()
      resolve(0)
    })
  })
}

export async function controlComponentDisplayAfterClickingTab(
  component: HTMLElement,
  isShow: (clickedTab: Tab) => boolean | Promise<boolean>,
) {
  const style = component.style
  async function _inner(currentTab: Tab) {
    ;(await isShow(currentTab)) ? (style.display = "block") : (style.display = "none")
  }
  await _inner(getCurrentTab())
  clickTabLi(async (clickedTab) => {
    await _inner(clickedTab)
  })
}
