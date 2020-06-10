'use strict';

const hasCallback = (fn, args) => fn.length === args.length;

const padArgs = (args, arity) => Array.from(new Array(arity), (_, i) => args[i]);

const promisify = (fn) => (...args) => new Promise((resolve, reject) => {
  const paddedArgs = padArgs(args, fn.length - 1);

  fn(...paddedArgs, (error, result) => {
    if (error) reject(error);
    resolve(result);
  });
});

module.exports = function callbackOrPromise(fn) {
  return (...args) => {
    if (hasCallback(fn, args)) {
      fn(...args);
      return;
    }

    return promisify(fn)(...args);
  };
};
