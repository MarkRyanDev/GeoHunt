function cloneAsObject(obj) {
  if (obj === null || !(obj instanceof Object)) {
      return obj;
  }
  var temp = (obj instanceof Array) ? [] : {};
  for (var key in obj) {
      temp[key] = cloneAsObject(obj[key]);
  }
  return temp;
}
function getLocation(){
  $('#gotten').html('getting...')
  if(!"geolocation" in navigator){
    $('#message').html("ERROR: No geolocation support")
    return
  }
  if(!google){
    $('#message').html("Google Maps API not loaded")
    return
  }
  navigator.geolocation.getCurrentPosition(geo => {
    $('#gotten').html('gotted!')
    let clone = cloneAsObject(geo)
    $('#message').html(JSON.stringify(clone, null, 2))
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: geo.coords.latitude, lng: geo.coords.longitude},
      zoom: 16
    });
    circle = new google.maps.Circle({
      map: map,
      center: {lat: geo.coords.latitude, lng: geo.coords.longitude},
      radius: geo.coords.accuracy,
      fillColor : '#238EDB',
      lineColor : '#275DDB'
    })
    $.post('/api/v1/location', clone.coords)
  })
}
