const express = require("express");
const router = express.Router();
const db = require("../db");
const transport = require("../config/smtp.js");
const common = require("../config/common.js");

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


router.get("/s3", async function(req, res, next) {
const params = {
        Bucket: 'allam-stg',
        Key: "user-default.png" //if any sub folder-> path/of/the/folder.ext
}
try {
        await s3.headObject(params).promise()
        console.log("File Found in S3")

        s3.getObject(params, function(err, data) {
            res.writeHead(200, {'Content-Type': 'image/jpeg'});
            res.write(data.Body, 'binary');
            res.end(null, 'binary');
        });
    } catch (err) {
        console.log("لم يتم العثور علي خطأ  : " + err.code)
    }
});

/////end s3 integration////


///get qustion by quiz id
router.get("/get_question_by_quiz/:access_token/:quiz_id", async function(req, res, next) {
  try {

      //####check is valid access_token#####
      const isTrue= await isValidToken(req.params.access_token);
      if(!isTrue){
             return res.json({
                 "status": 201,
                 "data":{},
                 "message":"رمز الدخول غير صالح"
               });
      }

      const question = await db.query("SELECT cms_quiz_question.* FROM cms_quiz_question_mapping JOIN cms_quiz_question ON cms_quiz_question_mapping.question_id::integer=cms_quiz_question.id WHERE cms_quiz_question_mapping.quiz_id=$1 AND cms_quiz_question.status=$2", [req.params.quiz_id,'1']);
      let questionObj      = question.rows;
      // var qFinal      = [];
      // for(let i=0;i<questionObj.length;i++)
      // {
      //   let qObj     = questionObj[i];
      //   if((questionObj[i].question!='' && questionObj[i].question!=null) && (questionObj[i].question_image_url!='' && questionObj[i].question_image_url!=null))
      //   {
      //     qObj['question_type']='text_and_image';  
      //   }
      //   else if((questionObj[i].question!='' && questionObj[i].question!=null) && (questionObj[i].question_image_url=='' || questionObj[i].question_image_url==null))
      //   {
      //     qObj['question_type']='text';  
      //   }
      //   else if((questionObj[i].question=='' || questionObj[i].question==null) && (questionObj[i].question_image_url!='' && questionObj[i].question_image_url!=null))
      //   {
      //     qObj['question_type']='image';  
      //   }
      //   else{
      //     qObj['question_type']='text'; 
      //   }

      //    //text/image/text_and_image
      //   qFinal.push(qObj);
      // }

         return res.json({
             "status": 200,
             'data':questionObj,
             "message":"success"
           });

  } catch (err) {
    return next(err);
  }
});

///get qustion new by quiz id
router.get("/get_question_by_quiz_new/:access_token/:quiz_id/:user_id", async function(req, res, next) {
  try {

      //####check is valid access_token#####
      const isTrue= await isValidToken(req.params.access_token);
      if(!isTrue){
             return res.json({
                 "status": 201,
                 "data":{},
                 "message":"رمز الدخول غير صالح"
               });
      }
      var quiz_id = req.params.quiz_id;
      var user_id = req.params.user_id;

      ///////////////////////////////////////////
        var newlyGameId=0;
        const checkGame = await db.query("SELECT * FROM se_user_game WHERE type=$1 AND quiz_id=$2 AND user_id=$3 AND status=$4 ", [
           'competitive',quiz_id,user_id,'0']);
        
        if(checkGame.rows.length==0)
        {
          const newGameq = await db.query(
              "INSERT INTO se_user_game (type,quiz_id,user_id,status) VALUES ($1,$2,$3,$4) RETURNING *",
              ['competitive',quiz_id,user_id,'0']);

          newlyGameId = newGameq.rows[0].id;

          ///insert questons
          const question = await db.query("SELECT cms_quiz_question.* FROM cms_quiz_question_mapping JOIN cms_quiz_question ON cms_quiz_question_mapping.question_id::integer=cms_quiz_question.id WHERE cms_quiz_question_mapping.quiz_id=$1 AND cms_quiz_question.status=$2", [quiz_id,'1']);
          var questionArr=question.rows;
          var questionData = [];
          for (var i=0; i<questionArr.length; i++)
          { 
            let questionObj = questionArr[i];
            var insert = await db.query("INSERT INTO se_game_result (se_game_id,question_id,correct_answer,user_id,is_answered,created_by) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
            [newlyGameId, questionObj.id, questionObj.answer, user_id,'no',user_id]
             );
          }
          //////////////////////////////
        }
        else{
          newlyGameId=checkGame.rows[0].id;
        }
        ///////////////////////////////////////////
        const questionQuery = await db.query("SELECT cqq.*,sgr.is_answered,sgr.user_answer FROM se_game_result sgr INNER JOIN cms_quiz_question cqq ON sgr.question_id=cqq.id WHERE sgr.se_game_id=$1", [newlyGameId]);

        var questionArrObj=questionQuery.rows;
        var questionData = [];
        for (var i=0; i<questionArrObj.length; i++)
        { 
           var item =questionArrObj[i];
           //////////////////////////////
           // if((item.question!='' && item.question!=null) && (item.question_image_url!='' && item.question_image_url!=null))
           //  {
           //    item['question_type']='text_and_image';  
           //  }
           //  else if((item.question!='' && item.question!=null) && (item.question_image_url=='' || item.question_image_url==null))
           //  {
           //    item['question_type']='text';  
           //  }
           //  else if((item.question=='' || item.question==null) && (item.question_image_url!='' && item.question_image_url!=null))
           //  {
           //    item['question_type']='image';  
           //  }
           //  else{
           //    item['question_type']='text'; 
           //  }
            item['game_id']=newlyGameId;
           //////////////////////////////
            questionData.push(item);
        }

         return res.json({
             "status": 200,
             'data':questionData,
             "message":"success"
           });

  } catch (err) {
    return next(err);
  }
});


