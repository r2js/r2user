module.exports = (app, Users) => verifyToken => (
  Users.findOne({ verifyToken }).exec()
    .then((user) => {
      if (!user) {
        return Promise.reject('token not found!');
      }

      Object.assign(user, {
        isVerified: 'y',
        isEnabled: 'y',
        verifyToken: undefined,
      });
      return user.save();
    })
);
