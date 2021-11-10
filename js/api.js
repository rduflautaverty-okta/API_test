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
        envData.authorization = { Authorization: 'SSWS ' + envData.apiKey };
        return envData;
    }

    async #get(apiUrl, extraHeaders, corsByPass = true) {

        return await this.#send('GET', apiUrl,'', extraHeaders, corsByPass);
    }

    async #post(apiUrl, parameters, extraHeaders, corsByPass = true) {

        return await this.#send('POST', apiUrl, parameters, extraHeaders, corsByPass);
    }

    async #put(apiUrl, parameters, extraHeaders, corsByPass = true) {

        return await this.#send('PUT', apiUrl, parameters, extraHeaders, corsByPass);
    }

    async #delete(apiUrl, extraHeaders, corsByPass = true) {

        return await this.#send('DELETE', apiUrl,'', extraHeaders, corsByPass);
    }

    #send(method, apiUrl, params, extraHeaders, corsByPass) {

        env.log(method + '  ' + apiUrl);

        if(params)
          console.log('Body: ', params);
        const appType = "application/json; charset=utf-8";
        const targetEndPoint = corsByPass ? {'Target-Endpoint': apiUrl} : '';

        const promise = new Promise(function(resolve, reject) {
            $.ajax({
                // Your API or resource server:
                type: method, //'POST' : 'GET'
                url: corsByPass ? '/api' : apiUrl,
                data: params ? JSON.stringify(params) : '',
                contentType: appType,
                dataType: 'json',
                xhrFields: { withCredentials: true },
                headers: {
                    ...targetEndPoint, // has no effect if corsByPass == false
                    'Accept': appType,
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

    #buildQueryUrl(api, parameters) {
        const data = this.#updateUserData();
        let url = `https://${data.company}.${data.domain}.com/api/v1/${api}`;

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
              "password" : { "value": data.password}
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
              "multiOptionalFactorEnroll": false,
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
}

const api = new API();
