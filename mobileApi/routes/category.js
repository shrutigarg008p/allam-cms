const express = require("express");
const router = express.Router();
const db = require("../db");
const transport = require("../config/smtp.js");
const common = require("../config/common.js");


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


///get category by heading
router.get("/get_header_categories_new/:access_token", async function(req, res, next) {
  try {

    const results = await db.query("SELECT category_group_relation.*, category_group.title, category_group.icon FROM category_group_relation INNER JOIN category_group ON category_group_relation.category_group_id::integer=category_group.id ");
    var resultsObj = results.rows;
    //
    var category_ids=[];
    var finalArr=[];
     for(var j =0; j< resultsObj.length; j++)
     {
       var preFinalArr=[];
      if(resultsObj[j].category_ids!='' && resultsObj[j].category_ids!='undefined' && resultsObj[j].category_ids!=null){
      category_ids=JSON.parse(resultsObj[j].category_ids);
       for(var i =0; i< category_ids.length; i++){
          var catArr = await db.query("SELECT * FROM categories  WHERE id=$1" , [category_ids[i].id]);
          var catObj = catArr.rows[0]; 
          preFinalArr.push(catObj);
        }
        if(preFinalArr.length>0){
          finalArr.push({'id':resultsObj[j].category_group_id,'title':resultsObj[j].title,'icon':resultsObj[j].icon,categories:preFinalArr});
        }
      }
    }
    
    return res.json(finalArr);
  } catch (err) {
    return next(err);
  }
});

///get all categories and header  old
router.get("/get_header_categories_old/:access_token", async function(req, res, next) {
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
    const question = await db.query("SELECT category_group_relation.*, category_group.title, category_group.icon FROM category_group_relation JOIN category_group ON category_group_relation.category_group_id::integer=category_group.id where category_group.status='1'");
     		var questionObj = question.rows;

     		var result = [];
		    for(var i =0; i< questionObj.length; i++){
          if(questionObj[i].category_ids!='undefined' && questionObj[i].category_ids!='' && questionObj[i].category_ids!=null)
          {
		    	var category_ids = JSON.parse(questionObj[i].category_ids);
		    	//console.log(category_ids);
		    	for(var j =0; j< category_ids.length; j++){
			    	var categoriesArr = await db.query("SELECT id , icon FROM categories WHERE id = $1", [category_ids[j].id]);
			    	var categoryObj = categoriesArr.rows;
			    	//console.log(categoryObj);
            if(categoryObj.length>0){
			    	  category_ids[j].category_icon = categoryObj[0].icon;
            }
			    }
		    	var ress = {id: questionObj[i].category_group_id,title: questionObj[i].title, icon : questionObj[i].icon, categories: category_ids};
		    	
            if(category_ids.length>0){
              result.push(ress);
            }
          }
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


///get category by heading -running
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

    const results = await db.query("SELECT category_group_relation.*, category_group.title, category_group.icon,category_group.is_audio FROM category_group_relation INNER JOIN category_group ON category_group_relation.category_group_id::integer=category_group.id where category_group.status='1'");
    var resultsObj = results.rows;
    //
    var category_ids=[];
    var finalArr=[];
     for(var j =0; j< resultsObj.length; j++)
     {
       var preFinalArr=[];
      if(resultsObj[j].category_ids!='' && resultsObj[j].category_ids!='undefined' && resultsObj[j].category_ids!=null){
      category_ids=JSON.parse(resultsObj[j].category_ids);
       for(var i =0; i< category_ids.length; i++){
          var catArr = await db.query("SELECT id, title,icon as category_icon FROM categories  WHERE id=$1 AND status=$2" , [category_ids[i].id,'1']);
          var chkQuesArr = await db.query("SELECT * FROM gc_question  WHERE header_id=$1 AND category_id=$2" , [resultsObj[j].category_group_id,category_ids[i].id]);
          var catObj = catArr.rows[0]; 
          if(chkQuesArr.rows.length > 0 && catArr.rows.length>0){
            preFinalArr.push(catObj);  
          }
          
        }
        if(preFinalArr.length>0){
          finalArr.push({'id':resultsObj[j].category_group_id,'title':resultsObj[j].title,'icon':resultsObj[j].icon,'is_audio':resultsObj[j].is_audio,categories:preFinalArr});
        }
      }
    }
    
    //return res.json(finalArr);
    return res.json({
          "status": 200,
          'data':finalArr,
        });
  } catch (err) {
    return next(err);
  }
});
module.exports = router;