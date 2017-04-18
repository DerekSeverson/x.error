'use strict';

const assert = require('chai').assert;

const XError = require('../index');

describe('XError', function () {

  it ('inherits from Error', function () {
    assert.instanceOf(new XError(), Error);
  });

  it ('customized XError', function () {

    let now = new Date();
    let bad = new Error('something bad happened');
    let err = new XError({
      name: 'MyCustomError',
      message: 'Just Some Custom Error',
      code: true,
      status: 400,
      cause: bad,
      data: {
        timestamp: now,
        id: '23902093',
      },
      tags: ['custom', 'whatever'],
    });

    assert.instanceOf(err, Error);
    assert.instanceOf(err, XError);
    assert.propertyVal(err, 'name', 'MyCustomError');
    assert.propertyVal(err, 'message', 'Just Some Custom Error');
    assert.propertyVal(err, 'code', 'my_custom_error');
    assert.propertyVal(err, 'status', 400);
    assert.propertyVal(err, 'cause', bad);
    assert.property(err, 'data');
    assert.deepPropertyVal(err, 'data.timestamp', now);
    assert.deepPropertyVal(err, 'data.id', '23902093');
    assert.property(err, 'tags');
    assert.isArray(err.tags);
    assert.include(err.tags, 'custom');
    assert.include(err.tags, 'whatever');

    assert.match(err.stack, /MyCustomError/);
    assert.match(err.stack, /Just Some Custom Error/);

  });

});
