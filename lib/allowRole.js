const log = require('debug')('r2:user:allowRole');

module.exports = (app) => {
  const Acl = app.service('Acl');
  if (!Acl) {
    return log('service [Acl] not found!');
  }

  return (role, resources, permissions, options = {}) => {
    const { rules, lang, attributes } = options;
    const failed = app.utils.isFailed({ permissions }, Object.assign({
      permissions: 'required|in:get,post,put,delete',
    }, rules), { lang, attributes });

    if (failed) {
      return Promise.reject(failed);
    }

    return Acl.allow(role, resources, permissions);
  };
};
