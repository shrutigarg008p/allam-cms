const express = require("express");
const router = express.Router();
const db = require("../db");
const transport = require("../config/smtp.js");
const common = require("../config/common.js");
const bodyParser = require("body-parser");
const axios = require('axios')
// Create application/x-www-form-urlencoded parser  
var urlencodedParser = bodyParser.urlencoded({ extended: false })  

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
        console.log("لم يتم العثور علي خطأ : " + err.code)
    }
});

/////end s3 integration////

/*
*********************************
* Function for user answer (LeaderBoard)
*********************************
*/
router.get("/leaderboard/:quiz_id/:type/:access_token", async function(req, res, next) {
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
  var quiz_type =  '';
  if(!req.params.type){
    return res.status(401).json({ success: false, message: 'Quiz type can not blank' });
  }else if(req.params.type == 'daily'){
    quiz_type = 'daily_competition';
  }else{
    quiz_type = 'special_competition';
  }
      //const competition = await db.query("SELECT cqt.*, users.first_name, users.last_name, users.country, users.user_avatar FROM user_answer as cqt JOIN users on users.id = cqt.user_id::integer  WHERE quiz_id=$1" , [req.params.quiz_id]);
      //console.log("SELECT DISTINCT ON (user_id) user_id FROM user_answer as cqt  WHERE quiz_id=$1 and quiz_type=$2" , [req.params.quiz_id, quiz_type]);
      const competition = await db.query("SELECT DISTINCT ON (user_id) user_id FROM user_answer as cqt  WHERE quiz_id=$1 and quiz_type=$2" , [req.params.quiz_id, quiz_type]);

      if (typeof competition.rows !== 'undefined' && competition.rows.length == 0) {
        return res.status(401).json({ success: false, message: 'Results not found for selected quiz' });
      }
      var refObj = competition.rows;
      var result = [];
      
      for(var i =0; i< refObj.length; i++){
        var userAnsArr = await db.query("SELECT cqt.user_id, cqt.quiz_id, cqt.correct_answer, cqt.user_answer, cqt.total_time, users.username, users.first_name || ' ' || users.last_name as full_name, users.email, users.country, users.user_avatar FROM user_answer as cqt JOIN users on users.id = cqt.user_id::integer  WHERE user_id=$1 AND quiz_id=$2" , [refObj[i].user_id, req.params.quiz_id]);
          var userAnsObj = userAnsArr.rows;
          var totalAnswer = Object.keys(userAnsObj).length;
          //console.log(JSON.stringify(userAnsObj));
          var correctAnswer = [];
          var scoreData = 0;
          var totalTime = 0;
          for(var j =0; j< userAnsObj.length; j++){
            if(userAnsObj[j].user_answer == userAnsObj[j].correct_answer){
              correctAnswer.push(userAnsObj[j].correct_answer);
              scoreData += 5;
            }
            if(userAnsObj[j].total_time == null){
              userAnsObj[j].total_time = 0;
            }
            totalTime += parseInt(userAnsObj[j].total_time);
          }
          //console.log(scoreData, totalTime);
          var totalAnswerss = Object.keys(correctAnswer).length;
          //var user_answer = userAnswer.push(userAnsObj[0].user_id);
          var ress = {user_id : refObj[i].user_id, user_name : userAnsObj[0].username, full_name : userAnsObj[0].full_name, user_email : userAnsObj[0].email, user_image: userAnsObj[0].user_avatar, country: userAnsObj[0].country, user_answers: totalAnswer, correct_answers : totalAnswerss, score :scoreData, total_times : totalTime};
        result.push(ress);
      }
      //result.sort((a, b) => parseFloat(b.score) - parseFloat(a.score)); // sorting scorewise
      result.sort((a,b) => parseInt(b.score) - parseInt(a.score) || parseInt(a.total_times) - parseInt(b.total_times));
      // Show rank according to score sorting
      for (var i = 0; i < result.length; i++) {
        result[i].rank = i+1;
      }

      
      var sponorArr = await db.query("SELECT * FROM competition_narration_company_details WHERE competition_id=$1" , [req.params.quiz_id]);
      var sponorObj = sponorArr.rows;
      var company_name='';
      var company_image='';
      var participants_count=refObj.length;
      //participants_count
      if(sponorObj.length > 0){
        company_name  = sponorObj[0].company_name;
        company_image = sponorObj[0].company_logo;
      }

      var sponorNewArr ={"company_name":company_name,"company_image":company_image,"participants_count":participants_count};

      return res.json({
             "status": 200,
             'data':{"sponsor":sponorNewArr,"result":result},
           });

    } catch (err) {
        console.log("لا يوجد الملف خطأ : " + err)
    }
});

/*
*********************************
* Function for user login
*********************************
*/

router.post("/login", async function(req, res, next) {
  
  if((req.body.username || req.body.email) && req.body.password && req.body.device_id)
  {
    var password     = common.encode64(req.body.password);
    var timeInMss    = Date.now();
    var device_id    = req.body.device_id;
    var access_token = device_id+timeInMss;

    try {
         const results = await db.query("SELECT * FROM users WHERE (username=$1 OR email=$2) AND password=$3 AND role_id=$4 AND status=$5", [
          req.body.username,req.body.email,password,'5','1'
        ]);
         var isProfileCompleted=0;
        if(results.rows.length>0)
        {
          var userObj= results.rows[0];
          if(userObj.education=='' || userObj.education==null || userObj.country=='' || userObj.country==null || userObj.city=='' || userObj.city==null || userObj.region=='' || userObj.region==null){
            isProfileCompleted=0;
          }
          else{
            isProfileCompleted=1;
          }
          userObj['isProfileCompleted']=isProfileCompleted;
          const permission = await db.query("SELECT permissions.name,user_permission.permission_id FROM user_permission JOIN permissions ON user_permission.permission_id=permissions.id WHERE user_permission.user_id=$1", [userObj.id]);

          //update device token///
          await db.query("UPDATE users SET access_token=$1 WHERE id=$2",[access_token,userObj.id]);
          userObj['access_token'] = access_token;
          return res.json({
             "status": 200,
             "data": {'user':userObj,'permission':permission.rows},
             "message":"تم الدخول للتسجيل"
           });
        } 
        else {
          return res.json({
            "status": 201,
            "message":"البريد الإلكتروني غير ساري / اسم المستخدم أو كلمة المرور"
          });
        }
        

    } catch (err) {
      return next(err);
    }
  }
  else{
     return res.json({"status": 403, "message": "المعلومات المطلوبة غير متوفرة" });
  }
});


/*
*********************************
* Function to check email exist
*********************************
*/

router.get("/check_email/:email", async function(req, res, next) {
  
  console.log(req.params.email)
  if(req.params.email)
  {
    try {
         const results = await db.query("SELECT * FROM users WHERE email=$1", [
          req.params.email
        ]);

        if(results.rows.length>0)
        {
         
          return res.json({
             "status": 201,
             "message":" البريد الالكتروني موجود بالفعل"
           });
        
         
        } 
        else {
          return res.json({
            "status": 200,
            "message":"البريد الالكتروني متاح"
          });
        }
        

    } catch (err) {
      return next(err);
    }
  }
  else{

    return res.json({
             "status": 403,
             "message":"المعلومات المطلوبة غير متوفرة"
           });

  }
});


