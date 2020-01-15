const { Pool, Client } = require("pg");

// const pool = new Pool({
//   host: "localhost",
//   user: "postgres",
//   database: "node_test",
//   password: "admin",
//   port: 5432
// });

// pool.query("SELECT NOW()", (err, res) => {
//   console.log(err, res);
//   pool.end();
// });

//postgres db와 연결
const client = new Client({
  host: "localhost",
  user: "postgres",
  database: "node_test",
  password: "admin",
  port: 5432
});
client.connect();

//select 문
/*
var sql = "SELECT * FROM topic";
client.query(sql, function(err, res) {
  if (err) {
    console.log(err);
  } else {
    for (var i = 0; i < res.rows.length; i++) {
      //배열로 하나 씩 가져올 수 있다.
      //console.log("rows", res.rows[i].description);
      console.log("rows", res.rows[i]);
    }
    console.log("fields", res.fields);
  }
  client.end();
});
*/
/*
//insert 문 
// $표시를 이용해 동적으로 데이터 삽입 또는 물결 아래 ` 를 통해 직접 입력 
var sql = "INSERT INTO topic (title, description, author) VALUES($1, $2, $3) ";

client.query(sql, ["checkk", "new kkkkkkkkkk", "test1"], function(err, res) {
  if (err) {
    console.log(err);
  } else {
    console.log(res.rows.columnID);
  }
  client.end();
});
*/

//update 문
//insert 문과 같게 하면 된다.
//$뒤에 숫자가 배열 순서
/*
var sql = "UPDATE topic SET title=$1, author=$3 WHERE id=$2";
var params = ["NPM", 1, "lee"];

client.query(sql, params, function(err, res) {
  if (err) {
    console.log(err);
  } else {
    console.log(res.rows);
  }
  client.end();
});
*/

//delete문
var sql = "DELETE FROM topic WHERE id=$1";
var params = [4];

client.query(sql, params, function(err, res) {
  if (err) {
    console.log(err);
  } else {
    console.log(res.rows);
  }
  client.end();
});
