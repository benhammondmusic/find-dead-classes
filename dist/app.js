var _a;
import { walk } from "@root/walk";
import { readFileSync } from "fs";
const PROJECT = "../health-equity-tracker/frontend";
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
    if (pathname.endsWith(".tsx"))
        allTsxFiles.push(pathname);
};
await walk(PROJECT, walkFunc);
for (const sassFilePath of allSassFiles) {
    console.log(sassFilePath);
    const sassFileName = sassFilePath.split("/").at(-1);
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
        const importLine = codeLines.find(line => line.startsWith("import styles from"));
        if (importLine === null || importLine === void 0 ? void 0 : importLine.endsWith(`${sassFileName}";`)) {
            const regexForClassCalls = /className={styles.[A-Z][a-zA-Z]+/gm;
            const foundClassCalls = ((_a = tsxCode.match(regexForClassCalls)) === null || _a === void 0 ? void 0 : _a.map(style => style.replace("className={styles", ""))) || [];
            const callsWithoutDeclarations = difference(foundClassCalls, classDeclarations);
            const callsMsg = callsWithoutDeclarations.length ? callsWithoutDeclarations.map(item => `\n😵 className={styles${item}}`) : ["\n✅ALL GOOD!"];
            console.log("\n- DEAD TSX in", tsxFilePath.replace(PROJECT, ""), "-", ...callsMsg);
            allClassCalls.push(...foundClassCalls);
        }
        if (!allClassCalls)
            continue;
    }
    const declarationsWithoutCalls = difference(classDeclarations, allClassCalls);
    const declarationsMsg = declarationsWithoutCalls.length ? declarationsWithoutCalls.map(item => `\n😵 ${item} { ... }`) : ["\n✅ALL GOOD!"];
    console.log("\n* DEAD SASS in", sassFilePath.replace(PROJECT, ""), "*", ...declarationsMsg);
    console.log("\n-------------------------");
}
//# sourceMappingURL=app.js.map