/*
*********************************
* Function for user signup
*********************************
*/

router.post("/signup",upload.single('user_avatar'),async function(req, res, next) {
  var avatr_name='';
  if(req.file.key){
    avatr_name= req.file.key;
  }
  //console.log("fileName "+req.file.key);

  //console.log(req.body.account_type);
  
  if(req.body.account_type && req.body.email && req.body.username && req.body.first_name && req.body.password && req.body.device_id)
  {
    var timeInMss = Date.now()
    var first_name= req.body.first_name;
    var last_name = req.body.last_name;
    //var username  = common.removeSpecialChar(first_name);
    var username  = req.body.username;
    var password  = common.encode64(req.body.password);
    const access_token =req.body.device_id+timeInMss;
    var email_id = req.body.email;
    var role_id=5; // rol id 5 for user
    var school='';
    var university='';
    var other_country='';
    var other_nationality='';
    if(req.body.school){
      school = req.body.school;
    }
    if(req.body.university){
      university = req.body.university;
    }
    if(req.body.other_country){
      other_country = req.body.other_country;
    }
    if(req.body.other_nationality){
      other_nationality = req.body.other_nationality;
    }


    try {

         //check email exits
          const checkEmail = await db.query("SELECT * FROM users WHERE email=$1", [email_id]);
          if(checkEmail.rows.length>0)
          {
            return res.json({
               "status": 201,
               "data":{},
               "message":"البريد الإلكتروني موجود بالفعل"
             });
          } 

          //check username exits
          const checkUsername = await db.query("SELECT * FROM users WHERE username=$1", [username]);
          if(checkUsername.rows.length>0)
          {
            return res.json({
               "status": 201,
               "data":{},
               "message":"اسم المستخدم موجود مسبقاً"
             });
          } 


          const result = await db.query(
            "INSERT INTO users (first_name,last_name,email,role_id,password,access_token,phone_number,nationality,admin_verify,email_verify,status,created_by,age,country,city,region,education,account_type,gender,school,user_avatar,username,university,other_country,other_nationality) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25) RETURNING *",
            [first_name,
            last_name, 
            req.body.email, 
            role_id,
            password,
            access_token,
            req.body.phone_number,
            req.body.nationality,
            '0','0','1','0',
            req.body.age,
            req.body.country,
            req.body.city,
            req.body.region,
            req.body.education,
            req.body.account_type,
            req.body.gender,
            school,
            avatr_name,
            username,
            university,
            other_country,
            other_nationality]
          );

          const userObj = result.rows[0];
          const newlyCreatedUserId = result.rows[0].id;

          /////////update username/////////////////////
          // username= username+newlyCreatedUserId;
          // db.query("UPDATE users SET username=$1 WHERE id=$2",
          //   [username,newlyCreatedUserId]); 
          /////////Update device table/////////////////
          const chek_device = await db.query("SELECT * FROM device WHERE device_id=$1 AND user_id=$2", [
            req.params.device_id,newlyCreatedUserId
          ]);

          if(chek_device.rows.length==0)
          {
            db.query(
              "INSERT INTO device (user_id,device_id,device_token,type,model) VALUES ($1,$2,$3,$4,$5)",
              [newlyCreatedUserId, req.body.device_id,req.body.device_token,req.body.type,req.body.model]);
          }
          else{
             db.query("UPDATE device SET device_token=$1 WHERE user_id=$2 AND device_id=$3",
            [req.body.device_token,newlyCreatedUserId,req.body.device_id]);
          }
          
          
          //////////update permission table////////////
          const permissions = await db.query("SELECT * FROM role_permission WHERE role_id=$1", [
          role_id
          ]);

          const permissionsArr = permissions.rows;
          //console.log(permissionsArr);
          permissionsArr.forEach(permission_id => { 
            db.query(
            "INSERT INTO user_permission (user_id,permission_id,created_by) VALUES ($1,$2,$3)",
            [newlyCreatedUserId, permission_id['permission_id'],'0']);
          });
          
	  //////////send mail//////////////////////////
          var verifyUrl=common.appUrl()+'authentication/verify/'+common.encode64(newlyCreatedUserId.toString());
          var html_body='<table style="font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:20px;color:#666666;" border="0" align="center" width="600" cellspacing="0" cellpadding="0">';
              html_body +='<tbody>';
                html_body +='<tr>';
                html_body +='<td>';      
                  html_body +='<table border="0" bgcolor="#ffffff" width="100%" cellspacing="5" cellpadding="0">';
                    html_body +='<tbody>';
                      html_body +='<tr>';
                        html_body +='<td><a href="'+verifyUrl+'" rel="nofollow"> ';               
                          html_body +='<img style="float:right;" src="https://alaam.net:4200/assets/images/auth/allam.png" alt="AlaamApp"></a></td>';
                      html_body +='</tr>';
                      html_body +='<tr>';
                        html_body +='<td height="5"><br></td>';
                      html_body +='</tr>';
                      html_body +='<tr>';
                        html_body +='<td bgcolor="#cccccc" height="2"><br></td>';
                      html_body +='</tr>';
                      html_body +='<tr>';
                        html_body +='<td height="5"><br></td>';
                      html_body +='</tr>';
                      html_body +='<tr>';
                        html_body +='<td><strong>Dear '+first_name+',</strong></td>';
                      html_body +='</tr>';
                      html_body +='<tr>';
                        html_body +='<td>&nbsp;</td>';
                      html_body +='</tr>';
                      html_body +='<tr>';
                        html_body +='<td>You have successfully registered with us. Please verify your email id by clicking below button. </td>';
                      html_body +='</tr>';
                      html_body +='<tr>';
                        html_body +='<td>&nbsp;</td>';
                      html_body +='</tr>';
                       html_body +='<tr>';
                        html_body +='<td>Your username is <strong> '+username+'</strong> & email is <strong>'+email_id+' </strong></td>';
                      html_body +='</tr>';

                      html_body +='<tr>';
                        html_body +='<td>&nbsp;</td>';
                      html_body +='</tr>';
                    html_body +='<tr>';
                      html_body +='<td><table style="width: 70%;margin: 0 auto;">';
                        html_body +='<tbody>';
                          html_body +='<tr>';
                            html_body +='<td style="text-align:center;">';
                              html_body +='<a target="_blank" href="'+verifyUrl+'" style="color:#FFFFFF;font-size:17px;width:200px;font-weight:normal;line-height:42px;font-family:Arial, Helvetica, sans-serif;text-align:center;text-decoration:none;background-color:#2ecc71;padding:10px;" rel="nofollow">Verify Email ID</a></td>';
                          html_body +='</tr>';
                        html_body +='</tbody>';
                      html_body +='</table>';
                    html_body +='</td>';
                  html_body +='</tr>';
                  html_body +='<tr>';
                    html_body +='<td>&nbsp;</td>';
                  html_body +='</tr>';
                  html_body +='<tr>';
                    html_body +='<td><strong>Thanks,</strong></td>';
                  html_body +='</tr>';
                  html_body +='<tr><td><strong>Alaam App</strong><br></td>';
                  html_body +='</tr>';
                  html_body +='<tr>';
                    html_body +='<td><hr>';
                    html_body +='</td>';
                  html_body +='</tr>';
                html_body +='</tbody>';
                html_body +='</table>';
              html_body +='</td>';
            html_body +='</tr>';
            html_body +='</tbody>';
            html_body +='</table>';

            const message = {
                from: 'Alaam App <info@alaam.net>', // Sender address
                to: req.body.email,         // List of recipients
                subject: 'Thanks for choosing Alaam App',
                html: html_body
            };

          transport.sendMail(message, function(err, info) {
              if (err) {
                console.log(err)
              } else {
                console.log(info);
              }
          });

          /////////////////////////////////////////////
           return res.json({
             "status": 200,
             "data": {'user':userObj,'permission':[]},
             "message":"تم التسجيل بنجاح"
           });
        
        //"data":[{"username":username,"user_id":newlyCreatedUserId,'user':userObj}], 

    } catch (err) {
      return next(err);
    }
  }
  else{
     return res.json({"status": 403, "data":[],"message": "المعلومات المطلوبة غير متوفرة" });
  }
});