///get quiz lession
router.post("/get_unit_lesson", async function(req, res, next) {
  if(req.body.access_token && req.body.user_id && req.body.subject_id && req.body.class_id && req.body.semester_id && req.body.district_id)
  {
    var access_token    = req.body.access_token;
    var user_id         = req.body.user_id;
    var class_id        = req.body.class_id;
    var semester_id     = req.body.semester_id;
    var district_id     = req.body.district_id;
    var subject_id      = req.body.subject_id;
   
    try {

        //####check is valid access_token#####
        const isTrue= await isValidToken(access_token);
        if(!isTrue){
               return res.json({
                   "status": 201,
                   "data":{},
                   "message":"رمز الدخول غير صالح"
                 });
        }

       const units = await db.query("SELECT cqq.*,cqq.quiz_type as quiz_id,cqq.subject as subject_id,ms.name as subject,cqq.chapter as chapter_id,mc.name as chapter FROM cms_quiz_question cqq JOIN master_chapter mc ON mc.id=cqq.chapter::integer JOIN master_subject ms ON ms.id=cqq.subject::integer WHERE cqq.type=$1 AND cqq.subject=$2 AND cqq.class=$3 AND cqq.semester=$4", [
            'curriculum',subject_id,class_id,semester_id]);
         var arrayData = [];
         var unitsArr=units.rows;
         var uniqueData = [];
         var uniqueSeData=[];
           
          for (var i=0; i<unitsArr.length; i++)
          { 
            var item =unitsArr[i];

            if(uniqueData.indexOf(item['chapter_id']) ==-1)
            {
              var lesson =  await db.query("SELECT cqq.*,cqq.chapter as chapter_id, mc.name as chapter,cqq.lesson as lesson_id, ml.name as lesson FROM cms_quiz_question cqq JOIN master_chapter mc ON mc.id=cqq.chapter::integer JOIN master_lesson ml ON ml.id=cqq.lesson::integer WHERE cqq.type=$1 AND cqq.subject=$2 AND cqq.class=$3 AND cqq.semester=$4 AND cqq.chapter=$5", ['curriculum',subject_id,class_id,semester_id,item['chapter_id']]);

              var lessonData = [];
              var lessionArr=lesson.rows;
              var uniqueSeData=[];

              for (var j=0; j<lessionArr.length; j++) 
              {
                var sub_item = lessionArr[j];
                var status=0;
                var lesson_check = await db.query("SELECT * FROM user_quiz_attempt WHERE user_id=$1 AND class_id=$2 AND subject_id=$3 AND semester_id=$4 AND chapter_id=$5 AND lesson_id=$6", [user_id,class_id,subject_id,semester_id,item['chapter_id'],sub_item['lesson_id']]);
                 if(lesson_check.rows.length > 0){
                  status=lesson_check.rows[0].status;
                 }

                if(!uniqueSeData.includes(sub_item['lesson_id'])){
                    uniqueSeData.push(sub_item['lesson_id']);
                    lessonData.push({"id": sub_item['lesson_id'],"name": sub_item['lesson'],"status": status});
                }
              }

            
              uniqueData.push(item['chapter_id']);
              arrayData.push({subject: item['subject'],subject_id: item['subject_id'],name: item['chapter'], id: item['chapter_id'],'lesson':lessonData});
            }
          }

           return res.json({
               "status": 200,
               'data':{'chapter':arrayData},
               "message":"success"
             });

    } catch (err) {
      return next(err);
    }
  }
  else{
     return res.json({"status": 403, "data":{},"message": "المعلومات المطلوبة غير متوفرة" });
  }
});

///get quiz lession
// router.post("/get_unit_lesson_new", async function(req, res, next) {
//   if(req.body.access_token && req.body.user_id && req.body.subject_id && req.body.class_id && req.body.semester_id)
//   {
//     var access_token    = req.body.access_token;
//     var user_id         = req.body.user_id;
//     var class_id        = req.body.class_id;
//     var semester_id     = req.body.semester_id;
//     var district_id     = req.body.district_id;
//     var subject_id      = req.body.subject_id;
   
//     try {

//         //####check is valid access_token#####
//         const isTrue= await isValidToken(access_token);
//         if(!isTrue){
//                return res.json({
//                    "status": 201,
//                    "data":{},
//                    "message":"رمز الدخول غير صالح"
//                  });
//         }

//         //update district/////
//         db.query("UPDATE users SET district=$1 WHERE id=$2",[district_id,user_id]);

//        const units = await db.query("SELECT cqq.*,cqq.quiz_type as quiz_id,cqq.subject as subject_id,ms.name as subject,cqq.chapter as chapter_id,mc.name as chapter FROM cms_quiz_question cqq INNER JOIN master_chapter mc ON mc.id=cqq.chapter::integer INNER JOIN master_subject ms ON ms.id=cqq.subject::integer WHERE cqq.type=$1 AND cqq.subject=$2 AND cqq.class=$3 AND cqq.semester=$4 order by cqq.lesson ASC", [
//             'curriculum',subject_id,class_id,semester_id]);
//          var arrayData = [];
//          var unitsArr=units.rows;
//          var uniqueData = [];
//          var uniqueSeData=[];
           
//           for (var i=0; i<unitsArr.length; i++)
//           { 
//             var item =unitsArr[i];

//             if(uniqueData.indexOf(item['chapter_id']) ==-1)
//             {
//               var lesson =  await db.query("SELECT cqq.*,cqq.chapter as chapter_id, mc.name as chapter,cqq.lesson as lesson_id, ml.name as lesson FROM cms_quiz_question cqq JOIN master_chapter mc ON mc.id=cqq.chapter::integer JOIN master_lesson ml ON ml.id=cqq.lesson::integer WHERE cqq.type=$1 AND cqq.subject=$2 AND cqq.class=$3 AND cqq.semester=$4 AND cqq.chapter=$5", ['curriculum',subject_id,class_id,semester_id,item['chapter_id']]);

//               var lessonData = [];
//               var lessionArr=lesson.rows;
//               var uniqueSeData=[];

//               for (var j=0; j<lessionArr.length; j++) 
//               {
//                 var sub_item = lessionArr[j];
//                 var status=0;
//                 var lesson_check = await db.query("SELECT * FROM se_user_game WHERE user_id=$1 AND class_id=$2 AND subject_id=$3 AND semester_id=$4 AND chapter_id=$5 AND lesson_id=$6", [user_id,class_id,subject_id,semester_id,item['chapter_id'],sub_item['lesson_id']]);
//                  if(lesson_check.rows.length > 0)
//                  {
                  
//                   if(lesson_check.rows[0].attempt_status==null){
//                     status=0;
//                   }
//                   else{
//                     status=lesson_check.rows[0].attempt_status;
//                   }
//                  }

//                 if(!uniqueSeData.includes(sub_item['lesson_id'])){
//                     uniqueSeData.push(sub_item['lesson_id']);
//                     lessonData.push({"id": sub_item['lesson_id'],"name": sub_item['lesson'],"status": status});
//                 }
//               }

//               uniqueData.push(item['chapter_id']);
//               arrayData.push({subject: item['subject'],subject_id: item['subject_id'],name: item['chapter'], id: item['chapter_id'],'lesson':lessonData});
//             }
//           }

//            return res.json({
//                "status": 200,
//                'data':{'chapter':arrayData},
//                "message":"success"
//              });

