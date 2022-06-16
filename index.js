import 'dotenv/config'
import minimist from 'minimist';
import express from 'express';
import { createServer } from "http";
import { engine } from 'express-handlebars';
import MongoService from "./services/mongo-service.js";
import passport from 'passport';
import session from 'express-session';
import passportLocal from "passport-local";
import MongoStore from 'connect-mongo';
import {fork} from 'node:child_process';
import path from 'path';
import {fileURLToPath} from 'url';
import os from 'os';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let args = minimist(process.argv.slice(2), {
    alias: {
        p: 'port',
        m: 'mode'
    },
    default: {
        port: 8080,
        mode: 'fork'
    },
});
console.log(args);

const mongoService = new MongoService();
mongoService.connect();

const LocalStrategy = passportLocal.Strategy;

const app = express();
const { Router } = express;
const routerApi = Router();
const httpServer = createServer(app);


app.use('/api', routerApi);
// app.use( express.static('public'));
app.use(express.urlencoded({extended: true}));

app.use(session({
    store: MongoStore.create({ mongoUrl: process.env.MONGOSESSIONURL }),
    secret: process.env.SECRET,
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


app.get('/', (req, res) => {
    res.render("view");
});

app.get('/info', (req, res) => {
    res.json({
        args: process.argv,
        memory : process.memoryUsage.rss(),
        nodeVersion: process.version,
        workingDir: process.cwd(),
        execDir: process.execPath,
        processId: process.pid,
        platform: process.platform,
        cpus: os.cpus()
    });
});

routerApi.get('/randoms', (req, res) => {
    const cant = req.query.cant ? req.query.cant : 100000000;

    const compute = fork(path.resolve(__dirname, './computo.cjs'));
    compute.on('message', (m) => {
        console.log('PARENT got message:', m);
        res.json(m);
    });

    compute.send(cant);

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


httpServer.listen(args.port, () => {
    console.log(`Example app listening on port ${args.port}`);
})