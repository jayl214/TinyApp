var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

app.post("/login",(req,res){


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


//new url page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls : urlDatabase }
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req,res) =>{
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:id/edit", (req,res) => {
  let templateVars = { shortURL: req.params.id, urls : urlDatabase };
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