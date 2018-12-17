const axios = require('axios');
const { find, filter, flow } = require('lodash/fp');
const { pick, mergeWith } = require('lodash');
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
        const issueUrl = ghObject.issue_url || ghObject.url;
        const changingKeys = Object.keys(workflow.action);
        const merger = (objValue, srcValue) => {
          if (Array.isArray(objValue)) {
            return [].concat(objValue, srcValue);
          }
        };
        const newData = mergeWith(
          {},
          pick(ghObject, changingKeys),
          workflow.action,
          merger
        );

        return axios.patch(issueUrl, newData, {
          headers: {
            Authorization: `token ${authToken}`,
            Accept: 'application/vnd.github.machine-man-preview+json'
          }
        });
      })
      .then(r => {
        resolve({ result: r, workflow });
      })
      .catch(e => resolve({ error: e }));
  });

module.exports = (req, res) => {
  parseBody(req)
    .then(data => {
      installation = data.installation.id;
      return Promise.resolve(data);
    })
    .then(data => {
      const installationFlows = flows.find(i => i.id === installation).flows;
      const matchingFlows = flow(
        filter(i => i.events.includes(data.action)),
        filter(i => !!data[i.object])
      )(installationFlows);

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
        r.forEach(({ error, workflow }) => {
          if (!error) {
            console.log('ran flow', workflow.label);
          }
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
