angular.module('starter.controllers', [])
    .constant('daysWeek', {
        'weekDays': ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
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
    .constant('FunctionalMethods', {})
    .controller('AppCtrl', function($scope, $ionicModal, $timeout, snService, LocalStorageService, UserService) {
        $scope.$on('$ionicView.enter', function(e) {
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
    .controller('HomeCtrl', function($scope, $state) {
        // calculate number hours for day, weekly, monthly
        $scope.totalHrsDay = 0.00;
        $scope.totalHrsWeekly = 0.00;
        $scope.totalHrsMonthly = 0.00;
    })
    // Login View
    .controller('LoginCtrl', function($scope) {})
    // Time tab for Today (or) Selected , this week (depending on current and selected date) 
    .controller('timeCardsPanelCtrl', function($scope, $cordovaToast, $ionicPlatform, $state, $ionicTabsDelegate, $ionicModal, moment, daysWeek, LocalStorageService) { // Timecard Tab
        // footer item-right varibles 
        $scope.totalHrsDay = 0;
        $scope.totalHrsWeekly = 0;

        // selected date for Time cards
        $scope.selDate = new Date();
        // selected week by selected date
        $scope.selThisWeek = [];
        // selected date of day in a week (sun:0, mon:1..,)
        $scope.selDay = $scope.selDate.getDay(); // 0 - 7
        $scope.selDayName = daysWeek.weekDays[$scope.selDay]; // sunday, monday
        // Timecards for "Today or Selected " date or day 
        $scope.timecards = [];
        // get all Timecards by start of the week (Sunday) by calculating present day
        function getTimecardsDate() {
            if ($scope.selDay == 0) {
                var sundayDate = moment($scope.selDate).format("YYYY-MM-DD"); // 2012-11-22
                var tcs = LocalStorageService.getTimecardsByDateLocal(sundayDate); // because weeks starts on sunday
                processTimecards(tcs);
            } else {
                var sundayDate = moment($scope.selDate).subtract($scope.selDay, 'days').format("YYYY-MM-DD"); // 2012-11-22
                var tcs = LocalStorageService.getTimecardsByDateLocal(sundayDate);
                processTimecards(tcs);
            }
        };
        getTimecardsDate();
        // process timecards by adding more details after retrieving TC from LocalStorage
        function processTimecards(tcs) {
            var Ptimecards = []
            $scope.totalHrsDay = 0;
            for (i = 0; i < tcs.length; i++) {
                if (tcs[i][$scope.selDayName] != 0) { // Ex: tcs.tuesday!= 0
                    var set = {};
                    set.selDate = new Date($scope.selDate);
                    if (tcs[i].sys_id) set.sys_id = tcs[i].sys_id;
                    //if (tcs[i].u_project) set.u_project = tcs[i].u_project.value;
                    if (tcs[i].u_project) set.u_project = LocalStorageService.getProjectNumberBySysID(tcs[i].u_project.value);
                    //if (tcs[i].task) set.task = tcs[i].task.value;
                    if (tcs[i].task) set.task = LocalStorageService.getTaskNumberBySysID(tcs[i].task.value);
                    if (tcs[i].u_story) set.story = tcs[i].u_story.value;
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
        };

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
                var arr = [];
                // get all dates after specified or selected date excluding selected date
                function getAfterDays(arr) {
                    for (var i = 1; i <= after; i++) {
                        arr.push((moment($scope.selDate).add(i, 'days'))._d);
                    }
                    return arr;
                }
                // get all dates before specified or selected date including selected date
                function getBeforeDays(callback) {
                    for (var i = 0; i <= before; i++) {
                        arr.push((moment($scope.selDate).subtract(i, 'days'))._d);
                    }
                    return callback(arr.reverse());
                };
                return getBeforeDays(getAfterDays);
            }
        };
        // on Day changed from calendar reset selDay, and call weeks methods for arraging weekly
        function onDayChanged() {
            var daysBefore, dayAfter;
            if ($scope.selDay === 0) {
                $scope.selThisWeek = getDaysInWeekBySelDate($scope.selDay);
            } else {
                $scope.selThisWeek = getDaysInWeekBySelDate($scope.selDay, daysWeek.weekEnd - $scope.selDay);
            }
            $scope.selDayName = daysWeek.weekDays[$scope.selDay]; // sunday, monday
        };
        onDayChanged();
        // Weekly Tab
        // get hours for timecard day 
        $scope.getHoursDay = function(day) {
            var day = day.getDay(); // 0 - 7
            var dayName = daysWeek.weekDays[day]; // sunday, monday
            if (day == 0) {
                var sundayDate = moment(day).format("YYYY-MM-DD");
                var tcs = LocalStorageService.getTimecardsByDateLocal(sundayDate); // because week starts on sunday
                return processTimecardsForHours(tcs, dayName); // get hours for all timecards by date  
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
                if (tcs[i][dayName] != 0) {
                    hrs += Number(tcs[i][dayName]);
                }
            }
            return hrs;
        };
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
            setButtonType: 'button-assertive',
            todayButtonType: 'button-assertive',
            closeButtonType: 'button-assertive',
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
            })
        };
    })
    // create new Timecard 
    .controller('CardCtrl', function($scope, $filter, $stateParams, moment, daysWeek, snService, timeCardCategories, LocalStorageService, UserService) { // single timecard 
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
        $scope.saveTC = function() {
            var dayNum = $scope.tc.passDate.getDay();
            var _day = daysWeek.weekDays[dayNum];
            var _dayNotesKey = "u_" + _day + "_work_notes";
            // "week_starts_on": "2015-11-22", [yyyy-MM-dd]
            var generateWeekStartsOn = function() {
                var weekStartOn = (moment($scope.tc.passDate).subtract(dayNum, 'days'))._d;
                return weekStartOn;
            }
            var data = {
                //'week_starts_on': generateWeekStartsOn(),
                'task': $scope.tc.task,
                'u_story': $scope.tc.story,
                [_day]: $scope.tc.hours,
                [_dayNotesKey]: $scope.tc.comments,
                'u_project': $scope.tc.u_project,
                'u_billable': $scope.tc.u_billable,
                'category': $scope.tc.category,
                'user': UserService.getUser().sys_id,
                'sys_created_by': UserService.getUser().user_id
            };
            // console.log(data);
            //insert  new Timecard into Servicenow
            snService.insertTimecard(data)
                .then(function(result) {
                    console.log(result);
                }, function(error) {
                    console.log(result);
                })
        };
        $scope.submitTC = function() {};
        $scope.resetTC = function() {
            $scope.tc = {};
        };
    })
    // edit existing Timecard 
    .controller('editCardCtrl', function($scope, $stateParams, moment, daysWeek, snService, timeCardCategories, timeCardStates, LocalStorageService, UserService) {
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
        };
        getTimecardDetails();

        function processTimecard(tc, paramDate, sys_id) {
            var set = {};
            if (tc) {
                set.passDate = new Date(paramDate);
                if (tc[daysWeek.weekDays[set.passDate.getDay()]]) set.hours = tc[daysWeek.weekDays[set.passDate.getDay()]];
                if (tc.u_project) set.u_project = tc.u_project.value;
                if (tc.task) set.task = tc.task.value;
                if (tc.story) set.story = tc.story.value;
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
        };
        $scope.changeBillable = function() {
            $scope.tc.u_billable = !$scope.tc.u_billable;
        };
        $scope.updateTC = function() {
            var notes = "u_" + $scope.tc.day + "_work_notes";
            var timecard = {};
            if ($scope.tc.u_project) timecard.u_project = $scope.tc.u_project;
            if ($scope.tc.task) timecard.task = $scope.tc.task;
            if ($scope.tc.story) timecard.u_story = $scope.tc.story;
            if ($scope.tc.category) timecard.category = $scope.tc.category;
            if ($scope.tc.state) timecard.state = $scope.tc.state;
            timecard.u_billable = $scope.tc.u_billable;
            if ($scope.tc.comments) timecard[notes] = $scope.tc.comments;
            if ($scope.tc.hours) timecard[$scope.tc.day] = $scope.tc.hours;
            console.log(timecard, $scope.tc.sys_id);
            snService.updateTimecard($scope.tc.sys_id, timecard)
                .then(function(result) {
                    console.log(result);
                }, function(error) {
                    console.log(error);
                })
        };
        $scope.submitTC = function() {
            var notes = "u_" + $scope.tc.day + "_work_notes";
            var timecard = {};
            if ($scope.tc.u_project) timecard.u_project = $scope.tc.u_project;
            if ($scope.tc.task) timecard.task = $scope.tc.task;
            if ($scope.tc.story) timecard.u_story = $scope.tc.story;
            if ($scope.tc.category) timecard.category = $scope.tc.category;
            if ($scope.tc.state) timecard.state = "Submitted";
            timecard.u_billable = $scope.tc.u_billable;
            if ($scope.tc.comments) timecard[notes] = $scope.tc.comments;
            if ($scope.tc.hours) timecard[$scope.tc.day] = $scope.tc.hours;
            console.log(timecard, $scope.tc.sys_id);
            snService.updateTimecard($scope.tc.sys_id, timecard)
                .then(function(result) {
                    console.log(result);
                }, function(error) {
                    console.log(error);
                })
        };
        $scope.resetTC = function() {
            $scope.tc = {};
        };
    })
    // Status Tab
    .controller('statusCtrl', function($scope, $state, moment, snService, LocalStorageService) {
        $scope.rejected = 0;
        $scope.pending = 0;
        $scope.submitted = 0;
        $scope.approvedProcessed = 0;
        // Timecards
        $scope.timecards = LocalStorageService.getTimecardsLocal();

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
        };
        preProcess();
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

        // submit timecard and refresh timecard local storage
        $scope.submitTimecard = function(sys_id) {
            snService.submitTimecard(sys_id)
                .then(function(data) {
                    snService.getTimecards()
                        .then(function(result) {
                            LocalStorageService.setTimecardsLocal(result);
                            $state.go('app.home');
                        }, function(error) {
                            console.log(error);
                        })
                }, function(error) {
                    console.log(error);
                })
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
    })
    // approvals Tab  
    .controller('approvalsCtrl', function($scope) {})
    // side menu (Projects)
    .controller('projectsCtrl', function($scope, snService, LocalStorageService) {
        $scope.projects = LocalStorageService.getProjectsLocal();
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
        }
    })
    // side menu (Stories)
    .controller('storiesCtrl', function($scope, snService, LocalStorageService) {
        $scope.stories = LocalStorageService.getStoriesLocal();
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
    .controller('tasksCtrl', function($scope, snService, LocalStorageService) {
        $scope.tasks = LocalStorageService.getTasksLocal();
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
    .controller('timecardsCtrl', function($scope, snService, LocalStorageService) {
        $scope.timecards = LocalStorageService.getTimecardsLocal();

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
    .controller('syncCtrl', function($scope, $state, snService, LocalStorageService) {
        $scope.projects = LocalStorageService.getProjectsLengthLocal();
        $scope.tasks = LocalStorageService.getTasksLengthLocal();
        $scope.stories = LocalStorageService.getStoriesLengthLocal();
        $scope.timecards = LocalStorageService.getTimecardsLengthLocal();
        //$scope.approvals = LocalStorageService.getApprovalsLengthLocal();
        // synchronize functions
        $scope.syncNow = function() {
            console.log('syncNow');

            // Set Projects, Tasks, Stories, Timecards, Users and store it locally 
            snService.getProjects()
                .then(function(result) {
                    LocalStorageService.setProjectsLocal(result);
                }, function(error) {
                    console.log(error)
                });
            snService.getTasks()
                .then(function(result) {
                    LocalStorageService.setTasksLocal(result);
                }, function(error) {
                    console.log(error);
                });
            snService.getStories()
                .then(function(result) {
                    LocalStorageService.setStoriesLocal(result);
                }, function(error) {
                    console.log(error);
                });
            snService.getTimecards()
                .then(function(result) {
                    LocalStorageService.setTimecardsLocal(result);
                    $state.go('app.sync');
                }, function(error) {
                    console.log(error);
                });
        }
    })
    // side menu (Settings)
    .controller('settingsCtrl', function($scope) {
        $scope.instanceURL = "";
        $scope.saveURL = function() {};
    })
    // side menu (Accounts)
    .controller('accountsCtrl', function($scope, $state, LocalStorageService, UserService) {
        $scope.user = UserService.getUser();
        $scope.logout = function() {
            $state.go('Login');
        };
    });
