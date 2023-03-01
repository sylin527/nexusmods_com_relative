export const { body: bodyElement, head: headElement } = document

/**
 * title element cache
 */
export const titleElement = headElement.querySelector("title") as HTMLTitleElement

export const primaryColor = "#8197ec"
// export const primaryTranslucentColor = "#8197ec"
// export const secondaryColor = "#a4b7ff"
export const primaryHoverColor = "#a4b7ff"
export const highlightColor = "#d98f40"
export const highlightHoverColor = "#ce7f45"
export const mainContentMaxWidth = "1340px"

export function overPrimaryComponent(element: HTMLElement) {
  const style = element.style
  element.addEventListener("mouseover", function () {
    style.backgroundColor = primaryHoverColor
  })
  element.addEventListener("mouseleave", function () {
    style.backgroundColor = primaryColor
  })
}

export function overHighlightComponent(element: HTMLElement) {
  const style = element.style
  element.addEventListener("mouseover", function () {
    style.backgroundColor = highlightHoverColor
  })
  element.addEventListener("mouseleave", function () {
    style.backgroundColor = highlightColor
  })
}

interface Container {
  element: HTMLElement
  show(): unknown
  hide(): unknown
}

interface ContainerManager {
  containers: Container[]
  removeAll(): unknown
  showAll(): unknown
  hideAll(): unknown
  add(container: Container): unknown
  addBlocked(element: HTMLElement): unknown
}

export const containerManager: ContainerManager = {
  containers: [],
  removeAll() {
    this.containers.forEach(({ element }) => {
      element.remove()
    })
  },
  showAll() {
    this.containers.forEach((container) => container.show())
  },
  hideAll() {
    this.containers.forEach((container) => container.hide())
  },
  add(container: Container) {
    this.containers.push(container)
  },
  addBlocked(element: HTMLElement) {
    this.containers.push({
      element,
      show() {
        element.style.display = "block"
      },
      hide() {
        element.style.display = "none"
      },
    })
  },
}

function getActionContainerId() {
  return "sylin527ActionContainer"
}

function insertActionContainerStyle() {
  const newStyle = document.createElement("style")
  headElement.appendChild(newStyle)
  const sheet = newStyle.sheet!
  const containerId = getActionContainerId()

  /**
   * 设 `top: 56px` 是因 Mod page 的 `<header>` 的 `height: 56px`
   * 设 `background: transparent;` 以避免突兀
   */
  let ruleIndex = sheet.insertRule(
    `
    #${containerId} {
      display: block;
      position: fixed;
      right: 5px;
      top: 56px;
      font-size: 13px;
      font-weight: 400;
      background: transparent;
      z-index: 999;
      direction: rtl;
    }
    `,
  )
  sheet.insertRule(
    `
    #${containerId} > *{
      display: block;
      margin-top: 5px;
    }
    `,
    ++ruleIndex,
  )
  sheet.insertRule(
    `
    #${containerId} button.action {
    padding: 8px;
    cursor: pointer;
    background: ${primaryColor};
    border-radius: 3px;
    border: 1px solid ${primaryHoverColor};
    color: #eaeaea;
    `,
    ++ruleIndex,
  )
  sheet.insertRule(
    `
    #${containerId} button.action:hover {
    background: ${primaryHoverColor};
    `,
    ++ruleIndex,
  )
  // messageSpan 默认不显示
  sheet.insertRule(
    `
    #${containerId} span.message {
      background-color: rgba(51, 51, 51, 0.5);
      color: rgb(255, 47, 151);
      padding: 8px;
      border-radius: 4px;
      display: inline;
      margin: 0 7px;
      visibility: hidden;
    }
    `,
    ++ruleIndex,
  )
}

function createActionContainer(): HTMLDivElement {
  const containerId = getActionContainerId()
  let container = document.getElementById(containerId) as HTMLDivElement | null
  if (null === container) {
    container = document.createElement("div") as HTMLDivElement
    container.setAttribute("id", containerId)
    container.style.zIndex = "999"
    insertActionContainerStyle()
  }
  return container
}
let _actionContainer: HTMLDivElement | null = null
export function insertActionContainer() {
  if (!_actionContainer) {
    _actionContainer = createActionContainer()
    bodyElement.append(_actionContainer)
    containerManager.addBlocked(_actionContainer)
  }
  return _actionContainer
}

export function createActionComponent(name: string): HTMLButtonElement {
  const actionButton = document.createElement("button")
  actionButton.innerText = name
  actionButton.className = "action"
  return actionButton
}

export function createActionWithMessageComponent(name: string) {
  const containerDiv = document.createElement("div")
  const actionButton = createActionComponent(name)
  const messageSpan = document.createElement("span")
  messageSpan.className = "message"
  containerDiv.append(actionButton, messageSpan)
  return {
    element: containerDiv,
    actionButton,
    messageSpan,
  }
}
