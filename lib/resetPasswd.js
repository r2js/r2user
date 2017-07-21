module.exports = (app, Users, utils) => (resetToken, passwd, options = {}) => {
  const isFailed = utils.validate({ passwd }, {
    passwd: 'required|min:4|max:20',
  }, options);

  if (isFailed) {
    return Promise.reject(isFailed);
  }

  return Users.findOne({ resetToken, isVerified: true, isEnabled: true }).exec()
    .then((user) => {
      if (!user) {
        return Promise.reject('token not found!');
      }

      const expires = user.resetExpires.getTime();
      const now = new Date().getTime();

      if (now > expires) {
        return Promise.reject('expired token!');
      }

      Object.assign(user, {
        resetToken: undefined,
        resetExpires: undefined,
        passwd,
      });
      return user.save();
    });
};
