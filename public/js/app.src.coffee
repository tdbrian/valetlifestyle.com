# ////////////////////////////////
# Required Modules
# ////////////////////////////////

modules = ['ui.router', 'ui.bootstrap', 'ui.utils', 'valetModels']

# ////////////////////////////////
# Application Main
# ////////////////////////////////

app = angular.module('valet', modules).config ($stateProvider, $urlRouterProvider) ->
  
  # For any unmatched url, send to /route1
  $urlRouterProvider.otherwise "/available"
  
  # Application States
  $stateProvider.state("available",
    url: '/available'
    templateUrl: 'public/appViews/available.html'
    controller: 'AvailableCtrl'
  ).state("accepted",
    url: '^/accepted'
    templateUrl: 'public/appViews/accepted.html'
    controller: 'AcceptedCtrl'
  ).state("pending",
    url: '^/pending'
    templateUrl: 'public/appViews/pending.html'
    controller: 'PendingCtrl'
  ).state("shipped",
    url: '^/shipped'
    templateUrl: 'public/appViews/shipped.html'
    controller: 'ShippedCtrl'
  )

# ////////////////////////////////
# Constants
# ////////////////////////////////

app.constant 'DB_URL', 'http://api.valetlifestyle.com/v1/valet/'

# ////////////////////////////////
# Available
# ////////////////////////////////

AvailableCtrl = ($scope, $state, $location, $timeout, $rootScope, Events, Notification) ->

  $scope.buyer = buyer
  availableSeleted = false

  checkAvailable = ->
    Events.getAvailable (availableEvents) ->

      console.log('gotAvailable');
      console.log(availableEvents.length);
      if availableEvents.length > 0
        console.log('show')
        $scope.showEventDetails = true
      else
        console.log('hide')
        $scope.showEventDetails = false

      $scope.availableEvents = availableEvents
      if not availableSeleted
        $scope.selectedIndex = 0
        $scope.currentEvent = availableEvents[0]
      availableSeleted = true
      $timeout checkAvailable, 3000

  checkAvailable()
  $timeout checkAvailable, 3000

  $scope.openAvailJob = (key, availEvent) ->
    $scope.currentEvent = availEvent
    $scope.selectedIndex = key

  $scope.acceptJob = ->
    $scope.currentEvent.status = 'accepted'
    Events.save $scope.currentEvent, () ->
      $location.path('/accepted')
      console.log 'back'

      Notification.newNotification $scope.currentEvent, 'accepted'

# ////////////////////////////////
# Accepted
# ////////////////////////////////

