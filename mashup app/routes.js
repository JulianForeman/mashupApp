const express = require('express')
const app = express()
const port = 3000
const fileUpload = require('express-fileUpload');
const connection = require('./database');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const session = require('express-session');

var exphbs  = require('express-handlebars');

app.use(express.urlencoded());

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(session({
  secret: 'secret_canvas'
}))

app.use(fileUpload({
  limits: { fileSize: 2 * 1024 * 1024 },
}));

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('home')
});

app.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/')
  }
  res.render('register');
})

app.post('/register', (req, res) => {
  var context = {};
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  var confirm_password = req.body.confirm_password;

  if (!username || !email || !password || !confirm_password) {
    context.missing_info = true;
    res.render('register', context);
  }
  else{
    connection.query('SELECT * FROM `Users` WHERE `username` = ?', [username], async (error, results) => {
      if(error){
        throw error;
      }
      if (results[0]) {
        context.username_exists = true;
        res.render('register', context);
      }
      if(password === confirm_password && context.username_exists !== true){
        var hashed_pass = await bcrypt.hash(password, saltRounds);
        connection.query('INSERT INTO `Users` (username, email, password, rank_id) VALUES (?, ?, ?, 1)', [username, email, hashed_pass], (error, results) => {
          if (error) {
            throw error;
          }
          req.session.user_id = results.insertId;
          res.redirect('/');
        });
      }
    })
  }
})

app.get('/upload', (req, res) => {
  res.render('upload');
});

app.post('/upload', (req,res) => {
  console.log(req.files.fileupload);
  if (!req.session.user_id) {
    return res.send('NOT_LOGGED_IN');
  }
  connection.query('INSERT INTO `Posts` (`user_id`, `likes`, `mashups`) VALUES (?, 0, 0)', [req.session.user_id], (error,results) => {
    if (error) {
      throw error;
    }
    let insert_id = results.insertId;
    req.files.image.mv('public/images/' + insert_id + '.png');
    res.send('OK:' + insert_id);
  })
});

app.get('/image/:image_id', (req,res,next) => {
  let image_id = req.params.image_id;
  connection.query('SELECT `Posts`.*, `Users`.`username` FROM `Posts` LEFT JOIN `Users` ON `Users`.`id` = `Posts`.`user_id` WHERE `Posts`.`id` = ?', [image_id], (error, results, next) => {
    if (error) {
      throw error;
    }
    if(!results[0]){
      next
    }
    else{
      res.render('image', {image:results[0]});
    }
  })
})

app.get('/login', (req,res) => {
  if (req.session.user_id) {
    res.redirect('/')
  }
  res.render('login')
});

app.post('/login', (req,res) => {
  var context = {};
  var username = req.body.username;
  var password = req.body.password;
  if(!password || !username){
    context.missing_info = true;
    res.render('login', context);
    }
  else{
    connection.query('SELECT * FROM `Users` WHERE `username` = ?', [username], (error,results) => {
      if(error)
        throw error;
        console.log('error 1');
      if(results[0]){
        bcrypt.compare(password, results[0].password, (error,result) => {
          if(error)
            throw error;
          if(result){
            req.session.user_id = results[0].id;
            res.redirect('/');
          }
          else{
            context.invalid_credentials = true;
            res.render('login', context);
          }
        })
      }
      else {
        context.no_found_user = true;
        res.render('login', context);
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

app.post('canvas', (req, res) => {
  var context = {};
  if (req.session.user_id) {

  }
  else{
    context.not_logged_in = true;
    res.render('canvas', context);

  }
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
