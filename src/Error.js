'use strict';

class NotFoundError extends Error {
    constructor(message) {
        super(message);

        this.status = 'not-found';
        this.httpCode = 404;
    }
}


class BadRequestError extends Error {
    constructor(message) {
        super(message);

        this.status = 'bad-request';
        this.httpCode = 400
    }
}


export {
    NotFoundError,
    BadRequestError,
};