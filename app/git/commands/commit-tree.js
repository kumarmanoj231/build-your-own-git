const path = require("path");
const fs = require("fs");
const zlib = require("zlib");
const crypto = require("crypto");

class CommitTreeCommand{

    constructor(tree,parentSha,commitMsg){
        this.tree = tree;
        this.parentSha = parentSha;
        this.commitMsg  = commitMsg;

    }

    execute(){
        const commitContentBuffer = Buffer.concat([Buffer.from(`tree ${this.tree}\n`),
            Buffer.from(`parent ${this.parentSha}\n`),
            Buffer.from(`Author: kumarmanoj231 <lodhamanoj383@gmail.com> ${Date.now()} +0000\n`),
            Buffer.from(`committer kumarmanoj231 <lodhamanoj383@gmail.com> ${Date.now()} +0000\n\n`),
            Buffer.from(`${this.commitMsg}\n`),
        ]);

        const header = `commit ${commitContentBuffer.length}\0`;
        const data = Buffer.concat([Buffer.from(header),commitContentBuffer]);
        

        const hash = crypto.createHash("sha1").update(data).digest("hex");

  
        const folder = hash.slice(0, 2);
        const file = hash.slice(2);

        
        const completeTreePath = path.join(process.cwd(),'.git','.objects',folder);

        if(!fs.existsSync(completeTreePath)) fs.mkdirSync(completeTreePath);
        
      const compressed = zlib.deflateSync(data);
      fs.writeSync(path.join(completeTreePath,file),compressed);
      process.stdout.write(hash);

    }

}

module.exports = CommitTreeCommand;