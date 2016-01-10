angular.module('starter', ['ionic', 'ionic-datepicker', 'starter.controllers', 'starter.services', 'angularMoment', 'ngCordova'])

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

        .state('app.search', {
            url: '/search',
            views: {
                'menuContent': {
                    templateUrl: 'templates/search.html'
                }
            }
        })

        .state('app.browse', {
                url: '/browse',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/browse.html'
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
                        controller: 'timeCardsPanelCtrl'
                    }
                }
            })
            .state('app.timeCard', {
                url: '/card',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/timeCard.html',
                        controller: 'timeCardCtrl'
                    }
                }
            })

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/home');
    });