//     } catch (err) {
//       return next(err);
//     }
//   }
//   else{
//      return res.json({"status": 403, "data":{},"message": "المعلومات المطلوبة غير متوفرة" });
//   }
// });
router.post("/get_unit_lesson_new", async function(req, res, next) {
  if(req.body.access_token && req.body.user_id && req.body.subject_id && req.body.class_id && req.body.semester_id)
  {
    var access_token    = req.body.access_token;
    var user_id         = req.body.user_id;
    var class_id        = req.body.class_id;
    var semester_id     = req.body.semester_id;
    var district_id     = req.body.district_id;
    var subject_id      = req.body.subject_id;
   
    try {

        //####check is valid access_token#####
        const isTrue= await isValidToken(access_token);
        if(!isTrue){
               return res.json({
                   "status": 201,
                   "data":{},
                   "message":"رمز الدخول غير صالح"
                 });
        }

        //update district/////
        db.query("UPDATE users SET district=$1 WHERE id=$2",[district_id,user_id]);

        const units = await db.query("SELECT cqq.*,cqq.quiz_type as quiz_id,cqq.subject as subject_id,ms.name as subject,cqq.chapter as chapter_id,mc.name as chapter FROM cms_quiz_question cqq INNER JOIN master_chapter mc ON mc.id=cqq.chapter::integer INNER JOIN master_subject ms ON ms.id=cqq.subject::integer WHERE cqq.type=$1 AND cqq.subject=$2 AND cqq.class=$3 AND cqq.semester=$4 order by cast(chapter as double precision) ASC", [
            'curriculum',subject_id,class_id,semester_id]);
         var arrayData = [];
         var unitsArr=units.rows;
         var uniqueData = [];
         var uniqueSeData=[];
           
          for (var i=0; i<unitsArr.length; i++)
          { 
            var item =unitsArr[i];

            if(uniqueData.indexOf(item['chapter_id']) ==-1)
            {
              var lesson =  await db.query("SELECT cqq.*,cqq.chapter as chapter_id, mc.name as chapter,cqq.lesson as lesson_id, ml.name as lesson FROM cms_quiz_question cqq JOIN master_chapter mc ON mc.id=cqq.chapter::integer JOIN master_lesson ml ON ml.id=cqq.lesson::integer WHERE cqq.type=$1 AND cqq.subject=$2 AND cqq.class=$3 AND cqq.semester=$4 AND cqq.chapter=$5 order by cast(cqq.lesson as double precision) ASC", ['curriculum',subject_id,class_id,semester_id,item['chapter_id']]);

              var lessonData = [];
              var lessionArr=lesson.rows;
              var uniqueSeData=[];

              for (var j=0; j<lessionArr.length; j++) 
              {
                var sub_item = lessionArr[j];
                var status=0;
                var lesson_check = await db.query("SELECT * FROM se_user_game WHERE user_id=$1 AND class_id=$2 AND subject_id=$3 AND semester_id=$4 AND chapter_id=$5 AND lesson_id=$6", [user_id,class_id,subject_id,semester_id,item['chapter_id'],sub_item['lesson_id']]);
                 if(lesson_check.rows.length > 0)
                 {
                  
                  if(lesson_check.rows[0].attempt_status==null){
                    status=0;
                  }
                  else{
                    status=lesson_check.rows[0].attempt_status;
                  }
                 }

                if(!uniqueSeData.includes(sub_item['lesson_id'])){
                    uniqueSeData.push(sub_item['lesson_id']);
                    lessonData.push({"id": sub_item['lesson_id'],"name": sub_item['lesson'],"status": status});
                }
              }
              console.log('----before print---');
              console.log(lessonData);
              console.log('--after print---');
              uniqueData.push(item['chapter_id']);
              arrayData.push({subject: item['subject'],subject_id: item['subject_id'],name: item['chapter'], id: item['chapter_id'],'lesson':lessonData});
            }
          }
         
           return res.json({
               "status": 200,
               'data':{'chapter':arrayData},
               "message":"success"
             });

    } catch (err) {
      return next(err);
    }
  }
  else{
     return res.json({"status": 403, "data":{},"message": "المعلومات المطلوبة غير متوفرة" });
  }
});


///get subject by class & semester
router.post("/get_subject_by_class_sem", async function(req, res, next) {
  
  if(req.body.access_token && req.body.class_id && req.body.semester_id)
  {
    var access_token    = req.body.access_token;
    var class_id        = req.body.class_id;
    var semester_id     = req.body.semester_id;
    var district_id     = req.body.district_id;

    try {

        //####check is valid access_token#####
        const isTrue= await isValidToken(access_token);
        if(!isTrue){
               return res.json({
                   "status": 201,
                   "data":{},
                   "message":"رمز الدخول غير صالح"
                 });
        }

          const question = await db.query("SELECT ms.* FROM cms_quiz_question cqq INNER JOIN master_subject ms ON ms.id=cqq.subject::integer WHERE cqq.type=$1 AND cqq.class=$2 AND cqq.semester=$3 AND ms.status=$4 group by ms.id order by ms.name asc", [
           'curriculum',class_id,semester_id,'1']);

          var resultsArr = [];
 
          for(var i =0; i< question.rows.length; i++){
            var questionObj=question.rows[i];
            //questionObj['icon'] ="default/iconbook.png";
            questionObj['icon1'] ="default/iconbook1.png";
            resultsArr.push(questionObj);
          }

           return res.json({
               "status": 200,
               'data':resultsArr,
               "message":"success"
             });

    } catch (err) {
      return next(err);
    }
  }
  else{
     return res.json({"status": 403, "data":{},"message": "المعلومات المطلوبة غير متوفرة" });
  }
});


///get all curriculum qustion
router.post("/get_curriculam_question", async function(req, res, next) {
  
  if(req.body.access_token && req.body.user_id && req.body.subject_id && req.body.class_id && req.body.semester_id)
  {
    var access_token    = req.body.access_token;
    var user_id         = req.body.user_id;
    var class_id        = req.body.class_id;
    var semester_id     = req.body.semester_id;
    var subject_id      = req.body.subject_id;
    var chapter_id      = req.body.chapter_id;
    var lesson_id       = req.body.lesson_id;


    try {

        //####check is valid access_token#####
        const isTrue= await isValidToken(access_token);
        if(!isTrue){
               return res.json({
                   "status": 201,
                   "data":{},
                   "message":"رمز الدخول غير صالح"
                 });
        }

          //const question = await db.query("SELECT cqq.* FROM cms_quiz_question cqq LEFT JOIN user_answer ua ON cqq.id=ua.question_id WHERE ua.question_id IS NULL AND cqq.type=$1 AND cqq.subject=$2 AND cqq.class=$3 AND cqq.semester=$4 AND cqq.chapter=$5 AND cqq.lesson=$6 order by cqq.id desc limit 20", [
           //'curriculum',subject_id,class_id,semester_id,chapter_id,lesson_id]);

          const question = await db.query("SELECT cqq.* FROM cms_quiz_question cqq  WHERE cqq.type=$1 AND cqq.subject=$2 AND cqq.class=$3 AND cqq.semester=$4 AND cqq.chapter=$5 AND cqq.lesson=$6 AND cqq.id NOT IN (SELECT question_id FROM user_answer WHERE user_id=$7 AND is_answered=$8) order by cqq.id desc limit 20", [
           'curriculum',subject_id,class_id,semester_id,chapter_id,lesson_id,user_id,'yes']);

          var questionArr=question.rows;
          var questionData = [];
          for (var i=0; i<questionArr.length; i++)
          { 
            var item =questionArr[i];
            var is_answered ='no';
            const chkQueSave = await db.query("SELECT * FROM user_answer WHERE class_id=$1 AND semester_id=$2 AND subject_id=$3 AND chapter_id=$4 AND lesson_id=$5 AND user_id=$6 AND question_id=$7", [class_id,semester_id,subject_id,chapter_id,lesson_id,user_id,item['id']]);
             if(chkQueSave.rows.length > 0){
               is_answered=chkQueSave.rows[0].is_answered;
             }
             item['is_answered'] =is_answered;
             //////////////////////////////
             // if((item.question!='' && item.question!=null) && (item.question_image_url!='' && item.question_image_url!=null))
             //  {
             //    item['question_type']='text_and_image';  
             //  }
             //  else if((item.question!='' && item.question!=null) && (item.question_image_url=='' || item.question_image_url==null))
             //  {
             //    item['question_type']='text';  
             //  }
             //  else if((item.question=='' || item.question==null) && (item.question_image_url!='' && item.question_image_url!=null))
             //  {
             //    item['question_type']='image';  
             //  }
             //  else{
             //    item['question_type']='text'; 
             //  }

             //////////////////////////////

            questionData.push(item);

          }
           return res.json({
               "status": 200,
               'data':question.rows,
               "message":"success"
             });

    } catch (err) {
      return next(err);
    }
  }
  else{
     return res.json({"status": 403, "data":{},"message": "المعلومات المطلوبة غير متوفرة" });
  }
});

