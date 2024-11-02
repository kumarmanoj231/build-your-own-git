const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const zlib = require("zlib");

function writeFileBlob(currentPath) {
  const contents = fs.readFileSync(currentPath);
  const len = contents.length;
  const header = `blob ${len}\0`;
  const blob = Buffer.concat([Buffer.from(header), contents]);

  const hash = crypto.createHash("sha1").update(blob).digest("hex");

  const folder = hash.slice(0, 2);
  const file = hash.slice(2);

  const completeFolderPath = path.join(
    process.cwd(),
    ".git",
    "objects",
    currentPath
  );

  const compressedFile = zlib.deflateSync(blob);

  fs.writeFileSync(path.join(completeFolderPath, file), compressedFile);

  return hash;
}

class WriteTreeCommand {
  constructor() {}

  execute() {
    function recursiveCreateTree(basePath) {
      const dirContents = fs.readdirSync(basePath);

      const results = [];

      for (const dirContent of dirContents) {
        if (dirContent.includes(".git")) continue;

        const currentPath = path.join(basePath, dirContent);
        const stat = fs.statSync(currentPath);

        if (stat.isDirectory()) {
          const sha = recursiveCreateTree(currentPath);
          results.push({
            mode: "40000",
            basname: path.basename(currentPath),
            sha,
          });
        } 
        
        else if (stat.isFile()) {
          const sha = writeFileBlob(currentPath);
          results.push({
            mode: "100644",
            basename: path.basename(currentPath),
            sha,
          });
        }
      }


      if(dirContents.length == 0 || results.length == 0) return null;

      const treeData = results.reduce((acc,current)=>{

        const {mode,basename,sha} = current;
        return Buffer.concat([acc,Buffer.from(`${mode} ${basename}\0`),Buffer.from(sha,"hex")]);


      },Buffer.alloc(0))


      const tree = Buffer.concat([Buffer.from(`tree ${treeData.length}\0`),treeData]);

      const hash = crypto.createHash("sha1").update(tree).digest("hex");


      const folder = hash.slice(0, 2);
      const file = hash.slice(2);

      
      const completeTreePath = path.join(process.cwd(),'.git','.objects',folder);

      if(!fs.existsSync(completeTreePath)) fs.mkdirSync(completeTreePath);

      const compressed = zlib.deflateSync(tree);
      fs.writeSync(path.join(completeTreePath,file),compressed);
      return hash;

      return hash;
    }

    const sha = recursiveCreateTree(process.cwd());
    process.stdout.write(sha);
  }
}

module.exports = WriteTreeCommand;
