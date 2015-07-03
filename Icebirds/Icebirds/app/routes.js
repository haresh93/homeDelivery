var User = require('./models/user-model.js');

var Hotel = require('./models/hotel-model.js');

var FoodCat = require('./models/foodCat-model.js');

var FoodItem = require('./models/foodItem-model.js');

var HotelCat = require('./models/hotelCat-model.js');

var CART = require('./models/cart-model.js');

var Order = require('./models/order-model.js');

var nodemailer = require('nodemailer');

var moment = require('moment');



module.exports = function(app,connection) {
	var transporter = nodemailer.createTransport({
	    service: 'Gmail',
	    auth: {
	        user: 'haresh93@gmail.com',
	        pass: 'dadiloveu'
	    }
	});
	app.post('/login', function(req,res){
		
		User.findOne({USR_MOBILE_NUM: req.body.mobileNumber},function(err,user){
			var result;
			if(err) throw err;
			console.log(user);
			if(user==null)
			{
				result = {returnCode:"FAILURE",data: null, errorCode:1010};
				res.json(result);
			}
			else
			{
				user.comparePassword(req.body.password, function(err, isMatch) {
		        	if (err) throw err;
		            if(isMatch)
		            {
		            	result = {returnCode:"SUCCESS",data: user,errorCode: null};
		            	res.json(result);
		            }
		            else
		            {
		            	result = {returnCode:"FAILURE",data: null, errorCode: 1011};
		            	res.json(result);
		            }
	        	});
			}
		});
	});

	app.post('/register',function(req,res){
		var result;
		console.log("Entered into the roure /register");

		User.find({USR_MOBILE_NUM: req.body.mobileNumber},function(err,user){
			if(err) throw err;
			console.log(user);
			if(user.length==0)
			{
				console.log("The user is new");
				console.log(req.body.mobileNumber);
				var newUser = new User({
					USR_MOBILE_NUM: req.body.mobileNumber,
					USR_EMAIL: req.body.email,
					USR_PASSWORD: req.body.password,
					USR_NAME: req.body.userName
				});

				newUser.save(function(err){
					if(err) throw err;
					result = {returnCode: "SUCCESS",data: null,errorCode:null}
					res.json(result);
				});
			}
			else
			{
				console.log("The user is not new");
				result = {returnCode: "FAILURE", data: null, errorCode: 1012};
				res.json(result);
			}

		});
	});

	app.get('/hotels',function(req,res){
		var result;
		console.log("Entered into the route /hotels");

		Hotel.find({},function(err,hotels){
			if(err)
				throw err;
			console.log(hotels);
			var hotelsKey = {};
			for(var i in hotels)
			{
				hotelsKey[hotels[i].HT_ID] = hotels[i];
			}
			result = {returnCode: "SUCCESS",data: {assArray : hotelsKey, hotels: hotels}, errorCode:null};
			res.json(result);
		});

	});

	app.get('/foodCategories',function(req,res){
		var result;
		FoodCat.find({},function(err,foodCats){
			if(err)
				throw err;
			result = {returnCode: "SUCCESS",data: foodCats, errorCode:null};
			res.json(result);
		});

	});

	app.get('/foodItems',function(req,res){
		var result;
		console.log(req.params.foodCat);
		FoodItem.find({},function(err,foodItems){
			if(err)
				throw err;
			var foodItemsKey = {};
			for(var i in foodItems)
			{
				foodItemsKey[foodItems[i].FI_ID] = foodItems[i];
			}
			result = {returnCode: "SUCCESS",data: {assArray:foodItemsKey,foodItems:foodItems}, errorCode:null};
			res.json(result);
		});

	});

	app.get('/hotelCategories',function(req,res){
		var result;
		HotelCat.find({},function(err,hotelCats){
			if(err)
				throw err;
			result = {returnCode: "SUCCESS", data: hotelCats, errorCode:null};
			res.json(result);
		});
	});

	app.post('/addToCart',function(req,res){
		var result;
		CART.find({CART_MOBILE_NUM:req.body.mobileNumber,CART_HOTEL:req.body.hotel},function(err,cartOrder){
			if(err)
				throw err;
			var flag = 0;
			if(cartOrder.length != 0)
			{
				console.log("Entered into length");
				for(var i in cartOrder[0].CART_ITEMS)
				{
					console.log("Outside If");
					if(req.body.item == cartOrder[0].CART_ITEMS[i].item)
					{
						console.log("Entered into cartOrder");
						var updatedCartOrder = cartOrder[0];
						updatedCartOrder.CART_ITEMS[i].qty += req.body.qty;
						updatedCartOrder.CART_ITEMS[i].itemBill = (updatedCartOrder.CART_ITEMS[i].itemPrice * updatedCartOrder.CART_ITEMS[i].qty)
						CART.update({_id:cartOrder[0]._id},{
							$set : {
								CART_ITEMS : updatedCartOrder.CART_ITEMS
							}
						},function(err){
							if(err)
								throw err;
						});
						
						flag = 1;
						CART.aggregate({
									$match : {
										CART_MOBILE_NUM: req.body.mobileNumber
									}
								},
								{
									$unwind : "$CART_ITEMS"
								},
								{
									$group : {
										_id : null,
										totalBill : {$sum: "$CART_ITEMS.itemBill"},
										itemsQty : {$sum: "$CART_ITEMS.qty"}
									}
								}, function(err,summary){
									console.log(summary);
									CART.find({CART_MOBILE_NUM:req.body.mobileNumber},function(err,cartItems){
										console.log(cartItems);
										result = {returnCode:"SUCCESS",data:{cart: cartItems, totalBill: summary[0].totalBill, itemsQty: summary[0].itemsQty},errorCode:null};
										res.json(result);
									});
									
								}
							);
						break;
					}
				}

				if(flag == 0)
				{
					console.log("Same hotel different item");
					FoodItem.find({FI_ID:req.body.item},function(err,foodItem){
						var toPush = {"item":req.body.item, "qty":req.body.qty,"itemPrice": foodItem[0].FI_PRICE,"itemBill":(foodItem[0].FI_PRICE*req.body.qty)}
						console.log(toPush);
						console.log(cartOrder[0]);
						CART.update({_id:cartOrder[0]._id},{
							$push : {"CART_ITEMS": toPush}
						},function(err){
							if(err)
								throw err;
						});
						CART.aggregate({
									$match : {
										CART_MOBILE_NUM: req.body.mobileNumber
									}
								},
								{
									$unwind : "$CART_ITEMS"
								},
								{
									$group : {
										_id : null,
										totalBill : {$sum: "$CART_ITEMS.itemBill"},
										itemsQty : {$sum: "$CART_ITEMS.qty"}
									}
								}, function(err,summary){
									console.log(summary);
									CART.find({CART_MOBILE_NUM:req.body.mobileNumber},function(err,cartItems){
										console.log(cartItems);
										result = {returnCode:"SUCCESS",data:{cart: cartItems, totalBill: summary[0].totalBill, itemsQty: summary[0].itemsQty},errorCode:null};
										res.json(result);	
									});
									
								}
							);
					});


				}

			}
			else
			{
				console.log("What is recieved is "+req.body.item);
				FoodItem.find({FI_ID:req.body.item},function(err,foodItem){
					var newCartItem = new CART({
					CART_MOBILE_NUM: req.body.mobileNumber,
					CART_HOTEL:req.body.hotel, 
					CART_ITEMS: [{
						item:req.body.item,
						qty: req.body.qty,
						itemPrice: foodItem[0].FI_PRICE,
						itemBill: (foodItem[0].FI_PRICE*req.body.qty)}
					]});

					newCartItem.save(function(err){
						if(err)
							throw err;

						CART.aggregate({
									$match : {
										CART_MOBILE_NUM: req.body.mobileNumber
									}
								},
								{
									$unwind : "$CART_ITEMS"
								},
								{
									$group : {
										_id : null,
										totalBill : {$sum: "$CART_ITEMS.itemBill"},
										itemsQty : {$sum: "$CART_ITEMS.qty"}
									}
								}, function(err,summary){
									console.log(summary);
									CART.find({CART_MOBILE_NUM:req.body.mobileNumber},function(err,cartItems){
										console.log(cartItems);
										result = {returnCode:"SUCCESS",data:{cart: cartItems, totalBill: summary[0].totalBill, itemsQty: summary[0].itemsQty},errorCode:null};
										res.json(result);
									});
								}
							);
					});
				});
			}


			
			
			});
		});

		


		app.post('/cartItems',function(req,res){
			CART.find({CART_MOBILE_NUM: req.body.mobileNumber},function(err,cartItems){
				if(err)
					throw err;
				if(cartItems.length != 0)
				{
					CART.aggregate({
									$match : {
										CART_MOBILE_NUM: req.body.mobileNumber
									}
								},

								{
									$unwind : "$CART_ITEMS"
								},
								{
									$group : {
										_id : null,
										totalBill : {$sum: "$CART_ITEMS.itemBill"},
										itemsQty : {$sum: "$CART_ITEMS.qty"}
									}
								}, function(err,summary){
									console.log(summary);
									console.log(cartItems);
									result = {returnCode:"SUCCESS",data:{cart: cartItems, totalBill: summary[0].totalBill, itemsQty: summary[0].itemsQty},errorCode:null};
									res.json(result);
								}
							);
				}
				else
				{
					result = {returnCode:"SUCCESS",data:{cart: cartItems, totalBill: 0, itemsQty: 0},errorCode:null};
					res.json(result);
				}
			});
		});

		app.post('/removeFromCart',function(req,res){
			CART.find({CART_MOBILE_NUM: req.body.mobileNumber,CART_HOTEL:req.body.hotel},function(err,cartOrder){
				for(var i in cartOrder[0].CART_ITEMS)
				{
					console.log("Outside If");
					if(req.body.foodItem == cartOrder[0].CART_ITEMS[i].item)
					{
						cartOrder[0].CART_ITEMS.splice(i,1);
						console.log(cartOrder);
						break;
					}
				}
				if(cartOrder[0].CART_ITEMS.length == 0)
				{
					CART.remove({_id:cartOrder[0]._id},function(err){
						if(err)
							throw err;

						CART.find({CART_MOBILE_NUM:req.body.mobileNumber},function(err,cartItems){
							if(cartItems.length != 0)
							{
								CART.aggregate({
												$match : {
													CART_MOBILE_NUM: req.body.mobileNumber
												}
											},

											{
												$unwind : "$CART_ITEMS"
											},
											{
												$group : {
													_id : null,
													totalBill : {$sum: "$CART_ITEMS.itemBill"},
													itemsQty : {$sum: "$CART_ITEMS.qty"}
												}
											}, function(err,summary){
												console.log(summary);
												console.log(cartItems);
												result = {returnCode:"SUCCESS",data:{cart: cartItems, totalBill: summary[0].totalBill, itemsQty: summary[0].itemsQty},errorCode:null};
												res.json(result);
											}
										);
							}
							else
							{
								result = {returnCode:"SUCCESS",data:{cart: cartItems, totalBill: 0,itemsQty: 0},errorCode:null};
								res.json(result);
							}
						});
					});
				}
				else
				{
					CART.update({_id : cartOrder[0]._id},{
						$set :  {
									CART_ITEMS : cartOrder[0].CART_ITEMS
								}
					},function(err){
						if(err)
							throw err;
						CART.find({CART_MOBILE_NUM:req.body.mobileNumber},function(err,cartItems){
							console.log(cartItems);
							if(cartItems.length != 0)
							{
								CART.aggregate({
												$match : {
													CART_MOBILE_NUM: req.body.mobileNumber
												}
											},

											{
												$unwind : "$CART_ITEMS"
											},
											{
												$group : {
													_id : null,
													totalBill : {$sum: "$CART_ITEMS.itemBill"},
													itemsQty : {$sum: "$CART_ITEMS.qty"}
												}
											}, function(err,summary){
												console.log(summary);
												console.log(cartItems);
												result = {returnCode:"SUCCESS",data:{cart: cartItems, totalBill: summary[0].totalBill, itemsQty: summary[0].itemsQty},errorCode:null};
												res.json(result);
											}
										);
							}
							else
							{
								result = {returnCode:"SUCCESS",data:{cart: cartItems, totalBill: 0,itemsQty: 0},errorCode:null};
								res.json(result);
							}
						});
					});
				}
			});
		});

		app.post('/cartUpdate',function(req,res){
			CART.find({CART_MOBILE_NUM: req.body.mobileNumber,CART_HOTEL:req.body.hotel},function(err,cartOrder){
				for(var i in cartOrder[0].CART_ITEMS)
				{
					console.log(req.body.foodItem + " == " + cartOrder[0].CART_ITEMS[i].item);
					console.log("Outside If");
					if(cartOrder[0].CART_ITEMS[i].item == req.body.foodItem)
					{
						console.log(cartOrder);
						cartOrder[0].CART_ITEMS[i].qty = req.body.qty;
						cartOrder[0].CART_ITEMS[i].itemBill = cartOrder[0].CART_ITEMS[i].qty * cartOrder[0].CART_ITEMS[i].itemPrice;

						CART.update({_id : cartOrder[0]._id},{
							$set :  {
										CART_ITEMS : cartOrder[0].CART_ITEMS
									}
						},function(err){
							if(err)
								throw err;
							CART.find({CART_MOBILE_NUM:req.body.mobileNumber},function(err,cartItems){
								console.log(cartItems);
								CART.aggregate({
												$match : {
													CART_MOBILE_NUM: req.body.mobileNumber
												}
											},

											{
												$unwind : "$CART_ITEMS"
											},
											{
												$group : {
													_id : null,
													totalBill : {$sum: "$CART_ITEMS.itemBill"},
													itemsQty : {$sum: "$CART_ITEMS.qty"}
												}
											}, function(err,summary){
												console.log(summary);
												console.log(cartItems);
												result = {returnCode:"SUCCESS",data:{cart: cartItems, totalBill: summary[0].totalBill, itemsQty: summary[0].itemsQty},errorCode:null};
												res.json(result);
											}
										);
							});
						});
						break;
					}
				}
			});
		});

		app.post('/placeOrder',function(req,res){
			User.find({USR_MOBILE_NUM:req.body.mobileNumber},function(err,user){
				var prefix = moment().format('X');
				Order.count({},function(err,count){
					var orderNum = Number(String(prefix) + String(count));
					CART.find({CART_MOBILE_NUM:req.body.mobileNumber},function(err,cart){
						var order = {ORDER_NUM:orderNum,ORDER_MOBILE_NUM:req.body.mobileNumber,ORDER_DELIVERYADDRESS:req.body.deliveryAddress,ORDER_ITEMS:[]};
						for(var i in cart)
						{
							order.ORDER_ITEMS.push({hotel: cart[i].CART_HOTEL,hoteItems:cart[i].CART_ITEMS});
						}
						var newOrder = new Order(order);
						newOrder.save(function(err){
							if(err)
								console.log(err);
							console.log(user[0].USR_EMAIL);
							var mailOptions = {
							    from: 'Home Delivery <haresh93@gmail.com>', // sender address
							    to: user[0].USR_EMAIL, // list of receivers
							    subject: 'Order Information', // Subject line
							    text: "Your Order is placed and the details of your order are Order Number:"+orderNum+" and it will be Delivered to "+req.body.deliveryAddress;
							};
							CART.remove({CART_MOBILE_NUM:req.body.mobileNumber},function(err){
					        	if(err)
					        		console.log(err);
					        	var result = {returnCode: "SUCCESS",data: null, errorCode:null}
					        	res.json(result);
							});
							// send mail with defined transport object
							transporter.sendMail(mailOptions, function(error, info){
							    if(error){
							        console.log(error);
							    }else{
							        console.log('Message sent: ' + info.response);
							    }
							});
						});

					});
				});
				
			});
			

		});


		
		


}