angular.module('starter', ['ionic', 'ionic-datepicker', 'starter.controllers', 'starter.services', 'angularMoment', 'ngCordova'])

.run(function($ionicPlatform, snService, LocalStorageService) {
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
            // intialize and load LokiDB and refresh Projects, Tasks, Users, Stories , Timecards - collections

            //DBService.initDB();

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
                }, function(error) {
                    console.log(error);
                });
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
            .state('app.settings', {
                url: '/settings',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/settings.html', 
                        controller: 'settingsCtrl'
                    }
                }
            })
            // side menu (Accounts)
            .state('app.accounts', {
                url: '/accounts',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/accounts.html', 
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
            .state('app.timecardPanel', {
                url: '/timecardPanel',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/timeCardPanel.html',
                        controller: 'timeCardsPanelCtrl',
                    }
                }
            })
            // create new timecard
            .state('app.card', {
                url: '/card:param1,',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/Card.html',
                        controller: 'CardCtrl'
                    }
                }
            })
            // edit existing timecard
            .state('app.editCard', {
                url: '/editCard/:param1/:param2', //'/editcard/:sys_id/:passDate'
                views: {
                    'menuContent': {
                        templateUrl: 'templates/editTimecard.html',
                        controller: 'editCardCtrl'
                    }
                }
            });
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/home');
    });
