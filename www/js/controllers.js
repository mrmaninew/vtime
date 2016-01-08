angular.module('starter.controllers', [])
    .constant('daysWeek', {
        'weekDays': ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
        'weekStart': 0,
        'weekEnd': 6
    })
    .controller('AppCtrl', function($scope, $ionicModal, $timeout) {

        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        $scope.$on('$ionicView.enter', function(e) {
          console.log('Home page view entered');
        });

        // Form data for the login modal
        $scope.loginData = {};

        // Create the login modal that we will use later
        $ionicModal.fromTemplateUrl('templates/login.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modal = modal;
        });

        // Triggered in the login modal to close it
        $scope.closeLogin = function() {
            $scope.modal.hide();
        };

        // Open the login modal
        $scope.login = function() {
            $scope.modal.show();
        };

        // Perform the login action when the user submits the login form
        $scope.doLogin = function() {
            console.log('Doing login', $scope.loginData);
            $timeout(function() {
                $scope.closeLogin();
            }, 1000);
        };
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
        // Route to Timers Panel
        $scope.getTimersPanel = function() {
            $state.go('app.timersPanel');
        };
        $scope.playlists = [{
            title: 'Reggae',
            id: 1
        }, {
            title: 'Chill',
            id: 2
        }, {
            title: 'Dubstep',
            id: 3
        }, {
            title: 'Indie',
            id: 4
        }, {
            title: 'Rap',
            id: 5
        }, {
            title: 'Cowbell',
            id: 6
        }];
    })
    .controller('PlaylistCtrl', function($scope, $stateParams) {})
    .controller('LoginCtrl', function($scope) {

    })
    // tabs for today, this week and next week 
    .controller('TimecardsPanelCtrl', function($scope, $ionicTabsDelegate, $ionicModal, moment, daysWeek) { // Timecard Tab

        // footer item-right varibles 
        $scope.totalHrsDay = "0.00";
        $scope.totalHrsThisWeek = "0.00";
        $scope.totalHrsNextWeek = "0.00";

        // selected date for Time cards
        $scope.selDate = new Date();
        $scope.$watch('selDate', DayChanged);
        $scope.selDay = $scope.selDate.getDay();


        function DayChanged() {
            var daysBefore, dayAfter;
            if ($scope.selDay === 0) {
                $scope.selThisWeek = getDaysInWeekBySelDate($scope.selDay);
                console.log('DayChanged'+$scope.selThisWeek);
            } else {
                $scope.selThisWeek = getDaysInWeekBySelDate($scope.selDay, daysWeek.weekEnd - $scope.selDay)
                console.log('DayChanged'+$scope.selThisWeek);
            }
        }
        DayChanged();

        function getDaysInWeekBySelDate(before, after) {
            console.log('in getDaysInWeekBySelDate()' + before, after);
            var week = [];
            var weekEnd = daysWeek.weekEnd + 1;
            //if before:value is zero get all days in week, i.e sunday to saturday 
            if (before === 0) {
                for (i = 1; i <= weekEnd; i++) {
                    week.push((moment($scope.selDate).add(i, 'days'))._d);
                }
                return week.reverse();
            } else {
                var arr = [];

                function getAfterDays(arr) {
                    return arr;
                }

                function getBeforeDays(callback) {
                    for (var i = 1; i <= before; i++) {
                        arr.push((moment($scope.selDate).subtract(i, 'days'))._d);
                    }
                    return callback(arr.reverse());
                };
                console.log(getBeforeDays(getAfterDays));
            }
        };
        // Modal functions and properties 
        $ionicModal.fromTemplateUrl('templates/timecardModal.html', {
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
                console.log('Selected date is : ', val)
                $scope.selDate = new Date(val);
                $scope.selDay = $scope.selDate.getDay();
            }
        };
    })
    .controller('StatusCtrl', function($scope) { // Status Tab

    })
    .controller('TimersCtrl', function($scope) { // Timers Tab

    })
    .controller('ProjectCtrl', function($scope) { // side menu

    })
    .controller('TaskCtrl', function($scope) { // side menu

    })
    .controller('SettingCtrl', function($scope) { // side menu

    })
    .controller('AccountCtrl', function($scope) { // side menu

    })
    .controller('StoriesCtrl', function($scope) { // side menu

    })
    .controller('TimeSheetsCtrl', function($scope) { // side menu

    })
    .controller('ConfigCtrl', function($scope) { // side menu

    })
    .controller('SyncCtrl', function($scope) { // side manu

    });