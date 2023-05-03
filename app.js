const express = require('express');
const app = express();
const session = require('express-session');
const usersModel = require('./models/w2users');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

//ejs setup: import
let ejs = require('ejs');
// set view engine to ejs
app.set('view engine', 'ejs');


require('dotenv').config();

var MongoDBStore = require('connect-mongodb-session')(session);

const expireTime = 1 * 60 * 60 * 1000; //expires after 1 hour  (hours * minutes * seconds * millis)

app.get('/login', (req, res) => {
    res.render('login.ejs', { "x": req.session.loggedusername })
    // res.redirect('/members')
});

var dbStore = new MongoDBStore({
    // uri: 'mongodb://localhost:27017/connect_mongodb_session_test',
    uri: `mongodb+srv://${process.env.ATLAS_DB_USER}:${process.env.ATLAS_DB_PASSWORD}@clustera3.9w3qrna.mongodb.net/Comp2537?retryWrites=true&w=majority`,
    collection: 'mySessions'
});

app.use(session({
    secret: process.env.SECRET,
    store: dbStore,
    resave: false,
    saveUninitialized: false
}))


app.use(express.urlencoded({ extended: false })) //built-in express middleware

const Joi = require('joi');

app.use(express.static('public')); //serves static files back to client (global middleware)
app.post('/login', express.json(), async (req, res) => {
    // sanitize the input using Joi

    const schema = Joi.object({
        password: Joi.string()
        // .pattern(new RegExp('^[a-zA-Z0-9]{3, 30}$'))
    })

    schema.validate({})

    try {
        const value = await schema.validateAsync({ password: req.body.password })
    }

    catch (err) {
        console.log(err)
        console.log('The password has to be a string')
        return
    }

    //set global variable to true if user is authenticated
    const result = await usersModel.findOne({
        username: req.body.username
    }
    )
    console.log(result)
    // console.log(req.body.password)
    // console.log(result?.password)
    console.log(bcrypt.compareSync(req.body.password, result.password))

    if (bcrypt.compareSync(req.body.password, result?.password)) {
        req.session.AUTHENTICATED = true;
        req.session.loggedusername = req.body.username;
        req.session.loggedpassword = req.body.password;
        req.session.loggedtype = result.type;
        req.session.cookie.maxAge = expireTime
        res.redirect('/members');
    }
    else {
        res.render('wrongpassword.ejs')
    }

});

//add login and register button to homepage
app.get('/', (req, res) => {

    //check if user is logged in
    if (req.session.AUTHENTICATED) {
        //send members and signout buttons
        res.render('protected.ejs', { "x": req.session.loggedusername, "isAdmin": req.session.loggedtype == "admin" });
    }
    else {
        //send login and register buttons
        res.render('index.ejs');
    }
});

app.get('/signup', (req, res) => {
    res.render('signup.ejs');
});

// save user to db
app.post('/signup', async (req, res) => {
    //check if username already exists
    const result = await usersModel.findOne({
        username: req.body.username
    }
    )
    if (result) {
        return res.render('usernameExists.ejs');
    }
    //hash password
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    //save user to db
    const user = new usersModel({
        username: req.body.username,
        password: hashedPassword,
        type: "user"
    });
    await user.save();
    res.redirect('/login');
});

// only for authenticated users
const auth = (req, res, next) => {
    //only call next if user is authenticated
    if (!req.session.AUTHENTICATED) {
        // res.send('<h1>Not authenticated</h1>');
        res.redirect('/')
        return res.status(401).json({ error: 'Not authenticated' });
    }
    next();
};

app.get('/members', auth, async (req, res) => {
    // serve one of the three images randomly
    //generate number between 1 and 3
    const random = Math.floor(Math.random() * 3) + 1;
    const image = `magic${random}.jpeg`;

    //show username 3 lines down
    // HTMLResponse = `
    // Hello ${req.session.loggedusername}! 
    // <h1>Protected route: Members only!</h1>
    // <img src="magic${random}.jpeg" />`
    // res.send(HTMLResponse);
    // res.send('<h1>Protected route</h1>');


    const result = await usersModel.findOne({ username: req.session.loggedusername })
    //send data to ejs template
    //second arg is an object, any name (as strings) can be used for the keys
    res.render('protected.ejs', {
        "x": req.session.loggedusername, "y": image, "isAdmin": req.session.loggedtype == "admin", "todos": result.todos

    });
});

app.post('/addNewTodo', auth, async (req, res) => {
    //find user
    const result = await usersModel.findOne({ username: req.session.loggedusername })

    //update array
    //upate user's array
    const newArr = await usersModel.updateOne({
        username: req.session.loggedusername
    }, {
        $push: {
            todos: { "name": req.body.task }
        }
    })
    console.log(newArr)
    //redirect to protected route
    res.redirect('/members');
})

app.post('/flipTodo', auth, async (req, res) => {
    // console.log('triggered')
    // console.log(req.body)
    //find user
    const result = await usersModel.findOne({ username: req.session.loggedusername })
    // console.log(result)

    //update todo item (flip)
    const newArr = result.todos.map((todoItem) => {
        if (todoItem.name == req.body.task) {
            todoItem.done = !todoItem.done
        }
        return todoItem
    })

    //update user's todos array
    const updateResult = await usersModel.updateOne({
        username: req.session.loggedusername
    }, {
        todos: newArr
    })
    res.redirect('/members')
})

app.post('/deleteTodo', auth, async (req, res) => {
    //find user
    const result = await usersModel.findOne({ username: req.session.loggedusername })

    // delte item from array
    const newArr = result.todos.filter((todoItem) => {
        return todoItem.name != req.body.task
    })

    // update user's todos array
    const updateResult = await usersModel.updateOne({
        username: req.session.loggedusername
    }, {
        todos: newArr
    })

    //redirect to protected route 
    res.redirect('/members');
})

app.get('/about', auth, (req, res) => {
    res.render('about.ejs', {
        "x": req.session.loggedusername
    })
})
//add logout route
app.get('/logout', auth, (req, res) => {
    //destroy session
    req.session.destroy();
    res.redirect('/');
});

// only for admins
const authAdmin = async (req, res, next) => {
    //only call next if user is authenticated
    console.log("authAdmin")
    const result = await usersModel.findOne(
        {
            username: req.session.loggedusername
        }
    )
    console.log(result)
    if (!req.session.AUTHENTICATED) {
        return res.redirect('/')
    }
    else if (result?.type != "admin") {
        //set 401 error
        console.log("username: ", req.session.loggedusername)
        return res.render('notadmin.ejs', { "x": req.session.loggedusername });
    }
    next();
};

app.post('/demoteToUser', auth, async (req, res) => {
    const newType = "user"

    // update user's type
    const updateResult = await usersModel.updateOne({
        username: req.body.user
    }, {
        type: newType
    })

    //redirect to admin route 
    res.redirect('/admin');

})

app.post('/promoteToAdmin', auth, async (req, res) => {
    const newType = "admin"

    // update user's type
    const updateResult = await usersModel.updateOne({
        username: req.body.user
    }, {
        type: newType
    })

    //redirect to admin route
    res.redirect('/admin');
})

app.get('/admin', authAdmin, async (req, res) => {
    if (!req.session.AUTHENTICATED) {
        return res.redirect('/login')
    }
    const usersList = await usersModel.find()
    res.render('admin.ejs', { "users": usersList });
});

app.get('*', (req, res) => {
    res.status(404).render('404.ejs');
});

module.exports = app;