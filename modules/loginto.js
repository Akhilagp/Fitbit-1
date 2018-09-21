var mysql = require('mysql');
var connection = mysql.createConnection({
	host:"localhost",
	user:"root",
	password:"joker@23599",
	database:"fit"
});


exports.login = function(req,res,next) {
	var l_name = req.body.name;
	var l_pwd = req.body.pwd;
	connection.connect(function(err){
		var sql = "SELECT client_id,password FROM client WHERE email=?" ;
		connection.query(sql,[l_name],function(err,results,fields){			
			if(!err){
				if(results.length > 0 && results[0].password == l_pwd){
					 c_id = results[0].client_id;
					 console.log(c_id);
					 //console.log(s_id);
					 var qry = "UPDATE client SET session_id  = ? WHERE client_id = ?";
					 connection.query(qry,[s_id,c_id],function(err,result,fields){
							if(!err){
								console.log('Session');
							}
							else
								res.render('error');
						});
					 res.redirect('/success');
				}
				else
					res.render('relogin');
			}
			else{
				console.log(err);
				res.render('error');
			}
		});
	});
}
