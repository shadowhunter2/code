
const pending = 'pending';
const fulfilled = 'fulfilled';
const rejected = 'rejected';

class Promise {
  constructor(executor) {

    this.status = pending;
    this.value = undefined;
    this.reason = undefined;

    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.status === pending) {
        this.value = value;
        this.status = fulfilled;

        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    }

    const reject = (reason) => {
      if (this.status === pending) {
        this.reason = reason;
        this.status = rejected;

        this.onRejectedCallbacks.forEach(fn => fn())
      }
    }

    try {
      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }

  then(onFulfilled, onRejected) {

    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (data) => { return data} ;
    onRejected = typeof onRejected === 'function' ? onRejected : (err) => { throw err} ;

    let promise2 = new Promise((resolve, reject) => {
      if (this.status === fulfilled) {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        });
      }

      if (this.status === rejected) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        });
      }

      if (this.status === pending) {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          });
        })

        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          });
        })
      }
    })

    return promise2
  }

  catch(onRejected){
    this.then(null, onRejected)
  }

  finally(cb){
    this.then((data) => {
      cb();
      return data;
    }, (err) => {
      cb();
      throw err;
    })
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(new TypeError('TypeError: 循环调用了'))
  }

  let called = false
  if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
    try {
      let then = x.then;
      if (typeof then === 'function') {
        then.call(x,
          (y) =>{
            if (called) { return } else { called = true };
            resolvePromise(x, y, resolve, reject);
          },
          (r)=> {
            if (called) { return } else { called = true };
            reject(r)
          }
        )
      }
      else {
        resolve(x)
      }
    } catch (e) {
      if (called) { return } else { called = true };
      reject(e);
    }
  }
  else {
    resolve(x)
  }
}

Promise.deferred = Promise.defer = function () {
  let dfd = {};
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  })
  return dfd
}

Promise.resolve = function(value){
  return new Promise(resolve => resolve(value))
}

Promise.reject = function(reason){
  return new Promise((resolve, reject) => {
    reject(reason)
  })
}

Promise.all = function(...arr){
  let res = [];
  let index = 0;
  return new Promise((resolve, reject) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i].then( data => {
        res[i] = data;
        if(++index === arr.length){
          resolve(res);
        }
      }, err => reject(err))
    }
  })
}

Promise.race = function(...arr){
  return new Promise( (resolve, reject) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i].then(data => {
        resolve(data);
      }, err => reject(err))
    }
  })
}

module.exports = Promise;