class Worker {

    constructor() {
    }

    async connect() {
        let userId, groupId;

        // need to define the connection steps       
        env.infoLog("1- check if user exists. If this is the case, delete it");
        let result = await api.findUser();

        if(result)
            userId = result[0]?.id;

        if(userId)
        {
            await api.deactivateUser(userId);
            await api.deleteUser(userId);
        }       

        env.infoLog("2- (re)create the user, save userId");
        result = await api.createActivatedUser();
        userId = result?.id;

        env.infoLog("3- enroll the user in MFA (security questions)");
        await api.enrollSecurityQuestions(userId);

        env.infoLog("4- list factors and verify enrollments");
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

        env.infoLog("5- authenticates a user with credentials and retrieve session token");
        result = await api.authenticate();
        let sessionToken = result?.sessionToken;

        env.infoLog("6- create and session with the session token");
        result = await api.createSession(sessionToken);
        const sessionId = result?.id;
        console.warn(`sessionId is ${sessionId}`);

        env.infoLog("7- validate session");
        await api.validateSession(sessionId);

        env.infoLog("8- check if cors testers group exists. If this is the case, delete it");
        result = await api.findGroup();

        if(result)
            groupId = result[0]?.id;

        if(groupId)
            await api.removeGroup(groupId);    

        env.infoLog("9- (re)create the group, save groupId");
        result = await api.addGroup();
        groupId = result?.id;

        env.infoLog("10- add user to the group");
        await api.addUserToGroup(groupId, userId);        

        env.infoLog("access to the app is granted");
        $("#logOnForm").hide();
        $("#corsApi").show();

    }

    disconnect() {
        // need to define the disconnection steps
        // get a new token
        // create user

        $("#logOnForm").show();
        $("#corsApi").hide();

    }

    finder

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