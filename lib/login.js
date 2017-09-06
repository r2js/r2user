const log = require('debug')('r2:user:login');

module.exports = (app, Users, conf, utils) => {
  const jwtConf = conf || app.config('jwt') || {};
  if (!jwtConf) {
    return log('jwt config not found!');
  }

  const { secret = '1234', expiresIn = 7 } = jwtConf;

  return ({ email, passwd, uname } = {}, options = {}) => {
    const obj = { email, passwd, uname };
    const isFailed = utils.validate(obj, {
      email: 'required_without:uname',
      passwd: 'required',
      uname: 'required_without:email',
    }, options);

    if (isFailed) {
      return Promise.reject(isFailed);
    }

    const query = { isVerified: true, isEnabled: true };
    if (email) {
      Object.assign(query, { email });
    } else if (uname) {
      Object.assign(query, { uname });
    }

    const tokenData = {};
    let userData;

    return Users.findOne(query).exec()
    .then((user) => {
      if (!user) {
        return Promise.reject('user not found!');
      }

      if (user.passwd !== app.utils.hash(passwd, user.salt)) {
        return Promise.reject('wrong password!');
      }

      userData = user;
      Object.assign(user, { lastLogin: Date.now() });
      Object.assign(tokenData, {
        user: user.id,
        expires: app.utils.expiresIn(expiresIn),
      });

      return user.save();
    })
    .then(() => app.utils.getToken(tokenData, secret))
    .then((token) => {
      Object.assign(token, { userId: userData.id });
      return token;
    });
  };
};
