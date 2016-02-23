angular.module('starter', ['ionic', 'ionic-datepicker', 'starter.controllers', 'starter.services', 'angularMoment', 'ngCordova', 'chart.js'])
    .run(function($ionicPlatform, $cordovaNetwork, $cordovaToast, $state, $rootScope, $cordovaStatusbar, snService, ConnectivityMonitor,MessageService, $ionicPopup, TokenService, LocalStorageService) {
        $ionicPlatform.ready(function() {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
            // check network connectivity
            if (!ConnectivityMonitor.isOnline()) {
                $ionicPopup.confirm({
                        title: "No Internet Connection",
                        content: "App running in offline mode"
                    })
                    .then(function(result) {
                        console.log("running offline");
                    });
            }
            // Then token information, check the token value if its have some value go the home view else, redirect
            // to login page 
            if (TokenService.getToken() === null) {
                $state.go('login');
            } else {
                $state.go('app.home');
            }
        });
        $ionicPlatform.on('resume', function() {
            $state.go('app.home');
        });
    })
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
        // Login 
            .state('login', {
                url: '/login',
                templateUrl: 'templates/login.html',
                controller: 'loginCtrl'
            })
            // No Network 
            .state('nonetwork', {
                url: '/nonetwork',
                templateUrl: 'templates/nonetwork.html',
                controller: 'nonetworkCtrl'
            })
            // app state 
            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: 'templates/menu.html',
                controller: 'AppCtrl'
            })
            // home view
            .state('app.home', {
                url: '/home',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/home.html',
                        controller: 'HomeCtrl'
                    }
                }
            })
            // Menu.html Footer bar  
            // Approval Panel
            .state('app.approvalsPanel', {
                url: '/approvalsPanel',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/approvals.html',
                        controller: 'approvalsCtrl'
                    }
                }
            })
            // Status panel
            .state('app.statusPanel', {
                url: '/statusPanel',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/status.html',
                        controller: 'statusCtrl'
                    }
                }
            })
            // timecard panel view
            .state('app.timecardPanel', {
                url: '/timecardPanel',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/timeCardPanel.html',
                        controller: 'timeCardsPanelCtrl',
                    }
                }
            })
            // timecard panel view with date params 
            .state('app.timecardPanelDateView', {
                url: '/timecardPanel/:param1',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/timeCardPanel.html',
                        controller: 'timeCardsPanelCtrl'
                    }
                }
            })
            // create new timecard
            .state('app.card', {
                url: '/card:param1,',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/card.html',
                        controller: 'cardCtrl'
                    }
                }
            })
            // edit existing timecard with sys_id, date params
            .state('app.editCard', {
                url: '/editCard/:param1/:param2', //'/editcard/:sys_id/:passDate'
                views: {
                    'menuContent': {
                        templateUrl: 'templates/editTimecard.html',
                        controller: 'editCardCtrl'
                    }
                }
            })
            // side menu (Projects)
            .state('app.projects', {
                url: '/projects',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/projects.html',
                        controller: 'projectsCtrl'
                    }
                }
            })
            // side menu (Tasks)
            .state('app.tasks', {
                url: '/tasks',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/tasks.html',
                        controller: 'tasksCtrl'
                    }
                }
            })
            // side menu (Stories)
            .state('app.stories', {
                url: '/stories',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/stories.html',
                        controller: 'storiesCtrl'
                    }
                }
            })
            // side menu (Timecards)
            .state('app.timecards', {
                url: '/timecards',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/timecards.html',
                        controller: 'timecardsCtrl'
                    }
                }
            })
            // side menu (Tasks)
            .state('app.sync', {
                url: '/sync',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/sync.html',
                        controller: 'syncCtrl'
                    }
                }
            })
            // side menu (Settings)
            // .state('app.settings', {
            //     url: '/settings',
            //     views: {
            //         'menuContent': {
            //             templateUrl: 'templates/settings.html',
            //             controller: 'settingsCtrl'
            //         }
            //     }
            // })
            // side menu (Accounts)
            .state('app.accounts', {
                url: '/accounts',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/accounts.html',
                        controller: 'accountsCtrl'
                    }
                }
            });
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/home');
    });
