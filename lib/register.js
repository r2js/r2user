module.exports = (app, Users, utils) => (
  (data = {}, options = {}) => {
    const { email, passwd, uname, isEnabled = false, isVerified = false } = data;
    const obj = { email, passwd, uname };
    const isFailed = utils.validate(obj, {
      email: 'required|email',
      passwd: 'required|min:4|max:20',
      uname: 'min:2|max:20',
    }, options);

    if (isFailed) {
      return Promise.reject(isFailed);
    }

    Object.assign(obj, { isEnabled, isVerified });
    if (isVerified === false) {
      obj.verifyToken = app.utils.random(32);
    }

    return Users.newUser(obj);
  }
);

