const log = require('debug')('r2:user');
const login = require('./lib/login');
const register = require('./lib/register');
const verify = require('./lib/verify');
const confirm = require('./lib/confirm');
const forgotPasswd = require('./lib/forgotPasswd');
const resetPasswd = require('./lib/resetPasswd');
const changePasswd = require('./lib/changePasswd');

module.exports = function User(app, conf = {}) {
  const System = app.service('System');
  if (!System) {
    return log('service [System] not found!');
  }

  const { Users } = System;
  const Verify = verify(app);

  return {
    register: register(app, Users),
    verify: Verify, // send token
    confirm: confirm(app, Users), // confirm token
    login: login(app, Users, conf.jwt),
    forgotPasswd: forgotPasswd(app, Users, Verify),
    resetPasswd: resetPasswd(app, Users),
    changePasswd: changePasswd(app, Users),
  };
};
