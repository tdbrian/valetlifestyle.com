
# Data Models
valetModels = angular.module("valetModels", [])

valetModels.service "Auth", ($http, localStorageService) ->
  
  self = @
  @currentUser = {}