var express = require('express'),
    faker = require('faker'),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    jwt = require('jsonwebtoken'),
    expressJwt = require('express-jwt');

var jwtSecret = 'Vinay';

var user ={
    username:'vinay',
    password:'v'
};

var app = express();

app.use(cors());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(expressJwt({secret:jwtSecret}).unless({path:['/login']}));


app.get('/randomuser', function(req, res){
   var user = faker.Helpers.userCard();
    user.avatar = faker.Image.avatar();
    res.json(user);
});

app.post('/login', authenticate, function(req, res){
    var token = jwt.sign({
        username:user.username
    }, jwtSecret);
    res.send({
        token:token,
        user:user
    });
});

app.get('/me', function(req, res){
    res.send(req.user);
})

app.listen(3000, function(){
    console.log('listening on port 3000');
});


function authenticate(req, res, next){
    var body = req.body;
    if(!body.username || !body.password){
        res.status(400).end('Please provide the username and password');
    }
    if(body.username !== user.username || body.password !== user.password){
        res.status(401).end('Username or password incorrect');
    }
    next();
}