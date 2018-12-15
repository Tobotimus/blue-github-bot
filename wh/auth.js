const jwt = require('jsonwebtoken');
const axios = require('axios');

exports.getJWT = () => {
  const key = new Buffer(process.env.APP_KEY, 'base64');
  return jwt.sign(
    {
      iat: parseInt((Date.now() / 1000).toFixed(0), 10),
      exp: parseInt((Date.now() / 1000).toFixed(0), 10) + 2 * 60, // 10 minutes
      iss: 22289
    },
    key,
    { algorithm: 'RS256' }
  );
};

exports.getAppToken = (installation, token, data) =>
  axios
    .post(
      `https://api.github.com/app/installations/${installation}/access_tokens`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.machine-man-preview+json'
        }
      }
    )
    .then(r => Promise.resolve({ authToken: r.data.token, data }));
