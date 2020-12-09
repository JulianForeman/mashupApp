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
  var context = {};
  if (req.session.user_id == null) {
    context.not_logged_in = true;
  }
  else{
    context.not_logged_in = false;
    connection.query('SELECT `post_id` FROM `Likes` WHERE `user_id` = ?', [req.session.user_id], (error, results) => {
      if(error){
        throw error;
      }
      else{
        console.log(results);
      }
    })
  }
  connection.query('SELECT `id` FROM `Posts` ORDER BY `id` DESC', (error, results) => {
    connection.query('SELECT * FROM `Users` LEFT JOIN `Ranks` on `Users`.`rank_id` = `Ranks`.`id`', (error, results2) => {
      if (error) {
        throw error;
      }
      if (results === null) {
        results2[0].password = null;
        context.user = results2[0];
        context.no_images = true;
        return res.render('home', context);
      }
      else{
        context.user = results2[0];
        context.images = results;
        return res.render('home', context);
      }
    })
  })
});

app.get('/register', (req, res) => {
  var context = {};
  if (req.session.user_id == null) {
    context.not_logged_in = true;
  }
  else{
    context.not_logged_in = false;
  }
  if (req.session.user_id) {
    return res.redirect('/')
  }
  return res.render('register', context);
})

app.post('/register', (req, res) => {
  var context = {};
  if (req.session.user_id == null) {
    context.not_logged_in = true;
  }
  else{
    context.not_logged_in = false;
  }
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  var confirm_password = req.body.confirm_password;

  if (!username || !email || !password || !confirm_password) {
    context.missing_info = true;
    return res.render('register', context);
  }
  else{
    connection.query('SELECT * FROM `Users` WHERE `username` = ?', [username], async (error, results) => {
      if(error){
        throw error;
      }
      if (results[0]) {
        context.username_exists = true;
        return res.render('register', context);
      }
      if(password === confirm_password && context.username_exists !== true){
        var hashed_pass = await bcrypt.hash(password, saltRounds);
        connection.query('INSERT INTO `Users` (username, email, password, rank_id) VALUES (?, ?, ?, 1)', [username, email, hashed_pass], (error, results) => {
          if (error) {
            throw error;
          }
          req.session.user_id = results.insertId;
          return res.redirect('/');
        });
      }
    })
  }
})

app.get('/upload', (req, res) => {
  return res.render('upload');
});

app.post('/upload', (req,res) => {
  if (!req.session.user_id) {
    return res.send('NOT_LOGGED_IN');
  }
  connection.query('INSERT INTO `Posts` (`user_id`, `likes`, `mashups`) VALUES (?, 0, 0)', [req.session.user_id], (error,results) => {
    if (error) {
      throw error;
    }
    connection.query('UPDATE `Users` SET `total_posts` = `total_posts` +1 WHERE `id` = ?', [req.session.user_id]);
    let insert_id = results.insertId;
    req.files.image.mv('public/images/' + insert_id + '.png');
    res.send('OK:' + insert_id);
  })
});

app.get('/image/:image_id', (req,res,next) => {
  var context = {};
  if (req.session.user_id == null) {
    context.not_logged_in = true;
  }
  else{
    context.not_logged_in = false;
  }
  let image_id = req.params.image_id;
  connection.query('SELECT `Posts`.*, `Users`.`username` FROM `Posts` LEFT JOIN `Users` ON `Users`.`id` = `Posts`.`user_id` WHERE `Posts`.`id` = ?', [image_id], (error, results, next) => {
      if (error) {
        throw error;
      }
      if(!results[0]){
        next
      }
      else{
        context.image = results[0];
        connection.query('SELECT * FROM `Users` WHERE `id` = ?', [context.image.user_id], (error, results2, next) => {
          context.user = results2[0];
          if (context.image.user_id == req.session.user_id) {
            context.own_image = true;
          }
          connection.query('SELECT `user_id` FROM `Likes` WHERE `post_id` = ?', [image_id], (error, result) => {
            if (error) {
              throw error
            }
            if(!result[0]){
              context.liked = false;
            }
            else{
              if (result[0].user_id != req.session.user_id || result[0].user_id == null) {
                context.liked = false;
              }
              else{
                context.liked = true;
              }
            }
          })
          return res.render('image', context);
        })
      }
  })
})

app.get('/login', (req,res) => {
  var context = {};
  if (req.session.user_id == null) {
    context.not_logged_in = true;
  }
  else{
    context.not_logged_in = false;
  }
  if (req.session.user_id) {
    return res.redirect('/')
  }
  return res.render('login', context)
});

