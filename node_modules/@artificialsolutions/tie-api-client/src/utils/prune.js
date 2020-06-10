'use strict';

module.exports = function prune(keys) {
  return (obj) => Object.keys(obj).reduce((result, key) => {
    if (keys.includes(key)) return result;
    return Object.assign({}, result, { [key]: obj[key] });
  }, {});
};
