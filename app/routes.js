module.exports = function(app, passport){
    app.get('/', (req, res)=>{
        res.render('index');
    })

    app.get('/login', (req, res)=>{
        res.render('login', {message: req.flash('loginMessage')});
    })

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash: true
    }),
    
    function(req, res){
        if(req.body.remember){
            req.session.cookies.maxAge = 1000 * 60 * 3;
        }else{
            req.session.cookies.expire = false;
        }
        res.redirect('/'); 
    });

    app.get('/signup', (req, res)=>{
        res.render('signup', {message: req.flash('loginMessage')});
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/signup',
        failureFlash:true
    }));

    app.get('/profile', isLoggedin, (req, res)=>{
        res.render('profile', {
            user: req.user
        });
    });

    app.get('/logout', (req, res) => {
        res.logout();
        res.redirect('/');
    })
};

function isLoggedIn(req, res, next){
    if(req.isAuthenticated());
    return next();

    res.redirect('/');
}