class Env {

    #appName = 'cors_api_test';
    #storage = new Storage(this.#appName);
    #redirect_uri = "http://localhost:28550/";
    #items;

    constructor() {

        this.#items = $('.userUi').map(function() { return $(this).attr('id') }).get();            
        $('.userUi').change(() => this.#saveData());
        $('#fname').change(() => this.#updateUserName());
        $('#lname').change(() => this.#updateUserName());
        $('#implicit').change(() => this.#updateRadio());
        $('#PKCE').change(() => this.#updateRadio());
        
        // data is stored as string so we need to parse it
        $("#implicit").prop("checked", !JSON.parse(this.#restoreData('PKCE')));
        $("#PKCE").prop("checked", JSON.parse(this.#restoreData('PKCE')));
    }

    #updateUserName() {
        this.#saveData({username : `${$('#fname').val()}.${$('#lname').val()}@atko.email`});
    }

    #updateRadio() {
        this.#saveData({PKCE : $('#PKCE').is(':checked')});
    }

    #restoreData(key) {

        let results = {
            appName : this.#appName,
            redirectUri : this.#redirect_uri
        };

        if(key) {
            results = this.#storage.getStorage(key);
        } else {
            for (let item of this.#items)
                results[item] = $(`#${item}`).val(this.#storage.getStorage(item))[0]?.value;
        }

        return results;
    }

    #saveData(obj = {}) { // can backup values in { key, pair } format

        if(Object.keys(obj).length)
        {
            for (const [key, value] of Object.entries(obj)) {
                this.#storage.setStorage(key, value);
            }
        } else {
            for (let item of this.#items)
            this.#storage.setStorage(item, $(`#${item}`).val());
        }
    }

    saveEnvData(obj) {
        if(Object.keys(obj).length)
            this.#saveData(obj);
    }

    getEnvData(key) {
        return this.#restoreData(key);
    }

    log(message) {
        console.warn(message);
        $("#placeHolder").text(message);
    }

    infoLog(message) {
        console.log("%c" + message, "color:green");
    }   

    getAdminUrl() {
        return `https://${$('#subdomain').val()}-admin.${$('#domain').val()}.com/admin/dashboard`;
    }

    getSignOutUrl() {
        return `https://${$('#subdomain').val()}-admin.${$('#domain').val()}.com/login/admin/signout`;
    }
}

const env = new Env();