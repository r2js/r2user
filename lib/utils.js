module.exports = app => (
  {
    validate(data, baseRules, options = {}) {
      const { rules } = options;
      return app.utils.isFailed(data, Object.assign(baseRules, rules), options);
    },
  }
);
