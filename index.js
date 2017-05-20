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

// TODO: mongoose discriminator kullanarak profile modeli geçirilebilir
module.exports = function User(app, conf = {}) {
  if (!app.hasServices('System')) {
    return false;
  }

  const System = app.service('System');
  const { Users } = System;
  const verify = libVerify(app);
  const utils = libUtils(app);
  const register = libRegister(app, Users, utils);
  const registerVerified = _.compose(register, obj => (
    Object.assign(obj, { isEnabled: true, isVerified: true })
  ));

  return {
    verify, // send token
    register,
    registerVerified,
    confirm: libConfirm(app, Users), // confirm token
    login: libLogin(app, Users, conf.jwt, utils),
    forgotPasswd: libForgotPasswd(app, Users, verify),
    resetPasswd: libResetPasswd(app, Users, utils),
    changePasswd: libChangePasswd(app, Users, utils),
    addRole: libAddRole(app),
    allowRole: libAllowRole(app, utils),
    // updateRoles (remove old roles and set new roles)
  };
};
