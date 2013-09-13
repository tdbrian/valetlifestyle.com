# ////////////////////////////////
# Required Modules
# ////////////////////////////////

modules = ['ui.router', 'ui.bootstrap', 'ui.utils', 'valetModels']

# ////////////////////////////////
# Application Main
# ////////////////////////////////
# 
angular.module('valet', modules).config ($stateProvider, $urlRouterProvider) ->
  
  # For any unmatched url, send to /route1
  $urlRouterProvider.otherwise "/available"
  
  # Application States
  $stateProvider.state("available",
    url: '/available'
    templateUrl: 'public/appViews/available.html'
    controller: 'AvailableCtrl'
  ).state("accepted",
    url: '^/accepted'
    templateUrl: 'appViews/accepted.html'
    controller: 'AcceptedCtrl'
  )

# ////////////////////////////////
# Available
# ////////////////////////////////

AvailableCtrl = ($scope, $state, $stateParams, $rootScope) ->

  $scope.rsToken = rsToken
  $scope.user = users

  console.log $scope.rsToken
  console.log $scope.user