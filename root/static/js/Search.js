//todo: this feels very much like a backbone collection, now, except
// that it is aggregating information in a slightly different way.
// perhaps this can be done more cleanly with a collection.
var SearchParameters = Backbone.Model.extend(
  {
    filters: [],

    initialize: function() {
      this.setupPreFilters();
    },
    setupPreFilters: function() {
      this.filters = [
        new GeographicFilter(),
        new DateFilter(),
        new PlatformFilter()
      ];

      this.setDefaults();

      // bind change events in filters to update this object's attributes
      for( var i in this.filters ) {
        this.filters[i].bind( "change", jQuery.proxy( function(filter) {
          this.trigger("change:filter", filter);
        }, this));
      }
      this.bind("change:filter", function(filter) {
        this.set( filter.toJSON() );
      });

    },

    setDefaults: function() {
      // initialize default values from the widgets
      for( var i in this.filters ) {
        this.filters[i].reset();
        this.set( this.filters[i].toJSON() );
      }
    },

    defaults: {
        format:"jsonp"
    },
  }
);

var SearchParametersView = Backbone.View.extend(
{
  widgets: [],

  initialize: function() {
    this.setWidgets();
    _.bindAll(this, 'render');
  },

  setWidgets: function() {
    this.widgets = [];
    for ( var i in this.model.filters ) {
      this.widgets.push(this.model.filters[i].getWidget());
    }
  },

  render: function() {

    $(this.el).accordion('destroy');
    $(this.el).empty();
    for ( var i in this.widgets ) {
      $(this.el).append( '<h3><a href="#'+this.widgets[i].model.name+'">'+this.widgets[i].title+'</a></h3>' );
      $(this.el).append( this.widgets[i].render().el );
    }
    $(this.el).accordion({
      autoHeight: false,
      navigation: true
    });
    return this;
  }

});

var BaseWidget = Backbone.View.extend(
{
  tagName: "div",
  hide: function() {
    $(this.el).hide();
  },
  show: function() {
    $(this.el).show();
  }
}
);

var BaseFilter = Backbone.Model.extend(
{
  reset: function() {
    this.set( this.defaults );
    this.trigger('reset');
  }
}
);



// TODO: put in csv-to-coord array utility functions
var GeographicFilter = BaseFilter.extend(
{
  name: "GeographicFilter",

  markers: new Array(),

  defaults: {
    bbox: "",
  },
  getWidget: function() {
    return new GeographicWidget({model:this});
  },

  events : {
    "change:bbox" : "calculateCoordinates"
  },

  calculateCoordinates: function(e) {
    var bbox = this.get('bbox').split(/,/);
    this.swLat = Math.min(bbox[1], bbox[3]);
    this.swLon = Math.min(bbox[0], bbox[2]);
    this.neLat = Math.max(bbox[1], bbox[3]);
    this.neLon = Math.max(bbox[0], bbox[2]);
  },

  reset: function() {
    for(var ii = 0; ii < this.markers.length; ii++) {
      this.markers[ii].setMap(null);
      delete this.markers[ii];
    }
    this.markers = new Array();
    this.set({ "bbox": ""});
  }

}
);

