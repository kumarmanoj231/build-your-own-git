const path = require("path");
const zlib = require("zlib");
const fs = require("fs");

class LSTreeCommand{
    constructor(flag,sha){
        this.flag = flag;
        this.sha = sha;
    }
    execute(){
        const flag = this.flag;
        const sha = this.sha;

        const folderPath = sha.slice(0,2);
        const filePath = sha.slice(2);

        const completeFolderPath = path.join(process.cwd(),'.git','objects',folderPath);
        const completeFilePath = path.join(completeFolderPath,filePath);


        if(!fs.existsSync(completeFolderPath)){
            throw new Error(`Not a valid object name ${sha}`);
        }

        if(!fs.existsSync(completeFilePath)){
            throw new Error(`Not a valid object name ${sha}`);
        }


        const fileContents  = fs.readFileSync(completeFilePath);
        const outputBuffer = zlib.inflateSync(fileContents);
        const output = outputBuffer.toString().split("\0");
        
        const treeContent = output.slice(1).filter((e)=> e.includes(" "));
        const names = treeContent.map((e)=> e.split(" ")[1]);
        const modeContent = treeContent.map((e)=>e.split(" ")[0]);

        // const modeInt = treeContent.map((e)=>e.match(/\d+/g));
        

        console.log(names);
        if(flag == '--name-only'){
            names.forEach((name)=>{
                process.stdout.write(`${name} \n`);
            })
        }


    }

}

module.exports = LSTreeCommand;