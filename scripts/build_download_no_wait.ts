/**
 * From template codes, **No Comment**, **No Addition**
 */

import { version, name, getHeader } from "../src/userscripts/download_no_wait/userscript.header.ts"
import { build } from "./shared.ts"

const mainPath = "./src/userscripts/download_no_wait/userscript.main.ts"
const buildPath = `./build/userscripts/${name}_v${version}.js`
build(mainPath, buildPath, getHeader())

