const OktaJwtVerifier = require('@okta/jwt-verifier');
const { getBaseUrl } = require("get-base-url");
const request = require('request');


exports.verifytoken = (req, res, next) => {
    // do a jwt check only if we use a bearer token
    const targetURL = req.header('Target-Endpoint');

    if (targetURL) {
        const oktaDomain = getBaseUrl(targetURL);
        const oktaJwtVerifier = new OktaJwtVerifier({
          issuer: `https://${oktaDomain}/oauth2/default` // required
        });

        const header = req.headers['authorization'];

          if (header?.substring(0, 6).toUpperCase() == 'BEARER') {
            const token = header.split(' ')[1];
            oktaJwtVerifier.verifyAccessToken(token, 'api://default')
            .then(jwt => next())
            .catch(err => {
                console.warn('token failed validation: ', err);
                console.log('domain: ', oktaDomain);
                console.log('access token:', token);
            });
          } else {
            // Forbidden
            // res.sendStatus(403);
            next();
          }
    } else {
          res.send(500, { error: 'There is no Target-Endpoint header in the request' });
    }
}


exports.checkMessage = (req, res, next) => {

    // Set CORS headers: allow all origins, methods, and headers: you may want to lock this down in a production environment\
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE, HEAD, OPTIONS");
    res.header("Access-Control-Allow-Headers", "authorization,content-type");

    if (req.method === 'OPTIONS') {
        // CORS Preflight\
        res.send();
    } else {
        const targetURL = req.header('Target-Endpoint');
        if (!targetURL) {
            res.send(500, { error: 'There is no Target-Endpoint header in the request' });
            return;
        }

        request({ url: targetURL, method: req.method, json: req.body, headers: {
          'Authorization': req.header('Authorization'),
          'content-type': req.header('content-type'),
          'Accept': req.header('Accept'),
        }},
            function (error, response, body) {
                if (error) {
                    console.error('error: ' + response?.statusCode)
            };
        }).pipe(res);
    }
}
