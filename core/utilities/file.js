const fs = require("fs");

// Loads in a file at the specified path.
function readFile(path) {
    return fs.readFileSync(path, "utf8");
}

// Writes a string to a file specified by path.
function writeFile(path, content, append = false) {
    if (path.includes("/")) {
        const dirPath = path.substring(0, path.lastIndexOf("/"));
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }
    }

    if (append) {
        fs.appendFileSync(path, content);
    }
    else {
        fs.writeFileSync(path, content);
    }
}

module.exports = {
    readFile,
    writeFile
};