var searchMap;

function initMap(mapContainer) {
  if(window.searchMap) return;
  
  var initLatLng = new google.maps.LatLng(65,-150);

  window.searchMap = new google.maps.Map(document.getElementById('searchMap'),
    {
      center: initLatLng,
      mapTypeId: google.maps.MapTypeId.TERRAIN,
      zoom:4,
      streetViewControl:false
    });
}

