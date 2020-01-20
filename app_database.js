var express = require("express"); //express 모듈
var app = express(); //어플리케이션 객체 만들기
var bodyParser = require("body-parser"); //body에 있는 값에 접근하기 위한 모듈
var fs = require("fs");
const { Pool, Client } = require("pg"); //postgres를 사용하기 위한 모듈
var format = require("pg-format");
var paginate = require("express-paginate"); //paging 처리 해보자
var pagination = require("pagination");
var util = require("util");

//postgres db와 연결
//node_test디비에 접근 한다는 소리
const client = new Client({
  host: "localhost",
  user: "postgres",
  database: "node_test",
  password: "admin",
  port: 5432
});
client.connect();
app.use(paginate.middleware(10, 50));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public")); //bootstrap 사용하려면 추가해야해 정적파일 경로

app.locals.pretty = true; //html이 줄바꿈이 안되서 템플릿 줄바꿈 하기 위한 설정
app.set("views", "./views_db"); //익스프레스에 설정 뷰파일 위치
app.set("view engine", "jade"); //jade를 사용할 수 있도록 설정

app.listen(3000, function() {
  //3천번 포트 연결시 콜백 실행
  console.log("Connected, 3000 port!");
});

//라우팅 작업
app.get("/", function(req, res) {
  //기본 localhost:3000 접속시 /topic으로 보내도록 - 기본 화면이 list가 되도록
  res.redirect("/topic");
});

app.get("/topic/create", function(req, res) {
  //create 창을 띄운다.
  var sql = "SELECT id, title FROM topic ORDER BY id";
  client.query(sql, function(err, res2) {
    //create 창의 전체 리스트를 가져와서 띄운다.
    res.render("create", { topics: res2.rows });
  });
});
app.post("/topic/create", function(req, res) {
  //작성한 정보를 db 에 반영
  var title = req.body.title;
  var description = req.body.description;
  var author = req.body.author;
  var sql =
    "INSERT INTO topic (title, description, author) VALUES($1, $2, $3) ";
  var sql2 = "select max(id) from topic";
  client.query(sql, [title, description, author], function(err, res2) {
    if (err) {
      console.log(err);
    } else {
      client.query(sql2, function(err, res3) {
        var id;
        for (var i = 0; i < res3.rows.length; i++) {
          //id 값은 자동 증가 redirect 하기 위해 id 값 알아내기
          id = res3.rows[i].max;
        }
        res.redirect("/topic/" + id); //새로 생성된 detail창으로 리다이렉트
      });
    }
  });
});
app.get("/topic/update/:id", function(req, res) {
  //정보를 가져와서 update form을 띄운다.
  //update 수정
  var id = req.params.id;
  var sql1 = "SELECT id, title FROM topic ORDER BY id";
  var sql2 = "SELECT * FROM topic where id=$1";
  client.query(sql2, [id], function(err, res2) {
    //res2 detail 정보
    if (err) {
      console.log(err);
    } else {
      client.query(sql1, function(err, res3) {
        if (err) {
          console.log(err);
          res.status(500).send("Internal Server Error");
        } else {
          var list = [];
          var result = res3.rows; //res3 리스트정보
          for (var i = 0; i < result.length; i++) {
            //전체 타이틀, id 리스트에 넣기
            list.push(res3.rows[i]);
          }
          res.render("edit", { details: res2.rows, topics: list });
        }
      });
    }
  });
});
app.post("/topic/update/:id", function(req, res) {
  //수정한 정보를 db에 반영
  var sql = "UPDATE topic SET title=$1, description=$2 ,author=$3 WHERE id=$4";
  var title = req.body.title;
  var description = req.body.description;
  var author = req.body.author;
  var id = req.params.id;
  var params = [title, description, author, id];
  client.query(sql, params, function(err, res2) {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    } else {
      //console.log(params);
      res.redirect("/topic/" + id); //반영후 detail을 창으로 redirect해서 확인하도록
    }
  });
});
app.get("/topic/delete/:id", function(req, res) {
  //삭제 창 띄우기
  var sql = "SELECT id, title FROM topic ORDER BY id";
  var id = req.params.id;
  client.query(sql, function(err, res2) {
    var sql2 = "SELECT * FROM topic where id=$1";
    client.query(sql2, [id], function(err, res3) {
      //삭제하기 컨펌창을 띄워준다. 값이 없는 경우 에러 출력
      if (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
      } else {
        if (res3.rows.length == 0) {
          //값이 없는경우 에러 띄우도록
          console.log("There is no record");
          res.status(500).send("Internal Server Error");
        } else {
          res.render("delete", { topics: res2.rows, details: res3.rows });
        }
      }
    });
  });
});
app.post("/topic/delete/:id", function(req, res) {
  //삭제사항 db에 반영
  var sql = "DELETE FROM topic WHERE id=$1";
  var id = req.params.id;
  client.query(sql, [id], function(err, res2) {
    res.redirect("/topic"); //전체 리스트 화면으로 redirect
  });
});

app.get("/topic", function(req, res) {
  var nowPage = req.query.nowPage; //쿼리로 날아온 현재 페이지 저장
  //전체 리스트를 띄우는 기본 리스트 화면
  var sqlCnt = "select count(*) from topic";
  var sql = "SELECT id, title FROM topic ORDER BY id limit 5 offset $1"; //offset 사용시 +1 열부터 limit 갯수만큼 가져옴
  client.query(sqlCnt, function(err, res3) {
    if (nowPage == null) nowPage = 1;
    nowPage = Number(nowPage); //계산을 위해서 형변환
    const page = nowPage * 5 - 5; //시작열
    client.query(sql, [page], function(err, res2) {
      if (err) {
        console.log(err);
      } else {
        if (nowPage == null || nowPage == "" || nowPage <= 1) nowPage = 1;
        var totalCnt = res3.rows;
        var total = Math.floor(totalCnt[0].count / 5); //5개씩 출력하기 위한 pagination 설정
        if (totalCnt[0].count % 5 > 0) {
          total++;
        }
        res.render("view", {
          topics: res2.rows,
          totalCnt: total,
          nowPage: nowPage
        });
      }
    });
  });
});
app.get("/topic/:id", function(req, res) {
  //detail 화면
  //전체 리스트 정보도 같이 출력된다.
  var id = req.params.id;
  var sql1 = "SELECT id, title FROM topic ORDER BY id";
  var sql2 = "SELECT * FROM topic where id=$1";
  client.query(sql2, [id], function(err, res2) {
    //디테일 정보 출력
    if (err) {
      console.log(err);
    } else {
      client.query(sql1, function(err, res3) {
        if (err) {
          console.log(err);
          res.status(500).send("Internal Server Error");
        } else {
          var list = [];
          var result = res3.rows;
          for (var i = 0; i < result.length; i++) {
            //리스트에 전체 배열 넣기
            list.push(res3.rows[i]);
          }
          res.render("detail", { details: res2.rows, topics: list });
        }
      });
    }
  });
});
