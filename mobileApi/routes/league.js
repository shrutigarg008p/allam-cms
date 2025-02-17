const express = require("express");
const router = express.Router();
const db = require("../db");

const transport = require("../config/smtp.js");
const common = require("../config/common.js");

var multer  = require('multer');
var aws = require('aws-sdk');
var multerS3 = require('multer-s3');
//const { data } = require("jquery");

aws.config.update({
    secretAccessKey: 'ux+vTbSHoOAGOh6kd9EajeF6eq6hH8gAjLSFYspq',
    accessKeyId: 'AKIAUSOI5LFUXODF3IVR',
    region: 'ap-south-1'
});

var app = express(),
    s3 = new aws.S3();

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'allam-stg',
        key: function (req, file, cb) {
            console.log(file);
            const fileName = 'league/'+Date.now()+"-"+file.originalname.toLowerCase().split(' ').join('-');
            cb(null, fileName); //use Date.now() for unique file keys
        },
        metadata: (req, file, callBack) => {
            callBack(null, { fieldName: file.fieldname })
        } 
    })
});

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
async function pointSystem(user_id, getPoints, competition_type){
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

router.get("/get_server_date_time", async function(req, res, next) {
  try {
    const current_date = await db.query("select current_date ");
    const current_time = await db.query("select current_time ");
    const current_now = await db.query("select now() ");
    console.log(current_date.rows);
    console.log(current_time.rows);
    // IF A USER ISN'T FOUND
    var results = [];
    results.push({server_date: current_date.rows[0].date});
    results.push({server_time: current_time.rows[0].timetz});
    results.push({server_now: current_now.rows[0].now});
   // console.log(results.rows);
   return res.json({
           "status": 200,
           'data':results,
         });
  } catch (err) {
    return next(err);
  }
});

router.get("/get_server_date_time_old", async function(req, res, next) {
  try {
    const current_date = await db.query("select current_date ");
    const current_time = await db.query("select current_time ");
    const current_now = await db.query("select now() ");
    console.log(current_date.rows);
    console.log(current_time.rows);
    // IF A USER ISN'T FOUND
    var results = [];
    results.push({server_date: current_date.rows[0].current_date});
    results.push({server_time: current_time.rows[0].current_time});
    results.push({server_now: current_now.rows[0].now});
   // console.log(results.rows);
   return res.json({
           "status": 200,
           'data':results,
         });
  } catch (err) {
    return next(err);
  }
});

router.get("/get_list/:access_token", async function(req, res, next) {
  //####check is valid access_token#####
  const isTrue= await isValidToken(req.params.access_token);
  if(!isTrue){
         return res.json({
             "status": 201,
             "data":[],
             "message": 'مدخل عملة الرمزية  غير سارية العمل' // "Invalid access token"
           });
  }
  try {
    //SELECT * FROM league where start_date >= now()::date;
    //"select * from ( SELECT *, to_timestamp(start_date || ' ' || start_time, 'YYYY-MM-DD HH24:MI:SS') as league_date, now() FROM league) t where league_date >= now() and status =1 "
    const results = await db.query("select * from ( SELECT *, to_timestamp(start_date || ' ' || start_time, 'YYYY-MM-DD HH24:MI:SS') as league_date, now() FROM league) t where status =1 order by league_date desc ");
    // IF A USER ISN'T FOUND
    if (typeof results.rows !== 'undefined' && results.rows.length == 0) {
      return res.status(200).json({ data:[], success: false, message: 'لا توجد نتائج' });
    }
   // console.log(results.rows);
   return res.json({
           "status": 200,
           'data':results.rows,
         });
  } catch (err) {
    return next(err);
  }
});

router.get("/get_slot_data/:competition_id/:access_token", async function(req, res, next) {
  //####check is valid access_token#####
  const isTrue= await isValidToken(req.params.access_token);
  if(!isTrue){
         return res.json({
             "status": 201,
             "data":[],
             "message":'مدخل عملة الرمزية  غير سارية العمل' // "Invalid access token"
           });
  }
  try {
    var competition_id = req.params.competition_id;
    //console.log("select * from ( SELECT id, competition_type, status, to_timestamp(start_date || ' ' || start_time, 'YYYY-MM-DD HH24:MI:SS') as league_date, now() FROM competition) t where competition_type='daily' and status=1 and id="+competition_id);
    const competition = await db.query("select * from ( SELECT id,  status, to_timestamp(start_date || ' ' || start_time, 'YYYY-MM-DD HH24:MI:SS') as league_date, now() FROM league) t where status=1 and id="+competition_id );
    // IF A USER ISN'T FOUND
      if (typeof competition.rows !== 'undefined' && competition.rows.length == 0) {
        return res.json({ status:201, success: false, message: 'أيقونه المسابقة غير موجودة' });
      }
     // console.log(competition.rows);
     return res.json({
             "status": 200,
             'data':competition.rows,
             'message': 'success'
           });

  } catch (err) {
    return next(err);
  }
});

router.get("/get_list_new/:access_token", async function(req, res, next) {
  //####check is valid access_token#####
  const isTrue= await isValidToken(req.params.access_token);
  if(!isTrue){
         return res.json({
             "status": 201,
             "data":[],
             "message":'مدخل عملة الرمزية  غير سارية العمل' // "Invalid access token"
           });
  }
  try {
    //SELECT * FROM league where start_date >= now()::date;
    const results = await db.query("select * from ( SELECT *, to_timestamp(start_date || ' ' || start_time, 'YYYY-MM-DD HH24:MI:SS') as league_date,to_timestamp(end_date || ' ' || end_time, 'YYYY-MM-DD HH24:MI:SS') as league_end_date, now() FROM league) t where league_date >= now() and status =1 ");
    // IF A USER ISN'T FOUND
    if (typeof results.rows !== 'undefined' && results.rows.length == 0) {
      return res.status(200).json({ data:[], success: false, message: 'لا توجد نتائج' });
    }
   // console.log(results.rows);

   //get server current date & time
    const current_date = await db.query("select current_date ");
    const current_time = await db.query("select current_time ");
    
    var resultsArr = [];
    var server_date = current_date.rows[0].date;
    var server_time = current_time.rows[0].timetz;

    for(var i =0; i< results.rows.length; i++){
      var leagueObj=results.rows[i];
      leagueObj['server_date'] =server_date;
      leagueObj['server_time'] =server_time;
      resultsArr.push(leagueObj);
    }


   return res.json({
           "status": 200,
           'data':resultsArr,
         });
  } catch (err) {
    return next(err);
  }
});

router.get("/league_interest/:competition_id/:user_id/:access_token", async function(req, res, next) { //console.log('req.params '+JSON.stringify(req.params));
if(req.params.competition_id && req.params.user_id)
{
    try {
      var competition_id = req.params.competition_id;
      var user_id = req.params.user_id;
        //console.log('competition_type '+req.params);
        //throw new Error('your die message here');
        const checkRecords = await db.query("select exists(select 1 from league_user_in where competition_id=$1 and interest_user_id=$2)", [competition_id, user_id]);
        //console.log(checkRecords);
        //throw new Error('your die message here');
        if(checkRecords.rows[0].exists == false) {
            const result = await db.query("INSERT INTO league_user_in (competition_id, interest_user_id, status) VALUES ($1,$2,$3) RETURNING *",
                [competition_id, user_id, 0]
            );
            //console.log(JSON.stringify(result.rows, null, 2));
            console.log("results "+result.rows[0].id);

            //point system
            var getPoints = 10;
            var competition_type = "league_competition";
            pointSystem(user_id, getPoints, competition_type);

            return res.json({ status: 200, message: "شكرا لك ...لقد قمت بالإنضمام إلي الدوري" }); // Thanks you have entered in league
        }else{
            return res.json({ status: 200, message: "لقد قمت بالفعل بالإنضمام للدوري" }); // You have already inserted in league
        }
    } catch (err) {
        return next('Error '+err);
    }
}
else{
 return res.json({ message: 'المعلومات المطلوبة غير متوفرة' // "Missing required parameters" 
  });
}
});

router.get("/get_interest_users/:competition_id/:access_token", async function(req, res, next) {
  //####check is valid access_token#####
  const isTrue= await isValidToken(req.params.access_token);
  if(!isTrue){
         return res.json({
             "status": 201,
             "data":[],
             "message":'مدخل عملة الرمزية  غير سارية العمل' // "Invalid access token"
           });
  }
  try {
    const results = await db.query("SELECT lu.interest_user_id as user_id, first_name || ' ' || last_name AS user_name, users.user_level FROM league_user_in as lu inner join users on users.id = lu.interest_user_id where lu.competition_id=$1 and is_group=$2", [req.params.competition_id, 0]);
    // IF A USER ISN'T FOUND
    if (typeof results.rows !== 'undefined' && results.rows.length == 0) {
      return res.status(200).json({ data:[], success: false, message: 'لا توجد نتائج' });
    }
   // console.log(results.rows);
   return res.json({
           "status": 200,
           'data':results.rows,
         });
  } catch (err) {
    return next(err);
  }
});

router.get("/add_league_group/:competition_id/:user_id/:access_token", async function(req, res, next) { //console.log('req.body '+JSON.stringify(req.body));
//####check is valid access_token#####
  const isTrue= await isValidToken(req.params.access_token);
  console.log(isTrue);
  if(!isTrue){
         return res.json({
             "status": 201,
             "data":[],
             "message":'مدخل عملة الرمزية  غير سارية العمل' // "Invalid access token"
           });
  }
  if(req.params.user_id && req.params.competition_id)
  {
    let user_id = req.params.user_id;
    let competition_id = req.params.competition_id;
      try {
        const total = await db.query("select id, interest_user_id from league_user_in where is_group =$1 and competition_id=$2", [0, competition_id] );
            var userArr = total.rows;
            total_user = total.rows.length;
            console.log('total_user', total_user);
            //return res.json({ status: 403, total_user: total_user });
            //total_user = total.rows[0].total_user;
            //console.log('total_user', total_user);
            result = [];
            //result.push({total_user: total_user});
          const checkGroup = await db.query("select exists(select 1 from league_group where competition_id=$1 and (user_id=$2 or paired_id=$2) and status=$3)", [competition_id, user_id, 0]);
          if(checkGroup.rows[0].exists == true) {
            result.push({is_group: 'yes'});
            return res.json({ status: 200, data: result, exists: checkGroup.rows[0].exists, message: "thanks" });
          }
          if(total_user >= 2){ // check here for greater than 32 players
            const checkGroup = await db.query("select exists(select 1 from league_group where competition_id=$1 and (user_id=$2 or paired_id=$2) and status=$3)", [competition_id, user_id, 0]);
            if(checkGroup.rows[0].exists == false) {
              for(let j=0;j<userArr.length;j++)
              {
                let interest_user_id = userArr[j].interest_user_id;
                console.log('interest_user_id', interest_user_id);

                const checkExistsGroup = await db.query("select exists(select 1 from league_group where competition_id=$1 and (user_id=$2 or paired_id=$2) and status=$3)", [competition_id, interest_user_id, 0]);
                if(checkExistsGroup.rows[0].exists == false) {
                  
                  const checkRecords = await db.query("select id, interest_user_id from league_user_in where competition_id=$1 and is_group=$2 and interest_user_id not in ($3) ", [competition_id, 0, interest_user_id]);
                  if(checkRecords && checkRecords.rows.length>0) {
                    var paired_id = checkRecords.rows[0].interest_user_id;
                    var opponent_type = 'human'; //checkRecords.rows[0].level;
                    // Here sttaus change of user interest is done group
                    
                    await db.query("UPDATE league_user_in SET is_group=$1 where id =$2 RETURNING *",
                        [1, checkRecords.rows[0].id]
                    );
                  }else{
                      var paired_id = 42; //for bot 1
                      var opponent_type = 'robot'; //checkRecords.rows[0].level;
                  }
                  const checkGroupLevel = await db.query("select id, group_level from league_group where competition_id=$1 and (user_id=$2 or paired_id=$2) and status=$3 order by id desc", [competition_id, interest_user_id, 1]);
                  if (typeof checkGroupLevel.rows !== 'undefined' && checkGroupLevel.rows.length == 0) {
                    var group_level = 1;
                  }else{
                    var group_level = checkGroupLevel.rows[0].group_level+1;
                  }
                      await db.query("INSERT INTO league_group (competition_id, user_id, group_level, paired_id, opponent_type, status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
                          [competition_id, interest_user_id, group_level, paired_id, opponent_type, 0]
                      );
                      /* await db.query("INSERT INTO league_group (competition_id, user_id, user_level, paired_id, opponent_type, status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
                          [req.body.competition_id, paired_id, opponent_type, req.body.interest_id, user_level, req.body.status]
                      ); */
                      
                      await db.query("UPDATE league_user_in SET is_group=$1 where interest_user_id =$2 RETURNING *",
                          [1, interest_user_id]
                      );


                }
              }
            }else{
              result.push({is_group: 'yes'});
              return res.json({ status: 200, data: result, exists: checkGroup.rows[0].exists, message: "thanks" });
            }
            result.push({is_group: 'yes'});
            return res.json({ status: 200, data: result,  message: "thanks" });
        }else{
          result.push({is_group: 'no'});
          return res.json({ status: 200, data: result, message: "32 players in league" });
        }
      } catch (err) {
          return next('Error '+err);
      }
  }
  else{
   return res.json({ status: 200, message: 'المعلومات المطلوبة غير متوفرة' //"Missing required parameters" 
  });
  }
});

router.get("/add_league_group_new/:competition_id/:user_id/:access_token", async function(req, res, next) { //console.log('req.body '+JSON.stringify(req.body));
//####check is valid access_token#####
  const isTrue= await isValidToken(req.params.access_token);
  console.log(isTrue);
  if(!isTrue){
         return res.json({
             "status": 201,
             "data":[],
             "message":'مدخل عملة الرمزية  غير سارية العمل' // "Invalid access token"
           });
  }

  if(req.params.user_id && req.params.competition_id)
  {
    let user_id = req.params.user_id;
    let competition_id = req.params.competition_id;
      try {
          //check league status
          const checkLeagueQ = await db.query("select * from ( SELECT *, to_timestamp(start_date || ' ' || start_time, 'YYYY-MM-DD HH24:MI:SS') as league_date FROM league) t where league_date >= now() and id=$1 and status =$2",[competition_id,'1']);
          if(checkLeagueQ.rows.length == 0)
          {
            return res.json({
               "status": 201,
               "data":{},
               "message":"Competition has been already started."
            });
          }

          const total = await db.query("select count(id) as total_user from league_user_in where is_group =$1 and competition_id=$2", [0, competition_id] );
            total_user = total.rows[0].total_user;
            console.log('total_user', total_user);
            result = [];
            result.push({total_user: total_user});
          if(total_user >= 2){ // check here for greater than 32 players
            const checkGroup = await db.query("select exists(select 1 from league_group where competition_id=$1 and (user_id=$2 or paired_id=$2) and status=$3)", [competition_id, user_id, 0]); 
            console.log(checkGroup);
            //throw new Error('your die message here');
            if(checkGroup.rows[0].exists == false) {
                const checkRecords = await db.query("select * from league_user_in where competition_id=$1 and is_group=$2 and interest_user_id not in ($3) order by random() limit 1 ", [competition_id, 0, user_id]);
                //console.log(checkRecords.rows);
                //throw new Error('your die message here');
                if(checkRecords && checkRecords.rows.length>0) {
                    var paired_id = checkRecords.rows[0].interest_user_id;
                    var opponent_type = 'human'; //checkRecords.rows[0].level;
                    // Here sttaus change of user interest is done group
                    
                    await db.query("UPDATE league_user_in SET is_group=$1 where id =$2 RETURNING *",
                        [1, checkRecords.rows[0].id]
                    );
                }else{
                    var paired_id = 1;
                    var opponent_type = 'robot'; //checkRecords.rows[0].level;
                }
                const checkGroupLevel = await db.query("select id, group_level from league_group where competition_id=$1 and (user_id=$2 or paired_id=$2) and status=$3", [competition_id, user_id, 1]);
                if (typeof checkGroupLevel.rows !== 'undefined' && checkGroupLevel.rows.length == 0) {
                  var group_level = 1;
                }else{
                  var group_level = checkGroupLevel.rows[0].group_level+1;
                }
                    await db.query("INSERT INTO league_group (competition_id, user_id, group_level, paired_id, opponent_type, status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
                        [competition_id, user_id, group_level, paired_id, opponent_type, 0]
                    );
                    /* await db.query("INSERT INTO league_group (competition_id, user_id, user_level, paired_id, opponent_type, status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
                        [req.body.competition_id, paired_id, opponent_type, req.body.interest_id, user_level, req.body.status]
                    ); */
                    
                    await db.query("UPDATE league_user_in SET is_group=$1 where interest_user_id =$2 RETURNING *",
                        [1, user_id]
                    );
                    //console.log(JSON.stringify(result.rows, null, 2));
                    //console.log("results "+result.rows[0].id);
                    
                    return res.json({ status: 200, data: result, message: "Thanks you have added group in league" });
                /* }else{
                    return res.json({ status: 403, message: "Records not exists in league" });
                } */
            }else{
                return res.json({ status: 201, data: result, message: "لقد تمت إضافتك في الدوري" }); // You have already grouped in league
            }
        }else{
          return res.json({ status: 201, data: result, message: "هناك بالفعل 32 متسابق في الدوري" }); // 32 players already in league
      }
      } catch (err) {
          return next('Error '+err);
      }
  }
  else{
   return res.json({ status: 201, message: 'المعلومات المطلوبة غير متوفرة' // "Missing required parameters" 
  });
  }
});

router.get("/get_user_group/:competition_id/:user_id/:access_token", async function(req, res, next) {
  //####check is valid access_token#####
  const isTrue= await isValidToken(req.params.access_token);
  if(!isTrue){
         return res.json({
             "status": 201,
             "data":[],
             "message":'مدخل عملة الرمزية  غير سارية العمل' // "Invalid access token"
           });
  }
  try {
    let user_id = req.params.user_id;
    let competition_id = req.params.competition_id;
    //let level = req.params.level;
    const total = await db.query("select count(id) as total_user from league_user_in where is_group =$1 and competition_id=$2", [0, competition_id] );
    total_user = total.rows[0].total_user;
    console.log('total_user', total_user);

    /* if(total_user > 4){ // check here for greater than 32 players
    } */
      const results = await db.query("SELECT lu.id, lu.user_id, lu.paired_id, lu.group_level, first_name || ' ' || last_name AS user_name, users.user_avatar, users.user_level, users.level_title FROM league_group as lu inner join users on users.id = lu.user_id where lu.competition_id=$1 and (lu.user_id=$2 or lu.paired_id=$2) and lu.status=$3", [req.params.competition_id, user_id, 0]);
      // IF A USER ISN'T FOUND
      if (typeof results.rows !== 'undefined' && results.rows.length == 0) {
        return res.status(200).json({  data:[], success: false, message: 'لا توجد نتائج' });
      }

      // console.log(results.rows);
      const results1 = await db.query("SELECT id as user_id, first_name || ' ' || last_name AS user_name, user_avatar, users.user_level, users.level_title FROM users where id=$1", [results.rows[0].paired_id]);
      let groupAllObj = results.rows;
      var changeArr = [];
      //var changeArr1 = [];
      var changeObj = {};
      changeObj.user_id = results.rows[0].user_id;
      Object.assign(changeObj, {user_id: results.rows[0].user_id});
      Object.assign(changeObj, {user_name: results.rows[0].user_name});
      Object.assign(changeObj, {user_avatar: results.rows[0].user_avatar});
      Object.assign(changeObj, {user_level: results.rows[0].user_level});
      Object.assign(changeObj, {level_title: results.rows[0].level_title});
      Object.assign(changeObj, {group_id : groupAllObj[0].id});
      //console.log('changeObj', JSON.stringify(changeObj));
      changeArr.push(changeObj);
      
      resultsUser1 = results1.rows;

      var changeArr1 = resultsUser1.map(function(el) {
        var o = Object.assign({}, el);
        o.group_id = groupAllObj[0].id;
        return o;
      })

    user1 = changeArr;
    user2 = changeArr1;
    var showResult = [...user1, ...user2];

    // Here start code for question inserting in league result group wise
    const league = await db.query("SELECT id, question_type FROM league where id=$1", [competition_id]);
    var leagueResult=league.rows;
    var question_type = leagueResult[0].question_type;

    const resultQuestion = await db.query("SELECT id, competition_id, question_id, correct_answer FROM league_result WHERE league_result.competition_id=$1 and league_result.level=$2 and user_id=$3 ", [competition_id, groupAllObj[0].group_level, user_id]);

    console.log('resultQuestion', JSON.stringify(resultQuestion.rows));
    var questionArr = [];
    if (typeof resultQuestion.rows !== 'undefined' && resultQuestion.rows.length == 0) {
      console.log('inside');
      var question = '';
      if(question_type == 'bulk'){ // here when we select bulk option
        question = await db.query("SELECT league_question.* FROM league_question_mapping JOIN league ON league_question_mapping.competition_id::integer=league.id JOIN league_question ON league_question_mapping.question_id::integer=league_question.id WHERE league_question_mapping.competition_id=$1 order by random() LIMIT 10", [competition_id]);
      }else{ // else part of selecting categories is - category
        const league_categories = await db.query("SELECT id, categories FROM league_categories where competition_id=$1", [competition_id]);
        var leagueCategoriesResult=league_categories.rows;
        var questionCategories = JSON.parse(leagueCategoriesResult[0].categories);
        console.log('questionCategories', questionCategories.length);
        var categoriesIds = [];
        for (let i = 0; i < questionCategories.length; i++) {
          var id = questionCategories[i].id;
          categoriesIds.push(id);
        }
        var resCat = categoriesIds.join(',');
        console.log('resCat', resCat);

        question = await db.query("SELECT * FROM gc_question where category_id in ("+resCat+") order by random() LIMIT 10" );
        console.log('ques', question.rows);
      }
      questionArr=question.rows;
      //console.log('quescount', questionArr.length);
      for(let i=0;i<questionArr.length;i++)
      {
        let questionObj = questionArr[i];
        //console.log('showResult', JSON.stringify(showResult));
        //console.log('count', showResult.length);
        for(let j=0;j<showResult.length;j++)
        {
          let interest_user_id = showResult[j].user_id;
          const insert = await db.query("INSERT INTO league_result (competition_id,group_id,question_id,correct_answer,user_id, level, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
          [competition_id, results.rows[0].id, questionObj.id, questionObj.answer, interest_user_id, groupAllObj[0].group_level, user_id]
            );
        }
      }
    }else{
      questionArr=resultQuestion.rows;
      for(let i=0;i<questionArr.length;i++)
      {
        let questionObj = questionArr[i];
        console.log('showResult', JSON.stringify(showResult));
        console.log('questionObj', questionObj.question_id);
        for(let j=0;j<showResult.length;j++)
        {
          let interest_user_id = showResult[j].user_id;
          const checkUserExist = await db.query("select id, competition_id from league_result where group_id =$1 and competition_id=$2 and level=$3 and user_id=$4 and question_id=$5", [results.rows[0].id, competition_id, groupAllObj[0].group_level, interest_user_id, questionObj.question_id] );

          if (typeof checkUserExist.rows !== 'undefined' && checkUserExist.rows.length == 0) {
            const insert = await db.query("INSERT INTO league_result (competition_id,group_id,question_id,correct_answer,user_id, level, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",[competition_id, results.rows[0].id, questionObj.question_id, questionObj.correct_answer, interest_user_id, groupAllObj[0].group_level, user_id]); 
          }
        }
      }
    }
    
    // End Here code for question inserting in league result group wise
    
    //console.log('groupAllObj', JSON.stringify(groupAllObj));
    
    return res.json({
      "status": 200,
      'data':showResult,
         });
  } catch (err) {
    return next(err);
  }
});

///get all draft qustion by user id
router.get("/get_league_question/:competition_id/:group_id/:access_token", async function(req, res, next) {
  //####check is valid access_token#####
  const isTrue= await isValidToken(req.params.access_token);
  if(!isTrue){
         return res.json({
             "status": 201,
             "data":[],
             "message":'مدخل عملة الرمزية  غير سارية العمل' // "Invalid access token"
           });
  }

  try {
    let competition_id = req.params.competition_id;
    let group_id = req.params.group_id;
    
    let level = 0;
    if(group_id == 0){
      level = 0;
    }else{
      const group = await db.query("SELECT * FROM league_group where id=$1 ", [ group_id]);
      level = group.rows[0].group_level;
    }
    // check for question type. If category then show according to category other wise bulk type
    const league = await db.query("SELECT id, question_type FROM league where id=$1", [competition_id]);
    var leagueResult=league.rows;
    var question_type = leagueResult[0].question_type;

    var question = '';
    if(question_type == 'bulk'){ // here when we select bulk option
      question = await db.query("SELECT * FROM league_question where id in (select question_id from league_result WHERE league_result.competition_id=$1 and league_result.group_id=$2 and league_result.level=$3) ", [competition_id, group_id, level]);
    }else{ // else part of selecting categories is - category

      question = await db.query("SELECT * FROM gc_question where id in (select question_id from league_result WHERE league_result.competition_id=$1 and league_result.group_id=$2 and league_result.level=$3) ", [competition_id, group_id, level]);
      console.log('ques', question.rows);
    }

    var questionObj = question.rows;

     		//var changeObj = questionObj.map((item) => ({ option1: item.answer }));

     		var changeObj = questionObj.map( s => {
			  /* if ( s.hasOwnProperty("answer") )
			  {
			     s.option1 = s.answer;
			     delete s.answer;   
			  } */
			  if ( s.hasOwnProperty("question_image_url") )
			  {
			     s.question_image = s.question_image_url;
			     delete s.question_image_url;   
			  }
			  return s;
			})


     		//console.log(changeObj);
     		//Object.assign(questionObj, {key3: "value3"});
     		/* var result = changeObj.map(function(el) {
			  var o = Object.assign({}, el);
			  o.answer = "a";
			  return o;
			}) */

         return res.json({
             "status": 200,
             'data':changeObj,
           });

  } catch (err) {
    return next(err);
  }
});

/*
*********************************
* Function for save user answer
*********************************
*/
router.post("/save_result/:access_token", async function(req, res, next) {
  //####check is valid access_token#####
  const isTrue= await isValidToken(req.params.access_token);
  if(!isTrue){
         return res.json({
             "status": 201,
             "data":[],
             "message":'مدخل عملة الرمزية  غير سارية العمل' // "Invalid access token"
           });
  }
  //res.status(200).send(req.body.competition_id);
  if(req.body.competition_id  && req.body.user_id)
  {
    try {
      let competition_id = req.body.competition_id;
      let user_id = req.body.user_id;
      let group_id = req.body.group_id;
      let answerObj = req.body.answer;
      let level = 0;
      if(group_id == 0){
        level = 0;
      }else{
        const group = await db.query("SELECT * FROM league_group where id=$1 ", [ group_id]);
        level = group.rows[0].group_level;
      }
      for (let index = 0; index < answerObj.length; index++) {
        //console.log(answerObj[index].question_id);
        let question_id = answerObj[index].question_id;
        let user_answer = answerObj[index].user_answer;
        let answer_time = answerObj[index].answer_time;

        const results = await db.query("UPDATE league_result SET user_answer=$1, answer_time=$2 where competition_id=$3 and user_id =$4 and group_id=$5 and level=$6 and question_id=$7 RETURNING *",
                    [user_answer, answer_time, competition_id, user_id, group_id, level, question_id]
        );

      }
      return res.json({status:200,
      'message' : 'answer save successfully'});
/* 
      let user_answer = req.body.user_answer;
      let answer_time = req.body.answer_time;
      let competition_id = req.body.competition_id;
      let user_id = req.body.user_id;
      let level = req.body.level;
      let group_id = req.body.group_id;
      let question_id = req.body.question_id;
      const results = await db.query("UPDATE league_result SET user_answer=$1, answer_time=$2 where competition_id=$3 and user_id =$4 and group_id=$5 and level=$6 and question_id=$7 RETURNING *",
                    [user_answer, answer_time, competition_id, user_id, group_id, level, question_id]
      );
      return res.json(results.rows); */
    } catch (err) {
      return next(err);
    }
  }else{
    return res.json({ status: 201, message: 'المعلومات المطلوبة غير متوفرة' //"Missing required parameters" 
    });
   }
});

router.get("/get_result/:competition_id/:group_id/:access_token", async function(req, res, next) {
  //####check is valid access_token#####
  const isTrue= await isValidToken(req.params.access_token);
  if(!isTrue){
         return res.json({
             "status": 201,
             "data":[],
             "message":'مدخل عملة الرمزية  غير سارية العمل' // "Invalid access token"
           });
  }
  try {
    let competition_id = req.params.competition_id;
    let group_id = req.params.group_id;
    var competition =[];
    let level = 0;
    if(group_id == 0){ // Here group id is 0, this is last competition and more than 2 user
      level = 0;
      
      //delete league result
      //await db.query("DELETE FROM league_result WHERE competition_id =$1 and group_id !=$2 and level !=$3" , [competition_id, 0, 0]);

      competition = await db.query("SELECT DISTINCT ON (user_id) user_id FROM league_result as cqt  WHERE competition_id =$1 and group_id =$2" , [competition_id, 0]);
      if (typeof competition.rows !== 'undefined' && competition.rows.length == 0) {
        return res.status(200).json({ data:[], success: false, message: 'لا يؤجد نتيجة للمسابقة المختارة' //'Results not found for selected competition' 
      });
      }
    }else{ //else part  
      const group = await db.query("SELECT * FROM league_group where id=$1 ", [ group_id]);
      level = group.rows[0].group_level;
      let user_id = group.rows[0].user_id;
      let paired_id = group.rows[0].paired_id;

      competition = await db.query("SELECT DISTINCT ON (user_id) user_id FROM league_result as cqt  WHERE (user_id =$1 or user_id =$2)" , [user_id, paired_id]);
      if (typeof competition.rows !== 'undefined' && competition.rows.length == 0) {
        return res.status(200).json({ data:[], success: false, message: 'لا يؤجد نتيجة للمسابقة المختارة' // 'Results not found for selected competition' 
      });
      }
      await db.query("UPDATE league_group SET status=$1 where id =$2 RETURNING *",
          [1, group_id]
          );
    }
      var refObj = competition.rows;
      console.log('refObj', JSON.stringify(refObj));
      
      var result = [];
      for(var i =0; i< refObj.length; i++){
        /* const results = await db.query("SELECT * FROM league_result WHERE league_result.competition_id=$1 and league_result.group_id=$2 and league_result.level=$3 and user_id =$4 ", [competition_id, group_id, level, refObj[i].user_id]);
        var userAnsObj = results.rows; */

        var userAnsArr = await db.query("SELECT cqt.user_id, cqt.question_id, cqt.correct_answer, cqt.user_answer, cqt.answer_time, users.first_name || ' ' || users.last_name as full_name, users.country, users.user_avatar FROM league_result as cqt JOIN users on users.id = cqt.user_id::integer  WHERE cqt.user_id=$1 AND cqt.competition_id=$2 and cqt.group_id=$3" , [refObj[i].user_id, competition_id, group_id]);
        var userAnsObj = userAnsArr.rows;
        console.log('userAnsObj', JSON.stringify(userAnsObj.length));
        var totalAnswer = Object.keys(userAnsObj).length;
      
        var correctAnswer = [];
        var scoreData = 0;
        var totalTime = 0;
        for(var j =0; j< userAnsObj.length; j++){
          if(userAnsObj[j].user_answer == userAnsObj[j].correct_answer){
            correctAnswer.push(userAnsObj[j].correct_answer);
            scoreData += 5;
          }
          if(userAnsObj[j].answer_time == null){
            userAnsObj[j].answer_time = 0;
          }
          totalTime += parseInt(userAnsObj[j].answer_time);
        }

        var totalAnswerss = Object.keys(correctAnswer).length;
            //var user_answer = userAnswer.push(userAnsObj[0].user_id);
            var ress = {user_id : refObj[i].user_id, user_name : userAnsObj[0].full_name, user_image: userAnsObj[0].user_avatar, country: userAnsObj[0].country, user_answers: totalAnswer, correct_answers : totalAnswerss, score :scoreData, total_times : totalTime};
          result.push(ress);
      }

      result.sort((a,b) => parseInt(b.score) - parseInt(a.score) || parseInt(a.total_times) - parseInt(b.total_times));
      // Show rank according to score sorting
      var total_user = 0;
      for (var i = 0; i < result.length; i++) {
        //Here condition for win game for top player
        if(i==0 && group_id ==0){
          //point system
          var getPoints = 40;
          var competition_type = "league_competition";
          pointSystem(result[i].user_id, getPoints, competition_type);
        }
        
        if(i==0 && group_id !=0){
          await db.query("UPDATE league_user_in SET is_group=$1 where interest_user_id =$2 and competition_id=$3 RETURNING *",
          [0, result[i].user_id, competition_id]
          );
          //Here function call for Leveling up (+5) for every step.
          //point system
          var getPoints = 5;
          var competition_type = "league_competition";
          pointSystem(result[i].user_id, getPoints, competition_type);

          const total = await db.query("select count(id) as total_user from league_user_in where is_group =$1 and competition_id=$2", [0, competition_id] );
          total_user = total.rows[0].total_user;
        }
        if(group_id == 0){
          await db.query("UPDATE league_user_in SET is_group=$1 where interest_user_id =$2 and competition_id=$3 RETURNING *",
          [1, result[i].user_id, competition_id]
          );

        }
        result[i].total_user = total_user;
        result[i].rank = i+1;
      }
      console.log('total--'+ total_user);
      console.log(result)
    //   setTimeout(function(){
    //   return res.json({
    //       "status": 200,
    //       'data':result,
    //   });
    // },10000);
    return res.json({
          "status": 200,
          'data':result,
      });

  } catch (err) {
    return next(err);
  }
});

///get 
router.get("/get_league_summary/:competition_id/:user_id/:access_token", async function(req, res, next) 
{
  //####check is valid access_token#####
  const isTrue= await isValidToken(req.params.access_token);
  if(!isTrue){
         return res.json({
             "status": 201,
             "data":[],
             "message":'مدخل عملة الرمزية  غير سارية العمل' // "Invalid access token"
           });
  }

  try {
      let competition_id = req.params.competition_id;
      let user_id        = req.params.user_id;
      let group_level    = 0;
      
      const total = await db.query("select id, interest_user_id from league_user_in where is_group =$1 and competition_id=$2", [0, competition_id] );
      console.log("user id-"+user_id);
      console.log("select id, interest_user_id from league_user_in where is_group ='0' and competition_id="+competition_id);
      console.log("----end-----")
      var userArr    = total.rows;
      var total_user = total.rows.length;
      console.log('total_user', total_user);
      /// code for show user play list
      var userObj = [];
      for(let j=0;j<userArr.length;j++)
      {
        let interest_user_id = userArr[j].interest_user_id;
        //point system
        let getPoints = 10;
        let competition_type = "league_competition";
        pointSystem(interest_user_id, getPoints, competition_type);

        let get_user = await db.query("SELECT id as user_id, username, first_name || ' ' || last_name AS full_name, user_avatar, users.country FROM users where id=$1", [interest_user_id]);
        let getUserObj = get_user.rows;
        let ress = {user_id : userArr[j].interest_user_id, user_name : getUserObj[0].username, full_name : getUserObj[0].full_name, user_image: getUserObj[0].user_avatar, country: getUserObj[0].country};
        userObj.push(ress);
      }
      /////End here///// 

      return res.json({
        "status": 200,
        'message': 'Group added successfuly',
        'data':userObj,
        'total': total_user
      });
   
    

  } catch (err) {
    return next(err);
  }
});

router.get("/get_league_summary_old/:competition_id/:user_id/:access_token", async function(req, res, next) {
  //####check is valid access_token#####
  const isTrue= await isValidToken(req.params.access_token);
  if(!isTrue){
         return res.json({
             "status": 201,
             "data":[],
             "message":'مدخل عملة الرمزية  غير سارية العمل' // "Invalid access token"
           });
  }

  try {
    let competition_id = req.params.competition_id;
    let user_id = req.params.user_id;
    let group_level = 0;
    
    const total = await db.query("select id, interest_user_id from league_user_in where is_group =$1 and competition_id=$2", [0, competition_id] );
    var userArr = total.rows;
    var total_user = total.rows.length;
    console.log('total_user', total_user);

    if(total_user <= 32 && total_user !=0){ // check here for less than or equal to 32 players
      // Here start code for question inserting in league result group wise
      //delete league result
      await db.query("DELETE FROM league_result WHERE competition_id =$1 and group_id !=$2 and level !=$3" , [competition_id, 0, 0]);
      await db.query("DELETE FROM league_group WHERE competition_id =$1 " , [competition_id]);

      const league = await db.query("SELECT id, question_type FROM league where id=$1", [competition_id]);
      var leagueResult=league.rows;
      var question_type = leagueResult[0].question_type;

      const resultQuestion = await db.query("SELECT id, competition_id, question_id, correct_answer FROM league_result WHERE league_result.competition_id=$1 and league_result.level=$2 and user_id=$3 ", [competition_id, group_level, user_id]);

      //console.log('resultQuestion', JSON.stringify(resultQuestion.rows));
      var questionArr = [];
      if (typeof resultQuestion.rows !== 'undefined' && resultQuestion.rows.length == 0) {
        console.log('inside');
        var question = '';
        if(question_type == 'bulk'){ // here when we select bulk option
          question = await db.query("SELECT league_question.* FROM league_question_mapping JOIN league ON league_question_mapping.competition_id::integer=league.id JOIN league_question ON league_question_mapping.question_id::integer=league_question.id WHERE league_question_mapping.competition_id=$1 order by random() LIMIT 10", [competition_id]);
        }else{ // else part of selecting categories is - category
          const league_categories = await db.query("SELECT id, categories FROM league_categories where competition_id=$1", [competition_id]);
          var leagueCategoriesResult=league_categories.rows;
          var questionCategories = JSON.parse(leagueCategoriesResult[0].categories);
          console.log('questionCategories', questionCategories.length);
          var categoriesIds = [];
          for (let i = 0; i < questionCategories.length; i++) {
            var id = questionCategories[i].id;
            categoriesIds.push(id);
          }
          var resCat = categoriesIds.join(',');
          console.log('resCat', resCat);
      
          question = await db.query("SELECT * FROM gc_question where category_id in ("+resCat+") order by random() LIMIT 10" );
          console.log('ques', question.rows);
        }
        questionArr=question.rows;
        console.log('quescount', questionArr.length);
        
        for(let i=0;i<questionArr.length;i++)
        {
          let questionObj = questionArr[i];
          console.log('userArr', JSON.stringify(userArr));
          console.log('questionObj.id', questionObj.id);
          for(let j=0;j<userArr.length;j++)
          {
            let interest_user_id = userArr[j].interest_user_id;
            console.log('interest_user_id', interest_user_id);
            
            const checkUserExist = await db.query("select id, competition_id from league_result where group_id =$1 and competition_id=$2 and level=$3 and user_id=$4 and question_id=$5", [0, competition_id, 0, interest_user_id, questionObj.id] );

            if (typeof checkUserExist.rows !== 'undefined' && checkUserExist.rows.length == 0) {
              const insert = await db.query("INSERT INTO league_result (competition_id,group_id,question_id,correct_answer,user_id, level, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *", [competition_id, 0, questionObj.id, questionObj.answer, interest_user_id, 0, user_id] );
            }
          }
        }
      }else{
        questionArr=resultQuestion.rows;
        for(let i=0;i<questionArr.length;i++)
        {
          let questionObj = questionArr[i];
          console.log('showResult', JSON.stringify(userArr));
          console.log('questionObj', questionObj.question_id);
          for(let j=0;j<total_user;j++)
          {
            let interest_user_id = userArr[j].interest_user_id;
            
            const checkUserExist = await db.query("select id, competition_id from league_result where group_id =$1 and competition_id=$2 and level=$3 and user_id=$4 and question_id=$5", [0, competition_id, 0, interest_user_id, questionObj.question_id] );

            if (typeof checkUserExist.rows !== 'undefined' && checkUserExist.rows.length == 0) {
              const insert = await db.query("INSERT INTO league_result (competition_id,group_id,question_id,correct_answer,user_id, level, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",[competition_id, 0, questionObj.question_id, questionObj.correct_answer, interest_user_id, 0, user_id]); 
            }
          }
        }
      }
      // End Here code for question inserting in league result group wise
      
      /// code for show user play list
      //userArr = [{"id":15,"interest_user_id":53},{"id":12,"interest_user_id":70},{"id":5,"interest_user_id":6}]
      var userObj = [];
      for(let j=0;j<userArr.length;j++)
      {
        let interest_user_id = userArr[j].interest_user_id;
        //point system
        var getPoints = 10;
        var competition_type = "league_competition";
        pointSystem(interest_user_id, getPoints, competition_type);

        var get_user = await db.query("SELECT id as user_id, username, first_name || ' ' || last_name AS full_name, user_avatar, users.country FROM users where id=$1", [interest_user_id]);
        getUserObj = get_user.rows;
        var ress = {user_id : userArr[j].interest_user_id, user_name : getUserObj[0].username, full_name : getUserObj[0].full_name, user_image: getUserObj[0].user_avatar, country: getUserObj[0].country};
        userObj.push(ress);
      }
      /////End here///// 

      return res.json({
        "status": 200,
        'message': 'Group added successfuly',
        'data':userObj,
        'total': total_user
      });
    }else{
      return res.json({
        "status": 200,
        'message': 'User have more than 32 players',
      });
    }
    

  } catch (err) {
    return next(err);
  }
});

router.get("/get_league_broadcast/:competition_id/:access_token", async function(req, res, next) {
  //####check is valid access_token#####
  const isTrue= await isValidToken(req.params.access_token);
  if(!isTrue){
         return res.json({
             "status": 201,
             "data":[],
             "message":'مدخل عملة الرمزية  غير سارية العمل' // "Invalid access token"
           });
  }

  try {
    let competition_id = req.params.competition_id;
    const results = await db.query("SELECT cm.company_name, cm.company_logo,cm.company_url, cm.company_about, lf.competition_id, lf.file_url as narration_url, lf.file_url1 as narration_url1, lf.narration_text,  lf.narration_text1, lf.file_time, lf.file_time1, lf.narration_text2,lf.file_time2,lf.file_url2,cm.start_date_time as league_date, NOW() FROM  league_file as lf  inner join league cm on cm.id = lf.competition_id where competition_id= $1", [competition_id] );
    
    if (typeof results.rows !== 'undefined' && results.rows.length == 0) {
      return res.status(200).json({ data:[], success: false, message: 'لا توجد نتائج' });
    }
    var fileArr = results.rows;
    return res.json({
      "status": 200,
      'data':fileArr
    });
  } catch (err) {
    return next(err);
  }
});


////////////////////////////
router.post("/addLeague", upload.fields([{
           name: 'logo', maxCount: 1
         }]), async function(req, res, next) { console.log('req.body '+req.body.compitition_name);
    if(req.body.compitition_name && req.body.description)
    {
        try {
            console.log("fileName "+ req.files.logo[0].key);
            
            if(Object.keys(req.files).length !== 0 ){
                var logo =  req.files.logo[0].key;
            }else{
                return res.json({ message: "League logo can not be blank." });
            }
            /* if(req.files && req.files.app_logo){
                var app_logo =  req.files.app_logo[0].key;
            }else{
                var app_logo =  '';
            } */
            //console.log('status '+req.body.status);
            //console.log('competition_type '+req.body);
            //throw new Error('your die message here');
            
            const result = await db.query("INSERT INTO league (compitition_name,description,logo,start_date,end_date,start_time,end_time,waiting_time, status, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *",
                [req.body.compitition_name, req.body.description, logo, req.body.start_date, req.body.end_date, req.body.start_time, req.body.end_time, req.body.waiting_time, req.body.status, req.body.created_by]
            );
            //console.log(JSON.stringify(result.rows, null, 2));
            console.log("results "+result.rows[0].id);
            return res.json({ status: 200, message: "Record inserted" });
        } catch (err) {
            return next('Error '+err);
        }
    }
    else{
        return res.json({ status: 201, message: 'المعلومات المطلوبة غير متوفرة' //"Missing required parameters"
       });
    }
});

router.post("/league_interest", async function(req, res, next) { //console.log('req.body '+JSON.stringify(req.body));
if(req.body.competition_id && req.body.interest_id)
{
    try {
        //console.log('competition_type '+req.body);
        //throw new Error('your die message here');
        const checkRecords = await db.query("select exists(select 1 from league_user_in where competition_id=$1 and interest_user_id=$2)", [req.body.competition_id, req.body.interest_id]);
        //console.log(checkRecords);
        //throw new Error('your die message here');
        if(checkRecords.rows[0].exists == false) {
            const result = await db.query("INSERT INTO league_user_in (competition_id, interest_user_id, status) VALUES ($1,$2,$3) RETURNING *",
                [req.body.competition_id, req.body.interest_id, req.body.status]
            );
            //console.log(JSON.stringify(result.rows, null, 2));
            console.log("results "+result.rows[0].id);
            return res.json({ status: 200, message: "شكرا لك ...لقد قمت بالإنضمام إلي الدوري" }); // Thanks you have entered in league
        }else{
            return res.json({ status: 201, message: "لقد قمت بالفعل بالإنضمام للدوري" }); // You have already inserted in league
        }
    } catch (err) {
        return next('Error '+err);
    }
}
else{
 return res.json({ status: 201, message: 'المعلومات المطلوبة غير متوفرة' //"Missing required parameters" 
  });
}
});

router.patch("/:id", upload.single('icon'), async function(req, res, next) 
{

  if(req.body.title && req.body.description && req.body.status)
  {
    try {
      const res_cat = await db.query("SELECT * FROM category_group WHERE id=$1", [
      req.params.id
      ]);
      console.log("Show "+res_cat.rows[0].icon);
      if (req.file) {
        s3.deleteObject({
          Bucket: 'allam-stg',
          Key: res_cat.rows[0].icon
        },function (err,data){
          //res.status(200).send("File has been deleted successfully");

        })

        const result = db.query(
          "UPDATE category_group SET title=$1, description=$2, icon=$3, status=$4 WHERE id=$5 RETURNING *",
          [req.body.title, req.body.description,req.file.key,req.body.status, req.params.id]
        );

      }else{
        const result = db.query(
          "UPDATE category_group SET title=$1, description=$2, status=$3 WHERE id=$4 RETURNING *",
          [req.body.title, req.body.description, req.body.status, req.params.id]
        );
      }
      // update data

      //console.log("fileName "+JSON.stringify(req.file, null, 2) );

      /*const result = db.query(
        "UPDATE category_group SET title=$1, description=$2, icon=$3, status=$4 WHERE id=$5 RETURNING *",
        [req.body.title, req.body.description,req.file.key,req.body.status, req.params.id]
      );*/
      //return res.json(result.rows[0]);

      db.query("SELECT * FROM category_group_relation WHERE category_group_id = '"+req.params.id+"'",function(err,data)
      {
        if(data.rows && data.rows.length > 0){
           const result1 =  db.query(
            "UPDATE category_group_relation SET category_ids=$1 WHERE category_group_id = $2 RETURNING *",
            [req.body.category_ids, req.params.id]
          ); console.log('update');
        } else {
           const result1 =  db.query(
            "INSERT INTO category_group_relation (category_group_id,category_ids) VALUES ($1,$2) RETURNING *",
            [req.params.id, req.body.category_ids]
          ); console.log('insert');
        }
      });

      return res.json({ message: "Record updated" });
    } catch (err) {
      return next(err);
    }
  }
  else{
    return res.json({ status: 201, message: 'المعلومات المطلوبة غير متوفرة' //"Missing required parameters" 
    });
  }

});

router.delete("/:id", async function(req, res, next) {
  try {
    const result = await db.query("DELETE FROM category_group WHERE id=$1", [
      req.params.id
    ]);

    const result1 = db.query("DELETE FROM category_group_relation WHERE category_group_id=$1", [
      req.params.id
    ]);
    return res.json({ message: "Record deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;