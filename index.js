const _ = require('underscore');
const libLogin = require('./lib/login');
const libRegister = require('./lib/register');
const libVerify = require('./lib/verify');
const libConfirm = require('./lib/confirm');
const libForgotPasswd = require('./lib/forgotPasswd');
const libResetPasswd = require('./lib/resetPasswd');
const libChangePasswd = require('./lib/changePasswd');
const libAddRole = require('./lib/addRole');
const libAllowRole = require('./lib/allowRole');
const libUtils = require('./lib/utils');
const log = require('debug')('r2:user');

// TODO: mongoose discriminator kullanarak profile modeli geçirilebilir
module.exports = function User(app, conf = {}) {
  const System = app.service('System');
  if (!System) {
    return log('service [System] not found!');
  }

  const { Users } = System;
  const verifyUser = libVerify(app);
  const utils = libUtils(app);
  const registerUser = libRegister(app, Users, utils);
  const registerVerified = _.compose(registerUser, obj => (
    Object.assign(obj, { isEnabled: true, isVerified: true })
  ));

  return {
    register: registerUser,
    registerVerified,
    verify: verifyUser, // send token
    confirm: libConfirm(app, Users), // confirm token
    login: libLogin(app, Users, conf.jwt, utils),
    forgotPasswd: libForgotPasswd(app, Users, verifyUser),
    resetPasswd: libResetPasswd(app, Users, utils),
    changePasswd: libChangePasswd(app, Users, utils),
    addRole: libAddRole(app),
    allowRole: libAllowRole(app, utils),
    // updateRoles (remove old roles and set new roles)
  };
};
