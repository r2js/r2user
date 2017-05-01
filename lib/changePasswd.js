module.exports = (app, Users) => (
  (userObj, passwd = {}, options = {}) => {
    const { rules, lang, attributes } = options;
    const { newPasswd, oldPasswd } = passwd;
    const failed = app.utils.isFailed(passwd, Object.assign({
      newPasswd: 'required|min:4|max:20',
      passwdRepeat: 'required|min:4|max:20|same:newPasswd',
      oldPasswd: 'required',
    }, rules), { lang, attributes });

    if (failed) {
      return Promise.reject(failed);
    }

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
