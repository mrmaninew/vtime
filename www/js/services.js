angular.module('starter.services', [])
    // Required global variables
    .constant('snCred', {
        //'Client_id':'ac0dd3408c1031006907010c2cc6ef6d', // Production Instance Client ID
        //'Client_secret':'1yihwfk2xbl686v45s8a', // Production Instance Client Secret
        //'PRODURL':'https://volteopsa.service-now.com', // "Production" Volteo ServiceNow Production Instance URL
        'Client_id': 'ac0dd3408c1031006907010c2cc6ef6d', // "Development Instance Client ID"
        'Client_secret': '1yihwfk2xbl686v45s8a', // "Development Instance Client ID"
        'grant_type': ['password', 'access'],
        'PRODURL': 'https://volteollcdemo1.service-now.com', // "Development" Volteo Servicenow development Instance URL
        //'PRODURL': '/api', // Temp empty URL for development environment and this will changed when deploying PROD
        'PrjTableName': 'pm_project', // Servicenow Project Table
        'TasksTableName': 'pm_project_task', // Servicenow Tasks Table
        'StoriesTableName': 'rm_story', // Servicenow Stories Table
        'TimecardTable': 'time_card', // Servicenow Timecard Table
        'ApprovalsTable': 'sysapproval_approver', // Servicenow Approvals Table
        'CustomersTable': 'x_volt2_psa_customer',
        'UserTable': 'sys_user', // Servicenow User Table (sys_user)
        'ResourcePlan': 'resource_plan' // Resource plan Table
    })
    // status and error code for http response checks 
    .constant('errorService', {
        'Success': 200, // 200 "Success" Success with response body.
        'Created': 201, // 201 "Created" Success with response body.
        'Success-No-body': 204, // 204 "Success" Success with no response body.
        'Bad-Request': 400, // 400 "Bad Request" The request URI does not match the APIs in the system, or the operation failed for unknown reasons. Invalid headers can also cause this error.
        'Unauthorized': 401, // 401 "Unauthorized" The user is not authorized to use the API.
        'Forbidden': 403, // 403 "Forbidden" The requested operation is not permitted for the user. This error can also be caused by ACL failures, or business rule or data policy constraints.
        'Notfound': 404, // 404 "Not found"  The requested resource was not found. This can be caused by an ACL constraint or if the resource does not exist.
        'method-not-allowed': 405 // 405 "Method not allowed" The HTTP action is not allowed for the requested REST API, or it is not supported by any API.       
    })
    // Token Service (Access, Password)
    // in phase 2, we try to utilize $httpInterceptor for default adding token to all req
    .factory('TokenService', function(LocalStorageService) {
        return {
            getToken: function() {
                return localStorage.getItem('token');
            },
            setToken: function(token) {
                localStorage.setItem('token', token);
                return true;
            },
            hasToken: function() {
                var token = localStorage.getItem('token');
                if (token !== null) {
                    return true;
                } else {
                    return false;
                }
            },
            clearToken: function() {
                localStorage.removeItem('token');
                return true;
            }
        };
    })
    // Servicenow Service
    .factory('snService', function($http, $q, $state, snCred, errorService, TokenService, UserService, LocalStorageService) {
        return {
            //get functions
            getProjects: function() {
                var query = "?sysparm_query=state=2";
                var url = snCred.PRODURL + '/api/now/table/' + snCred.PrjTableName + query; 
                var token = "Bearer " + TokenService.getToken();
                var defer = $q.defer();
                $http({
                        method: 'GET',
                        url: url,
                        headers: {
                            'Authorization': token
                        }
                    })
                    .success(function(data, status) {
                        if (LocalStorageService.setProjectsLocal(data.result)) {
                            defer.resolve(data.result);
                        }
                    })
                    .error(function(error, status) {
                        // if error message equals to "AuthMessage" redirect to login
                        // and get new access token and set it in the TokenService 
                        // Local Storage 
                        if (status == errorService.Unauthorized) {
                            $state.go('login');
                        } else {
                            // if some other errors, store the empty array in localstorage 
                            // for Projects 
                            if (status == errorService.Notfound) {
                                if (LocalStorageService.setProjectsLocal([])) {
                                    defer.resolve(error);
                                }
                            }
                        }

                    });
                return defer.promise;
            },
            // get Project Name by sys_id
            getProjectNameBySysID: function(sys_id) {
                var query = "?sysparm_query=sys_id=" + sys_id;
                var url = snCred.PRODURL + '/api/now/table/' + snCred.PrjTableName + query;
                var token = "Bearer " + TokenService.getToken();
                var defer = $q.defer();
                $http({
                        method: 'GET',
                        url: url,
                        headers: {
                            'Authorization': token
                        }
                    })
                    .success(function(data, status) {
                        if (status == errorService.Success) {
                            defer.resolve(data.result[0].short_description);
                        }
                    })
                    .error(function(error, status) {
                        // if error message equals to "AuthMessage" redirect to login
                        // and get new access token and set it in the TokenService 
                        // Local Storage 
                        if (status == errorService.Unauthorized) {
                            $state.go('login');
                        } else {
                            // if some other errors, store the empty array in localstorage 
                            // for Projects 
                            if (status == errorService.Notfound) {
                                defer.resolve("");
                            }
                        }

                    });
                return defer.promise;
            },
            // get All tasks
            getTasks: function() {
                // get all tasks assigned_to = user (and) state = open or pending or work in progress
                var query = "?sysparm_query=state=2^ORstate=1^ORstate=-5^assigned_to=" + UserService.getUserID();
                var url = snCred.PRODURL + '/api/now/table/' + snCred.TasksTableName + query;
                var token = "Bearer " + TokenService.getToken();
                var defer = $q.defer();
                $http({
                        method: 'GET',
                        url: url,
                        headers: {
                            'Authorization': token
                        }
                    })
                    .success(function(data, status) {
                        if (LocalStorageService.setTasksLocal(data.result)) {
                            defer.resolve(data.result);
                        }
                    })
                    .error(function(error, status) {
                        if (status == errorService.Unauthorized) {
                            $state.go('login');
                        } else {
                            // if some other errors,store the empty array in localstorage 
                            // for Tasks
                            if (status == errorService.Notfound) {
                                if (LocalStorageService.setTasksLocal([])) {
                                    defer.resolve(error);
                                }
                            }
                        }

                    });
                return defer.promise;
            },
            // get task name by sys_id
            getTaskNameBySysID: function(sys_id) {
                var query = "?sysparm_query=sys_id+" + sys_id;
                var url = snCred.PRODURL + '/api/now/table/' + snCred.TasksTableName + query;
                var token = "Bearer " + TokenService.getToken();
                var defer = $q.defer();
                $http({
                        method: 'GET',
                        url: url,
                        headers: {
                            'Authorization': token
                        }
                    })
                    .success(function(data, status) {
                        if (status == errorService.Success) {
                            defer.resolve(data.result[0].short_description);
                        }
                    })
                    .error(function(error, status) {
                        // if error message equals to "AuthMessage" redirect to login
                        // and get new access token and set it in the TokenService 
                        // Local Storage 
                        if (status == errorService.Unauthorized) {
                            $state.go('login');
                        } else {
                            // if some other errors, store the empty array in localstorage 
                            // for Projects 
                            if (status == errorService.Notfound) {
                                defer.resolve("");
                            }
                        }

                    });
                return defer.promise;
            },
            // get all stories
            getStories: function() {
                var query = "?sysparm_query=state!=3^ORstate!=4^ORstate!=20^ORstate!=-6^assigned_to=" + UserService.getUserID();
                var url = snCred.PRODURL + '/api/now/table/' + snCred.StoriesTableName + query;
                var token = "Bearer " + TokenService.getToken();
                var defer = $q.defer();
                $http({
                        method: 'GET',
                        url: url,
                        headers: {
                            'Authorization': token
                        }
                    })
                    .success(function(data, status) {
                        if (LocalStorageService.setStoriesLocal(data.result)) {
                            defer.resolve(data.result);
                        }
                    })
                    .error(function(error, status) {
                        if (status == errorService.Unauthorized) {
                            $state.go('login');
                        } else {
                            // if some other errors, store the empty array in localstorage 
                            // for Stories
                            if (status == errorService.Notfound) {
                                if (LocalStorageService.setStoriesLocal([])) {
                                    defer.resolve(error);
                                }
                            }
                        }
                    });
                return defer.promise;
            },
            // get story name by sys_id
            getStoryNameBySysID: function(sys_id) {
                var query = "?sysparm_query=sys_id=" + sys_id;
                var url = snCred.PRODURL + '/api/now/table/' + snCred.StoriesTableName + query;
                var token = "Bearer " + TokenService.getToken();
                var defer = $q.defer();
                $http({
                        method: 'GET',
                        url: url,
                        headers: {
                            'Authorization': token
                        }
                    })
                    .success(function(data, status) {
                        if (status == errorService.Success) {
                            defer.resolve(data.result[0].short_description);
                        }
                    })
                    .error(function(error, status) {
                        // if error message equals to "AuthMessage" redirect to login
                        // and get new access token and set it in the TokenService 
                        // Local Storage 
                        if (status == errorService.Unauthorized) {
                            $state.go('login');
                        } else {
                            // if some other errors, store the empty array in localstorage 
                            // for Projects 
                            if (status == errorService.Notfound) {
                                defer.resolve("");
                            }
                        }

                    });
                return defer.promise;
            },
            // get all customers
            getCustomers: function() {
                var query = "";
                var url = snCred.PRODURL + '/api/now/table/' + snCred.CustomersTable;
                var token = "Bearer " + TokenService.getToken();
                var defer = $q.defer();
                $http({
                        method: 'GET',
                        url: url,
                        headers: {
                            'Authorization': token
                        }
                    })
                    .success(function(data, status) {
                        if (LocalStorageService.setCustomersLocal(data.result)) {
                            //console.log(data.result);
                            defer.resolve(data.result);
                        }
                    })
                    .error(function(error, status) {
                        if (status == errorService.Unauthorized) {
                            $state.go('login');
                        } else {
                            // if some other errors, store the empty array in localstorage 
                            // for Stories
                            if (status == errorService.Notfound) {
                                if (LocalStorageService.setStoriesLocal([])) {
                                    defer.resolve(error);
                                }
                            } 
                        }
                    });
                return defer.promise;
            },
            // get all timecards
            getTimecards: function() {
                var query = "?sysparm_query=user=" + UserService.getUserID();
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
                    .success(function(data, status) {
                        if (LocalStorageService.setTimecardsLocal(data.result)) {
                            defer.resolve(data.result);
                        }
                    })
                    .error(function(error, status) {
                        if (status == errorService.Unauthorized) {
                            $state.go('login');
                        } else {
                            // if some other errors store the empty array in localstorage 
                            // for  Timecards
                            if (status == errorService.Notfound) {
                                if (LocalStorageService.setTimecardsLocal([])) {
                                    defer.resolve(error);
                                }
                            }
                        }

                    });
                return defer.promise;
            },
            // get timecard by sys_id
            getTimecardBySysID: function(set) {
                var query = "?sysparm_query=sys_id=" + set.document_id.value + '&sysparm_display_value=all';
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
                    .success(function(data, status) {
                        var result = data.result[0];
                        result.approval_id = set.sys_id;
                        result.approval_number = set.u_number;
                        defer.resolve(result);
                    })
                    .error(function(error, status) {
                        if (status == errorService.Unauthorized) {
                            $state.go('login');
                        } else {
                            if (status == errorService.Notfound) {
                                defer.resolve({});
                            }
                        }

                    });
                return defer.promise;
            },
            // get all approvals from servicenow 
            getApprovals: function() {
                var query = "?sysparm_query=source_table=time_card^state=requested^approver=" + UserService.getUserID();
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
                    .success(function(data, status) {
                        if (LocalStorageService.setApprovalsLocal(data.result)) {
                            defer.resolve(data.result);
                        }
                    })
                    .error(function(error, status) {
                        if (status == errorService.Unauthorized) {
                            $state.go('login');
                        } else {
                            // if some other errors store the empty array in localstorage 
                            // for Approvals
                            if (status == errorService.Notfound) {
                                if (LocalStorageService.setApprovalsLocal([])) {
                                    defer.resolve(error);
                                }
                            }
                        }

                    });
                return defer.promise;
            },
            // set (insert, update) functions 
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
                    .success(function(data, status) {
                        // update local timecard storage
                        if (status == errorService.Success || status == errorService.Created) {
                            if (LocalStorageService.addNewTimecardLocal(data.result)) {
                                // response to promise - callback
                                defer.resolve(data.result);
                            }
                        }
                    })
                    .error(function(error, status) {
                        if (status == errorService.Unauthorized) {
                            $state.go('login');
                        } else {
                            defer.reject(error);
                        }
                    });
                return defer.promise;
            },
            // update timecard by sys_id
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
                    .success(function(data, status) {
                        if (status == errorService.Success) {
                            // update local timecard storage
                            if (LocalStorageService.setTimecardLocalByID(data.result.sys_id, data.result)) { // sys_id, [object]
                                // response to promise - callback
                                defer.resolve(data.result);
                            }
                        }
                    })
                    .error(function(error, status) {
                        if (status == errorService.Unauthorized) {
                            $state.go('login');
                        } else {
                            defer.resolve(error);
                        }
                    });
                return defer.promise;
            },
            // verify timecard if all ready exists for same day 
            verifyTimecard: function(tc, week) {
                // var query = "?sysparm_query=user="+tc.user+"^u_billable="+tc.u_billable+"^u_project="+tc.u_project+"^task="+tc.task+"^category="+tc.category+"^state=pending^week_starts_onON"+week+"@javascript:gs.dateGenerate('"+week+"','start')@javascript:gs.dateGenerate('"+week+"','end')";
                var query = "?sysparm_query=user=" + tc.user + "^state=pending";
                if (tc.u_billable) {
                    query += "^u_billable=" + tc.u_billable;
                }
                if (tc.u_project) {
                    query += "^u_project=" + tc.u_project;
                }
                if (tc.resource_plan) {
                    query += "^resource_plan=" + tc.resource_plan;
                }
                if (tc.task) {
                    query += "^task=" + tc.task;
                }
                if (tc.u_story) {
                    query += "^u_story=" + tc.u_story;
                }
                if (tc.category) {
                    query += "^category=" + tc.category;
                }
                query += "^week_starts_onON" + week + "@javascript:gs.dateGenerate('" + week + "','start')@javascript:gs.dateGenerate('" + week + "','end')";
                var url = snCred.PRODURL + '/api/now/table/' + snCred.TimecardTable + query;
                console.log(url);
                var token = "Bearer " + TokenService.getToken();
                var defer = $q.defer();
                $http({
                        method: 'GET',
                        url: url,
                        headers: {
                            'Authorization': token
                        }
                    })
                    .success(function(data, status) {
                        if (status == errorService.Success) {
                            // response to promise - callback
                            console.log(data.result);
                            defer.resolve(data.result);
                        }
                    })
                    .error(function(error, status) {
                        if (status == errorService.Unauthorized) {
                            $state.go('login');
                        } else if (status == errorService.Notfound) {
                            defer.resolve([]);
                        } else {
                            defer.resolve(error);
                        }
                    });
                return defer.promise;
            },
            // only edit state value and use sys_id as param 
            submitTimecard: function(sys_id) {
                var url = snCred.PRODURL + '/api/now/table/' + snCred.TimecardTable + '/' + sys_id;
                var token = "Bearer " + TokenService.getToken();
                var defer = $q.defer();
                var data = {
                    'state': 'Submitted'
                };
                $http({
                        method: 'PATCH',
                        url: url,
                        headers: {
                            'Authorization': token
                        },
                        data: JSON.stringify(data)
                    })
                    .success(function(data, status) {
                        console.log(data, status);
                        if (status == errorService.Success) {
                            if (LocalStorageService.setTimecardLocalByID(data.result.sys_id, data.result)) { //(sys_id,[object])
                                //response to promise - callback
                                defer.resolve(data.result);

                            }
                        }
                    })
                    .error(function(error, status) {
                        if (status == errorService.Unauthorized) {
                            $state.go('login');
                        } else {
                            defer.resolve(error);
                        }
                    });
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
                    .success(function(status) {
                        //delete timecard from local storage 
                        if (LocalStorageService.deleteTimecardLocalByID(sys_id)) {
                            //response to promise - callback
                            defer.resolve("deleted");
                        }
                    })
                    .error(function(error, status) {
                        if (status == errorService.Unauthorized) {
                            $state.go('login');
                        } else {
                            defer.resolve(error);
                        }
                    });
                return defer.promise;
            },
            // get username by sys_id passed by
            getUsernameBySysID: function(sys_id) {
                var query = "?sysparm_query=sys_id=" + sys_id;
                var url = snCred.PRODURL + '/api/now/table/' + snCred.UserTable + query;
                var token = "Bearer " + TokenService.getToken();
                var defer = $q.defer();
                $http({
                        method: 'GET',
                        url: url,
                        headers: {
                            'Authorization': token
                        }
                    })
                    .success(function(data, status) {
                        if (status == errorService.Success) {
                            defer.resolve(data.result);
                        }
                    })
                    .error(function(error, status) {
                        if (status == errorService.Unauthorized) {
                            $state.go('login');
                        } else {
                            defer.resolve(error);
                        }
                    });
                return defer.promise;
            },
            // get user details like user_id, email, sys_id
            getUserDetailsByUsername: function(username, tokens) {
                var query = "?sysparm_query=user_name=" + username;
                var url = snCred.PRODURL + '/api/now/table/' + snCred.UserTable + query;
                var token = "Bearer " + tokens;
                var defer = $q.defer();
                $http({
                        method: 'GET',
                        url: url,
                        headers: {
                            'Authorization': token
                        }
                    })
                    .success(function(data, status) {
                        if (status == errorService.Success) {
                            if (UserService.setUser(data.result[0])) {
                                defer.resolve(data.result);
                            }
                        }
                    })
                    .error(function(error, status) {
                        if (status == errorService.Unauthorized) {
                            $state.go('login');
                        }
                    });
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
                    .success(function(data, status) {
                        if (status == errorService.Success) {
                            //update approvals
                            if (LocalStorageService.deleteApprovalBySysID(sys_id)) {
                                // response to promise  - callback
                                defer.resolve(data.result);
                            }
                        }
                    })
                    .error(function(error, status) {
                        if (status == errorService.Unauthorized) {
                            $state.go('login');
                        } else {
                            defer.resolve(error);
                        }
                    });
                return defer.promise;
            },
            // reject timecard in approvals 
            rejectApprovals: function(sys_id, comments) {
                var url = snCred.PRODURL + '/api/now/table/' + snCred.ApprovalsTable + '/' + sys_id;
                var token = "Bearer " + TokenService.getToken();
                var defer = $q.defer();
                var data = {
                    'state': 'rejected',
                    'comments': comments
                };
                $http({
                        method: 'PUT',
                        url: url,
                        headers: {
                            'Authorization': token
                        },
                        data: data
                    })
                    .success(function(data, status) {
                        if (status == errorService.Success) {
                            //update approvals
                            if (LocalStorageService.deleteApprovalBySysID(sys_id)) {
                                // response to promise  - callback
                                defer.resolve(data.result);
                            }
                        }
                    })
                    .error(function(error, status) {
                        if (status == errorService.Unauthorized) {
                            $state.go('login');
                        } else {
                            defer.resolve(error);
                        }
                    });
                return defer.promise;
            },
            // get Hours, weekly and monthly 
            getTimecardMonthlyHours: function(monStartDate, monEndDate) {
                var query = "?sysparm_sum_fields=total&sysparm_query=" +
                    "^week_starts_onBETWEENjavascript:gs.dateGenerate('" + monStartDate + "','start')@javascript:gs.dateGenerate('" + monEndDate + "','end')" +
                    "^user=" + UserService.getUserID();
                var url = snCred.PRODURL + '/api/now/stats/' + snCred.TimecardTable + query;
                var token = "Bearer " + TokenService.getToken();
                var defer = $q.defer();
                $http({
                        method: 'GET',
                        url: url,
                        headers: {
                            'Authorization': token
                        }
                    })
                    .success(function(data, status) {
                        if (status == errorService.Success) {
                            // response to promise - callback
                            defer.resolve(data.result);
                        }
                    })
                    .error(function(error, status) {
                        if (status == errorService.Unauthorized) {
                            $state.go('login');
                        } else if (status == errorService.Notfound) {
                            defer.reject(error);
                        } else {
                            defer.reject(error);
                        }
                    });
                return defer.promise;
            },
            // get Resource plan for specified project and signed user
            getResourcePlans: function(project_id) {
                var user_id = UserService.getUserID();
                var query = '?sysparm_query=members_listLIKE' + user_id + '^ORuser_resource=' + user_id + '^task=' + project_id + '^state=3';
                var url = snCred.PRODURL + '/api/now/table/' + snCred.ResourcePlan + query;
                var token = "Bearer " + TokenService.getToken();
                var defer = $q.defer();
                $http({
                        method: 'GET',
                        url: url,
                        headers: {
                            'Authorization': token
                        }
                    })
                    .success(function(data, status) {
                        defer.resolve(data);
                    })
                    .error(function(error, status) {
                        if (status == errorService.Unauthorized) {
                            $state.go('login');
                        } else {
                            defer.resolve(error);
                        }
                    })
                return defer.promise;
            },
            // get all Resource plans for signed user
            getUserResourcePlans: function() {
                var user_id = UserService.getUserID();
                var query = '?sysparm_query=members_listLIKE' + user_id + '^ORuser_resource=' + user_id + '^state=3';
                var url = snCred.PRODURL + '/api/now/table/' + snCred.ResourcePlan + query;
                var token = "Bearer " + TokenService.getToken();
                var defer = $q.defer();
                $http({
                        method: 'GET',
                        url: url,
                        headers: {
                            'Authorization': token
                        }
                    })
                    .success(function(data, status) {
                        if (LocalStorageService.setResourcePlans(data.result)) {
                            defer.resolve(data.result);
                        }
                    })
                    .error(function(error, status) {
                        if (status == errorService.Unauthorized) {
                            $state.go('login');
                        } else {
                            defer.resolve(error);
                        }
                    })
                return defer.promise;
            }
        };
    })
    // User Service (session, storage)
    .factory('UserService', function($state) {
        // set user (user_id (user_name/name), email (email),sys_id)
        function setUser(users) {
            var user = {};
            user.user_id = users.user_name;
            user.email = users.email;
            user.sys_id = users.sys_id;
            localStorage.setItem('user', JSON.stringify(user));
            return true;
        }
        // retrieve user 
        function getUser() {
            var user = JSON.parse(localStorage.getItem('user'));
            if (user !== null || undefined) {
                return user;
            } else {
                $state.go('login');
            }
        }
        // retrieve user_id
        function getUserID(){
            var user = JSON.parse(localStorage.getItem('user'));
            if (user !== null || undefined) {
                return user.sys_id;
            } else {
                $state.go('login');
            }  
        }
        // remove user
        function clearUser() {
            localStorage.removeItem('user');
            return true;
        }
        return {
            setUser: setUser,
            getUser: getUser,
            clearUser: clearUser,
            getUserID: getUserID
        };
    })
    .factory('preLoadDataService', function($http, $q, $state, snService) {
        return {
            loadAll: function() {
                var defer = $q.defer();
                snService.getProjects() // get Projects
                    .then(function(result) {
                        snService.getTasks() // get Tasks
                            .then(function(result) {
                                snService.getStories() // get Stories
                                    .then(function(result) {
                                        snService.getTimecards() // get Timecards
                                            .then(function(result) {
                                                snService.getApprovals() // get Approvals and final function to call 
                                                    .then(function(result) {
                                                        snService.getUserResourcePlans()
                                                            .then(function(result) {
                                                                snService.getCustomers()
                                                                    .then(function(result) {
                                                                        defer.resolve('true');
                                                                    }, function(error) {
                                                                        LocalStorageService.setCustomersLocal([]);
                                                                        defer.resolve('true');
                                                                    });
                                                            }, function(error) {
                                                                LocalStorageService.setResourcePlans([]);
                                                            });
                                                    }, function(error) {
                                                        LocalStorageService.setApprovalsLocal([]);
                                                    });
                                            }, function(error) {
                                                LocalStorageService.setTimecardsLocal([]);
                                                console.log(error);
                                            });
                                    }, function(error) {
                                        LocalStorageService.setStoriesLocal([]);
                                        console.log(error);
                                    });
                            }, function(error) {
                                LocalStorageService.setTasksLocal([]);
                                console.log(error);
                            });
                    }, function(error) {
                        LocalStorageService.setProjectsLocal([]);
                        console.log(error);
                    });
                return defer.promise;
            }
        };
    })
    // Login Service
    .factory('LoginService', function($http, $timeout, $q, $location, $state, $httpParamSerializer, $httpParamSerializerJQLike, preLoadDataService, TokenService, errorService, snCred, snService) {
        var tokenUrl = snCred.PRODURL + '/oauth_token.do';
        // Request Method = POST
        return {
            doLogin: function(username, password) {
                var defer = $q.defer();
                // Body data (grant_type=password,client_id,client_secret,username,password)
                var data = "grant_type=password&client_id=" +
                    encodeURIComponent(snCred.Client_id) +
                    "&client_secret=" +
                    encodeURIComponent(snCred.Client_secret) +
                    "&username=" + encodeURIComponent(username) +
                    "&password=" + encodeURIComponent(password);

                $http({
                    method: 'POST',
                    url: tokenUrl,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: data
                }).success(function(response, status) {
                    if (status == errorService.Success) {
                        if (TokenService.setToken(response.access_token)) {
                            snService.getUserDetailsByUsername(username, response.access_token)
                                .then(function(response) {
                                    preLoadDataService.loadAll()
                                        .then(function(data) {
                                            defer.resolve('success');
                                        });
                                }, function(error) {
                                    console.log(error);
                                });
                        }
                    }
                }).error(function(response, status) {
                    if (status == errorService.Unauthorized) {
                        defer.resolve('nosuccess');
                    }
                });
                return defer.promise;
            }
        };
    })
    // Logout Service (Clear users, tokens, projects, tasks, stories, timecards, approvals and other information from local storgae)
    .factory('LogoutService', function($q, TokenService, UserService, LocalStorageService) {
        return {
            clearAll: function() {
                if (UserService.clearUser()) {
                    if (TokenService.clearToken()) {
                        if (LocalStorageService.clearAllItems()) {
                            return true;
                        }
                    }
                }
            }
        };
    })
    // Local Storage Service
    // for phase 2 - revision(app release) (use prototypical inhertiance ) create Project, Task, Story, 
    // Timecard, Approval, User, objects and create their prototype methods (get,set,del)
    // and make code more reusable  
    .factory('LocalStorageService', function(moment) {
        // Resource plans
        function setResourcePlans(result) {
            if (result) {
                localStorage.setItem('resourceplans', JSON.stringify(result));
            } else {
                localStorage.setItem('resourceplans', []);
            }
            return true;
        }

        function getResourcePlansLocal() {
            var resourceplans = JSON.parse(localStorage.getItem('resourceplans'));
            if (resourceplans != null || undefined) {
                return resourceplans;
            } else {
                return [];
            }
        }
        // Projects 
        function setProjectsLocal(result) {
            if (result) {
                localStorage.setItem('projects', JSON.stringify(result));
            } else {
                localStorage.setItem('projects', []);
            }
            return true;
        }

        function getProjectsLocal() {
            var projects = JSON.parse(localStorage.getItem('projects'));
            if (projects !== null || undefined) {
                return projects;
            } else {
                return [];
            }
        }

        function getProjectNumberBySysID(id) {
            var projectNumber = "";
            var projects = getProjectsLocal();
            for (var i = 0; i < projects.length; i++) {
                if (projects[i].sys_id == id) {
                    projectNumber = projects[i].number;
                }
            }
            return projectNumber;
        }

        function getProjectsLengthLocal() {
            var projects = getProjectsLocal();
            if (projects !== null || undefined) {
                return projects.length;
            } else {
                return 0;
            }
        }

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
        // customer
        function setCustomersLocal(result) {
            if (result) {
                localStorage.setItem('customers', JSON.stringify(result));
            } else {
                localStorage.setItem('customers', []);
            }
            return true;
        }

        function getCustomersLocal() {
            var customers = JSON.parse(localStorage.getItem('customers'));
            if (customers !== null || undefined) {
                return customers;
            } else {
                return [];
            }
        }

        function getCustomerNameBySysID(sys_id) {
            var customer_name = "";
            var customers = getCustomersLocal();
            if (customers !== null || undefined) {
                for (var i = 0; i < customers.length; i++) {
                    if (customers[i].sys_id === sys_id) {
                        customer_name = customers[i].name;
                    }
                }
                return customer_name;
            } else {
                return customer_name;
            }
        }
        // Tasks
        function setTasksLocal(result) {
            if (result) {
                localStorage.setItem('tasks', JSON.stringify(result));
            } else {
                localStorage.setItem('tasks', []);
            }
            return true;
        }

        function getTasksLocal() {
            var tasks = JSON.parse(localStorage.getItem('tasks'));
            if (tasks !== null || undefined) {
                return tasks;
            } else {
                return [];
            }
        }

        function getTaskNumberBySysID(id) {
            var taskNumber = "";
            var tasks = getTasksLocal();
            if (tasks !== null || undefined) {
                for (var i = 0; i < tasks.length; i++) {
                    if (tasks[i].sys_id === id) {
                        taskNumber = tasks[i].number;
                    }
                }
                return taskNumber;
            } else {
                return taskNumber;
            }
        }

        function getTaskNameBySysID(id) {
            var taskName = "";
            var tasks = getTasksLocal();
            if (tasks !== null || undefined) {
                for (var i = 0; i < tasks.length; i++) {
                    if (tasks[i].sys_id === id) {
                        taskName = tasks[i].short_description;
                    }
                }
                return taskName;
            } else {
                return taskName;
            }
        }

        function getTasksLengthLocal() {
            var tasks = getTasksLocal();
            if (tasks !== null || undefined) {
                return tasks.length;
            } else {
                return 0;
            }
        }
        // Stories 
        function setStoriesLocal(result) {
            if (result) {
                localStorage.setItem('stories', JSON.stringify(result));
            } else {
                localStorage.setItem('stories', []);
            }
            return true;
        }

        function getStoriesLocal() {
            return JSON.parse(localStorage.getItem('stories'));
        }

        function getStoryNumberBySysID(id) {
            var storyNumber = "";
            var stories = getStoriesLocal();
            for (var i = 0; i < stories.length; i++) {
                if (stories[i].sys_id === id) {
                    storyNumber = stories[i].number;
                }
            }
            return storyNumber;
        }

        function getStoryNameBySysID(id) {
            var storyName = "";
            var stories = getStoriesLocal();
            for (var i = 0; i < stories.length; i++) {
                if (stories[i].sys_id === id) {
                    storyName = stories[i].short_description;
                }
            }
            return storyName;
        }

        function getStoriesLengthLocal() {
            var stories = getStoriesLocal();
            if (stories !== null || undefined) {
                return stories.length;
            } else {
                return 0;
            }
        }

        // Timecards
        function setTimecardsLocal(result) {
            if (result) {
                localStorage.setItem('timecards', JSON.stringify(result));
            } else {
                localStorage.setItem('timecards', []);
            }
            return true;
        }

        function setTimecardLocalByID(sys_id, timecard) {
            var timecards = getTimecardsLocal();
            for (var i = 0; i < timecards.length; i++) {
                if (timecards[i].sys_id === sys_id) {
                    timecards[i] = timecard;
                }
            }
            setTimecardsLocal(timecards); //  function to call setTimecardsLocal(), save timecard to Local stograe
            return true;
        }

        function addNewTimecardLocal(timecard) {
            var timecards = getTimecardsLocal();
            timecards.push(timecard);
            setTimecardsLocal(timecards);
            return true;
        }

        function getTimecardsLocal() {
            return JSON.parse(localStorage.getItem('timecards'));
        }
        // return all timecards by argument "date" and state is "Pending"
        function getTimecardsByDateLocal(seldate) {
            var timecards = JSON.parse(localStorage.getItem('timecards'));
            var selTimecards = [];
            if (timecards !== null || undefined) {
                for (var i = 0; i < timecards.length; i++) {
                    if (seldate == timecards[i].week_starts_on && timecards[i].state == 'Pending') {
                        selTimecards.push(timecards[i]);
                    }
                }
                return selTimecards;
            } else {
                return selTimecards;
            }
        }
        // return all timecards by date with condition comparision with argument date and return all 
        // timecards with any state condition
        function getTimecardsByDateLocalForCharts(seldate) {
            var timecards = JSON.parse(localStorage.getItem('timecards'));
            var selTimecards = [];
            if (timecards !== null || undefined){
                for (var i = 0; i < timecards.length; i++) {
                    if (seldate == timecards[i].week_starts_on) {
                        selTimecards.push(timecards[i]);
                    }
                }
                return selTimecards;
            } else {
                return selTimecards;
            }
        }

        function getTimecardsByMonthYearLocal(seldate) {
            var timecards = JSON.parse(localStorage.getItem('timecards'));
            var selTimecards = [];
            var passDate = moment(new Date(seldate));
            // start date and end date 
            var startDate = passDate.clone().startOf('month');
            var endDate = passDate.clone().endOf('month');
            if (timecards !== null || undefined) {
                for (var i = 0; i < timecards.length; i++) {
                    if (moment(new Date(timecards[i].week_starts_on)).isBetween(startDate, endDate)) {
                        selTimecards.push(timecards[i]);
                    }
                }
                return selTimecards;
            } else {
                return selTimecards;
            }
        }

        function getTimecardByID(id) {
            var timecards = JSON.parse(localStorage.getItem('timecards'));
            var selTimecard = {};
            if (timecards !== null || undefined) {
                for (var i = 0; i < timecards.length; i++) {
                    if (timecards[i].sys_id === id) {
                        selTimecard = timecards[i];
                    }
                }
                return selTimecard;
            } else {
                return selTimecard;
            }
        }

        function getTimecardByCreatedDate(tcdate) {
            var timecards = JSON.parse(localStorage.getItem('timecards'));
            var dt = new Date("Time Card: Created 2016-01-05 19:58:34");
            var selTimecards = "";
            if (timecards !== null || undefined) {
                for (var i = 0; i < timecards.length; i++) {
                    console.log((new Date(timecards[i].sys_created_on)));
                }
                return selTimecards;
            } else {
                return selTimecards;
            }
        }

        function getTimecardsLengthLocal() {
            var timecards = getTimecardsLocal();
            if (timecards !== null || undefined) {
                return timecards.length;
            } else {
                return 0;
            }
        }

        function getTimecardNumberByID(sys_id) {
            var timecardNumber = "";
            var timecards = getTimecardsLocal();
            if (timecards !== null || undefined) {
                for (var i = 0; i < timecards.length; i++) {
                    if (timecards[i].sys_id == sys_id) {
                        timecardNumber = timecards[i].u_number;
                    }
                }
                return timecardNumber;
            } else {
                return timecardNumber;
            }
        }

        function deleteTimecardLocalByID(sys_id) {
            var timecards = getTimecardsLocal();
            for (var i = 0; i < timecards.length; i++) {
                if (timecards[i].sys_id == sys_id) {
                    timecards.splice(i, 1);
                }
            }
            setTimecardsLocal(timecards);
            return true;
        }

        function clearAllTimecardsLocal() {
            localStorage.setItem('timecards', []);
        }
        // Approvals
        function setApprovalsLocal(result) {
            if (result) {
                localStorage.setItem('approvals', JSON.stringify(result));
            } else {
                localStorage.setItem('approvals', []);
            }
            return true;
        }

        function getApprovalsLocal() {
            var approvals = JSON.parse(localStorage.getItem('approvals'));
            if (approvals !== null || undefined) {
                return approvals;
            } else {
                return [];
            }
        }

        function getApprovalsLengthLocal() {
            var approvals = getApprovalsLocal();
            if (approvals !== null || undefined) {
                return approvals.length;
            } else {
                return 0;
            }
        }

        function deleteApprovalBySysID(sys_id) {
            var approvals = getApprovalsLocal();
            for (var i = 0; i < approvals.length; i++) {
                if (approvals[i].sys_id == sys_id) {
                    approvals.splice(i, 1);
                }
            }
            setApprovalsLocal(approvals);
            return true;
        }
        // remove all items in localstorage (projects, tasks, stories, timecards, approvals)
        function clearAllItems() {
            localStorage.removeItem('projects');
            localStorage.removeItem('tasks');
            localStorage.removeItem('stories');
            localStorage.removeItem('timecards');
            localStorage.removeItem('approvals');
            localStorage.removeItem('customers');
            localStorage.removeItem('resourceplans');
            return true;
        }
        // return function api 
        return {
            // Resource Plans
            setResourcePlans: setResourcePlans,
            getResourcePlansLocal: getResourcePlansLocal,
            // Projects 
            setProjectsLocal: setProjectsLocal,
            getProjectsLocal: getProjectsLocal,
            getProjectNumberBySysID: getProjectNumberBySysID,
            getProjectNameBySysID: getProjectNameBySysID,
            getProjectsLengthLocal: getProjectsLengthLocal,
            // customers
            setCustomersLocal: setCustomersLocal,
            getCustomersLocal: getCustomersLocal,
            getCustomerNameBySysID: getCustomerNameBySysID,
            // Tasks
            setTasksLocal: setTasksLocal,
            getTasksLocal: getTasksLocal,
            getTaskNumberBySysID: getTaskNumberBySysID,
            getTaskNameBySysID: getTaskNameBySysID,
            getTasksLengthLocal: getTasksLengthLocal,
            // Stories
            setStoriesLocal: setStoriesLocal,
            getStoriesLocal: getStoriesLocal,
            getStoryNumberBySysID: getStoryNumberBySysID,
            getStoryNameBySysID: getStoryNameBySysID,
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
            // Approvals
            setApprovalsLocal: setApprovalsLocal,
            getApprovalsLocal: getApprovalsLocal,
            getApprovalsLengthLocal: getApprovalsLengthLocal,
            deleteApprovalBySysID: deleteApprovalBySysID,
            // clear all items (Projects, Tasks, Stories, Timecards, Approvals)
            clearAllItems: clearAllItems
        };
    })
    // Network Service
    .factory('connectivityMonitorService', function($rootScope, $cordovaNetwork) {
        return {
            isOnline: function() {
                if (ionic.Platform.isWebView()) {
                    return $cordovaNetwork.isOnline();
                } else {
                    return navigator.onLine;
                }
            },
            isOffline: function() {
                if (ionic.Platform.isWebView()) {
                    return !$cordovaNetwork.isOnline();
                } else {
                    return !navigator.onLine;
                }
            },
            startWatching: function() {
                if (ionic.Platform.isWebView()) {

                    $rootScope.$on('$cordovaNetwork:online', function(event, networkState) {
                        console.log("went online");
                    });

                    $rootScope.$on('$cordovaNetwork:offline', function(event, networkState) {
                        console.log("went offline");
                    });

                } else {
                    window.addEventListener("online", function(e) {
                        console.log("went online");
                    }, false);

                    window.addEventListener("offline", function(e) {
                        console.log("went offline");
                    }, false);
                }
            }
        };
    })
    .factory('MessageService', function() {
        return {
            getNoNetworkMessage: function() {
                $ionicPopup.confirm({
                        title: "No connectivity",
                        content: "App running in offline mode"
                    })
                    .then(function(result) {
                        if (!result) {
                            ionic.Platform.exitApp();
                        }
                    });
            }
        };
    });
