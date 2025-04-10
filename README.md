# isotropic-error

[![npm version](https://img.shields.io/npm/v/isotropic-error.svg)](https://www.npmjs.com/package/isotropic-error)
[![License](https://img.shields.io/npm/l/isotropic-error.svg)](https://github.com/ibi-group/isotropic-error/blob/main/LICENSE)
![](https://img.shields.io/badge/tests-passing-brightgreen.svg)
![](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)

A nestable error object for JavaScript that solves the "stack trace truncation" problem in asynchronous code.

## Why Use This?

- **Complete Stack Traces**: Preserves the full execution path across asynchronous boundaries
- **Error Nesting**: Wraps inner errors while maintaining their stack traces
- **Detailed Context**: Attach additional debugging information at each level
- **Standard Compatibility**: Works with both native Error causes and custom error objects
- **Consistent Formatting**: Standardized error presentation with useful details

## Installation

```bash
npm install isotropic-error
```

## The Asynchronous Error Problem

In asynchronous JavaScript code, the stack trace of an unhandled exception only shows the most recent async callback, not the code that led to it. This makes debugging difficult because you lose the context of what triggered the error.

**Traditional approach**:
```
Error: Cannot read property 'data' of undefined
    at callback (/app/processor.js:42:10)
    at IncomingMessage.onEnd (/app/server.js:28:5)
    at IncomingMessage.emit (events.js:187:15)
```

With `isotropic-error`, you can create a chain of nested errors that preserves the entire execution path, giving you much more context for debugging.

## Usage

```javascript
import _Error from 'isotropic-error';

{
    // Basic usage
    const error = _Error({
        details: {
            field: 'email',
            value: 'invalid-email'
        },
        message: 'Invalid input data',
        name: 'ValidationError'
    });

    // Nesting errors
    try {
        // Some code that might throw
    } catch (error) {
        throw _Error({
            details: {
                stage: 'processing',
                timestamp: Date.now()
            },
            error, // Nest the original error
            message: 'Failed during data processing'
        });
    }
}
```

## API

### Creating Error Objects

```javascript
const error = _Error({
    details: { /* ... */ }  // Optional: Additional context data
    error: innerError,      // Optional: Nested error object
    message: 'Description', // Optional: Error message
    name: 'ErrorType'       // Optional: Error type name
});
```

Note: When including runtime values in an error, it's best practice to include them in the details object instead of in the error message string.

### Error Instance Properties

- **cause** (Error): Alias for `error` (compatible with native Error cause)
- **details** (Object): Additional context information
- **error** (Error): The nested error (if any)
- **message** (String): The error message
- **name** (String): The error type name
- **stack** (String): Combined stack trace of this error and any nested errors

## Examples

### Basic Error Creation

```javascript
import _Error from 'isotropic-error';

const _validateUser = user => {
    if (!user?.email) {
        throw _Error({
            details: {
                user
            },
            message: 'Email is required',
            name: 'ValidationError'
        });
    }
};
```

### Handling Async Errors

```javascript
import _Error from 'isotropic-error';
import _fs from 'fs-extra';
import _transformData from 'somewhere';

const _processContent = content => {
        try {
            // Content processing that might throw
            return _transformData(JSON.parse(content));
        } catch (error) {
            // Wrap and add context
            throw _Error({
                error,
                message: 'Content parsing failed'
            });
        }
    },
    _processFile = async filePath => {
        try {
            return _processContent(await _fs.readFile(filePath, 'utf8'));
        } catch (error) {
            // Wrap the original error with additional context
            throw _Error({
                details: {
                    filePath
                },
                error,
                message: 'Failed to process file'
            });
        }
    };
```

### Error Chain with Multiple Levels

```javascript
import _Error from 'isotropic-error';

const _level3 = () => {
        throw _Error({
            details: {
                level: 3
            },
            message: 'Something failed at level 3'
            name: 'Level3Error'
        });
    },

    _level2 = () => {
        try {
            _level3();
        } catch (error) {
            throw _Error({
                details: {
                    level: 2
                },
                error,
                message: 'Something failed at level 2',
                name: 'Level2Error'
            });
        }
    },

    _level1 = () => {
        try {
            _level2();
        } catch (error) {
            throw _Error({
                details: {
                    level: 1
                },
                error,
                message: 'Something failed at level 1',
                name: 'Level1Error'
            });
        }
    };

_level1();
// When _level1() throws, the stack trace will show:
// Level1Error: Something failed at level 1
// Details: { "level": 1 }
//     at level1 (...)
//     ...
// -> Level2Error: Something failed at level 2
// Details: { "level": 2 }
//     at level2 (...)
//     ...
// -> Level3Error: Something failed at level 3
// Details: { "level": 3 }
//     at level3 (...)
//     ...
```

### Working with Native Error Causes

```javascript
import _Error from 'isotropic-error';

try {
    // This creates a native error with a cause
    throw new Error('Native error message', {
        cause: new Error('Native cause')
    });
} catch (error) {
    // isotropic-error can wrap native errors with causes
    error = _Error({
        error,
        message: 'Wrapped native error'
    });

    console.log(error.stack);
    // The stack will include the isotropic-error, the native error, and its cause
}
```

### Error in Express Middleware

```javascript
import _Error from 'isotropic-error';
import _express from 'express';
import _fetchUser from 'somewhere';

const _app = _express();

// Request handler
_app.get('/api/user/:id', async (request, response, next) => {
    try {
        response.json(await _fetchUser(request.params.id));
    } catch (error) {
        // Wrap the error with request context
        next(_Error({
            details: {
                endpoint: '/api/user/:id',
                headers: request.headers,
                params: request.params,
                query: request.query
            },
            error,
            message: 'Failed to fetch user'
        }));
    }
});

// Error handling middleware
_app.use((error, request, response, next) => {
    if (error) {
        console.error(error.stack);

        response.status(500).json({
            error: error.name ?? 'Error',
            message: error.message ?? 'An unknown error occurred',
            requestId: request.id
        });
    }
});
```

## Contributing

Please refer to [CONTRIBUTING.md](https://github.com/ibi-group/isotropic-error/blob/main/CONTRIBUTING.md) for contribution guidelines.

## Issues

If you encounter any issues, please file them at https://github.com/ibi-group/isotropic-error/issues
