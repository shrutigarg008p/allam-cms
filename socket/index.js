const db = require("./db/index.js");
const transport = require("./config/smtp.js");
const common = require("./config/common.js");

const RtcTokenBuilder = require('./src/RtcTokenBuilder').RtcTokenBuilder;
const RtcRole = require('./src/RtcTokenBuilder').Role;
const role = RtcRole.PUBLISHER;

//agora config
// const appID = '407deb8eaa634e0482b0f5481eefd1e9';
// const appCertificate = '93a1d8b056cf45e59bb41f0765fdfe5e';

//live
const appID= '752f9b3623934fa69918bf804aae6623';
const appCertificate = 'e1423ebcda5140c39036a28cc75c2c8a';

const expirationTimeInSeconds = 3000;
// const currentTimestamp = Math.floor(Date.now() / 1000);
// const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;


// Setup basic express server
var express = require('express');
var app = express();
var fs = require('fs');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 9002;
const hostname = '0.0.0.0';
var loopLimit  = 0;

//--------------------------->
const bodyParser = require("body-parser");

/** bodyParser.urlencoded(options)
 * Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body
 */
app.use(bodyParser.urlencoded({
    extended: true
}));

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json());
//--------------------------->
// server.listen(port, function () {
//   console.log('Server listening at port %d', port);
//   //fs.writeFile(__dirname + '/start.log', 'started'); 
// });

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

// Routing
app.use(express.static(__dirname));

// Entire gameCollection Object holds all games and info

var gameCollection =  new function() {

  this.totalGameCount = 0,
  this.gameList = []

};

function buildGame(socket) {


 var gameObject = {};
 gameObject.id =Math.floor(1000 + Math.random() * 9000); 
 //(Math.random()+1).toString(36).slice(2, 18);
 gameObject.playerOne = socket.username;
 gameObject.playerTwo = null;
 gameCollection.totalGameCount ++;
 gameCollection.gameList.push({gameObject});

 console.log("Game Created by "+ socket.username + " w/ " + gameObject.id);
 io.emit('gameCreated', {
  username: socket.username,
  gameId: gameObject.id
});


}

function killGame(socket) {

  var notInGame = true;
  for(var i = 0; i < gameCollection.totalGameCount; i++){

    var gameId = gameCollection.gameList[i]['gameObject']['id']
    var plyr1Tmp = gameCollection.gameList[i]['gameObject']['playerOne'];
    var plyr2Tmp = gameCollection.gameList[i]['gameObject']['playerTwo'];
    
    if (plyr1Tmp == socket.username){
      --gameCollection.totalGameCount; 
      console.log("Destroy Game "+ gameId + "!");
      gameCollection.gameList.splice(i, 1);
      console.log(gameCollection.gameList);
      socket.emit('leftGame', { gameId: gameId });
      io.emit('gameDestroyed', {gameId: gameId, gameOwner: socket.username });
      notInGame = false;
    } 
    else if (plyr2Tmp == socket.username) {
      gameCollection.gameList[i]['gameObject']['playerTwo'] = null;
      console.log(socket.username + " has left " + gameId);
      socket.emit('leftGame', { gameId: gameId });
      console.log(gameCollection.gameList[i]['gameObject']);
      notInGame = false;

    } 

  }

  if (notInGame == true){
    socket.emit('notInGame');
  }


}

function gameSeeker (socket) {
  ++loopLimit;
  if (( gameCollection.totalGameCount == 0) || (loopLimit >= 20)) {

    buildGame(socket);
    loopLimit = 0;

  } else {
    var rndPick = Math.floor(Math.random() * gameCollection.totalGameCount);
    if (gameCollection.gameList[rndPick]['gameObject']['playerTwo'] == null)
    {
      gameCollection.gameList[rndPick]['gameObject']['playerTwo'] = socket.username;
      socket.emit('joinSuccess', {
        gameId: gameCollection.gameList[rndPick]['gameObject']['id'] });

      console.log( socket.username + " has been added to: " + gameCollection.gameList[rndPick]['gameObject']['id']);

    } else {

      gameSeeker(socket);
    }
  }
}


// Chatroom

var numUsers = 0;

// io.on('connection', function (socket) {
//   var addedUser = false;

//   // when the client emits 'new message', this listens and executes
//   socket.on('new message', function (data) {
//     // we tell the client to execute 'new message'
//     socket.broadcast.emit('new message', {
//       username: socket.username,
//       message: data
//     });
//   });

//   // when the client emits 'add user', this listens and executes
//   socket.on('add user', function (username) {
//     if (addedUser) return;

//     // we store the username in the socket session for this client
//     socket.username = username;
//     ++numUsers;
//     addedUser = true;
//     socket.emit('login', {
//       numUsers: numUsers
//     });
//     // echo globally (all clients) that a person has connected
//     socket.broadcast.emit('user joined', {
//       username: socket.username,
//       numUsers: numUsers
//     });
//   });

//   // when the client emits 'typing', we broadcast it to others
//   socket.on('typing', function () {
//     socket.broadcast.emit('typing', {
//       username: socket.username
//     });
//   });

//   // when the client emits 'stop typing', we broadcast it to others
//   socket.on('stop typing', function () {
//     socket.broadcast.emit('stop typing', {
//       username: socket.username
//     });
//   });

//   // when the user disconnects.. perform this
//   socket.on('disconnect', function () {
//     if (addedUser) {
//       --numUsers;
//       killGame(socket);

//       // echo globally that this client has left
//       socket.broadcast.emit('user left', {
//         username: socket.username,
//         numUsers: numUsers
//       });
//     }
//   });


//   socket.on('joinGame', function (){
//     console.log(socket.username + " wants to join a game");

//     var alreadyInGame = false;

//     for(var i = 0; i < gameCollection.totalGameCount; i++){
//       var plyr1Tmp = gameCollection.gameList[i]['gameObject']['playerOne'];
//       var plyr2Tmp = gameCollection.gameList[i]['gameObject']['playerTwo'];
//       if (plyr1Tmp == socket.username || plyr2Tmp == socket.username){
//         alreadyInGame = true;
//         console.log(socket.username + " already has a Game!");

//         socket.emit('alreadyJoined', {
//           gameId: gameCollection.gameList[i]['gameObject']['id']
//         });

//       }

//     }
//     if (alreadyInGame == false){


//       gameSeeker(socket);
      
//     }

//   });


//   socket.on('leaveGame', function() {


//     if (gameCollection.totalGameCount == 0){
//      socket.emit('notInGame');
     
//    }

//    else {
//     killGame(socket);
//   }

// });

// });

var user_ids = {};

