(function() {
    'use strict';

  var app = angular.module('app', [], function config($httpProvider) {
      console.log('intercepted');
    $httpProvider.interceptors.push('AuthInterceptor');
  });


  app.constant('API_URL', 'http://localhost:3000');

    app.controller('MainCtrl', function MainCtrl(RandomUserFactory, UserFactory, AuthTokenFactory) {
        'use strict';
        var vm = this;
        vm.getRandomUser = getRandomUser;
        vm.login = login;
        vm.logout = logout;

            //initialization
        UserFactory.getUser().then(function success(response){
           vm.user= response.data; 
        });

        function getRandomUser() {

            RandomUserFactory.getUser().then(function success(response) {
                    vm.randomUser = response.data;
            }, handleError);

        }
        
        function login(username, password){
            UserFactory.login(username, password).then(function success(response){
                vm.user = response.data.user;
//                alert(response.data.token);
            }, handleError);
        }
        
        function logout(){
         AuthTokenFactory.setToken(); 
            vm.user = null;
        }
        
        function handleError(response){
            alert('error' + response.data);
        }
        
    })
    
    app.factory('RandomUserFactory', function RandomUserFactory($http, API_URL){
       return{
           getUser : getUser
       }; 
       function getUser (){
           return $http.get(API_URL + '/randomuser' );
       };
    })
    
    app.factory('UserFactory', function UserFactory($http, API_URL,AuthTokenFactory, $q){
        return{
            login:login,
            getUser:getUser
        }
        function login(username, password){
            return $http.post(API_URL + '/login', {username: username, password:password}).then(function success(response){
                AuthTokenFactory.setToken(response.data.token);
                return response;
            })
        };
        function getUser(){
            if(AuthTokenFactory.getToken()){
                return $http.get(API_URL + '/me');
            }else {
                return $q.reject({data: 'client has no token'});
            }
        }
    })

    app.factory('AuthTokenFactory', function AuthTokenFactory($window){
        var store = $window.localStorage;
        var key = 'Auth-Token'
        return{
            getToken:getToken,
            setToken:setToken
        }
        function getToken(){
            return store.getItem(key);
        }
        function setToken(token){
            if(token){
                store.setItem(key, token);
            } else {
                store.removeItem(key);
            }
            
        }
        
    })
    
  app.factory('AuthInterceptor', function AuthInterceptor(AuthTokenFactory) {
    'use strict';
    return {
      request: addToken
    };

    function addToken(config) {
        console.log('adding token');
      var token = AuthTokenFactory.getToken();
      if (token) {
          console.log('added token');
        config.headers = config.headers || {};
        config.headers.Authorization = 'Bearer ' + token;
      }
      return config;
    }
  });


}());