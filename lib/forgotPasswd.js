module.exports = (app, Users, Verify) => (email, template, opts = {}) => (
  Users.findOne({ email }).exec()
    .then((user) => {
      if (!user) {
        return Promise.reject('user not found!');
      }

      user.resetToken = app.utils.random(32);
      user.resetExpires = Date.now() + 3600000;
      return user.save();
    })
    .then((user) => {
      const newOpts = Object.assign(user.toJSON(), opts);
      return Verify({ email }, template, newOpts);
    })
);