/*
*********************************
* Function for edit user profile
*********************************
*/

router.post("/edit_profile",async function(req, res, next) {

  if(req.body.first_name && req.body.last_name)
  {
    var timeInMss    = new Date(new Date().toUTCString());
    var first_name   = req.body.first_name;
    var last_name    = req.body.last_name;
    var access_token = req.body.access_token;
    var user_id      = req.body.user_id;
    var phone_number = req.body.phone_number;
    var nationality  = req.body.nationality;
    var age          = req.body.age;
    var country      = req.body.country;
    var city         = req.body.city;
    var region       = req.body.region;
    var education    = req.body.education;
    var gender       = req.body.gender;

    var school='';
    if(req.body.school){
      school = req.body.school;
    }

    try {
          const isTrue= await isValidToken(access_token);
          if(!isTrue){
                 return res.json({
                     "status": 201,
                     "data":[],
                     "message":"رمز الدخول غير صالح"
                   });
          }

          const result = await db.query(
            "UPDATE users SET first_name=$1,last_name=$2,phone_number=$3,nationality=$4,modified_by=$5,modified_at=$6,age=$7,country=$8,city=$9,region=$10,education=$11,gender=$12,school=$13 WHERE id=$14",
            [first_name,
            last_name, 
            phone_number,
            nationality,
            user_id,
            timeInMss,
            age,
            country,
            city,
            region,
            education,
            gender,
            school,
            user_id]
          );
          var isProfileCompleted=0;
          if(education=='' || education==null || country=='' || country==null || city=='' || city==null || region=='' || region==null){
            isProfileCompleted=0;
          }
          else{
            isProfileCompleted=1;
          }

          /////////////////////////////////////////////
           return res.json({
             "status": 200,
             "data":[{"isProfileCompleted":isProfileCompleted}],
             "message":"تم تحديث الملف الشخصي بنجاح"
           });
        
        

    } catch (err) {
      return next(err);
    }
  }
  else{
     return res.json({"status": 403, "data":[],"message": "المعلومات المطلوبة غير متوفرة" });
  }
});
/*
*********************************
* Function for verify email
*********************************
*/

router.get("/verify_email/:id", async function(req, res, next) {
  
  if(req.params.id)
  {
    try {
         const results = await db.query("SELECT * FROM users WHERE id=$1 AND email_verify=$2", [
          req.params.id,'1'
        ]);

        if(results.rows.length==0)
        {
          const user = await db.query("UPDATE users SET email_verify=$1 WHERE id=$2",
          ['1',req.params.id]);

          return res.json({
             "status": true,
             "message":"لقد تم التحقق من صحة البريد الإلكتروني ."
           });
        
         
        } 
        else {
          return res.json({
            "status": false,
            "message":"تم التحقق من البريد الإلكتروني بالفعل"
          });
        }
        

    } catch (err) {
      return next(err);
    }
  }
  else{
     return res.json({"status": 403, "message": "المعلومات المطلوبة غير متوفرة" });
  }
});


/*
*********************************
* Function for reset pswd request
*********************************
*/

router.post("/forgot_password", async function(req, res, next) {
  
  if((req.body.username || req.body.email))
  {
    try {
         const results = await db.query("SELECT * FROM users WHERE email=$1 OR username=$2", [
          req.body.email,req.body.username
        ]);

        if(results.rows.length>0)
        {
          
          const user = await db.query("UPDATE users SET forgot_pswd_flag=$1 WHERE id=$2",
          ['1',results.rows[0].id]);
          //////////send mail//////////////////////////
          var resetLink=common.appUrl()+'authentication/resetpassword/'+common.encode64(results.rows[0].id.toString());
          var html_body='<table style="font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:20px;color:#666666;" border="0" align="center" width="600" cellspacing="0" cellpadding="0">';
              html_body +='<tbody>';
                html_body +='<tr>';
                html_body +='<td>';      
                  html_body +='<table border="0" bgcolor="#ffffff" width="100%" cellspacing="5" cellpadding="0">';
                    html_body +='<tbody>';
                      html_body +='<tr>';
                        html_body +='<td><a href="'+resetLink+'" rel="nofollow"> ';               
                          html_body +='<img style="float:right;" src="https://alaam.net:4200/assets/images/auth/allam.png" alt="AlaamApp"></a></td>';
                      html_body +='</tr>';
                      html_body +='<tr>';
                        html_body +='<td height="5"><br></td>';
                      html_body +='</tr>';
                      html_body +='<tr>';
                        html_body +='<td bgcolor="#cccccc" height="2"><br></td>';
                      html_body +='</tr>';
                      html_body +='<tr>';
                        html_body +='<td height="5"><br></td>';
                      html_body +='</tr>';
                      html_body +='<tr>';
                        html_body +='<td><strong>'+results.rows[0].first_name+',</strong></td>';
                      html_body +='</tr>';
                      html_body +='<tr>';
                        html_body +='<td>&nbsp;</td>';
                      html_body +='</tr>';
                      html_body +='<tr>';
                        html_body +='<td>Reset your password by clicking below button. </td>';
                      html_body +='</tr>';
                      html_body +='<tr>';
                        html_body +='<td>&nbsp;</td>';
                      html_body +='</tr>';
                    html_body +='<tr>';
                      html_body +='<td><table style="width: 70%;margin: 0 auto;">';
                        html_body +='<tbody>';
                          html_body +='<tr>';
                            html_body +='<td style="text-align:center;">';
                              html_body +='<a target="_blank" href="'+resetLink+'" style="color:#FFFFFF;font-size:17px;width:200px;font-weight:normal;line-height:42px;font-family:Arial, Helvetica, sans-serif;text-align:center;text-decoration:none;background-color:#2ecc71;padding:10px;" rel="nofollow">Reset password</a></td>';
                          html_body +='</tr>';
                        html_body +='</tbody>';
                      html_body +='</table>';
                    html_body +='</td>';
                  html_body +='</tr>';
                  html_body +='<tr>';
                    html_body +='<td>&nbsp;</td>';
                  html_body +='</tr>';
                  html_body +='<tr>';
                    html_body +='<td><strong>Thanks,</strong></td>';
                  html_body +='</tr>';
                  html_body +='<tr><td><strong>Alaam App</strong><br></td>';
                  html_body +='</tr>';
                  html_body +='<tr>';
                    html_body +='<td><hr>';
                    html_body +='</td>';
                  html_body +='</tr>';
                html_body +='</tbody>';
                html_body +='</table>';
              html_body +='</td>';
            html_body +='</tr>';
            html_body +='</tbody>';
            html_body +='</table>';

            const message = {
                from: 'Alaam App <info@alaam.net>', // Sender address
                to: results.rows[0].email,         // List of recipients
                subject: 'Reset Password - Alaam App',
                html: html_body
            };

          transport.sendMail(message, function(err, info) {
              if (err) {
                console.log(err)
              } else {
                console.log(info);
              }
          });
          /////////////////////////////////////////////
          return res.json({
             "status": 200,
             "message":"تم إرسال رابط إعادة التعيين إلى البريد الإلكتروني المسجل."
           });
        
         
        } 
        else {
          return res.json({
            "status": 201,
            "message":"البريد الإلكتروني/ اسم المستخدم غير موجود."
          });
        }
        

    } catch (err) {
      return next(err);
    }
  }
  else{
     return res.json({"status": 403, "message": "المعلومات المطلوبة غير متوفرة" });
  }
});


