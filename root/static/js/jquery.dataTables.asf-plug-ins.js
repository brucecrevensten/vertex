// Returns the filtered results set from a datatable.
$.fn.dataTableExt.oApi.fnGetFilteredData = function(oSettings) {
  var a = [];
  _.each(oSettings.aiDisplay, function(val, key) {
    a.push(oSettings.aoData[oSettings.aiDisplay[key]]._aData);
  });
  return(a);
};

// Custom filtering for vertex's datable search results.
$.fn.dataTableExt.afnFiltering.push(
  jQuery.proxy( function( oSettings, aData, iDataIndex ) {
    if(_.any(_.pluck(SearchApp.postFilters.postFilters, 'active'))) {
      // Only apply active filters.
      var data = oSettings.aoData[iDataIndex]._aData;
      var platform = data.platform;
      var postfilter = _.find(SearchApp.postFilters.postFilters,
        function(row) { return(row.active && (row.platform === platform)); }
      );
      if(_.isUndefined(postfilter)) {
        return(false);
      } else {
        return(postfilter.filter(data));
      }
    } else {
      // None of the filters are active. So we should show everything.
      return(true);
    }
  }, this)
);
