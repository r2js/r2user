module.exports = (app, Users) => verifyToken => (
  Users.findOne({ verifyToken }).exec()
    .then((user) => {
      if (!user) {
        return Promise.reject('token not found!');
      }

      user.isVerified = 'y';
      user.isEnabled = 'y';
      user.verifyToken = undefined;
      return user.save();
    })
);