/*
*********************************
* Function for launcher api
*********************************
*/

router.get("/launcher", async function(req, res, next) {
    try {
          const master_quiz     = await db.query("SELECT id,name FROM master_quiz WHERE status=1");
          const master_sub_quiz = await db.query("SELECT id,master_quiz_id,name FROM master_sub_quiz WHERE status=1");
          const master_level    = await db.query("SELECT id,name FROM master_level");
          const master_group    = await db.query("SELECT id,name FROM master_group");
          const master_chapter  = await db.query("SELECT id,name FROM master_chapter");
          const master_lesson   = await db.query("SELECT id,name FROM master_lesson");
          const master_semester = await db.query("SELECT id,name FROM master_semester");
          const master_grade    = await db.query("SELECT id,name FROM master_class");
          const master_university = await db.query("SELECT id,name FROM master_university WHERE status=1");
          const master_school   = await db.query("SELECT id,name FROM master_school WHERE status=1");
          const master_district = await db.query("SELECT id,name FROM master_district WHERE status!=0");
          const master_subject  = await db.query("SELECT id,name,icon FROM master_subject WHERE status=1");
          const master_country  = await db.query("SELECT id,name,country_code,country_flag FROM master_country WHERE status=1");
          const master_region  = await db.query("SELECT id,name FROM master_region WHERE status=1");
          const master_educational_level  = await db.query("SELECT id,name FROM master_educational_level WHERE status=1");
          const master_nationality = await db.query("SELECT id,name FROM master_nationality WHERE status=1");

          var masterQuizArr = [];
          for(var i =0; i< master_quiz.rows.length; i++){
            var masterQuizObj=master_quiz.rows[i];
            masterQuizObj['icon'] ="default/iconbook.png";
            masterQuizObj['description'] ="";
            masterQuizArr.push(masterQuizObj);
          }

           var masterSubQuizArr = [];
          for(var i =0; i< master_sub_quiz.rows.length; i++){
            var masterSubQuizObj=master_sub_quiz.rows[i];
            masterSubQuizObj['icon'] ="default/iconbook.png";
            masterSubQuizObj['description'] ="";
            masterSubQuizArr.push(masterSubQuizObj);
          }

          var subjectArr = [];
          for(var i =0; i< master_subject.rows.length; i++){
            var subjectObj=master_subject.rows[i];
            if(subjectObj['icon']=='' || subjectObj['icon']==null){
              subjectObj['icon']  ="default/iconbook.png";
            }
            subjectObj['icon1'] ="default/iconbook1.png";
            subjectObj['description'] ="";
            subjectArr.push(subjectObj);
          }

           return res.json({
             "status": 200,
             "data":{
                      "master_quiz":masterQuizArr,
                      "master_sub_quiz":masterSubQuizArr,
                      "master_level":master_level.rows,
                      "master_group":master_group.rows,
                      "master_chapter":master_chapter.rows,
                      "master_lesson":master_lesson.rows, 
                      "master_semester":master_semester.rows, 
                      "master_grade":master_grade.rows,
                      "master_university":master_university.rows,
                      "master_school":master_school.rows, 
                      "master_district":master_district.rows,
                      "master_subject":subjectArr,
                      "master_country":master_country.rows,
                      "master_region":master_region.rows,
                      "master_educational_level":master_educational_level.rows,
                      "master_nationality":master_nationality.rows
                    },
             "message":"Success"
           });
        

    } catch (err) {
      return next(err);
    }

});


/*
*********************************
* Function to check username exist
*********************************
*/

router.get("/check_username/:username", async function(req, res, next) {
  
  
  if(req.params.username)
  {
    try {
         const results = await db.query("SELECT * FROM users WHERE username=$1", [
          req.params.username
        ]);

        if(results.rows.length>0)
        {
         
          return res.json({
             "status": 201,
             "data":{},
             "message":"اسم المستخدم موجود بالفعل."
           });
        
         
        } 
        else {
          return res.json({
            "status": 200,
            "data":{},
            "message":"اسم المستخدم متوفر"
          });
        }
        

    } catch (err) {
      return next(err);
    }
  }
  else{

    return res.json({
             "status": 403,
             "message":"المعلومات المطلوبة غير متوفرة"
           });

  }
});

//get notification
router.post('/get_notification', async function (req, res,next) {

  if(req.body.access_token && req.body.user_id)
  {
    var access_token = req.body.access_token;
    var user_id      = req.body.user_id;
    var page  =1;
    var limit =10;
    var offset=0;

    if(req.body.page){
      page      = req.body.page;
      if(page>1){
        offset = (page*limit)-limit;  
      }
      
    }

    var is_read=0;
    if(req.body.is_read)
    {
      is_read = req.body.is_read;
      db.query("UPDATE notification SET is_read=$1 WHERE sent_to=$2",['1',user_id]);
    }

    //console.log("--page"+page+"---offset+"+offset);
    const isTrue= await isValidToken(access_token);
    if(!isTrue){
           return res.json({
               "status": 201,
               "data":[],
               "message":"رمز الدخول غير صالح"
             });
    }
   
    const notyQuery = await db.query("SELECT * FROM notification WHERE sent_to=$1 order by id desc limit $2 offset $3",[user_id,limit,offset]);
    const notyAllQuery = await db.query("SELECT * FROM notification WHERE sent_to=$1 AND is_read=$2",[user_id,'0']);
    const notyObj   =notyQuery.rows;
   
    return res.json({
               "status": 200,
               "data":{'result':notyObj,'count':notyAllQuery.rows.length},
               "message":"نجاح"
             });
  }
  else{
     return res.json({"status": 403, "data":{},"message": "المعلومات المطلوبة غير متوفرة" });
  }

});

