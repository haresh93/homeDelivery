/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        document.addEventListener('backbutton',function(e){

            var $body = angular.element(document.body);   // 1
            var $rootScope = $body.scope().$root;
            var flag = 0;
            switch($rootScope.activeAction){
                case "hotels": $rootScope.$apply(function(){
                    $rootScope.showHotelsList = false;
                    $rootScope.activeAction = "home";
                    flag=1;
                });
                var $scope = angular.element(document.getElementsByClassName('hotelsList')).scope();
                $scope.$apply(function(){
                    $scope.showHotelsList = false;
                });
                flag=1;
                break;

                case "home" : navigator.app.exitApp();
            }
            if(flag==0)
                navigator.app.backHistory();
        },false);
        console.log(navigator.network.connection.type);
    }
};

app.initialize();

function order(htId){
    var $body = angular.element(document.body);   // 1
    var $rootScope = $body.scope().$root;         // 2
    
    $rootScope.$apply(function () {        
    console.log(htId);       // 3
        $rootScope.$broadcast('orderClicked',htId);
    });
}

var iceBirds = angular.module('IceBirds', [
    "ngRoute",
    "ngAnimate",
    "ngTouch",
    "mobile-angular-ui",
    "google.places",
    "ngCordova"
]);
iceBirds.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
]);
iceBirds.config(function($routeProvider) {
    $routeProvider
    .when('/login',{
        templateUrl: "signin.html",
        controller: "signInController"
    })
    .when('/register',{
        templateUrl: "register.html",
        controller: "registerController"
    })
    .when('/home',{
        templateUrl: "home-1.html",
        controller: "homeController"
    })
    .when('/map',{
        templateUrl: "map.html",
        controller: "mapController"
    })
    .when('/order',{
        templateUrl: "order.html",
        controller: "orderController"
    })
    .when('/aboutUs',{
        templateUrl: "aboutUs.html",
        controller: "aboutUsController"
    })
    .when('/signOut',{
        templateUrl: "",
        controller: "signOutController"
    })
    .otherwise({redirectTo:'/login'});
});

