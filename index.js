const libLogin = require('./lib/login');
const libVerify = require('./lib/verify');
const libConfirm = require('./lib/confirm');
const libForgotPasswd = require('./lib/forgotPasswd');
const libResetPasswd = require('./lib/resetPasswd');
const libChangePasswd = require('./lib/changePasswd');
const libAddRole = require('./lib/addRole');
const libAllowRole = require('./lib/allowRole');
const libUtils = require('./lib/utils');

module.exports = function User(app, conf = {}) {
  if (!app.hasServices('System')) {
    return false;
  }

  const System = app.service('System');
  const { Users } = System;
  const verify = libVerify(app);
  const utils = libUtils(app);

  return {
    verify, // send token
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