/*
*********************************
* Function for update token
*********************************
*/

router.post("/update_token",async function(req, res, next) {
 
  if(req.body.access_token && req.body.device_id && req.body.device_token && req.body.type && req.body.model )
  {
   
    const access_token = req.body.access_token;
    const device_token = req.body.device_token;
    const device_id    = req.body.device_id;
    const user_id      = req.body.user_id;
    const type         = req.body.type;
    const model        = req.body.model;

    try {

          const isTrue= await isValidToken(access_token);
          if(!isTrue){
                 return res.json({
                     "status": 201,
                     "data":[],
                     "message":"رمز الدخول غير صالح"
                   });
          }
          const chek_device = await db.query("SELECT * FROM device WHERE device_id=$1 AND user_id=$2", [
            device_id,user_id
          ]);

          if(chek_device.rows.length==0)
          {
            db.query(
              "INSERT INTO device (user_id,device_id,device_token,type,model) VALUES ($1,$2,$3,$4,$5)",
              [user_id, device_id,device_token,type,model]);
          }
          else{
             db.query("UPDATE device SET device_token=$1 WHERE user_id=$2 AND device_id=$3",
            [device_token,user_id,device_id]);
          }
          
           return res.json({
             "status": 200,
             "data":{},
             "message":"تم تحديث رمز الجهاز"
           });
        
        

    } catch (err) {
      return next(err);
    }
  }
  else{
     return res.json({"status": 403, "data":[],"message": "المعلومات المطلوبة غير متوفرة" });
  }
});


/*
*********************************
* Function for Guest User login 
*********************************
*/

router.post("/guest_login",async function(req, res, next) {
  var avatr_name='';
  if(req.body.device_id && req.body.device_token && req.body.type && req.body.model)
  {
    var timeInMss = Date.now()
    var first_name='Guest';
    var last_name=''; 
    var email=''; 
    var role_id='7'; // rol id 7 for guest
    var access_token=req.body.device_id;
    var password=common.encode64(access_token);
    var phone_number='';
    var nationality='';
    var age='';
    var country='';
    var city='';
    var region='';
    var education='';
    var account_type='';
    var gender='';
    var school='';
    var avatr_name='';
    var username='';

    var default_num = Math.floor(Math.random() * 48) + 1;
    avatr_name= 'default/avatar/avatar-'+default_num+'.png';


    try {

         //user chek
          const lastGuestQuery = await db.query("SELECT * FROM users WHERE role_id=$1 order by id desc",[role_id]);
    
          if(lastGuestQuery.rows.length>0)
          {
            var lastGuestUname = lastGuestQuery.rows[0].username;
            var strArray = lastGuestUname.split("Guest");
            var unumber =Number(1)+Number(strArray[1]);
            username ="Guest"+unumber;
            email = username+'@alaam.net';
          }
          else{
            username="Guest1";
            email = username+'@alaam.net';
          }
          console.log(email);
         //check guest exits
          const checkGuest = await db.query("SELECT * FROM users WHERE access_token=$1 AND role_id=$2", [access_token,role_id]);
          if(checkGuest.rows.length>0)
          {
            var guestObj = newlyCreatedUserId = checkGuest.rows[0];
            console.log("exist---"+guestObj);
          } 
          else{
            console.log("before insert");

              const result = await db.query(
              "INSERT INTO users (first_name,last_name,email,role_id,password,access_token,user_avatar,username,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
              [first_name,
              last_name, 
              email, 
              role_id,
              password,
              access_token,
              avatr_name,
              username,
              '0']
            );
           var guestObj = result.rows[0];
            console.log("after  insert");

          }
          var newlyCreatedUserId=guestObj.id;
          /////////Update device table/////////////////
          const chek_device = await db.query("SELECT * FROM device WHERE device_id=$1 AND user_id=$2", [
            req.params.device_id,newlyCreatedUserId
          ]);

          if(chek_device.rows.length==0)
          {
            db.query(
              "INSERT INTO device (user_id,device_id,device_token,type,model) VALUES ($1,$2,$3,$4,$5)",
              [newlyCreatedUserId, req.body.device_id,req.body.device_token,req.body.type,req.body.model]);
          }
          else{
             db.query("UPDATE device SET device_token=$1 WHERE user_id=$2 AND device_id=$3",
            [req.body.device_token,newlyCreatedUserId,req.body.device_id]);
          }
           
          /////////////////////////////////////////////
 
            return res.json({
             "status": 200,
             "data": {'user':guestObj,'permission':[]},
             "message":"تم تسجيل الدخول للمستخدم الزائر بنجاح"
           });
        
        

    } catch (err) {
      return next(err);
    }
  }
  else{
     return res.json({"status": 403, "data":[],"message": "المعلومات المطلوبة غير متوفرة" });
  }
});

/*
*********************************
* Function for create boat user 
*********************************
*/

router.post("/boat_user",async function(req, res, next) {
  var avatr_name='';
  if(req.body.device_id)
  {
    var timeInMss = Date.now()
    var first_name='Boat';
    var last_name=''; 
    var email=''; 
    var role_id='8'; // rol id 8 for boat
    var access_token=req.body.device_id;
    var password=timeInMss+common.encode64(access_token);
    var phone_number='';
    var nationality='';
    var age='';
    var country='';
    var city='';
    var region='';
    var education='';
    var account_type='';
    var gender='';
    var school='';
    var avatr_name='';
    var username='';


    try {

         //user chek
          const lastBoatQuery = await db.query("SELECT * FROM users WHERE role_id=$1 order by id desc",[role_id]);
    
          if(lastBoatQuery.rows.length>0)
          {
            var lastBoatUname = lastBoatQuery.rows[0].username;
            var strArray = lastBoatUname.split("Boat");
            var unumber =Number(1)+Number(strArray[1]);
            username ="Boat"+unumber;
            email = username+'@alaam.net';
          }
          else{
            username="Boat1";
            email = username+'@alaam.net';
          }
          console.log(email);
         //check guest exits
          const result = await db.query(
              "INSERT INTO users (first_name,last_name,email,role_id,password,access_token,user_avatar,username,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
              [first_name,
              last_name, 
              email, 
              role_id,
              password,
              access_token,
              avatr_name,
              username,
              '0']
            );
          
          /////////////////////////////////////////////
 
            return res.json({
             "status": 200,
             "data": result.rows[0],
             "message":"تم إنشاء مستخدم بوت"
           });
        
        

    } catch (err) {
      return next(err);
    }
  }
  else{
     return res.json({"status": 403, "data":[],"message": "المعلومات المطلوبة غير متوفرة" });
  }
});



/*
*********************************
* Function for update user profile
*********************************
*/

