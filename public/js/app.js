var AcceptedCtrl, AvailableCtrl, PendingCtrl, ShippedCtrl, app, modules, valetModels;

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
  }).state("pending", {
    url: '^/pending',
    templateUrl: 'public/appViews/pending.html',
    controller: 'PendingCtrl'
  }).state("shipped", {
    url: '^/shipped',
    templateUrl: 'public/appViews/shipped.html',
    controller: 'ShippedCtrl'
  });
});

app.constant('DB_URL', 'http://api.valetlifestyle.com/v1/valet/');

AvailableCtrl = function($scope, $state, $location, $timeout, $rootScope, Events, Notification) {
  var availableSeleted, checkAvailable;
  $scope.buyer = buyer;
  availableSeleted = false;
  checkAvailable = function() {
    return Events.getAvailable(function(availableEvents) {
      console.log('gotAvailable');
      console.log(availableEvents.length);
      if (availableEvents.length > 0) {
        console.log('show');
        $scope.showEventDetails = true;
      } else {
        console.log('hide');
        $scope.showEventDetails = false;
      }
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
      $location.path('/accepted');
      console.log('back');
      return Notification.newNotification($scope.currentEvent, 'accepted');
    });
  };
};

AcceptedCtrl = function($scope, $state, $timeout, Events, RS, Notification) {
  var spinner, target;
  $scope.buyer = buyer;
  $scope.minPrice = 1;
  $scope.maxPrice = 1000;
  $scope.offset = 0;
  $scope.wardrobe = [];
  $scope.totalWardrobe = 0;
  $scope.totalCommission = 0;
  $scope.approvalStatus = 'btn-warning';
  $scope.approvalStatus = '';
  RS.token = buyer.token;
  target = document.getElementById('spinner');
  spinner = new Spinner({
    radius: 5,
    width: 2,
    lenght: 10,
    lines: 12
  }).spin(target);
  $scope.showSpinner = false;
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
    $scope.openAcceptedJob($scope.currentEvent, $scope.currentEvent);
    $scope.selectedIndex = 0;
    accpetedSeleted = true;
    return $scope.runQuery();
  });
  $scope.openAcceptedJob = function(key, availEvent) {
    $scope.totalWardrobe = 0;
    $scope.totalCommission = 0;
    $scope.currentEvent = availEvent;
    $scope.selectedIndex = key;
    $scope.approvalStatus = 'btn-warning';
    $scope.saveStatus = '';
    $scope.wardrobe = $scope.currentEvent.itemList;
    return angular.forEach($scope.wardrobe, function(wardrobeItem, wardrobeKey) {
      $scope.totalWardrobe = $scope.totalWardrobe + Number(wardrobeItem.price);
      return $scope.totalCommission = $scope.totalCommission + Number(wardrobeItem.commission);
    });
  };
  $scope.acceptJob = function() {
    $scope.currentEvent.status = 'accepted';
    return Events.save($scope.currentEvent, function() {
      return console.log('back');
    });
  };
  $scope.runQuery = function() {
    $scope.showSpinner = true;
    return RS.query($scope.keyword, $scope.designer, $scope.offset, $scope.minPrice, $scope.maxPrice, function(queryShopItems) {
      return $scope.$apply(function() {
        $scope.showSpinner = false;
        return $scope.selection = queryShopItems;
      });
    });
  };
  $scope.showDetail = function(shopItem, inWardrobe) {
    $scope.currentShopItem = shopItem;
    $scope.showRemove = inWardrobe;
    return $('#shoppingItemModal').modal();
  };
  $scope.addToWardrobe = function() {
    $scope.wardrobe.push($scope.currentShopItem);
    $scope.totalWardrobe = $scope.totalWardrobe + Number($scope.currentShopItem.price);
    return $scope.totalCommission = $scope.totalCommission + Number($scope.currentShopItem.commission);
  };
  $scope.removeFromWardrobe = function() {
    return angular.forEach($scope.wardrobe, function(warItem, warKey) {
      if (warItem.sku === $scope.currentShopItem.sku) {
        $scope.wardrobe.splice(warKey, 1);
        $scope.totalWardrobe = $scope.totalWardrobe - Number(warItem.price);
        return $scope.totalCommission = $scope.totalCommission - Number(warItem.commission);
      }
    });
  };
  $scope.nextSelection = function() {
    $scope.offset = $scope.offset + 12;
    return $scope.runQuery();
  };
  $scope.previousSelection = function() {
    if ($scope.offset > 0) {
      $scope.offset = $scope.offset - 12;
      return $scope.runQuery();
    }
  };
  $scope.saveWardrobe = function() {
    $scope.currentEvent.itemList = $scope.wardrobe;
    $scope.currentEvent.proposedBudget = $scope.totalWardrobe;
    return Events.save($scope.currentEvent, function() {
      return $scope.saveStatus = 'btn-success';
    });
  };
  return $scope.submitForApproval = function() {
    $scope.selectedIndex;
    $scope.currentEvent.status = 'pending';
    $scope.currentEvent.proposedBudget = $scope.totalWardrobe;
    $scope.currentEvent.itemList = $scope.wardrobe;
    return Events.save($scope.currentEvent, function() {
      $scope.approvalStatus = 'btn-success';
      return Events.getAccepted(function(accpetedEvents) {
        var accpetedSeleted;
        $scope.accpetedEvents = accpetedEvents;
        $scope.currentEvent = accpetedEvents[0];
        $scope.openAcceptedJob($scope.currentEvent, $scope.currentEvent);
        $scope.selectedIndex = 0;
        accpetedSeleted = true;
        $scope.approvalStatus = 'btn-warning';
        $scope.saveStatus = '';
        return Notification.newNotification($scope.currentEvent, 'submitted');
      });
    });
  };
};

