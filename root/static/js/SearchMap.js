var searchMap;

function initMap(mapContainer) {
  if(searchMap)
    return;
  var myOptions = {
    zoom: 1,
    center: new google.maps.LatLng(30, 0),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  searchMap = new google.maps.Map(document.getElementById(mapContainer),
    {
      zoom: 2,
      center: new google.maps.LatLng(40, 0),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      scrollwheel: false
    });

  //it's neat, but it serves no practical purpose
  //if(navigator.geolocation){
  //  navigator.geolocation.getCurrentPosition(browserGeolocationSuccess);
  //}
}

function browserGeolocationSuccess(position) {
  searchMap.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
  searchMap.setZoom(7);
}
