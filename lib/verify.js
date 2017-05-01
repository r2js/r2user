const promisify = require('es6-promisify');
const log = require('debug')('r2:user:verify');

module.exports = (app) => {
  const Mailer = app.service('Mailer');
  if (!Mailer) {
    return log('service [Mailer] not found!');
  }

  const render = promisify(app.render, app);

  return (user, template, opts = {}) => {
    const { from, subject } = opts;
    if (!from || !subject) {
      return Promise.reject('from or subject params not found!');
    }

    // don't forget to use opts.verifyToken in html template
    return render(template, opts)
      .then((html) => {
        const options = Object.assign(opts, {
          to: user.email, html, from, subject,
        });

        return Mailer.sendMail(options);
      });
  };
};
