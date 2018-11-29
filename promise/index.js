const Promise = require('./promise');
const fs = require('fs');


// new Promise((resolve, reject) => {
//   reject(200)
// }).catch(err => console.log(err))

// Promise.reject(1).catch(data => console.log(data))

// let obj = { 0: 1, 1: 2, 2: 3, length: 3, [Symbol.iterator]: function(){
//   let index = 0;
//   let that = this;
//   return {
//     next: function(){
//       return { value: that[index++], done: index === that.length + 1}
//     }
//   }
// }};

// let obj = { 0: 1, 1: 2, 2: 3, length: 3, [Symbol.iterator]: function *() {
//     let index = 0;
//     while(index < this.length){
//       yield this[index++]
//     }
//   }
// }

// function * say() {
//   yield 'node';
//   yield 'react';
//   yield 'vue';
//   return 'javascript'
// }
// // 如何遍历迭代器 遍历到done 为true时
// let it = say();
// let flag = false;
// do{
//   let {value, done} = it.next();
//   console.log(value)
//   flag = done
// }while(!flag)

function promiseify(fn){
  return function(...args){
    return new Promise((resolve, reject) => {
      fn(...args, (err, data) => {
        if(err) return reject(err);
        resolve(data)
      })
    })
  }
}

let read = promiseify(fs.readFile);

function *go(){
  let path1 = yield read('1.txt', 'utf8');
  let path2 = yield read(path1, 'utf8');
  let res = yield read(path2, 'utf8');
  return res;
}

function co(it){
  return new Promise((resolve, reject) => {
    function next(res){
      let {value, done} = it.next(res);
      if(done){
        resolve(value)
      }
      else{
        value.then((data) => {
          next(data)
        }, err => reject(err))
      }
    }
    next()
  })
}

// co(go()).then( data => console.log(data), err => console.log(err))
Promise.race(read('1.txt', 'utf8'), read('2.txt', 'utf8'), read('3.txt', 'utf8')).then(res => console.log(res))



