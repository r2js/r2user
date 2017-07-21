module.exports = (app, Users, Verify) => (email, template, opts = {}) => (
  Users.findOne({ email, isVerified: true, isEnabled: true }).exec()
    .then((user) => {
      if (!user) {
        return Promise.reject('user not found!');
      }

      Object.assign(user, {
        resetToken: app.utils.random(32),
        resetExpires: Date.now() + 3600000,
      });
      return user.save();
    })
    .then((user) => {
      const newOpts = Object.assign(user.toJSON(), opts);
      return Verify({ email }, template, newOpts);
    })
);
