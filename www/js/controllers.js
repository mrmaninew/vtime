angular.module('starter.controllers', [])
    .constant('daysWeek', {
        'weekDays': ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        'weekStart': 0, // sunday 
        'weekEnd': 6 // saturday
    })
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
    .constant('timeCardStates', ['pending', 'Submitted', 'Approved', 'Rejected', 'Processed', 'Re-submitted'])
    .controller('AppCtrl', function($scope, $ionicModal, $timeout, snService, LocalStorageService) {

        $scope.$on('$ionicView.enter', function(e) {
            //console.log('Home page view entered');
        });
    })
    .controller('HomeCtrl', function($scope, $state) {
        // calculate number hours for day, weekly, monthly
        $scope.totalHrsDay = 0.00;
        $scope.totalHrsWeekly = 0.00;
        $scope.totalHrsMonthly = 0.00;
    })
    .controller('LoginCtrl', function($scope) {})
    // tabs for today, this week and next week 
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
                $scope.timecards = LocalStorageService.getTimecardsByDateLocal(sundayDate);
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
                if (tcs[i][$scope.selDayName] != 0) {
                    var set = {};
                    set.selDate = new Date($scope.selDate);
                    if (tcs[i].sys_id) set.sys_id = tcs[i].sys_id;
                    //if (tcs[i].u_project) set.u_project = tcs[i].u_project.value;
                    if (tcs[i].u_project) set.u_project = LocalStorageService.getProjectNumberBySysID(tcs[i].u_project.value);
                    //if (tcs[i].task) set.task = tcs[i].task.value;
                    if (tcs[i].task) set.task = LocalStorageService.getTaskNumberBySysID(tcs[i].task.value);
                    if (tcs[i].story) set.story = tcs[i].story.value;
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
            //console.log(Ptimecards);
            $scope.timecards = Ptimecards;
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
            console.log('getCalendar');
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
            }
        };
        // route to new Timecard View (create new timecard)
        $scope.routeCard = function() {
            $state.go('app.card', {
                param1: $scope.selDate
            });
        }
    })
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
                // make some chnages as logic wont work for 6 and 0, test those values
                var weekStartOn = (moment($scope.tc.passDate).subtract(dayNum, 'days'))._d;
                console.log(weekStartOn);
                return weekStartOn;
            }
            var data = {
                //'week_starts_on': generateWeekStartsOn(),
                'task': $scope.tc.task,
                [_day]: $scope.tc.hours,
                [_dayNotesKey]: $scope.tc.comments,
                'u_project': $scope.tc.u_project,
                'u_billable': $scope.tc.u_billable,
                'user': UserService.getUser().sys_id,
                'sys_created_by': UserService.getUser().user_id
            };
            //console.log(data);
            // insert  new Timecard into Servicenow
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
            var tc = LocalStorageService.getTimecardByID(($stateParams.sys_id).substr(1));
            var paramDate = ($stateParams.passDate).substr(1);
             console.log(new Date(Date(paramDate)).getDay());
            //processTimecard(tc, paramDate);
        };
        getTimecardDetails();

        function processTimecard(tc, paramDate) {
            var set = {};
            if (tc) {
                set.passDate = new Date(Date(paramDate));
                if (tc[daysWeek.weekDays[set.passDate.getDay()]]) set.hours = tc[daysWeek.weekDays[set.passDate.getDay()]];
                if (tc.u_project) set.u_project = tc.u_project.value;
                if (tc.task) set.task = tc.task.value;
                if (tc.story) set.story = tc.story.value;
                if (tc.category) set.category = tc.category;
                if (tc.state) set.state = tc.state;
                if (tc.u_billable) set.u_billable = tc.u_billable;
                var worknotes = "u_" + daysWeek.weekDays[set.passDate.getDay()] + "_work_notes";
                if (tc[worknotes]) set.comments = tc[worknotes];
            }
            $scope.tc = set;
            //console.log($scope.tc);
        };

        $scope.saveTC = function() {};
        $scope.submitTC = function() {};
        $scope.resetTC = function() {};

    })
    .controller('statusCtrl', function($scope) { // Status Tab
    })
    .controller('approvalsCtrl', function($scope) { // approvals Tab
    })
    .controller('projectsCtrl', function($scope, snService, LocalStorageService) { // side menu
        $scope.projects = [];

        function showProjects() {
            $scope.projects = LocalStorageService.getProjectsLocal();
        };
        // snService.getProjects()
        //         .then(function(result) {
        //             console.log(result);
        //             $scope.projects = result;
        //         }, function(error) {
        //             console.log(error)
        //         });
        // function showProjects(){
        //     DBService.getProjectsFromDB()
        //         .then(function(result){
        //             console.log(result);
        //             $scope.projects = result;
        //         }, function(error){
        //             console.log(error);
        //         })
        // };
        showProjects();
        $scope.syncProjects = function() {};
    })
    .controller('storiesCtrl', function($scope, snService, LocalStorageService) { // side menu
        $scope.stories = [];

        function showStories() {
            $scope.stories = LocalStorageService.getStoriesLocal();
        };
        showStories();
        $scope.syncStories = function() {};
    })
    .controller('tasksCtrl', function($scope, snService, LocalStorageService) { // side menu
        $scope.tasks = [];

        function showTasks() {
            $scope.tasks = LocalStorageService.getTasksLocal();
        };
        showTasks();
        $scope.syncTasks = function() {};
    })
    .controller('timecardsCtrl', function($scope, snService, LocalStorageService) { // sidemmenu
        $scope.timecards = [];

        function showTimecards() {
            $scope.timecards = LocalStorageService.getTimecardsLocal();
        };
        showTimecards();
        $scope.syncTimecards = function() {};
    })
    .controller('syncCtrl', function($scope) { // side menu
    })
    .controller('settingCtrl', function($scope) { // side menu
    })
    .controller('accountCtrl', function($scope) { // side menu
    });
