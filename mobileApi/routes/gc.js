const express = require("express");
const router = express.Router();
const db = require("../db");
const transport = require("../config/smtp.js");
const common = require("../config/common.js");

//fcm
var FCM = require('fcm-node');
var serverKey = common.fcmServerKey(); //put your server key here
var fcm = new FCM(serverKey);


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


///get all categories and header 
router.get("/get_header_categories/:access_token", async function(req, res, next) {
  //####check is valid access_token#####
  const isTrue= await isValidToken(req.params.access_token);
  if(!isTrue){
         return res.json({
             "status": 201,
             "data":[],
             "message":"رمز الدخول غير صالح"
           });
  }

  try { 
    const question = await db.query("SELECT category_group_relation.*, category_group.title, category_group.icon FROM category_group_relation JOIN category_group ON category_group_relation.category_group_id::integer=category_group.id ");
     		var questionObj = question.rows;

     		var result = [];
		    for(var i =0; i< questionObj.length; i++){
		    	var category_ids = JSON.parse(questionObj[i].category_ids);
		    	//console.log(category_ids);
		    	for(var j =0; j< category_ids.length; j++){
			    	var categoriesArr = await db.query("SELECT id , icon FROM categories WHERE id = $1", [category_ids[j].id]);
			    	var categoryObj = categoriesArr.rows;
			    	//console.log(categoryObj);
            if(categoryObj.lengtgh > 0) {
			    	  category_ids[j].category_icon = categoryObj[0].icon;
            }
			    }
		    	var ress = {id: questionObj[i].id,title: questionObj[i].title, icon : questionObj[i].icon, categories: category_ids};
		    	result.push(ress);
		    }
     		//console.log(changeObj);
     		
        return res.json({
         	"status": 200,
         	'data':result,
        });

  	} catch (err) {
    	return next(err);
  	}
});

