class API {

    constructor() {
        console.log(this.#updateUserData());
        $.ajaxSetup({
          xhrFields: {
        withCredentials: true
        }
      });
    }

    #updateUserData() {
        const envData = env.getEnvData();
        envData.groupname = 'Cors Test Users';
        envData.securityResponse = 'pasta';
        envData.authorization = { Authorization : 'SSWS ' + envData.apiKey };
        return envData;
    }

    async #get(apiUrl, extraHeaders, corsByPass = true) {

        return await this.#send('GET', apiUrl,'', extraHeaders, corsByPass);
    }

    async #post(apiUrl, parameters, extraHeaders, corsByPass = true, urlEncode = false) {

        return await this.#send('POST', apiUrl, parameters, extraHeaders, corsByPass, urlEncode);
    }

    async #put(apiUrl, parameters, extraHeaders, corsByPass = true) {

        return await this.#send('PUT', apiUrl, parameters, extraHeaders, corsByPass);
    }

    async #delete(apiUrl, extraHeaders, corsByPass = true) {

        return await this.#send('DELETE', apiUrl,'', extraHeaders, corsByPass);
    }

    #send(method, apiUrl, params, extraHeaders, corsByPass, urlEncode) {

        env.log(method + '  ' + apiUrl);

        if(params)
            console.log('Body: ', params);

        let appType = urlEncode? 'application/x-www-form-urlencoded' : "application/json";
        const targetEndPoint = corsByPass ? {'Target-Endpoint': apiUrl} : '';
        appType += "; charset=utf-8";

        const promise = new Promise(function(resolve, reject) {
            $.ajax({
                // Your API or resource server:
                type: method, //'POST' : 'GET'
                url: corsByPass ? '/api' : apiUrl,
                data: params ? JSON.stringify(params) : '',
                contentType: appType,
                dataType: 'json',
                //xhrFields: { withCredentials: true },
                headers: {
                    ...targetEndPoint, // has no effect if corsByPass == false
                    ...extraHeaders
                },
                success: function (res) {
                    console.log('Identity Provider response: ', res);
                    resolve(res);
                },
                error: function (res) {
                    reject(res);
                }
            });
        });
        return promise;
    }

    #buildQueryUrl(api, parameters, OAuth = false) {
        const data = this.#updateUserData();

        let url = `https://${data.subdomain}.${data.domain}.com/`;
        url += OAuth? `oauth2/default/v1` : `api/v1`;
        url += `/${api}`;

        if(parameters)
            url += '?' + $.param(parameters);

        return url;
    }

    createActivatedUser() {

        const data = this.#updateUserData();
        const params = { activate : true };

        const body = {
            "profile": {
              "firstName": data.fname,
              "lastName": data.lname,
              "email": data.username,
              "login": data.username
            },
            "credentials": {
              "password" : { "value": data.password }
            }
        };

        return this.#post(this.#buildQueryUrl('users', params), body, data.authorization);
    }

    findUser() {

      const data = this.#updateUserData();
      const params = { q : data.username };

      return this.#get(this.#buildQueryUrl('users', params), data.authorization);
    }

    listUsers(byPass = true) {

      const data = this.#updateUserData();
      const params = { limit : 25 };

      return this.#get(this.#buildQueryUrl('users', params), data.authorization, byPass);
    }

    deleteUser(userId) {
        const data = this.#updateUserData();
        return this.#delete(this.#buildQueryUrl(`users/${userId}`), data.authorization);
    }

    deactivateUser(userId) {
        const data = this.#updateUserData();
        return this.#post(this.#buildQueryUrl(`users/${userId}/lifecycle/deactivate`),'', data.authorization);
    }

    enrollSecurityQuestions(userId) {
        const data = this.#updateUserData();

        const body = {
            "factorType": "question",
            "provider": "OKTA",
            "profile": {
              "question": "disliked_food",
              "answer": data.securityResponse
            }
        };

        return this.#post(this.#buildQueryUrl(`users/${userId}/factors`), body, data.authorization);
    }

    verifyQuestionFactor(userId, factorId) {
        const data = this.#updateUserData();

        const body = {
            "answer": data.securityResponse
        };

        return this.#post(this.#buildQueryUrl(`users/${userId}/factors/${factorId}/verify`), body, data.authorization);
    }

    listFactors(userId) {
        const data = this.#updateUserData();
        return this.#get(this.#buildQueryUrl(`users/${userId}/factors`), data.authorization);
    }

    verifyEmailFactor(userId, factorId) {
        const data = this.#updateUserData();
        return this.#post(this.#buildQueryUrl(`users/${userId}/factors/${factorId}/verify`), '', data.authorization);
    }

    authenticate() {
        const data = this.#updateUserData();

        const body = {
            "username": data.username,
            "password": data.password,
            "options": {
              "multiOptionalFactorEnroll": true,
              "warnBeforePasswordExpired": false
            }
        };

        return this.#post(this.#buildQueryUrl(`authn`), body, data.authorization);
    }

    createSession(sessionToken) {
        const data = this.#updateUserData();

        const body = {
            "sessionToken": sessionToken
        };

        return this.#post(this.#buildQueryUrl(`sessions`), body, data.authorization);
    }

    validateSession(sessionId) {
        const data = this.#updateUserData();
        return this.#get(this.#buildQueryUrl(`sessions/${sessionId}`), data.authorization);
    }

    getCurrentSession() {
        return this.#get(this.#buildQueryUrl(`sessions/me`),'', false);
    }

    refreshCurrentSession() {
        return this.#post(this.#buildQueryUrl(`sessions/me/lifecycle/refresh`),'','', false);
    }

    closeCurrentSession() {
        return this.#delete(this.#buildQueryUrl(`sessions/me`),'', false);
    }

    listFeatures() {
        const data = this.#updateUserData();
        return this.#get(this.#buildQueryUrl(`features`), data.authorization);
    }

    getFeature(featureId) {
        const data = this.#updateUserData();
        return this.#get(this.#buildQueryUrl(`features/${featureId}`), data.authorization, false);
    }

    getUser(userId) {
        const data = this.#updateUserData();
        return this.#get(this.#buildQueryUrl(`users/${userId}`), data.authorization, false);
    }

     getCurrentUser() {
        const data = this.#updateUserData();
        return this.#get(this.#buildQueryUrl(`users/me`), data.authorization);
    }

    updateUser() {
        const data = this.#updateUserData();
        const body = {
            "profile": {
                "mobilePhone": Math.floor(Math.random() * 9999999999).toString()
            }
        }

        return this.#post(this.#buildQueryUrl(`users/me`), body, data.authorization, false);
    }

    assignedAppLinks(userId) {
        const data = this.#updateUserData();
        return this.#get(this.#buildQueryUrl(`users/${userId}/appLinks`), data.authorization, false);
    }

    getUserGroup(userId) {
        const data = this.#updateUserData();
        return this.#get(this.#buildQueryUrl(`users/${userId}/groups`), data.authorization, false);
    }

    clearCurrentUserSession() {
        const data = this.#updateUserData(); // need trusted origin
        return this.#post(this.#buildQueryUrl(`users/me/lifecycle/delete_sessions`), data.authorization, false);
    }

    clearAllSessions(userId) {
        const data = this.#updateUserData();
        return this.#delete(this.#buildQueryUrl(`users/${userId}`), data.authorization, false);
    }

    findGroup() {

        const data = this.#updateUserData();
        const params = { q : data.groupname };

        return this.#get(this.#buildQueryUrl('groups', params), data.authorization);
    }

    removeGroup(groupId) {
        const data = this.#updateUserData();
        return this.#delete(this.#buildQueryUrl(`groups/${groupId}`), data.authorization);
    }

    addGroup() {

        const data = this.#updateUserData();
        const body = {
            "profile": {
                "name": data.groupname,
                "description": data.groupname
            }
        };

        return this.#post(this.#buildQueryUrl('groups'), body, data.authorization);
    }

    addUserToGroup(groupId, userId) {
        const data = this.#updateUserData();
        return this.#put(this.#buildQueryUrl(`groups/${groupId}/users/${userId}`),'', data.authorization);
    }

    findApp() {
        const data = this.#updateUserData();
        const params = { q : data.appName };
        return this.#get(this.#buildQueryUrl(`apps`, params), data.authorization);
    }

    deactivateApp(appId) {
        const data = this.#updateUserData();
        return this.#post(this.#buildQueryUrl(`apps/${appId}/lifecycle/deactivate`),'', data.authorization);
    }

    deleteApp(appId) {
        const data = this.#updateUserData();
        return this.#delete(this.#buildQueryUrl(`apps/${appId}`), data.authorization);
    }

    addOAuth2Client() {

        const data = this.#updateUserData();

        const body = {
            "name": "oidc_client",
            "label": data.appName,
            "signOnMode": "OPENID_CONNECT",
            "credentials": {
              "oauthClient": {
                "token_endpoint_auth_method": "none"
              }
            },
            "settings": {
              "oauthClient": {
                "client_uri": data.redirectUri,
                "logo_uri": "http://developer.okta.com/assets/images/logo-new.png",
                "redirect_uris": [
                    data.redirectUri
                ],
                "response_types": [
                  "token",
                  "id_token",
                  "code"
                ],
                "grant_types": [
                  "implicit",
                  "authorization_code"
                ],
                "application_type": "browser"
              }
            }
        }

        return this.#post(this.#buildQueryUrl('apps'), body, data.authorization);
    }

    assignGroupToApp(appId, groupId) {

        const data = this.#updateUserData();
        return this.#put(this.#buildQueryUrl(`apps/${appId}/groups/${groupId}`),'', data.authorization);
    }

    findtrustedOrigin() {
        const data = this.#updateUserData();
        const params = { q : data.appName };
        return this.#get(this.#buildQueryUrl(`trustedOrigins`, params), data.authorization);
    }

    deactivateOrigin(trustedOriginId) {
        const data = this.#updateUserData();
        return this.#post(this.#buildQueryUrl(`trustedOrigins/${trustedOriginId}/lifecycle/deactivate`),'', data.authorization);
    }

    deleteOrigin(trustedOriginId) {
        const data = this.#updateUserData();
        return this.#delete(this.#buildQueryUrl(`trustedOrigins/${trustedOriginId}`), data.authorization);
    }

    addTrustedOrigin() {
        const data = this.#updateUserData();
        const body = {
            "name": data.appName,
            "origin": data.redirectUri,
            "scopes": [
              {
                "type": "CORS"
              },
              {
                "type": "REDIRECT"
              }
            ]
        }
        return this.#post(this.#buildQueryUrl(`trustedOrigins`),body, data.authorization);
    }

    getIdToken(clientId, sessionToken) {

       const data = this.#updateUserData();

        const params = {
            client_id : clientId,
            response_type : 'id_token token',
            scope : "profile openid email",
            prompt : 'none',
            redirect_uri : data.redirectUri,
            sessionToken : sessionToken,
            state : this.#randomCharacters(50),
            nonce : this.#randomCharacters()
        };

        env.saveEnvData({ state : params.state }); // save the state to validate data later on
        const url = this.#buildQueryUrl(`authorize`, params, true);    
        console.log(url);
        window.open( url /*,'_self'*/);
    }

    async getAuthCode(clientId, sessionToken) {

        const data = this.#updateUserData();
        const verifier = this.#randomCharacters(50);
        const hash = await this.#sha256(verifier);
        const challenge = this.#toBase64Url(hash);
 
        const params = {
            client_id : clientId,
            response_type : 'code',
            scope : "profile openid email",
            prompt : 'none',
            code_challenge : challenge,
            code_challenge_method : 'S256',
            redirect_uri : data.redirectUri,
            sessionToken : sessionToken,
            state : this.#randomCharacters(50)
        };

        console.log('challenge', challenge);
        env.saveEnvData({ state : params.state, verifier : verifier }); // save the state to validate data later on
        const url = this.#buildQueryUrl(`authorize`, params, true);    
        env .log(url);
        window.open( url /*,'_self'*/);
    }

    async exchangeCode(authCode, verifier, clientId) {

        const data = this.#updateUserData();

        const params = {
            code : authCode,                                  
            code_verifier : verifier,
            client_id : clientId,
            grant_type : 'authorization_code',
            redirect_uri : data.redirectUri
        };

        // display the challenge to compare it with login page
        const hash = await this.#sha256(verifier);
        const challenge = this.#toBase64Url(hash);
        console.log('challenge', challenge);

        return this.#post(this.#buildQueryUrl(`token`, params, true), '','', true, true);
    }
    
    introspect(token, hint, clientId) {

        const params = {
            client_id : clientId,
            token : token,
            token_type_hint: hint
        };

        return this.#post(this.#buildQueryUrl(`introspect`, params, true),'','', true, true);
    }

    userInfo(accessToken) {
        return this.#post(this.#buildQueryUrl(`userinfo`,'', true),'',{ Authorization : `Bearer ${accessToken}`}, true, true);
    }

    #randomCharacters(length = 10) {
        var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var result = '';
        for ( var i = 0; i < length; i++ ) {
            result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
        }
        return result;
    }

    #sha256(verifier) {
        const encoder = new TextEncoder();
        const data = encoder.encode(verifier);
        return window.crypto.subtle.digest('SHA-256', data);
    }

    #toBase64Url(hash) {
        const base64Hash = btoa(String.fromCharCode.apply(null, new Uint8Array(hash)))
        return base64Hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
}

const api = new API();
