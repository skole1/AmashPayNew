const localStrategy = require('passport-local').Strategy;

const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const dbconfig = require('./database')

const db = mysql.createConnection(dbconfig.connection)
db.query('USE' + dbconfig.database)

module.exports = function(passport){
    passport.serializeUser(function(user, done){
        done(null, user.id);
       });

       passport.deserializeUser(function(id, done){
        db.query("SELECT * FROM users WHERE id = ? ", [id],
         function(err, rows){
          done(err, rows[0]);
         });
       });

       passport.use(
           'local-signup',
           new LocalStrategy({
               usernameField: 'email',
               passwordField: 'password',
               passReqToCallback: true
           },
           function(req, email, password, done){
               db.query("SELECT * FROM users WHERE email = ?", [email], (err, rows) =>{
                if(err){
                    return done(err)
                }
                if(rows.length){
                    return done(null, false, req.flash('signupMessage','That is already taken'));
                }else{
                    const newUserMysql = {
                        email: email,
                        password: bcrypt.hashSync(password, null, null)
                    }

                    const inserQuery = "INSERT INTO users (email, password) VALUES(?,?)";
                    db.query(inserQuery, [newUserMysql.email, newUserMysql.password], (err, rows)=>{
                        newUserMysql.id = rows.insertId;
                        return done(null, newUserMysql);
                    })
                }
               })
           })
       )

    passport.use({
        'local-login',
        new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function(req, email, password, done){
            db.query("SELECT * FROM users WHERE email = ?", [email], (err, rows)=>{
                if(err){
                    return done(err);
                }
                if(!rows.length){
                    return done(null, false, req.flash('loginMessage', 'No user found'))
                }
                if(!bcrypt.compareSync(password, rows.password)){
                    return done(null, false, req.flash('loginMessage', 'Wrong password'))
                }
                return done(null, rows[0])
            })
        })
    })
}