///get all curriculum qustion new
router.post("/get_curriculam_question_new_backup", async function(req, res, next) {
  
  if(req.body.access_token && req.body.user_id && req.body.subject_id && req.body.class_id && req.body.semester_id)
  {
    var access_token    = req.body.access_token;
    var user_id         = req.body.user_id;
    var class_id        = req.body.class_id;
    var semester_id     = req.body.semester_id;
    var subject_id      = req.body.subject_id;
    var chapter_id      = req.body.chapter_id;
    var lesson_id       = req.body.lesson_id;

    try {

        //####check is valid access_token#####
        const isTrue= await isValidToken(access_token);
        if(!isTrue){
               return res.json({
                   "status": 201,
                   "data":{},
                   "message":"رمز الدخول غير صالح"
                 });
        }

        var newlyGameId=0;
        const checkGame = await db.query("SELECT * FROM se_user_game WHERE type=$1 AND class_id=$2 AND semester_id=$3 AND subject_id=$4 AND chapter_id=$5 AND lesson_id=$6 AND user_id=$7 AND status=$8 ", [
           'curriculum',class_id,semester_id,subject_id,chapter_id,lesson_id,user_id,'0']);
        
        if(checkGame.rows.length==0)
        {
          const newGameq = await db.query(
              "INSERT INTO se_user_game (type,class_id,semester_id,subject_id,chapter_id,lesson_id,user_id,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
              ['curriculum',class_id,semester_id,subject_id,chapter_id,lesson_id,user_id,'0']);
          newlyGameId = newGameq.rows[0].id;

          ///insert questons

          const question = await db.query("SELECT cqq.* FROM cms_quiz_question cqq  WHERE cqq.type=$1 AND cqq.subject=$2 AND cqq.class=$3 AND cqq.semester=$4 AND cqq.chapter=$5 AND cqq.lesson=$6 AND cqq.status=$7 order by random() limit 20", [
           'curriculum',subject_id,class_id,semester_id,chapter_id,lesson_id,'1']);

          var questionArr=question.rows;
          console.log(questionArr);
          var questionData = [];
          for (var i=0; i<questionArr.length; i++)
          { 
            let questionObj = questionArr[i];
            var insert = await db.query("INSERT INTO se_game_result (se_game_id,question_id,correct_answer,user_id,is_answered,created_by) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
            [newlyGameId, questionObj.id, questionObj.answer, user_id,'no',user_id]
             );
          }
          //////////////////////////////
        }
        else{
          newlyGameId=checkGame.rows[0].id;
        }
        //
          const questionQuery = await db.query("SELECT cqq.*,sgr.is_answered,sgr.user_answer FROM se_game_result sgr INNER JOIN cms_quiz_question cqq ON sgr.question_id=cqq.id WHERE sgr.se_game_id=$1 order by sgr.is_answered desc", [newlyGameId]);

          var questionArrObj=questionQuery.rows;
          var questionData = [];
          for (var i=0; i<questionArrObj.length; i++)
          { 
             var item =questionArrObj[i];
             //////////////////////////////
             // if((item.question!='' && item.question!=null) && (item.question_image_url!='' && item.question_image_url!=null))
             //  {
             //    item['question_type']='text_and_image';  
             //  }
             //  else if((item.question!='' && item.question!=null) && (item.question_image_url=='' || item.question_image_url==null))
             //  {
             //    item['question_type']='text';  
             //  }
             //  else if((item.question=='' || item.question==null) && (item.question_image_url!='' && item.question_image_url!=null))
             //  {
             //    item['question_type']='image';  
             //  }
             //  else{
             //    item['question_type']='text'; 
             //  }
              item['game_id']=newlyGameId;
             //////////////////////////////
              questionData.push(item);
          }
          return res.json({
               "status": 200,
               'data':questionData,
               "message":"success"
             });

    } catch (err) {
      return next(err);
    }
  }
  else{
     return res.json({"status": 403, "data":{},"message": "المعلومات المطلوبة غير متوفرة" });
  }
});