PendingCtrl = function($scope, $state, $timeout, Events, RS) {
  Events.getPending(function(pendingEvents) {
    var pendingSeleted;
    console.log('getting pending');
    $scope.pendingEvents = pendingEvents;
    $scope.currentEvent = pendingEvents[0];
    $scope.selectedIndex = 0;
    $scope.openPendingJob($scope.selectedIndex, $scope.currentEvent);
    return pendingSeleted = true;
  });
  return $scope.openPendingJob = function(pendingKey, pendingEvent) {
    console.log('in pending');
    $scope.currentEvent = pendingEvent;
    $scope.selectedIndex = pendingKey;
    if (pendingEvent.status === 'pending') {
      return $scope.pendingNote = 'Waiting on client to approve.';
    }
  };
};

ShippedCtrl = function($scope, $state, $timeout, Events, RS) {
  return $scope.submitShipped = function() {
    $scope.currentEvent.status = 'shipped';
    return Events.save($scope.currentEvent, function() {
      $scope.shippedStatus = 'btn-success';
      return Events.getShipped(function(shippedEvents) {
        var accpetedSeleted;
        $scope.shippedEvents = shippedEvents;
        $scope.currentEvent = shippedEvents[0];
        $scope.openAcceptedJob($scope.currentEvent, $scope.currentEvent);
        $scope.selectedIndex = 0;
        accpetedSeleted = true;
        $scope.shippedStatus = 'btn-warning';
        $scope.shippedStatus = '';
        return Notification.newNotification($scope.currentEvent, 'shipped');
      });
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
      console.log('got pending');
      console.log(_pendingEvents);
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

valetModels.service("RS", function($http, DB_URL) {
  var self, token;
  self = this;
  token = "";
  return this.query = function(keywords, designers, offset, minPrice, maxPrice, cb) {
    var link;
    if (keywords === void 0) {
      keywords = "";
    } else {
      keywords = '&keywords=' + keywords;
    }
    if (designers === void 0) {
      designers = "";
    } else {
      designers = '&designers[]=' + designers;
    }
    offset = '&offset=' + offset;
    minPrice = '&priceMin=' + minPrice;
    maxPrice = '&priceMax=' + maxPrice;
    link = 'https://api.rewardstyle.com/v1/search?oauth_token=' + self.token + minPrice + maxPrice + keywords + designers + '&limit=12' + offset;
    console.log(link);
    return $.ajax({
      url: link,
      dataType: "json",
      beforeSend: function(xhr) {
        return xhr.overrideMimeType("text/plain; charset=x-user-defined");
      }
    }).done(function(data) {
      return cb(data.products);
    });
  };
});

valetModels.service("Notification", function($http, DB_URL) {
  var self;
  self = this;
  return this.newNotification = function(notifyEvent, type) {
    var group, message, newNotification;
    switch (type) {
      case 'accepted':
        message = 'Your event has been accepted by a personal shopper.';
        group = 'action';
        break;
      case 'submitted':
        message = 'Your wardrobe has been selected by your personal shopper.';
        group = 'attention';
        break;
      case 'shipped':
        message = 'Your wardrobe has been shipped.';
        group = 'action';
    }
    newNotification = {
      nid: Math.random().toString(36).substr(2, 16),
      client: notifyEvent.client,
      message: message,
      type: type,
      event: notifyEvent.eid,
      group: 'attention',
      date: moment().format("YYYY-MM-DD"),
      time: moment().format("HH:mm:ss"),
      viewed: false,
      deleted: false
    };
    return $http.post(DB_URL + 'valet/notifications', newNotification).success(function(result) {
      console.log('notification saved!');
      return cb();
    });
  };
});

/*
//@ sourceMappingURL=app.js.map
*/