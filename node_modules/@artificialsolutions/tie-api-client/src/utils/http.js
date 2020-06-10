'use strict';

require('es6-promise').polyfill();
require('isomorphic-fetch');

const querystring = require('querystring');

const generateHeaders = (additionalHeaders) => {
  const headers = new Headers();
  headers.append('Accept', 'application/json;charset=UTF-8');
  headers.append('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
  Object.keys(additionalHeaders).forEach((key) => {
    headers.append(key, additionalHeaders[key]);
  });
  return headers;
};

module.exports = {
  post: (url, data, headers = {}) => {
    const request = fetch(url, {
      headers: generateHeaders(headers),
      method: 'POST',
      credentials: 'include',
      body: querystring.stringify(data)
    });

    return request
      .then((response) => {
        if (response.status >= 400) {
          throw new Error(`Received error code ${response.status}`);
        }

        return response.json();
      });
  }
};
