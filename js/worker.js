class Worker {

    constructor() {
        const parameters = this.#getSearchParameters();
        this.init(parameters);
    }
    
    async init(parameters) {
        
        let accessToken = parameters?.access_token;
        let idToken = parameters?.id_token;        
        const authCode = parameters?.code;

        const state = env.getEnvData('state');
        const clientId = env.getEnvData('clientId');

        if(Object.keys(parameters).length)
            console.log(parameters);

        if(!(parameters && state !== parameters?.state))
        {
            if(authCode) { // exchange the auth code for an id token
                const verifier = env.getEnvData('verifier');
                env.infoLog("exchange authorization code for access and id tokens");
                const result = await api.exchangeCode(authCode, verifier, clientId);
                accessToken = result?.access_token;
                idToken = result?.id_token;
            } 
            
            if(idToken && accessToken)  { // implicit connection
                env.infoLog("introspect access token");
                const isAccessTokenActive = await api.introspect(accessToken, 'access_token', clientId);
                env.infoLog("introspect id_token");
                const isIdTokenActive = await api.introspect(idToken, 'id_token', clientId);

                if(isIdTokenActive?.active && isAccessTokenActive?.active)
                {
                    // everything is ok, so we can get the user info and display the app
                    env.infoLog("get user info");
                    api.userInfo(accessToken);
                    return this.#display(true);
                }                    
            }
        }
        return this.#display();
    }

    #display(app  = false) {

        if(app) {
            $("#logOnForm").hide();
            $("#corsApi").show();
        } else {
            $("#logOnForm").show();
            $("#corsApi").hide();
        }
    }

    async connect() {
        let userId, groupId, appId, clientId, trustedOriginId;

        env.infoLog("1- check if the app exists. If this is the case, delete it");
        let result = await api.findApp();

        if(result)
            appId = result[0]?.id;

        if(appId)
        {
            await api.deactivateApp(appId);
            await api.deleteApp(appId);
        }      

        env.infoLog("2- (re)add the app and save clientId & secret");
        result = await api.addOAuth2Client();
        appId = result?.id;
        clientId = result?.credentials?.oauthClient?.client_id;

        env.infoLog("3- check if user exists. If this is the case, delete it");
        result = await api.findUser();

        if(result)
            userId = result[0]?.id;

        if(userId)
        {
            await api.deactivateUser(userId);
            await api.deleteUser(userId);
        }       

        env.infoLog("4- (re)create the user, save userId");
        result = await api.createActivatedUser();
        userId = result?.id;

        env.infoLog("5- enroll the user in MFA (security questions)");
        await api.enrollSecurityQuestions(userId);

        env.infoLog("6- list factors and verify enrollments");
        let factors = await api.listFactors(userId);

        for(let factor of factors) {
            switch(factor?.factorType) {
                case 'question':
                    await api.verifyQuestionFactor(userId, factor?.id);
                break;
                case 'email':
                    await api.verifyEmailFactor(userId, factor?.id);
                break;
                default :
                    console.error('unrecognized factor');
            }
        }

        env.infoLog("7- check if cors testers group exists. If this is the case, delete it");
        result = await api.findGroup();

        if(result)
            groupId = result[0]?.id;

        if(groupId)
            await api.removeGroup(groupId);    

        env.infoLog("8- (re)create the group, save groupId");
        result = await api.addGroup();
        groupId = result?.id;

        env.infoLog("9- add user to the group");
        await api.addUserToGroup(groupId, userId);

        env.infoLog("10- assign group to the app");
        await api.assignGroupToApp(appId, groupId);

        env.infoLog("11- check if the app is cors enabled. If this is the case, delete trusted origin");
        result = await api.findtrustedOrigin();

        if(result)
            trustedOriginId = result[0]?.id;

        if(trustedOriginId)
        {
            await api.deactivateOrigin(trustedOriginId);
            await api.deleteOrigin(trustedOriginId);
        }      

        env.infoLog("12- (re)add trusted origin");
        await api.addTrustedOrigin();

        env.infoLog("13- delete any open session");
        try {
            await api.closeCurrentSession();
            console.log('Clossing opened session..');
        } catch (e) {
            console.log('No session is currently open..');
        }

        env.infoLog("14- authenticates the user with credentials and retrieve session token");
        result = await api.authenticate();
        let sessionToken = result?.sessionToken;
        
        env.infoLog("Finally, request access to the app..");
        env.saveEnvData({ clientId : clientId });


        if(JSON.parse(env.getEnvData('PKCE')))
            api.getAuthCode(clientId, sessionToken);  // Authorization Code with PKCE
        else
            api.getIdToken(clientId, sessionToken);   // implicit connection
    }

    disconnect() {
        // need to define the disconnection steps
        // get a new token
        // create user

        $("#logOnForm").show();
        $("#corsApi").hide();
    }

    #getSearchParameters(){
        let result = {};
        let hashParam = window.location.hash?.substring(1) || window.location.search?.substring(1);

        if(hashParam)
        {
            let params = hashParam.split("&");    
            $.each(params, function (index, set) {
                let paramSet = set.split("=");
                if (typeof (paramSet[1]) !== "undefined")
                    result[paramSet[0]] = decodeURIComponent(paramSet[1]);
            });
        }

        return result;
    }
 
    getCurrentSession() {
        api.getCurrentSession();

    }

    refreshCurrentSession() {
        api.refreshCurrentSession();
    }

    closeCurrentSession() {
        api.closeCurrentSession();
    }

    async getFeature() {

        // get the list of features and get each id
        const features = await api.listFeatures();

        for(let feature of features)        
            api.getFeature(feature?.id);
    }

    listUsers() {
        api.listUsers(false);
    }

    async getUser() {
        const result = await api.findUser();
        const userId = result[0]?.id;
        api.getUser(userId);
    }

    updateUser() {
        api.updateUser();
    }

    async assignedAppLinks() {
        const result = await api.getCurrentUser();
        const userId = result?.id;
        api.assignedAppLinks(userId);
    }

    async getUserGroup() {
        const result = await api.findUser();
        const userId = result[0]?.id;
        api.getUserGroup(userId);

    }

    clearCurrentUserSession() {
        api.clearCurrentUserSession();
    }

    clearAllSessions() {
        api.clearAllSessions();
    }
}

const worker = new Worker();