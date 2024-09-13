// CONSTS **
const ethers = require('ethers');
const { WriteToEarn__factory } = require('./artifacts/contracts/WriteToEarn.sol/WriteToEarn.json');
const express = require('express');
const app = express();
const { pool } = require('./dbConfig.js');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
const initializePassport = require('./pswConfig.js');
const path = require('path');
const fs = require('fs');
const fileUpload = require('express-fileupload');

const contractAddress = '0xAB45B4a3DC1A063495a77F7b9b96AACd0b9163f3';
const privateKey = '549e3f5888fe8549674700d630b69c7eefa592bbb636dafc41001095d064f7c7';

const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/2f8f691f0bcc41ee81bd4d181e959c9e');
const wallet = new ethers.Wallet(privateKey, provider);

let writeToEarnContract;

try {
  const contractJSON = require('../dapp/artifacts/contracts/WriteToEarn.sol/WriteToEarn.json');
  const { abi, networks } = contractJSON;
  const networkId = Object.keys(networks)[0]; // Assuming you're using a single network

  writeToEarnContract = new ethers.Contract(contractAddress, abi, wallet);
} catch (error) {
  console.error('Error initializing contract:', error);
}

// Check if the contract instance is properly initialized
if (!writeToEarnContract) {
  console.error('Failed to initialize the contract instance.');
} else {
  console.log('WriteToEarn contract initialized successfully:', writeToEarnContract.address);
}

// END **

require('dotenv').config();
initializePassport(passport);

app.set('view engine', 'ejs');

// APP USES **
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(fileUpload());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});
// END **

