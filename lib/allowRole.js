const log = require('debug')('r2:user:allowRole');

module.exports = (app) => {
  const Acl = app.service('Acl');
  if (!Acl) {
    return log('service [Acl] not found!');
  }

  return (role, resources, permissions, rules = {}) => {
    const failed = app.utils.isFailed({ permissions }, Object.assign({
      permissions: 'required|in:get,post,put,delete',
    }, rules));

    if (failed) {
      return Promise.reject(failed);
    }

    return Acl.allow(role, resources, permissions);
  };
};