iceBirds.run(function($rootScope,$location,$http,$cordovaToast,SharedState){
    $rootScope.proceed = function(){
        if($rootScope.totalBill == 0)
        {
            $cordovaToast.showLongCenter('Your Cart is Empty.').then(function(success) {
                // success
            }, function (error) {
                // error
            });
        }
        else
        {
            SharedState.turnOn('modal3');
        }
    }
    $rootScope.orderedOpen = false;
    $rootScope.toggle = function(){
        if($rootScope.orderedOpen){
            $rootScope.orderedOpen = false;
        }
        else
        {
            $rootScope.orderedOpen = true;
        }
    }
    $rootScope.loggedIn =  window.localStorage['loggedIn'];
    $rootScope.showHotelsList = false;
    console.log($rootScope.loggedIn);
    if($rootScope.loggedIn == "true")
    {
        console.log("Entered into loggedIn");
        $rootScope.userName = window.localStorage.userName;
        $rootScope.mobileNumber = window.localStorage.mobileNumber;
        $location.path('/home');

    }
    $rootScope.cart = [];
    $rootScope.showCart = [];
    $rootScope.totalBill = 0;
    $rootScope.itemsQty = 0;

    $rootScope.updateOrder = function(foodItem,hotel){
        console.log(foodItem);
        $rootScope.cartFoodItem = foodItem;
        $rootScope.cartHotel = hotel;
        SharedState.turnOn('modal2');
    }
    $rootScope.$watch('cart',function(newValue,oldValue){
        console.log(newValue);
        $rootScope.showCart = [];
        for(var i in newValue)
        {
            var entity = {hotel:$rootScope.hotelsKey[newValue[i].CART_HOTEL], items:[]}
            for(var j in newValue[i].CART_ITEMS)
            {
                entity.items.push({item:$rootScope.foodItemsKey[newValue[i].CART_ITEMS[j].item],qty:newValue[i].CART_ITEMS[j].qty,itemBill:newValue[i].CART_ITEMS[j].itemBill});
                console.log(entity.items);
            }
            console.log(entity);
            $rootScope.showCart.push(entity);
        }
        console.log($rootScope.showCart);
    },true);

    var req = {
           method: 'GET',
            url: 'http://estater.in:12345/hotels',
            headers: {'Content-Type': 'application/json'},
            data: {mobileNumber: $rootScope.mobileNumber}
        };
        $http(req).
        success(function(data){
            if(data.returnCode == "SUCCESS")
            {
                console.log(data.data.assArray);
                $rootScope.hotelsKey = data.data.assArray;
                
            }
            else
            {

            }
        }).
        error(function(data,status,headers,config){
            $cordovaToast.showLongCenter('Unable to Connect to the server. Please try after Some Time').then(function(success) {
                // success
            }, function (error) {
                // error
            });
        });
    req = {
           method: 'GET',
            url: 'http://estater.in:12345/foodItems',
            headers: {'Content-Type': 'application/json'}
        };
        $http(req).
        success(function(data){
            console.log(data);
            $rootScope.foodItems = data.data.foodItems;
            $rootScope.foodItemsKey = data.data.assArray;

            $rootScope.$broadcast('fetchCartItems');
        }).
        error(function(data,status,headers,config){
            $cordovaToast.showLongCenter('Unable to Connect to the server. Please try after some time.').then(function(success) {
                // success
            }, function (error) {
                // error
            });
        });
    $rootScope.$on('fetchCartItems', function(){
        req = {
           method: 'POST',
            url: 'http://estater.in:12345/cartItems',
            headers: {'Content-Type': 'application/json'},
            data: {mobileNumber: $rootScope.mobileNumber}
        };
        $http(req).
        success(function(data){
            if(data.returnCode == "SUCCESS")
            {
                console.log(data.data);
                $rootScope.cart = data.data.cart;
                $rootScope.totalBill = data.data.totalBill;
                $rootScope.itemsQty = data.data.itemsQty;
            }
            else
            {

            }
        }).
        error(function(data,status,headers,config){
            $cordovaToast.showLongCenter('Unable to Connect to the server. Please try after Some Time').then(function(success) {
                // success
            }, function (error) {
                // error
            });
        });
    });


    $rootScope.$on('$routeChangeStart', function(){
        $rootScope.loading = true;
    });

    $rootScope.$on('$routeChangeSuccess', function(){
        $rootScope.loading = false;
    });
    $rootScope.$on('addToCart',function(event,item,quantity){
        
        var orderItem = {mobileNumber:$rootScope.mobileNumber, hotel:$rootScope.hotel.HT_ID, item:item.FI_ID, qty:quantity};
        var req = {
           method: 'POST',
            url: 'http://estater.in:12345/addToCart',
            headers: {'Content-Type': 'application/json'},
            data: orderItem
        };
        $rootScope.loading = true;
        $http(req).
        success(function(data){
            $rootScope.loading = false;
            if(data.returnCode == "SUCCESS")
            {
                console.log(data.data);
                $rootScope.cart = data.data.cart;
                $rootScope.totalBill = data.data.totalBill;

                $rootScope.itemsQty = data.data.itemsQty;
                $cordovaToast.showLongCenter('Item added successfully. Total Bill in the Cart is Rs.' + data.data.totalBill).then(function(success) {
                    // success
                }, function (error) {
                    // error
                });
            }
            else
            {

                $cordovaToast.showLongCenter('Error Adding to the Cart').then(function(success) {
                    // success
                }, function (error) {
                    // error
                });
            }
        }).
        error(function(data,status,headers,config){
            $cordovaToast.showLongCenter('Unable to Connect to the server. Please try after Some Time').then(function(success) {
                // success
            }, function (error) {
                // error
            });
        });

    });

    $rootScope.$on('orderClicked',function(event,args){
        console.log("asdf");
        for(var hotel in $rootScope.hotels)
        {
            console.log("checking");
            if($rootScope.hotels[hotel].HT_ID == args)
            {
                    console.log("got it");
                    $rootScope.hotel = $rootScope.hotels[hotel];
                    break;
            } 
        }
        $location.path("/order");
    });

    
    console.log(navigator.onLine);
    $rootScope.$on('userLoggedIn',function(event,mobileNumber,name){
        $rootScope.loggedIn = true;
        console.log($rootScope.loggedIn);
        console.log(name);
        $rootScope.mobileNumber = mobileNumber;
        $rootScope.userName = name;
        $rootScope.$broadcast('fetchCartItems');
        window.localStorage.loggedIn = true;
        window.localStorage.mobileNumber = mobileNumber;
        window.localStorage.userName = name;
        req = {
           method: 'POST',
            url: 'http://estater.in:12345/cartItems',
            headers: {'Content-Type': 'application/json'},
            data: {mobileNumber: $rootScope.mobileNumber}
        };
        $http(req).
        success(function(data){
            if(data.returnCode == "SUCCESS")
            {
                console.log(data.data);
                $rootScope.cart = data.data.cart;
                $rootScope.totalBill = data.data.totalBill;

                $rootScope.itemsQty = data.data.itemsQty;
            }
            else
            {

            }
        }).
        error(function(data,status,headers,config){
            $cordovaToast.showLongCenter('Unable to Connect to the server. Please try after Some Time').then(function(success) {
                // success
            }, function (error) {
                // error
            });
        });

    });
    $rootScope.$on('userLoggedOut',function(){
        console.log("userLoggedOut");
        $rootScope.loggedIn = false;
        window.localStorage.loggedIn = false;
        window.localStorage.mobileNumber = undefined;
        window.localStorage.userName = undefined;
    });
});

