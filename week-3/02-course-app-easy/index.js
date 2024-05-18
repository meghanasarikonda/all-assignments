const express = require('express');
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

// Admin routes
app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
  const admin = req.body
  const existingAdmin = ADMINS.find(a => a.username === admin.username);
  if (existingAdmin) {
    res.status(403).json({message: "Admin already exists"});
  } else {
    ADMINS.push(admin)
    res.status(200).json({message: 'Admin created successfully'});
  }
});

function adminAuthentication(req, res, next) {
  const username = req.headers.username;
  const password = req.headers.password;
  const existingAdmin = ADMINS.find(a => a.username === username && a.password === password);
  if (existingAdmin) {
    next()
  } else {
    res.status(403).json({message: "Admin Authorization failed"});
  }
}

function userAuthentication(req, res, next) {
  const {username, password} = req.headers;
  const user = USERS.find(u => u.username === username && u.password === password);
  if (user) {
    req.user = user
    next()
  } else {
    res.status(403).json({message: "User Authentication failed"})
  }
}

app.post('/admin/login', adminAuthentication, (req, res) => {
  res.json({message: "Logged in successfully"});
});

app.post('/admin/courses', adminAuthentication, (req, res) => {
  const course = req.body;
  course.id = Date.now();
  COURSES.push(course);
  res.status(200).json({message: 'Course created successfully', courseId: course.id});
});

app.put('/admin/courses/:courseId', (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find(a => a.id == courseId);
  if (course) {
    Object.assign(course, req.body);
    res.json({message: 'Course updated successfully!'});
  } else {
    res.status(404).json({message: 'Course not found'})
  }
});

app.get('/admin/courses', (req, res) => {
  res.json({courses: COURSES})
});

// User routes
app.post('/users/signup', (req, res) => {
  const user = {...req.body, purchasedCourses: []};
  USERS.push(user);
  res.json({message: 'User created successfully'});
});

app.post('/users/login', userAuthentication, (req, res) => {
  res.status(200).json({message: 'Loggedin Successfully'})
});

app.get('/users/courses', userAuthentication, (req, res) => {
  res.json({courses: COURSES.filter(c => c.published)})
});

app.post('/users/courses/:courseId', userAuthentication, (req, res) => {
  var courseId = Number(req.params.courseId)
  var course = COURSES.find(c=> c.id === courseId && c.published)
  if (course) {
    req.user.purchasedCourses.push(courseId)
    res.json({ message: 'Course purchased successfully' });
  } else {
    res.status(404).json({message:"Course not found or available"})
  }
});

app.get('/users/purchasedCourses', userAuthentication, (req, res) => {
  var purchasedIds = req.user.purchasedCourses
  var purchasedCourses = COURSES.filter(c=>purchasedIds.includes(c.id))
  res.json({purchasedCourses})
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