var GeographicWidget = BaseWidget.extend(
{
  title: "Geographic Region",
  titleId: "geographic_widget_title",
  id: "geographic_widget",
  clickListener: null,
  
  initialize: function() {
    _.bindAll(this, 'changed')
  },

  events : {
    "change input" : "changed"
  },
  
  changed: function(evt) {
    
    this.model.set( { "bbox": $(this.el).find('input').val() });

    this.render();
  
  },
  render: function() {
    $(this.el).html(
      _.template('\
<p>Enter the bounding box as a comma-separated list of points in the order West,North,East,South.  Example: -135,66,-133,64</p>\
<label for="filter_bbox">Bounding box:</label>\
<input type="text" id="filter_bbox" name="bbox" value="<%= bbox %>">\
<button class="ui-button ui-widget ui-state-default ui-corner-all" id="ClearBbox">Clear</button>\
', this.model.toJSON())
    );
    this.renderMap();
    $(this.el).find('#ClearBbox').bind('click', jQuery.proxy(this.clear, this));

    return this;
  },

  renderMap: function() {

    initMap();

    var selfref = this; //needed for the events below, as 'this' does not obtain closure
    if(this.clickListener == null) {
      this.clickListener = google.maps.event.addListener(searchMap, 'click', function(event) {
        if(selfref.model.markers.length >= 2) { return; }
        var marker = new google.maps.Marker({
          position: event.latLng,
          map: searchMap,
          draggable: true
        });
        google.maps.event.addListener(marker, 'drag', function() {
          selfref.updateSearchAreaOverlay();
        });
        google.maps.event.addListener(marker, 'dragend', function() {
          selfref.updateWidgetFromOverlay();
        });
        selfref.model.markers.push(marker);
        if(selfref.model.markers.length == 2) {
          selfref.updateSearchAreaOverlay();
          selfref.updateWidgetFromOverlay();
        }
      });
    }

    this.searchAreaOverlay.setMap(searchMap);
    if(this.model.markers.length == 2) {
      this.searchAreaOverlay.setBounds(new google.maps.LatLngBounds(
        this.model.markers[0].getPosition(), this.model.markers[1].getPosition()
      ));
      //searchMap.fitBounds(this.searchAreaOverlay.getBounds());
    } else {
      this.searchAreaOverlay.setBounds(null);
    }

    return this;
  },

  searchAreaOverlay : new google.maps.Rectangle( {
    strokeColor: '#0000FF',
    strokeOpacity: 0.5,
    strokeWeight: 2,
    fillColor: '#0066CC',
    fillOpacity: 0.5,
    clickable: false,
    zIndex: 500 //always be below the granule overlays, which start at 1000
  }), 

  updateSearchAreaOverlay: function() {
    var sw = this.model.markers[0].getPosition();
    var ne = this.model.markers[1].getPosition();
    var w = Math.min(sw.lng(), ne.lng()).toFixed(2);
    var s = Math.min(sw.lat(), ne.lat()).toFixed(2);
    var e = Math.max(sw.lng(), ne.lng()).toFixed(2);
    var n = Math.max(sw.lat(), ne.lat()).toFixed(2);
    var latLngBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(s, w),
      new google.maps.LatLng(n, e));
    this.searchAreaOverlay.setBounds(latLngBounds);
    var target = $('#filter_bbox');
    target.val([w, n, e, s].join(','));
  },

  updateWidgetFromOverlay: function() {
    var bounds = this.searchAreaOverlay.getBounds();
    var sw = bounds.getSouthWest();
    var ne = bounds.getNorthEast();
    var target = $('#filter_bbox');
    target.val([
      Math.min(sw.lng(), ne.lng()).toFixed(2),
      Math.min(sw.lat(), ne.lat()).toFixed(2),
      Math.max(sw.lng(), ne.lng()).toFixed(2),
      Math.max(sw.lat(), ne.lat()).toFixed(2)
    ].join(','));
    var data = {};
    data[target.attr('name')] = target.attr('value');
    this.model.set(data);
  },

  clear: function() {
    this.model.reset();
    $('#filter_bbox').val('');
    this.searchAreaOverlay.setBounds(null);
  }

}
);

var DateFilter = BaseFilter.extend(
{ name: "DateFilter",
  defaults: {
      start:"2009-12-01",
      end:"2010-06-15",
  },
  getWidget: function() { 
    return new DateWidget({model:this});
  }
});

var DateWidget = BaseWidget.extend(
{
  title: "Date",
  titleId: "date_widget_title",
  tagName: "div",
  id: "date_widget",
  initialize: function() {
    _.bindAll(this, "render");
  },
  events : {
    "change input" : "changed"
  },
  changed: function(evt) {
      var target = $(evt.currentTarget),
      data = {};
      data[target.attr('name')] = target.attr('value');
      this.model.set(data);
  },
  render: function() {
    today = new Date();
    $(this.el).html(
      _.template('<label for="filter_start">Start date (YYYY-MM-DD)</label><input type="text" id="filter_start" name="start" value="<%= start %>">\
      <label for="filter_end">End date (YYYY-MM-DD)</label><input type="text" id="filter_end" name="end" value="<%= end %>">\
      ', this.model.toJSON())
    );
    $(this.el).find('#filter_start').datepicker({
        dateFormat: 'yy-mm-dd',
        changeMonth: true,
        changeYear: true,
        minDate: new Date(1990, 1 - 1, 1),
        yearRange: '1990:'+today.getFullYear()
    });
    start_date = $(this.el).find('#filter_start').datepicker().val();
    $(this.el).find('#filter_start').datepicker("setDate", start_date);

    $(this.el).find('#filter_end').datepicker({
        dateFormat: 'yy-mm-dd',
        changeMonth: true,
        changeYear: true,
        minDate: new Date(1990, 1 - 1, 1),
        yearRange: '1990:'+today.getFullYear()
    });
    end_date = $(this.el).find('#filter_end').datepicker().val();
    $(this.el).find('#filter_end').datepicker("setDate", end_date);

    return this;
  }
});

