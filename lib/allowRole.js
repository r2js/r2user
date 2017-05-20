module.exports = (app, utils) => {
  if (!app.hasServices('Acl')) {
    return false;
  }

  const Acl = app.service('Acl');
  return (role, resources, permissions, options = {}) => {
    const isFailed = utils.validate({ permissions }, {
      permissions: 'required|in:get,post,put,delete',
    }, options);

    if (isFailed) {
      return Promise.reject(isFailed);
    }

    return Acl.allow(role, resources, permissions);
  };
};
