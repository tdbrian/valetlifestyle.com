var AvailableCtrl, modules, valetModels;

modules = ['ui.router', 'ui.bootstrap', 'ui.utils', 'valetModels'];

angular.module('valet', modules).config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/available");
  return $stateProvider.state("available", {
    url: '/available',
    templateUrl: 'public/appViews/available.html',
    controller: 'AvailableCtrl'
  }).state("accepted", {
    url: '^/accepted',
    templateUrl: 'appViews/accepted.html',
    controller: 'AcceptedCtrl'
  });
});

AvailableCtrl = function($scope, $state, $stateParams, $rootScope) {
  $scope.rsToken = rsToken;
  $scope.user = users;
  console.log($scope.rsToken);
  return console.log($scope.user);
};

valetModels = angular.module("valetModels", []);

valetModels.service("Auth", function($http, localStorageService) {
  var self;
  self = this;
  return this.currentUser = {};
});

/*
//@ sourceMappingURL=app.js.map
*/