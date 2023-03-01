import { insertDownloadNoWaitComponents as insertDownloadNoWaitComponentsAtFilesTab } from "../../mod_page/files_tab_actions.ts"
import { insertDownloadNoWaitComponents as insertDownloadNoWaitComponentsAtArchivedFilesTab } from "../../mod_page/archived_files_tab_actions.ts"
import { name, version } from "./userscript.header.ts"
import { insertDownloadNoWaitComponent as insertDownloadNoWaitComponentAtFileTab } from "../../mod_page/file_tab_actions.ts"
import { getValue, setValue } from "../../userscript_lib/mod.ts"

function initStorage() {
  const bSylin527 = getValue("isSylin527") as boolean | undefined
  bSylin527 === undefined && setValue("isSylin527", false)
}

function main() {
  initStorage()
  insertDownloadNoWaitComponentsAtFilesTab()
  insertDownloadNoWaitComponentsAtArchivedFilesTab()
  insertDownloadNoWaitComponentAtFileTab()
  const scriptInfo = `Load userscript: ${name} ${version}`
  console.log("%c [Info] " + scriptInfo, "color: green")
}

main()
