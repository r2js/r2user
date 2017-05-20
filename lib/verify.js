const promisify = require('es6-promisify');

module.exports = (app) => {
  if (!app.hasServices('Mailer')) {
    return false;
  }

  const Mailer = app.service('Mailer');
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
