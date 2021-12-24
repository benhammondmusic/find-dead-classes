// Index all files in a folder/sub folders
import { walk } from "@root/walk";
import fs from "fs"

const PROJECT = "../health-equity-tracker/frontend"


/*
Accepts two Arrays
Returns items from LEFT that aren't in RIGHT
*/
function difference(leftArray, rightArray) {
    let _difference = new Set(leftArray)
    for (let elem of rightArray) {
        _difference.delete(elem)
    }
    return Array.from(_difference)
}

/*
Helper fn to walk through project directory
*/
const walkFunc = async (err, pathname, dirent) => {
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
const allSassFiles = []
const allTsxFiles = []
await walk(PROJECT, walkFunc);

for (const sassFilePath of allSassFiles) {
    const sassFileName = sassFilePath.split("/").at(-1)

    // collect all CLASS DECLARATIONS from the scss
    const bufferSass = fs.readFileSync(sassFilePath);
    const sassCode = bufferSass.toString()
    const regexForClassDeclarations = /[.][A-Z][A-Za-z]+/gm
    const classDeclarations = sassCode.match(regexForClassDeclarations)
    if (!classDeclarations) continue

    // collect all CLASS CALLS from all .TSX files that import current .SCSS
    const classCalls = []
    for (const tsxFilePath of allTsxFiles) {
        const bufferTsx = fs.readFileSync(tsxFilePath);
        const tsxCode = bufferTsx.toString()
        const codeLines = tsxCode.split("\n")
        const importLine = codeLines.find(line=>line.startsWith("import styles from"))

        if (importLine?.endsWith(`${sassFileName}";`)) {
            const regexForClassCalls = /styles.[A-Z][a-zA-Z]+/gm
            const foundClassCalls = tsxCode.match(regexForClassCalls).map(style=>style.replace("styles", ""))
            classCalls.push(...foundClassCalls)
        }
        if (!classCalls) continue
    }

    // construct the report
    const declarationsWithoutCalls = difference(classDeclarations, classCalls)
    const declarationsMsg = declarationsWithoutCalls.length ? declarationsWithoutCalls.map(item=>`\n😵 ${item}`) : "\n🤩ALL GOOD!"
    const callsWithoutDeclarations = difference(classCalls, classDeclarations)
    const callsMsg = callsWithoutDeclarations.length ? callsWithoutDeclarations.map(item=>`\n😵 ${item}`) : "\n🤩ALL GOOD!"

    console.log("\n-------------------------");
    console.log("FILE:", sassFilePath.replace(PROJECT, ""));
    console.log("\nDEAD SASS:", ...declarationsMsg);
    console.log("\nDEAD  TSX:", ...callsMsg);
}
