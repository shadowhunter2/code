const fs = require('fs');
const path = require('path')
const {promisify} = require('util');

// mkdir('b/c/d/a', () => { console.log('创建成功') })
// mkdir('b/a/d/a', () => { console.log('创建成功') })


const statAsync = promisify(fs.stat);
const readdirAsync  = promisify(fs.readdir);
const unlinkAsync  = promisify(fs.unlink);
const rmdirAsync  = promisify(fs.rmdir);

// rmdir('b', () => console.log('删除成功'))

async function rmdir(url){
  let arr = [url];
  let dir_res = [];

  while(arr.length){
    let p = arr.shift();

    let statObj = await statAsync(p);
    if(statObj.isDirectory()){
      dir_res.push(p);
      let dirs = await readdirAsync(p);
      dirs = dirs.map( dir => path.resolve(p, dir));
      arr = [...arr, ...dirs];
    }
    else{
      await unlinkAsync(p);
    }
  }

  for(let i = dir_res.length - 1 ;i >= 0 ;i--){
    await rmdirAsync(dir_res[i]);
  }
}

// 异步
function rmdir2(url, cb){
  let arr = [url];
  let dir_res = [];

  function next(){
    if (arr.length === 0) return callback();

    let p = arr.shift();
    fs.stat(p, (err, stat) => {
      if(stat.isDirectory()){
        dir_res.push(p);
        fs.readdir(p, (err, dirs) => {
          dirs = dirs.map(dir => path.resolve(p, dir));
          arr = [...arr, ...dirs];
          next();
        })
      }
      else{
        fs.unlink(p, next)
      }
    })
  }

  next();

  function callback(){
    let rm = () => {
      if(dir_res.length === 0) {
        cb && cb(null)
        return
      }
      let p = dir_res.pop();
      fs.rmdir(p, rm)
    }

    rm()
  }
}

// 同步
function rmwideSync(url){
  let arr = [url];
  let dir_res = [];

  while(arr.length){
    let p = arr.shift();
    let stat = fs.statSync(p);
    if(stat.isDirectory()){
      dir_res.push(p)
      let dirs = fs.readdirSync(p);
      dirs = dirs.map(dir => path.resolve(p, dir))
      arr = [...arr, ...dirs];
    }
    else{
      fs.unlinkSync(p)
    }
  }

  for (let i = dir_res.length -1 ; i >= 0; i--) {
    fs.rmdirSync(dir_res[i])    
  }
}

//测试用
function mkdir(p, cb) {
  let pathArr = p.split('/');
  let index = 0;

  function next() {
    if (index === pathArr.length) return cb(null)
    let _path = pathArr.slice(0, index++ + 1).join('/');

    fs.access(_path, (err, data) => {
      if (err) {
        fs.mkdir(_path, (err, data) => {
          next()
        })
      }
      else {
        next()
      }
    })
  }

  next();
}
