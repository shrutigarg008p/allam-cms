const express = require("express");
const router = express.Router();
const db = require("../db");
const transport = require("../config/smtp.js");
const common = require("../config/common.js");

//fcm
var FCM = require('fcm-node');
var serverKey = common.fcmServerKey(); //put your server key here
var fcm = new FCM(serverKey);

//aws s3
var multer  = require('multer');
var aws = require('aws-sdk');
var multerS3 = require('multer-s3');

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
            console.log('--before file--')
            console.log(file);
            console.log('---after file---')
            const fileName = "user_file/"+Date.now()+"-"+file.originalname.toLowerCase().split(' ').join('-');
            cb(null, fileName); //use Date.now() for unique file keys
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

/////end s3 integration////

///get all draft qustion by user id
router.get("/get_competition_question/:id/:access_token", async function(req, res, next) {
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
     const question = await db.query("SELECT competition_question.* FROM competition_question  JOIN competition ON competition_question.competition_id::integer=competition.id WHERE competition_question.competition_id=$1", [
          req.params.id]);
     		var questionObj = question.rows;

     		//var changeObj = questionObj.map((item) => ({ option1: item.answer }));

     		var changeObj = questionObj.map( s => {
			  /* if ( s.hasOwnProperty("answer") )
			  {
			     s.option1 = s.answer;
			     delete s.answer;   
			  } */
			  if ( s.hasOwnProperty("question_file_url") )
			  {
			     s.question_image = s.question_file_url;
			     delete s.question_file_url;   
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
        var result =  changeObj;
         return res.json({
             "status": 200,
             'data':result,
           });

  } catch (err) {
    return next(err);
  }
});

router.get("/get_all/:user_id/:access_token", async function(req, res, next) {
  //####check is valid access_token#####
  const isTrue= await isValidToken(req.params.access_token);
  if(!isTrue){
         return res.json({
             "status": 201,
             "data":[],
             "message":"رمز الدخول غير صالح"
           });
  }
  try { //console.log(Intl.DateTimeFormat().resolvedOptions().timeZone);
    //SELECT id, compitition_name, logo, description, start_date, end_date, start_time, end_time, slot_time, waiting_time, status, created_at FROM competition where competition_type='special' and start_date >= now()::date
    const competition = await db.query("select * from ( SELECT id, compitition_name, logo, description, start_date, end_date, start_time, end_time, slot_time, waiting_time, status, competition_type, created_at, start_date_time as league_date, end_date_time, now() FROM competition) t where competition_type='special' and status=1 order by league_date desc");
    // IF A USER ISN'T FOUND
      if (typeof competition.rows !== 'undefined' && competition.rows.length == 0) {
        return res.status(200).json({ success: false, data:[], message: 'المسابقة غير موجودة' }); // Competition not found
      }
     // console.log(competition.rows);

     var quiz_type = 'special_competition';
     var user_id = req.params.user_id;
     
     var result = [];

      for (var i=0; i<competition.rows.length; i++)
      {
        var competitionArr = competition.rows[i];
        
        const chkQueSave = await db.query("SELECT * FROM user_answer WHERE user_id=$1 AND quiz_id=$2 AND quiz_type=$3", [user_id, competitionArr.id, quiz_type]);
        //console.log( competitionArr.id, quiz_type, chkQueSave.rows.length);

        ///////summery/////////////////////////
        const summeryQ = await db.query("SELECT id, question_name FROM competition_question WHERE competition_id=$1", [ competitionArr.id]);
        //var summeryArr=summeryQ.rows;

        var questionObj     = summeryQ.rows;
        let total_correct_answer = 0;
        //var questionObj = chkQueSave.rows;
        if(chkQueSave.rows.length !== 0)
        {
          competitionArr['is_play'] = true;
          for (var j=0; j<chkQueSave.rows.length; j++)
          {
            var getAnswer = chkQueSave.rows[j];
            if(getAnswer['correct_answer']==getAnswer['user_answer']){
              total_correct_answer = total_correct_answer+1;
              
            }
          }
          
        }else{
          competitionArr['is_play'] = false;
        }
        
        //console.log( competitionArr.id, quiz_type, questionObj.length);
        //console.log( 'chkQueSave length', chkQueSave.rows.length);
        //console.log( 'total_correct_answer', total_correct_answer);
        // check here for All answers are correct (win the game).
        if(questionObj.length == total_correct_answer){ 
          var correct_answer = true;
          competitionArr['is_block'] = false;
        }else{
          var correct_answer = false;
          //check competition lock 
          
          const chkCompLock = await db.query("SELECT id, competition_id, lock_date_time, now() FROM competition_lock WHERE user_id=$1 AND competition_id=$2 AND competition_type=$3", [user_id, competitionArr.id, quiz_type]);
          
          if(chkCompLock.rows.length == 0)
          { 
            competitionArr['is_block'] = false;
          }else{
            var date1 = new Date(chkCompLock.rows[0]['now']).getTime();
            var date2 = new Date(chkCompLock.rows[0]['lock_date_time']).getTime();
            if(date2 >= date1){
              competitionArr['is_block'] = true;
            }else{
              competitionArr['is_block'] = false;
            }
            
          }
        }
        competitionArr['is_correct_answer'] = correct_answer;
        //console.log('competitionArr', competitionArr)
        //var ress = {user_id : refObj[i].user_id, user_name : userAnsObj[0].full_name, user_image: userAnsObj[0].user_avatar, country: userAnsObj[0].country, user_answers: totalAnswer, correct_answers : totalAnswerss, score :scoreData, total_times : totalTime};
        result.push(competitionArr);
        
      }
     return res.json({
             "status": 200,
             'data':result,
           });

  } catch (err) {
    return next(err);
  }
});

router.post("/go_live_user", async function(req, res, next) {
  //####check is valid access_token#####
  const isTrue= await isValidToken(req.body.access_token);
  if(!isTrue){
         return res.json({
             "status": 201,
             "data":[],
             "message":"رمز الدخول غير صالح"
           });
  }
  if(req.body.competition_id){
    let competition_id = req.body.competition_id;
    try {
      const results = await db.query("SELECT id, broadcaster_id, compitition_name, description, logo, channel_name, token, is_live FROM competition where id=$1 ", [competition_id]);

      // IF A USER ISN'T FOUND
      if (typeof results.rows !== 'undefined' && results.rows.length == 0) {
        return res.status(200).json({ success: false, data:[], message: 'المسابقة غير موجودة' });
      }
      
      return res.json({
        "status": 200,
        'data':results.rows,
      });
    } catch (err) {
      return next(err);
    }
  }else{
  return res.json({ status: 200, message: "المعلومات المطلوبة غير متوفرة" });
  }
});

router.get("/get_slot_data/:competition_id/:access_token", async function(req, res, next) {
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
    var competition_id = req.params.competition_id;
    //console.log("select * from ( SELECT id, competition_type, status, to_timestamp(start_date || ' ' || start_time, 'YYYY-MM-DD HH24:MI:SS') as league_date, now() FROM competition) t where competition_type='special' and status=1 and id="+competition_id);
    const competition = await db.query("select * from ( SELECT id, competition_type, status, start_date_time as league_date, now() FROM competition) t where competition_type='special' and status=1 and id="+competition_id );
    // IF A USER ISN'T FOUND
      if (typeof competition.rows !== 'undefined' && competition.rows.length == 0) {
        return res.json({ status:201, success: false, message: 'Competition slot not found' });
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

router.get("/get_promotion/:id/:access_token", async function(req, res, next) {
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
    const competition = await db.query('SELECT id, compitition_name, promotion_type, instagram_url, twitter_url, snapchat_url, app_logo, app_name, apple_store_url, apple_schema, google_play_url, affiliate_url, status, created_at FROM competition WHERE id = $1', [req.params.id]);
    // IF A USER ISN'T FOUND
      if (typeof competition.rows !== 'undefined' && competition.rows.length == 0) {
        return res.status(200).json({ success: false, data:[], message: 'Promotion not found' });
      }
      var questionObj = competition.rows;

     		//var changeObj = questionObj.map((item) => ({ option1: item.answer }));

     		var changeObj = questionObj.map( s => {
			  if ( s.hasOwnProperty("affiliate_url") )
			  {
			     s.affiliate_code = s.affiliate_url;
			     delete s.affiliate_url;   
			  }
			  
			  return s;
			})

     return res.json({
             "status": 200,
             'data':changeObj,
           });

  } catch (err) {
    return next(err);
  }
});

router.get("/get_narration/:id/:access_token", async function(req, res, next) {
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
    /* select * from ( SELECT id, compitition_name, logo, description, start_date, end_date, start_time, end_time, slot_time, waiting_time, status, competition_type, created_at, to_timestamp(start_date || ' ' || start_time, 'YYYY-MM-DD HH24:MI:SS') as league_date FROM competition) t where league_date >= now() and competition_type='special' and status=1 */

    const competition = await db.query("SELECT cn.*, start_date_time as league_date, end_date_time, now()  FROM competition_narration_company_details cn inner join competition cm on cm.id = cn.competition_id WHERE cn.competition_id = $1", [req.params.id]);
    // IF A USER ISN'T FOUND
      if (typeof competition.rows !== 'undefined' && competition.rows.length == 0) {
        return res.status(200).json({ success: false, data:[], message: 'Narration not found' });
      }
      var current_date = await db.query("select now() ");
      var current_date_time = current_date.rows[0].now;
      
      var date_from_database = competition.rows[0].league_date;
      //data from database
      //console.log("db: " + date_from_database)
      //console.log("current date: " + current_date_time)
      //console.log('current_date_time - date_from_database', current_date_time - date_from_database)
      /* var TWO_MIN=2*60*1000;

      if((date_from_database - current_date_time) <= TWO_MIN) {
        return res.json({ status: 201, data: [], message: 'لقد انتهي وقتك' }); // Your time has expired.
      } */

      var narrationObj = competition.rows;

     		//var changeObj = narrationObj.map((item) => ({ option1: item.answer }));

        //let obj = narrationObj.find(f=>f.narration_type=='narration');
        //if(obj)
         // obj.narration_type='1';

        //obj =  narrationObj.find(f=>f.narration_type=='live_stareaming');

        // Change narration type value in numeric type
        if(narrationObj[0].narration_type=='narration'){
          narrationObj[0].narration_type = '1';
        }else{
          narrationObj[0].narration_type = '2';
        }


     return res.json({
             "status": 200,
             'data':narrationObj,
             'message':'success'
           });

  } catch (err) {
    return next(err);
  }
});

router.post("/affiliate_check", async function(req, res, next){
  //####check is valid access_token#####
  const isTrue= await isValidToken(req.body.access_token);
  if(!isTrue){
         return res.json({
             "status": 201,
             "data":[],
             "message":"رمز الدخول غير صالح"
           });
  }
  let user_id = req.body.user_id;
  let competition_id = req.body.competition_id;
  let affiliate_code = req.body.affiliate_code;
  let download = req.body.download;
  
  /* return res.json({
    'status': 200,
    'data':typeof affiliate_code,
    'message':'success'
  }); */

  result = {};
  const competition = await db.query("SELECT id, affiliate_url, competition_type, promotion_type FROM competition WHERE id=$1", [competition_id]);
  var competitionObj = competition.rows;
  var affiliate_code_db = competitionObj[0].affiliate_url;
  var competition_type = competitionObj[0].competition_type;
  var promotion_type = competitionObj[0].promotion_type;
 


  result.promotion_type = promotion_type;

  if(typeof affiliate_code !== 'undefined' && affiliate_code_db == affiliate_code){
    is_verify = true;
    const affiliate = await db.query("INSERT INTO competition_affiliate_check (competition_id, code, user_code, competition_type, created_by, is_verify, promotion_type) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
          [competition_id, affiliate_code_db, affiliate_code, competition_type, user_id, is_verify, promotion_type]
          );
    result.affiliate_code = affiliate_code;
    result.is_verify = is_verify;
    return res.json({
      'status': 200,
      'data':result,
      'message':'success'
    });
  }else if(typeof download !== 'undefined'){
    is_verify = true;
    const affiliate = await db.query("INSERT INTO competition_affiliate_check (competition_id, competition_type, created_by, is_verify, promotion_type, download) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
          [competition_id,  competition_type, user_id, is_verify, promotion_type, download]
          );

    result.is_verify = is_verify;
    return res.json({
      'status': 200,
      'data':result,
      'message':'success'
    });
  }else{
    is_verify = false;
    result.is_verify = is_verify;
    return res.json({
      'status': 200,
      'data':result,
      'message':'الرمز غير صحيح ! برجاء التأكد من رمز التحقق و المحاولة مرة أخري'
    });
  }

});

router.post("/affiliate_check_list", async function(req, res, next){
  //####check is valid access_token#####
  const isTrue= await isValidToken(req.body.access_token);
  if(!isTrue){
         return res.json({
             "status": 201,
             "data":[],
             "message":"رمز الدخول غير صالح"
           });
  }
  let user_id = req.body.user_id;
  let competition_id = req.body.competition_id;

  result = {};
  const affiliate = await db.query("SELECT id, code, is_verify, download FROM competition_affiliate_check WHERE competition_id=$1 and created_by=$2 order by id desc", [competition_id, user_id]);

  const promotion = await db.query("SELECT id, promotion_type FROM competition WHERE id=$1 order by id desc", [competition_id]);

  var affiliateObj = affiliate.rows;
  //console.log(affiliateObj);
  var promotionObj = promotion.rows;
  var promotion_type = promotionObj[0].promotion_type;
  result.promotion_type = promotion_type;

  // IF A USER ISN'T FOUND
  if (typeof affiliate.rows !== 'undefined' && affiliate.rows.length == 0) {
    result.is_verify = false;
    return res.json({
      'status': 200,
      'data':result,
      'message':'الرمز غير صحيح ! برجاء التأكد من رمز التحقق و المحاولة مرة أخري'
    });
  }
  if(promotion_type == '1'){
    result.is_verify = affiliateObj[0].is_verify;
  }else if(promotion_type == '2'){
    result.is_verify = affiliateObj[0].download;
  }else if(promotion_type == '3'){
    result.is_verify = affiliateObj[0].is_verify;
  }

  

  return res.json({
    'status': 200,
    'data':result,
    'message':'success'
  });

});


module.exports = router;