router.post("/get_curriculam_question_new", async function(req, res, next) {
  
  if(req.body.access_token && req.body.user_id && req.body.subject_id && req.body.class_id && req.body.semester_id)
  {
    var access_token    = req.body.access_token;
    var user_id         = req.body.user_id;
    var class_id        = req.body.class_id;
    var semester_id     = req.body.semester_id;
    var subject_id      = req.body.subject_id;
    var chapter_id      = req.body.chapter_id;
    var lesson_id       = req.body.lesson_id;

    try {

        //####check is valid access_token#####
        const isTrue= await isValidToken(access_token);
        if(!isTrue){
               return res.json({
                   "status": 201,
                   "data":{},
                   "message":"رمز الدخول غير صالح"
                 });
        }

        var newlyGameId=0;
        const checkGame = await db.query("SELECT * FROM se_user_game WHERE type=$1 AND class_id=$2 AND semester_id=$3 AND subject_id=$4 AND chapter_id=$5 AND lesson_id=$6 AND user_id=$7 AND status=$8 ", [
           'curriculum',class_id,semester_id,subject_id,chapter_id,lesson_id,user_id,'0']);
        
        if(checkGame.rows.length==0)
        {
          const newGameq = await db.query(
              "INSERT INTO se_user_game (type,class_id,semester_id,subject_id,chapter_id,lesson_id,user_id,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
              ['curriculum',class_id,semester_id,subject_id,chapter_id,lesson_id,user_id,'0']);
          newlyGameId = newGameq.rows[0].id;

          ///insert questons

          //const question = await db.query("SELECT cqq.* FROM cms_quiz_question cqq  WHERE cqq.type=$1 AND cqq.subject=$2 AND cqq.class=$3 AND cqq.semester=$4 AND cqq.chapter=$5 AND cqq.lesson=$6 AND cqq.status=$7 order by random() limit 20", [
           //'curriculum',subject_id,class_id,semester_id,chapter_id,lesson_id,'1']);

          var question = await db.query("SELECT cqq.* FROM cms_quiz_question cqq WHERE cqq.type=$1 AND cqq.subject=$2 AND cqq.class=$3 AND cqq.semester=$4 AND cqq.chapter=$5 AND cqq.lesson=$6 AND cqq.status=$7 AND cqq.id NOT IN (SELECT question_id FROM se_game_result WHERE user_id=$8) order by random() limit 20", [
           'curriculum',subject_id,class_id,semester_id,chapter_id,lesson_id,'1',user_id]);
          var questionArr=question.rows;

          //for randome pick after complte all questions
          if(questionArr.length==0){
            var question_rnd = await db.query("SELECT cqq.* FROM cms_quiz_question cqq  WHERE cqq.type=$1 AND cqq.subject=$2 AND cqq.class=$3 AND cqq.semester=$4 AND cqq.chapter=$5 AND cqq.lesson=$6 AND cqq.status=$7 order by random() limit 20", [
           'curriculum',subject_id,class_id,semester_id,chapter_id,lesson_id,'1']);
            questionArr=question_rnd.rows;
          }
          
          var questionData = [];
          for (var i=0; i<questionArr.length; i++)
          { 
            let questionObj = questionArr[i];
            var insert = await db.query("INSERT INTO se_game_result (se_game_id,question_id,correct_answer,user_id,is_answered,created_by) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
            [newlyGameId, questionObj.id, questionObj.answer, user_id,'no',user_id]
             );
          }
          //////////////////////////////
        }
        else{
          newlyGameId=checkGame.rows[0].id;
        }
        //
          const questionQuery = await db.query("SELECT cqq.*,sgr.is_answered,sgr.user_answer FROM se_game_result sgr INNER JOIN cms_quiz_question cqq ON sgr.question_id=cqq.id WHERE sgr.se_game_id=$1 order by sgr.is_answered desc", [newlyGameId]);

          var questionArrObj=questionQuery.rows;
          var questionData = [];
          for (var i=0; i<questionArrObj.length; i++)
          { 
             var item =questionArrObj[i];
             //////////////////////////////
              item['game_id']=newlyGameId;
             //////////////////////////////
              questionData.push(item);
          }
          return res.json({
               "status": 200,
               'data':questionData,
               "message":"success"
             });

    } catch (err) {
      return next(err);
    }
  }
  else{
     return res.json({"status": 403, "data":{},"message": "المعلومات المطلوبة غير متوفرة" });
  }
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

/*
*********************************
* Function for save user answer for DC
*********************************
*/

router.post("/save_answer", async function(req, res, next) {
  
  if(req.body.access_token && req.body.user_id && req.body.quiz_id && req.body.answer)
  {
    var answerArr       = req.body.answer;
    var user_id         = req.body.user_id;
    var quiz_id         = req.body.quiz_id;
    var quiz_type       = req.body.quiz_type;
    var quiz_sub_type   = req.body.quiz_sub_type;
    var total_time   = req.body.total_time;

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
         var total_correct_answer=0;
         var total_incorrect_answer=0;
        //answerArr.forEach(answer => { 
          for (var i=0; i<answerArr.length; i++)
          {
              var answer = answerArr[i];
            if(answer['correct_answer']==answer['user_answer']){
              total_correct_answer=total_correct_answer+1;
              //point system
              var points = 2;
              competition_type = quiz_type;
              pointSystem(user_id, points, competition_type);
            }
            else{
              total_incorrect_answer=total_incorrect_answer+1;
            }
            const chkQueSave = await db.query("SELECT * FROM user_answer WHERE user_id=$1 AND quiz_id=$2 AND quiz_type=$3 AND question_id=$4", [user_id,quiz_id,quiz_type, answer['question_id']]);
            if(chkQueSave.rows.length == 0)
            {
              db.query(
              "INSERT INTO user_answer (user_id,quiz_id,quiz_type,quiz_sub_type,question_id,correct_answer,user_answer,created_by, total_time) VALUES ($1,$2,$3,$4,$5,$6,$7,$8, $9)",
              [user_id, quiz_id,quiz_type,quiz_sub_type,answer['question_id'],answer['correct_answer'],answer['user_answer'],user_id,answer['total_time']]);
            }
          };   

          ///////summery/////////////////////////
          const summeryQ = await db.query("SELECT cqq.* ,us.user_answer FROM user_answer us INNER JOIN competition_question cqq ON us.question_id::integer=cqq.id WHERE us.quiz_type=$1 AND us.user_id=$2 AND us.quiz_id=$3  order by us.id desc", [
            quiz_type, user_id, quiz_id]);
            //var summeryArr=summeryQ.rows;
 
             var questionObj     = summeryQ.rows;
             var summeryArr      = [];
             for(let i=0;i<questionObj.length;i++)
             {
               let qObj     = questionObj[i];
               qObj.option_type = 'text';
                qObj.question_type = qObj.file_type;
                qObj.question_image_url = qObj.question_file_url;
                qObj.question = qObj.question_name;
               //text/image/text_and_image
               summeryArr.push(qObj);
              }

              // check here for All answers are correct (win the game) (+10 added to the total points).
              if(questionObj.length == total_correct_answer){
                //point system
                var points = 10;
                competition_type = quiz_type;
                pointSystem(user_id, points, competition_type);
              }

        return res.json({
             "status": 200,
             "data": {"question":summeryArr, "total_correct_answer":total_correct_answer,"total_incorrect_answer":total_incorrect_answer,"total_points":total_correct_answer},
             "message":"data saved successfully"
           });

    } catch (err) {
      return next(err);
    }
  }
  else{
     return res.json({"status": 403, "data":{},"message": "المعلومات المطلوبة غير متوفرة" });
  }
});

/*
*********************************
* Function for save user answer for SC
*********************************
*/

router.post("/save_sc_answer", async function(req, res, next) {
  
  if(req.body.access_token && req.body.user_id && req.body.quiz_id && req.body.answer)
  {
    var answerArr       = req.body.answer;
    var user_id         = req.body.user_id;
    var quiz_id         = req.body.quiz_id;
    var quiz_type       = req.body.quiz_type;
    var quiz_sub_type   = req.body.quiz_sub_type;
    var total_time      = req.body.total_time;

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
         var total_correct_answer=0;
         var total_incorrect_answer=0;
        //answerArr.forEach(answer => { 
          for (var i=0; i<answerArr.length; i++)
          {
              var answer = answerArr[i];
            if(answer['correct_answer']==answer['user_answer']){
              total_correct_answer=total_correct_answer+1;
              //point system
              var points = 2;
              competition_type = quiz_type;
              pointSystem(user_id, points, competition_type);
            }
            else{
              total_incorrect_answer=total_incorrect_answer+1;
            }
            console.log("SELECT * FROM user_answer WHERE user_id=$1 AND quiz_id=$2 AND quiz_type=$3 AND question_id=$4", [user_id,quiz_id,quiz_type, answer['question_id']]);
            const chkQueSave = await db.query("SELECT * FROM user_answer WHERE user_id=$1 AND quiz_id=$2 AND quiz_type=$3 AND question_id=$4", [user_id,quiz_id,quiz_type, answer['question_id']]);
            if(typeof chkQueSave.rows !== 'undefined' && chkQueSave.rows.length == 0)
            {
              db.query(
              "INSERT INTO user_answer (user_id,quiz_id,quiz_type,quiz_sub_type,question_id,correct_answer,user_answer,created_by, total_time) VALUES ($1,$2,$3,$4,$5,$6,$7,$8, $9)",
              [user_id, quiz_id,quiz_type,quiz_sub_type,answer['question_id'],answer['correct_answer'],answer['user_answer'],user_id,answer['total_time']]);
            }else{
              console.log("update");
              db.query(
                "UPDATE user_answer set correct_answer=$1,user_answer=$2, total_time=$3 where quiz_id=$4 and question_id=$5 and user_id=$6 RETURNING *",
                [answer['correct_answer'],answer['user_answer'],answer['total_time'],  quiz_id, answer['question_id'], user_id]);
            }
          };

          /* const points = await db.query("SELECT id, user_id, points, competition_type, last_point_gain FROM user_points WHERE user_id=$1 and competition_type=$2", [user_id, quiz_type]);
              var pointsObj = points.rows;
              var minus_point = -pointsObj[0].last_point_gain;
              //point system
              competition_type = quiz_type;
              pointSystem(user_id, minus_point, competition_type); */


          ///////summery/////////////////////////
          const summeryQ = await db.query("SELECT cqq.* ,us.user_answer FROM user_answer us INNER JOIN competition_question cqq ON us.question_id::integer=cqq.id WHERE us.quiz_type=$1 AND us.user_id=$2 AND us.quiz_id=$3  order by us.id desc", [
            quiz_type, user_id, quiz_id]);
            //var summeryArr=summeryQ.rows;
 
             var questionObj     = summeryQ.rows;
             var summeryArr      = [];
             for(let i=0;i<questionObj.length;i++)
             {
               let qObj     = questionObj[i];
               qObj.option_type = 'text';
                qObj.question_type = qObj.file_type;
                qObj.question = qObj.question_name;
                qObj.question_image_url = qObj.question_file_url;
               //text/image/text_and_image
               summeryArr.push(qObj);
              }

              // check here for All answers are correct (win the game) (+10 added to the total points).
              if(questionObj.length == total_correct_answer){
                //point system
                var points = 10;
                competition_type = quiz_type;
                pointSystem(user_id, points, competition_type);
              }else{
                
                const chkQueSave = await db.query("SELECT id, competition_id FROM competition_lock WHERE user_id=$1 AND competition_id=$2 AND competition_type=$3", [user_id,quiz_id,quiz_type]);
                //console.log('chkQueSave.rows.length', chkQueSave.rows.length);
                var days = 1;
                var newDate = new Date(Date.now()+days*24*60*60*1000);

                if(typeof chkQueSave.rows !== 'undefined' && chkQueSave.rows.length == 0)
                {
                  db.query(
                    "INSERT INTO competition_lock (user_id,competition_id,competition_type, lock_date_time, lock_status) VALUES ($1,$2,$3,$4, $5)",
                    [user_id, quiz_id,quiz_type, newDate, 'true']);
                }else{
                  await db.query("update competition_lock set lock_status=$1, lock_date_time=$2 where user_id=$3 and competition_id=$4 RETURNING *", ['true', newDate, user_id, quiz_id] );
                }
              }

        return res.json({
             "status": 200,
             "data": {"question":summeryArr, "total_correct_answer":total_correct_answer,"total_incorrect_answer":total_incorrect_answer,"total_points":total_correct_answer},
             "message":"data saved successfully"
           });

    } catch (err) {
      return next(err);
    }
  }
  else{
     return res.json({"status": 403, "data":{},"message": "المعلومات المطلوبة غير متوفرة" });
  }
});


