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
    const failed = [];
    flow.conditions.forEach((c, i) => {
      // includes
      if (c.includes) {
        c.includes.forEach(filter => {
          if (!get(ghObject, c.key).includes(filter)) {
            // resolve on first fail
            failed.push(c);
          }
        });
      }
      // equals
      if (c.equals) {
        if (get(ghObject, c.key) !== c.equals) {
          failed.push(c);
          return;
        }
      }
    });
    if (failed.length) {
      console.error('Failed Conditions', failed);
      return reject(new Error('One or more conditions did not match'));
    } else {
      return resolve({ flow, ghObject });
    }
  });
