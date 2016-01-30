angular.module('starter.controllers', [])
    .constant('daysWeek', {
        'weekDays': ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        'weekDaysShort': ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
        'weekStart': 0, // sunday 
        'weekEnd': 6 // saturday
    })
    // Timecard Categories for field "Category"
    .constant('timeCardCategories', [{
        name: 'Training',
        value: 'training'
    }, {
        name: 'Task Work',
        value: 'task_work'
    }, {
        name: 'Admin',
        value: 'admin'
    }, {
        name: 'Meeting',
        value: 'meeting'
    }, {
        name: 'KTLO',
        value: 'ktlo'
    }, {
        name: 'Out of office',
        value: 'ooo'
    }, {
        name: 'External Labor',
        value: 'external_labor'
    }, {
        name: 'Time Off',
        value: 'time_off'
    }, {
        name: 'Appointment',
        value: 'appointment'
    }, {
        name: 'Phone Call',
        value: 'call'
    }])
    // Timecard States for field "State"
    .constant('timeCardStates', ['Pending', 'Submitted', 'Approved', 'Rejected', 'Processed', 'Re-submitted'])
    // re-usable methods like getNumberByID for Projects,Tasks,Stories,Timecards
    // phase 2 (app release )- revision updates 
    // .constant('FunctionalMethods', {})
    .controller('AppCtrl', function($scope, $state, $timeout, $ionicLoading, $rootScope, snService, LocalStorageService, UserService) {
        $scope.$on('$ionicView.enter', function() {
            $scope.projectLength = LocalStorageService.getProjectsLengthLocal();
            $scope.tasksLength = LocalStorageService.getTasksLengthLocal();
            $scope.storiesLength = LocalStorageService.getStoriesLengthLocal();
            $scope.timecardsLength = LocalStorageService.getTimecardsLengthLocal();
            // User Details
            $scope.userName = UserService.getUser().user_id;
            $scope.userEmail = UserService.getUser().email;
        });
    })
    // Home view 
    .controller('HomeCtrl', function($scope, $state, $ionicLoading, moment, snService, LocalStorageService, daysWeek) {
        // calculate number hours for day, weekly, monthly
        $scope.totalHrsDay = 0.00;
        $scope.totalHrsWeekly = 0;
        $scope.totalHrsMonthly = 0.00;
        $scope.selDate = new Date();
        // selected date of day in a week (sun:0, mon:1..,)
        $scope.selDay = $scope.selDate.getDay(); // 0 - 7
        $scope.selDayName = daysWeek.weekDays[$scope.selDay]; // sunday, monday
        $scope.selDateMonth = $scope.selDate.getMonth(); // 0-january, 11- December
        $scope.todayTCS = []; // current day timecards (Today - List)
        $scope.hideSpinner = false;
        // get total hours for current day and week
        function getTotalHrsDayWeek() {
            if ($scope.selDay === 0) {
                var sundayDateSun = moment($scope.selDate).format("YYYY-MM-DD"); // 2012-11-22
                var tcsSun = LocalStorageService.getTimecardsByDateLocalForCharts(sundayDateSun); // because weeks starts on sunday
                processTimecards(tcsSun);
            } else {
                var sundayDate = moment($scope.selDate).subtract($scope.selDay, 'days').format("YYYY-MM-DD"); // 2012-11-22
                var tcs = LocalStorageService.getTimecardsByDateLocalForCharts(sundayDate);
                processTimecards(tcs);
            }
        }

        function processTimecards(tcs) {
            var Ptimecards = [];
            for (i = 0; i < tcs.length; i++) {
                $scope.totalHrsWeekly += Number(tcs[i].total);
                if (tcs[i][$scope.selDayName] !== 0) {
                    $scope.totalHrsDay += Number(tcs[i][$scope.selDayName]);
                }
                if (tcs[i][$scope.selDayName] !== 0 && tcs[i].state == "Pending") {
                    var set = {};
                    set.selDate = new Date($scope.selDate);
                    if (tcs[i].sys_id) set.sys_id = tcs[i].sys_id;
                    if (tcs[i].task) set.task = LocalStorageService.getTaskNumberBySysID(tcs[i].task.value);
                    if (tcs[i].u_story) set.story = LocalStorageService.getStoryNumberBySysID(tcs[i].u_story.value);
                    if (tcs[i].u_project) set.project = LocalStorageService.getProjectNameBySysID(tcs[i].u_project.value);
                    if (tcs[i][$scope.selDayName]) set.hours = tcs[i][$scope.selDayName] || 0;
                    Ptimecards.push(set);
                }
            }
            $scope.todayTCS = Ptimecards;
            processChartData(tcs);
        }
        // get chart data 
        function processChartData(tcs) {
            //console.log(tcs);
            var sunday = 0,
                monday = 0,
                tuesday = 0,
                wednesday = 0,
                thursday = 0,
                friday = 0,
                saturday = 0;
            for (i = 0; i < tcs.length; i++) {
                if (tcs[i].sunday) {
                    sunday += Number(tcs[i].sunday);
                }
                if (tcs[i].monday) {
                    monday += Number(tcs[i].monday);
                }
                if (tcs[i].tuesday) {
                    tuesday += Number(tcs[i].tuesday);
                }
                if (tcs[i].wednesday) {
                    wednesday += Number(tcs[i].wednesday);
                }
                if (tcs[i].thursday) {
                    thursday += Number(tcs[i].thursday);
                }
                if (tcs[i].friday) {
                    friday += Number(tcs[i].friday);
                }
                if (tcs[i].saturday) {
                    saturday += Number(tcs[i].saturday);
                }
            }
            $scope.data.push([sunday, monday, tuesday, wednesday, thursday, friday, saturday]);
        }
        // total hours for current month
        function getTotalHrsMonth() {
            var tc = LocalStorageService.getTimecardsByMonthYearLocal($scope.selDate);
            for (var i = 0; i < tc.length; i++) {
                if (tc[i].total) {
                    $scope.totalHrsMonthly += Number(tc[i].total);
                }
            }
        }
        $scope.routeEditCard = function(sys_id) {
            //ref="#/app/editCard/:{{tc.sys_id}}/:{{selDate}}"
            $state.go('app.editCard', {
                param1: sys_id,
                param2: $scope.selDate
            });
        };
        // Bar charts
        $scope.labels = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        $scope.series = ['hrs'];
        $scope.data = [];
        $scope.colors = [{
            "fillColor": "rgba(224, 108, 112, 1)",
            "strokeColor": "rgba(207,100,103,1)",
            "pointColor": "rgba(220,220,220,1)",
            "pointStrokeColor": "#fff",
            "pointHighlightFill": "#fff",
            "pointHighlightStroke": "rgba(151,187,205,0.8)"
        }];
        // on bar chat click, get click date and do some coniditional ops and pass date as param to timecardpanel ctrl
        $scope.onClick = function(e) {
            var clickedDate = "";
            var cDay = e[0].label;
            var chartDayNum = $scope.labels.indexOf(cDay);
            // if condition met set selected date as clicked date
            if (chartDayNum == $scope.selDay) {
                clickedDate = $scope.selDate;
            }
            // if condition met add moment days to current date
            if (chartDayNum > $scope.selDay) {
                clickedDate = moment($scope.selDate).add(chartDayNum - $scope.selDay, 'days')._d;
            }
            // if condition met subtract moment days to current date
            if (chartDayNum < $scope.selDay) {
                clickedDate = moment($scope.selDate).subtract($scope.selDay - chartDayNum, 'days')._d;
            }
            $state.go('app.timecardPanelDateView', {
                'param1': clickedDate
            }, {
                reload: true
            });
        };
        // state management 
        $scope.$on('$ionicView.loaded', function() {
            $scope.hideSpinner = true;
            snService.getTimecards()
                .then(function(data) {
                    snService.getApprovals()
                        .then(function(data) {
                            // clear existing data in variables 
                            $scope.totalHrsDay = 0;
                            $scope.totalHrsWeekly = 0;
                            $scope.totalHrsMonthly = 0;
                            $scope.data = [];
                            // init functions 
                            getTotalHrsDayWeek(); // get total hours for current day, week
                            getTotalHrsMonth(); // get total hours for current month
                            console.log('loaded and done');
                            $scope.hideSpinner = false; // hide the spinner after data refreshed for timecards and approvals 
                        }, function(error) {
                            console.log(error);
                        });
                }, function(error) {
                    console.log(error);
                });
        });
        $scope.$on('$ionicView.enter', function() {
            $scope.data = [];
            getTotalHrsDayWeek(); // get total hours for current day, week
            getTotalHrsMonth(); // get total hours for current month
        });
        $scope.$on('$ionicView.leave', function() {
            $scope.totalHrsDay = 0;
            $scope.totalHrsWeekly = 0;
            $scope.totalHrsMonthly = 0;
            $scope.data = [];
        });
    })
    // Login View
    .controller('loginCtrl', function($scope, $state, $cordovaToast, $ionicSideMenuDelegate, $stateParams, $ionicSlideBoxDelegate, LoginService, snService, LocalStorageService, LogoutService) {
        console.log('clicked');
        $scope.loginData = {};
        // clear all localStorage
        LogoutService.clearAll();
        // hide side menu
        $ionicSideMenuDelegate.canDragContent(false);
        if ($stateParams.param1) {
            $scope.loginStatus = "Re-login";
        } else {
            $scope.loginStatus = "login";
        }
        // login function 
        $scope.doLogin = function() {
            // call login service "LoginService"
            $scope.loginStatus = "Logging in";
            LoginService.doLogin($scope.loginData.username, $scope.loginData.password);
        };
        // on ionic view leave enable sidemenu drag content
        $scope.$on('$ionicView.leave', function() {
            $ionicSideMenuDelegate.canDragContent(true);
        });
    })
    // no network controller
    .controller('nonetworkCtrl', function($scope, $state, $cordovaNetwork) {
        console.log('no network');
    })
    // Time tab for Today (or) Selected , this week (depending on current and selected date) 
    .controller('timeCardsPanelCtrl', function($scope, $cordovaToast, $ionicPlatform, $ionicHistory, $state, $stateParams, $ionicTabsDelegate, $ionicModal, moment, daysWeek, LocalStorageService) {
        // on view enter
        $scope.$on('$ionicView.enter', function(e) {
            // footer item-right varibles 
            $scope.totalHrsDay = 0;
            $scope.totalHrsWeekly = 0;
            // passDate if any params set the current date as passed date from chart click
            // else select current date as selected date 
            if ($stateParams.param1) {
                //console.log('passed Date timeCardsPanelCtrl' + $stateParams.param1);
                console.log('stateParams' + $stateParams.param1);
                $scope.selDate = new Date($stateParams.param1);
            } else {
                // selected date for Time cards
                $scope.selDate = new Date();
            }
            // selected week by selected date
            $scope.selThisWeek = [];
            // selected date of day in a week (sun:0, mon:1..,)
            $scope.selDay = $scope.selDate.getDay(); // 0 - 7
            $scope.selDayName = daysWeek.weekDays[$scope.selDay]; // sunday, monday
            // Timecards for "Today or Selected " date or day 
            $scope.timecards = [];
            // ionic view state management
            getTimecardsDate();
            onDayChanged();
        });
        // on view leave
        $scope.$on('$ionicView.leave', function(e) {
            $scope.timecards = [];
            $scope.selThisWeek = [];
        });
        // get all Timecards by start of the week (Sunday) by calculating present day
        function getTimecardsDate() {
            if ($scope.selDay === 0) {
                // becuase selDay === 0  "it is sunday and day of week start"
                var sundayDateSun = moment($scope.selDate).format("YYYY-MM-DD"); // 2012-11-22
                var tcsSun = LocalStorageService.getTimecardsByDateLocal(sundayDateSun); // because weeks starts on sunday
                processTimecards(tcsSun);
            } else {
                var sundayDate = moment($scope.selDate).subtract($scope.selDay, 'days').format("YYYY-MM-DD"); // 2012-11-22
                var tcs = LocalStorageService.getTimecardsByDateLocal(sundayDate);
                processTimecards(tcs);
            }
        }
        // process timecards by adding more details after retrieving TC from LocalStorage
        function processTimecards(tcs) {
            var Ptimecards = [];
            $scope.totalHrsDay = 0;
            for (i = 0; i < tcs.length; i++) {
                if (tcs[i][$scope.selDayName] !== 0) { // Ex: tcs.tuesday!= 0
                    var set = {};
                    set.selDate = new Date($scope.selDate);
                    if (tcs[i].sys_id) set.sys_id = tcs[i].sys_id;
                    //if (tcs[i].u_project) set.u_project = tcs[i].u_project.value;
                    if (tcs[i].u_project) set.u_project = LocalStorageService.getProjectNameBySysID(tcs[i].u_project.value);
                    //if (tcs[i].task) set.task = tcs[i].task.value;
                    if (tcs[i].task) set.task = LocalStorageService.getTaskNumberBySysID(tcs[i].task.value);
                    if (tcs[i].u_story) set.story = LocalStorageService.getStoryNumberBySysID(tcs[i].u_story.value);
                    if (tcs[i].u_billable) set.u_billable = tcs[i].u_billable;
                    if (tcs[i].category) set.category = tcs[i].category;
                    // timecard.sunday =  3 hrs;
                    if (tcs[i][$scope.selDayName]) set.hours = tcs[i][$scope.selDayName] || 0;
                    // get Total hours for current or selected date or day 
                    $scope.totalHrsDay += Number(set.hours);
                    // timecard.u_saturday_work_notes (work notes)
                    if (tcs[i]["u_" + $scope.selDayName + "_work_notes"]) set.comments = tcs[i]["u_" + $scope.selDayName + "_work_notes"];
                    if (tcs[i].state) set.state = tcs[i].state;
                    Ptimecards.push(set);
                }
            }
            $scope.timecards = Ptimecards;
        }
        // on Day changed from calendar reset selDay, and call weeks methods for arranging "weekly" tab
        function onDayChanged() {
            var daysBefore, dayAfter;
            if ($scope.selDay === 0) {
                $scope.selThisWeek = getDaysInWeekBySelDate($scope.selDay, '');
            } else {
                $scope.selThisWeek = getDaysInWeekBySelDate($scope.selDay, daysWeek.weekEnd - $scope.selDay);
            }
            $scope.selDayName = daysWeek.weekDays[$scope.selDay]; // sunday, monday
        }
        // get all days in week from sunday to saturday by selected or current date
        // get all dates after specified or selected date excluding selected date
        function getAfterDays(arr, after) {
            for (var i = 1; i <= after; i++) {
                arr.push((moment($scope.selDate).add(i, 'days'))._d);
            }
            return arr;
        }
        // get all dates before specified or selected date including selected date
        function getBeforeDays(callback, before, after) {
            var arr = [];
            for (var i = 0; i <= before; i++) {
                arr.push((moment($scope.selDate).subtract(i, 'days'))._d);
            }
            return callback(arr.reverse(), after);
        }

        function getDaysInWeekBySelDate(before, after) {
            var week = [];
            var weekEnd = daysWeek.weekEnd;
            //if before:value is zero get all days in week, i.e sunday to saturday 
            if (before === 0) {
                for (i = 0; i <= weekEnd; i++) {
                    week.push((moment($scope.selDate).add(i, 'days'))._d);
                }
                return week;
            } else {
                return getBeforeDays(getAfterDays, before, after);
            }
        }
        $scope.refreshCards = function() {
            getTimecardsDate();
        };

        // Weekly Tab
        // get hours for timecard day 
        $scope.getHoursDay = function(day) {
            var dayNumber = day.getDay(); // 0 - 7
            var dayName = daysWeek.weekDays[dayNumber]; // sunday, monday
            if (dayNumber === 0) {
                var sundayDateSun = moment(day).format("YYYY-MM-DD");
                var tcsSun = LocalStorageService.getTimecardsByDateLocal(sundayDateSun); // because week starts on sunday
                return processTimecardsForHours(tcsSun, dayName); // get hours for all timecards by date  
            } else {
                var sundayDate = moment($scope.selDate).subtract($scope.selDay, 'days').format("YYYY-MM-DD"); // 2012-11-22
                var tcs = LocalStorageService.getTimecardsByDateLocal(sundayDate);
                return processTimecardsForHours(tcs, dayName); // get hours for all timecards by date
            }
        };
        // get hours for each day in entire week
        function processTimecardsForHours(tcs, dayName) { // ([timecard.obj,timecard.obj], saturday)
            var hrs = 0;
            for (var i = 0; i < tcs.length; i++) {
                if (tcs[i][dayName] !== 0) {
                    hrs += Number(tcs[i][dayName]);
                }
            }
            return hrs;
        }
        // set $scope.totalHrsWeekly 
        $scope.totalWeek = function(hrs) {
            $scope.totalHrsWeekly += hrs;
        };
        // set date for current view and navigate to "Day" tab
        $scope.setDateFromWeekly = function(day) {
            $scope.selDate = new Date(day);
            $scope.selDay = $scope.selDate.getDay();
            $scope.selDayName = daysWeek.weekDays[$scope.selDay];
            // as selected date changes call DayChanged function to change date array
            onDayChanged();
            getTimecardsDate();
            // navigate to first "Day" tab with selected date as current selected date
            $scope.totalHrsWeekly = 0; // on weekly tab moves to day tab, make weekly to zero as default
            $ionicTabsDelegate.select(0); // load "Day" tab with clicked date on weekly 
        };
        // calendar config object
        $scope.datepickerObject = {
            todayLabel: 'Today',
            closeLabel: 'Close',
            setLabel: 'Set',
            setButtonType: 'button-positive',
            todayButtonType: 'button-positive',
            closeButtonType: 'button-positive',
            inputDate: new Date(),
            mondayFirst: false, // starting of the week is sunday  (0 {suday}-6{saturday})
            templateType: 'popup',
            showTodayButton: 'true',
            modalHeaderColor: 'bar-positive',
            modalFooterColor: 'bar-positive',
            callback: function(val) { //Mandatory 
                datePickerCallback(val);
            },
            dateFormat: 'dd-MM-yyyy',
            closeOnSelect: true
        };
        // get calendar popup
        $scope.getCalendar = function() {
            //console.log('getCalendar');
        };
        // functional Libs
        var datePickerCallback = function(val) {
            if (typeof(val) === 'undefined') {
                console.log('No date selected');
            } else {
                $scope.selDate = new Date(val);
                $scope.selDay = $scope.selDate.getDay();
                $scope.selDayName = daysWeek.weekDays[$scope.selDay];
                // as selected date changes call DayChanged function to change date array
                onDayChanged();
                getTimecardsDate();
                $ionicTabsDelegate.select(0);
            }
        };
        // route to new Timecard View (create new timecard)
        $scope.routeCard = function() {
            $state.go('app.card', {
                param1: $scope.selDate // current (or) selected date 
            });
        };
        // route to editTimecard view (for editing existing record)
        $scope.routeEditCard = function(sys_id) {
            //ref="#/app/editCard/:{{tc.sys_id}}/:{{selDate}}"
            $state.go('app.editCard', {
                param1: sys_id,
                param2: $scope.selDate
            });
        };
    })
    // create new Timecard 
    .controller('cardCtrl', function($scope, $state, $filter, $ionicLoading, $stateParams, $cordovaToast, moment, daysWeek, snService, timeCardCategories, LocalStorageService, UserService) {
        // varibles
        $scope.cards = [];
        $scope.projects = LocalStorageService.getProjectsLocal();
        $scope.tasks = LocalStorageService.getTasksLocal();
        $scope.stories = LocalStorageService.getStoriesLocal();
        $scope.category = timeCardCategories;
        // timecard model
        $scope.tc = {
            'passDate': new Date($stateParams.param1),
            'task': '',
            'u_project': '',
            'category': '',
            'hours': '',
            'u_billable': '',
            'comments': '',
            'story': ''
        };
        // footer buttons  (save,submit,reset)
        $scope.saveTC = function() {
            var dayNum = $scope.tc.passDate.getDay();
            var _day = daysWeek.weekDays[dayNum];
            var _dayNotesKey = "u_" + _day + "_work_notes";
            var data = {};
            // "week_starts_on": "2015-11-22", [yyyy-MM-dd]
            var generateWeekStartsOn = function() {
                var weekStartOn = (moment($scope.tc.passDate).subtract(dayNum, 'days'))._d;
                return weekStartOn;
            };
            // show loading icon 
            $ionicLoading.show();
            data.task = $scope.tc.task;
            data.u_story = $scope.tc.story;
            data[_day] = $scope.tc.hours;
            data[_dayNotesKey] = $scope.tc.comments;
            data.u_project = $scope.tc.u_project;
            data.u_billable = $scope.tc.u_billable;
            data.category = $scope.tc.category;
            data.user = UserService.getUser().sys_id;
            data.sys_created_by = UserService.getUser().user_id;

            // console.log(data);
            //insert  new Timecard into Servicenow
            snService.insertTimecard(data)
                .then(function(result) {
                    console.log(result); // response after insert timecard
                    // internal toast message
                    var msg = "Timecard Created";
                    // hide loading icon 
                    $ionicLoading.hide();
                    // show toast notification and navigate 
                    $cordovaToast.showLongTop(msg).then(function(success) {
                        $state.go('app.timecardPanel', {}, {
                            reload: true
                        });
                    }, function(error) {
                        console.log(error);
                    });
                }, function(error) {
                    console.log(error); // error
                });
        };
        $scope.resetTC = function() {
            $scope.tc = {
                'passDate': new Date($stateParams.param1),
                'task': '',
                'u_project': '',
                'category': '',
                'hours': '',
                'u_billable': '',
                'comments': '',
                'story': ''
            };
        };
    })
    // edit existing Timecard 
    .controller('editCardCtrl', function($scope, $state, $stateParams, $ionicLoading, $ionicHistory, $cordovaToast, moment, daysWeek, snService, timeCardCategories, timeCardStates, LocalStorageService, UserService) {
        // controller for edit Timecard
        // scoped variables 
        $scope.projects = LocalStorageService.getProjectsLocal();
        $scope.tasks = LocalStorageService.getTasksLocal();
        $scope.stories = LocalStorageService.getStoriesLocal();
        $scope.category = timeCardCategories;
        $scope.states = timeCardStates;
        // current timecard model 
        $scope.tc = {};

        function getTimecardDetails() {
            var tc = LocalStorageService.getTimecardByID($stateParams.param1); // param1: sys_id
            var paramDate = $stateParams.param2; // param2: passed date (Thu Jan 14 2016 00:00:00 GMT+0530 (IST))
            processTimecard(tc, paramDate, $stateParams.param1);
        }
        getTimecardDetails();

        function processTimecard(tc, paramDate, sys_id) {
            var set = {};
            if (tc) {
                set.passDate = new Date(paramDate);
                if (tc[daysWeek.weekDays[set.passDate.getDay()]]) set.hours = tc[daysWeek.weekDays[set.passDate.getDay()]];
                if (tc.u_project) set.u_project = tc.u_project.value;
                if (tc.task) set.task = tc.task.value;
                if (tc.u_story) set.story = tc.u_story.value;
                if (tc.category) set.category = tc.category;
                if (tc.state) set.state = tc.state;
                if (tc.u_billable) set.u_billable = tc.u_billable;
                var worknotes = "u_" + daysWeek.weekDays[set.passDate.getDay()] + "_work_notes";
                if (tc[worknotes]) set.comments = tc[worknotes];
                set.day = daysWeek.weekDays[set.passDate.getDay()];
                set.sys_id = sys_id;
            }
            $scope.tc = set;
            //console.log($scope.tc);
        }
        $scope.changeBillable = function() {
            $scope.tc.u_billable = !$scope.tc.u_billable;
        };
        $scope.updateTC = function() {
            var notes = "u_" + $scope.tc.day + "_work_notes";
            var timecard = {};
            // show loading icon 
            $ionicLoading.show();

            if ($scope.tc.u_project) timecard.u_project = $scope.tc.u_project;
            if ($scope.tc.task) timecard.task = $scope.tc.task;
            if ($scope.tc.story) timecard.u_story = $scope.tc.story;
            if ($scope.tc.category) timecard.category = $scope.tc.category;
            if ($scope.tc.state) timecard.state = $scope.tc.state;
            timecard.u_billable = $scope.tc.u_billable;
            if ($scope.tc.comments) timecard[notes] = $scope.tc.comments;
            if ($scope.tc.hours) timecard[$scope.tc.day] = $scope.tc.hours;
            //console.log(timecard, $scope.tc.sys_id);
            snService.updateTimecard($scope.tc.sys_id, timecard)
                .then(function(result) {
                    console.log(result);
                    var msg = "Timecard Updated"; // local toast notification
                    // $state.go('app.timecardPanel', {}, {
                    //     reload: true
                    // });
                    // hide loading icon 
                    $ionicLoading.hide();
                    // show internal toast notification
                    $cordovaToast.showLongTop(msg).then(function(success) {
                        $ionicHistory.goBack();
                    }, function(error) {
                        console.log(error);
                    });
                }, function(error) {
                    console.log(error);
                });
        };
        $scope.resetTC = function() {
            $scope.tc = {};
        };
        // state views 
        $scope.$on('$ionicView.leave', function(e) {
            $scope.tc = {};
        });
    })
    // Status Tab
    .controller('statusCtrl', function($scope, $state, $ionicTabsDelegate, $ionicLoading, $ionicPopup, $cordovaToast, $timeout, moment, snService, LocalStorageService) {
        $scope.rejected = 0;
        $scope.pending = 0;
        $scope.submitted = 0;
        $scope.approvedProcessed = 0;
        // on-view enter
        $scope.$on('$ionicView.enter', function(e) {
            // Timecards
            $scope.timecards = LocalStorageService.getTimecardsLocal();
            // process timecards 
            function preProcess() {
                for (var i = 0; i < $scope.timecards.length; i++) {
                    if ($scope.timecards[i].state === "Pending") {
                        $scope.pending++;
                    } else if ($scope.timecards[i].state === "Submitted") {
                        $scope.submitted++;
                    } else if ($scope.timecards[i].state === "Rejected") {
                        $scope.rejected++;
                    } else if ($scope.timecards[i].state === "Approved" || "Processed") {
                        $scope.approvedProcessed++;
                    }
                }
            }
            preProcess();
        });
        // on-view leave
        $scope.$on('$ionicView.leave', function(e) {
            $scope.timecards = "";
        });
        // functional Methods (Projects, Tasks, Stories)
        $scope.getProjectNumberBySysID = function(sys_id) {
            return LocalStorageService.getProjectNumberBySysID(sys_id);
        };
        $scope.getTaskNumberBySysID = function(sys_id) {
            return LocalStorageService.getTaskNumberBySysID(sys_id);
        };
        $scope.getStoryNumberBySysID = function(sys_id) {
            return LocalStorageService.getStoryNumberBySysID(sys_id);
        };
        // submit timecard and refresh timecard local storage and current view
        $scope.submitTimecard = function(sys_id) {
            $ionicPopup.confirm({
                title: 'Confirm Submission',
                template: 'Do you want to submit Timecard:' + LocalStorageService.getTimecardNumberByID(sys_id),
                scope: $scope,
                buttons: [{
                    text: 'Cancel'
                }, {
                    text: 'Yes',
                    type: 'button-positive',
                    onTap: function(e) {
                        // show loading icon 
                        $ionicLoading.show();
                        snService.submitTimecard(sys_id)
                            .then(function(data) {
                                //console.log(data);
                                var msg = "Timecard Submitted"; // local toast notifications

                                // hide loading icon 
                                $ionicLoading.hide();
                                // show toast notification and navigate
                                $cordovaToast.showLongTop(msg).then(function(success) {
                                    $state.go("app.statusPanel", {}, {
                                        reload: true
                                    });
                                }, function(error) {
                                    console.log(error);
                                });
                            }, function(error) {
                                console.log(error);
                            });
                    }
                }]
            });
        };
        // delete timecard and refresh timecard local storage and refresh current view 
        $scope.deleteTimecard = function(sys_id) {
            $ionicPopup.confirm({
                title: 'Confirm Delete',
                template: 'Do you want to Delete Timecard:' + LocalStorageService.getTimecardNumberByID(sys_id),
                scope: $scope,
                buttons: [{
                    text: 'Cancel'
                }, {
                    text: 'Yes',
                    type: 'button-positive',
                    onTap: function(e) {
                        // show loading icon 
                        $ionicLoading.show();
                        snService.deleteTimecard(sys_id)
                            .then(function(result) {
                                console.log(result);
                                var msg = "Timecard deleted"; // local toast notifications
                                // hide loading icon 
                                $ionicLoading.hide();
                                // show toast notification and navigate 
                                $cordovaToast.showLongTop(msg).then(function(success) {
                                    $state.go("app.statusPanel", {}, {
                                        reload: true
                                    });
                                }, function(error) {
                                    console.log(error);
                                });

                            }, function(error) {
                                console.log(error);
                            });
                    }
                }]
            });
        };
        // refresh timecards, button on nav-header
        $scope.refreshTimecards = function() {
            snService.getTimecards()
                .then(function(result) {
                    //console.log(result);
                    LocalStorageService.setTimecardsLocal(result);
                    $scope.timecards = LocalStorageService.getTimecardsLocal();
                }, function(error) {
                    console.log(error);
                });
        };

        // toggle group for pending toggle code 
        // if given group is the selected group, deselect it, else select the given group
        $scope.toggleGroupPen = function(timecard) {
            if ($scope.isGroupShownPen(timecard)) {
                $scope.shownGroupPen = null;
            } else {
                $scope.shownGroupPen = timecard;
            }
        };
        $scope.isGroupShownPen = function(timecard) {
            return $scope.shownGroupPen === timecard;
        };

        // toggle group for Submitted toggle code
        // if given group is the selected group, deselect it, else select the given group
        $scope.toggleGroupSub = function(timecard) {
            if ($scope.isGroupShownSub(timecard)) {
                $scope.shownGroupSub = null;
            } else {
                $scope.shownGroupSub = timecard;
            }
        };
        $scope.isGroupShownSub = function(timecard) {
            return $scope.shownGroupSub === timecard;
        };
        // toggle group for Approved
        // if given group is the selected group, deselect it, else select the given group
        $scope.toggleGroupApp = function(timecard) {
            if ($scope.isGroupShownApp(timecard)) {
                $scope.shownGroupApp = null;
            } else {
                $scope.shownGroupApp = timecard;
            }
        };
        $scope.isGroupShownApp = function(timecard) {
            return $scope.shownGroupApp === timecard;
        };
        // toggle group for Rejected
        // if given group is the selected group, deselect it, else select the given group
        $scope.toggleGroupRej = function(timecard) {
            if ($scope.isGroupShownRej(timecard)) {
                $scope.shownGroupRej = null;
            } else {
                $scope.shownGroupRej = timecard;
            }
        };
        $scope.isGroupShownRej = function(timecard) {
            return $scope.shownGroupRej === timecard;
        };
    })
    // approvals Tab  
    .controller('approvalsCtrl', function($scope, $state, $ionicPopup, $timeout, $ionicLoading, $cordovaToast, moment, snService, LocalStorageService) {

        $scope.$on('$ionicView.enter', function(e) {
            var set = LocalStorageService.getApprovalsLocal();
            $scope.approvals = [];
            $ionicLoading.show();
            for (var i = 0; i < set.length; i++) {
                var app = {};
                var timecard = LocalStorageService.getTimecardByID(set[i].document_id.value);
                if (Object.keys(timecard).length) {
                    $scope.approvals.push(processAndReturn(timecard, set[i]));
                } else {
                    snService.getTimecardBySysID(set[i])
                        .then(function(data) {
                            $scope.approvals.push(processAndReturn(data));
                            $ionicLoading.hide();
                        });
                }
            }
            // process and return timecard sets 
            function processAndReturn(time, set) {
                var app = {};

                if (time.approval_id && time.approval_number) {
                    app.sys_id = time.approval_id;
                    app.u_number = time.approval_number;
                } else {
                    app.sys_id = set.sys_id;
                    app.u_number = set.u_number;
                }
                app.sys_created_on = time.sys_created_on;
                app.tc_submitted_by = time.user;
                app.tc_total = time.total;
                app.tc_state = time.state;
                if (time.u_project.value) {
                    var projectName = LocalStorageService.getProjectNameBySysID(time.u_project.value);
                    if (projectName !== null && projectName.length > 0) {
                        app.tc_project = projectName;
                    } else {
                        snService.getProjectNameBySysID(time.u_project.value)
                            .then(function(data){
                                app.tc_project = data;
                            });
                    }
                }
                if (time.task) {
                    var taskName = LocalStorageService.getTaskNameBySysID(time.task.value);
                    if (taskName !== null && taskName.length > 0) {
                        app.tc_task = taskName;
                    } else {
                        snService.getTaskNameBySysID(time.task.value)
                            .then(function(data) {
                                app.tc_task = data;
                            });
                    }
                }
                if (time.u_story) {
                    var storyNumber = LocalStorageService.getStoryNameBySysID(time.u_story);
                    if (storyNumber !== null && storyNumber.length > 0) {
                        app.tc_story = storyNumber;
                    } else {
                        //console.log(time.u_story);
                        snService.getStoryNameBySysID(time.u_story.value)
                            .then(function(data) {
                                if (data) {
                                    app.tc_story = data;
                                }
                            });
                    }
                }
                app.tc_sun = time.sunday;
                app.tc_sun_notes = time.u_sunday_work_notes;
                app.tc_mon = time.monday;
                app.tc_mon_notes = time.u_monday_work_notes;
                app.tc_tue = time.tuesday;
                app.tc_tue_notes = time.u_tuesday_work_notes;
                app.tc_wed = time.wednesday;
                app.tc_wed_notes = time.u_wednesday_work_notes;
                app.tc_thu = time.thursday;
                app.tc_thu_notes = time.u_thursday_work_notes;
                app.tc_fri = time.friday;
                app.tc_fri_notes = time.u_friday_work_notes;
                app.tc_sat = time.saturday;
                app.tc_sat_notes = time.u_saturday_work_notes;
                return app;
            }
            // approve timecard from approvals 
        $scope.approve = function(sys_id) {
            $ionicPopup.confirm({
                title: 'Confirm Approve',
                template: 'Do you want to Approve Timecard',
                scope: $scope,
                buttons: [{
                    text: 'Cancel'
                }, {
                    text: 'Yes',
                    type: 'button-positive',
                    onTap: function(e) {
                        // show loading icon 
                        $ionicLoading.show();
                        snService.approveApprovals(sys_id)
                            .then(function(result) {
                                var msg = "Timecard Approved";
                                // hide loading icon 
                                $ionicLoading.hide();
                                // show toast notification and navigate 
                                $cordovaToast.showLongTop(msg).then(function(success) {
                                    $state.go('app.approvalsPanel', {}, {
                                        reload: true
                                    });
                                }, function(error) {
                                    console.log(error);
                                });
                            }, function(error) {
                                console.log(error);
                            });
                    }
                }]
            });
        };
        // reject timecard from approvals
        $scope.reject = function(sys_id) {
            $ionicPopup.confirm({
                title: 'Confirm Reject',
                template: 'Do you want to Reject Timecard',
                scope: $scope,
                buttons: [{
                    text: 'Cancel'
                }, {
                    text: 'Yes',
                    type: 'button-positive',
                    onTap: function(e) {
                        // show loading icon 
                        $ionicLoading.show();
                        snService.rejectApprovals(sys_id)
                            .then(function(result) {
                                var msg = "Timecard Rejected";
                                // hide loading icon 
                                $ionicLoading.hide();
                                // show toast notification and navigate 
                                $cordovaToast.showLongTop(msg).then(function(success) {
                                    $state.go('app.approvalsPanel', {}, {
                                        reload: true
                                    });
                                }, function(error) {
                                    console.log(error);
                                });
                            }, function(error) {
                                console.log(error);
                            });
                    }
                }]
            });
        };

        //show hidden timcard details 
       $scope.showDetailsToggle = false;
       $scope.showTimecardDetails = function(){
         $scope.showDetailsToggle = !$scope.showDetailsToggle;
       }

        // if given group is the selected group, deselect it, else select the given group
        $scope.toggleGroup = function(approval) {
            if ($scope.isGroupShown(approval)) {
                $scope.shownGroup = null;
                $scope.showExpand = false;
            } else {
                $scope.shownGroup = approval;
                $scope.showExpand = true;
            }
        };
        $scope.isGroupShown = function(approval) {
            return $scope.shownGroup === approval;
        };
        });

        $scope.$on('$ionicView.leave', function(e) {
            $scope.approvals = [];
        });

    })
    // side menu (Projects)
    .controller('projectsCtrl', function($scope, $state, snService, LocalStorageService) {
        $scope.$on('$ionicView.enter', function(e) {
            var projects = LocalStorageService.getProjectsLocal();
            if (projects !== null || projects.length > 0) {
                $scope.projects = projects;
            } else {
                $scope.projects = [];
            }
        });
        $scope.$on('$ionicView.leave', function(e) {
            $scope.projects = "";
        });
        // if given group is the selected group, deselect it, else select the given group
        $scope.toggleGroup = function(project) {
            if ($scope.isGroupShown(project)) {
                $scope.shownGroup = null;
            } else {
                $scope.shownGroup = project;
            }
        };
        $scope.isGroupShown = function(project) {
            return $scope.shownGroup === project;
        };
        // synchronize on user request
        $scope.syncProjects = function() {
            $scope.projects = LocalStorageService.getProjectsLocal();
        };
    })
    // side menu (Stories)
    .controller('storiesCtrl', function($scope, $state, snService, LocalStorageService) {
        var stories = LocalStorageService.getStoriesLocal();
        if (stories !== null || stories.length > 0) {
            $scope.stories = stories;
        } else {
            $scope.stories = [];
        }
        //if given group is the selected group, deselect it, else select the given group
        $scope.toggleGroup = function(story) {
            if ($scope.isGroupShown(story)) {
                $scope.shownGroup = null;
            } else {
                $scope.shownGroup = story;
            }
        };
        $scope.isGroupShown = function(story) {
            return $scope.shownGroup === story;
        };
        // synchronize on user request
        $scope.syncStories = function() {
            $scope.stories = LocalStorageService.getStoriesLocal();
        };
    })
    // side menu (Tasks)
    .controller('tasksCtrl', function($scope, $state, snService, LocalStorageService) {
        var tasks = LocalStorageService.getTasksLocal();
        if (tasks !== null || tasks.length > 0) {
            $scope.tasks = tasks;
        } else {
            $scope.tasks = [];
        }
        // if given group is the selected group, deselect it, else select the given group
        $scope.toggleGroup = function(task) {
            if ($scope.isGroupShown(task)) {
                $scope.shownGroup = null;
            } else {
                $scope.shownGroup = task;
            }
        };
        $scope.isGroupShown = function(task) {
            return $scope.shownGroup === task;
        };
        // Synchronize on user request
        $scope.syncTasks = function() {
            $scope.tasks = LocalStorageService.getTasksLocal();
        };
    })
    // sidemmenu (Timecards)
    .controller('timecardsCtrl', function($scope, $state, snService, LocalStorageService) {
        $scope.$on('$ionicView.enter', function(e) {
            var timecards = LocalStorageService.getTimecardsLocal();
            if (timecards !== null || timecards.length > 0) {
                $scope.timecards = timecards;
            } else {
                $scope.timecards = [];
            }
        });
        $scope.$on('$ionicView.leave', function(e) {
            $scope.timecards = "";
        });
        // functional methods for  project, Task, Story - Number 
        $scope.getProjectNumberBySysID = function(sys_id) {
            return LocalStorageService.getProjectNumberBySysID(sys_id);
        };
        $scope.getStoryNumberBySysID = function(sys_id) {
            return LocalStorageService.getStoryNumberBySysID(sys_id);
        };
        $scope.getTaskNumberBySysID = function(sys_id) {
            return LocalStorageService.getTaskNumberBySysID(sys_id);
        };
        // if given group is the selected group, deselect it, else select the given group
        $scope.toggleGroup = function(timecard) {
            if ($scope.isGroupShown(timecard)) {
                $scope.shownGroup = null;
            } else {
                $scope.shownGroup = timecard;
            }
        };
        $scope.isGroupShown = function(timecard) {
            return $scope.shownGroup === timecard;
        };
        // Synchronize Timecards on user request
        $scope.syncTimecards = function() {
            $scope.timecards = LocalStorageService.getTimecardsLocal();
        };
    })
    // side menu (Synchronize)
    .controller('syncCtrl', function($scope, $state, $cordovaToast, $ionicLoading, snService, LocalStorageService) {
        $scope.projects = LocalStorageService.getProjectsLengthLocal();
        $scope.tasks = LocalStorageService.getTasksLengthLocal();
        $scope.stories = LocalStorageService.getStoriesLengthLocal();
        $scope.timecards = LocalStorageService.getTimecardsLengthLocal();
        $scope.approvals = LocalStorageService.getApprovalsLengthLocal();
        // synchronize functions
        $scope.syncNow = function() {
            console.log('syncNow');
            $ionicLoading.show({
                animation: 'fade-in',
                showBackdrop: false,
                maxWidth: 200,
                showDelay: 500
            });
            // get Projects, Tasks, Stories, Timecards, Approvals 
            snService.getProjects() // projects 
                .then(function(result) {
                    //console.log(result);
                    snService.getTasks() // tasks
                        .then(function(result) {
                            //console.log(result);
                            snService.getStories() // stories 
                                .then(function(result) {
                                    //console.log(result);
                                    snService.getTimecards() // timecards
                                        .then(function(result) {
                                            //console.log(result);
                                            snService.getApprovals() // approvals 
                                                .then(function(result) {
                                                    var msg = "Sync Successful";
                                                    // console.log(result);
                                                    // hide loading
                                                    $ionicLoading.hide();
                                                    // show toast nofications and navigate
                                                    $cordovaToast.showShortTop(msg).then(function(success) {
                                                        $state.go($state.current, {}, {
                                                            reload: true
                                                        }); // reload current state 
                                                    }, function(error) {
                                                        console.log(error);
                                                    }, function(error) {
                                                        console.log(error);
                                                    });
                                                });
                                        }, function(error) {
                                            console.log(error);
                                        });
                                }, function(error) {
                                    console.log(error);
                                });
                        }, function(error) {
                            console.log(error);
                        });
                }, function(error) {
                    console.log(error);
                });
        };
    })
    // side menu (Settings)
    .controller('settingsCtrl', function($scope, $state) {
        $scope.instanceURL = "";
        $scope.saveURL = function() {};
    })
    // side menu (Accounts) and logout control
    .controller('accountsCtrl', function($scope, $state, $ionicPopup, LocalStorageService, snService, UserService, LogoutService) {
        $scope.user = UserService.getUser();
        $scope.logout = function() {
            $ionicPopup.confirm({
                title: 'Confirm Logout',
                template: 'Sure you want to logout',
                scope: $scope,
                buttons: [{
                    text: 'Cancel'
                }, {
                    text: 'Yes',
                    type: 'button-positive',
                    onTap: function(e) {
                        if (LogoutService.clearAll()) {
                            $state.go('login', {}, {
                                reload: true
                            });
                        }
                    }
                }]
            });
        };
    });
