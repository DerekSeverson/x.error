'use strict';

const is = require('iz.js');
const httpStatus = require('http-status');

const MAX_RECURSION = 3;
const MAX_TAG_LENGTH = 128;
const isAcceptableTag = (tag) => is.string(tag) && tag.length <= MAX_TAG_LENGTH;
const isHttpStatus = (status) => is.integer(status) && (status in httpStatus);

/**
 * A Better Way to do Errors
 *
 * @type {Error}
 */
class XError extends Error {

  /**
   * XError Constructor
   *
   * @constructor
   * @param  {Object} xerror configuration
   *
   */
  constructor (config) {
    super();

    this.xerror = true;

    if (!is.existy(config)) {
      config = {};
    }

    if (is.string(config.name)) {
      this.name = config.name;
    } else if (this.constructor.name !== 'XError') {
      this.name = this.constructor.name;
    } else {
      this.name = 'Error';
    }
    if (is.string(config.msg)) {
      this.message = config.msg;
    } else if (is.string(config.message)) {
      this.message = config.message;
    } else {
      this.message = '';
    }

    if (is.string(config.code) || (is.positive(config.code) && is.int(config.code))) {
      this.code = config.code;
    }

    if (config.errors) { // used for validation details
      this.errors = config.errors;
    }

    if (isHttpStatus(config.status)) {
      this.status = config.status;
    }

    if (is.error(config.cause)) {
      this.cause = config.cause;
    }

    if (is.pojo(config.data)) {
      this.data = config.data;
    }

    if (is.array(config.tags)) {
      this.tags = config.tags.filter(isAcceptableTag);
    }

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(err) {
    return XError.toJSON(this);
  }

  static toJSON(err, recursed) {

    if (!is.error(err)) {
      return null;
    }

    let ret = Object.assign({}, err, {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });

    if (!is.integer(recursed) || recursed > MAX_RECURSION) {
      recursed = MAX_RECURSION;
    }

    if (is.error(ret.cause) && recursed > 0) {
      ret.cause = XError.toJSON(ret.cause, recursed - 1);
    }

    return ret;
  }

  static decorate(err, config) {

    if (!is.error(err)) return err;
    if (!is.existy(config)) config = {};

    if ('tags' in config) XError.tag(err, config.tags);
    if ('data' in config) XError.attach(err, config.data);

    return err;
  }

  static attach(err, data) {

    if (!is.error(err)) return err;
    if (!is.pojo(data)) return err; // invalid data type.

    if (!is.pojo(err.data)) {
      if (!is.existy(err.data)) err.data = {}; // initialize data object.
      else return err; // unexpected data object type, don't extend it.
    }

    Object.assign(err.data, data);

    return err;
  }

  static tag (err, tags) {

    if (!is.error(err)) return err;
    if (!is.array(tags)) return err;

    tags = tags.filter(isAcceptableTag);

    if (!is.array(err.tags)) err.tags = tags;
    else err.tags = err.tags.concat(tags);

    return err;
  }

  static isa (err) {
    return (err instanceof XError);
  }

  static throw (config) {
    let err = new XError(config);
    Error.captureStackTrace(err, XError.throw);
    throw err;
  }

}

exports = module.exports = XError;
