angular.module('starter.services', [])
    .constant('snCred', {
        'Client_id': 'ac0dd3408c1031006907010c2cc6ef6d',
        'Client_secret': '1yihwfk2xbl686v45s8a',
        'grant_type': ['password', 'access'],
        /* this url, might be changed from setting panel, so we have to set this url and to _url
           and add "oauth_token.do" as additive so wer can access tokens and same with access to 
           tables  */
        'url': 'https://volteollcdemo1.service-now.com/',
        'PrjTableName': 'pm_project', // Servicenow Project Table
        'TasksTableName': 'pm_project_task', // Servicenow Tasks Table
        'StoriesTableName': 'rm_story', // Servicenow Stories Table
        'TimecardTable': 'time_card' // Servicenow Timecard Table
    })
    .factory('snService', function($http, snCred, TokenService) {


        return {
            //get functions
            getProjects: function() {
                var url = 'api/now/table/' + snCred.PrjTableName;
                //$http.defaults.headers.common.Authorization = "Bearer" + TokenService.getToken();
                $http({
                        method: 'GET',
                        url: url,
                        headers: {
                            'Authorization': "Bearer 2eL-_vlOZwLWBUA1OV18BdoAZgwxu-4DPYq7xQhjQYlX4TDDOhRsBiY0DN6_2So572Dad6IBPSRxvadSKhTNqQ"
                        }
                    })
                    .success(function(data) {
                        console.table(JSON.stringify(data));
                        return JSON.stringify(data);
                    })
                    .error(function(error) {
                        console.log(error);
                    })
            },
            getTasks: function() {},
            getStories: function() {},
            getApprovals: function() {},
            getTimeCards: function() {},
            //set functions 
            setTimeCard: function() {},
            submitTimeCard: function() {},
            deleteTimeCard: function() {}
        }
    })
    .factory('InstanceUrlService', function() {
        var url = ""
        var url_oauth = url + 'oauth_token.do';

    })
    .factory('UserDetailsService', function() {

    })
    .factory('TokenService', function() {

        //var token = "none";
        var _token = "2eL-_vlOZwLWBUA1OV18BdoAZgwxu-4DPYq7xQhjQYlX4TDDOhRsBiY0DN6_2So572Dad6IBPSRxvadSKhTNqQ";

        return {
            getToken: function() {
                return _token;
            },
            setToken: function(token) {
                _token = token
            }
        }
        //return tokenHandler;
    })
    .factory('LoginService', function($http, $timeout, snCred) {
        var tokenUrl = "";
    })
    // localstorage lib from Ionic framework
    .factory('LocalStorage', function() {

    });
