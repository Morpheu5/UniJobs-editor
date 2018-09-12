export default class Input {
    constructor(value) {
        this.value = value;
        this.validity = null;
        this.invalidFeedback = [];
    }

    reset() {
        this.validity = null;
        this.invalidFeedback = [];
    }
};