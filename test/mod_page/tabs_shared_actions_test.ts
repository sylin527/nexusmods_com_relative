import { clickTab } from "../../src/mod_page/tabs_shared.ts"
import { clickedTabContentLoaded } from "../../src/mod_page/tabs_shared_actions.ts"

clickTab(() => {
  clickedTabContentLoaded().then(() => {
    console.log("clickedTabContentLoaded")
  })
})