io.on('connection', function (socket) {
  
    // when the client emits 'add user', this listens and executes
    socket.on('addPlayer', async  function (data) 
    {
      // we store the username in the socket session for this client
      console.log('--before print---');
      console.log(data);
      console.log('--after print---');
      // if(data['user_id']=='undefined'){
      //   data = JSON.parse(data);
      // }
      //console.log(data['user_id']);
      var category_id = data['category_id'];
      var user_id     = data['user_id'];
      var header_id   = data['header_id'];
      var req_type    = data['req_type'];
      var access_token= data['access_token'];
      var opponent_type= data['opponent_type']; //human or rebot
      var rand_game_id=  Math.floor(1000 + Math.random() * 9000);
      //(Math.random()+1).toString(36).slice(2, 18);
      
      //####check is valid access_token#####
      const chekToken = await db.query("SELECT * FROM users WHERE access_token=$1", [access_token]);
      if(chekToken.rows.length == 0)
      {
          socket.emit('playerResponse', { "status": 201, "data":{},"message": "مدخل عملة الرمزية  غير سارية العمل" });
      }

      const results = await db.query("SELECT * FROM gc_game WHERE header_id=$1 and category_id=$2 and req_type=$3 and status=$4", [header_id,category_id,req_type,'0']);
      //    .then(r => console.log(r))
      // .catch(e => console.log(e));
      const gameObj=results.rows[0];
      if(results.rows.length > 0)
      {
        var gam_id        = gameObj.id;
        var rand_gam_id   = gameObj.game_id;
        var joined_user_id= gameObj.user_id;


        if(user_id==gameObj.user_id)
        {
          if(opponent_type=='robot')
          {
            var robot_user_id=1;
            //////////get random boat////
            const boatQuery = await db.query("SELECT * FROM users WHERE role_id=$1 order by random() LIMIT 1", ['8']); 
             if(boatQuery.rows.length > 0){
              robot_user_id=boatQuery.rows[0].id;
             }
             ////////////////////////////
            const update = await db.query("UPDATE gc_game SET opponent_type=$1,first_opponent_id=$2,status=$3, modified_by=$4 WHERE id=$5",
            [opponent_type, robot_user_id,'1',user_id,gam_id]
            );

            ///
            const user1ResultQ = await db.query("SELECT * FROM users WHERE id=$1", [joined_user_id]);
            const user2ResultQ = await db.query("SELECT * FROM users WHERE id=$1", [robot_user_id]);
            const user1Result =user1ResultQ.rows[0];
            const user2Result =user2ResultQ.rows[0];
            //create runtime game
            // header_id=1; //dummy
            // category_id=1;//dummy
            const question = await db.query("SELECT * FROM gc_question WHERE status=$1 AND header_id=$2 AND category_id=$3 order by random() LIMIT 10", ['1',header_id,category_id]);
            var questionArr=question.rows;

            const gameQuery = await db.query("SELECT * FROM gc_game WHERE id=$1", [gam_id]);
            const gameObjNew   = gameQuery.rows[0];

            for(let i=0;i<questionArr.length;i++)
            {
              let questionObj = questionArr[i];
              const insert = await db.query("INSERT INTO gc_game_result (gc_game_id,question_id,correct_answer,first_user_id,second_user_id,third_user_id,fourth_user_id,fifth_user_id,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
              [gam_id, questionObj.id, questionObj.answer, gameObjNew.user_id,gameObjNew.first_opponent_id,gameObjNew.second_opponent_id,gameObjNew.third_opponent_id,gameObjNew.fourth_opponent_id,user_id]
               );
            }

            //store the user_id in the socket session for this client
            // socket.user_id = robot_user_id;
            // socket.room = rand_gam_id;
            // user_ids[user_id] = robot_user_id;
            // socket.join(rand_gam_id);
            ///end initialization
            var _room_id = "alaam"+rand_gam_id;
            var currentTimestamp = Math.floor(Date.now() / 1000);
            var privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

	          const tokenA = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, _room_id, 0, role, privilegeExpiredTs);
            //quiz created
            socket.emit('playerResponse', { "status": 200, "data":{'game_id':gam_id,'rand_game_id':rand_gam_id,"game_type":opponent_type, "channelName": _room_id, "token": tokenA, "users":[{"user_id":user1Result.id,"username":user1Result.first_name,"avatar":user1Result.user_avatar,"level":user1Result.user_level,"level_title":user1Result.level_title,"points":"0"},{"user_id":user2Result.id,"username":user2Result.first_name,"avatar":user2Result.user_avatar,"level":user2Result.user_level,"level_title":user2Result.level_title,"points":"0"}]},"message": "Robot joined" });
            //io.in(rand_gam_id).to(rand_gam_id).emit('playerResponse', { "status": 200, "data":{'game_id':gam_id,'rand_game_id':rand_gam_id,"game_type":opponent_type,"users":[{"user_id":user1Result.id,"username":user1Result.first_name,"avatar":user1Result.user_avatar,"level":"1","points":"0"},{"user_id":user2Result.id,"username":user2Result.first_name,"avatar":user2Result.user_avatar,"level":"1","points":"0"}]},"message": "Robot joined" });
          }
          else
          {
            //skip....
             //socket.emit('playerResponse', { "status": 200, "data":{},"message": "Waiting for opponent" });
          }
        }
        else
        {
          const update = await db.query("UPDATE gc_game SET opponent_type=$1,first_opponent_id=$2,status=$3, modified_by=$4 WHERE id=$5",
          [ opponent_type, user_id,'1',user_id,gam_id]
          );

            const user1ResultQ = await db.query("SELECT * FROM users WHERE id=$1", [joined_user_id]);
            const user2ResultQ = await db.query("SELECT * FROM users WHERE id=$1", [user_id]);
            const user1Result =user1ResultQ.rows[0];
            const user2Result =user2ResultQ.rows[0];

             //create runtime game
            // header_id=1; //dummy
            // category_id=1;//dummy
            const question = await db.query("SELECT * FROM gc_question WHERE status=$1 AND header_id=$2 AND category_id=$3 order by random() LIMIT 10", ['1',header_id,category_id]);
            var questionArr=question.rows;

            const gameQuery = await db.query("SELECT * FROM gc_game WHERE id=$1", [gam_id]);
            const gameObjNew   = gameQuery.rows[0];

            for(let i=0;i<questionArr.length;i++)
            {
              let questionObj = questionArr[i];
              const insert = await db.query("INSERT INTO gc_game_result (gc_game_id,question_id,correct_answer,first_user_id,second_user_id,third_user_id,fourth_user_id,fifth_user_id,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
              [gam_id, questionObj.id, questionObj.answer, gameObjNew.user_id,gameObjNew.first_opponent_id,gameObjNew.second_opponent_id,gameObjNew.third_opponent_id,gameObjNew.fourth_opponent_id,user_id]
               );
            }

            //store the user_id in the socket session for this client
            socket.user_id    = user_id;
            socket.room       = rand_gam_id;
            user_ids[user_id] = user_id;
            socket.join(rand_gam_id);
            ///end initialization
            //quiz created
            var _room_id = "alaam"+rand_gam_id; 
            var currentTimestamp = Math.floor(Date.now() / 1000);
            var privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
	          const tokenA = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, _room_id, 0, role, privilegeExpiredTs);

            socket.emit('playerResponse', { "status": 200, "data":{'game_id':gam_id,'rand_game_id':rand_gam_id,"game_type":opponent_type, "channelName": _room_id, "token": tokenA,"users":[{"user_id":user1Result.id,"username":user1Result.first_name,"avatar":user1Result.user_avatar,"level":user1Result.user_level,"level_title":user1Result.level_title,"points":"0"},{"user_id":user2Result.id,"username":user2Result.first_name,"avatar":user2Result.user_avatar,"level":user2Result.user_level,"level_title":user2Result.level_title,"points":"0"}]},"message": "User joined" });
            socket.broadcast.to(rand_gam_id).emit('playerResponse', { "status": 200, "data":{'game_id':gam_id,'rand_game_id':rand_gam_id,"game_type":opponent_type, "channelName": _room_id, "token": tokenA,"users":[{"user_id":user1Result.id,"username":user1Result.first_name,"avatar":user1Result.user_avatar,"level":user1Result.user_level,"level_title":user1Result.level_title,"points":"0"},{"user_id":user2Result.id,"username":user2Result.first_name,"avatar":user2Result.user_avatar,"level":user2Result.user_level,"level_title":user2Result.level_title,"points":"0"}]},"message": "User joined" });
        }     
      }
      else
      {

           const insert = await db.query("INSERT INTO gc_game (header_id, category_id, req_type, user_id,status, created_by,game_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
           [header_id, category_id, req_type, user_id,'0',user_id,rand_game_id]
           );

            //store the user_id in the socket session for this client
            if(socket.room){
              delete user_ids[socket.user_id];
              socket.leave(socket.room);
            }
            
            /////////
            socket.user_id = user_id;
            socket.room = rand_game_id;
            user_ids[user_id] = user_id;
            socket.join(rand_game_id);
            ///end initialization

            //socket.emit('playerResponse', { "status": 200, "data":{},"message": "Waiting for opponent" });
      }
    });

     // save answer & userResponseAnswer
    socket.on('userSaveAnswer', async  function (data) 
    {      
      var game_id     = data['game_id'];
      var user_id     = data['user_id'];
      var question_id = data['question_id'];
      var user_answer = data['user_answer'];
      var access_token= data['access_token'];
      var taken_time  = data['taken_time']; 
      var correct_answer = data['correct_answer'];
      var question_count = data['question_count'];

      
      console.log('--before print---');
      console.log(data);
      console.log('--after print--');
      //####check is valid access_token#####
      const chekToken = await db.query("SELECT * FROM users WHERE access_token=$1", [access_token]);
      if(chekToken.rows.length == 0)
      {
          socket.emit('userResponseAnswer', { "status": 201, "data":{},"message": "مدخل عملة الرمزية  غير سارية العمل" });
          return;
      }

      const gameQuery = await db.query("SELECT * FROM gc_game WHERE id=$1", [game_id]);
      const questionQuery = await db.query("SELECT * FROM gc_game_result WHERE gc_game_id=$1 AND question_id=$2", [game_id,question_id]);
     
      if(questionQuery.rows.length > 0)
      {
        const gameObj     = gameQuery.rows[0];
        const questionObj = questionQuery.rows[0];
        const result_id   = questionObj.id;
        const str_game_id = gameObj.game_id;
        
        var user_answer_col='';
        var user_time_taken_col='';
        if(user_id==questionObj.first_user_id)
        {
          user_answer_col='first_user_answer';
          user_time_taken_col='first_user_taken_time';
        } 
        else if(user_id==questionObj.second_user_id)
        {
          user_answer_col='second_user_answer';
          user_time_taken_col='second_user_taken_time';
        }  
        else if(user_id==questionObj.third_user_id)
        {
          user_answer_col='third_user_answer';
          user_time_taken_col='third_user_taken_time';
        }  
        else if(user_id==questionObj.fourth_user_id)
        {
          user_answer_col='fourth_user_answer';
          user_time_taken_col='fourth_user_taken_time';
        }  
        else if(user_id==questionObj.fifth_user_id)
        {
          user_answer_col='fifth_user_answer';
          user_time_taken_col='fifth_user_taken_time';
        }   

        const updateResult = await db.query("UPDATE gc_game_result SET "+user_answer_col+"=$1,"+user_time_taken_col+"=$2 WHERE id=$3",
          [ user_answer, taken_time,result_id]
          );

        //update60to40% for robot player//
        if(gameObj.opponent_type=='robot'){
          const robotQuery    = await db.query("SELECT * FROM gc_game_result WHERE gc_game_id=$1 AND second_user_id=$2 AND second_user_answer=correct_answer", [game_id,questionObj.second_user_id]);
          let robotObj        = robotQuery.rows;
          var robot_taken_time='10';
          //second_user_answer,correct_answer

          ///for calculation
          const _resultQuery    = await db.query("SELECT * FROM gc_game_result WHERE gc_game_id=$1", [game_id]);
          let _resultObj        = _resultQuery.rows;
          var qRobotCount       = _resultObj.length;

          var robotCorrectAnswer='wa';
          var snumber = Number(qRobotCount)/Number(2);
          snumber=Number(snumber)+Number(1);
          console.log('cntt--'+snumber);
          if(robotObj.length<snumber){
            robotCorrectAnswer=correct_answer;
          }

          const robotuUpdateCorrect = await db.query("UPDATE gc_game_result SET second_user_answer=$1,second_user_taken_time=$2 WHERE id=$3",
            [ robotCorrectAnswer,robot_taken_time,result_id]);

        }
        ///////end robot part////////////

        const resultQuery    = await db.query("SELECT * FROM gc_game_result WHERE gc_game_id=$1", [game_id]);
        let resultObj        = resultQuery.rows;
        var gameQuestionCount= resultObj.length;
        var resultFinal      = [];
        let first_user_id    = 0;
        let second_user_id   = 0;
        let third_user_id    = 0;
        let fourth_user_id   = 0;
        let fifth_user_id    = 0;
        let first_user_score = 0;
        let second_user_score= 0;
        let third_user_score = 0;
        let fourth_user_score= 0;
        let fifth_user_score = 0;

        let first_u_attempt = 0;
        let second_u_attempt= 0;
        let third_u_attempt = 0;
        let fourth_u_attempt= 0;
        let fifth_u_attempt = 0;
        let default_score   =5;

        for(let j=0;j<resultObj.length;j++)
        {
          let resultArr   = resultObj[j];
          first_user_id   = resultArr.first_user_id;
          second_user_id  = resultArr.second_user_id;
          third_user_id   = resultArr.third_user_id;
          fourth_user_id  = resultArr.fourth_user_id;
          fifth_user_id   = resultArr.fifth_user_id;
          var _correct_answer = resultArr.correct_answer
          var _fu_answer = resultArr.first_user_answer
          var _su_answer = resultArr.second_user_answer
          var _trdu_answer = resultArr.third_user_answer
          var _frtu_answer = resultArr.fourth_user_answer
          var _fftu_answer = resultArr.fifth_user_answer

          if((_fu_answer?_fu_answer:'').toLowerCase()==_correct_answer.toLowerCase())
          {
            first_user_score=Number(first_user_score)+Number(default_score);
          }
          if((_su_answer?_su_answer:'').toLowerCase()==_correct_answer.toLowerCase())
          {
            second_user_score=Number(second_user_score)+Number(default_score);
          }
          if((_trdu_answer?_trdu_answer:'').toLowerCase()==_correct_answer.toLowerCase())
          {
            third_user_score=Number(third_user_score)+Number(default_score);
          }
          if((_frtu_answer?_frtu_answer:'').toLowerCase()==_correct_answer.toLowerCase())
          {
            fourth_user_score=Number(fourth_user_score)+Number(default_score);
          }
          if((_fftu_answer?_fftu_answer:'').toLowerCase()==_correct_answer.toLowerCase())
          {
            fifth_user_score=Number(fifth_user_score)+Number(default_score);
          }

          //check attempt
          if(resultArr.first_user_answer!='' && resultArr.first_user_answer!=null)
          {
            first_u_attempt=first_u_attempt+1;
          }
          if(resultArr.second_user_answer!='' && resultArr.second_user_answer!=null)
          {
            second_u_attempt=second_u_attempt+1;
          }
          if(resultArr.third_user_answer !='' && resultArr.third_user_answer!=null)
          {
            third_u_attempt=third_u_attempt+1;
          }
          if(resultArr.fourth_user_answer!='' && resultArr.fourth_user_answer!=null)
          {
            fourth_u_attempt=fourth_u_attempt+1;
          }
          if(resultArr.fifth_user_answer!='' && resultArr.fifth_user_answer!=null)
          {
            fifth_u_attempt=fifth_u_attempt+1;
          }

        }



        if(question_count>=gameQuestionCount && gameObj.req_type==1) //for one to one
        {
          //update game table/////////////
          var rankOneUId=0;
          var rankTwoUId=0;
          var rankOneScore=0;
          var rankTwoScore=0;
          if(first_user_score>second_user_score){
            rankOneUId=first_user_id;
            rankTwoUId=second_user_id;
            rankOneScore=first_user_score;
            rankTwoScore=second_user_score;
          }
          else{
            rankOneUId=second_user_id;
            rankTwoUId=first_user_id;
            rankOneScore=second_user_score;
            rankTwoScore=first_user_score;
          }
          const uGameR = await db.query("UPDATE gc_game SET first_rank_user_id=$1,second_rank_user_id=$2,third_rank_user_id=$3, fourth_rank_user_id=$4, fifth_rank_user_id=$5, first_rank_score=$6,second_rank_score=$7,third_rank_score=$8, fourth_rank_score=$9, fifth_rank_score=$10 WHERE id=$11",
            [rankOneUId,rankTwoUId, 0,0,0,rankOneScore,rankTwoScore, 0,0,0,game_id]
            );
          ////end/////////////////////////
          console.log('first user cont-->'+first_u_attempt);
          console.log('second user cont-->'+second_u_attempt);
          if(first_u_attempt==gameQuestionCount && second_u_attempt==gameQuestionCount){ //emit result
            const gQuery = await db.query("SELECT * FROM gc_game WHERE id=$1", [game_id]);
            const gObj    = gQuery.rows[0];

            const user1ResultQ = await db.query("SELECT * FROM users WHERE id=$1", [gObj.first_rank_user_id]);
            const user2ResultQ = await db.query("SELECT * FROM users WHERE id=$1", [gObj.second_rank_user_id]);
            const user1Result =user1ResultQ.rows[0];
            const user2Result =user2ResultQ.rows[0];
            ////update point ////////////////
            var _category_id = gObj.category_id;
            var _header_id   = gObj.header_id;
            var first_player_uid     = gObj.first_rank_user_id;
            var second_player_uid    = gObj.second_rank_user_id;
            var first_player_user_points = gObj.first_rank_score;
            var second_player_user_points= gObj.second_rank_score;
           
            competition_type = 'gc';
            let fu_points = await pointSystem(first_player_uid, first_player_user_points, competition_type,_category_id,_header_id);
            let su_points = await pointSystem(second_player_uid, second_player_user_points, competition_type,_category_id,_header_id);
           
            ///////summery/////////////////////////
            const f_summeryQ = await db.query("SELECT gcq.* ,ggr.first_user_answer as user_answer,ggr.first_user_id as user_id FROM gc_game_result ggr INNER JOIN gc_question gcq ON ggr.question_id::integer=gcq.id WHERE ggr.gc_game_id=$1 AND ggr.first_user_id=$2", [game_id,first_user_id]);
            let f_questionObj     = f_summeryQ.rows;

            const s_summeryQ = await db.query("SELECT gcq.* ,ggr.second_user_answer as user_answer,ggr.second_user_id as user_id FROM gc_game_result ggr INNER JOIN gc_question gcq ON ggr.question_id::integer=gcq.id WHERE ggr.gc_game_id=$1 AND ggr.second_user_id=$2", [game_id,second_user_id]);
            let s_questionObj     = s_summeryQ.rows;

            ////calculate total correct & wrong answer- f user
            var f_total_correct_answer=0;
            var f_total_incorrect_answer=0;
            for(let i=0;i<f_questionObj.length;i++)
            {
              let fQObj     = f_questionObj[i];
              ///////////calculate summery//
              var is_answered_val     = fQObj.is_answered;
              if(fQObj.answer.toLowerCase() == fQObj.user_answer.toLowerCase()){
                f_total_correct_answer=f_total_correct_answer+1;
              }
              else{
                f_total_incorrect_answer=f_total_incorrect_answer+1;
              }
            }
            

            ////calculate total correct & wrong answer- s user
            var s_total_correct_answer=0;
            var s_total_incorrect_answer=0;
            for(let i=0;i<s_questionObj.length;i++)
            {
              let sQObj     = s_questionObj[i];
              ///////////calculate summery//
              var is_answered_val     = sQObj.is_answered;
              if(sQObj.answer.toLowerCase() == sQObj.user_answer.toLowerCase()){
                s_total_correct_answer=s_total_correct_answer+1;
              }
              else{
                s_total_incorrect_answer=s_total_incorrect_answer+1;
              }
            }
            
            if(user1Result.id==f_questionObj[0].user_id){
              user1Result['total_correct_answer']   =f_total_correct_answer;
              user1Result['total_incorrect_answer'] =f_total_incorrect_answer;
            }
            else{
              user2Result['total_correct_answer']   =f_total_correct_answer;
              user2Result['total_incorrect_answer'] =f_total_incorrect_answer;
            }
            if(user2Result.id==s_questionObj[0].user_id){
              user2Result['total_correct_answer']   =s_total_correct_answer;
              user2Result['total_incorrect_answer'] =s_total_incorrect_answer;
            }
            else{
              user1Result['total_correct_answer']   =s_total_correct_answer;
              user1Result['total_incorrect_answer'] =s_total_incorrect_answer;
            }

            ////////////////////////////////////////////////
            if(gameObj.opponent_type=='robot'){
              socket.emit('userGameResult', { "status": 200, "data":{'game_id':game_id,"fu_question":f_questionObj,"su_question":s_questionObj,"users":[{"user_id":user1Result.id,"username":user1Result.first_name,"avatar":user1Result.user_avatar,"level":user1Result.user_level,"level_title":user1Result.level_title,"score":gObj.first_rank_score,"rank":'1',"total_correct_answer":user1Result.total_correct_answer,"total_incorrect_answer":user1Result.total_incorrect_answer},{"user_id":user2Result.id,"username":user2Result.first_name,"avatar":user2Result.user_avatar,"level":user2Result.user_level,"level_title":user2Result.level_title,"score":gObj.second_rank_score,"rank":'2',"total_correct_answer":user2Result.total_correct_answer,"total_incorrect_answer":user2Result.total_incorrect_answer}]},"message": "Success" });
            }
            if(gameObj.opponent_type!='robot'){
              socket.broadcast.to(gObj.game_id).emit('userGameResult', { "status": 200, "data":{'game_id':game_id,"fu_question":f_questionObj,"su_question":s_questionObj,"users":[{"user_id":user1Result.id,"username":user1Result.first_name,"avatar":user1Result.user_avatar,"level":user1Result.user_level,"level_title":user1Result.level_title,"score":gObj.first_rank_score,"rank":'1'},{"user_id":user2Result.id,"username":user2Result.first_name,"avatar":user2Result.user_avatar,"level":user2Result.user_level,"level_title":user2Result.level_title,"score":gObj.second_rank_score,"rank":'2'}]},"message": "Success" });
            }
          }
        }
        else
        {
          //socket.emit('userResponseAnswer', { "status": 200, "data":{"users":[{'first_user_id':first_user_id,'first_user_score':first_user_score},{'second_user_id':second_user_id,'second_user_score':second_user_score},{'third_user_id':third_user_id,'third_user_score':third_user_score},{'fourth_user_id':fourth_user_id,'fourth_user_score':fourth_user_score},{'fifth_user_id':fifth_user_id,'fifth_user_score':fifth_user_score}]},"message": "Success" });
          const user1ResultQry = await db.query("SELECT * FROM users WHERE id=$1", [first_user_id]);
          const user2ResultQry = await db.query("SELECT * FROM users WHERE id=$1", [second_user_id]);
          const user1ResultObj =user1ResultQry.rows[0];
          const user2ResultObj =user2ResultQry.rows[0];
          //socket.emit('userResponseAnswer', { "status": 200, "data":{"users":[{'user_id':first_user_id,'user_score':first_user_score,"username":user1ResultObj.username,"avatar":user1ResultObj.user_avatar,"level":user1ResultObj.user_level},{'user_id':second_user_id,'user_score':second_user_score,"username":user2ResultObj.username,"avatar":user2ResultObj.user_avatar,"level":user2ResultObj.user_level},{'user_id':third_user_id,'user_score':third_user_score,"username":user3ResultObj.username,"avatar":user3ResultObj.user_avatar,"level":user3ResultObj.user_level},{'user_id':fourth_user_id,'user_score':fourth_user_score,"username":user4ResultObj.username,"avatar":user4ResultObj.user_avatar,"level":user4ResultObj.user_level},{'user_id':fifth_user_id,'user_score':fifth_user_score,"username":user5ResultObj.username,"avatar":user5ResultObj.user_avatar,"level":user5ResultObj.user_level}]},"message": "Success" });
          socket.emit('userResponseAnswer', { "status": 200, "data":{"users":[{'user_id':first_user_id,'user_score':first_user_score,"username":user1ResultObj.username,"avatar":user1ResultObj.user_avatar,"level":user1ResultObj.user_level,"level_title":user1ResultObj.level_title},{'user_id':second_user_id,'user_score':second_user_score,"username":user2ResultObj.username,"avatar":user2ResultObj.user_avatar,"level":user2ResultObj.user_level,"level_title":user2ResultObj.level_title}]},"message": "Success" });
          socket.broadcast.to(str_game_id).emit('userResponseAnswer', { "status": 200, "data":{"users":[{'user_id':first_user_id,'user_score':first_user_score,"username":user1ResultObj.username,"avatar":user1ResultObj.user_avatar,"level":user1ResultObj.user_level,"level_title":user1ResultObj.level_title},{'user_id':second_user_id,'user_score':second_user_score,"username":user2ResultObj.username,"avatar":user2ResultObj.user_avatar,"level":user2ResultObj.user_level,"level_title":user2ResultObj.level_title}]},"message": "Success" });
        
        }
      }
      else
      {

        socket.emit('userResponseAnswer', { "status": 201, "data":{},"message": "Game id not foud." });
      }
    });
  
    
    // Play again
    socket.on('playAgainRequest', async  function (data) 
    {
      console.log('req get');
      console.log(data);
      var game_id     = data['game_id'];
      console.log(game_id);
      var user_id     = data['user_id'];
      var access_token= data['access_token'];
      var rand_game_id=  Math.floor(1000 + Math.random() * 9000);
      //(Math.random()+1).toString(36).slice(2, 18);
      
      //####check is valid access_token#####
      var chekToken = await db.query("SELECT * FROM users WHERE access_token=$1", [access_token]);
      if(chekToken.rows.length == 0)
      {
          socket.emit('playAgainResponse', { "status": 201, "data":{},"message": "مدخل عملة الرمزية  غير سارية العمل" });
          return;
      }
       console.log('------>in code to send chek game');
      var results = await db.query("SELECT * FROM gc_game WHERE id=$1", [game_id]);
      if(results.rows.length == 0)
      {
          socket.emit('playAgainResponse', { "status": 201, "data":{},"message": "بطاقة هوية ( id ) للعبة غير سارية العمل" });
          return;
      }
      console.log('------>in code to send request');
      var oldGameObj=results.rows[0];
      console.log('new game-d');
      console.log(oldGameObj.game_id);

      var from_id    =0;
      var from_status=0;
      var to_id      =0;
      var to_status  =0;
      if(oldGameObj.user_id==user_id){
        from_id = oldGameObj.user_id;
        from_status=1;
        to_id   = oldGameObj.first_opponent_id;
        to_status=0;
      }
      else{
        from_id = oldGameObj.first_opponent_id;
        from_status=1;
        to_id=oldGameObj.user_id;
        to_status=0;
      }
      console.log('fire playAgainResponse');
      socket.emit('playAgainResponse', { "status": 200, "data":{'game_id':game_id,'from_id':from_id,'to_id':to_id,'from_status':from_status,'to_status':to_status},"message": "Success" });
      io.sockets.in(oldGameObj.game_id).emit('playAgainResponse', { "status": 200, "data":{'game_id':game_id,'from_id':from_id,'to_id':to_id,'from_status':from_status,'to_status':to_status},"message": "Success" });
      console.log('fire playAgainResponse end');
    });

    socket.on('acceptPlayAgainRequest', async  function (data) 
    {
      var game_id     = data['game_id'];
      var from_status = data['from_status'];
      var to_status   = data['to_status'];
      var from_id     = data['from_id'];
      var to_id       = data['to_id'];
      var user_id     = from_id;

      var access_token= data['access_token'];
      var rand_game_id=  Math.floor(1000 + Math.random() * 9000);
      //(Math.random()+1).toString(36).slice(2, 18);
      
      //####check is valid access_token#####
      var chekToken = await db.query("SELECT * FROM users WHERE access_token=$1", [access_token]);
      if(chekToken.rows.length == 0)
      {
          socket.emit('acceptPlayAgainResponse', { "status": 201, "data":{},"message": "مدخل عملة الرمزية  غير سارية العمل" });
          return;
      }

     if(!to_status || !from_status)
      {
          socket.emit('acceptPlayAgainResponse', { "status": 201, "data":{},"message": "Opponent rejected your request." });
          return;
      }

      var results = await db.query("SELECT * FROM gc_game WHERE id=$1", [game_id]);
      if(results.rows.length == 0)
      {
          socket.emit('acceptPlayAgainResponse', { "status": 201, "data":{},"message": "بطاقة هوية ( id ) للعبة غير سارية العمل" });
          return;
      }
      var oldGameObj=results.rows[0];
      var insertAgain = await db.query("INSERT INTO gc_game (header_id, category_id, req_type, user_id,status, created_by,game_id,opponent_type,first_opponent_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
           [oldGameObj.header_id, oldGameObj.category_id, oldGameObj.req_type, oldGameObj.user_id,'1',oldGameObj.user_id,rand_game_id,oldGameObj.opponent_type,oldGameObj.first_opponent_id]
           );
      var newGameID     = insertAgain.rows[0].id;
      var newRandGameID = insertAgain.rows[0].game_id;
      var header_id     = insertAgain.rows[0].header_id;
      var category_id   = insertAgain.rows[0].category_id;
      var opponent_type = insertAgain.rows[0].opponent_type;
      
      
      ////////////////////////////////////////////
      var user1ResultQ = await db.query("SELECT * FROM users WHERE id=$1", [oldGameObj.user_id]);
      var user2ResultQ = await db.query("SELECT * FROM users WHERE id=$1", [oldGameObj.first_opponent_id]);
      var user1Result =user1ResultQ.rows[0];
      var user2Result =user2ResultQ.rows[0];

       //create runtime game
      // header_id=1; //dummy
      // category_id=1;//dummy
      var question = await db.query("SELECT * FROM gc_question WHERE status=$1 AND header_id=$2 AND category_id=$3 order by random() LIMIT 10", ['1',header_id,category_id]);
      var questionArr=question.rows;

      var gameQuery = await db.query("SELECT * FROM gc_game WHERE id=$1", [newGameID]);
      var gameObjNew   = gameQuery.rows[0];

      for(let i=0;i<questionArr.length;i++)
      {
        let questionObj = questionArr[i];
        var insert = await db.query("INSERT INTO gc_game_result (gc_game_id,question_id,correct_answer,first_user_id,second_user_id,third_user_id,fourth_user_id,fifth_user_id,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
        [newGameID, questionObj.id, questionObj.answer, gameObjNew.user_id,gameObjNew.first_opponent_id,gameObjNew.second_opponent_id,gameObjNew.third_opponent_id,gameObjNew.fourth_opponent_id,user_id]
         );
      }

      //store the user_id in the socket session for this client
      // if(socket.room){
      //   delete user_ids[socket.user_id];
      //   socket.leave(socket.room);
      // }
      // //store the user_id in the socket session for this client
      // socket.user_id    = user_id;
      // socket.room       = rand_game_id;
      // user_ids[user_id] = user_id;
      // socket.join(rand_game_id);
      ///end initialization
      //quiz created
      socket.emit('acceptPlayAgainResponse', { "status": 200, "data":{'game_id':newGameID,'rand_game_id':newRandGameID,"game_type":opponent_type,"users":[{"user_id":user1Result.id,"username":user1Result.first_name,"avatar":user1Result.user_avatar,"level":user1Result.user_level,"level_title":user1Result.level_title,"points":"0"},{"user_id":user2Result.id,"username":user2Result.first_name,"avatar":user2Result.user_avatar,"level":user2Result.user_level,"level_title":user2Result.level_title,"points":"0"}]},"message": "User accepted" });
      io.sockets.in(oldGameObj.game_id).emit('acceptPlayAgainResponse', { "status": 200, "data":{'game_id':newGameID,'rand_game_id':newRandGameID,"game_type":opponent_type,"users":[{"user_id":user1Result.id,"username":user1Result.first_name,"avatar":user1Result.user_avatar,"level":user1Result.user_level,"level_title":user1Result.level_title,"points":"0"},{"user_id":user2Result.id,"username":user2Result.first_name,"avatar":user2Result.user_avatar,"level":user2Result.user_level,"level_title":user2Result.level_title,"points":"0"}]},"message": "User accepted" });
      ////////////////////////////////////////////
    });

    ////for multplayer only
    socket.on('opponentStartGame', async  function (data) 
    {
      console.log('before opponent print');
      console.log(data);
      var game_id     = data['game_id'];
      var user_id     = data['user_id'];
      var access_token= data['access_token'];
      const gameQuery = await db.query("SELECT * FROM gc_game WHERE id=$1", [game_id]);
      const gameObj   = gameQuery.rows[0];
      var rand_game_id= gameObj.game_id;
      //store the user_id in the socket session for this client  
      ///////// opponent join////////
      socket.user_id    = user_id;
      socket.room       = rand_game_id;
      user_ids[user_id] = user_id;
      socket.join(rand_game_id);
    });

    socket.on('hostStartGame', async  function (data) 
    {
      console.log('before host print');
      //console.log('expire time'+privilegeExpiredTs);
      var game_id     = data['game_id'];
      var user_id     = data['user_id'];
      var access_token= data['access_token'];
      const gameQuery = await db.query("SELECT * FROM gc_game WHERE id=$1", [game_id]);
      const gameObj   = gameQuery.rows[0];
      var rand_game_id= gameObj.game_id;

      //update game status
      const updateGame = await db.query("UPDATE gc_game SET status=$1 WHERE id=$2",['1',game_id]);
      
      //store the user_id in the socket session for this client
              
      ///////// host join////////
      socket.user_id    = user_id;
      socket.room       = rand_game_id;
      user_ids[user_id] = user_id;
      socket.join(rand_game_id);

      ///end initialization


      //####check is valid access_token#####
      const chekToken = await db.query("SELECT * FROM users WHERE access_token=$1", [access_token]);
      if(chekToken.rows.length == 0)
      {
          socket.emit('hostStartGameResponse', { "status": 201, "data":{},"message": "مدخل عملة الرمزية  غير سارية العمل" });
      }

      //emit
      const uid = 0;//Math.floor(Math.random() * 100000);
      var _room_id = "alaam"+rand_game_id; 
      var currentTimestamp = Math.floor(Date.now() / 1000);
      var privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

      const tokenA = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, _room_id, uid, role, privilegeExpiredTs);
      //const tokenA = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, _room_id, 0, role, privilegeExpiredTs);
      console.log('uid');
      console.log(uid);

      console.log('channelName');
      console.log(_room_id);
      console.log('token');
      console.log(tokenA);
      console.log('---end---');
      socket.emit('hostStartGameResponse', { "status": 200, "data":{'game_id':game_id, "channelName": _room_id, "token": tokenA,"uid":uid},"message": "game started" });
      socket.broadcast.to(rand_game_id).emit('hostStartGameResponse', { "status": 200, "data":{'game_id':game_id, "channelName": _room_id, "token": tokenA,"uid":uid},"message": "game started" });
    });


    socket.on('otmNextQuestion', async  function (data) 
    {
      console.log('before otm print');
      console.log(data);
      var access_token = data['access_token'];
      var game_id      = data['game_id'];
      var user_id      = data['user_id'];
      var question_id  = data['question_id'];
      var duration     = data['duration'];
      var question_wait_time = data['question_wait_time'];
      question_wait_time =Number(question_wait_time)/1000;
      
      console.log('-time-');
      console.log(question_wait_time);
  
      // game
      const qGame  = await db.query("SELECT * FROM gc_game WHERE id=$1", [game_id]);
      let qObj  = qGame.rows[0];
      //result
      const checkGame  = await db.query("SELECT * FROM gc_game_result WHERE gc_game_id=$1 AND question_id=$2", [game_id,question_id]);
      let questionObj  = checkGame.rows[0];
      var rand_game_id = qObj.game_id;
      console.log('game id-->'+rand_game_id);

      var first_user_id      = questionObj.first_user_id;
      var first_user_answer  = questionObj.first_user_answer;

      var second_user_id     = questionObj.second_user_id;
      var second_user_answer = questionObj.second_user_answer;

      var third_user_id      = questionObj.third_user_id;
      var third_user_answer  = questionObj.third_user_answer;

      var fourth_user_id     = questionObj.fourth_user_id;
      var fourth_user_answer = questionObj.fourth_user_answer;

      var fifth_user_id      = questionObj.fifth_user_id;
      var fifth_user_answer  = questionObj.fifth_user_answer;

      ///////////////////////////////////
      var newRUArr=[]
      if(first_user_id!=null){
        newRUArr.push({'user_answer':first_user_answer,'user_id':first_user_id});
      }
      if(second_user_id!=null){
        newRUArr.push({'user_answer':second_user_answer,'user_id':second_user_id});
      }
      if(third_user_id!=null){
        newRUArr.push({'user_answer':third_user_answer,'user_id':third_user_id});
      }
      if(fourth_user_id!=null){
        newRUArr.push({'user_answer':fourth_user_answer,'user_id':fourth_user_id});
      }
      if(fifth_user_id!=null){
        newRUArr.push({'user_answer':fifth_user_answer,'user_id':fifth_user_id});
      }
      ///////////////////////////////////

      var is_next=1;
      for(let rj=0;rj<newRUArr.length;rj++)
      {
        var playerObj = newRUArr[rj];
        console.log('time--chk');
        console.log(playerObj);
        if(playerObj['user_answer']==null){
          is_next=0;
          console.log('yes--->2');
        }       
      }

      if(question_wait_time >= duration){
        is_next=1;
          console.log('yes--->3');

      }
       console.log('final reponse');
       console.log('is next->'+is_next,'is_question->'+question_id);
      //emit 
      if(is_next==1){
        socket.emit('otmNextQuestionResponse', { "status": 200, "data":{'is_next':is_next,'question_id':question_id,'game_id':game_id},"message": "success" });
        socket.broadcast.to(rand_game_id).emit('otmNextQuestionResponse', { "status": 200, "data":{'is_next':is_next,'question_id':question_id,'game_id':game_id},"message": "success" });
      }
    });

    //end multipyer game
    
    //League user interest show 
    socket.on('leagueInterestCount', async  function (data) 
    {
      console.log('before host print');
      console.log(data);
      var competition_id     = data['competition_id'];
      var user_id     = data['user_id'];
      var access_token= data['access_token'];
      /* const gameQuery = await db.query("SELECT * FROM league WHERE id=$1", [competition_id]);
      const gameObj   = gameQuery.rows[0];
      var rand_competition_id= gameObj.id; */

      var rand_competition_id = competition_id;
      //store the user_id in the socket session for this client
              
      ///////// host join////////
      socket.user_id    = user_id;
      socket.room       = rand_competition_id;
      user_ids[user_id] = user_id;
      socket.join(rand_competition_id);

      ///end initialization

      //####check is valid access_token#####
      const chekToken = await db.query("SELECT * FROM users WHERE access_token=$1", [access_token]);
      if(chekToken.rows.length == 0)
      {
          socket.emit('leagueInterestCountResponse', { "status": 201, "data":{},"message": "مدخل عملة الرمزية  غير سارية العمل" });
      }

      //get count interest users status
      const countLeague = await db.query("SELECT count(*) as total FROM league_user_in WHERE competition_id=$1 and is_group=$2",[competition_id, 0]);
      const intrstObj   = countLeague.rows[0];
      var totalInterest= intrstObj.total;
      console.log(totalInterest);
      //emit 
      var currentTimestamp = Math.floor(Date.now() / 1000);
      var privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
      const tokenA = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, rand_competition_id, 0, role, privilegeExpiredTs);

      socket.emit('leagueInterestCountResponse', { "status": 200, "data":{'competition_id':competition_id, "totalInterest": totalInterest},"message": "total count" });
      socket.broadcast.to(rand_competition_id).emit('leagueInterestCountResponse', { "status": 200, "data":{'competition_id':competition_id, "totalInterest": totalInterest},"message": "total count" });
    });

    socket.on('leagueNextMove', async  function (data) 
    {
      console.log('before leagueNextMove print');
      console.log(data);
      var duration           = data['total_duration'];
      var question_wait_time = data['total_waiting_time'];
      var competition_id     = data['competition_id'];
      //question_wait_time =Number(question_wait_time)/1000;
      
      console.log('-time-');
      console.log("total time--"+duration);
      console.log("waiting time--"+question_wait_time);
      var is_next=0;
  
      if(question_wait_time >= duration){
        is_next=1;
        console.log('yes move next--->');
      }
      //emit 
      if(is_next==1)
      {
        setTimeout(function(){ 
          socket.emit('leagueNextMoveResponse', { "status": 200, "data":{'is_next':is_next},"message": "success" });
          socket.broadcast.to(competition_id).emit('leagueNextMoveResponse', { "status": 200, "data":{'is_next':is_next},"message": "success" });
        }, 10000);
      }
    });

    ///league save result
    socket.on('leagueSaveResult_old', async  function (data) 
    {
      console.log('before leagueSaveResult print');
      console.log(data);
      let duration           = data['total_duration'];
      let question_wait_time = data['total_waiting_time'];
      let competition_id     = data['competition_id'];
      
      let user_id   = data['user_id'];
      let group_id  = data['group_id'];
      let answerObj = data['answer'];
      let level = 0;
      if(group_id == 0){
        level = 0;
      }else{
        const group = await db.query("SELECT * FROM league_group where id=$1 ", [ group_id]);
        level = group.rows[0].group_level;
      }

      //save result one by one
      for (let index = 0; index < answerObj.length; index++) {
        //console.log(answerObj[index].question_id);
        let question_id = answerObj[index].question_id;
        let user_answer = answerObj[index].user_answer;
        let answer_time = answerObj[index].answer_time;

        const results = await db.query("UPDATE league_result SET user_answer=$1, answer_time=$2 where competition_id=$3 and user_id =$4 and group_id=$5 and level=$6 and question_id=$7 RETURNING *",
                    [user_answer, answer_time, competition_id, user_id, group_id, level, question_id]
        );

      }

      console.log('-time-');
      console.log("total time--"+duration);
      console.log("waiting time--"+question_wait_time);
      var is_next=0;
  
      if(question_wait_time >= duration){
        is_next=1;
        console.log('yes move next--->');
      }
      //emit 
      if(is_next==1)
      {

        setTimeout(function(){ 
          socket.emit('leagueSaveResultResponse', { "status": 200, "data":{'is_next':is_next},"message": "success" });
          socket.broadcast.to(competition_id).emit('leagueSaveResultResponse', { "status": 200, "data":{'is_next':is_next},"message": "success" });
        }, 10000);
        
        ///get result ///////////////
          // var competition =[];
          // let level = 0;
          // if(group_id == 0){ // Here group id is 0, this is last competition and more than 2 user
          //   level = 0;
            
          //   //delete league result
          //   //await db.query("DELETE FROM league_result WHERE competition_id =$1 and group_id !=$2 and level !=$3" , [competition_id, 0, 0]);

          //   competition = await db.query("SELECT DISTINCT ON (user_id) user_id FROM league_result as cqt  WHERE competition_id =$1 and group_id =$2" , [competition_id, 0]);
          //   if (typeof competition.rows !== 'undefined' && competition.rows.length == 0) {
          //     return res.status(200).json({ data:[], success: false, message: 'لا يؤجد نتيجة للمسابقة المختارة' //'Results not found for selected competition' 
          //   });
          //   }
          // }else{ //else part  
          //   const group = await db.query("SELECT * FROM league_group where id=$1 ", [ group_id]);
          //   level = group.rows[0].group_level;
          //   let user_id = group.rows[0].user_id;
          //   let paired_id = group.rows[0].paired_id;

          //   competition = await db.query("SELECT DISTINCT ON (user_id) user_id FROM league_result as cqt  WHERE (user_id =$1 or user_id =$2)" , [user_id, paired_id]);
          //   if (typeof competition.rows !== 'undefined' && competition.rows.length == 0) {
          //     return res.status(200).json({ data:[], success: false, message: 'لا يؤجد نتيجة للمسابقة المختارة' // 'Results not found for selected competition' 
          //   });
          //   }
          //   await db.query("UPDATE league_group SET status=$1 where id =$2 RETURNING *",
          //       [1, group_id]
          //       );
          // }
          // var refObj = competition.rows;
          // //console.log('refObj', JSON.stringify(refObj));
          
          // var result = [];
          // for(var i =0; i< refObj.length; i++){
          //   /* const results = await db.query("SELECT * FROM league_result WHERE league_result.competition_id=$1 and league_result.group_id=$2 and league_result.level=$3 and user_id =$4 ", [competition_id, group_id, level, refObj[i].user_id]);
          //   var userAnsObj = results.rows; */

          //   var userAnsArr = await db.query("SELECT cqt.user_id, cqt.question_id, cqt.correct_answer, cqt.user_answer, cqt.answer_time, users.first_name || ' ' || users.last_name as full_name, users.country, users.user_avatar FROM league_result as cqt JOIN users on users.id = cqt.user_id::integer  WHERE cqt.user_id=$1 AND cqt.competition_id=$2 and cqt.group_id=$3" , [refObj[i].user_id, competition_id, group_id]);
          //   var userAnsObj = userAnsArr.rows;
          //   console.log('userAnsObj', JSON.stringify(userAnsObj.length));
          //   var totalAnswer = Object.keys(userAnsObj).length;
          
          //   var correctAnswer = [];
          //   var scoreData = 0;
          //   var totalTime = 0;
          //   for(var j =0; j< userAnsObj.length; j++){
          //     if(userAnsObj[j].user_answer == userAnsObj[j].correct_answer){
          //       correctAnswer.push(userAnsObj[j].correct_answer);
          //       scoreData += 5;
          //     }
          //     if(userAnsObj[j].answer_time == null){
          //       userAnsObj[j].answer_time = 0;
          //     }
          //     totalTime += parseInt(userAnsObj[j].answer_time);
          //   }

          //   var totalAnswerss = Object.keys(correctAnswer).length;
          //       //var user_answer = userAnswer.push(userAnsObj[0].user_id);
          //       var ress = {user_id : refObj[i].user_id, user_name : userAnsObj[0].full_name, user_image: userAnsObj[0].user_avatar, country: userAnsObj[0].country, user_answers: totalAnswer, correct_answers : totalAnswerss, score :scoreData, total_times : totalTime};
          //     result.push(ress);
          // }

          // result.sort((a,b) => parseInt(b.score) - parseInt(a.score) || parseInt(a.total_times) - parseInt(b.total_times));
          // // Show rank according to score sorting
          // var total_user = 0;
          // for (var i = 0; i < result.length; i++) {
          //   //Here condition for win game for top player
          //   if(i==0 && group_id ==0){
          //     //point system
          //     var getPoints = 40;
          //     var competition_type = "league_competition";
          //     await leaguePointSystem(result[i].user_id, getPoints, competition_type);
          //   }
            
          //   if(i==0 && group_id !=0){
          //     await db.query("UPDATE league_user_in SET is_group=$1 where interest_user_id =$2 and competition_id=$3 RETURNING *",
          //     [0, result[i].user_id, competition_id]
          //     );
          //     //Here function call for Leveling up (+5) for every step.
          //     //point system
          //     var getPoints = 5;
          //     var competition_type = "league_competition";
          //     await leaguePointSystem(result[i].user_id, getPoints, competition_type);

          //     const total = await db.query("select count(id) as total_user from league_user_in where is_group =$1 and competition_id=$2", [0, competition_id] );
          //     total_user = total.rows[0].total_user;
          //   }
          //   if(group_id == 0){
          //     await db.query("UPDATE league_user_in SET is_group=$1 where interest_user_id =$2 and competition_id=$3 RETURNING *",
          //     [1, result[i].user_id, competition_id]
          //     );

          //   }
          //   result[i].total_user = total_user;
          //   result[i].rank = i+1;
          // }
          // console.log('total--'+ total_user);
          // console.log(result)
       
          
          // socket.emit('leagueSaveResultResponse', { "status": 200, "data":result,"message": "success" });
          // socket.broadcast.to(competition_id).emit('leagueSaveResultResponse', { "status": 200, "data":result,"message": "success" });
        
      }
    });
  
    socket.on('leagueSaveResult', async  function (data) 
    {
      console.log('before leagueSaveResult print');
      console.log(data);
      let duration           = data['total_duration'];
      let question_wait_time = data['total_waiting_time'];
      let competition_id     = data['competition_id'];
      
      let user_id   = data['user_id'];
      let group_id  = data['group_id'];
      let answerObj = data['answer'];
      let level = 0;
      var group_level=0;
      if(group_id == 0){
        level = 0;
      }else{
        const group = await db.query("SELECT * FROM league_group where id=$1 ", [ group_id]);
        level = group.rows[0].group_level;
        group_level= group.rows[0].group_level;
      }

      //save result one by one
      for (let index = 0; index < answerObj.length; index++) {
        //console.log(answerObj[index].question_id);
        let question_id = answerObj[index].question_id;
        let user_answer = answerObj[index].user_answer;
        let answer_time = answerObj[index].answer_time;

        const results = await db.query("UPDATE league_result SET user_answer=$1, answer_time=$2 where competition_id=$3 and user_id =$4 and group_id=$5 and level=$6 and question_id=$7 RETURNING *",
                    [user_answer, answer_time, competition_id, user_id, group_id, group_level, question_id]
        );

      }

      console.log('-time-');
      console.log("total time--"+duration);
      console.log("waiting time--"+question_wait_time);
      var is_next=0;
  
      if(question_wait_time >= duration){
        is_next=1;
        console.log('yes move next--->');
      }
      //emit 
      if(is_next==1)
      {
        
        ///get result ///////////////
        setTimeout(async function(){ 
          const allGroup = await db.query("SELECT * FROM league_group where competition_id=$1 AND group_level=$2 ", [competition_id,group_level]);
          const allGroupObj = allGroup.rows;
          var allResult=[];
          for(var z =0; z< allGroupObj.length; z++)
          {
            let group = allGroupObj[z];
            //const group = await db.query("SELECT * FROM league_group where id=$1 ", [ group_id]);
            let level     = group.group_level;
            let user_id   = group.user_id;
            let paired_id = group.paired_id;
            let _group_id = group.id;
            let competition = await db.query("SELECT DISTINCT ON (user_id) user_id FROM league_result as cqt  WHERE (user_id =$1 or user_id =$2)" , [user_id, paired_id]);
          
            if (typeof competition.rows !== 'undefined' && competition.rows.length == 0) {
              socket.emit('leagueSaveResultResponse', { 'status': 201, "data":{},"message": 'لا يؤجد نتيجة للمسابقة المختارة' });
            }
            await db.query("UPDATE league_group SET status=$1 where id =$2",[1, _group_id]);
            let refObj = competition.rows;
            //console.log('refObj', JSON.stringify(refObj));
        
            var result = [];
            for(var i =0; i< refObj.length; i++)
            {
              var userAnsArr = await db.query("SELECT cqt.user_id, cqt.question_id, cqt.correct_answer, cqt.user_answer, cqt.answer_time, users.first_name || ' ' || users.last_name as full_name, users.country, users.user_avatar FROM league_result as cqt JOIN users on users.id = cqt.user_id::integer  WHERE cqt.user_id=$1 AND cqt.competition_id=$2 and cqt.group_id=$3" , [refObj[i].user_id, competition_id, _group_id]);
              var userAnsObj = userAnsArr.rows;
              //console.log("group -id"+_group_id);
              //console.log('userAnsObj', JSON.stringify(userAnsObj));
              var totalAnswer = Object.keys(userAnsObj).length;
            
              var correctAnswer = [];
              var scoreData = 0;
              var totalTime = 0;
              var totalIncorrectAnswer = 0;
              for(var j =0; j< userAnsObj.length; j++)
              {
                let _user_answer    = userAnsObj[j].user_answer;
                if(userAnsObj[j].user_answer != null){
                 _user_answer = userAnsObj[j].user_answer.toLowerCase();
                }
                let _correct_answer = userAnsObj[j].correct_answer;
                if(userAnsObj[j].correct_answer != null){
                   _correct_answer=userAnsObj[j].correct_answer.toLowerCase();
                }
                if(_user_answer == _correct_answer){
                  correctAnswer.push(userAnsObj[j].correct_answer);
                  scoreData += 5;
                }
                else{
                  totalIncorrectAnswer=totalIncorrectAnswer+1;
                }
                if(userAnsObj[j].answer_time == null){
                  userAnsObj[j].answer_time = 0;
                }
                totalTime += parseInt(userAnsObj[j].answer_time);
              }

              var totalAnswerss = Object.keys(correctAnswer).length;
                  //var user_answer = userAnswer.push(userAnsObj[0].user_id);
                  if(userAnsObj.length>0){
                    var ress = {user_id : refObj[i].user_id, user_name : userAnsObj[0].full_name, user_image: userAnsObj[0].user_avatar, country: userAnsObj[0].country, user_answers: totalAnswer, correct_answers : totalAnswerss,total_incorrect_answers : totalIncorrectAnswer, score :scoreData, total_times : totalTime};
                    result.push(ress);
                  }
                  else
                  {
                    console.log("------->>");
                    console.log(JSON.stringify(userAnsObj));
                    console.log('<<------');
                  }  
            }
             console.log("------->>");
            console.log(JSON.stringify(result))
             console.log("------->>");

            result.sort((a,b) => parseInt(b.score) - parseInt(a.score) || parseInt(a.total_times) - parseInt(b.total_times));
            // Show rank according to score sorting
            //var total_user = 0;
            for (let i = 0; i < result.length; i++) 
            {
              
              if(i==0)
              {
                await db.query("UPDATE league_user_in SET is_group=$1 where interest_user_id =$2 and competition_id=$3 RETURNING *",
                [0, result[i].user_id, competition_id]
                );
                //Here function call for Leveling up (+5) for every step.
                //point system
                var getPoints = 5;
                var competition_type = "league_competition";
                await leaguePointSystem(result[i].user_id, getPoints, competition_type);

                // const total = await db.query("select count(id) as total_user from league_user_in where is_group =$1 and competition_id=$2", [0, competition_id] );
                // total_user = total.rows[0].total_user;
              }
             

              //result[i].total_user = total_user;
              result[i].rank = i+1;
              result[i].group_id =_group_id;
            }
            let resltPre ={'group_id':_group_id,'user_data':result};
            // console.log('group_id--'+_group_id);
            // result['group_id'] =_group_id;
            //console.log('allResult', JSON.stringify(resltPre));
            allResult.push(resltPre)
            //console.log('total--'+ total_user);
            //console.log(result)
           
     
          }
          const totalUserQuery = await db.query("select count(id) as total_user from league_user_in where is_group =$1 and competition_id=$2", [0, competition_id] );
          let total_user = totalUserQuery.rows[0].total_user;
          //update points for final winner
          if(total_user==1){
            // if(i==0 && group_id ==0){
              //   //point system
              //   let _getPoints = 40;
              //   let _competition_type = "league_competition";
              //   await leaguePointSystem(allResult['user_data'][0].user_id, _getPoints, _competition_type);
              // }
             
             // console.log('laset opp-->'+allResult['user_data']);
          }

          var finalArray= {'user_list':allResult,'total_user':total_user};

          console.log('user_list-->'+JSON.stringify(finalArray));
          socket.emit('leagueSaveResultResponse', { "status": 200, "data":finalArray,"message": "success" });
          socket.broadcast.to(competition_id).emit('leagueSaveResultResponse', { "status": 200, "data":finalArray,"message": "success" });
        }, 15000);
      }
    });


    //Competititon user interest show 
    socket.on('competitionInterestCount', async  function (data) 
    {
      console.log('before host print');
      console.log(data);
      var competition_id     = data['competition_id'];
      var user_id     = data['user_id'];
      var access_token= data['access_token'];
      /* const gameQuery = await db.query("SELECT * FROM league WHERE id=$1", [competition_id]);
      const gameObj   = gameQuery.rows[0];
      var rand_competition_id= gameObj.id; */

      var rand_competition_id = competition_id;
      //store the user_id in the socket session for this client
              
      ///////// host join////////
      socket.user_id    = user_id;
      socket.room       = rand_competition_id;
      user_ids[user_id] = user_id;
      socket.join(rand_competition_id);

      ///end initialization

      //####check is valid access_token#####
      const chekToken = await db.query("SELECT * FROM users WHERE access_token=$1", [access_token]);
      if(chekToken.rows.length == 0)
      {
          socket.emit('competitionInterestCountResponse', { "status": 201, "data":{},"message": "مدخل عملة الرمزية  غير سارية العمل" });
      }

      const competition = await db.query("SELECT id, promotion_type FROM competition WHERE id=$1", [competition_id]);
      const competitionObj   = competition.rows[0];
      var promotion_type= competitionObj.promotion_type;
      
      if(promotion_type == 3){
        //get count interest users status
        //const countLeague = await db.query("SELECT count(*) as total FROM league_user_in WHERE competition_id=$1 and is_group=$2",[competition_id, 0]);
        const countLeague = await db.query("SELECT count(distinct(created_by)) as total FROM competition_affiliate_check WHERE competition_id=$1 ",[competition_id]);
        const intrstObj   = countLeague.rows[0];
        var totalInterest= intrstObj.total;
        console.log(totalInterest);
        }else{
          const countLeague = await db.query("SELECT count(distinct(user_id)) as total FROM competition_download WHERE competition_id=$1 ",[competition_id]);
          const intrstObj   = countLeague.rows[0];
          var totalInterest= intrstObj.total;
          console.log(totalInterest);
        }
      //emit 
      var currentTimestamp = Math.floor(Date.now() / 1000);
      var privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
      const tokenA = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, rand_competition_id, 0, role, privilegeExpiredTs);

      socket.emit('competitionInterestCountResponse', { "status": 200, "data":{'competition_id':competition_id, "totalInterest": totalInterest},"message": "total count" });
      socket.broadcast.to(rand_competition_id).emit('competitionInterestCountResponse', { "status": 200, "data":{'competition_id':competition_id, "totalInterest": totalInterest},"message": "total count" });
    });
});