///get question by game_id
router.post('/get_question_by_game', async function (req, res,next) {

  if(req.body.access_token && req.body.game_id)
  {
    const isTrue= await isValidToken(req.body.access_token);
    if(!isTrue){
           return res.json({
               "status": 201,
               "data":[],
               "message":"رمز الدخول غير صالح"
             });
    }
    var access_token = req.body.access_token;
    var game_id      = req.body.game_id;

    //check valid game request
    const gameQuery = await db.query("SELECT * FROM gc_game WHERE id=$1", [game_id]);
    if(gameQuery.rows.length == 0){
      return res.json({"status": 201, "data":{},"message": "رمز اللعبة ( id ) غير ساري " });
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

///search user
router.post('/search_users', async function (req, res,next) {

  if(req.body.access_token && req.body.username && req.body.user_id)
  {
    var access_token = req.body.access_token;
    var user_id      = req.body.user_id;
    var username     = req.body.username;
    var upercase_uname= username.charAt(0).toUpperCase() + username.slice(1);
    const isTrue= await isValidToken(access_token);
    if(!isTrue){
           return res.json({
               "status": 201,
               "data":[],
               "message":"رمز الدخول غير صالح"
             });
    }
   
    const userQuery = await db.query("SELECT id,username,first_name,last_name,email,user_avatar,user_level,level_title FROM users WHERE (role_id=$1 AND status=$2 AND id!=$3) AND (username LIKE $4 OR username LIKE $5)", ['5','1',user_id,'%' + username + '%','%' + upercase_uname + '%']);
    
    const userObj   =userQuery.rows;
   
    return res.json({
               "status": 200,
               "data":userObj,
               "message":"success"
             });
  }
  else{
     return res.json({"status": 403, "data":{},"message": "المعلمات المطلوبة مفقودة" });
  }

});

///invite user fto join game
router.post('/invite_user', async function (req, res,next) {

  if(req.body.category_id && req.body.header_id && req.body.user_id && req.body.access_token)
  {
    var data =req.body; 
    var category_id     = data['category_id'];
    var user_id         = data['user_id'];
    var header_id       = data['header_id'];
    var access_token    = data['access_token'];
    var invited_user_id = data['invited_user_id'];

    var req_type     = '2';
    var opponent_type= 'human'
    var rand_game_id =  Math.floor(1000 + Math.random() * 9000);
    //(Math.random()+1).toString(36).slice(2, 18);
    var game_id=0;

    const isTrue= await isValidToken(access_token);
    if(!isTrue){
           return res.json({
               "status": 201,
               "data":[],
               "message":"رمز الدخول غير صالح"
             });
    }
   
    const results = await db.query("SELECT * FROM gc_game WHERE header_id=$1 and category_id=$2 and req_type=$3 and status=$4 and created_by=$5", [header_id,category_id,req_type,'0',user_id]);
    const gameObj=results.rows[0];
   
    if(results.rows.length > 0)
    {
      const existingGameId = gameObj.id;
      const invitResults = await db.query("SELECT * FROM gc_invite_users WHERE gc_game_id=$1 and created_by=$2 and status!=$3", [existingGameId,user_id,'3']);
      const invitChkUser = await db.query("SELECT * FROM gc_invite_users WHERE gc_game_id=$1 and user_id=$2 and status!=$3", [existingGameId,invited_user_id,'3']);
      
      if(invitChkUser.rows.length >= 1)
      {
        return res.json({
               "status": 201,
               "data":{},
               "message":"لقد قمت بدعوة هذا المستخدم بالفعل"
             });
      }

      if(invitResults.rows.length >= 4)
      {
        return res.json({
               "status": 201,
               "data":{},
               "message":"لقمد قمت بدعوة أربعة مستخدمين بالفعل"
             });
      }
      //update invite table
      const invite = await db.query("INSERT INTO gc_invite_users (gc_game_id,user_id,status,created_by) VALUES ($1,$2,$3,$4) RETURNING *",
           [existingGameId,invited_user_id,'0',user_id]
           );

      game_id= existingGameId;
    }
    else
    {
      const insertGame = await db.query("INSERT INTO gc_game (header_id, category_id, req_type, user_id,status, created_by,game_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
           [header_id, category_id, req_type, user_id,'0',user_id,rand_game_id]
           );
      const newlyCreatedGameId = insertGame.rows[0].id;

      const invite = await db.query("INSERT INTO gc_invite_users (gc_game_id,user_id,status,created_by) VALUES ($1,$2,$3,$4) RETURNING *",
           [newlyCreatedGameId,invited_user_id,'0',user_id]
           );

      game_id= newlyCreatedGameId;
    }

    const catQ   = await db.query("SELECT * FROM categories WHERE id=$1", [category_id]);
    const headQ  = await db.query("SELECT * FROM category_group WHERE id=$1", [header_id]);
    const catObj = catQ.rows[0];
    const headObj= headQ.rows[0];
    const push_title = 'لقد تمت دعوتك للعب في مسابقة عامة جديدة في قسم '+headObj.title+' و فرع  '+catObj.title;
    //const push_title= 'للقد تمت '+headObj.title+' وفرع'+catObj.title;
    const push_body = 'لقد تمت دعوتك للعب في مسابقة عامة جديدة في قسم '+headObj.title+' و فرع  '+catObj.title; 
    const push_type =  'gc_invite_user';
    //update notification table
    const notify = await db.query("INSERT INTO notification (module,type,title,payload,sent_to,status,created_by,ref_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
           ['gc',push_type,push_title,push_body,invited_user_id,'0',user_id,game_id]
           );

    //////////////FCM/////////////
    //registration_ids
    const deviceQuery = await db.query("SELECT * FROM device WHERE user_id=$1", [invited_user_id]);
    var regTokens=[];
   
    for(var i =0; i< deviceQuery.rows.length; i++){
      var questionObj=deviceQuery.rows[i];
      regTokens.push(questionObj.device_token);
    }
    var message = { 
       // to: '', 
       registration_ids:regTokens,
        collapse_key: 'green',
        
        notification: {
            title: push_title, 
            body: push_body,
            badge : 1,
            sound:'default',
        },
        
        data: {  
            "gc_invite_user":{
                  "game_id": game_id,
                  "sender_id": user_id,
                  "user_id":invited_user_id,
                  "title": push_title
            }
        }
    };
    
    fcm.send(message, function(err, response){
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });

    /////////END FCM/////////////
   
    return res.json({
               "status": 200,
               "data":{"game_id":game_id,"invited_user_id":invited_user_id,"host_user_id":user_id},
               "message":"تمت دعوة المستخدم بنجاح."
             });
  }
  else{
     return res.json({"status": 403, "data":{},"message": "المعلمات المطلوبة مفقودة" });
  }

});


//get notification
router.post('/get_notification', async function (req, res,next) {

  if(req.body.access_token && req.body.user_id)
  {
    var access_token = req.body.access_token;
    var user_id      = req.body.user_id;
    const isTrue= await isValidToken(access_token);
    if(!isTrue){
           return res.json({
               "status": 201,
               "data":[],
               "message":"رمز الدخول غير صالح"
             });
    }
   
    const notyQuery = await db.query("SELECT * FROM notification WHERE sent_to=$1 order by id desc",[user_id]);
    
    const notyObj   =notyQuery.rows;
   
    return res.json({
               "status": 200,
               "data":notyObj,
               "message":"success"
             });
  }
  else{
     return res.json({"status": 403, "data":{},"message": "المعلمات المطلوبة مفقودة" });
  }

});

//get acceptInvitation
router.post('/accept_invitation', async function (req, res,next) {

  if(req.body.access_token && req.body.user_id && req.body.game_id && req.body.notify_id)
  {
    var access_token = req.body.access_token;
    var user_id      = req.body.user_id;
    var game_id      = req.body.game_id;
    var notify_id    = req.body.notify_id;
    var accept_flag  = req.body.accept_flag;
    const isTrue= await isValidToken(access_token);
    if(!isTrue){
           return res.json({
               "status": 201,
               "data":{},
               "message":"رمز الدخول غير صالح"
             });
    }

    //check if already accepted
    const ifAceptGame = await db.query("SELECT * FROM gc_invite_users WHERE status=$1 AND gc_game_id=$2 AND user_id=$3",['0',game_id,user_id]);
    if(ifAceptGame.rows.length == 0)
    {
       return res.json({
               "status": 201,
               "data":{},
               "message":"أنت بالفعل قمت بالإنضمام أو تجاهل المسابقة"
             });
    }

    //check if game already started
    const results = await db.query("SELECT * FROM gc_game WHERE id=$1", [game_id]);   
    if(results.rows.length == 0)
    {
       return res.json({
               "status": 201,
               "data":{},
               "message":"بطاقة هوية ( id ) للعبة غير سارية العمل"
             });
    }
    const gameObj=results.rows[0];
    if(gameObj.status != 0)
    {
       return res.json({
               "status": 201,
               "data":{},
               "message":"لقد بدأت اللعبة  بالفعل أو انتهت"
             });
    }
   
    var opponent_col='first_opponent_id';
    var status='0';
    if(gameObj.first_opponent_id=='' || gameObj.first_opponent_id==null){
      opponent_col='first_opponent_id';
    }
    else if(gameObj.second_opponent_id=='' || gameObj.second_opponent_id==null){
      opponent_col='second_opponent_id';
    }
    else if(gameObj.third_opponent_id=='' || gameObj.third_opponent_id==null){
      opponent_col='third_opponent_id';
    }
    else if(gameObj.fourth_opponent_id=='' || gameObj.fourth_opponent_id==null){
      opponent_col='fourth_opponent_id';
    }
    else{
      //no action
    }
    var response_message="تم رفض طلبك من قبل المستخدم";
    var push_title= 'تم رفض طلبك من قبل المستخدم';
    var push_body = 'تم رفض طلبك من قبل المستخدم'; 
    var push_type = 'gc_decline_user';
    var user_accept_status=2; //for decline
    if(accept_flag ==1)
    {
      const update = await db.query("UPDATE gc_game SET "+opponent_col+"=$1 WHERE id=$2",[user_id,game_id]);
      const catQ   = await db.query("SELECT * FROM categories WHERE id=$1", [gameObj.category_id]);
      const headQ  = await db.query("SELECT * FROM category_group WHERE id=$1", [gameObj.header_id]);
      const catObj = catQ.rows[0];
      const headObj= headQ.rows[0];
      //response_message ='تم قبول دعوتك للعب في المسابقة العامة في قسم  '+headObj.title+' و فرع  '+catObj.title+' بواسطة المستخدم';

      response_message='تم قبول دعوتك للعب في المسابقة العامة في قسم  '+headObj.title+' و فرع  '+catObj.title+' بواسطة المستخدم';
      push_title= 'تم قبول دعوتك للعب في المسابقة العامة في قسم  '+headObj.title+' و فرع  '+catObj.title+' بواسطة المستخدم';
      push_body = 'تم قبول دعوتك للعب في المسابقة العامة في قسم  '+headObj.title+' و فرع  '+catObj.title+' بواسطة المستخدم'; 
      push_type = 'gc_accepted_user';
      user_accept_status='1';
    }

    const updateUInvite = await db.query("UPDATE gc_invite_users SET status=$1 WHERE gc_game_id=$2 AND user_id=$3",[user_accept_status,game_id,user_id]);
    const updateNoty = await db.query("UPDATE notification SET status=$1 WHERE id=$2",[ user_accept_status,notify_id]);
    const insertnNoty = await db.query("INSERT INTO notification (module,type,title,payload,sent_to,status,created_by,ref_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
           ['gc',push_type,push_title,push_body,gameObj.user_id,'0',user_id,game_id]
           );

    //////////////FCM/////////////
    //registration_ids
    const deviceQuery = await db.query("SELECT * FROM device WHERE user_id=$1", [gameObj.user_id]);
    var regTokens=[];
   
    for(var i =0; i< deviceQuery.rows.length; i++){
      var questionObj=deviceQuery.rows[i];
      regTokens.push(questionObj.device_token);
    }
    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
        //to: 'd44AWiJJT0hEsqu7yJsGSs:APA91bEUxzX2DosIbWHLGRMf9xvjVWylI2SwRf-K_a0zOrxHqoLK_wfFa4MgKM-J5m9cLFRCQFB_LOVAX0JQeZBFQ59LPie8DBdib70AzDmWqNsqOsNLDxYxgJhMEyLFwSTKMJDIzNCD', 
        registration_ids:regTokens,
        collapse_key: 'green',
        
        notification: {
            title: push_title, 
            body: push_body,
            badge : 1,
            sound:'default', 
        },
        
        data: {  
            "gc_game_response":{
                  "game_id": game_id,
                  "sender_id": user_id,
                  "user_id":gameObj.created_by,
                  "status":push_type,
                  "title": push_title
            }
        }
    };
    
    fcm.send(message, function(err, response){
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });

    /////////END FCM/////////////
   
    return res.json({
               "status": 200,
               "data":{"game_id":game_id},
               "message":response_message
             });
  }
  else{
     return res.json({"status": 403, "data":{},"message": "المعلمات المطلوبة مفقودة" });
  }

});

//get user by game 
router.post('/get_player_by_game', async function (req, res,next) {

  if(req.body.access_token && req.body.game_id)
  {
    var access_token = req.body.access_token;
    var game_id      = req.body.game_id;
    const isTrue= await isValidToken(access_token);
    if(!isTrue){
           return res.json({
               "status": 201,
               "data":[],
               "message":"رمز الدخول غير صالح"
             });
    }
    const gQuery     = await db.query("SELECT * FROM gc_game WHERE id=$1", [game_id]);
    const gObjNew    = gQuery.rows[0];
    var host_user_id = gObjNew.user_id;
   
    const resQ  = await db.query("SELECT users.* FROM gc_game g INNER JOIN users ON g.user_id=users.id WHERE g.id=$1",[game_id]);
    const user1Result= resQ.rows[0];
    const gameQuery = await db.query("SELECT gis.gc_game_id as game_id,gis.status as accept_status,users.user_level,users.id as user_id,users.first_name,users.last_name,users.email,users.user_avatar,users.username FROM gc_invite_users gis INNER JOIN users ON gis.user_id=users.id WHERE gis.gc_game_id=$1",[game_id]);
    const gameObj   = gameQuery.rows;

    var finalUserArr=[];

    gameObj.push({"game_id":game_id,"accept_status":"1","email":user1Result.email,"user_id":user1Result.id,"first_name":user1Result.first_name,"last_name":user1Result.last_name,"user_avatar":user1Result.user_avatar,"user_level":user1Result.user_level,"username":user1Result.username});
   
    return res.json({
               "status": 200,
               "data":{"users":gameObj,"host_user_id":host_user_id,"start_time":'30'},
               "message":"success"
             });
  }
  else{
     return res.json({"status": 403, "data":{},"message": "المعلمات المطلوبة مفقودة" });
  }

});

//get start game 
router.post('/start_game', async function (req, res,next) {

  if(req.body.access_token && req.body.game_id && req.body.user_id)
  {
    var access_token = req.body.access_token;
    var game_id      = req.body.game_id;
    var user_id      = req.body.user_id;
    const isTrue= await isValidToken(access_token);
    if(!isTrue){
           return res.json({
               "status": 201,
               "data":[],
               "message":"رمز الدخول غير صالح"
             });
    }
   
    const gameQuery = await db.query("SELECT * FROM gc_game WHERE id=$1", [game_id]);
    const gameObjNew   = gameQuery.rows[0];
    var header_id      = gameObjNew.header_id;
    var category_id    = gameObjNew.category_id;
    var host_user_id   = gameObjNew.user_id;
    // header_id  =1; //dummy
    // category_id=1;//dummy
    //check game status
   if(gameObjNew.status != 1)
    {
       return res.json({
               "status": 201,
               "data":{},
               "message":"لقد بدأت اللعبة  بالفعل أو انتهت"
             });
    }

    //if creted game
    const checkGame = await db.query("SELECT * FROM gc_game_result WHERE gc_game_id=$1", [game_id]);
    
    if(checkGame.rows.length==0)
    {
      const question = await db.query("SELECT * FROM gc_question WHERE status=$1 AND header_id=$2 AND category_id=$3 order by random() LIMIT 10", ['1',header_id,category_id]);
      var questionArr=question.rows; 
      for(let i=0;i<questionArr.length;i++)
      {
        let questionObj = questionArr[i];
        var insert = await db.query("INSERT INTO gc_game_result (gc_game_id,question_id,correct_answer,first_user_id,second_user_id,third_user_id,fourth_user_id,fifth_user_id,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
        [game_id, questionObj.id, questionObj.answer, gameObjNew.user_id,gameObjNew.first_opponent_id,gameObjNew.second_opponent_id,gameObjNew.third_opponent_id,gameObjNew.fourth_opponent_id,user_id]
         );
      }

      //update game status
      const updateGame = await db.query("UPDATE gc_game SET status=$1 WHERE id=$2",['1',game_id]);
    }

    const gameQuesQuery = await db.query("SELECT gc_question.*,gc_game_result.gc_game_id as game_id FROM gc_game_result JOIN gc_question ON gc_game_result.question_id=gc_question.id WHERE gc_game_result.gc_game_id=$1", [game_id]);
    var gameQuesObj=gameQuesQuery.rows;

    const gUserQuery = await db.query("SELECT gis.gc_game_id as game_id,gis.status as accept_status,users.user_level,users.id as user_id,users.username,users.first_name,users.last_name,users.email,users.user_avatar FROM gc_invite_users gis INNER JOIN users ON gis.user_id=users.id WHERE gis.gc_game_id=$1 AND gis.status=$2",[game_id,'1']);
    const gUserObj   = gUserQuery.rows;

    const resQ  = await db.query("SELECT users.* FROM gc_game g INNER JOIN users ON g.user_id=users.id WHERE g.id=$1",[game_id]);
    const user1Result= resQ.rows[0];

    gUserObj.push({"game_id":game_id,"accept_status":"1","email":user1Result.email,"user_id":user1Result.id,"first_name":user1Result.first_name,"last_name":user1Result.last_name,"user_avatar":user1Result.user_avatar,"user_level":user1Result.user_level,"username":user1Result.username});
   
    
    return res.json({
               "status": 200,
               "data":{"users":gUserObj,"question":gameQuesObj,"host_user_id":host_user_id},
               "message":"success"
             });
  }
  else{
     return res.json({"status": 403, "data":{},"message": "المعلمات المطلوبة مفقودة" });
  }

});


/*
*********************************
* Function for save user answer
*********************************
*/

router.post("/save_answer", async function(req, res, next) {
  
  if(req.body.access_token && req.body.user_id && req.body.game_id && req.body.answer)
  {
    var answerArr       = req.body.answer;
    var user_id         = req.body.user_id;
    var game_id         = req.body.game_id;
    var access_token    = req.body.access_token;

    //####check is valid access_token#####
      const isTrue= await isValidToken(req.body.access_token);
      if(!isTrue){
             return res.json({
                 "status": 201,
                 "data":{},
                 "message":"رمز الدخول غير صالح"
               });
      }
      try {

        for(let i=0;i<answerArr.length;i++)
        {
          let answerObj     = answerArr[i];
          var user_answer   = answerObj.user_answer;
          var question_id   = answerObj.question_id;
          var taken_time    = answerObj.taken_time;
          var gameQuery     = await db.query("SELECT * FROM gc_game WHERE id=$1", [game_id]);
          var questionQuery = await db.query("SELECT * FROM gc_game_result WHERE gc_game_id=$1 AND question_id=$2", [game_id,question_id]);
          var gameObj       = gameQuery.rows[0];
          var questionObj   = questionQuery.rows[0];
          var result_id     = questionObj.id;
          ////////////////////////////////////
          var user_answer_col     ='';
          var user_time_taken_col ='';
          if(user_id==questionObj.first_user_id)
          {
            user_answer_col    ='first_user_answer';
            user_time_taken_col='first_user_taken_time';
          } 
          else if(user_id==questionObj.second_user_id)
          {
            user_answer_col    ='second_user_answer';
            user_time_taken_col='second_user_taken_time';
          }  
          else if(user_id==questionObj.third_user_id)
          {
            user_answer_col    ='third_user_answer';
            user_time_taken_col='third_user_taken_time';
          }  
          else if(user_id==questionObj.fourth_user_id)
          {
            user_answer_col    ='fourth_user_answer';
            user_time_taken_col='fourth_user_taken_time';
          }  
          else if(user_id==questionObj.fifth_user_id)
          {
            user_answer_col    ='fifth_user_answer';
            user_time_taken_col='fifth_user_taken_time';
          } 

          const updateResult = await db.query("UPDATE gc_game_result SET "+user_answer_col+"=$1,"+user_time_taken_col+"=$2 WHERE id=$3",
          [user_answer, taken_time,result_id]
          );

          ////////////////////////////////////
        }

        return res.json({
             "status": 200,
             "data": {"game_id":game_id},
             "message":"تم حفظ البيانات بنجاح"
           });

    } catch (err) {
      return next(err);
    }
  }
  else{
     return res.json({"status": 403, "data":{},"message": "المعلمات المطلوبة مفقودة" });
  }
});


/*
**************************************************
* Function for calculate result & leader board api
**************************************************
*/

router.post("/leaderboard", async function(req, res, next) {
  
  //await sleep(10000); // sleep for 1s/1000ms

  if(req.body.access_token && req.body.user_id && req.body.game_id)
  {
    var user_id         = req.body.user_id;
    var game_id         = req.body.game_id;
    var access_token    = req.body.access_token;

    //####check is valid access_token#####
      const isTrue= await isValidToken(req.body.access_token);
      if(!isTrue){
             return res.json({
                 "status": 201,
                 "data":{},
                 "message":"رمز الدخول غير صالح"
               });
      }
      try {

        const gQuery = await db.query("SELECT * FROM gc_game WHERE id=$1", [game_id]);
        const gObj    = gQuery.rows[0];

        if(gObj.status==1) //calculate result
        { 
          const resultQuery    = await db.query("SELECT * FROM gc_game_result WHERE gc_game_id=$1", [game_id]);
          let resultObj        = resultQuery.rows;
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
          let default_score    = 5;

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
          }
          //score & rank calculation
          var rankOneUId     =0;
          var rankTwoUId     =0;
          var rankThreeUId   =0;
          var rankFourthUId  =0;
          var rankFifthUId   =0;
          var rankOneScore   =0;
          var rankTwoScore   =0;
          var rankThreeScore =0;
          var rankFourthScore=0;
          var rankFifthScore =0;
          var newRUArr=[]
          if(first_user_id!=null){
            newRUArr.push({'user_score':first_user_score,'user_id':first_user_id});
          }
          if(second_user_id!=null){
            newRUArr.push({'user_score':second_user_score,'user_id':second_user_id});
          }
          if(third_user_id!=null){
            newRUArr.push({'user_score':third_user_score,'user_id':third_user_id});
          }
          if(fourth_user_id!=null){
            newRUArr.push({'user_score':fourth_user_score,'user_id':fourth_user_id});
          }
          if(fifth_user_id!=null){
            newRUArr.push({'user_score':fifth_user_score,'user_id':fifth_user_id});
          }
          var sortedRank = newRUArr.sort(function(a, b) {
            return  b.user_score-a.user_score;
          });
          console.log(sortedRank);
          for(let rj=0;rj<sortedRank.length;rj++)
          {
            var topUser = sortedRank[rj];
            if(rj==0){
              rankOneUId       =topUser['user_id'];
              rankOneScore     =topUser['user_score'];
            }
            if(rj==1){
              rankTwoUId       =topUser['user_id'];
              rankTwoScore     =topUser['user_score'];
            }
            if(rj==2){
              rankThreeUId     =topUser['user_id'];
              rankThreeScore   =topUser['user_score'];
            }
            if(rj==3){
              rankFourthUId    =topUser['user_id'];
              rankFourthScore  =topUser['user_score'];
            }
            if(rj==4){
              rankFifthUId     =topUser['user_id'];
              rankFifthScore   =topUser['user_score'];
            }
          }

          const uGameR = await db.query("UPDATE gc_game SET first_rank_user_id=$1,second_rank_user_id=$2,third_rank_user_id=$3, fourth_rank_user_id=$4, fifth_rank_user_id=$5, first_rank_score=$6,second_rank_score=$7,third_rank_score=$8, fourth_rank_score=$9, fifth_rank_score=$10, status=$11 WHERE id=$12",
            [rankOneUId,rankTwoUId, rankThreeUId,rankFourthUId,rankFifthUId,rankOneScore,rankTwoScore, rankThreeScore,rankFourthScore,rankFifthScore,'2',game_id]
            );
        }
        //return result
        const gFinalQuery = await db.query("SELECT * FROM gc_game WHERE id=$1", [game_id]);
        const gFinalObj    = gFinalQuery.rows[0];


        var finalUserArr=[];

        if(gFinalObj.first_rank_user_id){
          const user1ResultQ = await db.query("SELECT * FROM users WHERE id=$1", [gFinalObj.first_rank_user_id]);
          const user1Result =user1ResultQ.rows[0];
          finalUserArr.push({"user_id":user1Result.id,"username":user1Result.username,"avatar":user1Result.user_avatar,"level":user1Result.user_level,"country":user1Result.country,"score":gFinalObj.first_rank_score,"rank":'1'});
        }
        if(gFinalObj.second_rank_user_id){
          const user2ResultQ = await db.query("SELECT * FROM users WHERE id=$1", [gFinalObj.second_rank_user_id]);
          const user2Result  = user2ResultQ.rows[0];
          finalUserArr.push({"user_id":user2Result.id,"username":user2Result.username,"avatar":user2Result.user_avatar,"level":user2Result.user_level,"country":user2Result.country,"score":gFinalObj.second_rank_score,"rank":'2'});
        }
        if(gFinalObj.third_rank_user_id){
          const user3ResultQ = await db.query("SELECT * FROM users WHERE id=$1", [gFinalObj.third_rank_user_id]);
          const user3Result  = user3ResultQ.rows[0];
          finalUserArr.push({"user_id":user3Result.id,"username":user3Result.username,"avatar":user3Result.user_avatar,"level":user3Result.user_level,"country":user3Result.country,"score":gFinalObj.third_rank_score,"rank":'3'});
        }
        if(gFinalObj.fourth_rank_user_id){
          const user4ResultQ = await db.query("SELECT * FROM users WHERE id=$1", [gFinalObj.fourth_rank_user_id]);
          const user4Result  = user4ResultQ.rows[0];
          finalUserArr.push({"user_id":user4Result.id,"username":user4Result.username,"avatar":user4Result.user_avatar,"level":user4Result.user_level,"country":user4Result.country,"score":gFinalObj.fourth_rank_score,"rank":'4'});
        }
        if(gFinalObj.fifth_rank_user_id){
          const user5ResultQ = await db.query("SELECT * FROM users WHERE id=$1", [gFinalObj.fifth_rank_user_id]);
          const user5Result  = user5ResultQ.rows[0];
          finalUserArr.push({"user_id":user5Result.id,"username":user5Result.username,"avatar":user5Result.user_avatar,"level":user5Result.user_level,"country":user5Result.country,"score":gFinalObj.fifth_rank_score,"rank":'5'});
        }
        ////update point ////////////////
        var category_id = gFinalObj.category_id;
        var header_id   = gFinalObj.header_id;
        var player_user_id=user_id;
        var player_user_score=0;
        if(gFinalObj.first_rank_user_id==user_id){
          player_user_score = gFinalObj.first_rank_score;
        }
        else if(gFinalObj.second_rank_user_id==user_id){
          player_user_score = gFinalObj.second_rank_score;
        }
        else if(gFinalObj.third_rank_user_id==user_id){
          player_user_score = gFinalObj.third_rank_score;
        }
        else if(gFinalObj.fourth_rank_user_id==user_id){
          player_user_score = gFinalObj.fourth_rank_score;
        }
        else if(gFinalObj.fifth_rank_user_id==user_id){
          player_user_score = gFinalObj.fifth_rank_score;
        }
        else{
          //no action
        }
        var points = player_user_score;
        competition_type = 'gc';
        pointSystem(user_id, points, competition_type,category_id,header_id);
       
        ///////summery/////////////////////////
        const summeryQ = await db.query("SELECT gcq.* ,ggr.first_user_id,ggr.second_user_id,ggr.third_user_id,ggr.fourth_user_id,ggr.fifth_user_id,ggr.first_user_answer,ggr.second_user_answer,ggr.third_user_answer,ggr.fourth_user_answer,ggr.fifth_user_answer FROM gc_game_result ggr INNER JOIN gc_question gcq ON ggr.question_id::integer=gcq.id WHERE ggr.gc_game_id=$1", [game_id]);
         let questionObj     = summeryQ.rows;
            var summeryArr      = [];
            for(let i=0;i<questionObj.length;i++)
            {
              let qObj     = questionObj[i];
              let given_user_answer='na';
             
              if(gFinalObj.first_user_id==user_id){
                given_user_answer = gFinalObj.first_user_answer;
              }
              else if(gFinalObj.second_user_id==user_id){
                given_user_answer = gFinalObj.second_user_answer;
              }
              else if(gFinalObj.third_user_id==user_id){
                given_user_answer = gFinalObj.third_user_answer;
              }
              else if(gFinalObj.fourth_user_id==user_id){
                given_user_answer = gFinalObj.fourth_user_answer;
              }
              else if(gFinalObj.fifth_user_id==user_id){
                given_user_answer = gFinalObj.fifth_user_answer;
              }
              qObj['user_answer'] =given_user_answer;

              summeryArr.push(qObj);
            }
        ///////////////////////////////////////
        return res.json({ "status": 200, "data":{'game_id':game_id,"users":finalUserArr,"question":summeryArr,'message':'Success'}});
    } catch (err) {
      return next(err);
    }
  }
  else{
     return res.json({"status": 403, "data":{},"message": "المعلمات المطلوبة مفقودة" });
  }
});


/*
**************************************************
* Function for Create room
**************************************************
*/

router.post('/create_room', async function (req, res,next) {

  if(req.body.category_id && req.body.header_id && req.body.user_id && req.body.access_token)
  {
    var data =req.body; 
    var category_id     = data['category_id'];
    var user_id         = data['user_id'];
    var header_id       = data['header_id'];
    var access_token    = data['access_token'];

    var req_type     = '2';
    var opponent_type= 'human'
    var rand_game_id = Math.floor(1000 + Math.random() * 9000);
    //console.log(val); // (Math.random()+1).toString(36).slice(2, 18);
    var game_id      =0;

    const isTrue= await isValidToken(access_token);
    if(!isTrue){
           return res.json({
               "status": 201,
               "data":[],
               "message":"رمز الدخول غير صالح"
             });
    }
   
    const results = await db.query("SELECT * FROM gc_game WHERE header_id=$1 and category_id=$2 and req_type=$3 and status=$4 and created_by=$5", [header_id,category_id,req_type,'0',user_id]);
    const gameObj=results.rows[0];
   
    if(results.rows.length > 0)
    {
      game_id     = gameObj.id;
      rand_game_id= gameObj.game_id;
      return res.json({
               "status": 200,
               "data":{"room_id":game_id,"room_code":rand_game_id,'host_user_id':gameObj.user_id},
               "message":"تم  إنشاؤ الغرفة  بالفعل"
             });
    }
    else
    {
      const insertGame = await db.query("INSERT INTO gc_game (header_id, category_id, req_type, user_id,status, created_by,game_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
           [header_id, category_id, req_type, user_id,'0',user_id,rand_game_id]
           );
      const newlyCreatedGameId = insertGame.rows[0].id;
      game_id= newlyCreatedGameId;
      return res.json({
               "status": 200,
               "data":{"room_id":game_id,"room_code":rand_game_id,'host_user_id':user_id},
               "message":"تم إنشاء الغرفة بنجاح"
             });
    }
   
  }
  else{
     return res.json({"status": 403, "data":{},"message": "المعلمات المطلوبة مفقودة" });
  }

});

/*
**************************************************
* Function for Join Room
**************************************************
*/
router.post('/join_room', async function (req, res,next) {

  if(req.body.access_token && req.body.user_id && req.body.room_id)
  {
    var access_token = req.body.access_token;
    var user_id      = req.body.user_id;
    var room_id      =req.body.room_id;

    const isTrue= await isValidToken(access_token);
    if(!isTrue){
           return res.json({
               "status": 201,
               "data":{},
               "message":"رمز الدخول غير صالح"
             });
    }

    //if game started
    const results = await db.query("SELECT * FROM gc_game WHERE game_id=$1", [room_id]);
    
    if(results.rows.length == 0)
    {
       return res.json({
               "status": 201,
               "data":{},
               "message":"بطاقة الغرفة غير صالح"
             });
    }
    const gameObj=results.rows[0];
   console.log(gameObj);
    if(gameObj.status != 0)
    {
       return res.json({
               "status": 201,
               "data":{},
               "message":"لقد بدأت اللعبة  بالفعل أو انتهت"
             });
    }

    var game_id = gameObj.id;
    //check if already accepted
    const ifAceptGame = await db.query("SELECT * FROM gc_invite_users WHERE status=$1 AND gc_game_id=$2 AND user_id=$3",['1',game_id,user_id]);
    if(ifAceptGame.rows.length >=1)
    {
       return res.json({
               "status": 201,
               "data":{},
               "message":"أنت بالفعل قمت بالإنضمام أو تجاهل المسابقة"
             });
    }

    var opponent_col='first_opponent_id';
    var status='0';
    if(gameObj.first_opponent_id=='' || gameObj.first_opponent_id==null){
      opponent_col='first_opponent_id';
    }
    else if(gameObj.second_opponent_id=='' || gameObj.second_opponent_id==null){
      opponent_col='second_opponent_id';
    }
    else if(gameObj.third_opponent_id=='' || gameObj.third_opponent_id==null){
      opponent_col='third_opponent_id';
    }
    else if(gameObj.fourth_opponent_id=='' || gameObj.fourth_opponent_id==null){
      opponent_col='fourth_opponent_id';
    }
    else{
      //no action
    }
   
    const update = await db.query("UPDATE gc_game SET "+opponent_col+"=$1 WHERE id=$2",[user_id,game_id]);
    
    const catQ   = await db.query("SELECT * FROM categories WHERE id=$1", [gameObj.category_id]);
    const headQ  = await db.query("SELECT * FROM category_group WHERE id=$1", [gameObj.header_id]);
    const catObj = catQ.rows[0];
    const headObj= headQ.rows[0];
    response_message ='تم قبول دعوتك للعب في المسابقة العامة في قسم  '+headObj.title+' و فرع  '+catObj.title+' بواسطة المستخدم';
    //response_message="دعوتك للعب في المسابقة العامة في قسم  "+headObj.title+" و فرع  "+catObj.title+" تم القبول بواسطة المستخدم";
    push_title='تم قبول دعوتك للعب في المسابقة العامة في قسم  '+headObj.title+' و فرع  '+catObj.title+' بواسطة المستخدم';
    push_body ='تم قبول دعوتك للعب في المسابقة العامة في قسم  '+headObj.title+' و فرع  '+catObj.title+' بواسطة المستخدم'; 
    push_type = 'gc_accepted_user';
    user_accept_status='1';
    
    const updateGame = await db.query("UPDATE gc_game SET "+opponent_col+"=$1 WHERE id=$2",[user_id,game_id]);
    const joinUser = await db.query("INSERT INTO gc_invite_users (gc_game_id,user_id,status,created_by) VALUES ($1,$2,$3,$4) RETURNING *",
           [game_id,user_id,'1',user_id]
           );
    const insertnNoty = await db.query("INSERT INTO notification (module,type,title,payload,sent_to,status,created_by,ref_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
           ['gc',push_type,push_title,push_body,gameObj.user_id,'0',user_id,game_id]
           );
    //////////////FCM/////////////
    //registration_ids
    const deviceQuery = await db.query("SELECT * FROM device WHERE user_id=$1", [gameObj.user_id]);
    var regTokens=[];
   
    for(var i =0; i< deviceQuery.rows.length; i++){
      var questionObj=deviceQuery.rows[i];
      regTokens.push(questionObj.device_token);
    }
    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
        //to: 'd44AWiJJT0hEsqu7yJsGSs:APA91bEUxzX2DosIbWHLGRMf9xvjVWylI2SwRf-K_a0zOrxHqoLK_wfFa4MgKM-J5m9cLFRCQFB_LOVAX0JQeZBFQ59LPie8DBdib70AzDmWqNsqOsNLDxYxgJhMEyLFwSTKMJDIzNCD', 
        registration_ids:regTokens,
        collapse_key: 'green',
        
        notification: {
            title: push_title, 
            body: push_body,
            badge : 1,
            sound:'default', 
        },
        
        data: {  
            "gc_game_response":{
                  "game_id": game_id,
                  "sender_id": user_id,
                  "user_id":gameObj.created_by,
                  "status":push_type,
                  "title": push_title 
            }
        }
    };
    
    fcm.send(message, function(err, response){
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });

    /////////END FCM/////////////
   
    return res.json({
               "status": 200,
               "data":{"game_id":game_id},
               "message":response_message
             });
  }
  else{
     return res.json({"status": 403, "data":{},"message": "المعلمات المطلوبة مفقودة" });
  }

});


//discard game 
router.post('/discard_game', async function (req, res,next) {
  console.log(req.body);
  if(req.body.access_token && req.body.game_id && req.body.user_id)
  {
    var access_token = req.body.access_token;
    var game_id      = req.body.game_id;
    var user_id      = req.body.user_id;
    const isTrue= await isValidToken(access_token);
    if(!isTrue){
           return res.json({
               "status": 201,
               "data":[],
               "message":"رمز الدخول غير صالح"
             });
    }
   
    const gameQuery = await db.query("SELECT * FROM gc_game WHERE id=$1", [game_id]);
    if(gameQuery.rows[0].status==0)
    {
      //update game status
      const updateGame = await db.query("UPDATE gc_game SET status=$1 WHERE id=$2",['3',game_id]); //3 for discard
      const updateNoty = await db.query("UPDATE notification SET status=$1 WHERE module=$2 AND ref_id=$3",['3','gc',game_id]);
      const updateUInvite = await db.query("UPDATE gc_invite_users SET status=$1 WHERE gc_game_id=$2",['3',game_id]);
      console.log('UPDATE gc_invite_users SET status=1 WHERE gc_game_id=2');
    }

    return res.json({
               "status": 200,
               "data":{},
               "message":"تجاهل اللعبة"
             });
  }
  else{
     return res.json({"status": 403, "data":{},"message": "المعلمات المطلوبة مفقودة" });
  }

});

//discard game 
router.post('/discard_game_by_user', async function (req, res,next) {
  console.log(req.body);
  if(req.body.access_token && req.body.user_id)
  {
    var access_token = req.body.access_token;
    var user_id      = req.body.user_id;
    const isTrue= await isValidToken(access_token);
    if(!isTrue){
           return res.json({
               "status": 201,
               "data":[],
               "message":"رمز الدخول غير صالح"
             });
    }
   
    const gameQuery = await db.query("SELECT * FROM gc_game WHERE status=$1 AND user_id=$2", ['0',user_id]);
    var regTokens=[];
   
    for(var i =0; i< gameQuery.rows.length; i++){
      var questionObj=gameQuery.rows[i];
      var game_id = questionObj.id;
      console.log('<<---game id--->>');
      console.log(game_id);
      console.log('<<------------->>');
      if(questionObj.status==0)
      {
        //update game status
        const updateGame = await db.query("UPDATE gc_game SET status=$1 WHERE id=$2",['3',game_id]); //3 for discard
        const updateNoty = await db.query("UPDATE notification SET status=$1 WHERE module=$2 AND ref_id=$3",['3','gc',game_id]);
        const updateUInvite = await db.query("UPDATE gc_invite_users SET status=$1 WHERE gc_game_id=$2",['3',game_id]);
        console.log('UPDATE gc_invite_users SET status=1 WHERE gc_game_id=2');
      }
    }

    

    return res.json({
               "status": 200,
               "data":{},
               "message":"تجاهل اللعبة"
             });
  }
  else{
     return res.json({"status": 403, "data":{},"message": "المعلمات المطلوبة مفقودة" });
  }

});

function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
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



//oto_next_question
router.post('/oto_next_question', async function (req, res,next) {

  if(req.body.access_token && req.body.game_id && req.body.user_id)
  {
    var access_token = req.body.access_token;
    var game_id      = req.body.game_id;
    var user_id      = req.body.user_id;
    var question_id  = req.body.question_id;
    var duration     = req.body.duration;
    var question_wait_time = req.body.question_wait_time;
    question_wait_time =Number(question_wait_time)/1000;

    const isTrue= await isValidToken(access_token);
    if(!isTrue){
           return res.json({
               "status": 201,
               "data":[],
               "message":"رمز الدخول غير صالح"
             });
    }
  
    //if creted game
    const checkGame = await db.query("SELECT * FROM gc_game_result WHERE gc_game_id=$1 AND question_id=$2", [game_id,question_id]);
    let questionObj = checkGame.rows[0];

    var first_user_id     = questionObj.first_user_id;
    var first_user_answer = questionObj.first_user_answer;
    var second_user_id     = questionObj.second_user_id;
    var second_user_answer = questionObj.second_user_answer;

    var opponent_id = 0;
    var opponent_ans_col = "";
    var oppo_time_taken_col=""; 
    var oppo_answer=""; 
    if(first_user_id== user_id)
    {
      opponent_id        = second_user_id;
      opponent_ans_col   = 'second_user_answer';
      oppo_time_taken_col= 'second_user_taken_time';
      oppo_answer        = second_user_answer;
    }
    else
    {
      opponent_id        = first_user_id;
      opponent_ans_col   ='first_user_answer';
      oppo_time_taken_col='first_user_taken_time';
      oppo_answer        = first_user_answer;
    }

    var is_next=0;
    if(oppo_answer !='' && oppo_answer !=null){
      is_next=1;
    }

    if(question_wait_time >= duration)
    {
      is_next=1;
      if(oppo_answer =='' || oppo_answer ==null)
      {
        //update ans opp na
        const updateResult = await db.query("UPDATE gc_game_result SET "+opponent_ans_col+"=$1,"+oppo_time_taken_col+"=$2 WHERE id=$3,question_id=$4",[ "na", question_wait_time,game_id,question_id]);
      }
     
    }

    return res.json({
               "status": 200,
               "data":{"is_next":is_next},
               "message":"success"
             });
  }
  else{
     return res.json({"status": 403, "data":{},"message": "المعلمات المطلوبة مفقودة" });
  }

});


//one to many _next_question
router.post('/otm_next_question', async function (req, res,next) {

  if(req.body.access_token && req.body.game_id && req.body.user_id)
  {
    var access_token = req.body.access_token;
    var game_id      = req.body.game_id;
    var user_id      = req.body.user_id;
    var question_id  = req.body.question_id;
    var duration     = req.body.duration;
    var question_wait_time = req.body.question_wait_time;
    question_wait_time =Number(question_wait_time)/1000;
    console.log(req.body);
    console.log('-time-');
    console.log(question_wait_time);

    const isTrue= await isValidToken(access_token);
    if(!isTrue){
           return res.json({
               "status": 201,
               "data":[],
               "message":"رمز الدخول غير صالح"
             });
    }
  
    //if creted game
    const checkGame = await db.query("SELECT * FROM gc_game_result WHERE gc_game_id=$1 AND question_id=$2", [game_id,question_id]);
    let questionObj = checkGame.rows[0];

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

    return res.json({
               "status": 200,
               "data":{"is_next":is_next},
               "message":"success"
             });
  }
  else{
     return res.json({"status": 403, "data":{},"message": "المعلمات المطلوبة مفقودة" });
  }

});


module.exports = router;