router.post("/update_profile",async function(req, res, next) {


  if(req.body.first_name && req.body.user_id)
  {
    var timeInMss    = new Date(new Date().toUTCString());
    var first_name   = req.body.first_name;
    var last_name    = req.body.last_name;
    var access_token = req.body.access_token;
    var user_id      = req.body.user_id;
    var nationality  = req.body.nationality;
    var age          = req.body.age;
    var country      = req.body.country;
    var city         = req.body.city;
    var region       = req.body.region;
    var education    = req.body.education;
    var gender       = req.body.gender;

    var school='';
    var university='';
    var other_country='';
    var other_nationality='';
    var account_type='';


    if(req.body.school){
      school = req.body.school;
    }
    if(req.body.university){
      university = req.body.university;
    }
    if(req.body.other_country){
      other_country = req.body.other_country;
    }
    if(req.body.other_nationality){
      other_nationality = req.body.other_nationality;
    }

    if(req.body.account_type){
      account_type = req.body.account_type;
    }

    try {
          const isTrue= await isValidToken(access_token);
          if(!isTrue){
                 return res.json({
                     "status": 201,
                     "data":[],
                     "message":"رمز الدخول غير صالح"
                   });
          }

            const result = await db.query(
            "UPDATE users SET first_name=$1,last_name=$2,nationality=$3,modified_by=$4,modified_at=$5,age=$6,country=$7,city=$8,region=$9,education=$10,gender=$11,school=$12,university=$13,other_country=$14,other_nationality=$15,account_type=$16 WHERE id=$17",
            [first_name,
            last_name, 
            nationality,
            user_id,
            timeInMss,
            age,
            country,
            city,
            region,
            education,
            gender,
            school,
            university,
            other_country,
            other_nationality,
            account_type,
            user_id]
            );  
          
          var isProfileCompleted=0;
          if(education=='' || education==null || country=='' || country==null || city=='' || city==null || region=='' || region==null){
            isProfileCompleted=0;
          }
          else{
            isProfileCompleted=1;
          }

          /////////////////////////////////////////////
           return res.json({
             "status": 200,
             "data":[{"isProfileCompleted":isProfileCompleted}],
             "message":"تم تحديث الملف الشخصي بنجاح"
           });
        
    } catch (err) {
      return next(err);
    }
  }
  else{
     return res.json({"status": 403, "data":[],"message": "المعلومات المطلوبة غير متوفرة" });
  }
});

/*
*********************************
* Function for update user profile
*********************************
*/

router.post("/update_profile_image",upload.single('user_avatar'),async function(req, res, next) {

  var avatr_name='';
  if(req.file && req.file.key){
    avatr_name= req.file.key;
  }

  if(req.body.access_token && req.body.user_id)
  {
    var timeInMss    = new Date(new Date().toUTCString());
    var access_token = req.body.access_token;
    var user_id      = req.body.user_id;

    try {
          const isTrue= await isValidToken(access_token);
          if(!isTrue){
                 return res.json({
                     "status": 201,
                     "data":[],
                     "message":"رمز الدخول غير صالح"
                   });
          }

          const result = await db.query(
          "UPDATE users SET user_avatar=$1,modified_by=$2,modified_at=$3 WHERE id=$4",
          [
          avatr_name,
          user_id,
          timeInMss,
          user_id]
        );


          /////////////////////////////////////////////
           return res.json({
             "status": 200,
             "data":{"user_avatar":avatr_name},
             "message":"تم تحديث الصورة الشخصية بنجاح"
           });
        
    } catch (err) {
      return next(err);
    }
  }
  else{
     return res.json({"status": 403, "data":[],"message": "المعلومات المطلوبة غير متوفرة" });
  }
});


/*
*********************************
* Send OTP
*********************************
*/

router.post("/send_otp", async function(req, res, next) {
  if(req.body.otp_type && req.body.first_name && (req.body.email || req.body.phone_number))
  {
    var first_name= req.body.first_name;
    var new_otp = Math.floor(1000 + Math.random() * 9000);

    if(req.body.otp_type =='email'){
      try {
          const checkOtp = await db.query("SELECT * FROM user_otp WHERE key=$1 AND val=$2 AND status=$3", [
            req.body.otp_type,
            req.body.email,
            '0'
          ]);

          if(checkOtp.rows.length>0)
          {
            var _id = checkOtp.rows[0].id; 
            db.query(
            "UPDATE user_otp SET key=$1,val=$2,otp=$3,status=$4 WHERE id=$5",
            [req.body.otp_type,req.body.email,new_otp,'0',_id]);
          } 
          else {
           db.query(
            "INSERT INTO user_otp (key,val,otp,status) VALUES ($1,$2,$3,$4)",
            [req.body.otp_type,req.body.email,new_otp,'0']);
          }

          //////////send mail//////////////////////////
          var html_body='<table style="font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:20px;color:#666666;" border="0" align="center" width="600" cellspacing="0" cellpadding="0">';
              html_body +='<tbody>';
                html_body +='<tr>';
                html_body +='<td>';      
                  html_body +='<table border="0" bgcolor="#ffffff" width="100%" cellspacing="5" cellpadding="0">';
                    html_body +='<tbody>';
                      html_body +='<tr>';
                        html_body +='<td>';               
                          html_body +='<img style="float:right;" src="https://alaam.net:4200/assets/images/auth/allam.png" alt="AlaamApp"></td>';
                      html_body +='</tr>';
                      html_body +='<tr>';
                        html_body +='<td height="5"><br></td>';
                      html_body +='</tr>';
                      html_body +='<tr>';
                        html_body +='<td bgcolor="#cccccc" height="2"><br></td>';
                      html_body +='</tr>';
                      html_body +='<tr>';
                        html_body +='<td height="5"><br></td>';
                      html_body +='</tr>';
                      html_body +='<tr>';
                        html_body +='<td><strong>Dear '+first_name+',</strong></td>';
                      html_body +='</tr>';
                  
                      html_body +='<tr>';
                        html_body +='<td>&nbsp;</td>';
                      html_body +='</tr>';
                       html_body +='<tr>';
                        html_body +='<td>Your OTP :<strong> '+new_otp+'</strong></td>';
                      html_body +='</tr>';

                      html_body +='<tr>';
                        html_body +='<td>&nbsp;</td>';
                      html_body +='</tr>';

                  html_body +='<tr>';
                    html_body +='<td>&nbsp;</td>';
                  html_body +='</tr>';
                  html_body +='<tr>';
                    html_body +='<td><strong>Thanks,</strong></td>';
                  html_body +='</tr>';
                  html_body +='<tr><td><strong>Alaam App</strong><br></td>';
                  html_body +='</tr>';
                  html_body +='<tr>';
                    html_body +='<td><hr>';
                    html_body +='</td>';
                  html_body +='</tr>';
                html_body +='</tbody>';
                html_body +='</table>';
              html_body +='</td>';
            html_body +='</tr>';
            html_body +='</tbody>';
            html_body +='</table>';

            const message = {
                from: 'Alaam App <info@alaam.net>', // Sender address
                to: req.body.email,         // List of recipients
                subject: 'OTP - Alaam App',
                html: html_body
            };

          transport.sendMail(message, function(err, info) {
              if (err) {
                console.log(err)
              } else {
                console.log(info);
              }
          });

          /////////////////////////////////////////////

          return res.json({
              "status": 200,
              "message":"تم ارسال رسالة التحقق (OTP).بنجاح"
          });
          

      } catch (err) {
        return next(err);
      }
    }
    else{
          const checkOtp = await db.query("SELECT * FROM user_otp WHERE key=$1 AND val=$2 AND status=$3", [
            req.body.otp_type,
            req.body.phone_number,
            '0'
          ]);

          if(checkOtp.rows.length>0)
          {
            var _id = checkOtp.rows[0].id; 
            db.query(
            "UPDATE user_otp SET key=$1,val=$2,otp=$3,status=$4 WHERE id=$5",
            [req.body.otp_type,req.body.phone_number,new_otp,'0',_id]);
          } 
          else {
           db.query(
            "INSERT INTO user_otp (key,val,otp,status) VALUES ($1,$2,$3,$4)",
            [req.body.otp_type,req.body.phone_number,new_otp,'0']);
          }

          let otpRquestUrl= "http://basic.unifonic.com/rest/SMS/messages?AppSid=XDdaxt7V02S5ymy3VM10zHvvEFvFDY&SenderID=ALAAM-AD&Body="+new_otp+"+is+your+OTP+code.&Recipient="+req.body.phone_number+"&responseType=JSON&CorrelationID=%22%22&baseEncode=true&statusCallback=sent&async=0";
          axios.post(otpRquestUrl, {
            todo: 'alaam otp'
          })
          .then(res => {
            console.log(`statusCode: ${res.statusCode}`)
            console.log(res)
          })
          .catch(error => {
            console.error(error)
          })
          return res.json({
              "status": 200,
              "message":"تم ارسال رسالة التحقق بنجاح"
          });
    }
    
  }
  else{

    return res.json({
             "status": 403,
             "message":"المعلومات المطلوبة غير متوفرة"
           });

  }
});


