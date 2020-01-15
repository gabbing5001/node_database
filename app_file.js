var express = require("express");
var app = express(); //어플리케이션 객체 만들기
var bodyParser = require("body-parser");
var fs = require("fs");
app.use(bodyParser.urlencoded({ extended: false }));

app.locals.pretty = true; //html이 줄바꿈이 안되서 템플릿 줄바꿈 하기 위한 설정
app.set("views", "./views_file"); //익스프레스에 설정 뷰파일 위치
app.set("view engine", "jade");

app.listen(3000, function() {
  //3천번 포트 연결시 콜백 실행
  console.log("Connected, 3000 port!");
});

//라우팅 작업
app.get("/topic/new", function(req, res) {
  fs.readdir("data", function(err, files) {
    //폴더를 읽어서 배열로 전달
    if (err) {
      //에러처리
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
    res.render("new", { topics: files });
  });
});
app.post("/topic", function(req, res) {
  var title = req.body.title;
  var description = req.body.description;
  fs.writeFile("data/" + title, description, function(err) {
    //파일을 생성한다 해당 내용으로
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
    //콜백이 실행된 후에 리스폰스가 가능하기 때문에 콜백함수 안에 있어야 함
    res.redirect("/topic/" + title);
  });
});
app.get("/topic", function(req, res) {
  fs.readdir("data", function(err, files) {
    //폴더를 읽어서 배열로 전달
    if (err) {
      //에러처리
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
    res.render("view", { topics: files }); //topics라는 변수로 배열 생성
  });
});
app.get("/topic/:id", function(req, res) {
  var id = req.params.id;
  fs.readdir("data", function(err, files) {
    //파일 목록을 가져오기 위함
    //폴더를 읽어서 배열로 전달
    if (err) {
      //에러처리
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
    fs.readFile("data/" + id, "utf-8", function(err, data) {
      if (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
      }
      res.render("view", {
        //id는 파라미터에서, description은 파일을 읽어서 data를 통해
        topics: files,
        title: id,
        description: data
      });
    });
  });
});
