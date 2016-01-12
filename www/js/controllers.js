angular.module('starter.controllers', [])
    .constant('daysWeek', {
        'weekDays': ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
        'weekStart': 0, // sunday 
        'weekEnd': 6 // saturady
    })
    .controller('AppCtrl', function($scope, $ionicModal, $timeout) {

        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        $scope.$on('$ionicView.enter', function(e) {
            //console.log('Home page view entered');
        });
       
    })
    .controller('HomeCtrl', function($scope, $state) {

        // Route to Timecards panel
        $scope.getTimeCardsPanel = function() {
            $state.go('app.timecardPanel');
        };
        // Route to Status Panel
        $scope.getStatusPanel = function() {
            $state.go('app.statusPanel');
        };
        // Route to Approvals
        $scope.getApprovalsPanel = function() {
            $state.go('app.approvalsPanel')
        }
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
        // Modal functions and properties 
        $ionicModal.fromTemplateUrl('templates/timeCardModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });

        $scope.openModal = function() {
            $scope.modal.show();
        };

        $scope.closeModal = function() {
            $scope.modal.hide();
        };

        // destory the modal (once view changed into new view)
        $scope.$on('$destroy', function() {
            $scope.modal.remove();
        });

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
    })
    .controller('timeCardCtrl', function($scope, $stateParams) { // single timecard 

    })
    .controller('statusCtrl', function($scope) { // Status Tab

    })
    .controller('approvalsCtrl', function($scope) { // approvals Tab

    })
    .controller('projectsCtrl', function($scope,snService) { // side menu
         $scope.projects = snService.getProjects();
    })
    .controller('storiesCtrl', function($scope) { // side menu

    })
    .controller('tasksCtrl', function($scope) { // side menu

    })
    .controller('timecardsCtrl',function($scope){ // sidemmenu

    })
    .controller('settingCtrl', function($scope) { // side menu

    })
    .controller('accountCtrl', function($scope) { // side menu

    })
    .controller('configCtrl', function($scope) { // side menu

    })
    .controller('syncCtrl', function($scope) { // side menu

    });
