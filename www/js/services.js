angular.module('starter.services', [])
    // Required global variables
    .constant('snCred', {
        'Client_id': 'ac0dd3408c1031006907010c2cc6ef6d',
        'Client_secret': '1yihwfk2xbl686v45s8a',
        'grant_type': ['password', 'access'],
        //'PRODURL': 'https://volteollcdemo1.service-now.com/', // Servicenow Instance URL
        'PRODURL': '', // Temp empty URL for development environment and this will changed when deploying PROD
        'PrjTableName': 'pm_project', // Servicenow Project Table
        'TasksTableName': 'pm_project_task', // Servicenow Tasks Table
        'StoriesTableName': 'rm_story', // Servicenow Stories Table
        'TimecardTable': 'time_card', // Servicenow Timecard Table
        'ApprovalsTable': 'demo' // Servicenow Approvals Table
    })
    // Token Service (Access, Password)
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
    // Servicenow Service
    .factory('snService', function($http, $q, snCred, TokenService, UserService) {

        return {
            //get functions
            getProjects: function() {
                var url = snCred.PRODURL + 'api/now/table/' + snCred.PrjTableName;
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
                // get all tasks assigned_to = user (and) state = open or pending or work in progress
                var query = "?sysparm_limit=10&sysparm_query=state=2^ORstate=1^ORstate=-5^assigned_to=" + UserService.getUser().sys_id;
                var url = snCred.PRODURL + 'api/now/table/' + snCred.TasksTableName;
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
                var query = "?sysparm_limit=10&sysparm_query=state!=3^ORstate!=4^ORstate!=20^assigned_to=" + UserService.getUser().sys_id;
                var url = snCred.PRODURL + 'api/now/table/' + snCred.StoriesTableName + query;
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
            getTimecards: function() {
                var query = "?sysparm_limit=10&sysparm_query=user=" + UserService.getUser().sys_id;
                var url = snCred.PRODURL + '/api/now/table/' + snCred.TimecardTable + query;
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
            //set (insert, update) functions 
            insertTimecard: function(timecard) {
                var url = snCred.PRODURL + '/api/now/table/' + snCred.TimecardTable;
                var token = "Bearer " + TokenService.getToken();
                var defer = $q.defer();
                $http({
                        method: 'POST',
                        url: url,
                        headers: {
                            'Authorization': token
                        },
                        data: JSON.stringify(timecard)
                    })
                    .success(function(data) {
                        defer.resolve(data);
                    })
                    .error(function(error) {
                        defer.reject(error);
                    })
                return defer.promise;
            },
            updateTimecard: function(sys_id, timecard) {
                var url = snCred.PRODURL + '/api/now/table/' + snCred.TimecardTable + '/' + sys_id;
                var token = "Bearer " + TokenService.getToken();
                var defer = $q.defer();
                $http({
                        method: 'PUT',
                        url: url,
                        headers: {
                            'Authorization': token
                        },
                        data: JSON.stringify(timecard)
                    })
                    .success(function(data) {
                        defer.resolve(data.result);
                    })
                    .error(function(error) {
                        defer.reject(error);
                    })
                return defer.promise;
            },
            // only edit state value and use sys_id as param 
            submitTimecard: function(sys_id) {
                var url = snCred.PRODURL + '/api/now/table/' + snCred.TimecardTable + '/' + sys_id;
                var token = "Bearer " + TokenService.getToken();
                var defer = $q.defer();
                var data = {
                    'state': 'Submitted'
                }
                $http({
                        method: 'PATCH',
                        url: url,
                        headers: {
                            'Authorization': token
                        },
                        data: JSON.stringify(data)
                    })
                    .success(function(data) {
                        defer.resolve(data.result);
                    })
                    .error(function(error) {
                        defer.reject(error);
                    })
                return defer.promise;
            },
            //delete functions 
            deleteTimecard: function() {}
        }
    })
    // User Service (session, storage)
    .factory('UserService', function() {
        var user = {
            'user_id': 'mani',
            'email': 'mani.gk@volteo.com',
            'sys_id': '2133326f0faa860077b6ab78b1050e5a'
        };

        function setUser(user) {
            user.user_id = "";
            user.email = "";
            user.sys_id = ""
        };

        function getUser() {
            return user;
        };
        return {
            setUser: setUser,
            getUser: getUser
        };
    })
    // Login Service
    .factory('LoginService', function($http, $timeout, snCred) {
        var tokenUrl = "";
    })
    // Local Storage Service
    .factory('LocalStorageService', function() {
        // Projects 
        function setProjectsLocal(result) {
            localStorage.setItem('projects', JSON.stringify(result));
        };

        function getProjectsLocal() {
            return JSON.parse(localStorage.getItem('projects'));
        };

        function getProjectNumberBySysID(id) {
            var projectName = "";
            var projects = getProjectsLocal();
            for (var i = 0; i < projects.length; i++) {
                if (projects[i].sys_id == id) {
                    projectName = projects[i].number;
                }
            }
            return projectName;
        };

        function getProjectsLengthLocal() {
            return getTimecardsLocal().length;
        }
        // Tasks
        function setTasksLocal(result) {
            localStorage.setItem('tasks', JSON.stringify(result));
        };

        function getTasksLocal() {
            return JSON.parse(localStorage.getItem('tasks'));
        };

        function getTaskNumberBySysID(id) {
            var taskNumber = "";
            var tasks = getTasksLocal();
            for (var i = 0; i < tasks.length; i++) {
                if (tasks[i].sys_id === id) {
                    taskNumber = tasks[i].number;
                }
            }
            return taskNumber;
        };

        function getTasksLengthLocal() {
            return getTasksLocal().length;
        };
        // Stories 
        function setStoriesLocal(result) {
            localStorage.setItem('stories', JSON.stringify(result));
        };

        function getStoriesLocal() {
            return JSON.parse(localStorage.getItem('stories'));
        };

        function getStoryNumberBySysID(id) {
            var _storyNumber = "";
            var _stories = getStoriesLocal();
            for (var i = 0; i < _stories.length; i++) {
                if (_stories[i].sys_id === id) {
                    _storyNumber = _stories[i].number;
                }
            }
        };

        function getStoriesLengthLocal() {
            return getStoriesLocal().length;
        }

        // Timecards
        function setTimecardsLocal(result) {
            localStorage.setItem('timecards', JSON.stringify(result));
        };

        function setTimecardLocalByID(sys_id, timecard) {
            var timecards = localStorage.getItem('timecards');
            for (var i = 0; i < timecards.length; i++) {
                if (timecards[i].sys_id === sys_id) {
                    timecards[i] = result;
                }
            }
            localStorage.setItem('timecards', timecards);
        };

        function getTimecardsLocal() {
            return JSON.parse(localStorage.getItem('timecards'));
        };

        function getTimecardsByDateLocal(seldate) {
            var timecards = JSON.parse(localStorage.getItem('timecards'));
            var selTimecards = []
            for (var i = 0; i < timecards.length; i++) {
                if (seldate == timecards[i].week_starts_on) {
                    selTimecards.push(timecards[i]);
                }
            }
            return selTimecards;
        };

        function getTimecardByID(id) {
            var timecards = JSON.parse(localStorage.getItem('timecards'));
            var selTimecard = {};
            for (var i = 0; i < timecards.length; i++) {
                if (timecards[i].sys_id === id) {
                    selTimecard = timecards[i];
                }
            }
            return selTimecard;
        };

        function getTimecardsLengthLocal() {
            return getTimecardsLocal().length;
        }
        // Users
        function setUserLocal(user) {
            var _user = {
                'user_id': user.user_id,
                'email': user.email,
                'sys_id': user.sys_id
            };
            localStorage.setItem('user', JSON.stringify(_user));
        };

        function getUserLocal() {
            return JSON.parse(localStorage.getItem('user'));
        };
        // Approvals
        function setApprovalsLocal(result) {
            localStorage.setItem('approvals', JSON.stringify(result));
        }

        function getApprovalsLocal() {
            return JSON.parse(localStorage.getItem('approvals'));
        };

        function getApprovalsLengthLocal() {
            return getApprovalsLocal().length;
        };
        // Statistics
        function getTotalHrsDay() {};

        function getTotalHrsWeek() {};

        function getTotalHrsMonth() {};
        return {
            // Projects 
            setProjectsLocal: setProjectsLocal,
            getProjectsLocal: getProjectsLocal,
            getProjectNumberBySysID: getProjectNumberBySysID,
            getProjectsLengthLocal: getProjectsLengthLocal,
            // Tasks
            setTasksLocal: setTasksLocal,
            getTasksLocal: getTasksLocal,
            getTaskNumberBySysID: getTaskNumberBySysID,
            getTasksLengthLocal: getTasksLengthLocal,
            // Stories
            setStoriesLocal: setStoriesLocal,
            getStoriesLocal: getStoriesLocal,
            getStoryNumberBySysID: getStoryNumberBySysID,
            getStoriesLengthLocal: getStoriesLengthLocal,
            // Timecards
            setTimecardsLocal: setTimecardsLocal,
            setTimecardLocalByID: setTimecardLocalByID,
            getTimecardsLocal: getTimecardsLocal,
            getTimecardsByDateLocal: getTimecardsByDateLocal,
            getTimecardByID: getTimecardByID,
            getTimecardsLengthLocal: getTimecardsLengthLocal,
            // Users
            setUserLocal: setUserLocal,
            getUserLocal: getUserLocal,
            // Approvals
            setApprovalsLocal: setApprovalsLocal,
            getApprovalsLocal: getApprovalsLocal,
            getApprovalsLengthLocal: getApprovalsLengthLocal,
            // Stats
            getTotalHrsDay: getTotalHrsDay,
            getTotalHrsWeek: getTotalHrsWeek,
            getTotalHrsMonth: getTotalHrsMonth
        }
    })