/*
*********************************
* Verify OTP
*********************************
*/

router.post("/verify_otp", async function(req, res, next) {
  if(req.body.otp_type && req.body.user_otp && (req.body.email || req.body.phone_number))
  {

    if(req.body.otp_type =='email'){
      try {
          const checkOtp = await db.query("SELECT * FROM user_otp WHERE key=$1 AND val=$2 AND status=$3 AND otp=$4", [
            req.body.otp_type,
            req.body.email,
            '0',
            req.body.user_otp
          ]);

          if(checkOtp.rows.length>0)
          {
            var _id = checkOtp.rows[0].id; 
            db.query(
            "UPDATE user_otp SET status=$1 WHERE id=$2",
            ['1',_id]);

            return res.json({
              "status": 200,
              "message":"التحقق من صلاحية رمز التحقق (OTP)."
            }); 

          } 
          else {
           return res.json({
              "status": 201,
              "message":"رمز التحقق(OTP) غير صالح"
            }); 
          }          

      } catch (err) {
        return next(err);
      }
    }
    else{
       try {
          const checkOtp = await db.query("SELECT * FROM user_otp WHERE key=$1 AND val=$2 AND status=$3 AND otp=$4", [
            req.body.otp_type,
            req.body.phone_number,
            '0',
            req.body.user_otp
          ]);

          if(checkOtp.rows.length>0)
          {
            var _id = checkOtp.rows[0].id; 
            db.query(
            "UPDATE user_otp SET status=$1 WHERE id=$2",
            ['1',_id]);

            return res.json({
              "status": 200,
              "message":"التحقق من صحة أو تي بي (OTP)"
            }); 

          } 
          else {
           return res.json({
              "status": 201,
              "message":"و تي بي (OTP) غير صالح"
            }); 
          }          

      } catch (err) {
        return next(err);
      }

    }
    
  }
  else{

    return res.json({
             "status": 403,
             "message":"المعلومات المطلوبة غير متوفرة"
           });

  }
});

//get profile
router.post('/get_profile', async function (req, res,next) {

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
   
    const userQuery = await db.query("SELECT * FROM users WHERE id=$1",[user_id]);
    
    var userObj   =userQuery.rows[0];
    userObj.password="";

    // user profile points
    const summeryQ = await db.query("SELECT competition_type,SUM(points) AS points FROM user_points WHERE user_id=$1 GROUP BY competition_type", [
      user_id]);
     //var summeryArr=summeryQ.rows;

      var questionObj     = summeryQ.rows;
      var summeryArr      = [];
      var userArr = [];
      let points = 0;
      let total_points=0;
      var user_level  =1;
      var level_title='مبتدئ';
     for(let i=0;i<questionObj.length;i++)
     {
       let qObjs     = questionObj[i];
       total_points = Number(total_points) +Number(qObjs.points);
     }

     let min = Number.POSITIVE_INFINITY;
     let max = Number.POSITIVE_INFINITY;
     var tmp;
     let levelObj =  {}
     for(let i=0;i<questionObj.length;i++)
     {
       let pointObj = {}
       
       let qObj     = questionObj[i];
       pointObj['competiiton_type'] = qObj.competition_type;
       pointObj['points'] = qObj.points;
       
      //  min = Math.min(min, qObj.points);
      //  max = Math.max(max, qObj.points)

      tmp = qObj.points;
      if (tmp < min) min = tmp;
      if (tmp > max) max = tmp;

      userObj['total_points'] = total_points;
       if(total_points>0 && total_points <=200){
         userObj['level'] = 'مستوي 1';
         user_level=1;
         level_title='مبتدئ';
       }else if(total_points>200 && total_points <=400){
         userObj['level'] = 'مستوي 2';
         user_level=2;
         level_title='ماهر';
       }else if(total_points>400 && total_points <=600){
         userObj['level'] = 'مستوي 3';
         user_level=3;
         level_title='متوسط';
       }else if(total_points>600 && total_points <=800){
         userObj['level'] = 'مستوي 4';
         user_level=4;
         level_title='متقدم';
       }else if(total_points>800){
         userObj['level'] = 'مستوي 5';
         user_level=5;
         level_title='خبير';
       }
       summeryArr.push(pointObj);
     }
     userArr.push(userObj);

     //update user level////
     db.query("UPDATE users SET user_level=$1,level_title=$2 WHERE id=$3",[user_level,level_title,user_id]);
     ///////////////////////
   
    return res.json({
               "status": 200,
               "data":{ "userObj": userArr, "point":summeryArr},
               "message":"success"
             });
  }
  else{
     return res.json({"status": 403, "data":{},"message": "المعلومات المطلوبة غير متوفرة" });
  }

});


/*
*********************************
* Function for change password
*********************************
*/

