angular.module('starter', ['ionic', 'lokijs', 'ionic-datepicker', 'starter.controllers', 'starter.services', 'angularMoment', 'ngCordova'])

.run(function($ionicPlatform) {
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
            // intialize and load LokiDB and refresh Projects, Tasks, Stories , Timecards , Collections
            // here 
            
        });
    })
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: 'templates/menu.html',
                controller: 'AppCtrl'
            })
            // side menu
            .state('app.projects', {
                url: '/projects',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/projects.html', // side menu
                        controller: 'projectsCtrl'
                    }
                }
            })
            .state('app.tasks', {
                url: '/tasks',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/tasks.html', // side menu
                        controller: 'tasksCtrl'
                    }
                }
            })
            .state('app.stories', {
                url: '/stories',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/stories.html', // side menu
                        controller: 'storiesCtrl'
                    }
                }
            })
            .state('app.timecards', {
                url: '/timecards',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/timecards.html', // side menu
                        controller: 'timecardsCtrl'
                    }
                }
            })
            .state('app.sync', {
                url: '/sync',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/sync.html', // side menu 
                        controller: 'syncCtrl'
                    }
                }
            })
            .state('app.settings', {
                url: '/settings',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/settings.html', // side menu 
                        controller: 'settingsCtrl'
                    }
                }
            })
            .state('app.accounts', {
                url: '/accounts',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/accounts.html', // side menu
                        controller: 'accountsCtrl'
                    }
                }
            })
            .state('app.home', {
                url: '/home',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/home.html',
                        controller: 'HomeCtrl'
                    }
                }
            })
            .state('app.approvalsPanel', {
                url: '/approvalsPanel',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/approvals.html',
                        controller: 'approvalsCtrl'
                    }
                }
            })
            .state('app.statusPanel', {
                url: '/statusPanel',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/status.html',
                        controller: 'statusCtrl'
                    }
                }
            })
            .state('app.timecardPanel', {
                url: '/timecardPanel',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/timeCardPanel.html',
                        controller: 'timeCardsPanelCtrl',
                    }
                }
            })
            .state('app.card', {
                url: '/card:param1,',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/Card.html',
                        controller: 'CardCtrl'
                    }
                }
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/home');
    });
