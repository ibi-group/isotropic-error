import {
    describe,
    it
} from 'mocha';

// Normally this would be
// import Error from '../js/error.js'
// but these tests need a reference to the native Error object
// eslint complains about this workaround
import e from '../js/error.js';

import {
    expect
} from 'chai';

const NativeError = Error;

/* eslint-disable no-global-assign, no-undef */
Error = e;
/* eslint-enable no-global-assign, no-undef */

describe('Error', () => {
    it('should construct error objects', () => {
        expect(Error).to.be.a('function');
        expect(Error).to.have.property('super_', NativeError);
        expect(Error).to.have.property('superclass', NativeError.prototype);

        const error = new Error();

        expect(error).to.be.an.instanceOf(Error);
        expect(error).to.be.an.instanceOf(NativeError);
    });

    it('should be an error object factory', () => {
        expect(Error).to.be.a('function');
        expect(Error).to.have.property('super_', NativeError);
        expect(Error).to.have.property('superclass', NativeError.prototype);

        const error = Error();

        expect(error).to.be.an.instanceOf(Error);
        expect(error).to.be.an.instanceOf(NativeError);
    });

    describe('#details', () => {
        it('should be an instance property', () => {
            expect(Error({
                details: 'test details'
            })).to.have.property('details', 'test details');
        });

        it('should not be writable', () => {
            const error = Error({
                details: 'test details'
            });

            expect(() => {
                error.details = 'new details';
            }).to.throw(NativeError);
        });

        it('should be undefined if not provided', () => {
            expect(Error().details).to.be.undefined;
        });
    });

    describe('#error', () => {
        it('should be an instance property', () => {
            const error = Error();

            expect(Error({
                error
            })).to.have.property('error', error);
        });

        it('should not be writable', () => {
            const error = Error({
                error: Error()
            });

            expect(() => {
                error.error = Error();
            }).to.throw(NativeError);
        });

        it('should be undefined if not provided', () => {
            expect(Error().error).to.be.undefined;
        });
    });

    describe('#message', () => {
        it('should be an instance property', () => {
            expect(Error({
                message: 'test error message'
            })).to.have.property('message', 'test error message');
        });

        it('should not be writable', () => {
            const error = Error({
                message: 'test error message'
            });

            expect(() => {
                error.message = 'new error message';
            }).to.throw(NativeError);
        });

        it('should come from inner error if not provided', () => {
            expect(Error({
                error: Error({
                    message: 'test inner error message'
                })
            })).to.have.property('message', 'test inner error message');
        });

        it('should come from native inner error if not provided', () => {
            expect(Error({
                error: new NativeError('test native inner error message')
            })).to.have.property('message', 'test native inner error message');
        });

        it('should be undefined if not provided', () => {
            expect(Error().message).to.be.undefined;
        });
    });

    describe('#name', () => {
        it('should be an instance property', () => {
            expect(Error({
                name: 'TestErrorName'
            })).to.have.property('name', 'TestErrorName');
        });

        it('should not be writable', () => {
            const error = Error({
                name: 'TestErrorName'
            });

            expect(() => {
                error.name = 'NewErrorName';
            }).to.throw(NativeError);
        });

        it('should come from inner error if not provided', () => {
            expect(Error({
                error: Error({
                    name: 'TestInnerErrorName'
                })
            })).to.have.property('name', 'TestInnerErrorName');
        });

        it('should come from native inner error if not provided', () => {
            const error = new NativeError();

            error.name = 'TestNativeInnerErrorName';

            expect(Error({
                error
            })).to.have.property('name', 'TestNativeInnerErrorName');
        });

        it('should be undefined if not provided', () => {
            expect(Error().name).to.be.undefined;
        });
    });

    describe('#stack', () => {
        it('should be a string', () => {
            expect(Error()).to.have.property('stack').that.is.a('string');
        });

        it('should be cached', () => {
            const error = Error();

            expect(error._stack).to.be.undefined;
            error._stack = 'fake stack';
            expect(error).to.have.property('stack', 'fake stack');
        });

        it('should include details', () => {
            expect(Error({
                details: {
                    test: 'details'
                }
            })).to.have.property('stack').that.matches(/\nDetails: {\n {4}"test": "details"\n}/);
        });

        it('should include inner error', () => {
            expect(Error({
                error: Error()
            })).to.have.property('stack').that.matches(/\n-> Error/);
        });

        it('should include inner error string', () => {
            expect(Error({
                error: 'inner error string'
            })).to.have.property('stack').that.matches(/\n-> inner error string/);
        });

        it('should work without the v8 stack trace api', () => {
            const captureStackTrace = NativeError.captureStackTrace;

            NativeError.captureStackTrace = null;
            expect(Error()).to.have.property('stack').that.is.a('string');
            NativeError.captureStackTrace = captureStackTrace;
        });
    });

    describe('#toString', () => {
        it('should print "name: message"', () => {
            expect(Error({
                message: 'test error message',
                name: 'TestErrorName'
            }).toString()).to.equal('TestErrorName: test error message');
        });

        it('should print "Error: message" when name is not provided', () => {
            expect(Error({
                message: 'test error message'
            }).toString()).to.equal('Error: test error message');
        });

        it('should print "name" when message is not provided', () => {
            expect(Error({
                name: 'TestErrorName'
            }).toString()).to.equal('TestErrorName');
        });

        it('should print "Error" when message and name are not provided', () => {
            expect(Error().toString()).to.equal('Error');
        });

        it('should print "name: message" from the inner error when message and name are not provided', () => {
            expect(Error({
                error: Error({
                    message: 'test error message',
                    name: 'TestErrorName'
                })
            }).toString()).to.equal('TestErrorName: test error message');
        });
    });

    describe('._prepareStackTrace', () => {
        it('should return a string representation of a structured stack trace', () => {
            // Use strings instead of trying to make a structured stack trace in non-v8 environments
            expect(Error._prepareStackTrace({}, [
                'line 0',
                'line 1',
                'line 2'
            ])).to.equal('    at line 0\n    at line 1\n    at line 2');
        });

        it('should print the error if it can not stringify the call site object', () => {
            // Use strings instead of trying to make a structured stack trace in non-v8 environments
            expect(Error._prepareStackTrace({}, [
                'line 0',
                null,
                'line 2'
            ])).to.match(/^ {4}at line 0\n {4}at <error: .*?>\n {4}at line 2$/);
        });

        it('should print "<error>" if it can not stringify the call site object or the thrown error', () => {
            const nonStringError = {
                toString () {
                    throw nonStringError;
                }
            };

            // Use strings instead of trying to make a structured stack trace in non-v8 environments
            expect(Error._prepareStackTrace({}, [
                'line 0',
                nonStringError,
                'line 2'
            ])).to.equal('    at line 0\n    at <error>\n    at line 2');
        });
    });
});
