import _make from 'isotropic-make';
import _valueToSource from 'isotropic-value-to-source';

const _Error = _make('Error', Error, { // eslint-disable-line no-restricted-globals -- The implementation of isotropic-error requires references to the built-in Error.
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
                this._stack += `\nDetails: ${_valueToSource(this.details)}`;
            }

            {
                const prepareStackTrace = Error.prepareStackTrace; // eslint-disable-line no-restricted-globals -- The implementation of isotropic-error requires references to the built-in Error.

                Error.prepareStackTrace = this.constructor._prepareStackTrace; // eslint-disable-line no-restricted-globals -- The implementation of isotropic-error requires references to the built-in Error.
                this._stack += `\n${this._getInternalStack()}`;
                Error.prepareStackTrace = prepareStackTrace; // eslint-disable-line no-restricted-globals -- The implementation of isotropic-error requires references to the built-in Error.
            }

            const visitedErrors = new Set();

            let innerError = this.error;

            while (innerError) {
                if (innerError instanceof Error) { // eslint-disable-line no-restricted-globals -- The implementation of isotropic-error requires references to the built-in Error.
                    if (visitedErrors.has(innerError)) {
                        break;
                    }

                    visitedErrors.add(innerError);

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
        let instance,
            internalError;

        {
            const stackTraceLimit = Error.stackTraceLimit; // eslint-disable-line no-restricted-globals -- The implementation of isotropic-error requires references to the built-in Error.

            Error.stackTraceLimit = 0; // eslint-disable-line no-restricted-globals -- The implementation of isotropic-error requires references to the built-in Error.
            instance = Reflect.construct(Error, [], this.constructor); // eslint-disable-line no-restricted-globals -- The implementation of isotropic-error requires references to the built-in Error.
            Error.stackTraceLimit = stackTraceLimit; // eslint-disable-line no-restricted-globals -- The implementation of isotropic-error requires references to the built-in Error.
        }

        if (Error.captureStackTrace) { // eslint-disable-line no-restricted-globals -- The implementation of isotropic-error requires references to the built-in Error.
            internalError = {};
            Error.captureStackTrace(internalError, this.constructor); // eslint-disable-line no-restricted-globals -- The implementation of isotropic-error requires references to the built-in Error.
        } else {
            try {
                throw new Error(); // eslint-disable-line no-restricted-globals -- The implementation of isotropic-error requires references to the built-in Error.
            } catch (error) {
                internalError = error;
            }
        }

        Object.defineProperties(instance, {
            cause: {
                get: instance._getCause
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
                get: instance._getMessage
            },
            name: {
                enumerable: true,
                get: instance._getName
            },
            stack: {
                get: instance._getStack
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

        return instance;
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