app.get('/test', async function (req, res) 
{
    var user_answer_col='first_user_answer';
    var user_time_taken_col='first_user_taken_time';
     

    // const updateResult = await db.query("UPDATE gc_game_result SET "+user_answer_col+"=$1,"+user_time_taken_col+"=$2 WHERE id=$3",
    //   [ 'c', '10','670']
    //   );


    const resultQuery = await db.query("SELECT * FROM gc_game_result WHERE gc_game_id=$1", ['110']);
    let resultObj = resultQuery.rows;
    var resultFinal=[];
    let first_user_id=0;
    let second_user_id=0;
    let third_user_id=0;
    let fourth_user_id=0;
    let fifth_user_id=0;
    let first_user_score=0;
    let second_user_score=0;
    let third_user_score=0;
    let fourth_user_score=0;
    let fifth_user_score=0;
    for(let j=0;j<resultObj.length;j++)
    {
      let resultArr   = resultObj[j];
      first_user_id   = resultArr.first_user_id;
      second_user_id  = resultArr.second_user_id;
      third_user_id   = resultArr.third_user_id;
      fourth_user_id  = resultArr.fourth_user_id;
      fifth_user_id   = resultArr.fifth_user_id;
      if(resultArr.first_user_answer==resultArr.correct_answer)
      {
        first_user_score=first_user_score+1;
      }
      if(resultArr.second_user_answer==resultArr.correct_answer)
      {
        second_user_score=second_user_score+1;
      }
      if(resultArr.third_user_answer==resultArr.correct_answer)
      {
        third_user_score=third_user_score+1;
      }
      if(resultArr.fourth_user_answer==resultArr.correct_answer)
      {
        fourth_user_score=fourth_user_score+1;
      }
      if(resultArr.fifth_user_answer==resultArr.correct_answer)
      {
        fifth_user_score=fifth_user_score+1;
      }
    }
    return res.json({ "status": 200, "data":{"users":[{'user_id':first_user_id,'user_score':first_user_score},{'user_id':second_user_id,'user_score':second_user_score},{'user_id':third_user_id,'user_score':third_user_score},{'user_id':fourth_user_id,'user_score':fourth_user_score},{'user_id':fifth_user_id,'user_score':fifth_user_score}]}});
});

