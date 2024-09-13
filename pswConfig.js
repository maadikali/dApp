const LocalStrategy = require('passport-local').Strategy;
const { pool } = require('./dbConfig.js');
const bcrypt = require('bcrypt');

function initialize(passport) {
  console.log('Initialized');
  const authenticateUser = (email, password, done) => {
    pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email],
      (err, results) => {
        if (err) {
          throw err;
        }
        console.log(results.rows);
        if (results.rows.length > 0) {
          const user = results.rows[0];
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
              console.log(err);
            }
            if (isMatch) {
              return done(null, user); // Include user object here
            } else {
              return done(null, false, { message: 'Password is not correct' });
            }
          });
        } else {
          return done(null, false, { message: 'You are not registered yet !' });
        }
      }
    );
  };
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      authenticateUser
    )
  );
  passport.serializeUser((user, done) => {
    // Serialize the user object, including the roles_id
    done(null, { id: user.id, roles_id: user.roles_id });
  });

  passport.deserializeUser((user, done) => {
    // Deserialize the user object
    pool.query(`SELECT * FROM users WHERE id = $1`, [user.id], (err, results) => {
      if (err) {
        return done(err);
      }
      console.log(`ID is ${results.rows[0].id}`);
      return done(null, results.rows[0]);
    });
  });
}

module.exports = initialize;
