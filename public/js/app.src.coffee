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
  )

# ////////////////////////////////
# Constants
# ////////////////////////////////

app.constant 'DB_URL', 'http://api.valetlifestyle.com/v1/valet/'

# ////////////////////////////////
# Available
# ////////////////////////////////

AvailableCtrl = ($scope, $state, $stateParams, $timeout, $rootScope, Events) ->

  $scope.buyer = buyer
  availableSeleted = false

  checkAvailable = ->
    Events.getAvailable (availableEvents) ->
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
      console.log 'back'

# ////////////////////////////////
# Accepted
# ////////////////////////////////

AcceptedCtrl = ($scope, $state, $stateParams, $timeout, $rootScope, Events) ->

  $scope.buyer = buyer
  $scope.minPrice = 1
  $scope.maxPrice = 1000

  $( ".priceRange" ).slider({ range: true, max: 2000, min: 1, values:[0, 1000] })
  $( ".priceRange" ).slider("option", "range", true)
  $(".priceRange").on "slidechange", (event, ui) ->
    
    $scope.$apply ->
      $scope.minPrice = ui.values[0]
      $scope.maxPrice = ui.values[1]

  Events.getAccepted (accpetedEvents) ->
    $scope.accpetedEvents = accpetedEvents
    $scope.currentEvent = accpetedEvents[0]
    accpetedSeleted = true

  $scope.openAcceptedJob = (key, availEvent) ->
    $scope.currentEvent = availEvent
    $scope.selectedIndex = key

  $scope.acceptJob = ->
    $scope.currentEvent.status = 'accepted'
    Events.save $scope.currentEvent, () ->
      console.log 'back'





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
        