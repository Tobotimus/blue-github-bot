const axios = require('axios');
const { find, filter, flow } = require('lodash/fp');
const { getJWT, getAppToken } = require('./auth.js');
const { parseBody, checkConditions } = require('./utils');
const { flows } = require('./red');

let ghToken = null;
let installation = null;

const runFlow = (data, workflow) =>
  new Promise((resolve, reject) => {
    const ghObject = data[workflow.object];
    checkConditions(workflow, ghObject)
      .then(() => {
        // get bse app token
        const token = getJWT();
        // get installation-related token
        return getAppToken(installation, token, { ghObject, workflow });
      })
      .then(({ authToken }) => {
        // for PRs or issues
        const issueUrl = ghObject.issue_url || ghObject.url;

        return axios.patch(
          issueUrl,
          {
            ...flow.action
          },
          {
            headers: {
              Authorization: `token ${authToken}`,
              Accept: 'application/vnd.github.machine-man-preview+json'
            }
          }
        );
      })
      .then(r => resolve({ result: r, workflow }))
      .catch(e => reject(e));
  });

module.exports = (req, res) => {
  parseBody(req)
    .then(data => {
      installation = data.installation.id;
      return Promise.resolve(data);
    })
    .then(data => {
      const matchingFlows = flow(
        find(i => i.id === installation),
        filter(i => i.events.includes(data.action)),
        filter(i => !!data[i.object])
      )(flows);

      if (!matchingFlows || !matchingFlows.length) {
        throw new Error(
          'No flows found for the installation / action / object'
        );
      }

      return Promise.all(
        matchingFlows.map(workflow => runFlow(data, workflow))
      );
    })
    .then(r => {
      if (r.length) {
        r.forEach(({ workflow }) => {
          console.log('ran flow', workflow.label);
        });
      }
      res.statusCode = 200;
      res.end();
    })
    .catch(e => {
      console.error(e);
      res.statusCode = 200;
      res.end();
    });
};
