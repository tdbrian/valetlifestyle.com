
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
        