module.exports = (app, Users, conf) => {
  const jwtConf = conf || app.config('jwt');
  if (!jwtConf) {
    // TODO: don't return promise
    return Promise.reject('jwt config not found!');
  }

  return ({ email, passwd, uname } = {}) => {
    const obj = { email, passwd, uname };
    const failed = app.utils.isFailed(obj, Object.assign({
      email: 'required_without:uname',
      passwd: 'required',
      uname: 'required_without:email',
    }, {}));

    if (failed) {
      return Promise.reject(failed);
    }

    const query = {};
    if (email) {
      query.email = email;
    } else if (uname) {
      query.uname = uname;
    }

    const tokenData = {};
    let userData;
    return Users.findOne(query).exec()
    .then((user) => {
      if (!user) {
        return Promise.reject('user not found!');
      }

      if (user.hash !== app.utils.hash(passwd, user.salt)) {
        return Promise.reject('wrong password!');
      }

      userData = user;
      tokenData.user = user.id;
      tokenData.expires = app.utils.expiresIn(jwtConf.expiresIn);
      Object.assign(user, { lastLogin: Date.now() });
      return user.save();
    })
    .then(() => app.utils.getToken(tokenData, jwtConf.secret))
    .then((token) => {
      Object.assign(token, { userId: userData.id });
      return token;
    });
  };
};
