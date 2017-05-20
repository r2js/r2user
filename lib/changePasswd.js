module.exports = (app, Users, utils) => (
  (userObj, passwd = {}, options = {}) => {
    const { newPasswd, oldPasswd } = passwd;
    const isFailed = utils.validate(passwd, {
      newPasswd: 'required|min:4|max:20',
      passwdRepeat: 'required|min:4|max:20|same:newPasswd',
      oldPasswd: 'required',
    }, options);

    if (isFailed) {
      return Promise.reject(isFailed);
    }

    // TODO: get verified user
    return Users.findOne(userObj).exec()
      .then((user) => {
        if (oldPasswd && user.hash !== app.utils.hash(oldPasswd, user.salt)) {
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