///get question by game_id
app.post('/get_question_by_game', async function (req, res) {

  if(req.body.access_token && req.body.game_id)
  {
    const isTrue= await isValidToken(req.body.access_token);
    if(!isTrue){
           return res.json({
               "status": 201,
               "data":[],
               "message":"مدخل عملة الرمزية  غير سارية العمل"
             });
    }
    var access_token = req.body.access_token;
    var game_id      = req.body.game_id;

    //check valid game request
    const gameQuery = await db.query("SELECT * FROM gc_game WHERE id=$1", [game_id]);
    if(gameQuery.rows.length == 0){
      return res.json({"status": 201, "data":{},"message": "بطاقة هوية ( id ) للعبة غير سارية العمل" });
    }
    const gameObj=gameQuery.rows[0];
   

    const question = await db.query("SELECT gc_question.*,gc_game_result.gc_game_id as game_id FROM gc_game_result JOIN gc_question ON gc_game_result.question_id=gc_question.id WHERE gc_game_result.gc_game_id=$1", [game_id]);
    var questionArr=question.rows;
    console.log(questionArr); 
    return res.json({
               "status": 200,
               "data":questionArr,
               "message":"success"
             });
  }
  else{
     return res.json({"status": 403, "data":{},"message": "المعلمات المطلوبة مفقودة" });
  }

});

