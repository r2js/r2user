module.exports = (app, Users) => (
  ({ email, passwd, uname, isEnabled = 'n', isVerified = 'n' } = {}, rules = {}) => {
    const obj = { email, passwd, uname };
    const failed = app.utils.isFailed(obj, Object.assign({
      email: 'required|email',
      passwd: 'required|min:4|max:20',
      uname: 'min:2|max:20',
    }, rules));

    if (failed) {
      return Promise.reject(failed);
    }

    obj.isEnabled = isEnabled;
    obj.isVerified = isVerified;
    if (isVerified === 'n') {
      obj.verifyToken = app.utils.random(32);
    }

    return Users.newUser(obj);
  }
);

