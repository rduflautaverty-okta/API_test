class Env {

    //#apiKey  = '00MXbVhRnmSY_C7zFqO-3N4yWy00EGnOoC0zAKB-6f';
    #id = 'cors_api_test';
    #storage = new Storage(this.#id);
    #items;

    constructor() {       

        this.#items = $('.userUi').map(function(){
            return $(this).attr('id');
        }).get();
            
        $('.userUi').change(() => this.#saveData());
        $('#fname').change(() => this.#updateUserName());
        $('#lname').change(() => this.#updateUserName());
        this.#restoreData();
    }

    #updateUserName() {
        $('#username').val(`${$('#fname').val()}.${$('#lname').val()}@atko.email`);
        this.#saveData()
    }

    #restoreData() {
        let results = new Object();
        for (let item of this.#items)
            results[item] = $(`#${item}`).val(this.#storage.getStorage(item))[0]?.value;

        return results;
    }

    #saveData() {
        for (let item of this.#items)
            this.#storage.setStorage(item, $(`#${item}`).val());
    }

    getEnvData() {
        // return an array with all the saved data
        return this.#restoreData();
    }

    log(message) {
        console.warn(message);
        $("#placeHolder").text(message);
    }

    infoLog(message) {
        console.log("%c" + message, "color:green");
    }    

    getAdminUrl() {
        return `https://${$('#company').val()}-admin.${$('#domain').val()}.com/admin/dashboard`;
    }

    getSignOutUrl() {
        return `https://${$('#company').val()}-admin.${$('#domain').val()}.com/login/admin/signout`;
    }
}

const env = new Env();