AcceptedCtrl = ($scope, $state, $timeout, Events, RS, Notification) ->

  $scope.buyer = buyer
  $scope.minPrice = 1
  $scope.maxPrice = 1000
  $scope.offset = 0
  $scope.wardrobe = []
  $scope.totalWardrobe = 0
  $scope.totalCommission = 0
  $scope.approvalStatus = 'btn-warning' 
  $scope.approvalStatus = '' 

  RS.token = buyer.token

  target = document.getElementById('spinner');
  spinner = new Spinner({radius:5, width:2, lenght:10, lines:12}).spin(target);
  $scope.showSpinner = false

  $( ".priceRange" ).slider({ range: true, max: 2000, min: 1, values:[0, 1000] })
  $( ".priceRange" ).slider("option", "range", true)
  $(".priceRange").on "slidechange", (event, ui) ->
    
    $scope.$apply ->
      $scope.minPrice = ui.values[0]
      $scope.maxPrice = ui.values[1]

  Events.getAccepted (accpetedEvents) ->
    $scope.accpetedEvents = accpetedEvents
    $scope.currentEvent = accpetedEvents[0]
    $scope.openAcceptedJob $scope.currentEvent, $scope.currentEvent
    $scope.selectedIndex = 0
    accpetedSeleted = true

    $scope.runQuery()

  $scope.openAcceptedJob = (key, availEvent) ->
    $scope.totalWardrobe = 0
    $scope.totalCommission = 0
    $scope.currentEvent = availEvent
    $scope.selectedIndex = key
    $scope.approvalStatus = 'btn-warning' 
    $scope.saveStatus = '' 
    $scope.wardrobe = $scope.currentEvent.itemList

    # Calculate Totals
    angular.forEach $scope.wardrobe, (wardrobeItem, wardrobeKey) ->
      $scope.totalWardrobe = $scope.totalWardrobe + Number(wardrobeItem.price)
      $scope.totalCommission = $scope.totalCommission + Number(wardrobeItem.commission)

  $scope.acceptJob = ->
    $scope.currentEvent.status = 'accepted'
    Events.save $scope.currentEvent, () ->
      console.log 'back'

  $scope.runQuery = ->
    $scope.showSpinner = true
    RS.query $scope.keyword, $scope.designer, $scope.offset, $scope.minPrice, $scope.maxPrice, (queryShopItems) ->
      $scope.$apply ->
        $scope.showSpinner = false
        $scope.selection = queryShopItems

  $scope.showDetail = (shopItem, inWardrobe) ->
    $scope.currentShopItem = shopItem
    $scope.showRemove = inWardrobe
    $('#shoppingItemModal').modal()

  $scope.addToWardrobe = ->
    $scope.wardrobe.push $scope.currentShopItem
    $scope.totalWardrobe = $scope.totalWardrobe + Number($scope.currentShopItem.price)
    $scope.totalCommission = $scope.totalCommission + Number($scope.currentShopItem.commission)

  $scope.removeFromWardrobe = ->
    angular.forEach $scope.wardrobe, (warItem, warKey) ->
      if warItem.sku is $scope.currentShopItem.sku
        $scope.wardrobe.splice(warKey, 1)
        $scope.totalWardrobe = $scope.totalWardrobe - Number(warItem.price)
        $scope.totalCommission = $scope.totalCommission - Number(warItem.commission)

  $scope.nextSelection = ->
    $scope.offset = $scope.offset + 12
    $scope.runQuery()

  $scope.previousSelection = ->
    if $scope.offset > 0
      $scope.offset = $scope.offset - 12
      $scope.runQuery()

  $scope.saveWardrobe = ->
    $scope.currentEvent.itemList = $scope.wardrobe
    $scope.currentEvent.proposedBudget = $scope.totalWardrobe
    Events.save $scope.currentEvent, () ->
      $scope.saveStatus = 'btn-success' 

  $scope.submitForApproval = ->
    $scope.selectedIndex
    $scope.currentEvent.status = 'pending'
    $scope.currentEvent.proposedBudget = $scope.totalWardrobe
    $scope.currentEvent.itemList = $scope.wardrobe
    Events.save $scope.currentEvent, () ->
      $scope.approvalStatus = 'btn-success' 

      # Reload accepted
      Events.getAccepted (accpetedEvents) ->
        $scope.accpetedEvents = accpetedEvents
        $scope.currentEvent = accpetedEvents[0]
        $scope.openAcceptedJob $scope.currentEvent, $scope.currentEvent
        $scope.selectedIndex = 0
        accpetedSeleted = true
        $scope.approvalStatus = 'btn-warning' 
        $scope.saveStatus = '' 

        Notification.newNotification $scope.currentEvent, 'submitted'


# ////////////////////////////////
# Pending
# ////////////////////////////////

PendingCtrl = ($scope, $state, $timeout, Events, RS) ->

  Events.getPending (pendingEvents) ->
    console.log 'getting pending'
    $scope.pendingEvents = pendingEvents
    $scope.currentEvent = pendingEvents[0]
    $scope.selectedIndex = 0
    $scope.openPendingJob $scope.selectedIndex, $scope.currentEvent
    pendingSeleted = true

  $scope.openPendingJob = (pendingKey, pendingEvent) ->
    console.log 'in pending'
    $scope.currentEvent = pendingEvent
    $scope.selectedIndex = pendingKey

    if pendingEvent.status is 'pending'
      $scope.pendingNote = 'Waiting on client to approve.'
    