/*
*************************************
* Function for get quiz - competitive
*************************************
*/

router.get("/get_quiz/:quiz_type_id/:quiz_sub_type_id/:access_token", async function(req, res, next) {
  if(req.params.access_token && req.params.quiz_type_id && req.params.quiz_sub_type_id)
  {
    try {

      //####check is valid access_token#####
      const isTrue= await isValidToken(req.params.access_token);
      if(!isTrue){
           return res.json({
               "status": 201,
               "data":{},
               "message":"رمز الدخول غير صالح"
             });
      }

      const quiz = await db.query("SELECT cq.quiz_type as quiz_type_id,cq.quiz_sub_type as quiz_sub_type_id,cq.quiz_title,cq.quiz_description,cq.quiz_icon_url,cq.status,cq.save_type,cq.id,cq.created_at,u.first_name || ' ' || u.last_name AS created_by FROM cms_quiz cq JOIN users u ON cq.created_by=u.id WHERE cq.quiz_type=$1 AND cq.quiz_sub_type=$2 AND cq.status=$3 order by cq.quiz_title",[req.params.quiz_type_id,req.params.quiz_sub_type_id,'1']);
       return res.json({
               "status": 200,
               'data':quiz.rows,
               "message":"success"
             });

    } catch (err) {
      return next(err);
    }
  }
  else{
     return res.json({"status": 403, "data":{},"message": "المعلومات المطلوبة غير متوفرة" });
  }
});

/*
*************************************
* Function for save competitive exam
*************************************
*/

router.post("/save_competitive_answer", async function(req, res, next) {
  
  if(req.body.access_token && req.body.user_id && req.body.quiz_id && req.body.answer)
  {
    var answerArr       = req.body.answer;
    var user_id         = req.body.user_id;
    var quiz_id         = req.body.quiz_id;
    var quiz_type       = req.body.quiz_type;
    var quiz_type_id    = req.body.quiz_type_id;
    var quiz_sub_type_id= req.body.quiz_sub_type_id;
    var total_time      = req.body.total_time;
    var total_points    = 0;

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
         var total_correct_answer=0;
         var total_incorrect_answer=0;
          for (var i=0; i<answerArr.length; i++)
          {
            var answer = answerArr[i];
            if(answer['correct_answer']==answer['user_answer']){
              total_correct_answer=total_correct_answer+1;
              total_points=total_points+5;
            }
            else{
              total_incorrect_answer=total_incorrect_answer+1;
            }

            const chkQueSave = await db.query("SELECT * FROM user_answer WHERE user_id=$1 AND quiz_id=$2 AND quiz_type=$3 AND quiz_type_id=$4 AND quiz_sub_type_id=$5 AND question_id=$6", [user_id,quiz_id,quiz_type,quiz_type_id,quiz_sub_type_id,answer['question_id']]);
            if(chkQueSave.rows.length == 0)
              {
                db.query(
                "INSERT INTO user_answer (user_id,quiz_id,quiz_type,quiz_sub_type,question_id,correct_answer,user_answer,created_by, total_time, spend_time,quiz_type_id,quiz_sub_type_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)",
                [user_id, quiz_id,quiz_type,quiz_sub_type_id,answer['question_id'],answer['correct_answer'],answer['user_answer'],user_id,total_time,answer['spend_time'],quiz_type_id,quiz_sub_type_id]);
              }
          }

          ///////summery/////////////////////////
           const summeryQ = await db.query("SELECT cqq.* ,us.user_answer FROM user_answer us INNER JOIN cms_quiz_question cqq ON us.question_id::integer=cqq.id WHERE us.quiz_type=$1 AND us.user_id=$2 order by us.id desc limit 20", [
           'competitive',user_id]);
           //var summeryArr=summeryQ.rows;

            let questionObj     = summeryQ.rows;
            var summeryArr      = [];
            for(let i=0;i<questionObj.length;i++)
            {
              let qObj     = questionObj[i];
              // if((questionObj[i].question!='' && questionObj[i].question!=null) && (questionObj[i].question_image_url!='' && questionObj[i].question_image_url!=null))
              // {
              //   qObj['question_type']='text_and_image';  
              // }
              // else if((questionObj[i].question!='' && questionObj[i].question!=null) && (questionObj[i].question_image_url=='' || questionObj[i].question_image_url==null))
              // {
              //   qObj['question_type']='text';  
              // }
              // else if((questionObj[i].question=='' || questionObj[i].question==null) && (questionObj[i].question_image_url!='' && questionObj[i].question_image_url!=null))
              // {
              //   qObj['question_type']='image';  
              // }
              // else{
              //   qObj['question_type']='text'; 
              // }

               //text/image/text_and_image
              summeryArr.push(qObj);
            }
          ///////////////////////////////////////

        return res.json({
             "status": 200,
             "data": {"question":summeryArr,"total_correct_answer":total_correct_answer,"total_incorrect_answer":total_incorrect_answer,"total_points":total_points},
             "message":"data saved successfully"
           });

    } catch (err) {
      return next(err);
    }
  }
  else{
     return res.json({"status": 403, "data":{},"message": "المعلومات المطلوبة غير متوفرة" });
  }
});
//save competitive answer new
router.post("/save_competitive_answer_new", async function(req, res, next) {
  
  if(req.body.access_token && req.body.user_id  && req.body.answer && req.body.game_id)
  {
    var answerArr       = req.body.answer;
    var user_id         = req.body.user_id;
    var game_id         = req.body.game_id;
    var total_time      = req.body.total_time;
    var attempt_status  = 2;
    var total_points    = 0;
    var quiz_type_id    = 2; //for competitve
    var quiz_sub_type_id= 0;

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
         var total_correct_answer=0;
         var total_incorrect_answer=0;
          for (var i=0; i<answerArr.length; i++)
          {
            var answer = answerArr[i];
            var is_answered     = answer['is_answered'];
            var question_id     = answer['question_id'];
            var spend_time      = answer['spend_time'];
            var user_answer     = answer['user_answer'];
            var ugr= await db.query("UPDATE se_game_result SET is_answered=$1,user_answer=$2,spend_time=$3 WHERE question_id=$4 AND se_game_id=$5 AND user_id=$6",[is_answered,user_answer,spend_time,question_id,game_id,user_id]);
          } 

          var game_status_q= await db.query("UPDATE se_user_game SET attempt_status=$1 WHERE id=$2",[attempt_status,game_id]);

          ///////summery/////////////////////////
          const summeryQ = await db.query("SELECT cqq.*,sgr.is_answered,sgr.user_answer,sgr.correct_answer FROM se_game_result sgr INNER JOIN cms_quiz_question cqq ON sgr.question_id=cqq.id WHERE sgr.se_game_id=$1", [game_id]);

          let questionObj     = summeryQ.rows;
          var summeryArr      = [];
          for(let i=0;i<questionObj.length;i++)
          {
            let qObj     = questionObj[i];
            ///////////calculate summery//
            var is_answered_val     = qObj.is_answered;
            //if(is_answered_val=='yes'){
              if(qObj.correct_answer.toLowerCase() == qObj.user_answer.toLowerCase()){
                total_correct_answer=total_correct_answer+1;
                total_points=total_points+5;
              }
              else{
                total_incorrect_answer=total_incorrect_answer+1;
              }
            //}
            //////////////////////////////
            // if((questionObj[i].question!='' && questionObj[i].question!=null) && (questionObj[i].question_image_url!='' && questionObj[i].question_image_url!=null))
            // {
            //   qObj['question_type']='text_and_image';  
            // }
            // else if((questionObj[i].question!='' && questionObj[i].question!=null) && (questionObj[i].question_image_url=='' || questionObj[i].question_image_url==null))
            // {
            //   qObj['question_type']='text';  
            // }
            // else if((questionObj[i].question=='' || questionObj[i].question==null) && (questionObj[i].question_image_url!='' && questionObj[i].question_image_url!=null))
            // {
            //   qObj['question_type']='image';  
            // }
            // else{
            //   qObj['question_type']='text'; 
            // }

             //text/image/text_and_image
            summeryArr.push(qObj);
          }

          ///////////////////////////////////////
          if(attempt_status==2){ //compete game
            //update status
            var ug_game= await db.query("UPDATE se_user_game SET status=$1,attempt_status=$2 WHERE id=$3",['1','2',game_id]);
            //update points
            var points = 5;
            var competition_type = "study_exam";
            pointSystem(user_id, points, competition_type);
          }
        return res.json({
             "status": 200,
             "data": {"question":summeryArr,"total_correct_answer":total_correct_answer,"total_incorrect_answer":total_incorrect_answer,"total_points":total_points},
             "message":"data saved successfully"
           });

    } catch (err) {
      return next(err);
    }
  }
  else{
     return res.json({"status": 403, "data":{},"message": "المعلومات المطلوبة غير متوفرة" });
  }
});


