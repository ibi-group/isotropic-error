import _chai from 'isotropic-dev-dependencies/lib/chai.js';
import _Error from '../js/error.js';
import _mocha from 'isotropic-dev-dependencies/lib/mocha.js';

_mocha.describe('Error', () => {
    _mocha.it('should construct error objects', () => {
        _chai.expect(_Error).to.be.a('function');
        _chai.expect(_Error).to.have.property('super_', Error); // eslint-disable-line no-restricted-globals -- The implementation of isotropic-error requires references to the built-in Error.
        _chai.expect(_Error).to.have.property('superclass', Error.prototype); // eslint-disable-line no-restricted-globals -- The implementation of isotropic-error requires references to the built-in Error.

        const error = new _Error();

        _chai.expect(error).to.be.an.instanceOf(_Error);
        _chai.expect(error).to.be.an.instanceOf(Error); // eslint-disable-line no-restricted-globals -- The implementation of isotropic-error requires references to the built-in Error.
    });

    _mocha.it('should be an error object factory', () => {
        _chai.expect(_Error).to.be.a('function');
        _chai.expect(_Error).to.have.property('super_', Error); // eslint-disable-line no-restricted-globals -- The implementation of isotropic-error requires references to the built-in Error.
        _chai.expect(_Error).to.have.property('superclass', Error.prototype); // eslint-disable-line no-restricted-globals -- The implementation of isotropic-error requires references to the built-in Error.

        const error = _Error();

        _chai.expect(error).to.be.an.instanceOf(_Error);
        _chai.expect(error).to.be.an.instanceOf(Error); // eslint-disable-line no-restricted-globals -- The implementation of isotropic-error requires references to the built-in Error.
    });

    _mocha.describe('#details', () => {
        _mocha.it('should be an instance property', () => {
            _chai.expect(_Error({
                details: 'test details'
            })).to.have.property('details', 'test details');
        });

        _mocha.it('should not be writable', () => {
            const error = _Error({
                details: 'test details'
            });

            _chai.expect(() => {
                error.details = 'new details';
            }).to.throw();
        });

        _mocha.it('should be undefined if not provided', () => {
            _chai.expect(_Error().details).to.be.undefined;
        });
    });

    _mocha.describe('#error', () => {
        _mocha.it('should be an instance property', () => {
            const error = _Error();

            _chai.expect(_Error({
                error
            })).to.have.property('error', error);
        });

        _mocha.it('should not be writable', () => {
            const error = _Error({
                error: _Error()
            });

            _chai.expect(() => {
                error.error = _Error();
            }).to.throw();
        });

        _mocha.it('should be undefined if not provided', () => {
            _chai.expect(_Error().error).to.be.undefined;
        });
    });

    _mocha.describe('#message', () => {
        _mocha.it('should be an instance property', () => {
            _chai.expect(_Error({
                message: 'test error message'
            })).to.have.property('message', 'test error message');
        });

        _mocha.it('should not be writable', () => {
            const error = _Error({
                message: 'test error message'
            });

            _chai.expect(() => {
                error.message = 'new error message';
            }).to.throw();
        });

        _mocha.it('should come from inner error if not provided', () => {
            _chai.expect(_Error({
                error: _Error({
                    message: 'test inner error message'
                })
            })).to.have.property('message', 'test inner error message');
        });

        _mocha.it('should come from native inner error if not provided', () => {
            _chai.expect(_Error({
                error: new Error('test native inner error message') // eslint-disable-line no-restricted-globals -- The implementation of isotropic-error requires references to the built-in Error.
            })).to.have.property('message', 'test native inner error message');
        });

        _mocha.it('should be undefined if not provided', () => {
            _chai.expect(_Error().message).to.be.undefined;
        });
    });

    _mocha.describe('#name', () => {
        _mocha.it('should be an instance property', () => {
            _chai.expect(_Error({
                name: 'TestErrorName'
            })).to.have.property('name', 'TestErrorName');
        });

        _mocha.it('should not be writable', () => {
            const error = _Error({
                name: 'TestErrorName'
            });

            _chai.expect(() => {
                error.name = 'NewErrorName';
            }).to.throw();
        });

        _mocha.it('should come from inner error if not provided', () => {
            _chai.expect(_Error({
                error: _Error({
                    name: 'TestInnerErrorName'
                })
            })).to.have.property('name', 'TestInnerErrorName');
        });

        _mocha.it('should come from native inner error if not provided', () => {
            const error = new Error(); // eslint-disable-line no-restricted-globals -- The implementation of isotropic-error requires references to the built-in Error.

            error.name = 'TestNativeInnerErrorName';

            _chai.expect(_Error({
                error
            })).to.have.property('name', 'TestNativeInnerErrorName');
        });

        _mocha.it('should be undefined if not provided', () => {
            _chai.expect(_Error().name).to.be.undefined;
        });
    });

    _mocha.describe('#stack', () => {
        _mocha.it('should be a string', () => {
            _chai.expect(_Error()).to.have.property('stack').that.is.a('string');
        });

        _mocha.it('should be cached', () => {
            const error = _Error();

            _chai.expect(error._stack).to.be.undefined;
            error._stack = 'fake stack';
            _chai.expect(error).to.have.property('stack', 'fake stack');
        });

        _mocha.it('should include details', () => {
            _chai.expect(_Error({
                details: {
                    test: 'details'
                }
            })).to.have.property('stack').that.matches(/\nDetails: \{\n {4}"test": "details"\n\}/u);
        });

        _mocha.it('should include inner error', () => {
            _chai.expect(_Error({
                error: _Error()
            })).to.have.property('stack').that.matches(/\n-> Error/u);
        });

        _mocha.it('should include inner error string', () => {
            _chai.expect(_Error({
                error: 'inner error string'
            })).to.have.property('stack').that.matches(/\n-> inner error string/u);
        });

        _mocha.it('should work without the v8 stack trace api', () => {
            const captureStackTrace = Error.captureStackTrace; // eslint-disable-line no-restricted-globals -- The implementation of isotropic-error requires references to the built-in Error.

            Error.captureStackTrace = null; // eslint-disable-line no-restricted-globals -- The implementation of isotropic-error requires references to the built-in Error.
            _chai.expect(_Error()).to.have.property('stack').that.is.a('string');
            Error.captureStackTrace = captureStackTrace; // eslint-disable-line no-restricted-globals -- The implementation of isotropic-error requires references to the built-in Error.
        });
    });

    _mocha.describe('#toString', () => {
        _mocha.it('should print "name: message"', () => {
            _chai.expect(_Error({
                message: 'test error message',
                name: 'TestErrorName'
            }).toString()).to.equal('TestErrorName: test error message');
        });

        _mocha.it('should print "Error: message" when name is not provided', () => {
            _chai.expect(_Error({
                message: 'test error message'
            }).toString()).to.equal('Error: test error message');
        });

        _mocha.it('should print "name" when message is not provided', () => {
            _chai.expect(_Error({
                name: 'TestErrorName'
            }).toString()).to.equal('TestErrorName');
        });

        _mocha.it('should print "Error" when message and name are not provided', () => {
            _chai.expect(_Error().toString()).to.equal('Error');
        });

        _mocha.it('should print "name: message" from the inner error when message and name are not provided', () => {
            _chai.expect(_Error({
                error: _Error({
                    message: 'test error message',
                    name: 'TestErrorName'
                })
            }).toString()).to.equal('TestErrorName: test error message');
        });
    });

    _mocha.describe('._prepareStackTrace', () => {
        _mocha.it('should return a string representation of a structured stack trace', () => {
            // Use strings instead of trying to make a structured stack trace in non-v8 environments
            _chai.expect(_Error._prepareStackTrace({}, [
                'line 0',
                'line 1',
                'line 2'
            ])).to.equal('    at line 0\n    at line 1\n    at line 2');
        });

        _mocha.it('should print the error if it can not stringify the call site object', () => {
            // Use strings instead of trying to make a structured stack trace in non-v8 environments
            _chai.expect(_Error._prepareStackTrace({}, [
                'line 0',
                null,
                'line 2'
            ])).to.match(/^ {4}at line 0\n {4}at <error: .*?>\n {4}at line 2$/u);
        });

        _mocha.it('should print "<error>" if it can not stringify the call site object or the thrown error', () => {
            const nonStringError = {
                toString () {
                    throw nonStringError;
                }
            };

            // Use strings instead of trying to make a structured stack trace in non-v8 environments
            _chai.expect(_Error._prepareStackTrace({}, [
                'line 0',
                nonStringError,
                'line 2'
            ])).to.equal('    at line 0\n    at <error>\n    at line 2');
        });
    });
});
