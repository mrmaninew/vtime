angular.module('starter.controllers', [])
    .constant('daysWeek', {
        'weekDays': ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
        'weekStart': 0, // sunday 
        'weekEnd': 6 // saturady
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
    .controller('AppCtrl', function($scope, $ionicModal, $timeout, snService, LocalStorageService) {

        $scope.$on('$ionicView.enter', function(e) {
            console.log('Home page view entered');
        });
    })
    .controller('HomeCtrl', function($scope, $state) {

    })
    .controller('LoginCtrl', function($scope) {

    })
    // tabs for today, this week and next week 
    .controller('timeCardsPanelCtrl', function($scope, $cordovaToast, $ionicPlatform, $state, $ionicTabsDelegate, $ionicModal, moment, daysWeek) { // Timecard Tab

        // footer item-right varibles 
        $scope.totalHrsDay = "0.00";
        $scope.totalHrsWeekly = "0.00";

        // selected date for Time cards
        $scope.selDate = new Date();
        // selected week by selected date
        $scope.selThisWeek = [];
        // selected date of day in a week (sun:0, mon:1..,)
        $scope.selDay = $scope.selDate.getDay();

        function onDayChanged() {
            var daysBefore, dayAfter;
            if ($scope.selDay === 0) {
                $scope.selThisWeek = getDaysInWeekBySelDate($scope.selDay);
            } else {
                $scope.selThisWeek = getDaysInWeekBySelDate($scope.selDay, daysWeek.weekEnd - $scope.selDay);
            }
        }
        onDayChanged();

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
                // as selected date changes call DayChanged function to change date array
                onDayChanged();
            }
        };

        $scope.routeCard = function() {
            $state.go('app.card', {
                param1: $scope.selDate
            });
        }
    })
    .controller('CardCtrl', function($scope, $filter, $stateParams, timeCardCategories, LocalStorageService) { // single timecard 
        // varibles
        $scope.cards = [];
        // Projects 
        $scope.projects = LocalStorageService.getProjectsLocal();
        $scope.tasks = LocalStorageService.getTasksLocal();
        $scope.stories = LocalStorageService.getStoriesLocal();
        $scope.category = timeCardCategories;

        // Form model
        $scope.tc = {
            'passDate': new Date($stateParams.param1),
            'task': '',
            'story': '',
            'project': '',
            'category': '',
            'hours': '',
            'billable': '',
            'comments': ''
        };
        $scope.saveTC = function() {
            console.log($scope.tc);
        };
        $scope.submitTC = function() {

        };
        $scope.resetTC = function() {};

        //  Functional libs 
        $scope.getPendingTimeCardsForCurrentDate = function() {

        };
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
        $scope.syncProjects = function() {
            showProjects();
        };
    })
    .controller('storiesCtrl', function($scope) { // side menu
        $scope.stories = [];

    })
    .controller('tasksCtrl', function($scope) { // side menu
        $scope.tasks = [];
    })
    .controller('timecardsCtrl', function($scope) { // sidemmenu

    })
    .controller('syncCtrl', function($scope) { // side menu

    })
    .controller('settingCtrl', function($scope) { // side menu

    })
    .controller('accountCtrl', function($scope) { // side menu

    })
