module.exports = (app) => {
  if (!app.hasServices('Acl')) {
    return false;
  }

  const Acl = app.service('Acl');
  return (user, role) => {
    if (!user || !user.id) {
      return Promise.reject('user not found!');
    }

    return Acl.addUserRoles(user.id, role);
  };
};
