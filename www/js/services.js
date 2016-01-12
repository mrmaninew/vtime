angular.module('starter.services', [])
    .constant('snCred',{
    	'Client_id': 'ac0dd3408c1031006907010c2cc6ef6d',
        'Client_secret': '1yihwfk2xbl686v45s8a',
        'grant_type': ['password','access'],
     /* this url, might be changed from setting panel, so we have to set this url and to _url
        and add "oauth_token.do" as additive so wer can access tokens and same with access to 
        tables  */
        'prod_url': 'https://volteollcdemo1.service-now.com/',
        'PrjTableName':'pm_project', // Servicenow Project Table
        'TasksTableName':'pm_project_task', // Servicenow Tasks Table
        'StoriesTableName':'rm_story', // Servicenow Stories Table
        'TimecardTable':'time_card' // Servicenow Timecard Table
    })
    .factory('snService', function($http,snCred,TokenService) {
        // $http.defaults.headers.common.Authorization = "Bearer "+'';
        // $http.get("")
        //     .success(function(data) {
        //         console.log(JSON.stringify(data));
        //     })
        //     .error(function(error) {
        //         console.log(error);
        //     });

         return{
            // get 
            getProjects: function(){
                //$http.defaults.headers.common.Authorization = "Bearer"+TokenServ
                return; 
            },
            getTasks: function(){},
            getStories: function(){},
            getApprovals: function(){},
            getTimeCards: function(){},
            //set 
            setTimeCard: function(){},
            submitTimeCard: function(){},
            deleteTimeCard: function(){}
         }   
    })
    .factory('InstanceUrlService',function(){
        var url =""
        var url_oauth = url+'oauth_token.do';

    })
    .factory('UserDetailsService',function(){

    })
    .factory('TokenService', function() {
        var tokenHandler = {};
        //var token = "none";
        var token = "";

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
