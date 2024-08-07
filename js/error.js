import _make from 'isotropic-make';

const _Error = _make(Error, { // eslint-disable-line no-restricted-globals -- The implementation of isotropic-error requires references to the built-in Error.
    toString () {
        let string = this.name || 'Error';

        if (this.message) {
            string += `: ${this.message}`;
        }

        return string;
    },
    _getCause () {
        return this.error;
    },
    _getMessage () {
        return this._message || this.error && this.error.message || void null;
    },
    _getName () {
        return this._name || this.error && this.error.name || void null;
    },
    _getStack () {
        if (!this._stack) {
            this._stack = this.toString();

            if (this.details) {
                this._stack += `\nDetails: ${JSON.stringify(this.details, null, 4)}`;
            }

            const prepareStackTrace = Error.prepareStackTrace; // eslint-disable-line no-restricted-globals -- The implementation of isotropic-error requires references to the built-in Error.

            Error.prepareStackTrace = _Error._prepareStackTrace; // eslint-disable-line no-restricted-globals -- The implementation of isotropic-error requires references to the built-in Error.
            this._stack += `\n${this._getInternalStack()}`;
            Error.prepareStackTrace = prepareStackTrace; // eslint-disable-line no-restricted-globals -- The implementation of isotropic-error requires references to the built-in Error.

            let innerError = this.error;

            while (innerError) {
                if (innerError instanceof Error) { // eslint-disable-line no-restricted-globals -- The implementation of isotropic-error requires references to the built-in Error.
                    this._stack += `\n-> ${innerError.stack}`;

                    if (innerError instanceof _Error) {
                        break;
                    }

                    innerError = innerError.cause;
                } else {
                    this._stack += `\n-> ${innerError}`;
                    break;
                }
            }
        }

        return this._stack;
    },
    _init ({
        details,
        error,
        message,
        name
    } = {}) {
        let internalError;

        if (Error.captureStackTrace) { // eslint-disable-line no-restricted-globals -- The implementation of isotropic-error requires references to the built-in Error.
            internalError = {};
            Error.captureStackTrace(internalError, _Error); // eslint-disable-line no-restricted-globals -- The implementation of isotropic-error requires references to the built-in Error.
        } else {
            try {
                throw new Error(); // eslint-disable-line no-restricted-globals -- The implementation of isotropic-error requires references to the built-in Error.
            } catch (error) {
                internalError = error;
            }
        }

        Object.defineProperties(this, {
            cause: {
                get: this._getCause
            },
            details: {
                enumerable: true,
                value: details
            },
            error: {
                enumerable: true,
                value: error
            },
            message: {
                enumerable: true,
                get: this._getMessage
            },
            name: {
                enumerable: true,
                get: this._getName
            },
            stack: {
                get: this._getStack
            },
            _getInternalStack: {
                value: () => internalError.stack
            },
            _message: {
                value: message
            },
            _name: {
                value: name
            },
            _stack: {
                writable: true
            }
        });

        return this;
    }
}, {
    _prepareStackTrace (errorObject, structuredStackTrace) {
        return structuredStackTrace.map(stackFrame => {
            let line;

            try {
                line = stackFrame.toString();
            } catch (error0) {
                try {
                    line = `<error: ${error0}>`;
                } catch (error1) {
                    line = '<error>';
                }
            }

            return `    at ${line}`;
        }).join('\n');
    }
});

export default _Error;
