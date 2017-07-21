module.exports = (app, Users, utils) => (
  (userId, passwd = {}, options = {}) => {
    const { newPasswd, oldPasswd } = passwd;
    const isFailed = utils.validate(passwd, {
      newPasswd: 'required|min:4',
      passwdRepeat: 'required|min:4|same:newPasswd',
    }, options);

    if (isFailed) {
      return Promise.reject(isFailed);
    }

    return Users.findById(userId).exec()
      .then((user) => {
        if (!user) {
          return Promise.reject('user not found!');
        }

        if (oldPasswd && user.passwd !== app.utils.hash(oldPasswd, user.salt)) {
          return Promise.reject('wrong old password!');
        }

        Object.assign(user, {
          passwd: newPasswd,
          passwdChanged: Date.now(),
        });
        return user.save();
      });
  }
);