iceBirds.controller("bottomNavBarController", function($rootScope,$scope){
    if($rootScope.loggedIn == "true")
        $scope.loggedIn = true;
    else
        $scope.loggedIn = false;
    $rootScope.$on('userLoggedIn',function(){
        $scope.loggedIn = true;
    });
    $rootScope.$on('userLoggedOut',function(){
        $scope.loggedIn = false;
    });

});



iceBirds.controller("signInController",function($rootScope,$scope,$http,$location,$cordovaToast){
    $rootScope.title = "Home Delivery";
    $scope.user = {
        mobileNumber: "",
        password: ""
    }


    $scope.signin = function(){
        $rootScope.title = "Home Delivery";
        var send_data = {mobileNumber: $scope.user.mobileNumber,password: $scope.user.password};
        var req = {
           method: 'POST',
            url: 'http://estater.in:12345/login',
            headers: {'Content-Type': 'application/json'},
            data: send_data
        };
        console.log("Firing the request");
        $rootScope.loading = true;
        $http(req).
        success(function(data){
            console.log(data);
            $rootScope.loading = false;
            if(data.returnCode == "SUCCESS")
            {
                console.log("SUCCESS");
                $rootScope.$broadcast('userLoggedIn',send_data.mobileNumber,data.data.USR_NAME);
                $location.path("/home");
            }
            else
            {
                if(data.returnCode == "FAILURE")
                {
                    console.log("Failure");
                    if(data.errorCode == 1010)
                    {
                        $cordovaToast.showLongCenter('Please check the Mobile Number and the password').then(function(success) {
                            // success
                        }, function (error) {
                            // error
                        });
                    }
                    else
                    {
                        if(data.errorCode == 1011)
                        {
                            $cordovaToast.showLongCenter('Please check the password').then(function(success) {
                                // success
                            }, function (error) {
                                // error
                            });
                        }
                    }
                }
            }
        }).
        error(function(data,status,headers,config){
            $cordovaToast.showLongCenter('Unable to Connect to the server. Please check your data Connection.').then(function(success) {
                // success
            }, function (error) {
                // error
            });
        });
    }
});

