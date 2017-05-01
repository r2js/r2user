const _ = require('underscore');
const login = require('./lib/login');
const register = require('./lib/register');
const verify = require('./lib/verify');
const confirm = require('./lib/confirm');
const forgotPasswd = require('./lib/forgotPasswd');
const resetPasswd = require('./lib/resetPasswd');
const changePasswd = require('./lib/changePasswd');
const addRole = require('./lib/addRole');
const allowRole = require('./lib/allowRole');
const log = require('debug')('r2:user');

// TODO: mongoose discriminator kullanarak profile modeli geçirilebilir
module.exports = function User(app, conf = {}) {
  const System = app.service('System');
  if (!System) {
    return log('service [System] not found!');
  }

  const { Users } = System;
  const verifyUser = verify(app);
  const registerUser = register(app, Users);
  const registerVerified = _.compose(registerUser, obj => (
    Object.assign(obj, { isEnabled: 'y', isVerified: 'y' })
  ));

  return {
    register: registerUser,
    registerVerified,
    verify: verifyUser, // send token
    confirm: confirm(app, Users), // confirm token
    login: login(app, Users, conf.jwt),
    forgotPasswd: forgotPasswd(app, Users, verifyUser),
    resetPasswd: resetPasswd(app, Users),
    changePasswd: changePasswd(app, Users),
    addRole: addRole(app),
    allowRole: allowRole(app),
    // updateRoles (remove old roles and set new roles)
  };
};
