module.exports = (app, Users) => (resetToken, passwd, rules = {}) => {
  const failed = app.utils.isFailed({ passwd }, Object.assign({
    passwd: 'required|min:4|max:20',
  }, rules));

  if (failed) {
    return Promise.reject(failed);
  }

  return Users.findOne({ resetToken }).exec()
    .then((user) => {
      if (!user) {
        return Promise.reject('token not found!');
      }

      if (user.isEnabled === 'n') {
        return Promise.reject('user is not enabled!');
      }

      const expires = user.resetExpires.getTime();
      const now = new Date().getTime();

      if (now > expires) {
        return Promise.reject('expired token!');
      }

      user.passwd = passwd;
      user.resetToken = undefined;
      user.resetExpires = undefined;
      return user.save();
    });
};
