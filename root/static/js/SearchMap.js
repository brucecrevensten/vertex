var searchMap;

function initMap(mapContainer) {
  if(window.searchMap) return;

  window.searchMap = new google.maps.Map(document.getElementById('searchMap'),
    {
      mapTypeId: google.maps.MapTypeId.TERRAIN,
      scrollwheel: false
    });
}


