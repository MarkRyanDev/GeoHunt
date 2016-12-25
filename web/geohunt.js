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
      .when('/play/:name', {
        templateUrl : 'routes/play.html',
        controller: 'playCtrl as playRef'
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
        create.current.addOrCreate = 'Add',
        create.current.circles = []
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
        if(create.center) create.center.setMap(null)
        if(create.rangeCircle) create.rangeCircle.setCenter(new google.maps.LatLng(geo.coords.latitude, geo.coords.longitude))
        for(let prop in create.current.circles) {
          create.current.circles[prop].setCenter(new google.maps.LatLng(geo.coords.latitude, geo.coords.longitude))
        }
        create.center = new google.maps.Marker({
          position: new google.maps.LatLng(geo.coords.latitude, geo.coords.longitude),
          map: create.map
        })
        $scope.$digest()
      })
    }
    create.setLocation = (coord) => {
      create.current.lat = coord.lat()
      create.current.long = coord.lng()
      if(create.center) create.center.setMap(null)
      if(create.rangeCircle) create.rangeCircle.setCenter(coord)
      for(let prop in create.current.circles) {
        create.current.circles[prop].setCenter(coord)
      }
      create.center = new google.maps.Marker({
        position: coord,
        map: create.map
      })
      $scope.$digest()
    }
    create.addClue = () => {
      if(create.current.addOrCreate === 'Add'){
        let clueCopy = JSON.parse(JSON.stringify(create.current.newClue))
        create.current.circles[clueCopy.text] = new google.maps.Circle({
          map: create.map,
          center: new google.maps.LatLng(create.current.lat, create.current.long),
          radius: create.current.newClue.range
        })
        create.current.clues.push(clueCopy)
      } else {
        create.current.circles[create.current.newClue.text].setMap(null)
        let clueCopy = JSON.parse(JSON.stringify(create.current.newClue))
        create.current.circles[clueCopy.text] = new google.maps.Circle({
          map: create.map,
          center: new google.maps.LatLng(create.current.lat, create.current.long),
          radius: create.current.newClue.range
        })
        create.current.clues[create.current.clues.indexOf(create.current.newClue)] = clueCopy
        create.current.addOrCreate = 'Add'
      }
      create.current.newClue.text = ''
      create.current.newClue.range = null
    }
    create.removeClue = (clue) => {
      create.current.circles[clue.text].setMap(null)
      create.current.clues.splice(create.current.clues.indexOf(clue), 1)
    }
    create.editClue = (clue) => {
      create.current.newClue = clue
      create.current.addOrCreate = 'Edit'
    }
    create.addLocation = () => {
      if(!create.editing) {
        delete create.current.newClue
        delete create.current.addOrCreate
        create.locations.push(JSON.parse(JSON.stringify(create.current)))
      }
      if(create.center) {
        create.center.setMap(null)
        create.center = null
      }
      if(create.rangeCircle) {
        create.rangeCircle.setMap(null)
        create.rangeCircle = null
      }
      for(let prop in create.current.circles) {
        create.current.circles[prop].setMap(null)
      }
      create.current.circles = []
      $('#locationModal').modal('hide')
    }
    create.removeLocation = (location) => create.locations.splice(create.locations.indexOf(location), 1)
    create.editLocation = (location) => {
      create.current.init()
      for (let key in location) create.current[key] = location[key]
      create.editing = true
      create.center = new google.maps.Marker({
        position: new google.maps.LatLng(create.current.lat, create.current.long),
        map: create.map
      })
      create.rangeCircle = new google.maps.Circle({
        map: create.map,
        center: new google.maps.LatLng(create.current.lat, create.current.long),
        radius: create.current.range,
        fillColor: '#14c611'
      })
      create.current.clues.forEach(clue => {
        create.current.circles[clue.text] = new google.maps.Circle({
          map: create.map,
          center: new google.maps.LatLng(create.current.lat, create.current.long),
          radius: clue.range
        })
      })
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
    create.toggleMap = () => {
      create.showMap = !create.showMap
      if(!create.map){
        navigator.geolocation.getCurrentPosition(geo => {
          create.map = new google.maps.Map(document.getElementById('createLocationMap'), {
            center: {lat: geo.coords.latitude, lng: geo.coords.longitude},
            zoom: 16
          })
          create.map.addListener('click', e => create.setLocation(e.latLng))
        })
      }
    }
    create.updateRange = () => {
      if (create.current.range) {
        if(create.rangeCircle) {
          create.rangeCircle.setRadius(create.current.range)
        } else {
          create.rangeCircle = new google.maps.Circle({
            map: create.map,
            center: new google.maps.LatLng(create.current.lat, create.current.long),
            radius: parseInt(create.current.range),
            fillColor: '#14c611'
          })
        }
      }
    }
  })

  .controller("mainCtrl", function ($scope, $window) {
    let main = this
    $.get('/api/v1/hunts', data => {
      main.hunts = data
      $scope.$digest()
    })
    main.handlePlay = hunt => {
      $window.location.href = `/play/${hunt}`
    }
  })

  .controller('playCtrl', function ($scope, $route, $routeParams) {
    this.name = $routeParams.name
    $.get(`/api/v1/hunts/${this.name}`, data => {
      this.hunt = data
      $scope.$digest()
      this.check()
    })
    this.progress = 0
    this.viewing = 0
    this.done = false
    this.currentClues = []
    this.viewClues = () => this.viewing === this.progress ? this.currentClues : this.hunt.locations[this.viewing].clues
    this.check = () => {
      navigator.geolocation.getCurrentPosition(geo => {
        if(!this.done){
          let current = this.hunt.locations[this.progress]
          let distance = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(current.lat, current.long),
            new google.maps.LatLng(geo.coords.latitude, geo.coords.longitude)
          )
          this.currentClues = current.clues.filter(clue => parseInt(clue.range) === -1 || distance <= parseInt(clue.range))
          if(distance < current.range) this.progress++
          if(this.progress === this.hunt.locations.length) {
            this.done = true
            $('#winModal').modal('show')
          }
          $scope.$digest()
        }
        if(this.mapReady){
          if(!this.map) {
            this.map = new google.maps.Map(document.getElementById('playMap'), {
              center: new google.maps.LatLng(geo.coords.latitude, geo.coords.longitude),
              zoom: 16
            })
            this.accuracyCircle = new google.maps.Circle({
              map: this.map,
              center: new google.maps.LatLng(geo.coords.latitude, geo.coords.longitude),
              radius: geo.coords.accuracy
            })
          } else {
            this.map.setCenter(new google.maps.LatLng(geo.coords.latitude, geo.coords.longitude))
            this.accuracyCircle.setCenter(new google.maps.LatLng(geo.coords.latitude, geo.coords.longitude))
          }
        }
      })

    }
    this.next = () => {
      this.viewing++
      this.check()
    }
    this.prev = () => {
      this.viewing--
      this.check()
    }
    this.toggleMap = () => {
      this.showMap = !this.showMap
      this.mapReady = true
      this.check()
    }
  })
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
