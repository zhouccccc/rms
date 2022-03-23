/* eslint-disable no-restricted-globals */

/**
 * https://webpack.js.org/guides/web-workers/
 * self 是worker上下文最顶端的 workerGlobalScope 对象本身
 */
let intervalInstance;
self.onmessage = ({ data: { state, url, token, sectionId } }) => {
  if (state === 'start') {
    const headers = {
      sectionId,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8',
    };
    intervalInstance = setInterval(() => {
      fetch(url, { headers })
        .then((response) => response.json())
        .then((response) => self.postMessage(response))
        .catch((err) => console.log(`Worker: alertCountPolling => ${err.message}`));
    }, 10 * 1000);
  } else if (state === 'end') {
    clearInterval(intervalInstance);
    intervalInstance = null;
  } else {
    //
  }
};
