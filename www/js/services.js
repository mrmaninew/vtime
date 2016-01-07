angular.module('starter.services', [])
    .constant('snCred',{
    	'Client_id': 'ac0dd3408c1031006907010c2cc6ef6d',
        'Client_secret': '1yihwfk2xbl686v45s8a',
        'grant_type': ['password','access'],
        'prod_url': 'https://volteollcdemo1.service-now.com/oauth_token.do'
    })
    .factory('MainService', function() {

    })
    .factory('TokenService', function() {
        var tokenHandler = {};
        var token = "none";

        tokenHandler.set = function(newToken) {
            token = newToken;
        };
        tokenHandler.get = function() {
            return token;
        };

        return tokenHandler;
    })
    .factory('LoginService',function($http,$timout){

    })
    .factory('LocalStorage',function(){

    })
