module.exports = (app, Users, conf) => {
  const jwtConf = conf || app.config('jwt');
  if (!jwtConf) {
    // TODO: don't return promise
    return Promise.reject('jwt config not found!');
  }

  return (accessToken) => {
    try {
      const decoded = app.utils.decodeToken(accessToken, jwtConf.secret);

      if (decoded.expires <= Date.now()) {
        return Promise.reject('token expired!');
      }

      return Promise.resolve(decoded);
    } catch (e) {
      return Promise.reject('token verification failed!');
    }
  };
};