// APP GETS **
app.get('/dashboard', async (req, res) => {
  try {
    // Fetch additional data as needed
    const articleOrders = await pool.query('SELECT ao.*, c.category_name, ad.direction_name FROM article_orders ao JOIN categories c ON ao.category_id = c.category_id JOIN article_directions ad ON ao.direction_id = ad.direction_id');
    const categories = await pool.query('SELECT * FROM categories');
    const article_directions = await pool.query('SELECT * FROM article_directions');

    // Pass contract data and other data to the template
    res.render('dashboard', {
      article_orders: articleOrders.rows,
      categories: categories.rows,
      article_directions: article_directions.rows
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/register', checkAuthenticated, (req, res) => {
  res.render('register');
});
app.get('/example', checkAuthenticated, (req, res) => {
  res.render('example');
});
app.get('/login', checkAuthenticated, (req, res) => {
  res.render('login');
});
app.get('/', checkAuthenticated, (req, res) => {
  res.render('welcome');
});
app.get('/fill_out', checkNotAuthenticated, async (req, res) => {
  try {
    const categories = await pool.query('SELECT * FROM categories');
    const article_directions = await pool.query('SELECT * FROM article_directions'); // Fetch article directions

    res.render('fill_out', { categories: categories.rows, article_directions: article_directions.rows }); // Pass article_directions to the template
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/profile', checkNotAuthenticated, async (req, res) => {
  try {
    // Fetch user information from the database
    const userId = req.user.id; // Assuming you're using Passport.js for user authentication
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

    if (user.rows.length === 0) {
      // Handle the case where the user is not found
      return res.status(404).send('User not found');
    }

    // Render the profile page and pass the user data to it
    res.render('profile', { user: user.rows[0] });
  } catch (error) {
    console.error('Error fetching user information:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/filter-jobs', async (req, res) => {
  const { category, tags } = req.query;

  let filterQuery = 'SELECT * FROM article_orders WHERE 1 = 1';

  if (category !== 'All') {
    filterQuery += ` AND category_id = ${category}`;
  }

  if (tags && tags.length > 0) {
    const tagIds = tags.split(',');
    filterQuery += ` AND order_id IN (SELECT article_order_id FROM article_order_tags WHERE tag_id IN (${tagIds}))`;
  }

  try {
    const filteredJobs = await pool.query(filterQuery);
    res.render('filtered_jobs', { article_orders: filteredJobs.rows });
  } catch (error) {
    console.error('Error filtering jobs:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/edit_order/:order_id', checkAdmin, async (req, res) => {
  const orderId = req.params.order_id;

  try {
    const order = await pool.query('SELECT * FROM article_orders WHERE order_id = $1', [orderId]);

    if (order.rows.length === 0) {
      // Handle the case where the order is not found
      return res.status(404).send('Order not found');
    }

    const categories = await pool.query('SELECT * FROM categories');
    const article_directions = await pool.query('SELECT * FROM article_directions');
    const article_status = await pool.query('SELECT * FROM article_status'); // Fetch article status options

    res.render('edit_order', { order: order.rows[0], categories: categories.rows, article_directions: article_directions.rows, article_status: article_status.rows });
  } catch (error) {
    console.error('Error fetching order data:', error);
    res.status(500).send('Internal Server Error');
  }
});
const userIsWriter = true;
app.get('/article_detail/:orderId', async (req, res) => {
  const orderId = req.params.orderId;

try {
  const result = await pool.query(`
  SELECT ao.*, c.category_name, ad.direction_name
  FROM article_orders ao
  LEFT JOIN categories c ON ao.category_id = c.category_id
  LEFT JOIN article_directions ad ON ao.direction_id = ad.direction_id
  WHERE ao.order_id = $1
`, [orderId]);

  if (result.rows.length === 0) {
    res.status(404).send('Статья не найдена');
    return;
  }

  const article = result.rows[0];
  res.render('article_detail', { order: article, userIsWriter: userIsWriter });
} catch (error) {
  console.error(error);
  res.status(500).send('Ошибка сервера');
}
});

// END **

// APP POSTS **
app.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});
app.post('/register', async (req, res) => {
  let { nickname, email, password, password_confirm } = req.body;
  let errors = [];

  console.log({
    nickname,
    email,
    password,
    password_confirm,
  });

  if (!nickname || !email || !password || !password_confirm) {
    errors.push({ message: 'Please enter all fields correctly' });
  }
  if (password.length < 6) {
    errors.push({ message: 'Password must be 6 characters long' });
  }

  if (password !== password_confirm) {
    errors.push({ message: 'Passwords do not match' });
  }

  if (errors.length > 0) {
    res.render('register', { errors, nickname, email, password, password_confirm });
  } else {
    hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email],
      (err, results) => {
        if (err) {
          console.log(err);
        }
        console.log(results.rows);
        if (results.rows.length > 0) {
          return res.render('register', {
            message: 'Email already registered',
          });
        } else {
          pool.query(
            `INSERT INTO users (nickname, email, password)
            VALUES ($1, $2, $3)
            RETURNING id, password`,
            [nickname, email, hashedPassword],
            (err, results) => {
              if (err) {
                console.log(err);
                return res.render('register', {
                  message: 'Failed to register. Please try again later.',
                });
              }
              console.log(results.rows);
              req.flash('success_msg', 'You are successfully registered');
              res.redirect('/login');
            }
          );
        }
      }
    );
  }
});
app.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true,
  }), (req, res) => {
    req.session.loggedin = true;
    req.session.passport.user.roles_id = user.roles_id;
  }
  
);
app.post('/fill_out', checkNotAuthenticated, async (req, res) => {
  const { category_id, direction_id, title, content} = req.body;
  const userId = req.user.id;

  try {
      const categoryId = parseInt(category_id);
      const directionId = parseInt(direction_id);

      if (isNaN(categoryId) || isNaN(directionId)) {
          return res.status(400).send('Invalid category or direction value');
      }

      await pool.query('INSERT INTO article_orders (user_id, category_id, direction_id, title, content, status, price) VALUES ($1, $2, $3, $4, $5, $6, $7)', [userId, categoryId, directionId, title, content, 'In process', 0.001]);
      res.redirect('/dashboard');
  } catch (error) {
      console.error('Error inserting article order:', error);
      res.status(500).send('Internal Server Error');
  }
});
app.post('/update-profile', checkNotAuthenticated, async (req, res) => {
  const { nickname, firstname, lastname, email } = req.body;
  const userId = req.user.id;

  try {
    await pool.query(
      'UPDATE users SET nickname = $1, firstname = $2, lastname = $3, email = $4 WHERE id = $5',
      [nickname, firstname, lastname, email, userId]
    );

    req.flash('success_msg', 'Profile information updated successfully');
    res.redirect('/profile');
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/update-password', checkNotAuthenticated, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user.id;

  try {
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

    if (user.rows.length === 0) {
      return res.status(404).send('User not found');
    }

    const storedPassword = user.rows[0].password;
    const isPasswordMatch = await bcrypt.compare(currentPassword, storedPassword);

    if (!isPasswordMatch) {
      req.flash('error_msg', 'Current password is incorrect');
      return res.redirect('/profile');
    }

    if (newPassword !== confirmPassword) {
      req.flash('error_msg', 'New passwords do not match');
      return res.redirect('/profile');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);

    req.flash('success_msg', 'Password updated successfully');
    res.redirect('/profile');
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/edit_order/:order_id', checkAdmin, async (req, res) => {
  const orderId = req.params.order_id;
  const { category_id, direction_id, title, content, status, price } = req.body;

  try {
    await pool.query(
      'UPDATE article_orders SET category_id = $1, direction_id = $2, title = $3, content = $4, status = $5, price = $6 WHERE order_id = $7',
      [category_id, direction_id, title, content, status, price, orderId]
    );

    req.flash('success_msg', 'Order updated successfully');
    res.redirect('../dashboard');
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/delete-article/:order_id', checkAdmin, async (req, res) => {
  console.log('Delete article route reached');
  const orderId = req.params.order_id;
  console.log('Deleting article with order_id:', orderId);


  try {
    await pool.query('DELETE FROM article_orders WHERE order_id = $1', [orderId]);
    req.flash('success_msg', 'Article deleted successfully');
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error deleting article:', error);
    req.flash('error_msg', 'Failed to delete article');
    res.redirect('/dashboard');
  }
});
app.post('/search-articles', async (req, res) => {
  const { category, title, direction } = req.body;
  
  let searchQuery = `
    SELECT ao.*, c.category_name, ad.direction_name
    FROM article_orders ao
    LEFT JOIN categories c ON ao.category_id = c.category_id
    LEFT JOIN article_directions ad ON ao.direction_id = ad.direction_id
    WHERE 1 = 1
  `;

  if (category) {
    searchQuery += ` AND c.category_id = ${category}`;
  }

  if (title) {
    searchQuery += ` AND ao.title ILIKE '%${title}%'`;
  }

  if (direction) {
    searchQuery += ` AND ad.direction_id = ${direction}`;
  }

  try {
    const searchResults = await pool.query(searchQuery);
    const articleOrders = await pool.query('SELECT ao.*, c.category_name, ad.direction_name FROM article_orders ao JOIN categories c ON ao.category_id = c.category_id JOIN article_directions ad ON ao.direction_id = ad.direction_id');
    const categories = await pool.query('SELECT * FROM categories');
    const article_directions = await pool.query('SELECT * FROM article_directions');

    res.render('dashboard', { article_orders: articleOrders.rows, categories: categories.rows, article_directions: article_directions.rows, search_results: searchResults.rows });
  } catch (error) {
    console.error('Error searching articles:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/complete-order/:order_id', async (req, res) => {
  const orderId = req.params.order_id;

  try {
    const file = req.files.file;
    const safeFileName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const uploadDir = path.join(__dirname, 'uploads');
    const filePath = path.join(uploadDir, safeFileName);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    file.mv(filePath, async (err) => {
      if (err) {
        console.error('Error saving file:', err);
        res.redirect('/dashboard');
      } else {
        await pool.query('UPDATE article_orders SET status = $1 WHERE order_id = $2', ['Done', orderId]);

        const senderId = req.user.id;

        const orderResult = await pool.query('SELECT user_id FROM article_orders WHERE order_id = $1', [orderId]);
        const recipientId = orderResult.rows[0].user_id;

        await pool.query('INSERT INTO order_files (order_id, sender_id, recipient_id, file_path) VALUES ($1, $2, $3, $4)', [orderId, senderId, recipientId, filePath]);

        res.redirect('/dashboard');
      }
    });
  } catch (error) {
    console.error('Error completing order:', error);
    res.redirect('/dashboard');
  }
});
// END **

// Checking Authentication and Roles
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/dashboard');
  }
  next();
}
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}
function checkAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.roles_id === 1) {
    return next();
  }
  res.status(403).send('Permission denied');
}
// END **

// Localhost Port **
let port = process.env.PORT;
if (port == null || port == '') {
  port = 5000;
}
app.listen(port, function () {
  console.log(`Server has started successfully at ${port}`);
});
// END **