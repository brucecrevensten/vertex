var searchMap;

function initMap(mapContainer) {
  if(window.searchMap) return;

  var initLatLng = new google.maps.LatLng(40,-100);

  window.searchMap = new google.maps.Map(document.getElementById('searchMap'),
    {
      center: initLatLng,
      mapTypeId: google.maps.MapTypeId.TERRAIN,
      zoom:2,
      streetViewControl:false,
      overviewMapControl: true,
      overviewMapControlOptions: { opened: true }
    }
  );
}