iceBirds.controller("registerController",function($rootScope,$scope,$http,$location,$cordovaToast){

    $rootScope.title = "Home Controller";
    $scope.user = {mobileNumber:"",email:"", password : "", userName: ""};
    $scope.register = function(){
        var send_data = {mobileNumber: $scope.user.mobileNumber, email: $scope.user.email, password: $scope.user.password, userName: $scope.user.userName}
        console.log("Entered into register");
        for(var key in send_data)
        {
            console.log(key + " " + send_data[key]);
            if(send_data[key] == "")
            {
                $cordovaToast.showLongCenter('Please complete all of the above fields').then(function(success) {
                    // success
                }, function (error) {
                    // error
                });
                return;
            }
        }

        if(send_data['password'] != $scope.user.confirmPassword)
        {
            $cordovaToast.showLongCenter('Password and Confirm Passord fields are not Matching').then(function(success) {
                // success
            }, function (error) {
                // error
            });
            return;
        }

        console.log(send_data);
        var req = {
           method: 'POST',
            url: 'http://estater.in:12345/register',
            headers: {'Content-Type': 'application/json'},
            data: send_data
        };
        console.log("Firing the request");
        $rootScope.loading = true;
        $http(req).
        success(function(data){
            console.log(data);
            $rootScope.loading = false;
            if(data.returnCode == "SUCCESS")
            {
                $rootScope.loggedUser = send_data.mobileNumber;
                console.log("SUCCESS");
                $cordovaToast.showLongCenter('You have been Successfully registered').then(function(success) {
                    // success
                }, function (error) {
                    // error
                });
                $location.path("/login");
            }
            else
            {
                if(data.returnCode == "FAILURE")
                {
                    if(data.errorCode == 1012)
                    {
                        $cordovaToast.showLongBottom('You are already a registered User').then(function(success) {
                            // success
                        }, function (error) {
                            // error
                        });
                    }
                }
            }
        }).
        error(function(data,status,headers,config){
            $cordovaToast.showLongCenter('Unable to Connect to the server. Please check your data connection').then(function(success) {
                // success
            }, function (error) {
                // error
            });
        });
    }
});

iceBirds.controller("mapController",function($rootScope,$scope,$location,$http,$cordovaToast){

    $rootScope.title = "Home Delivery";
    var mapCenter = ($rootScope.mapVisited != undefined)?$rootScope.center: new google.maps.LatLng(17.7221, 83.2897);
    $rootScope.center = mapCenter;
    var mapOptions = {
        zoom: 15,
        center:mapCenter,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
         disableDefaultUI: true
        }
    
    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
    
    console.log("hi");
    console.log($rootScope.hotels);
    if($rootScope.mapVisited == undefined){
        var req = {
           method: 'GET',
            url: 'http://estater.in:12345/hotels',
            headers: {'Content-Type': 'application/json'}
        };
        $rootScope.loading = true;
        $http(req).
        success(function(data){
            console.log(data);
            $rootScope.loading = false;
            if(data.returnCode == "SUCCESS")
            {
                console.log("SUCCESS");
                console.log(data.data);
                $rootScope.hotelsKey = data.data.assArray;
                $rootScope.hotels = data.data.hotels;
                $rootScope.mapVisited = true;
                var markers = data.data;
                console.log($scope.map);
                for(var i in markers)
                {
                    var latlng = new google.maps.LatLng(markers[i].HT_LOCATION.Latitute,markers[i].HT_LOCATION.Longitude);
                    
                    var contentString = '<div id="content">'+
                      '<h5 id="firstHeading" class="firstHeading" style="display:inline-block">'+markers[i].HT_NAME+'</h5>'+
                      '<div id="bodyContent" style="display:inline-block;float:right">'+
                      '<a id="'+markers[i].HT_ID+'" onclick="order(this.id)"><b>ORDER</b></a>'+  
                      '</div>'+
                      '</div>';

                    var markerInfowindow = new google.maps.InfoWindow({
                        content: contentString
                    });

                    var mapMarker = new google.maps.Marker({
                        position: latlng,
                        map:$scope.map,
                        title:markers[i].HT_NAME,
                        icon:"img/restaurant.png",
                        infowindow: markerInfowindow
                    });
                    google.maps.event.addListener(mapMarker, 'click', function() {
                        this.infowindow.open($scope.map, this);
                    });


                }
            }
        }).
        error(function(data,status,headers,config){
            $cordovaToast.showLongCenter('Error retrieving the hotels list. Please try after some time.').then(function(success) {
                // success
            }, function (error) {
                // error
            });
        });
    }
    else
    {
        var markers = $rootScope.hotels;
        console.log(markers);
        for(var i in markers)
        {
            console.log(markers[i].HT_LOCATION.Latitute + "," + markers[i].HT_LOCATION.Longitude);
            var latlng = new google.maps.LatLng(markers[i].HT_LOCATION.Latitute,markers[i].HT_LOCATION.Longitude);
                    
                    var contentString = '<div id="content">'+
                      '<h5 id="firstHeading" class="firstHeading" style="display:inline-block">'+markers[i].HT_NAME+'</h5>'+
                      '<div id="bodyContent" style="display:inline-block;float:right">'+
                      '<a id="'+markers[i].HT_ID+'" onclick="order(this.id)"><b>ORDER</b></a>'+  
                      '</div>'+
                      '</div>';

                    var markerInfowindow = new google.maps.InfoWindow({
                        content: contentString
                    });

                    var mapMarker = new google.maps.Marker({
                        position: latlng,
                        map:$scope.map,
                        title:markers[i].HT_NAME,
                        icon:"img/restaurant.png",
                        infowindow: markerInfowindow
                    });
                    google.maps.event.addListener(mapMarker, 'click', function() {
                        this.infowindow.open($scope.map, this);
                    });
        }
    }
        $scope.centerMap = function() {
        var geocoder = new google.maps.Geocoder();
        console.log($scope.area);
        geocoder.geocode( { 'address': $scope.area.formatted_address}, function(results, status) {
          console.log(results[0]);
          if (status == google.maps.GeocoderStatus.OK)
          {
            $scope.map.setCenter(results[0].geometry.location);
              $rootScope.center = results[0].geometry.location;// do something with the geocoded result
              //
              // results[0].geometry.location.latitude
              // results[0].geometry.location.longitude
          }
          else
          {
            $cordovaToast.showLongCenter('No results found.').then(function(success) {
                    // success
                }, function (error) {
                    // error
                });
          }
        });
    }
});

