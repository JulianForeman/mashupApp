const express = require('express')
const app = express()
const port = 3000
const fileUpload = require('express-fileUpload');
const connection = require('./database');

var exphbs  = require('express-handlebars');

app.use(express.urlencoded());

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(function (req, res, next) {
  console.log('Time:', Date.now())
  next()
});

app.use(fileUpload({
  limits: { fileSize: 2 * 1024 * 1024 },
}));

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('home')
});

app.get('/register', (req, res) => {
  res.render('register');
})

app.get('/upload', (req, res) => {
  res.render('upload');
});

app.post('/upload', (req,res) => {
  console.log(req.files.fileupload);
  req.files.fileupload.mv('public/tmp/' + req.files.fileupload.name, () => {
    res.render('upload');
  });
});

app.get('/login', (req,res) => res.render('login'));

app.post('/login', (req,res) => {
  var context = {};
  var username = req.body.username;
  var password = req.body.password;
  var email = req.params.email;
  if(!email || !passowrd || !username){
    context.missing_info = true;
    res.render('login', context);
    }
  else{
    connection.query('SELECT * FROM `users` WHERE `email` = ?', [email], (error,results) => {
      if(error)
        throw error;
      if(results[0]){
        bcrypt.compare(password, results[0].password, (error,result) => {
          if(error)
            throw error;
          if(result){
            req.session.user_id = results[0].id;
            res.redirect('/');
          }
        })
      }
      else{
        res.render('login', {invalid_credentials:true});
      }
  })
}

})

app.get('/ranked', (req, res) => {
  res.render('ranked')
})

app.get('/canvas', (req, res) => {
  res.render('canvas')
})

app.get('/profile', (req, res) => {
  res.render('profile')
})

//app.get('/user/:username', (req, res, next))










app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(404).send('The page could not be found!')
});
