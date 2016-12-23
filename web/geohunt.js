var app = angular.module("GeoHuntApp", ["ngRoute"])
  .config(function($routeProvider, $locationProvider) {
    $routeProvider
      .when("/main", {
        templateUrl : "routes/main.html",
        controller : 'mainCtrl as mainRef'
      })
      .when("/create", {
        templateUrl : "routes/create.html",
        controller : "createCtrl as createRef"
      })
      .otherwise({
        redirectTo:"/main"
      })
    $locationProvider.html5Mode(true)
  })
  .controller("createCtrl", function ($scope, $window) {
    let create = this
    create.locations = []
    create.current = {
      init : () => {
        create.current.clues = []
        create.current.name = ""
        create.current.lat = null
        create.current.long = null
        create.current.range = null
        create.current.newClue = {
          text : "",
          range : null
        }
        create.current.addOrCreate = 'Add'
      }
    }
    create.popup = () => {
      $('#locationModal').modal('show')
      create.current.init()
    }
    create.fillLocation = () => {
      navigator.geolocation.getCurrentPosition(geo => {
        create.current.lat = geo.coords.latitude
        create.current.long = geo.coords.longitude
        $scope.$digest()
      })
    }
    create.addClue = () => {
      if(create.current.addOrCreate === 'Add'){
        create.current.clues.push(JSON.parse(JSON.stringify(create.current.newClue)))
      } else {
        create.current.clues[create.current.clues.indexOf(create.current.newClue)] =
          JSON.parse(JSON.stringify(create.current.newClue))
        create.current.addOrCreate = 'Add'
      }
      create.current.newClue.text = ''
      create.current.newClue.range = null
    }
    create.removeClue = (clue) => create.current.clues.splice(create.current.clues.indexOf(clue), 1)
    create.editClue = (clue) => {
      create.current.newClue = clue
      create.current.addOrCreate = 'Edit'
    }
    create.addLocation = () => {
      if(!create.editing){
        delete create.current.newClue
        delete create.current.addOrCreate
        create.locations.push(JSON.parse(JSON.stringify(create.current)))
      }
      $('#locationModal').modal('hide')
    }
    create.removeLocation = (location) => create.locations.splice(create.locations.indexOf(location), 1)
    create.editLocation = (location) => {
      create.current.init()
      for (let key in location) create.current[key] = location[key]
      create.editing = true
      $('#locationModal').modal('show')
    }
    create.createHunt = () => {
      let hunt = {
        name: create.name,
        locations: create.locations
      }
      $.post('/api/v1/hunts/' + hunt.name, hunt, (data, status) => {
        if (data !== 'Created') {
          alert('That Hunt name is already used, please pick a new one')
        } else {
          $window.location.href = '/main'
        }
      })
    }
  })

  .controller("mainCtrl", function ($scope) {
    let main = this
    
  }
// function cloneAsObject(obj) {
//   if (obj === null || !(obj instanceof Object)) {
//       return obj;
//   }
//   var temp = (obj instanceof Array) ? [] : {};
//   for (var key in obj) {
//       temp[key] = cloneAsObject(obj[key]);
//   }
//   return temp;
// }
// function getLocation(){
//   $('#gotten').html('getting...')
//   if(!"geolocation" in navigator){
//     $('#message').html("ERROR: No geolocation support")
//     return
//   }
//   if(!google){
//     $('#message').html("Google Maps API not loaded")
//     return
//   }
//   navigator.geolocation.getCurrentPosition(geo => {
//     $('#gotten').html('gotted!')
//     let clone = cloneAsObject(geo)
//     $('#message').html(JSON.stringify(clone, null, 2))
//     map = new google.maps.Map(document.getElementById('map'), {
//       center: {lat: geo.coords.latitude, lng: geo.coords.longitude},
//       zoom: 16
//     });
//     circle = new google.maps.Circle({
//       map: map,
//       center: {lat: geo.coords.latitude, lng: geo.coords.longitude},
//       radius: geo.coords.accuracy,
//       fillColor : '#238EDB',
//       lineColor : '#275DDB'
//     })
//     $.post('/api/v1/location', clone.coords)
//   })
// }