iceBirds.controller("sideBarController",function($scope,$rootScope,$location){
    console.log($rootScope.loggedIn);
    $scope.userName = $rootScope.userName;
    if($rootScope.loggedIn == "true")
        $scope.loggedIn = true;
    else
        $scope.loggedIn = false;
    console.log($scope.loggedIn);
    $rootScope.$on('userLoggedIn',function(){
        $scope.loggedIn = true;
    });
    $rootScope.$on('userLoggedOut',function(){
        $scope.loggedIn = false;
    });

    $scope.clicked = function(key){
        switch(key)
        {
            case 1:
            break;
            case 2:
            break;
            case 3:
            break;
            case 4: $rootScope.$broadcast('userLoggedOut');
                $location.path("/login");
                break;
        }
    }
});

iceBirds.controller("homeController", function($rootScope,$scope,$location,$http,$cordovaToast){
    $rootScope.activeAction = "home";
    $rootScope.hotel = {HT_ID:102, HT_NAME:"IceBirds"};
    $rootScope.title = "Home Delivery";
    $scope.showHotelsList = false;
    if($rootScope.homeVisited == undefined)
    {
        $rootScope.loading = true;
        var req = {
           method: 'GET',
            url: 'http://estater.in:12345/hotelCategories',
            headers: {'Content-Type': 'application/json'}
        };
        $http(req).
        success(function(data){
            $rootScope.loading = false;
            console.log(data);
            if(data.returnCode == "SUCCESS")
            {
                console.log("SUCCESS");
                console.log(data.data);

                $scope.hotelCats = data.data;
                for(var i in $scope.hotelCats)
                {
                    $scope.hotelCats[i].open = false;
                }
                $rootScope.hotelCats = data.data;
                $rootScope.homeVisited = true;
            }
            else
            {

            }

        }).
        error(function(){
            $rootScope.loading = false;
            $cordovaToast.showLongCenter('Unable to Connect to the server. Please Check your data Connection').then(function(success) {
                // success
            }, function (error) {
                // error
            });
        })
    }
    else
    {
        for(var i in $scope.hotelCats)
        {
            $scope.hotelCats[i].open = false;
        }
        $scope.hotelCats = $rootScope.hotelCats;
    }
    $scope.hotelClicked = function(hotel){
        $rootScope.hotel = hotel;
        $location.path('/order');
    }
    $scope.set_background = function(category){
        var str = category.GRP_NAME.replace(/\s+/g, '');
        str = str.toLowerCase();
        console.log("Inside set_background-"+str);
        
        return {background: "url('http://estater.in:12345/images/"+str+".jpg')","background-size":"100% 100%"};
    }

    $scope.showHotels = function(category){
        $scope.activeCategory = category;
        $scope.showHotelsList = true;
        $rootScope.showHotelsList = true;
        $rootScope.activeAction = "hotels";
    }

    $scope.toggle = function(category){
        
        var index = $scope.hotelCats.indexOf(category);
        
        for(var i in $scope.hotelCats)
        {
            if(i != index)
            {
                $scope.hotelCats[i].open = false;
            }
        }
        if($scope.hotelCats[index].open)
            $scope.hotelCats[index].open = false;
        else
            $scope.hotelCats[index].open = true;

    }
});