app.post('/login', (req,res) => {
  var context = {};
  if (req.session.user_id == null) {
    context.not_logged_in = true;
  }
  else{
    context.not_logged_in = false;
  }
  var username = req.body.username;
  var password = req.body.password;
  if(!password || !username){
    context.missing_info = true;
    return res.render('login', context);
    }
  else{
    connection.query('SELECT * FROM `Users` WHERE `username` = ?', [username], (error,results) => {
      if(error)
        throw error;
      if(results[0]){
        bcrypt.compare(password, results[0].password, (error,result) => {
          if(error)
            throw error;
          if(result){
            req.session.user_id = results[0].id;
            results[0].password = null;
            return res.redirect('/');
          }
          else{
            results[0] = null;
            context.invalid_credentials = true;
            return res.render('login', context);
          }
        })
      }
      else {
        results[0] = null;
        context.no_found_user = true;
        return res.render('login', context);
      }
  })
}

})

app.get('/ranked', (req, res) => {
  var context = {};
  if (req.session.user_id == null) {
    context.not_logged_in = true;
  }
  else{
    context.not_logged_in = false;
  }

  connection.query("SELECT `username`, `profile_image`, `season_score`, `rank_image`, `rank_name` FROM `Users` LEFT JOIN `Ranks` on `Users`.`rank_id` = `Ranks`.`id` ORDER BY `season_score` DESC", (error, results) => {
    if (error) {
      throw error;
    }
    if (results[0] == null) {
      context.noUsers = true;
      return res.render('ranked', context);
    }
    else{
      context.users = results;
      return res.render('ranked', context);
    }
    return res.render('ranked', context);
  })
})

app.get('/ranked/:rankName', (req,res) => {
  var context = {};
  if (req.session.user_id == null) {
    context.not_logged_in = true;
  }
  else{
    context.not_logged_in = false;
  }
  connection.query("SELECT `username`, `profile_image`, `season_score`, `rank_image`, `rank_name` FROM `Users` LEFT JOIN `Ranks` on `Users`.`rank_id` = `Ranks`.`id` WHERE `Ranks`.`rank_name` = ? ORDER BY `season_score` DESC", [req.params.rankName], (error, results) => {
    if (error) {
      throw error;
    }
    if (results[0] == null) {
      context.noUsers = true;
      return res.render('ranked', context);
    }
    else{
      context.users = results;
      return res.render('ranked', context);
    }
    return res.render('ranked', context);
  })
})


app.get('/canvas', (req, res) => {
  var context = {};
  if (req.session.user_id == null) {
    context.not_logged_in = true;
  }
  else{
    context.not_logged_in = false;
  }
  return res.render('canvas', context)
})

app.post('canvas', (req, res) => {
  if (req.session.user_id) {
    context.not_logged_in = false;
  }
  else{
    context.not_logged_in = true;
    return res.render('canvas', context);
  }
})

app.get('/mashup/:image_id', (req,res) => {
  var context = {};
  if (req.session.user_id == null) {
    context.not_logged_in = true;
  }
  else{
    context.not_logged_in = false;
  }
  let image_id = req.params.image_id;
  connection.query('SELECT `Posts`.*, `Users`.`username` FROM `Posts` LEFT JOIN `Users` ON `Users`.`id` = `Posts`.`user_id` WHERE `Posts`.`id` = ?', [image_id], (error, results, next) => {
    connection.query('UPDATE `Users` LEFT JOIN `Posts` on `Users`.`id` = `Posts`.`user_id` SET `Users`.`season_score` = `Users`.`season_score` + 1, `Users`.`total_score` = `Users`.`total_score` + 1 WHERE `Posts`.`id` = ?', [parseInt(image_id)], (error,unusedResults) => {
      if (error) {
        throw error;
      }
    });

      if (error) {
        throw error;
      }
      if(!results[0]){
        next;
      }
      else{
        context.image = results[0];
        let image_url = `/images/${context.image.id}.png`;
        context.image.image_url = image_url;
        connection.query('SELECT * FROM `Users` WHERE `id` = ?', [context.image.user_id], (error, results2, next) => {
          context.user = results2[0];
          return res.render('canvas', context);
        })
      }
  })
})