router.post("/change_password",async function(req, res, next) {

  if(req.body.old_password && req.body.password && req.body.user_id && req.body.access_token)
  {
    var timeInMss    = new Date(new Date().toUTCString());
    var password     = common.encode64(req.body.password);
    var old_password = common.encode64(req.body.old_password);
    var access_token = req.body.access_token;
    var user_id      = req.body.user_id;


    try {
          const isTrue= await isValidToken(access_token);
          if(!isTrue){
                 return res.json({
                     "status": 201,
                     "data":[],
                     "message":"رمز الدخول غير صالح"
                   });
          }

          const chek_oldpass = await db.query("SELECT * FROM users WHERE password=$1", [old_password]);

          if(chek_oldpass.rows.length==0)
          {
             return res.json({
                     "status": 201,
                     "data":[],
                     "message":"كلمة المرور السابقة غير صحيحة"
                   });
          }

          const result = await db.query(
            "UPDATE users SET password=$1,modified_by=$2,modified_at=$3 WHERE id=$4",
            [password,
            user_id, 
            timeInMss,
            user_id]
          );
          
          /////////////////////////////////////////////
           return res.json({
             "status": 200,
             "data" :{},
             "message":"تم تعديل كلمة المرور بنجاح"
           });
        
    } catch (err) {
      return next(err);
    }
  }
  else{
     return res.json({"status": 403, "data":[],"message": "المعلومات المطلوبة غير متوفرة" });
  }
});


/*
**********************************
* Function for OFF Notification
*********************************
*/

router.post("/block_notification",async function(req, res, next) {
  console.log(req.body);
  if(req.body.access_token && req.body.user_id && req.body.device_id)
  {
    var timeInMss    = new Date(new Date().toUTCString());
    var access_token = req.body.access_token;
    var user_id      = req.body.user_id;
    var device_id    = req.body.device_id;

    try {
          const isTrue= await isValidToken(access_token);
          if(!isTrue){
                 return res.json({
                     "status": 201,
                     "data":[],
                     "message":"رمز الدخول غير صالح"
                   });
          }

          db.query("DELETE from device WHERE user_id=$1 AND device_id=$2",
            [user_id,device_id]);

          /////////////////////////////////////////////
          db.query("UPDATE users SET notification=$1 WHERE id=$2",['0',user_id]);
          /////////////////////////////////////////////
           return res.json({
             "status": 200,
             "data":{},
             "message":" تم إلغاء الإشعارات"
           });
        
    } catch (err) {
      return next(err);
    }
  }
  else{
     return res.json({"status": 403, "data":[],"message": "المعلومات المطلوبة غير متوفرة" });
  }
});

/*
**********************************
* Function for ON Notification
*********************************
*/

router.post("/allow_notification",async function(req, res, next) {

  if(req.body.access_token && req.body.user_id && req.body.device_id && req.body.device_token && req.body.type && req.body.model)
  {
    var timeInMss    = new Date(new Date().toUTCString());
    var access_token = req.body.access_token;
    var user_id      = req.body.user_id;
    var device_id    = req.body.device_id;
    var device_token = req.body.device_token;
    var type     = req.body.type;
    var model    = req.body.model;

    try {
          const isTrue= await isValidToken(access_token);
          if(!isTrue){
                 return res.json({
                     "status": 201,
                     "data":[],
                     "message":"رمز الدخول غير صالح"
                   });
          }

              /////////Update device table/////////////////
          const chek_device = await db.query("SELECT * FROM device WHERE device_id=$1 AND user_id=$2", [
            req.body.device_id,user_id
          ]);

          if(chek_device.rows.length==0)
          {
            db.query(
              "INSERT INTO device (user_id,device_id,device_token,type,model) VALUES ($1,$2,$3,$4,$5)",
              [user_id, req.body.device_id,req.body.device_token,req.body.type,req.body.model]);
          }
          else{
             db.query("UPDATE device SET device_token=$1 WHERE user_id=$2 AND device_id=$3",
            [req.body.device_token,user_id,req.body.device_id]);
          }
          /////////////////////////////////////////////
          db.query("UPDATE users SET notification=$1 WHERE id=$2",['1',user_id]);
          /////////////////////////////////////////////
           return res.json({
             "status": 200,
             "data":{},
             "message":" تم تفعيل ارسال الإشعارات"
           });
        
    } catch (err) {
      return next(err);
    }
  }
  else{
     return res.json({"status": 403, "data":[],"message": "المعلومات المطلوبة غير متوفرة" });
  }
});

/*
**********************************
* Function for logout
*********************************
*/

router.post("/logout",async function(req, res, next) {

  if(req.body.access_token && req.body.user_id && req.body.device_id)
  {
    var timeInMss    = new Date(new Date().toUTCString());
    var access_token = req.body.access_token;
    var user_id      = req.body.user_id;
    var device_id    = req.body.device_id;

    try {
          // const isTrue= await isValidToken(access_token);
          // if(!isTrue){
          //        return res.json({
          //            "status": 201,
          //            "data":[],
          //            "message":"رمز الدخول غير صالح"
          //          });
          // }

       db.query("DELETE from device WHERE user_id=$1 AND device_id=$2",
            [user_id,device_id]);


          /////////////////////////////////////////////
           return res.json({
             "status": 200,
             "data":{},
             "message":"تمت تسجيل الخروج بنجاح"
           });
        
    } catch (err) {
      return next(err);
    }
  }
  else{
     return res.json({"status": 403, "data":[],"message": "المعلومات المطلوبة غير متوفرة" });
  }
});


/*
*********************************
* Function for accept term age17
*********************************
*/

router.post("/accept_age_term",async function(req, res, next) {

  if(req.body.user_id && req.body.access_token)
  {
    var timeInMss    = new Date(new Date().toUTCString());
    var access_token = req.body.access_token;
    var user_id      = req.body.user_id;


    try {
          const isTrue= await isValidToken(access_token);
          if(!isTrue){
                 return res.json({
                     "status": 201,
                     "data":[],
                     "message":"رمز الدخول غير صالح"
                   });
          }

          
          const result = await db.query(
            "UPDATE users SET accept_age_term=$1,modified_by=$2,modified_at=$3 WHERE id=$4",
            ['1',
            user_id, 
            timeInMss,
            user_id]
          );
          
          /////////////////////////////////////////////
           return res.json({
             "status": 200,
             "data" :{},
             "message":"نجاح"
           });
        
    } catch (err) {
      return next(err);
    }
  }
  else{
     return res.json({"status": 403, "data":[],"message": "المعلومات المطلوبة غير متوفرة" });
  }
});


/*
**********************************
* Function for read notification
*********************************
*/

router.post("/read_notification",async function(req, res, next) {

  if(req.body.access_token && req.body.user_id && req.body.is_read)
  {
    var timeInMss    = new Date(new Date().toUTCString());
    var access_token = req.body.access_token;
    var user_id      = req.body.user_id;
    var is_read      = req.body.is_read;

    try {
          const isTrue= await isValidToken(access_token);
          if(!isTrue){
                 return res.json({
                     "status": 201,
                     "data":[],
                     "message":"رمز الدخول غير صالح"
                   });
          }
          
          /////////////////////////////////////////////
          db.query("UPDATE notification SET is_read=$1 WHERE sent_to=$2",['1',user_id]);
          /////////////////////////////////////////////
           return res.json({
             "status": 200,
             "data":{},
             "message":"نجاح"
           });
        
    } catch (err) {
      return next(err);
    }
  }
  else{
     return res.json({"status": 403, "data":[],"message": "المعلومات المطلوبة غير متوفرة" });
  }
});

module.exports = router;