iceBirds.controller("orderController", function($rootScope,$scope,$location,$http, SharedState,$cordovaToast){

    $scope.hotel  = $rootScope.hotel;
    
    $rootScope.title = $rootScope.hotel.HT_NAME;
    if($rootScope.orderVisited == undefined)
    {
        var req = {
           method: 'GET',
            url: 'http://estater.in:12345/foodCategories',
            headers: {'Content-Type': 'application/json'}
        };
        $rootScope.loading = true;
        $http(req).
        success(function(data){
            $rootScope.loading = false;
            console.log(data);
            for(var i in $scope.foodCats)
            {
                $scope.foodCats[i].open = false;
            }
            $scope.foodCats = data.data;
        }).
        error(function(data,status,headers,config){
            $rootScope.loading = false;
            $cordovaToast.showLongCenter('Unable to Connect to the server. Please try after some time.').then(function(success) {
                // success
            }, function (error) {
                // error
            });
        });

        

    }

    $scope.toggle = function(category){
        
        var index = $scope.foodCats.indexOf(category);
        
        for(var i in $scope.foodCats)
        {
            if(i != index)
            {
                $scope.foodCats[i].open = false;
            }
        }
        if($scope.foodCats[index].open)
            $scope.foodCats[index].open = false;
        else
            $scope.foodCats[index].open = true;

    }

    $scope.order = function(item){
        SharedState.turnOn('modal1');
        $rootScope.itemClicked = item;
    }

});


iceBirds.controller("aboutUsController", function($rootScope,$scope){

});

iceBirds.controller("modal1Controller", function($rootScope,$scope,SharedState){
    $scope.item = $rootScope.itemClicked;

    $scope.inc = function(){
        $scope.quantity++;
    }

    $scope.dec = function(){
        $scope.quantity--;
        if($scope.quantity<0)
        {
            $scope.quantity = 0;
        }
    }

    $scope.clicked = function(){
        $rootScope.$broadcast('addToCart',$scope.item,$scope.quantity);
        SharedState.turnOff('modal1');
    }
});