app.get('/profile', (req, res) => {
  var context = {};
  if (!req.session.user_id) {
    return res.redirect('/login')
  }
  connection.query('SELECT `id` FROM `Posts` WHERE `user_id` = ? ORDER BY `id` DESC', [req.session.user_id], (error, results) => {
    connection.query('SELECT `Users`.`id`, `Users`.`username`, `Users`.total_posts,`Users`.`total_mashups`, `Users`.total_likes, `Ranks`.rank_name, `Ranks`.rank_image FROM `Users` LEFT JOIN `Ranks` on `Users`.`rank_id` = `Ranks`.`id` WHERE `Users`.`id` = ?', [req.session.user_id], (error, results2) => {
      if (error) {
        throw error;
      }
      if (results === null) {
        context.user = results2[0];
        context.no_images = true;
        if (req.session.user_id == context.user.id) {
          context.own_profile = true;
        }
        return res.render('profile', context);
      }
      else{
        context.user = results2[0];
        context.images = results;
        if (req.session.user_id == context.user.id) {
          context.own_profile = true;
        }
        return res.render('profile', context);
      }
    })
  })
})

app.get('/user/:username', (req,res) => {
  var context = {};
  if (!req.session.user_id) {
    return res.redirect('/login')
  }
  connection.query('SELECT `Users`.`id` FROM `Users` WHERE `username` = ?', [req.params.username], (error,results) => {
    if (error) {
      throw error
    }
    if (!results[0]) {
      res.redirect('/')
    }
    else{
      var user_profile = results[0];
      console.log(user_profile);
      console.log(user_profile.id);
      connection.query('SELECT `Posts`.`id` FROM `Posts` LEFT JOIN `Users` on `Posts`.`user_id` = `Users`.`id` WHERE `Users`.`id` = ? ORDER BY `id` DESC', [user_profile.id], (error, results) => {
        connection.query('SELECT `Users`.`id`, `Users`.`username`, `Users`.total_posts,`Users`.`total_mashups`, `Users`.total_likes, `Ranks`.rank_name, `Ranks`.rank_image FROM `Users` LEFT JOIN `Ranks` on `Users`.`rank_id` = `Ranks`.`id` WHERE `Users`.`id` = ?', [user_profile.id], (error, results2) => {
          if (error) {
            throw error;
          }
          if (results === null) {
            context.user = results2[0];
            context.no_images = true;
            if (req.session.user_id == context.user.id) {
              context.own_profile = true;
            }
            return res.render('profile', context);
          }
          else{
            context.user = results2[0];
            context.images = results;
            if (req.session.user_id == context.user.id) {
              context.own_profile = true;
            }
            return res.render('profile', context);
          }
        })
      })
    }
  });
})



// api routes

app.get('/api/like/:post_id',(req,res) =>
 {
 let post_id = parseInt(req.params.post_id);
 if (!req.session.user_id)
    return res.json({success:false,error:'NOT_LOGGED_IN'});
 connection.query('INSERT INTO `Likes` (`user_id`,`post_id`) VALUES (?,?)',[req.session.user_id,post_id],(error,results) =>
   {
   if (error){
     return res.json({success:false,error});
   }
  connection.query('UPDATE `Users` LEFT JOIN `Posts` on `Users`.`id` = `Posts`.`user_id` SET `Users`.`season_score` = `Users`.`season_score` + 3, `Users`.`total_score` = `Users`.`total_score` + 3 WHERE `Posts`.`id` = ?', [post_id], (error,results) => {
    if (error) {
      return res.json({success:false,error});
    }
  })
  return res.json({success:true}); // return the db results as JSON.
   });
 });

 app.get('/api/unlike/:post_id',(req,res) =>
  {
  let post_id = parseInt(req.params.post_id);
  if (!req.session.user_id)
     return res.json({success:false,error:'NOT_LOGGED_IN'});
  connection.query('DELETE FROM `Likes` WHERE `post_id` = ? AND `user_id` = ?',[post_id, req.session.user_id],(error,results) =>
    {
    if (error)
      return res.json({success:false,error});
      connection.query('UPDATE `Users` LEFT JOIN `Posts` on `Users`.`id` = `Posts`.`user_id` SET `Users`.`season_score` = `Users`.`season_score` - 3, `Users`.`total_score` = `Users`.`total_score` - 3 WHERE `Posts`.`id` = ?', [post_id], (error,results) => {
        if (error) {
          throw error;
        }
      })
    return res.json({success:true}); // return the db results as JSON.
    });
  });






app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(404).send('The page could not be found!')
});
