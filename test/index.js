const chai = require('chai');
const r2base = require('r2base');
const r2mongoose = require('r2mongoose');
const r2system = require('r2system');
const r2acl = require('r2acl');
const nodemailer = require('nodemailer');
const stubTransport = require('nodemailer-stub-transport');
const r2user = require('../index');

const mailer = nodemailer.createTransport(stubTransport());
const expect = chai.expect;
process.chdir(__dirname);

const app = r2base({ baseDir: __dirname });
app.start()
  .serve(r2mongoose, { database: 'r2test' })
  .serve(r2system)
  .serve(r2acl)
  .serve(mailer, 'Mailer')
  .serve(r2user)
  .into(app);

app.set('view engine', 'ejs');
const User = app.service('User');
const System = app.service('System');
const Acl = app.service('Acl');
const { Users } = System;

describe('r2user', () => {
  describe('initialization', () => {
    it('should require System service', (done) => {
      const systemTest = r2base({ baseDir: __dirname });
      systemTest.start()
        .serve(r2user, { jwt: { secret: '1234', expiresIn: 7 } })
        .into(systemTest);

      expect(systemTest.service('User')).to.equal(false);
      done();
    });
  });

  describe('verify', () => {
    it('should send verify token', () => (
      User.verify({ email: 'test5@abc.com' }, 'verify.ejs', {
        from: 'mailer@abc.com',
        subject: 'verification mail',
      }).then((data) => {
        expect(data.envelope).to.not.equal(undefined);
        expect(data.envelope.from).to.equal('mailer@abc.com');
        expect(data.envelope.to[0]).to.equal('test5@abc.com');
        expect(data.messageId).to.not.equal(undefined);
        expect(data.response).to.not.equal(undefined);
      })
    ));
  });

  describe('confirm', () => {
    it('should confirm verify token', () => (
      Users
        .create({ email: 'test6@abc.com', passwd: '1234' })
        .then(user => User.confirm(user.verifyToken))
        .then((data) => {
          expect(data.verifyToken).to.equal(undefined);
          expect(data.isEnabled).to.equal(true);
          expect(data.isVerified).to.equal(true);
        })
    ));

    it('should not confirm invalid token', (done) => {
      User.confirm('invalid token')
        .then(done)
        .catch((err) => {
          expect(err).to.equal('token not found!');
          done();
        });
    });
  });

  describe('login', () => {
    it('should login user', (done) => {
      const obj = { email: 'test7@abc.com', passwd: '1234', isVerified: true, isEnabled: true };
      Users.create(obj)
        .then(() => User.login(obj))
        .then((user) => {
          try {
            expect(user.token).to.not.equal(undefined);
            expect(user.expires).to.not.equal(undefined);
            expect(user.userId).to.not.equal(undefined);
            done();
          } catch (e) {
            done(e);
          }
        })
        .catch(done);
    });

    it('should not login invalid user', (done) => {
      User.login({ email: 'test404@abc.com', passwd: '1234' })
        .then()
        .catch((err) => {
          try {
            expect(err).to.equal('user not found!');
            done();
          } catch (e) {
            done(e);
          }
        });
    });

    it('should not login invalid password', (done) => {
      User.login({ email: 'test7@abc.com', passwd: '12345' })
        .then()
        .catch((err) => {
          try {
            expect(err).to.equal('wrong password!');
            done();
          } catch (e) {
            done(e);
          }
        });
    });

    it('should not login via invalid params', (done) => {
      User.login({})
        .then()
        .catch((err) => {
          try {
            expect(err.email[0]).to.equal('The email field is required when uname is empty.');
            expect(err.passwd[0]).to.equal('The passwd field is required.');
            expect(err.uname[0]).to.equal('The uname field is required when email is empty.');
            done();
          } catch (e) {
            done(e);
          }
        });
    });

    it('should login user via username', (done) => {
      const obj = { email: 'r2user@abc.com', uname: 'r2user', passwd: '1234', isVerified: true, isEnabled: true };
      Users.create(obj)
        .then(() => User.login({ uname: 'r2user', passwd: '1234' }))
        .then((user) => {
          try {
            expect(user.token).to.not.equal(undefined);
            expect(user.expires).to.not.equal(undefined);
            expect(user.userId).to.not.equal(undefined);
            done();
          } catch (e) {
            done(e);
          }
        })
        .catch(done);
    });
  });

  describe('forgot password', () => {
    it('should send reset token', () => (
      Users
        .create({ email: 'test8@abc.com', passwd: '1234', isVerified: true, isEnabled: true })
        .then(() => User.forgotPasswd('test8@abc.com', 'verify.ejs', {
          from: 'mailer@abc.com',
          subject: 'verification mail',
        }))
        .then((data) => {
          expect(data.envelope).to.not.equal(undefined);
          expect(data.envelope.from).to.equal('mailer@abc.com');
          expect(data.envelope.to[0]).to.equal('test8@abc.com');
          expect(data.messageId).to.not.equal(undefined);
          expect(data.response).to.not.equal(undefined);
        })
    ));

    it('should not send reset token for invalid user', (done) => {
      User.forgotPasswd('test404@abc.com')
        .then()
        .catch((err) => {
          try {
            expect(err).to.equal('user not found!');
            done();
          } catch (e) {
            done(e);
          }
        });
    });
  });

  const registerAndReset = (userData) => {
    const { email } = userData;
    return Users
      .create(userData)
      .then(() => User.forgotPasswd(email, 'verify.ejs', {
        from: 'mailer@abc.com',
        subject: 'verification mail',
      }))
      .then(() => Users.findOne({ email }).exec())
      .then((user) => {
        const { resetToken } = user.toJSON();
        return User.resetPasswd(resetToken, '12345');
      });
  };

  describe('reset password', () => {
    it('should reset password', (done) => {
      registerAndReset({ email: 'test9@abc.com', passwd: '1234', isEnabled: true, isVerified: true })
        .then((user) => {
          try {
            expect(user.resetToken).to.equal(undefined);
            expect(user.resetExpires).to.equal(undefined);
            expect(user.passwd).to.not.equal('1234');
            done();
          } catch (e) {
            done(e);
          }
        })
        .catch(done);
    });

    it('should reset password and login via new password', () => (
      registerAndReset({ email: 'test10@abc.com', passwd: '1234', isEnabled: 'y', isVerified: 'y' })
        .then(() => User.login({ email: 'test10@abc.com', passwd: '12345' }))
    ));

    it('should not reset password for disabled user', (done) => {
      registerAndReset({ email: 'test11@abc.com', passwd: '1234' })
        .then()
        .catch((err) => {
          try {
            expect(err).to.equal('user not found!');
            done();
          } catch (e) {
            done(e);
          }
        });
    });

    it('should not reset password via invalid passwd parameter', (done) => {
      User.resetPasswd(null, '12')
        .then()
        .catch((err) => {
          try {
            expect(err).to.deep.equal({ passwd: ['The passwd must be at least 4 characters.'] });
            done();
          } catch (e) {
            done(e);
          }
        });
    });

    it('should not reset password via invalid token parameter', (done) => {
      User.resetPasswd('invalidToken', '1234')
        .then()
        .catch((err) => {
          try {
            expect(err).to.equal('token not found!');
            done();
          } catch (e) {
            done(e);
          }
        });
    });
  });

  describe('change password', () => {
    it('should change password', () => (
      Users
        .create({ email: 'test12@abc.com', passwd: '1234' })
        .then(user => User.changePasswd(user.id,
          { newPasswd: '12345', passwdRepeat: '12345' } // eslint-disable-line
        ))
    ));

    it('should change password, check old password', () => (
      Users
        .create({ email: 'test12a@abc.com', passwd: '1234' })
        .then(user => User.changePasswd(user.id,
          { newPasswd: '12345', passwdRepeat: '12345', oldPasswd: '1234' } // eslint-disable-line
        ))
    ));

    it('should change password and login via new password', () => (
      Users
        .create({ email: 'test13@abc.com', passwd: '1234', isVerified: true, isEnabled: true })
        .then(user => User.changePasswd(user.id,
          { newPasswd: '12345', passwdRepeat: '12345', oldPasswd: '1234' } // eslint-disable-line
        ))
        .then(() => User.login({ email: 'test13@abc.com', passwd: '12345' }))
    ));

    it('should not change password via invalid params', (done) => {
      Users
        .create({ email: 'test14@abc.com', passwd: '1234' })
        .then(() => User.changePasswd({ email: 'test14@abc.com' }))
        .then(done)
        .catch((err) => {
          try {
            expect(err.newPasswd[0]).to.equal('The newPasswd field is required.');
            expect(err.passwdRepeat[0]).to.equal('The passwdRepeat field is required.');
            done();
          } catch (e) {
            done(e);
          }
        });
    });

    it('should not change password via wrong old password', (done) => {
      Users
        .create({ email: 'test15@abc.com', passwd: '1234' })
        .then(user => User.changePasswd(user.id,
          { newPasswd: '12345', passwdRepeat: '12345', oldPasswd: '123456' } // eslint-disable-line
        ))
        .then(done)
        .catch((err) => {
          try {
            expect(err).to.equal('wrong old password!');
            done();
          } catch (e) {
            done(e);
          }
        });
    });

    it('should not change password via invalid user', (done) => {
      User.changePasswd(null, {
        newPasswd: '12345', passwdRepeat: '12345', oldPasswd: '123456',
      }).catch((err) => {
        expect(err).to.equal('user not found!');
        done();
      });
    });
  });

  describe('add role', () => {
    it('should add admin role to the user', (done) => {
      const obj = { email: 'test18@abc.com', passwd: '1234' };
      let userData;
      Users.create(obj)
        .then((user) => {
          userData = user;
          return User.addRole(user, 'admin');
        })
        .then(() => Acl.userRoles(userData.id))
        .then((roles) => {
          expect(roles).to.deep.equal(['admin']);
          done();
        })
        .catch(done);
    });

    it('should require Acl service', (done) => {
      const aclTest = r2base({ baseDir: __dirname });
      aclTest.start()
        .serve(r2system)
        .serve(r2user, { jwt: { secret: '1234', expiresIn: 7 } })
        .into(aclTest);

      expect(aclTest.service('User').addRole).to.equal(false);
      done();
    });

    it('should not add role via invalid user', (done) => {
      User.addRole({}).catch((err) => {
        expect(err).to.equal('user not found!');
        done();
      });
    });
  });

  describe('allow role', () => {
    it('should allow admin to get posts', (done) => {
      const obj = { email: 'test19@abc.com', passwd: '1234' };
      let userData;
      Users.create(obj)
        .then((user) => {
          userData = user;
          return User.addRole(user, 'admin');
        })
        .then(() => User.allowRole('admin', 'posts', ['get']))
        .then(() => Acl.isAllowed(userData.id, 'posts', ['get']))
        .then((isAllowed) => {
          expect(isAllowed).to.equal(true);
          done();
        })
        .catch(done);
    });

    it('should require Acl service', (done) => {
      const aclTest = r2base({ baseDir: __dirname });
      aclTest.start()
        .serve(r2system)
        .serve(r2user, { jwt: { secret: '1234', expiresIn: 7 } })
        .into(aclTest);

      expect(aclTest.service('User').allowRole).to.equal(false);
      done();
    });

    it('should not allow role via invalid permissions', (done) => {
      User.allowRole('admin', 'posts', ['notFound']).catch((err) => {
        expect(err).to.deep.equal({ permissions: ['The selected permissions is invalid.'] });
        done();
      });
    });
  });
});

function dropDatabase(done) {
  this.timeout(0);
  app.service('Mongoose').connection.dropDatabase();
  done();
}

after(dropDatabase);
