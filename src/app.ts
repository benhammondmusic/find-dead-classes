#! /usr/bin/env node

// Index all files in a folder/sub folders
import { walk } from "@root/walk";
import { readFileSync } from "fs"

export {}

const PROJECT = process.argv?.[2] || "./"
const allSassFiles: string[] = []
const allTsxFiles: string[] = []
let allDeadCalls: string[] =[]
let allDeadDeclarations: string[] = []



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
    if (pathname.endsWith(".tsx") || pathname.endsWith(".jsx")) allTsxFiles.push(pathname)
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
            const regexForClassCalls = /styles[.][A-Z][a-zA-Z]+/gm
            const foundClassCalls: string[] = tsxCode.match(regexForClassCalls)?.map((style: string)=>style.replace("styles", "")) || []

            // construct the DEAD CALLS report
            const callsWithoutDeclarations = difference(foundClassCalls, classDeclarations)
            allDeadCalls.push(...callsWithoutDeclarations)


            const callsMsg = callsWithoutDeclarations.length ? callsWithoutDeclarations.map(item=>`\n\t\t??? styles${item}`) : [""]
            if (callsWithoutDeclarations.length) console.log("\n\t???? (POTENTIALLY) DEAD TSX in", tsxFilePath.replace(PROJECT, ""), ...callsMsg);
            allClassCalls.push(...foundClassCalls)

        }
        if (!allClassCalls) continue
    }

    // construct the DEAD DECLARATIONS report
    const declarationsWithoutCalls = difference(classDeclarations, allClassCalls)

    allDeadDeclarations.push(...declarationsWithoutCalls)

    const declarationsMsg = declarationsWithoutCalls.length ? declarationsWithoutCalls.map(item=>`\n\t\t??? ${item} { ... }`) : [""]
    if (declarationsWithoutCalls.length) console.log("\n\t???? (POTENTIALLY) DEAD SASS in", sassFilePath.replace(PROJECT, ""),...declarationsMsg);



}

console.log(`\n\nFinished Reporting Dead Classes. Checked: \n??? ${allSassFiles.length} .scss file(s) \n??? ${allTsxFiles.length} .tsx/.jsx file(s) \n\n Found: \n??? ${allDeadDeclarations.length} potentially dead class declarations \n??? ${allDeadCalls.length} potentially dead class calls`);


export function countDeadClasses(){
    return {allDeadCalls, allDeadDeclarations}
}
