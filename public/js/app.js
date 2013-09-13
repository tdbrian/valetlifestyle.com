var AcceptedCtrl, AvailableCtrl, app, modules, valetModels;

modules = ['ui.router', 'ui.bootstrap', 'ui.utils', 'valetModels'];

app = angular.module('valet', modules).config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/available");
  return $stateProvider.state("available", {
    url: '/available',
    templateUrl: 'public/appViews/available.html',
    controller: 'AvailableCtrl'
  }).state("accepted", {
    url: '^/accepted',
    templateUrl: 'public/appViews/accepted.html',
    controller: 'AcceptedCtrl'
  });
});

app.constant('DB_URL', 'http://api.valetlifestyle.com/v1/valet/');

AvailableCtrl = function($scope, $state, $stateParams, $timeout, $rootScope, Events) {
  var availableSeleted, checkAvailable;
  $scope.buyer = buyer;
  availableSeleted = false;
  checkAvailable = function() {
    return Events.getAvailable(function(availableEvents) {
      $scope.availableEvents = availableEvents;
      if (!availableSeleted) {
        $scope.selectedIndex = 0;
        $scope.currentEvent = availableEvents[0];
      }
      availableSeleted = true;
      return $timeout(checkAvailable, 3000);
    });
  };
  checkAvailable();
  $timeout(checkAvailable, 3000);
  $scope.openAvailJob = function(key, availEvent) {
    $scope.currentEvent = availEvent;
    return $scope.selectedIndex = key;
  };
  return $scope.acceptJob = function() {
    $scope.currentEvent.status = 'accepted';
    return Events.save($scope.currentEvent, function() {
      return console.log('back');
    });
  };
};

AcceptedCtrl = function($scope, $state, $stateParams, $timeout, $rootScope, Events) {
  $scope.buyer = buyer;
  $scope.minPrice = 1;
  $scope.maxPrice = 1000;
  $(".priceRange").slider({
    range: true,
    max: 2000,
    min: 1,
    values: [0, 1000]
  });
  $(".priceRange").slider("option", "range", true);
  $(".priceRange").on("slidechange", function(event, ui) {
    return $scope.$apply(function() {
      $scope.minPrice = ui.values[0];
      return $scope.maxPrice = ui.values[1];
    });
  });
  Events.getAccepted(function(accpetedEvents) {
    var accpetedSeleted;
    $scope.accpetedEvents = accpetedEvents;
    $scope.currentEvent = accpetedEvents[0];
    return accpetedSeleted = true;
  });
  $scope.openAcceptedJob = function(key, availEvent) {
    $scope.currentEvent = availEvent;
    return $scope.selectedIndex = key;
  };
  return $scope.acceptJob = function() {
    $scope.currentEvent.status = 'accepted';
    return Events.save($scope.currentEvent, function() {
      return console.log('back');
    });
  };
};

valetModels = angular.module("valetModels", []);

valetModels.service("Events", function($http, DB_URL) {
  var self;
  self = this;
  this.available = {};
  this.accepted = {};
  this.pending = {};
  this.shipped = {};
  this.getAvailable = function(cb) {
    var link;
    link = DB_URL + 'group/valet/events/status/new';
    return $http.get(link).success(function(_availableEvents) {
      self.available = _availableEvents;
      return cb(_availableEvents);
    });
  };
  this.getAccepted = function(cb) {
    var link;
    link = DB_URL + 'group/valet/events/status/accepted';
    return $http.get(link).success(function(_acceptedEvents) {
      self.accepted = _acceptedEvents;
      return cb(_acceptedEvents);
    });
  };
  this.getPending = function(cb) {
    var link;
    link = DB_URL + 'group/valet/events/status/pending';
    return $http.get(link).success(function(_pendingEvents) {
      self.pending = _pendingEvents;
      return cb(_pendingEvents);
    });
  };
  this.getShipped = function(cb) {
    var link;
    link = DB_URL + 'group/valet/events/status/shipped';
    return $http.get(link).success(function(_shippedEvents) {
      self.shipped = _shippedEvents;
      return cb(_shippedEvents);
    });
  };
  return this.save = function(_event, cb) {
    delete _event._id;
    return $http.put(DB_URL + 'valet/events/eid/' + _event.eid, _event).success(function(result) {
      console.log('saved!');
      return cb();
    });
  };
});

/*
//@ sourceMappingURL=app.js.map
*/