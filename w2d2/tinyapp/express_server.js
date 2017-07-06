var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const cookieParser = require('cookie-parser')

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")
app.use(cookieParser())

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
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
  urlDatabase[newShort.toString()] = req.body["longURL"].toString();
  console.log(req.body, newShort);
  res.redirect("http://localhost:8080/urls");
});
//delete an entry
app.post("/urls/:id/delete", (req, res) =>{
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


app.post("/urls/:id/edit", (req,res) => {
  urlDatabase[req.params.id] = req.body["longURL"];
  res.redirect("/urls");
});


app.post("/logout",(req,res) =>{
  res.clearCookie("user_id");
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
    users[newUserID] = {
      id: newUserID,
      email: req.body["email"],
      password: req.body["password"]
    }
    console.log (users);
    res.cookie('user_id', newUserID);
    res.redirect("/urls");
  }
});
//login handler:
app.post("/login",(req,res)=>{
  for (i in users){
    if (users[i].email === req.body["email"] && users[i].password === req.body["password"]){
      res.cookie('user_id', users[i].id);
      res.redirect("/urls");
    }
    else res.send("invalid user information!")
  }
});

app.get("/login",(req,res)=>{
  let templateVars = { user : users[req.cookies.user_id] , urls : urlDatabase, id : req.cookies.user_id };
  res.render("login", templateVars);
});

//new url page
app.get("/urls/new", (req, res) => {
  if(users[req.cookies.user_id]){
    let templateVars = { user : users[req.cookies.user_id] , urls : urlDatabase, id : req.cookies.user_id };
    res.render("urls_new", templateVars);
  } else{
    res.send("Only registered members can shorten new URL's")
  }
});

//user registration endpoint
app.get("/register", (req,res) => {
  let templateVars = { user : users[req.cookies.user_id] , urls : urlDatabase, id : req.cookies.user_id };
  res.render("register", templateVars);
});


app.get("/urls", (req, res) => {
  let templateVars = { user : users[req.cookies.user_id] , urls : urlDatabase, id : req.cookies.user_id }
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req,res) =>{
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:id/edit", (req,res) => {
  let templateVars = { user : users[req.cookies.user_id] , urls : urlDatabase, id : req.cookies.user_id, shortURL: req.params.id };
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