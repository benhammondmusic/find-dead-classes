#! /usr/bin/env node

// require = require('esm')(module /*, options*/);
// require('../src/cli').cli(process.argv);

// Index all files in a folder/sub folders
import { walk } from "@root/walk";
// const walk = require("@root/walk")
import { readFileSync } from "fs"
// const readFileSync = require("fs")

export {}

const PROJECT = process.argv?.[2] || "./"
const allSassFiles: string[] = []
const allTsxFiles: string[] = []



/*
Accepts two Arrays
Returns items from LEFT that aren't in RIGHT
*/
function difference(leftArray: string[], rightArray:string[]) {
    let _difference = new Set(leftArray)
    for (let elem of rightArray) {
        _difference.delete(elem)
    }
    return Array.from(_difference)
}

/*
Helper fn to walk through project directory
*/
const walkFunc = async (err:any, pathname:string, dirent:any) => {
    if (err) {
        console.log(err);
        throw err;
    }
    // ignore hidden folders and node modules
    if (dirent.isDirectory() && (dirent.name.startsWith(".") || dirent.name === "node_modules")) return false;


    if (pathname.endsWith(".scss")) allSassFiles.push(pathname)
    if (pathname.endsWith(".tsx")) allTsxFiles.push(pathname)
};

/*
Collect all scss OR tsx files within PROJECT
*/

// @ts-ignore - top-level await is working
await walk(PROJECT, walkFunc);

for (const sassFilePath of allSassFiles) {
    const sassFileName = sassFilePath.split("/").at(-1)

    console.log("\n\n\n-------------------------");
    console.log(sassFileName);
    console.log("-------------------------");


    // collect all CLASS DECLARATIONS from the scss
    const bufferSass = readFileSync(sassFilePath);
    const sassCode = bufferSass.toString()
    const regexForClassDeclarations = /[.][A-Z][A-Za-z]+/gm
    const classDeclarations = sassCode.match(regexForClassDeclarations)
    if (!classDeclarations) continue

    // collect all CLASS CALLS from all .TSX files that import current .SCSS
    const allClassCalls = []
    for (const tsxFilePath of allTsxFiles) {
        const bufferTsx = readFileSync(tsxFilePath);
        const tsxCode = bufferTsx.toString()
        const codeLines = tsxCode.split("\n")
        const importLine = codeLines.find((line: string)=>line.startsWith("import styles from"))

        if (importLine?.endsWith(`${sassFileName}";`)) {
            const regexForClassCalls = /className={styles.[A-Z][a-zA-Z]+/gm
            const foundClassCalls: string[] = tsxCode.match(regexForClassCalls)?.map((style: string)=>style.replace("className={styles", "")) || []

            // construct the DEAD CALLS report
            const callsWithoutDeclarations = difference(foundClassCalls, classDeclarations)
            const callsMsg = callsWithoutDeclarations.length ? callsWithoutDeclarations.map(item=>`\n\t\t‣ className={styles${item}}`) : [""]
            if (callsWithoutDeclarations.length) console.log("\n\t😵 DEAD TSX in", tsxFilePath.replace(PROJECT, ""), ...callsMsg);
            allClassCalls.push(...foundClassCalls)

        }
        if (!allClassCalls) continue
    }

    // construct the DEAD DECLARATIONS report
    const declarationsWithoutCalls = difference(classDeclarations, allClassCalls)
    const declarationsMsg = declarationsWithoutCalls.length ? declarationsWithoutCalls.map(item=>`\n\t\t‣ ${item} { ... }`) : [""]

    if (declarationsWithoutCalls.length) console.log("\n\t😵 DEAD SASS in", sassFilePath.replace(PROJECT, ""),...declarationsMsg);



}

console.log("\n\nFinished Reporting Dead Classes\n\n");