# ////////////////////////////////
# Shipped
# ////////////////////////////////

ShippedCtrl = ($scope, $state, $timeout, Events, RS) ->
  
  $scope.submitShipped = ->
    $scope.currentEvent.status = 'shipped'
    Events.save $scope.currentEvent, () ->
      $scope.shippedStatus = 'btn-success' 

      # Reload accepted
      Events.getShipped (shippedEvents) ->
        $scope.shippedEvents = shippedEvents
        $scope.currentEvent = shippedEvents[0]
        $scope.openAcceptedJob $scope.currentEvent, $scope.currentEvent
        $scope.selectedIndex = 0
        accpetedSeleted = true
        $scope.shippedStatus = 'btn-warning' 
        $scope.shippedStatus = '' 

        Notification.newNotification $scope.currentEvent, 'shipped'


# Data Models
valetModels = angular.module("valetModels", [])

valetModels.service "Events", ($http, DB_URL) ->
  
	self = @
	@available = {}
	@accepted = {}
	@pending = {}
	@shipped = {}

	@getAvailable = (cb) ->
		link = DB_URL + 'group/valet/events/status/new'
		$http.get(link).success (_availableEvents) ->
		  self.available = _availableEvents
		  cb _availableEvents

	@getAccepted = (cb) ->
		link = DB_URL + 'group/valet/events/status/accepted'
		$http.get(link).success (_acceptedEvents) ->
		  self.accepted = _acceptedEvents
		  cb _acceptedEvents

	@getPending = (cb) ->
		link = DB_URL + 'group/valet/events/status/pending'
		$http.get(link).success (_pendingEvents) ->
		  console.log 'got pending'
		  console.log _pendingEvents
		  self.pending = _pendingEvents
		  cb _pendingEvents

	@getShipped = (cb) ->
		link = DB_URL + 'group/valet/events/status/shipped'
		$http.get(link).success (_shippedEvents) ->
		  self.shipped = _shippedEvents
		  cb _shippedEvents
		
	@save = (_event, cb) ->
		delete _event._id
		$http.put(DB_URL + 'valet/events/eid/' + _event.eid, _event).success (result) ->
			console.log 'saved!'
			cb()
        
valetModels.service "RS", ($http, DB_URL) ->

	self = @
	token = ""

	@query = (keywords, designers, offset, minPrice, maxPrice, cb) ->
		
		# Setup keywords
		if keywords is undefined
			keywords = ""
		else 
			keywords = '&keywords=' + keywords
		
		# Setup designers
		if designers is undefined
			designers = ""
		else 
			designers = '&designers[]=' + designers

		# Setup other params
		offset = '&offset=' + offset
		minPrice = '&priceMin=' + minPrice
		maxPrice = '&priceMax=' + maxPrice

		link = 'https://api.rewardstyle.com/v1/search?oauth_token=' + self.token + minPrice + maxPrice + keywords + designers + '&limit=12' + offset
		console.log link
		$.ajax(
		  url: link
		  dataType: "json"
		  beforeSend: (xhr) ->
		    xhr.overrideMimeType "text/plain; charset=x-user-defined"
		).done (data) ->
		  cb data.products

valetModels.service "Notification", ($http, DB_URL) ->

	self = @

	@newNotification = (notifyEvent, type) ->
	  
		switch type
			when 'accepted'
				message = 'Your event has been accepted by a personal shopper.'
				group = 'action'
			when 'submitted'
				message = 'Your wardrobe has been selected by your personal shopper.'
				group = 'attention'
			when 'shipped'
				message = 'Your wardrobe has been shipped.'
				group = 'action'

		newNotification =
			nid: Math.random().toString(36).substr(2, 16)
			client: notifyEvent.client
			message: message
			type: type
			event: notifyEvent.eid
			group: 'attention'
			date: moment().format("YYYY-MM-DD")
			time: moment().format("HH:mm:ss")
			viewed: false
			deleted: false

		$http.post(DB_URL + 'valet/notifications', newNotification).success (result) ->
			console.log 'notification saved!'
			cb()




