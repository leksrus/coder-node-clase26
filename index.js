import express from 'express';
import { createServer } from "http";
import { engine } from 'express-handlebars';
import MongoService from "./services/mongo-service.js";



const app = express();
const httpServer = createServer(app);

app.use( express.static('public'));
app.use(express.urlencoded({extended: true}));

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
    res.render("view", {
        isLoggedIn: false,
        isRegister: false
    });
});

app.post('/', (req, res) => {
    res.render("view", {
        isLoggedIn: true,
        isRegister: false
    });
});

app.get('/register', (req, res) => {
    res.render("view", {
        isLoggedIn: false,
        isRegister: true
    });
});

app.post('/register', async (req, res) => {
    const mongoService = new MongoService();
    const username = req.body.username;
    const password = req.body.password;

    await mongoService.connect();
    const isExist = await mongoService.findUser(username);

    if(isExist) return  res.render('error', {
        message: 'User already exists'
    });

    const user = await mongoService.createUser(username, password);

    await mongoService.disconect();

    if (user) return  res.redirect('/');

});


httpServer.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})