var PlatformFilter = BaseFilter.extend(
  {
    name: "PlatformFilter",
    defaults: {
      platform: ["E1","E2","J1","A3","R1","UA"]
    },
    getWidget: function() {
      return new PlatformWidget({model:this});
    },
  }
);

var PlatformWidget = BaseWidget.extend(
  {
    title: "Platforms",
    titleId: "platform_widget_title",
    id: "filter_platform",
    platformTypes: {
      // value : display name -- order is respected, here
      "UA" : "UAVSAR",
      "A3" : "ALOS",
      "R1" : "RADARSAT-1",
      "E1" : "ERS-1",
      "E2" : "ERS-2",
      "J1" : "JERS-1"
    },

    initialize: function() {
      _.bindAll(this, 'render', 'renderPlatformInfo')
    },

    events : {
      "change input" : "changed",
    },

    changed: function(evt) {
      var a = $(this.el).find('input:checkbox:checked').serializeArray();
      this.model.clear({silent:true});
      this.model.set( { platform: _.pluck(a,"value") } );
    },

    render: function() {

      $(this.el).empty();
      var checked = this.model.toJSON()["platform"];
      for( var key in this.platformTypes ) {
        rowData = {
          name: this.platformTypes[key],
          id: "pf_"+this.platformTypes[key],
          value: key,
          ifChecked: ( _.indexOf(checked, key) > -1 ) ? 'checked="checked"' : ''
        };
        var i = $('<li>');
        $(i).html( _.template('\
<div class="composite_checkbox_wrapper">\
<input type="checkbox" id="<%= id %>" <%= ifChecked %> name="platform" value="<%= value %>" /><label style="text-align: left; width: 160px;" for="<%= id %>"><%= name %></label>\
<button style="display:inline-block;" platform="<%= name %>">?</button>\
</div>\
', rowData));
        $(i).find('.composite_checkbox_wrapper').buttonset();
        $(i).find('input').button().click( function() {
          if( true == $(this).prop('checked') ) {
            $(this).button( "option", "icons", { primary: "ui-icon-check" });
          } else {
            $(this).button( "option", "icons", {} );
          }
        });
       
        $(i).find('input:checkbox:checked').button( "option", "icons", { primary: "ui-icon-check" }).prop('checked', true);
        $(i).find('button').button( { icons: { primary: "ui-icon-info"}, text: false}).click( this.renderPlatformInfo );
        $(this.el).append(i);
      }
      return this;
    },

    platformInformation: {
      'ALOS': {
        name: "ALOS",
        imageUrl: "http://www.asf.alaska.edu/sites/all/files/images/satellites/alos.png",
        launchDate: "24 Jan 2006",
        altitude: "700 km",
        cycle: "46 Days",
        status: "Out of Service April 22, 2011",
        website: "http://www.jaxa.jp/projects/sat/alos/index_e.html",
        description: "Japan launched ALOS (Advanced Land Observing Satellite) in January 2006, aboard an H2-A rocket. The 4000-kilogram satellite, renamed Daichi, was placed in a near-polar orbit. ALOS remote-sensing equipment enables precise land coverage observation and can collect enough data by itself for mapping on a scale of 25,000:1, without relying on points of reference on the ground. Some of its objectives are cartography, disaster monitoring, natural resource surveys and technology development.",
        dataDescription: "ALOS PALSAR data are available from the SDC for US researchers with an approved ALOS PALSAR Proposal. ALOS PALSAR at the SDC is focused on North, South and Central America but global data are available.<br/><br/>PALSAR data are available as:",
        processingType1: "Level 1.0: Reconstructed, unprocessed signal data with radiometric- and geometric-correction coefficients appended but not applied.",
        processingType2: "Level 1.1: Single Look Complex products provided in slant range geometry and compressed in range and azimuth. Individual files are provided for each polarization for multi-polarization modes.",
        processingType3: "Level 1.5: Multi-look processed images projected onto map coordinates. Data can be processed either geo-referenced or geo-coded. Individual files are provided for each polarization for multi-polarization modes.",
        processingFooter: 'PALSAR data are provided in CEOS format. More detailed product descriptions are available from the <a href="http://www.eorc.jaxa.jp/ALOS/en/doc/format.htm">JAXA website</a>.'
      },
      'ERS-1': {
        name: "ERS-1",
        imageUrl: "http://www.asf.alaska.edu/sites/all/files/images/satellites/ers1.png",
        launchDate: "17 Jan 1991",
        altitude: "785 km",
        cycle: "35 Days",
        status: "Out of Service March 2000",
        website: "http://earth.esa.int/ers/",
        description: "ERS-1 (European Remote Sensing) was a European Space Agency (ESA) satellite for remote sensing from a polar orbit. The 2400 kilogram satellite was inserted into a sun-synchronous polar orbit by an Ariane 4 launcher. The primary mission of ERS-1 was to perform remote sensing of the Earth's oceans, ice caps, and coastal regions.<br/><br/>The satellite provided systematic, repetitive global measurements of wind speed and direction, wave height, surface temperatures, surface altitude, cloud cover, and atmospheric water vapor levels.",
        dataDescription: 'Archived ERS-1 SAR data are available from the ASF SAR Data center for the regions covered by the ASF STGS station mask and the McMurdo station mask. Anyone may search the SDC archive using this interface. However, ERS-1 data are considered restricted data and a <a href="http://www.asf.alaska.edu/program/sdc/proposals">short proposal</a> is required to receive the data.<br/><br/>ERS-1 data are available at three different processing levels.',
        processingType1: "Level Zero: Raw signal data that requires SAR processing before it can be visualized. Data can be received as a swath product in SKY telemetry format or subdivided into frames with an accompanying CEOS format leader file.",
        processingType2: "Single Look Complex (SLC): Processed SAR data that contains both amplitude and phase information. The data is not multilooked and to be visualized must be further processed to an amplitude image.",
        processingType3: "Detected Image: Fully processed SAR data which only contains the amplitude information. Image does not require any further SAR processing to be visualized.",
        processingFooter: ''
      },
      'ERS-2': {
        name: "ERS-2",
        imageUrl: "http://www.asf.alaska.edu/sites/all/files/images/satellites/ers2.png",
        launchDate: "20 April 1995",
        altitude: "783 km",
        cycle: "35 Days",
        status: "In Service",
        website: "http://earth.esa.int/ers/",
        description: 'ERS-2 (European Remote Sensing) is a European Space Agency (ESA) satellite for remote sensing from a polar orbit. The 2500 kilogram satellite provides global and repetitive observations of the environment using techniques which allow imaging in all weather conditions. The ERS-2 satellite is essentially the same as ERS-1 except that it includes a number of enhancements and it is carrying a new payload instrument to measure the chemical composition of the atmosphere, named the Global Ozone Monitoring Experiment (GOME). ',
        dataDescription: 'Archived ERS-2 SAR data are available from the ASF SAR Data center for the regions covered by the ASF STGS station mask and the McMurdo station mask. Anyone may search the SDC archive using this interface. However, ERS-2 data are considered restricted data and a <a href="http://www.asf.alaska.edu/program/sdc/proposals">short proposal</a> is required to receive the data.<br/><br/>ERS-2 data are available at three different processing levels.',
        processingType1: 'Level Zero: Raw signal data that requires SAR processing before it can be visualized. Data can be received as a swath product in SKY telemetry format or subdivided into frames with an accompanying CEOS format leader file.',
        processingType2: 'Single Look Complex (SLC): Processed SAR data that contains both amplitude and phase information. The data is not multilooked and to be visualized must be further processed to an amplitude image.',
        processingType3: 'Detected Image: Fully processed SAR data which only contains the amplitude information. Image does not require any further SAR processing to be visualized.',
        processingFooter: ''
       },
      'JERS-1': {
        name: "JERS-1",
        imageUrl: "http://www.asf.alaska.edu/sites/all/files/images/satellites/jers1.png",
        launchDate: "11 Feb 1992",
        altitude: "565&ndash;580 km",
        cycle: "44 Days",
        status: "Out of Service Oct 1998",
        website: "http://www.eorc.jaxa.jp/JERS-1/en/index.html",
        description: 'JERS-1 (Japanese Earth Resources Satellite) was launched by the Japan Aerospace Exploration Agency (JAXA) aboard a Japanese H-1 launcher, to provide global and repetitive observations of the environment using techniques which allow imaging to take place in all weather conditions. Its primary objective was gathering data on global land masses while conducting observation for land surveys, agricultural-forestry-fisheries, environmental protection, disaster prevention and coastal surveillance.',
        dataDescription: 'Archived JERS-1 SAR data are available from the ASF SAR Data and coverage is global. Anyone may search the SDC archive using this interface. However, JERS-1 data are considered restricted data and a <a href="http://www.asf.alaska.edu/program/sdc/proposals">short proposal</a> is required to receive the data.<br/><br/>JERS-1 data are available at three different processing levels.',
        processingType1: 'Level Zero: Raw signal data that requires SAR processing before it can be visualized. Data can be received as a swath product in SKY telemetry format or subdivided into frames with an accompanying CEOS format leader file.',
        processingType2: 'Single Look Complex (SLC): Processed SAR data that contains both amplitude and phase information. The data is not multilooked and to be visualized must be further processed to an amplitude image.',
        processingType3: 'Detected Image: Fully processed SAR data which only contains the amplitude information. Image does not require any further SAR processing to be visualized.',
        processingFooter: ''
       },
      'RADARSAT-1': {
        name: "RADARSAT-1",
        imageUrl: "http://www.asf.alaska.edu/sites/all/files/images/satellites/radarsat-1.png",
        launchDate: "4 Nov 1995",
        altitude: "798 km (793-821 km)",
        cycle: "24 Days (343 orbits)",
        status: "In Service (SDC archive ends May 2008)",
        website: "http://www.asc-csa.gc.ca/eng/satellites/radarsat1/",
        description: 'RADARSAT-1 is an advanced Earth observation satellite developed by the Canadian Space Agency (CSA) to monitor environmental change and to support resource sustainability. NASA launched RADARSAT-1 aboard a Delta-II rocket in exchange for access to the satellite on a pro rata basis through the Alaska Satellite Facility (ASF).<br/><br/>At the heart of RADARSAT-1 is an advanced radar sensor called Synthetic Aperture Radar (SAR). SAR is a microwave instrument, which sends pulsed signals to the Earth and processes the received reflected pulses. SAR operates day or night, regardless of weather conditions. RADARSAT-1 was placed into a sun-synchronous polar orbit in order to provide global coverage. Research emphasis will be on the Polar Regions, though onboard tape recorders will allow imaging of any region, worldwide.',
        dataDescription: 'RADARSAT-1 data at the SDC is global in nature but only includes data acquired prior to May 3, 2008. Anyone may search the SDC archive using this interface for RADARSAT-1 data. However, most RADARSAT-1 data considered restricted and a <a href="http://www.asf.alaska.edu/program/sdc/proposals">short proposal</a> is required to access the data.<br/><br/>RADARSAT-1 data are available at three different processing levels.',
        processingType1: 'Level Zero: Raw signal data that requires SAR processing before it can be visualized. Data can be received as a swath product in SKY telemetry format or subdivided into frames with an accompanying CEOS format leader file.',
        processingType2: 'Single Look Complex (SLC): Processed SAR data that contains both amplitude and phase information. The data is not multilooked and to be visualized must be further processed to an amplitude image.',
        processingType3: 'Detected Image: Fully processed SAR data which only contains the amplitude information. Image does not require any further SAR processing to be visualized.',
        processingFooter: ''
       },
      'UAVSAR': {
        name: 'UAVSAR -- not defined yet',
        imageUrl: '',
        launchDate: '',
        altitude: '',
        cycle: '',
        status: '',
        website: '',
        description: '',
        dataDescription: '',
        processingType1: '',
        processingType2: '',
        processingType3: '',
        processingFooter: ''
      }
    },
    renderPlatformInfo: function(e) {
      var platform = $(e.currentTarget).attr('platform');
      $('#platform_profile').html(
        _.template( '\
<div class="platformInformation">\
<h3><%= name %> Highlights</h3>\
<img src="<%= imageUrl %>" />\
<ul>\
<li>Launch Date: <strong><%= launchDate %></strong></li>\
<li>Altitude: <strong><%= altitude %></strong></li>\
<li>Cycle: <strong><%= cycle %></strong></li>\
<li>Status : <strong><%= status %></strong></li>\
<li>Website : <a href="<%= website %>"><%= website %></a></li>\
</ul>\
<h3>Detailed Summary</h3>\
<p><%= description %></p>\
<h3><%= name %> Data</h3>\
<p><%= dataDescription %></p>\
<ul>\
  <li><%= processingType1 %></li>\
  <li><%= processingType2 %></li>\
  <li><%= processingType3 %></li>\
</ul>\
<p><%= processingFooter %></p>\
', this.platformInformation[platform])).dialog(
        {
          title: platform,
          width: 800,
          modal: true,
          draggable: false,
          resizable: false
        }
      );
    }
  }
);
