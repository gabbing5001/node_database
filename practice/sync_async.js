var fs = require("fs");

//Sync-동기방식
var data = fs.readFileSync("data.txt", { encoding: "utf8" });
console.log(data);

//Async-비동기방식
fs.readFile("data.txt", { encoding: "utf8" }, function(err, data) {
  console.log(data);
});
