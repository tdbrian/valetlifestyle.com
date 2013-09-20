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

AvailableCtrl = function($scope, $state, $location, $timeout, $rootScope, Buyer, Events, Notification) {
  var availableSeleted, checkAvailable;
  Buyer.buyer = buyer;
  $scope.buyer = buyer;
  availableSeleted = false;
  checkAvailable = function() {
    return Events.getAvailable(function(availableEvents) {
      if (availableEvents.length > 0 && availableSeleted === false) {
        console.log('setting inital');
        availableSeleted = true;
        $scope.showEventDetails = true;
        $scope.availableEvents = availableEvents;
        $scope.selectedIndex = 0;
        $scope.currentEvent = availableEvents[0];
      } else if (availableEvents.length === 0) {
        $scope.showEventDetails = false;
      }
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
    $scope.currentEvent.buyer = buyer.bid;
    return Events.save($scope.currentEvent, function() {
      $location.path('/accepted');
      console.log('back');
      return Notification.newNotification($scope.currentEvent, 'accepted');
    });
  };
};

AcceptedCtrl = function($scope, $state, $timeout, $location, Events, RS, Buyer, Notification) {
  var spinner, target;
  console.log('in accepted');
  Buyer.buyer = buyer;
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
  console.log('get accepted');
  Events.getAccepted(function(accpetedEvents) {
    var accpetedSeleted;
    $scope.accpetedEvents = accpetedEvents;
    if (accpetedEvents) {
      $scope.currentEvent = accpetedEvents[0];
      $scope.openAcceptedJob($scope.currentEvent, $scope.currentEvent);
      $scope.selectedIndex = 0;
      accpetedSeleted = true;
      return $scope.runQuery();
    } else {
      return console.log('no accepted jobs');
    }
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
    $scope.currentEvent.buyer = buyer.bid;
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
      Notification.newNotification($scope.currentEvent, 'submitted');
      return Events.getAccepted(function(acceptedEvents) {
        var accpetedSeleted;
        if (acceptedEvents != null) {
          $scope.acceptedEvents = acceptedEvents;
          if (acceptedEvents.length > 0) {
            $scope.currentEvent = acceptedEvents[0];
            $scope.openAcceptedJob($scope.currentEvent, $scope.currentEvent);
            $scope.selectedIndex = 0;
            accpetedSeleted = true;
          }
        } else {
          $scope.acceptedEvents = [];
        }
        $location.path('/pending');
        $scope.approvalStatus = 'btn-warning';
        return $scope.saveStatus = '';
      });
    });
  };
};

PendingCtrl = function($scope, $state, $timeout, Buyer, Events, RS) {
  Buyer.buyer = buyer;
  Events.getPending(function(pendingEvents) {
    console.log('getting pending');
    $scope.pendingEvents = pendingEvents;
    if (pendingEvents.length > 0) {
      $scope.currentEvent = pendingEvents[0];
      $scope.selectedIndex = 0;
      return $scope.openPendingJob($scope.selectedIndex, $scope.currentEvent);
    }
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

ShippedCtrl = function($scope, $state, $timeout, Buyer, Events, RS) {
  Buyer.buyer = buyer;
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

valetModels.service("Buyer", function($http, DB_URL) {
  var self;
  self = this;
  return this.buyer = {};
});

valetModels.service("Events", function($http, DB_URL, Buyer) {
  var getEvents, self;
  self = this;
  this.all = {};
  this.available = {};
  this.accepted = {};
  this.pending = {};
  this.shipped = {};
  this.getAvailable = function(cb) {
    return getEvents(function() {
      return $http.get(DB_URL + 'group/valet/events/status/new').success(function(_events) {
        self.available = _events;
        return cb(_events);
      });
    });
  };
  this.getAccepted = function(cb) {
    return getEvents(function() {
      var group;
      group = _.groupBy(self.all, 'status');
      self.accepted = group.accepted;
      return cb(self.accepted);
    });
  };
  this.getPending = function(cb) {
    return getEvents(function() {
      var group;
      group = _.groupBy(self.all, 'status');
      self.pending = group.pending;
      return cb(self.pending);
    });
  };
  this.getShipped = function(cb) {
    return getEvents(function() {
      var group;
      group = _.groupBy(self.all, 'status');
      self.shipped = group.shipped;
      return cb(self.shipped);
    });
  };
  getEvents = function(cb) {
    return $http.get(DB_URL + 'group/valet/events/buyer/' + Buyer.buyer.bid).success(function(_events) {
      console.log(_events);
      self.all = _events;
      return cb();
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
      dataType: "jsonp",
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
      group: group,
      date: moment().format("YYYY-MM-DD"),
      time: moment().format("HH:mm:ss"),
      viewed: false,
      deleted: false
    };
    return $http.post(DB_URL + 'valet/notifications', newNotification).success(function(result) {
      return console.log('notification saved!');
    });
  };
});

/*
//@ sourceMappingURL=app.js.map
*/