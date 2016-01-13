angular.module('starter.services', [])
    .constant('snCred', {
        'Client_id': 'ac0dd3408c1031006907010c2cc6ef6d',
        'Client_secret': '1yihwfk2xbl686v45s8a',
        'grant_type': ['password', 'access'],
        /* this url, might be changed from setting panel, so we have to set this url and to _url
           and add "oauth_token.do" as additive so wer can access tokens and same with access to 
           tables  */
        'PRODURL': 'https://volteollcdemo1.service-now.com/', // Servicenow Instance URL
        'DevURL':'',
        'PrjTableName': 'pm_project', // Servicenow Project Table
        'TasksTableName': 'pm_project_task', // Servicenow Tasks Table
        'StoriesTableName': 'rm_story', // Servicenow Stories Table
        'TimecardTable': 'time_card' // Servicenow Timecard Table
    })
    .factory('TokenService', function() {

        //var token = "none";
        var _token = "bdGLANn3v5BOc5eksG3ZSH2G6bYJt2zlQgbpk-LFQKb5JhH48MKUM3UN2CqoMxPlSYdeBP8TPSln-cpfRp2WPg";

        return {
            getToken: function() {
                return _token;
            },
            setToken: function(token) {
                _token = token;
            }
        }
    })
    .factory('snService', function($http, $q, snCred, TokenService) {

        return {
            //get functions
            getProjects: function() {
                var url = snCred.PRODURL+'api/now/table/' + snCred.PrjTableName;
                var token = "Bearer " + TokenService.getToken();
                var defer = $q.defer()
                    //$http.defaults.headers.common.Authorization = "Bearer" + TokenService.getToken();
                $http({
                        method: 'GET',
                        url: url,
                        headers: {
                            'Authorization': token
                        }
                    })
                    .success(function(data) {
                        defer.resolve(data.result);
                    })
                    .error(function(error) {
                        defer.reject(error);
                    })
                return defer.promise;
            },
            getTasks: function() {
                var url = snCred.DevURL+'api/now/table' + snCred.TasksTableName;
                var token = "Bearer " + TokenService.getToken();
                var defer = $q.defer();
                $http({
                        method: 'GET',
                        url: url,
                        headers: {
                            'Authorization': token
                        }
                    })
                    .success(function(data) {
                        defer.resolve(data.result);
                    })
                    .error(function(error) {
                        defer.reject(error);
                    })
                return defer.promise;
            },
            getStories: function() {
                var url = snCred.DevURL+'api/now/table' + snCred.StoriesTableName;
                var token = "Bearer " + TokenService.getToken();
                var defer = $q.defer();
                $http({
                        method: 'GET',
                        url: url,
                        headers: {
                            'Authorization': token
                        }
                    })
                    .success(function(data) {
                        defer.resolve(data.result);
                    })
                    .error(function(error) {
                        defer.reject(error);
                    })
                return defer.promise;
            },
            getApprovals: function() {},
            getTimeCards: function() {},
            getPendingTimeCardForCurrentDate: function() {
                var url = snCred.DevURL+'api/now/table' + snCred.TimecardTable;
                var token = "Bearer " + TokenService.getToken();
                var defer = $q.defer;
                $http({
                        method: 'GET',
                        url: url,
                        headers: {
                            'Authorization': token
                        }
                    })
                    .success(function(data) {
                        console.log(data.result);
                        defer.resolve(data.result);
                    })
                    .error(function(error) {
                        defer.reject(error);
                    })
                return defer.promise;
            },
            //set functions 
            setTimeCard: function() {

            },
            submitTimeCard: function() {},
            deleteTimeCard: function() {}
        }
    })
    .factory('UserDetailsService', function() {
        var user = {
            'username': '',
            'email': '',
            'sys_id': ''
        };
    })
    .factory('LoginService', function($http, $timeout, snCred) {
        var tokenUrl = "";
    });
    // localstorage lib from Ionic framework
    // .factory('DBService', function($q, Loki, snService) {
    //     var _db;

    //     function initDB() {
    //         var adapter = new LokiCordovaFSAdapter({
    //             "prefix": "loki"
    //         });
    //         _db = new Loki('snDB', {
    //             autosave: true,
    //             autosaveInterval: 1000, // 1 second
    //             adapter: adapter
    //         });
    //     };

    //     function getProjectsFromDB() {
    //         return $q(function(resolve, reject) {
    //             var options = {
    //                 projects: {
    //                     proto: Object,
    //                     inflate: function(src, dst) {
    //                         var prop;
    //                         for (prop in src) {
    //                             if (prop === 'Date') {
    //                                 dst.Date = new Date(src.Date);
    //                             } else {
    //                                 dst[prop] = src[prop];
    //                             }
    //                         }
    //                     }
    //                 }
    //             };
    //             _db.loadDatabase(options, function() {
    //                 _projects = _db.getCollection('projects');
    //                 if (!_projects) {
    //                     _projects = _db.addCollection('projects');
    //                     snService.getProjects()
    //                         .then(function(result) {
    //                             console.log('in db projects call');
    //                             _projects.insert(result);
    //                         }, function(error) {
    //                             console.log(error)
    //                         });
    //                 }
    //                 resolve(_projects.data);
    //             });
    //         });
    //     };
    //     return {
    //         initDB: initDB,
    //         getProjectsFromDB: getProjectsFromDB
    //     }

    // });
