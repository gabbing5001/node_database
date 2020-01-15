var express = require("express"); //express 모듈 제어 가능
var fs = require("fs");
var bodyParser = require("body-parser"); //post에서 body의 name을 읽기 위한 플러그인 = 미들웨어
var app = express();
app.locals.pretty = true;
app.set("view engine", "jade"); //jade파일 렌더링
app.set("views", "./views"); //템플릿틀 위치

app.use(bodyParser.urlencoded({ extended: false })); //플러그인 설정
app.use(express.static("public")); //정적파일 가져오려고 지정하는 것
//get을 라우터라고 부른다. 이 작업이 라우팅
//get이 컨트롤러 같은 녀석인 것

app.get("/template", function(req, res) {
  //jade 템플릿을 쓴 예제
  //response응답으로 tmp를 렌더링 하면 express 내부적으로
  //2번째 인자 데이터를 바인딩 해줄수 있다.
  res.render("tmp", { time: Date(), _title: "Jade" }); //소스 코드 읽어서 새로운 페이지 만들기
});
app.get("/", function(req, res) {
  var output = `
  <a href='/topic/0'>topic</a></br>
  Hello home page
  `;
  //사용자가 홈으로 접속시 콜백함수 실행해라
  res.send(output); //해당 내용 전달
});
app.get("/dynamic", function(req, res) {
  //html 파일 읽는거
  res.send(fs.readFileSync("public/static.html", { encoding: "utf-8" }));
});
app.get("/route", function(req, res) {
  //이미지 띄우는거
  //이주소로 가면 이미지 볼 수 있다.
  res.send('Hello Router, <img src="/tuna.jpg">');
});
app.get("/login", function(req, res) {
  //http://localhost:3000/login 사용자가 해당 주소로 들어올 경우
  res.send("<h1>Login please</h1>"); //해당내용 전달
});
app.get("/topic/:id", function(req, res) {
  var topics = ["Javascript is...", "Nodejs is...", "Express is..."];
  //path방식을 사용하기 때문에 params를 사용
  //?있는 주소는 query 스타일
  //동적으로 html 생성
  var output = `
    <a href='/topic/0'>JavaScript</a></br>
    <a href='/topic/1'>Nodejs</a></br>
    <a href='/topic/2'>Express</a></br>
    <a href='/form'>Form</a></br>
    </br>
    ${topics[req.params.id]} 
  `;
  //쿼리에 id있으면 해당 토픽 반환
  res.send(output);
});
app.listen(3000, function() {
  console.log("Connected 3000 port!");
});
app.get("/topic/:id/:mode", function(req, res) {
  res.send(req.params.id + "," + req.params.mode);
});
app.get("/form", function(req, res) {
  res.render("form");
});
app.get("/form_receiver", function(req, res) {
  var title = req.query.title;
  var description = req.query.description;
  res.send(title + "," + description);
});
app.post("/form_receiver", function(req, res) {
  var title = req.body.title;
  var description = req.body.description;
  res.send(title + "," + description);
  //res.send("Hello, POST");
});
