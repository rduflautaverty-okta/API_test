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
        let result;

        try{

            if(property)
                result = localStorage.getItem(`${this.#prefix}.${property}`);
            else {

                result = Object.fromEntries(
                    Object.entries(localStorage).map(([key, value]) =>
                      [`${key.replace(this.#prefix + '.','')}`, value])
                );
            }
        } catch (err) {
            console.error(err);
        }

        return result;
    }
}
