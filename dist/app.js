#! /usr/bin/env node
import { walk } from "@root/walk";
import { readFileSync } from "fs";
const PROJECT = process.argv?.[2] || "./";
const allSassFiles = [];
const allTsxFiles = [];
function difference(leftArray, rightArray) {
    let _difference = new Set(leftArray);
    for (let elem of rightArray) {
        _difference.delete(elem);
    }
    return Array.from(_difference);
}
const walkFunc = async (err, pathname, dirent) => {
    if (err) {
        console.log(err);
        throw err;
    }
    if (dirent.isDirectory() && (dirent.name.startsWith(".") || dirent.name === "node_modules"))
        return false;
    if (pathname.endsWith(".scss"))
        allSassFiles.push(pathname);
    if (pathname.endsWith(".tsx") || pathname.endsWith(".jsx"))
        allTsxFiles.push(pathname);
};
await walk(PROJECT, walkFunc);
for (const sassFilePath of allSassFiles) {
    const sassFileName = sassFilePath.split("/").at(-1);
    console.log("\n\n\n-------------------------");
    console.log(sassFileName);
    console.log("-------------------------");
    const bufferSass = readFileSync(sassFilePath);
    const sassCode = bufferSass.toString();
    const regexForClassDeclarations = /[.][A-Z][A-Za-z]+/gm;
    const classDeclarations = sassCode.match(regexForClassDeclarations);
    if (!classDeclarations)
        continue;
    const allClassCalls = [];
    for (const tsxFilePath of allTsxFiles) {
        const bufferTsx = readFileSync(tsxFilePath);
        const tsxCode = bufferTsx.toString();
        const codeLines = tsxCode.split("\n");
        const importLine = codeLines.find((line) => line.startsWith("import styles from"));
        if (importLine?.endsWith(`${sassFileName}";`)) {
            const regexForClassCalls = /styles.[A-Z][a-zA-Z]+/gm;
            const foundClassCalls = tsxCode.match(regexForClassCalls)?.map((style) => style.replace("styles", "")) || [];
            const callsWithoutDeclarations = difference(foundClassCalls, classDeclarations);
            const callsMsg = callsWithoutDeclarations.length ? callsWithoutDeclarations.map(item => `\n\t\t‣ styles${item}`) : [""];
            if (callsWithoutDeclarations.length)
                console.log("\n\t😵 (POTENTIALLY) DEAD TSX in", tsxFilePath.replace(PROJECT, ""), ...callsMsg);
            allClassCalls.push(...foundClassCalls);
        }
        if (!allClassCalls)
            continue;
    }
    const declarationsWithoutCalls = difference(classDeclarations, allClassCalls);
    const declarationsMsg = declarationsWithoutCalls.length ? declarationsWithoutCalls.map(item => `\n\t\t‣ ${item} { ... }`) : [""];
    if (declarationsWithoutCalls.length)
        console.log("\n\t😵 (POTENTIALLY) DEAD SASS in", sassFilePath.replace(PROJECT, ""), ...declarationsMsg);
}
console.log("\n\nFinished Reporting Dead Classes\n\n");
//# sourceMappingURL=app.js.map