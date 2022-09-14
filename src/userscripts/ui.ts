let uiRoot: HTMLDivElement | null = null;

/**
 * 创建一个入口组件
 * @returns HTMLDivElement
 */
function createUIRootElement(): HTMLDivElement {
  const sylin527UiContainer = "#sylin527UiContainer";
  let entryElem = document.querySelector<HTMLDivElement>(sylin527UiContainer);
  if (null === entryElem) {
    entryElem = document.createElement("div");
    entryElem.setAttribute("id", "sylin527UiContainer");
    const newStyle = document.createElement("style");
    document.head.appendChild(newStyle);
    const sheet = newStyle.sheet!;
    /*
    设 `top: 56px` 是因 Mod page 的 `<header>` 的 `height: 56px`
    设 `background: transparent;` 以避免突兀
    */
    let ruleIndex = sheet.insertRule(
      `
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
      `
    );
    /*
    默认隐藏
    备用 background: #ca2c76
    */
    sheet.insertRule(
      `#sylin527UiContainer > a, #sylin527UiContainer > button {
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
      `,
      ++ruleIndex
    );
  }
  entryElem.style.zIndex = "999";
  document.body.append(entryElem);
  uiRoot = entryElem;
  return entryElem;
}

export function getUiRootElement() {
  if (uiRoot === null) uiRoot = createUIRootElement();
  return uiRoot;
}

export const removeSylin527Ui = function () {
  const roots = document.querySelectorAll("div[id^=sylin527]");
  for (let i = 0; i < roots.length; i++) {
    roots[i].remove();
  }
};

export const hideSylin527Ui = function () {
  const roots = document.querySelectorAll<HTMLElement>("div[id^=sylin527]");
  for (let i = 0; i < roots.length; i++) {
    roots[i].style.display = "none";
  }
};

export const showSylin527Ui = function () {
  const roots = document.querySelectorAll<HTMLElement>("div[id^=sylin527]");
  for (let i = 0; i < roots.length; i++) {
    roots[i].style.display = "block";
  }
};
