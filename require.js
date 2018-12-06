const path = require('path');
const fs = require('fs');
const vm = require('vm');

class Module{
  constructor(id){
    this.id = id;
    this.exports = {};
  }
}

Module._catch = {};

Module.wrap = function(code){
  return `(function(exports, req, module, __dirname, __filename){ ${code} })`
}

Module._extensions = {
  '.js'(module){
    let content = fs.readFileSync(module.id, 'utf8');
    console.log('dule')
    let strCode = Module.wrap(content);
    let fn = vm.runInThisContext(strCode);
    fn.call(module.exports, module.exports, req, module)
  },
  '.json'(module){
    let content = fs.readFileSync(module.id, 'utf8');
    module.exports = JSON.parse(content);
  }
}

const ext_arr = ['.js', '.json', '.node']

function req(relPath){
  let absPath = path.resolve(__dirname, relPath);
  let filename = _resolveFilename(absPath);

  if(filename === ''){
    throw new Error('找不到文件')
  }

  let catchModule = Module._catch[filename];
  if(catchModule) return catchModule.exports;

  let extname = path.extname(filename);

  let module = new Module(filename);
  Module._extensions[extname](module);

  Module._catch[filename] = module;
  return module.exports;
}

function _resolveFilename(absPath){
  let filename = '';
  if (fs.existsSync(absPath)) {
    filename = absPath;
  }
  else {
    for (let i = 0; i < ext_arr.length; i++) {
      const ext = ext_arr[i];

      if (fs.existsSync(absPath + ext)) {
        filename = absPath + ext
        break;
      }
    }
  }
  return filename
}

const res = req('./a');
const res2 = req('./a.js');

console.log(res);
console.log(res2);
