var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var c__id = null;
var s__id = null;
var loginto = require('../modules/loginto');
var connection = mysql.createConnection({
host:"localhost",
user:"root",
password:"",
database:"fit"
});


/* GET home page. */
router.get('/', function(req, res, next) {
		console.log(req.sessionID);
		s_id = req.sessionID;	
		res.render('index');
		});

router.get('/signup', function(req,res,next) {
		res.render('signup');
		});

router.get('/login', function(req,res,next) {	
		res.render('login');
		});

router.post('/signup',function(req,res,next) {
		var item = req.body;
		var client;
		var date = new Date(Date.now());
		date = date.toISOString().split('T')[0];
		connection.connect(function(err){
				if(!err){
				var sql = "INSERT INTO client(name,email,password,join_date) VALUES (?,?,?,?) ";
				connection.query(sql,[item.name,item.email,item.pwd,date],function(err){
						if(!err)
						console.log('Registration successful');
						else
						console.log(err)
						});
				var qry = "SELECT client_id FROM client WHERE email = ?";
				connection.query(qry,[item.email],function(err,result){
						console.log(result);
						if(!err)
						client = result[0].client_id;
						else
						console.log(err);
						});
				var sql = "UPDATE client set end_date =DATE_ADD(?,INTERVAL ? MONTH) where client_id = ?";	
				connection.query(sql,[date,Number(item.period),client],function(err){
						if(!err)
						console.log('End date added');
						else
						console.log(err);
						});
				}
				else
					res.render('error');
		});
		res.render('data' ,{items:item});
});

router.post('/login',loginto.login);


router.get('/logout',function(req,res,next){
		//req.logout();
		//req.session = null;
		//req.session.cookie.expires = new Date(Date.now() + 0);
		//req.session.cookie.maxAge = 0;
		if(req.sessionID)
		console.log('not deleted');
		else
		console.log('deleted the session');
		res.render('login',{title:"You have successfully logged out"});
		});

router.post('/logout',loginto.login);


var result_arr = [];
function setValue (value) {
	result_arr = value;
}

router.get('/success',function(req,res,next){
		console.log(c_id);	
		var sql = "SELECT * FROM (SELECT * FROM client WHERE client_id = ? ) a  INNER JOIN bmi ON bmi.c_id = a.client_id";
		//console.log(sql);
		//var abc = [];
		connection.query(sql,[c_id],function(err,results){
				if(!err){
				var item = results[0];
				var d = item.date_of_birth;
				try{
					item.date_of_birth = d.toISOString().split('T')[0];
				}
				catch(e){
					console.log(e);
				}
				var qry = "SELECT bmi_val,bmi_value from bmi where c_id = ?";
				connection.query(qry,[c_id],function(err,result){
						if(!err){
						console.log(result);
						var bmi = result[0];
						if(bmi != []){
						var q = "SELECT chart FROM d_chart where meaning = ?";
						connection.query(q,[bmi.bmi_value],function(err,rs){
								if(!err){
								var cht = rs[0];
								var qr = "SELECT * FROM nutri";
								connection.query(qr,function(err,rslt){
										if(!err){
										console.log(cht);
										console.log(rslt);
										//var nut = rslt;
										res.render('success',{item,bmi,cht,rslt});
										}
										else
										console.log('error');
										});
								}
								else
								console.log(err);
								});
						}		
						}
						else
							console.log(err);
				});
				//console.log(abc);
				console.log(results);
				//var item = results[0];
				//res.render('success',{item});
				}
				else{
					console.log('error');
					res.render('error');
				}
		});

});

router.get('/dashboard',function(req,res,next){
		res.render('dashboard');
		});

function check(val){
	if(val == '')
		val = null;
	return val;
}

router.post('/dashboard',function(req,res,next){
		var item = req.body;
		console.log(item);
		item.address = check(item.address);
		item.workplace = check(item.workplace);
		item.designation = check(item.designation);
		item.height = check(item.height);
		item.weight = check(item.weight);
		console.log('After function call');
		console.log(item);
		var sql = "UPDATE client SET address = ? , workplace = ? , designation = ? where client_id = ?";
		connection.query(sql,[item.address,item.workplace,item.desg,c_id],function(err,results){
				if(err){
				console.log(err);
				res.redirect('/error');
				}
				else{
				console.log('Success');
				var qry = "UPDATE bmi SET height=?,weight=?,date_of_birth=? where c_id=?";
				/*if(item.height == '')
				item.height = null;
				if(item.weight == '')
				item.weight = null;*/
				connection.query(qry,[item.height,item.weight,item.dob,c_id],function(err,result){
						if(err){
						console.log(err);
						res.redirect('/error');
						}
						else
						console.log('Success');
						});
				var qr = "CALL bmi_to_string(?)";
				connection.query(qr,[c_id],function(err){
					console.log(err)
				});
				}
		});

		res.redirect('/success');
});

router.get('/end',function(req,res,next){
		var sql = "DELETE FROM client WHERE client_id = ?";
		connection.query(sql,[c_id],function(err){
				if(err)
				console.log(err);
				});
		res.render('end');
		});

router.post('/end',function(req,res,next){
		var item = req.body;
		var sql = "UPDATE successful_clients set rating = ? , experience = ? ,tips = ? where client_id = ?";
		connection.query(sql,[item.rating,item.exp,item.tip,c_id],function(err,result){
				if(err){
				console.log(err);
				}
				});
		res.redirect('/');	
		});

module.exports = router;
