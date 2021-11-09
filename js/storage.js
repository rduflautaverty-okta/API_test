class Storage {

    #prefix;

    constructor(id) {
        this.#prefix = `Okta.${id}`;
    }

    setStorage(property, value) {
        try{
            localStorage.setItem(`${this.#prefix}.${property}`, value);
        } catch (err) {
            console.error(err);
        }        
    }

    getStorage(property) {
        try{
            return localStorage.getItem(`${this.#prefix}.${property}`);
        } catch (err) {
            console.error(err);
        }        
    }
}