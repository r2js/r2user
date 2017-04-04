const log = require('debug')('r2:user:addRole');

module.exports = (app) => {
  const Acl = app.service('Acl');
  if (!Acl) {
    return log('service [Acl] not found!');
  }

  return (user, role) => {
    if (!user || !user.id) {
      return Promise.reject('user not found!');
    }

    return Acl.addUserRoles(user.id, role);
  };
};
