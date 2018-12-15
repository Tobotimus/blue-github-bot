const { get } = require('lodash');

exports.parseBody = req =>
  new Promise(resolve => {
    let body = [];
    req
      .on('data', chunk => {
        body.push(chunk);
      })
      .on('end', () => {
        body = Buffer.concat(body).toString();
        if (!body) {
          res.writeHead(400);
          return res.end();
        }
        if (body.length) {
          const data = JSON.parse(body);
          return resolve(data);
        }
        return resolve(null);
      });
  });

exports.checkConditions = (flow, ghObject) =>
  new Promise((resolve, reject) => {
    flow.conditions.forEach((c, i) => {
      console.log('checking', c);
      c.includes.forEach(filter => {
        if (get(ghObject, c.key).includes(filter)) {
          // resolve on first match
          return resolve({ flow, ghObject });
        }
      });
      if (i === flow.conditions.length - 1) {
        return reject(new Error('No conditions matched for the flow'));
      }
    });
  });
