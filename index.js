import express from 'express';
import { createServer } from "http";
import { engine } from 'express-handlebars';
import MongoService from "./services/mongo-service.js";
import passport from 'passport';
import session from 'express-session';
import passportLocal from "passport-local";
import MongoStore from 'connect-mongo';

const mongoService = new MongoService();
mongoService.connect();

const LocalStrategy = passportLocal.Strategy;

const app = express();
const httpServer = createServer(app);

app.use( express.static('public'));
app.use(express.urlencoded({extended: true}));

app.use(session({
    store: MongoStore.create({ mongoUrl: 'mongodb+srv://test:NMZQbTCltcIhpUa3@cluster0.zxw9v.mongodb.net/sessions?retryWrites=true&w=majority' }),
    secret: 'mysecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 10
    }
}));

const verifyCallBack = async (username, password, done) => {
    const isValid = await mongoService.checkUserAndCredentials(username, password);
    if(isValid) return done(null, {username: username});

    return done(null, false)
}


passport.use(new LocalStrategy({ usernameField: "username", passwordField: 'password' },
   verifyCallBack
));

passport.serializeUser((user, done) =>{
    done(null, user.username);
});

passport.deserializeUser((username, done) => {
    done(null, {username: username});
});


app.use(passport.initialize());
app.use(passport.session());

app.engine(
    "hbs",
    engine({
        extname: ".hbs",
        defaultLayout: 'index.hbs',
    })
);

app.set('views', './views');
app.set('view engine', 'hbs');

const port = 8080;

app.get('/', (req, res) => {
    res.render("view");
});

app.get('/login', (req, res) => {
    res.render("login", {
        isLoggedIn: req.user ? true : false,
        username: req.user?.username
    });
});

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if(user) {
            return req.login(user, (err) => {
                return res.redirect('/login');
            });
        }
        return res.render('error',{
            message: 'Wrong username or password'
        } )

    })(req, res, next);
});


app.get('/register', (req, res) => {
    res.render("register", {
        isLoggedIn: false,
        isRegister: true
    });
});

app.post('/register', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const isExist = await mongoService.findUser(username);

    if(isExist) {
        return  res.render('error', {
            message: 'User already exists'
        });
    }

    const user = await mongoService.createUser(username, password);


    if (user) return  res.redirect('/');

});

app.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.session.destroy();
        res.redirect('/');
    });
});


httpServer.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})