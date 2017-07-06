var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

app.use(cookieSession({
  name: 'session',
  keys: ["key1"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

var urlDatabase = {
  // "userRandomID" : {
  //   "b2xVn2": "http://www.lighthouselabs.ca",
  //   "9sm5xK": "http://www.google.com"
  // },
  // "user2RandomID" : {
  //   "b2xVn2": "http://www.lighthouselabs.ca",
  //   "9sm5xK": "http://www.google.com"
  // }
}

// var urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const users = {
  // "userRandomID": {
  //   id: "userRandomID",
  //   email: "user@example.com",
  //   password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
 //  },
 // "user2RandomID": {
 //    id: "user2RandomID",
 //    email: "user2@example.com",
 //    password: bcrypt.hashSync("dishwasher-funk",10)
 //  }
}

function giveUserObjGivenId(id, obj){
  return obj[id];
}

function checkForRepInObjOfObjs ( element, key, Obj){
  for (i in Obj){
    if( Obj[i][key] === element ) return true;

  }
}

function generateRandomString() {
  let randomStr = '';
  let alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let i = 1;
  while(i <= 6){
    let min = Math.ceil(0);
    let max = Math.floor(36);
    randomStr += (alphabet[Math.floor(Math.random() * (max - min)) + min]);
    i++;
  }
  return randomStr;
};
//redir root to urls
app.get("/", (req, res) => {
  res.redirect("http://localhost:8080/urls");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//generate new short URL and insert new long+short URL, redirect back to urls page when done
app.post("/urls", (req, res) => {
  let newShort = generateRandomString();
  urlDatabase[req.session.user_id][newShort.toString()] = req.body["longURL"].toString();
  console.log(req.body, newShort);
  res.redirect("http://localhost:8080/urls");
});
//delete an entry
app.post("/urls/:id/delete", (req, res) =>{
  delete urlDatabase[req.session.user_id][req.params.id];
  res.redirect("/urls");
});


app.post("/urls/:id/edit", (req,res) => {
  urlDatabase[req.session.user_id][req.params.id] = req.body["longURL"];
  res.redirect("/urls");
});


app.post("/logout",(req,res) =>{
  req.session = null;
  res.redirect("/urls");

});
//registration handler: generates new user ID and stores info in users obj
app.post("/register", (req,res)=>{
  if ( req.body["email"] === '' || req.body["password"] === '' ) {
    res.send("ERROR 400: please fill in require fields");
    console.log("400: please fill in require fields");
  } else if ( checkForRepInObjOfObjs( req.body["email"], "email", users) ) {
    res.send("ERROR 400: account already registered with that email");
    console.log("400: account already registered with that email");
  }
  else{
    let newUserID = generateRandomString();
    hashPass = bcrypt.hashSync(req.body.password, 10);
    users[newUserID] = {
      id: newUserID,
      email: req.body["email"],
      password: hashPass
    }
    console.log (users);
     req.session.user_id = newUserID;
    urlDatabase[newUserID] = {

    }
    res.redirect("/urls");
  }
});
//login handler:
app.post("/login",(req,res)=>{

  for (i in users){
    if ( (users[i].email === req.body["email"]) && (bcrypt.compareSync(req.body.password, users[i].password) )) {
      req.session.user_id = users[i].id;
      res.redirect("/urls");
    }
  }
  res.send("Invalid login info.")
});

app.get("/login",(req,res)=>{
  let templateVars = { user : users[req.session.user_id] , urls : urlDatabase, id : req.session.user_id };
  res.render("login", templateVars);
});

//new url page
app.get("/urls/new", (req, res) => {
  if(users[req.session.user_id]){
    let templateVars = { user : users[req.session.user_id] , urls : urlDatabase, id : req.session.user_id };
    res.render("urls_new", templateVars);
  } else{
    res.send("Only registered members can shorten new URL's")
  }
});

//user registration endpoint
app.get("/register", (req,res) => {
  let templateVars = { user : users[req.session.user_id] , urls : urlDatabase, id : req.session.user_id };
  res.render("register", templateVars);
});


app.get("/urls", (req, res) => {
  let templateVars = { user : users[req.session.user_id] , urls : urlDatabase, id : req.session.user_id }
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req,res) =>{
  let tiny = req.params.shortURL;
  console.log("debug")
  for (i in urlDatabase) {
    console.log(i)
    if (urlDatabase[i][tiny]){
      res.redirect(urlDatabase[i][tiny]);
    }
  }
  res.send("That short URL doesn't exist.");
});

app.get("/urls/:id/edit", (req,res) => {
  let templateVars = { user : users[req.session.user_id] , urls : urlDatabase, id : req.session.user_id, shortURL: req.params.id };
  res.render("urls_show", templateVars)
});



// app.get("/urls/:id", (req,res) => {
//   let templateVars = { shortURL: req.params.id, urls : urlDatabase };
//   res.render("urls_show", templateVars);
// });

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});