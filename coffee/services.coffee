
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




