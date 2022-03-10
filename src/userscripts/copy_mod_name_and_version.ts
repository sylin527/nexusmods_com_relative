import { getModName, getModVersion } from '../mod_page/tabs_shared_content.ts'

const rootUiId = 'sylin527CopyRoot'
/**
 * <div id="sylin527CopyRoot">
 *  <button>Copy</button>
 *  <span>Copied mod name and version.</span>
 * </div>
 */
const createUiRoot = function (): HTMLDivElement {
  const rootDiv = document.createElement('div')
  rootDiv.setAttribute('id', rootUiId)
  const button = document.createElement('button')
  button.innerText = 'Copy'
  const message = document.createElement('span')
  message.innerText = 'Copied mod name and version'
  rootDiv.append(button, message)
  const pagetitle = document.querySelector('#pagetitle')
  // 表示 mod name 的 <h1> 的后一个兄弟元素
  const nameNextElem = pagetitle!.querySelector('ul.stats')
  pagetitle!.insertBefore(rootDiv, nameNextElem)

  const h1 = pagetitle!.querySelector<HTMLElement>('h1:nth-of-type(1)')
  // 先把本组件根元素添加进 #pagetitle, 之后再修改这个 <h1> 为 inline-block 以获取 <h1> 的内容宽度
  h1!.style.display = 'inline-block'
  const marginLeft = h1!.clientWidth! + 16 + 'px'

  // 避免 rootDiv.remove() 之后, h1 错位
  pagetitle!.insertBefore(document.createElement('div'), rootDiv)

  const newStyle = document.createElement('style')
  document.head.appendChild(newStyle)
  const sheet = newStyle.sheet!
  let ruleIndex = sheet.insertRule(
    `
    #${rootUiId} {
      margin: -50.6px 0 0 ${marginLeft};
      font-family: 'Roboto',sans-serif;
      font-size: 14px;
      line-height: 1.15;
      height: 50.6px;
    }
    `
  )
  sheet.insertRule(
    `
    #${rootUiId} > button {
      background-color: #8197ec;
      border: none;
      border-radius: 3px;
      padding: 0 1.2rem;
      line-height: 33px;
      vertical-align: middle;
      font-weight: 400;
    }
    `,
    ++ruleIndex
  )
  sheet.insertRule(
    `
    #${rootUiId} > span {
      background-color: rgba(51, 51, 51, 0.5);
      color: hotpink;
      padding: 8px;
      border-radius: 5px;
      margin-left: 1rem;
      display: none;
    }
    `,
    ++ruleIndex
  )
  return rootDiv
}

const uiRoot = createUiRoot()

let modNameAndVersion: string | null = null

const getCopyText = function () {
  if (null === modNameAndVersion) {
    modNameAndVersion = `${getModName()} ${getModVersion()}`
  }
  return modNameAndVersion
}

const bindEvent = function () {
  const button = uiRoot.querySelector('button')
  const message = uiRoot.querySelector('span')
  button!.addEventListener('click', () => {
    navigator.clipboard.writeText(getCopyText()).then(
      () => {
        message!.style.display = 'inline'
        setTimeout(() => (message!.style.display = 'none'), 1000)
      },
      () => console.log('%c[Error] Copy failed.', 'color: red')
    )
  })
}

function main() {
  bindEvent()
  const scriptInfo = 'Load userscript: [sylin527] nexusmods.com Copy mod name and version'
  console.log('%c [Info] ' + scriptInfo, 'color: green')
}

main()