iceBirds.controller("modal2Controller", function($rootScope,$timeout,$scope,$http,SharedState){
    $scope.close = function(){
        $timeout(function(){
            SharedState.turnOn('uiSidebarRight');
            SharedState.turnOff('modal2');
        },5);
    }


    $scope.inc = function(){
        $rootScope.cartFoodItem.qty++;
    }

    $scope.dec = function(){
        $rootScope.cartFoodItem.qty--;
        if($rootScope.cartFoodItem.qty<0)
        {
            $rootScope.cartFoodItem.qty = 0;
        }
    }

    $scope.remove = function(){
        var removeFromCart = {mobileNumber:$rootScope.mobileNumber,hotel:$rootScope.cartHotel.HT_ID,foodItem:$rootScope.cartFoodItem.item.FI_ID};
        console.log(removeFromCart);
        var req = {
           method: 'POST',
            url: 'http://estater.in:12345/removeFromCart',
            headers: {'Content-Type': 'application/json'},
            data: removeFromCart
        };
        $rootScope.loading = true;
        $http(req).
        success(function(data){
            $rootScope.loading = false;
            if(data.returnCode == "SUCCESS")
            {
                console.log(data.data);
                $rootScope.cart = data.data.cart;
                $rootScope.totalBill = data.data.totalBill;

                $rootScope.itemsQty = data.data.itemsQty;

                $timeout(function(){
                    SharedState.turnOn('uiSidebarRight');
                    SharedState.turnOff('modal2');
                },5);
                $cordovaToast.showLongCenter('Item remove successfully from Cart. Total Bill in the Cart is Rs.' + data.data.totalBill).then(function(success) {
                    // success
                }, function (error) {
                    // error
                });
            }
            else
            {

                $cordovaToast.showLongCenter('Error Removing from Cart').then(function(success) {
                    // success
                }, function (error) {
                    // error
                });
            }
        }).
        error(function(data,status,headers,config){
            $cordovaToast.showLongCenter('Unable to Connect to the server. Please try after Some Time').then(function(success) {
                // success
            }, function (error) {
                // error
            });
        });

    }

    $scope.update = function(){
        var updateCart = {mobileNumber:$rootScope.mobileNumber,hotel:$rootScope.cartHotel.HT_ID,foodItem:$rootScope.cartFoodItem.item.FI_ID,qty:$rootScope.cartFoodItem.qty};
        console.log(updateCart);
        var req = {
           method: 'POST',
            url: 'http://estater.in:12345/cartUpdate',
            headers: {'Content-Type': 'application/json'},
            data: updateCart
        };
        $rootScope.loading = true;
        $http(req).
        success(function(data){
            $rootScope.loading = false;
            if(data.returnCode == "SUCCESS")
            {
                console.log(data.data);
                $rootScope.cart = data.data.cart;
                $rootScope.totalBill = data.data.totalBill;
                
                $rootScope.itemsQty = data.data.itemsQty;

                $timeout(function(){
                    SharedState.turnOn('uiSidebarRight');
                    SharedState.turnOff('modal2');
                },5);
                $cordovaToast.showLongCenter('Item updated successfully in the Cart. Total Bill in the Cart is Rs.' + data.data.totalBill).then(function(success) {
                    // success
                }, function (error) {
                    // error
                });   
            }
            else
            {
                $cordovaToast.showLongCenter('Error Updating the Cart').then(function(success) {
                    // success
                }, function (error) {
                    // error
                });   
            }
        }).
        error(function(data,status,headers,config){
            $cordovaToast.showLongCenter('Unable to Connect to the server. Please try after Some Time').then(function(success) {
                // success
            }, function (error) {
                // error
            });
        });

    };


});

iceBirds.controller("checkoutController", function($rootScope,$timeout,$cordovaToast,$scope,$http,SharedState){
    $scope.confirmed = function(){
        if($scope.deliveryAddress == "")
        {
            $cordovaToast.showLongCenter('Please enter your delivery address.').then(function(success) {
                // success
            }, function (error) {
                // error
            });
            return;
        }
        console.log("Clicked on confirmed");
        var placeOrder = {mobileNumber: $rootScope.mobileNumber,deliveryAddress:$scope.deliveryAddress};
        var req = {
           method: 'POST',
            url: 'http://estater.in:12345/placeOrder',
            headers: {'Content-Type': 'application/json'},
            data: placeOrder
        };
        $rootScope.loading = true;
        $http(req).
        success(function(data){
            $rootScope.loading = false;
            if(data.returnCode == "SUCCESS")
            {
                $rootScope.cart = [];
                $rootScope.totalBill = 0;
                $rootScope.itemsQty = 0;
                SharedState.turnOff('modal3');
                 $cordovaToast.showLongCenter('Your Order has been successfully placed.').then(function(success) {
                    // success
                }, function (error) {
                    // error
                });
            }
        }).
        error(function(data,status,headers,config){
            $cordovaToast.showLongCenter('Unable to Connect to the server. Please try after Some Time').then(function(success) {
                // success
            }, function (error) {
                // error
            });
        });

    }
});

