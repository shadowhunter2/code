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

        this.onFulfilledCallbacks.forEach(fn => fn())
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
    } catch (error) {
      reject(error)
    }
  }


  then(onFulfilled, onRejected) {

    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : function (data) { return data };
    onRejected = typeof onRejected === 'function' ? onRejected : function (err) { throw err };

    let promise2 = new Promise((resolve, reject) => {
      if (this.status === fulfilled) {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        });
      }

      if (this.status === rejected) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        });
      }

      if (this.status === pending) {

        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          });
        })

        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          });
        })
      }
    })
    return promise2;

  }
}

function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(new TypeError('TypeError: chaining cycle error'))
  }

  let called = false;
  if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
    try {
      let then = x.then;
      if (typeof then === 'function') {
        then.call(x,
          function (y) {
            if (called) { return } else { called = true };
            resolvePromise(x, y, resolve, reject)
          },
          function (r) {
            if (called) { return } else { called = true };
            reject(r)
          }
        )
      }
      else {
        resolve(x);
      }
    } catch (error) {
      if (called) { return } else { called = true };
      reject(error)
    }
  }
  else {
    resolve(x);
  }
}

Promise.deferred = Promise.defer = function () {
  let dfd = {};
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  })
  return dfd;
}



module.exports = Promise;