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
  console.log(randomStr);

}

generateRandomString()