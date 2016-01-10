angular.module('starter.services', [])
    .constant('snCred',{
    	'Client_id': 'ac0dd3408c1031006907010c2cc6ef6d',
        'Client_secret': '1yihwfk2xbl686v45s8a',
        'grant_type': ['password','access'],
     /* this url, might be changed from setting panel, so we have to set this url and to _url
        and add "oauth_token.do" as additive so wer can access tokens and same with access to 
        tables  */
        'prod_url': 'https://volteollcdemo1.service-now.com/oauth_token.do',
        'username':''
    })
    .factory('MainService', function() {

    })
    .factory('InstanceUrl',function(){
        var url_oauth = ""+'oauth_token.do';

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
    .factory('LoginService',function($http,$timeout,snCred){
        var tokenUrl = "";
    })
    // localstorage lib from Ionic framework
    .factory('LocalStorage',function(){

    });