async function sortRankByValue(map)
{
    var tupleArray = [];
    for (var key in map) tupleArray.push([key, map[key]]);
    tupleArray.sort(function (a, b) { return a[1] - b[1] });
    return tupleArray;
}


async function isValidToken(access_token){
   const results = await db.query("SELECT * FROM users WHERE access_token=$1", [access_token]);
    if(results.rows.length > 0)
      {
        return true;
     }
     else{
        return false;
     }
}

//fundtion for update points
async function pointSystem(user_id, getPoints, competition_type,category_id=0,header_id=0){
  const points = await db.query("SELECT id, user_id, points, competition_type FROM user_points WHERE user_id=$1 and competition_type=$2 and category_id=$3 and header_id=$4", [user_id, competition_type,category_id,header_id]);
  var pointsObj = points.rows;
  // IF A USER ISN'T FOUND
  if (typeof points.rows !== 'undefined' && points.rows.length == 0) { console.log('insert', competition_type)
    await db.query("INSERT INTO user_points (user_id, points, competition_type,category_id,header_id) VALUES ($1,$2,$3,$4,$5) RETURNING *",
          [user_id, getPoints, competition_type,category_id,header_id]
          );
  }else{ console.log('update', competition_type+' '+ pointsObj[0].points);
  var updatedPoints = pointsObj[0].points+getPoints;
    await db.query("update user_points set points=$1 where user_id=$2 and competition_type=$3 and category_id=$4 and header_id=$5 RETURNING *",
          [updatedPoints, user_id, competition_type, category_id, header_id]
          );
  }
}

//for league
async function leaguePointSystem(user_id, getPoints, competition_type){
  if(competition_type == 'daily'){
    competitionType = 'daily_competition';
  }else if(competition_type == 'special'){
    competitionType = 'special_competition';
  }else if(competition_type == 'league_competition'){
    competitionType = 'league_competition';
  }else{
    competitionType = competition_type;
  }
  const points = await db.query("SELECT id, user_id, points, competition_type FROM user_points WHERE user_id=$1 and competition_type=$2", [user_id, competitionType]);
  var pointsObj = points.rows;
  // IF A USER ISN'T FOUND
  if (typeof points.rows !== 'undefined' && points.rows.length == 0) { 
    console.log('insert', competitionType)
    await db.query("INSERT INTO user_points (user_id, points, competition_type) VALUES ($1,$2,$3) RETURNING *",
          [user_id, getPoints, competitionType]
          );
  }else{ console.log('update', competitionType+' '+ pointsObj[0].points);
  var updatedPoints = pointsObj[0].points+getPoints;
    await db.query("update user_points set points=$1 where user_id=$2 and competition_type=$3 RETURNING *",
          [updatedPoints, user_id, competitionType]
          );
  }
}
