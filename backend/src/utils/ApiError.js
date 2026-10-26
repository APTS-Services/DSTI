// src/utils/ApiError.js — operational error with an HTTP status code.
// Same pattern as APTS-Bills-tracking src/utils/ApiError.js.
class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.success = false;
        this.data = [];
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ApiError;