//save curriculam answer
router.post("/save_curriculum_answer", async function(req, res, next) {
  
  if(req.body.access_token && req.body.user_id  && req.body.answer)
  {
    var answerArr       = req.body.answer;
    var user_id         = req.body.user_id;
    var quiz_id         = req.body.quiz_id;
    var quiz_type       = req.body.quiz_type;
    var quiz_sub_type   = "";
    var sub_quiz_id     = 0;
    var class_id        = req.body.class_id;
    var semester_id     = req.body.semester_id;
    var subject_id      = req.body.subject_id;
    var chapter_id      = req.body.chapter_id;
    var lesson_id       = req.body.lesson_id;
    var total_time      = req.body.total_time;
    var attempt_status  = req.body.attempt_status;
    var total_points    = 0;
    var quiz_type_id    = 1; //for curricluam
    var quiz_sub_type_id= 0;

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
         var total_correct_answer=0;
         var total_incorrect_answer=0;
          for (var i=0; i<answerArr.length; i++)
          {
            var answer = answerArr[i];
            var is_answered     = answer['is_answered'];
            if(is_answered=='yes'){
              if(answer['correct_answer']==answer['user_answer']){
                total_correct_answer=total_correct_answer+1;
                total_points=total_points+5;
              }
              else{
                total_incorrect_answer=total_incorrect_answer+1;
              }
            }
            

             const chkQueSave = await db.query("SELECT * FROM user_answer WHERE class_id=$1 AND semester_id=$2 AND subject_id=$3 AND chapter_id=$4 AND lesson_id=$5 AND user_id=$6 AND question_id=$7", [class_id,semester_id,subject_id,chapter_id,lesson_id,user_id,answer['question_id']]);
             if(chkQueSave.rows.length == 0)
              {
                db.query(
                "INSERT INTO user_answer (user_id,quiz_id,quiz_type,quiz_sub_type,question_id,correct_answer,user_answer,created_by,total_time,class_id,semester_id,subject_id,chapter_id,lesson_id,spend_time,quiz_type_id,quiz_sub_type_id,is_answered) VALUES ($1,$2,$3,$4,$5,$6,$7,$8, $9,$10,$11,$12,$13,$14,$15,$16,$17,$18)",
                [user_id, quiz_id,quiz_type,quiz_sub_type,answer['question_id'],answer['correct_answer'],answer['user_answer'],user_id,total_time,class_id,semester_id,subject_id,chapter_id,lesson_id,answer['spend_time'],quiz_type_id,quiz_sub_type_id,is_answered]);          
              }
              else
              {
                var chkIsAnswered=chkQueSave.rows[0].is_answered;
                var answeredId   =chkQueSave.rows[0].id;
                if(chkIsAnswered=='no'){
                  db.query("UPDATE user_answer SET is_answered=$1,total_time=$2,correct_answer=$3,user_answer=$4,spend_time=$5 WHERE id=$6",[is_answered,total_time,answer['correct_answer'],answer['user_answer'],answer['spend_time'],answeredId]); 
                }
              }
            } 


          const chkSave = await db.query("SELECT * FROM user_quiz_attempt WHERE class_id=$1 AND semester_id=$2 AND subject_id=$3 AND chapter_id=$4 AND lesson_id=$5 AND user_id=$6", [class_id,semester_id,subject_id,chapter_id,lesson_id,user_id]);
          if(chkSave.rows.length > 0)
            {
              db.query("UPDATE user_quiz_attempt SET status=$1,total_time=$2,modified_by=$3 WHERE id=$4",[attempt_status,total_time,user_id,chkSave.rows[0].id]); 
           }
           else{
              db.query(
              "INSERT INTO user_quiz_attempt (user_id,quiz_id,quiz_type,sub_quiz_id,created_by,total_time,class_id,semester_id,subject_id,chapter_id,lesson_id,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8, $9,$10,$11,$12)",
              [user_id, quiz_id,quiz_type,sub_quiz_id,user_id,total_time,class_id,semester_id,subject_id,chapter_id,lesson_id,attempt_status]);
           }

          //get result summery
          const userResult = await db.query("SELECT * FROM user_answer WHERE class_id=$1 AND semester_id=$2 AND subject_id=$3 AND chapter_id=$4 AND lesson_id=$5 AND user_id=$6 order by id desc limit 20", [class_id,semester_id,subject_id,chapter_id,lesson_id,user_id]);
          var resultArr=userResult.rows;

          var total_correct_answer  =0;
          var total_incorrect_answer=0;
          for (var k=0; k<resultArr.length; k++) 
          {
                var user_question = resultArr[k];
                var is_answered_val     = user_question['is_answered'];
                if(is_answered_val=='yes'){
                  if(user_question['correct_answer'].toLowerCase()==user_question['user_answer'].toLowerCase()){
                    total_correct_answer=total_correct_answer+1;
                    total_points=total_points+5;
                  }
                  else{
                    total_incorrect_answer=total_incorrect_answer+1;
                  }
                }
          }

          ///////summery/////////////////////////

           const summeryQ = await db.query("SELECT cqq.* ,us.user_answer FROM user_answer us INNER JOIN cms_quiz_question cqq ON us.question_id::integer=cqq.id WHERE us.quiz_type=$1 AND us.subject_id=$2 AND us.class_id=$3 AND us.semester_id=$4 AND us.chapter_id=$5 AND us.lesson_id=$6 AND us.user_id=$7 order by us.id desc limit 20", [
           'curriculum',subject_id,class_id,semester_id,chapter_id,lesson_id,user_id]);
           //var summeryArr=summeryQ.rows;

            let questionObj     = summeryQ.rows;
            var summeryArr      = [];
            for(let i=0;i<questionObj.length;i++)
            {
              let qObj     = questionObj[i];
              // if((questionObj[i].question!='' && questionObj[i].question!=null) && (questionObj[i].question_image_url!='' && questionObj[i].question_image_url!=null))
              // {
              //   qObj['question_type']='text_and_image';  
              // }
              // else if((questionObj[i].question!='' && questionObj[i].question!=null) && (questionObj[i].question_image_url=='' || questionObj[i].question_image_url==null))
              // {
              //   qObj['question_type']='text';  
              // }
              // else if((questionObj[i].question=='' || questionObj[i].question==null) && (questionObj[i].question_image_url!='' && questionObj[i].question_image_url!=null))
              // {
              //   qObj['question_type']='image';  
              // }
              // else{
              //   qObj['question_type']='text'; 
              // }

               //text/image/text_and_image
              summeryArr.push(qObj);
            }

          ///////////////////////////////////////

        return res.json({
             "status": 200,
             "data": {"question":summeryArr,"total_correct_answer":total_correct_answer,"total_incorrect_answer":total_incorrect_answer,"total_points":total_points},
             "message":"data saved successfully"
           });

    } catch (err) {
      return next(err);
    }
  }
  else{
     return res.json({"status": 403, "data":{},"message": "المعلومات المطلوبة غير متوفرة" });
  }
});

