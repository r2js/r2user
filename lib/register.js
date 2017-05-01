module.exports = (app, Users) => (
  (data = {}, options = {}) => {
    const { rules, lang, attributes } = options;
    const { email, passwd, uname, isEnabled = 'n', isVerified = 'n' } = data;
    const obj = { email, passwd, uname };
    const failed = app.utils.isFailed(obj, Object.assign({
      email: 'required|email',
      passwd: 'required|min:4|max:20',
      uname: 'min:2|max:20',
    }, rules), { lang, attributes });

    if (failed) {
      return Promise.reject(failed);
    }

    Object.assign(obj, { isEnabled, isVerified });
    if (isVerified === 'n') {
      obj.verifyToken = app.utils.random(32);
    }

    return Users.newUser(obj);
  }
);

