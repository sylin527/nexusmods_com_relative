/**
 * From template codes, **No Comment**, **No Addition**
 */

import { version, name, getHeader } from "../src/userscripts/mod_documentation_utility/userscript.header.ts"
import { build } from "./shared.ts"

const mainPath = "./src/userscripts/mod_documentation_utility/userscript.main.ts"
const buildPath = `./build/userscripts/${name}_v${version}.js`
build(mainPath, buildPath, getHeader())

