var searchMap;

function initMap(mapContainer) {
  var myOptions = {
    zoom: 1,
    center: new google.maps.LatLng(30, 0),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  searchMap = new google.maps.Map(document.getElementById(mapContainer),
    {
      zoom: 1,
      center: new google.maps.LatLng(30, 0),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });

  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(browserGeolocationSuccess);
  }
}

function browserGeolocationSuccess(position) {
  searchMap.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
  searchMap.setZoom(7);
}