//save curriculam answer new
router.post("/save_curriculum_answer_new", async function(req, res, next) {
  
  if(req.body.access_token && req.body.user_id  && req.body.answer && req.body.game_id)
  {
    var answerArr       = req.body.answer;
    var user_id         = req.body.user_id;
    var game_id         = req.body.game_id;

    // var quiz_id         = req.body.quiz_id;
    // var quiz_type       = req.body.quiz_type;
    // var quiz_sub_type   = "";
    // var sub_quiz_id     = 0;
    // var class_id        = req.body.class_id;
    // var semester_id     = req.body.semester_id;
    // var subject_id      = req.body.subject_id;
    // var chapter_id      = req.body.chapter_id;
    // var lesson_id       = req.body.lesson_id;
    var total_time      = req.body.total_time;
    var attempt_status  = req.body.attempt_status;
    var total_points    = 0;
    var quiz_type_id    = 1; //for curricluam
    var quiz_sub_type_id= 0;

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
         var total_correct_answer=0;
         var total_incorrect_answer=0;
          for (var i=0; i<answerArr.length; i++)
          {
            var answer = answerArr[i];
            var is_answered     = answer['is_answered'];
            var question_id     = answer['question_id'];
            var spend_time      = answer['spend_time'];
            var user_answer     = answer['user_answer'];
            var ugr= await db.query("UPDATE se_game_result SET is_answered=$1,user_answer=$2,spend_time=$3 WHERE question_id=$4 AND se_game_id=$5 AND user_id=$6",[is_answered,user_answer,spend_time,question_id,game_id,user_id]);
          } 

          var game_status_q= await db.query("UPDATE se_user_game SET attempt_status=$1 WHERE id=$2",[attempt_status,game_id]);

          ///////summery/////////////////////////
          const summeryQ = await db.query("SELECT cqq.*,sgr.is_answered,sgr.user_answer,sgr.correct_answer FROM se_game_result sgr INNER JOIN cms_quiz_question cqq ON sgr.question_id=cqq.id WHERE sgr.se_game_id=$1", [game_id]);

            let questionObj     = summeryQ.rows;
            var summeryArr      = [];
            for(let i=0;i<questionObj.length;i++)
            {
              let qObj     = questionObj[i];
              ///////////calculate summery//
              var is_answered_val     = qObj.is_answered;
              if(is_answered_val=='yes'){
                if(qObj.correct_answer.toLowerCase() == qObj.user_answer.toLowerCase()){
                  total_correct_answer=total_correct_answer+1;
                  total_points=total_points+5;
                }
                else{
                  total_incorrect_answer=total_incorrect_answer+1;
                }
              }
              //////////////////////////////
              // if((questionObj[i].question!='' && questionObj[i].question!=null) && (questionObj[i].question_image_url!='' && questionObj[i].question_image_url!=null))
              // {
              //   qObj['question_type']='text_and_image';  
              // }
              // else if((questionObj[i].question!='' && questionObj[i].question!=null) && (questionObj[i].question_image_url=='' || questionObj[i].question_image_url==null))
              // {
              //   qObj['question_type']='text';  
              // }
              // else if((questionObj[i].question=='' || questionObj[i].question==null) && (questionObj[i].question_image_url!='' && questionObj[i].question_image_url!=null))
              // {
              //   qObj['question_type']='image';  
              // }
              // else{
              //   qObj['question_type']='text'; 
              // }

               //text/image/text_and_image
              summeryArr.push(qObj);
            }

          ///////////////////////////////////////
          if(attempt_status==2){ //complete game
            //update status
            var ug_game= await db.query("UPDATE se_user_game SET status=$1,attempt_status=$2 WHERE id=$3",['1','2',game_id]);
            //update points
            var points = 5;
            var competition_type = "study_exam";
            pointSystem(user_id, points, competition_type);
          }
        return res.json({
             "status": 200,
             "data": {"question":summeryArr,"total_correct_answer":total_correct_answer,"total_incorrect_answer":total_incorrect_answer,"total_points":total_points},
             "message":"data saved successfully"
           });

    } catch (err) {
      return next(err);
    }
  }
  else{
     return res.json({"status": 403, "data":{},"message": "المعلومات المطلوبة غير متوفرة" });
  }
});

/* async function pointSystem(user_id, getPoints, competition_type){
  const points = await db.query("SELECT id, user_id, points, competition_type FROM user_points WHERE user_id=$1 and competition_type=$2", [user_id, competition_type]);
  var pointsObj = points.rows;
  // IF A USER ISN'T FOUND
  if (typeof points.rows !== 'undefined' && points.rows.length == 0) { console.log('insert', competition_type)
    await db.query("INSERT INTO user_points (user_id, points, competition_type) VALUES ($1,$2,$3) RETURNING *",
          [user_id, getPoints, competition_type]
          );
  }else{ console.log('update', competition_type+' '+ pointsObj[0].points);
  var updatedPoints = pointsObj[0].points+getPoints;
    await db.query("update user_points set points=$1 where user_id=$2 and competition_type=$3 RETURNING *",
          [updatedPoints, user_id, competition_type]
          );
  }
} */

//fundtion for update points
async function pointSystem(user_id, getPoints, competition_type){
  const points = await db.query("SELECT id, user_id, points, competition_type FROM user_points WHERE user_id=$1 and competition_type=$2", [user_id, competition_type]);
  var pointsObj = points.rows;
  // IF A USER ISN'T FOUND
  if (typeof points.rows !== 'undefined' && points.rows.length == 0) { console.log('insert', competition_type)
    await db.query("INSERT INTO user_points (user_id, points, competition_type, last_point_gain) VALUES ($1,$2,$3,$4) RETURNING *",
          [user_id, getPoints, competition_type, getPoints]
          );
  }else{ console.log('update', competition_type+' '+ pointsObj[0].points);
  var updatedPoints = pointsObj[0].points+getPoints;
    await db.query("update user_points set points=$1, last_point_gain=$2 where user_id=$3 and competition_type=$4 RETURNING *",
          [updatedPoints, getPoints, user_id, competition_type]
          );
  }
}

module.exports = router;