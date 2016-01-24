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
        'ApprovalsTable': 'sysapproval_approver', // Servicenow Approvals Table
        'UserTable': 'sys_user'
    })
    .constant('errorService', {
        'AuthMessage': 'User Not Authenticated'
    })
    // Token Service (Access, Password)
    .factory('TokenService', function() {
        //var _token = "tSjbPwRdhQMR75XcFJ52617pEBj1DNWomsvDKb6VZBsAdw--mNJUroqz8a3DBYE7Bb8GhM6CO7KPTFvHgLcMEQ";
        var _token = "";
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
    .factory('snService', function($http, $q, $state, snCred, errorService, TokenService, UserService, LocalStorageService) {
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
                        if (LocalStorageService.setProjectsLocal(data.result)) {
                            defer.resolve(data.result);
                        }
                    })
                    .error(function(error) {
                        console.log(error.error.message);
                        // if error message equals to "AuthMessage" redirect to login
                        // and get new access token and set it in the TokenService 
                        // Local Storage 
                        if (error.error.message == errorService.AuthMessage) {
                            $state.go('app.login');
                        } else {
                            // if some other store the empty array in localstorage 
                            // for Projects 
                            if (LocalStorageService.setProjectsLocal([])) {
                                defer.reject(error);
                            }
                        }

                    })
                return defer.promise;
            },
            getTasks: function() {
                // get all tasks assigned_to = user (and) state = open or pending or work in progress
                var query = "?sysparm_query=state=2^ORstate=1^ORstate=-5^assigned_to=" + UserService.getUser().sys_id;
                var url = snCred.PRODURL + 'api/now/table/' + snCred.TasksTableName + query;
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
                        if (LocalStorageService.setTasksLocal(data.result)) {
                            defer.resolve(data.result);
                        }
                    })
                    .error(function(error) {
                        if (LocalStorageService.setTasksLocal([])) {
                            defer.reject(error);
                        }
                    })
                return defer.promise;
            },
            getStories: function() {
                var query = "?sysparm_query=state!=3^ORstate!=4^ORstate!=20^assigned_to=" + UserService.getUser().sys_id;
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
                        if (LocalStorageService.setStoriesLocal(data.result)) {
                            defer.resolve(data.result);
                        }
                    })
                    .error(function(error) {
                        if (LocalStorageService.setStoriesLocal([])) {
                            defer.reject(error);
                        }
                    })
                return defer.promise;
            },
            getTimecards: function() {
                var query = "?sysparm_query=user=" + UserService.getUser().sys_id;
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
                        if (LocalStorageService.setTimecardsLocal(data.result)) {
                            defer.resolve(data.result);
                        }
                    })
                    .error(function(error) {
                        console.log(error.error.message);
                        if (error.error.message == errorService.AuthMessage) {
                            $state.go('app.login');
                        }
                        // if (LocalStorageService.setTimecardsLocal([])) {
                        //     defer.reject(error);
                        // }
                    })
                return defer.promise;
            },
            getApprovals: function() {
                var query = "?sysparm_query=source_table=time_card^state!=approved^approver=" + UserService.getUser().sys_id;
                var url = snCred.PRODURL + '/api/now/table/' + snCred.ApprovalsTable + query;
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
                        if (LocalStorageService.setApprovalsLocal(data.result)) {
                            defer.resolve(data.result);
                        }
                    })
                    .error(function(error) {
                        if (LocalStorageService.setApprovalsLocal([])) {
                            defer.reject(error);
                        }

                    })
                return defer.promise;
            },
            // get username by sys_id passed by
            getUsernameBySysID: function(sys_id) {
                console.log(sys_id);
                var query = "?sysparm_query=sys_id=" + sys_id;
                var url = snCred.PRODURL + 'api/now/table/' + snCred.UserTable + query;
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
                        // update local timecard storage 
                        if (LocalStorageService.addNewTimecardLocal(data.result)) {
                            // response to promise - callback
                            defer.resolve(data.result);
                        }

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
                        // update local timecard storage
                        if (LocalStorageService.setTimecardLocalByID(data.result.sys_id, data.result)) { // sys_id, [object]
                            // response to promise - callback
                            defer.resolve(data.result);
                        }
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
                        //update timecard local storage 
                        if (LocalStorageService.setTimecardLocalByID(data.result.sys_id, data.result)) { //(sys_id,[object])
                            //response to promise - callback
                            defer.resolve(data.result);

                        }
                    })
                    .error(function(error) {
                        defer.reject(error);
                    })
                return defer.promise;
            },
            //delete functions 
            deleteTimecard: function(sys_id) {
                var url = snCred.PRODURL + '/api/now/table/' + snCred.TimecardTable + '/' + sys_id;
                var token = "Bearer " + TokenService.getToken();
                var defer = $q.defer();
                $http({
                        method: 'DELETE',
                        url: url,
                        headers: {
                            'Authorization': token
                        }
                    })
                    .success(function() {
                        //delete timecard from local storage 
                        if (LocalStorageService.deleteTimecardLocalByID(sys_id)) {
                            //response to promise - callback
                            defer.resolve("deleted");
                        }
                    })
                    .error(function(error) {
                        defer.reject(error);
                    })
                return defer.promise;
            },
            // approve timecard in approvals 
            approveApprovals: function(sys_id) {
                var url = snCred.PRODURL + '/api/now/table/' + snCred.ApprovalsTable + '/' + sys_id;
                var token = "Bearer " + TokenService.getToken();
                var defer = $q.defer();
                var data = {
                    'state': 'approved'
                };
                $http({
                        method: 'PUT',
                        url: url,
                        headers: {
                            'Authorization': token
                        },
                        data: data
                    })
                    .success(function(data) {
                        //update approvals
                        if (LocalStorageService.deleteApprovalBySysID(sys_id)) {
                            // response to promise  - callback
                            defer.resolve(data.result);
                        }
                    })
                    .error(function(error) {
                        defer.reject(error);
                    })
                return defer.promise;
            },
            // reject timecard in approvals 
            rejectApprovals: function(sys_id) {
                var url = snCred.PRODURL + '/api/now/table/' + snCred.ApprovalsTable + '/' + sys_id;
                var token = "Bearer " + TokenService.getToken();
                var defer = $q.defer();
                var data = {
                    'state': 'rejected'
                };
                $http({
                        method: 'PUT',
                        url: url,
                        headers: {
                            'Authorization': token
                        },
                        data: data
                    })
                    .success(function(data) {
                        //update approvals
                        if (LocalStorageService.deleteApprovalBySysID(sys_id)) {
                            // response to promise  - callback
                            defer.resolve(data.result);
                        }
                    })
                    .error(function(error) {
                        defer.reject(error);
                    })
                return defer.promise;
            }
        }
    })
    // User Service (session, storage)
    .factory('UserService', function() {
        var user = {
            'user_id': 'mani',
            'email': 'mani.gk@volteo.com',
            'sys_id': '2133326f0faa860077b6ab78b1050e5a'
        };
        // set user (user_id (user_id/name), email (email),sys_id)
        function setUser(user) {
            user.user_id = user.user_id;
            user.email = user.email;
            user.sys_id = user.sys_id;
        };
        // retrieve user 
        function getUser() {
            return user;
        };
        return {
            setUser: setUser,
            getUser: getUser
        };
    })
    // Login Service
    .factory('LoginService', function($http, $timeout, $q, snCred) {
        var tokenUrl = snCred.PRODURL + 'oauth_token.do';
        // Request Method = POST
        return {
            doLogin: function(username, password) {
                var data = "grant_type=password&client_id=" + snCred.Client_id + "&client_secret=" + snCred.Client_secret + "&username=" + username + "&password=" + password;
                $http({
                    method: 'POST',
                    url: login,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: data
                }).success(function(response) {
                    console.log(response);
                });
            }
        }
    })
    // Local Storage Service
    // for phase 2 - revision(app release) (use prototypical inhertiance ) create Project, Task, Story, 
    // Timecard, Approval, User, objects and create their prototype methods (get,set,del)
    // and make code more reusable  
    .factory('LocalStorageService', function(moment) {
        // Projects 
        function setProjectsLocal(result) {
            if (result) {
                localStorage.setItem('projects', JSON.stringify(result));
            } else {
                localStorage.setItem('projects', []);
            }

            return true;
        };

        function getProjectsLocal() {
            return JSON.parse(localStorage.getItem('projects'));
        };

        function getProjectNumberBySysID(id) {
            var projectNumber = "";
            var projects = getProjectsLocal();
            for (var i = 0; i < projects.length; i++) {
                if (projects[i].sys_id == id) {
                    projectNumber = projects[i].number;
                }
            }
            return projectNumber;
        };

        function getProjectsLengthLocal() {
            return getProjectsLocal().length;
        };

        function getProjectNameBySysID(id) {
            var projectName = "";
            var projects = getProjectsLocal();
            for (var i = 0; i < projects.length; i++) {
                if (projects[i].sys_id == id) {
                    projectName = projects[i].short_description;
                }
            }
            return projectName;
        }
        // Tasks
        function setTasksLocal(result) {
            if (result) {
                localStorage.setItem('tasks', JSON.stringify(result));
            } else {
                localStorage.setItem('tasks', []);
            }
            return true;
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
            if (result) {
                localStorage.setItem('stories', JSON.stringify(result));
            } else {
                localStorage.setItem('stories', []);
            }
            return true;
        };

        function getStoriesLocal() {
            return JSON.parse(localStorage.getItem('stories'));
        };

        function getStoryNumberBySysID(id) {
            var storyNumber = "";
            var stories = getStoriesLocal();
            for (var i = 0; i < stories.length; i++) {
                if (stories[i].sys_id === id) {
                    storyNumber = stories[i].number;
                }
            }
            return storyNumber;
        };

        function getStoriesLengthLocal() {
            return getStoriesLocal().length;
        };

        // Timecards
        function setTimecardsLocal(result) {
            if (result) {
                localStorage.setItem('timecards', JSON.stringify(result));
            } else {
                localStorage.setItem('timecards', []);
            }
            return true;
        };

        function setTimecardLocalByID(sys_id, timecard) {
            var timecards = getTimecardsLocal();
            for (var i = 0; i < timecards.length; i++) {
                if (timecards[i].sys_id === sys_id) {
                    timecards[i] = timecard;
                }
            }
            setTimecardsLocal(timecards); //  function to call setTimecardsLocal(), save timecard to Local stograe
            return true;
        };

        function addNewTimecardLocal(timecard) {
            var timecards = getTimecardsLocal();
            timecards.push(timecard);
            setTimecardsLocal(timecards);
            return true;
        };

        function getTimecardsLocal() {
            return JSON.parse(localStorage.getItem('timecards'));
        };
        // return all timecards by argument "date" and state is "Pending"
        function getTimecardsByDateLocal(seldate) {
            var timecards = JSON.parse(localStorage.getItem('timecards'));
            var selTimecards = []
            for (var i = 0; i < timecards.length; i++) {
                if (seldate == timecards[i].week_starts_on && timecards[i].state == 'Pending') {
                    selTimecards.push(timecards[i]);
                }
            }
            return selTimecards;
        };
        // return all timecards by date with condition comparision with argument date and return all 
        // timecards with any state condition
        function getTimecardsByDateLocalForCharts(seldate) {
            var timecards = JSON.parse(localStorage.getItem('timecards'));
            var selTimecards = [];
            for (var i = 0; i < timecards.length; i++) {
                if (seldate == timecards[i].week_starts_on) {
                    selTimecards.push(timecards[i]);
                }
            }
            return selTimecards;
        };

        function getTimecardsByMonthYearLocal(seldate) {
            var timecards = JSON.parse(localStorage.getItem('timecards'));
            var selTimecards = [];
            var passDate = moment(new Date(seldate));
            // start date and end date 
            var startDate = passDate.clone().startOf('month');
            var endDate = passDate.clone().endOf('month');
            for (var i = 0; i < timecards.length; i++) {
                if (moment(new Date(timecards[i].week_starts_on)).isBetween(startDate, endDate)) {
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

        function getTimecardByCreatedDate(tcdate) {
            var timecards = JSON.parse(localStorage.getItem('timecards'));
            var dt = new Date("Time Card: Created 2016-01-05 19:58:34");
            var selTimecards = "";
            for (var i = 0; i < timecards.length; i++) {
                console.log((new Date(timecards[i].sys_created_on)));
            }
            return selTimecards;
        };

        function getTimecardsLengthLocal() {
            return getTimecardsLocal().length;
        };

        function getTimecardNumberByID(sys_id) {
            var timecardNumber = "";
            var timecards = getTimecardsLocal();
            for (var i = 0; i < timecards.length; i++) {
                if (timecards[i].sys_id == sys_id) {
                    timecardNumber = timecards[i].u_number;
                }
            }
            return timecardNumber;
        };

        function deleteTimecardLocalByID(sys_id) {
            var timecards = getTimecardsLocal();
            for (var i = 0; i < timecards.length; i++) {
                if (timecards[i].sys_id == sys_id) {
                    timecards.splice(i, 1);
                }
            }
            setTimecardsLocal(timecards);
            return true;
        };

        function clearAllTimecardsLocal() {
            localStorage.setItem('timecards', []);
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
            if (result) {
                localStorage.setItem('approvals', JSON.stringify(result));
            } else {
                localStorage.setItem('approvals', []);
            }
            return true;
        };

        function getApprovalsLocal() {
            return JSON.parse(localStorage.getItem('approvals'));
        };

        function getApprovalsLengthLocal() {
            return getApprovalsLocal().length;
        };

        function deleteApprovalBySysID(sys_id) {
            var approvals = getApprovalsLocal();
            for (var i = 0; i < approvals.length; i++) {
                if (approvals[i].sys_id == sys_id) {
                    approvals.splice(i, 1)
                }
            }
            setApprovalsLocal(approvals);
            return true;
        };
        return {
            // Projects 
            setProjectsLocal: setProjectsLocal,
            getProjectsLocal: getProjectsLocal,
            getProjectNumberBySysID: getProjectNumberBySysID,
            getProjectNameBySysID: getProjectNameBySysID,
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
            addNewTimecardLocal: addNewTimecardLocal,
            setTimecardsLocal: setTimecardsLocal,
            setTimecardLocalByID: setTimecardLocalByID,
            getTimecardsLocal: getTimecardsLocal,
            getTimecardsByDateLocal: getTimecardsByDateLocal,
            getTimecardByID: getTimecardByID,
            getTimecardByCreatedDate: getTimecardByCreatedDate,
            getTimecardsLengthLocal: getTimecardsLengthLocal,
            getTimecardsByMonthYearLocal: getTimecardsByMonthYearLocal,
            getTimecardNumberByID: getTimecardNumberByID,
            getTimecardsByDateLocalForCharts: getTimecardsByDateLocalForCharts,
            deleteTimecardLocalByID: deleteTimecardLocalByID,
            // Users
            setUserLocal: setUserLocal,
            getUserLocal: getUserLocal,
            // Approvals
            setApprovalsLocal: setApprovalsLocal,
            getApprovalsLocal: getApprovalsLocal,
            getApprovalsLengthLocal: getApprovalsLengthLocal,
            deleteApprovalBySysID: deleteApprovalBySysID
        }
    });
