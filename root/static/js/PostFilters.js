var PostFilters = Backbone.Model.extend(
  {
    postFilters: [],
    initialize: function() {
      this.postFilters = [
        new RadarsatFacet(),
        new AlosFacet(),
      ];

      self = this;
      for( var i in this.postFilters ) {
        this.postFilters[i].bind( "change", function(filter) {
          self.trigger("change:postfilter", filter);
        });
      }

      this.bind("change:postfilter", function(filter) {
        var v = {};
        v[filter.name] = filter.toJSON();
        this.set( v );
      });

    },

    // todo: this needs to be platform-specific, otherwise it's a surprise.  still need this global reset, I think,
    // when new searches are triggered -- tbd.
    reset: function() {
      for( var i in this.postFilters ) {
        this.postFilters[i].reset();
      }
    },
    
    applyFilters: function( data ) {
      for( var i in this.postFilters ) {
        data = this.postFilters[i].filter(data);
      }
      return data;
    }
  }
);

var PostFiltersView = Backbone.View.extend(
{
  widgets: [],
  initialize: function() {
    _.bindAll(this, 'render');
  },
  setWidgets: function() {
    this.widgets = [];
    for ( var i in this.model.postFilters ) {
      // TODO: another possible memory leak here if the widgets aren't getting destroyed
      this.widgets.push(this.model.postFilters[i].getWidget());
    }
  },
  render: function(platforms) {

    this.setWidgets();
    $(this.el).accordion("destroy");
    $(this.el).empty().append( jQuery('<h3><a href="#">Filter by platform</a></h3>'));
    var d = jQuery('<div/>');
    for ( var i in this.widgets ) {
      if( -1 != _.indexOf( platforms, this.widgets[i].name )) {
        d.append( this.widgets[i].render().el );
      } 
    }
    $(this.el).append(d).accordion();
    return this;
  }

});


var PlatformFacet = BaseFilter.extend( {} ); 
var PlatformFacetView = BaseWidget.extend( {

  // selected = this.model.toJSON
  // key = key name to use in selected.key
  // container = element into which all these items should be appended
  // source = data structure in format: [ { title:string, group:string, modes: [ { label:label, value:inputValue }, ... ] }, ... ]
  // id = string, ID fragment to prepend in dynamically-generated elements
  // param = string, name of http parameter
  renderButtonset: function( selected, key, el, source, id, name, ifChecked ) {

    for( var i in source ) {
      $(el).append( _.template('<h5><%= title %></h5>', source[i] ));
      newEl = jQuery('<div/>', {
        id: id+"_"+source[i].group,
        "class": "beamSelector"
      });
      newEl.prop('beam', source[i].group);
      for( var j in source[i].modes ) {
        idVal = source[i].modes[j].value.replace('.','_');
        $(newEl).append( 
          _.template(
            '<input type="checkbox" class="beamSelector" name="<%= name %>[]" value="<%= value %>" <%= ifChecked %> id="<%= id %>_<%= group %>_<%= idValue %>" /><label for="<%= id %>_<%= group %>_<%= idValue %>"><%= label %></label>',
            {
              ifChecked: ( -1 !== _.indexOf( selected[key], source[i].modes[j].value )) ? 'checked="checked"' : '',
              group: source[i].group,
              value: source[i].modes[j].value,
              label: source[i].modes[j].label,
              id: id,
              idValue: idVal,
              name: name
            }
          )
        )
      }
      $(el).append( newEl );
      $(el).find('.beamSelector').each(function(index) {
        $(this).buttonset();
      });
    }
    $(el).append( jQuery('<a/>', { 'class':'toggler' }).button( { icons: { primary: 'ui-icon-shuffle' }, label: 'Toggle all'} ).click( jQuery.proxy( function(e) {
      $(this.el).find('input:checkbox').click();

    }, this) ) );
  }

} );

var AlosFacet = PlatformFacet.extend(
  {
    name: "ALOS",
    defaults: {
      path: null,
      frame: null,
      direction: 'any',
      beamoffnadir: [
        'FBS21.5',
        'FBS34.3',
        'FBS41.5',
        'FBS50.8',
        'FBD34.3',
        'PLR21.5',
        'PLR23.1',
        'WB127.1',
      ]
    },
    getWidget: function() {
      return new AlosFacetButton({model: this});
    },
    filter: function( d ) {
      var f = this.toJSON();
      d = _.reject( d, function(row) {
        return ( f.direction != 'any' && row.ASCENDINGDESCENDING != f.direction ); 
      });

      // todo: move building the arrays to validation / setting phase? later.
      if( f.frame ) {
        var frames = this.buildArrayFromString(f.frame);
        d = _.reject( d, function(row) {
          return ( -1 == _.indexOf( frames, row.FRAMENUMBER ) );
        });
      }

      if( f.path ) {
        var paths = this.buildArrayFromString(f.path);
        d = _.reject( d, function(row) {
          return ( -1 == _.indexOf( paths, row.PATHNUMBER ) );
        });
      }

      if( f.beamoffnadir.length ) {
        d = _.reject( d, function(row) {
          return ( -1 == _.indexOf( f.beamoffnadir, row.BEAMMODETYPE.concat(row.OFFNADIRANGLE)));
        });
      }
      return d;
    },
    buildArrayFromString: function( s ) {
      var a = [];
      if ( !s ) { return a; }
      s = s.split(',');
      try {
        for( var i = 0; i < s.length; ++i ) {
          if( -1 == s[i].indexOf('-')) {
            // individual frame
            a.push( parseInt( s[i]) );
          } else {
            // range
            r = s[i].split('-');
            lb = Math.min(parseInt(r[0]), parseInt(r[1]));
            ub = Math.max(parseInt(r[0]), parseInt(r[1]));
            for( var j = lb; j <= ub; ++j ) {
              a.push( j );
            }
          }
        }
      } catch(err) {
        // TODO: handle this in validation or something.
      }
      return a;
    }

  }
);

var AlosFacetDialog = PlatformFacetView.extend( {
  className: "platformFacet",
  id: "platform_facet",
  tagName: "form",

  events: { 
    "change input" : "changed",
  },
  initialize: function() {
    this.render();
  },
  changed: function(e) {
    this.model.clear( { silent: true });
    var beamoffnadir  = [];
    $(this.el).find('.beamSelector :checked').each( function(i, el) { beamoffnadir.push( $(el).val() ); });
    var direction = $(this.el).find('input[name="direction"]:checked').val();
    var path = $(this.el).find('input[name="path"]').val();
    var frame = $(this.el).find('input[name="frame"]').val();

    this.model.set({
      beamoffnadir: beamoffnadir,
      direction: direction,
      path: path,
      frame: frame
    });
  },
  beamModes: [
    {
      title: "FBS (Fine Beam Single Polarization)",
      group: "FBS",
      modes: [
        { label: "21.5&deg;", value: "FBS21.5" },
        { label: "34.3&deg;", value: "FBS34.3" },
        { label: "41.5&deg;", value: "FBS41.5" },
        { label: "50.8&deg;", value: "FBS50.8" }
      ]
    },
    {
      title: "FBD (Fine Beam Double Polarization)",
      group: "FBD",
      modes: [
        { label: "34.3&deg", value: "FBD34.3" }
      ]
    },
    {
      title: "PLR (Polarimetric Mode)",
      group: "PLR",
      modes: [
        { label: "21.5&deg;", value: "PLR21.5" },
        { label: "23.1&deg;", value: "PLR23.1" }
      ]
    },
    {
      title: "WB1 (ScanSAR Burst Mode 1)",
      group: "WB1",
      modes: [
        { label: "27.1&deg;", value: "WB127.1" }
      ]
    }
  ],
  render: function() {

    $(this.el).empty();

    var b = jQuery('<div/>');
    this.renderButtonset( this.model.toJSON(), 'beamoffnadir', b, this.beamModes, 'a3', 'offnadir', function(s, k, bm, bg) { 
    } );

    var fs = jQuery('<fieldset/>').html( jQuery('<legend>Beam Modes & Off-Nadir Angles</legend>')).append(b);
    $(this.el).append(fs);

    var d = new DirectionWidgetComponent( { model: this.model });
    var fs = jQuery('<fieldset/>').html( jQuery('<legend>Flight Direction</legend>')).append(d.render().el);
    $(this.el).append(fs);

    var p = new PathFrameWidgetComponent( { model: this.model });
    p.legend = 'Path/Frame';
    p.pathLabel = 'Path';

    $(this.el).append( p.render().el );

    $(this.el).dialog({
      width: 300,
      modal: false,
      draggable: true,
      resizable: false,
      title: "ALOS Platform Options",
      position: [30,100],
      buttons: {
        "Cancel": function() { $(this).dialog('close'); },
        "Reset": jQuery.proxy( function() {
          this.model.reset();
          this.render();
        }, this),
        "Filter": function() { SearchApp.searchResults.filter(); }
      }
    });

  }
  
});
 
var AlosFacetButton = PlatformFacetView.extend( {
  name: "ALOS",
  tagName: "button",
  initialize: function() {
    _.bindAll(this, "render", "openDialog");
  },
  events: {
    "click" : "openDialog"
  },
  openDialog: function(e) {
    var v = new AlosFacetDialog( { model: this.model } );
  },
  render: function() {
    $(this.el).button(
      {
        icons: {
          secondary: "ui-icon-zoomin"
        },
        label: this.name
      }
    );
    return this;
  }
});

/*
specifying beam modes:
+ the api needs to understand eating an http array, not just csv
- the form should have all 'checked' as default BUT this corresponds to an _empty_ array of restrictions
- need a 'toggle all' button @ radarsat
- 'toggle all' button does a 'clear' on the model's list of selected things
+ when the form is changed, the model should change
+ when the model is changed, it should notify SearchParameters and update it
- strange case: user unselects all beam modes, what to do? IL#22
*/

var RadarsatFacet = PlatformFacet.extend(
  {
    defaults: {
      beam: []
    },
    name: "RADARSAT-1",
    getWidget: function() {
      return new RadarsatFacetButton({model: this});
    },
    filter: function( d ) {
      return d;
    }
  }
);

var RadarsatFacetButton = PlatformFacetView.extend( {
  name: "RADARSAT-1",
  tagName: "button",
  initialize: function() {
    _.bindAll(this, "render", "openDialog");
  },
  events: {
    "click" : "openDialog"
  },
  openDialog: function(e) {
    var v = new RadarsatFacetDialog( { model: this.model } );
  },
  render: function() {
    $(this.el).button(
      {
        icons: {
          secondary: "ui-icon-zoomin"
        },
        label: "RADARSAT-1"
      }
    );

    return this;
 
  }
});
                                           
var RadarsatFacetDialog = PlatformFacetView.extend( {
  className: "platformFacet",
  id: "platform_facet",
  tagName: "form",
  events: {
   "change input" : "changed",
  },
  initialize: function() {
    this.render();
  },
  changed: function(e) {
    this.model.clear( { silent: true });
    this.model.set( { beam: _.pluck( $(this.el).serializeArray(), 'value' ) } );
    // hack: if the user has selected all the options, clear the model
    // so that it won't restrict by beam mode, which would
    // otherwise limit search results to only this platform (other
    // platforms would never match the beam in() clause
    if ( 23 == this.model.get('beam').length ) {
      this.model.clear( { silent: true } );
    }
  },
  beamModes: [
    { title: "Extended High Incidence Beam, Off-Nadir 52-58&deg;",
      group: "ehib",
      modes: [
        { label: "EH3 (51.8&deg;)", value: "EH3" },
        { label: "EH5 (54.5&deg;)", value: "EH5" },
        { label: "EH6 (57.3&deg;)", value: "EH6" }
      ]
    },
    { title: "Extended Low Incidence Beam, Off-Nadir 10&deg;",
      group: "elib",
      modes: [
        { label: "EL1 (10&deg;)", value: "EL1" }
      ]
    },
    { title: "Fine Beam, Off-Nadir 37-47&deg;",
      group: "fb",
      modes: [
        { label: "FN1 (36.9&deg;)", value: "FN1" },
        { label: "FN2 (39.4&deg;)", value: "FN2" },
        { label: "FN3 (41.6&deg;)", value: "FN3" },
        { label: "FN4 (43.6&deg;)", value: "FN4" },
        { label: "FN5 (45.4&deg;)", value: "FN5" }
      ]
    },
    { title: "ScanSAR Narrow Beam, Off-Nadir 20-49&deg;",
      group: "ssnb",
      modes: [
        { label: "SNA (20&deg;)", value: "SNA" },
        { label: "SNB (20&deg;)", value: "SNB" }
      ]
    },
    { title: "ScanSar Wide Beam, Off-Nadir 20-49&deg",
      group: "sswb",
      modes: [
        { label: "SWA (20&deg;)", value: "SWA" },
        { label: "SWB (20&deg;)", value: "SWB" }
      ]
    },
    { title: "Standard Beam, Off-Nadir 20-49&deg;",
      group: "sb",
      modes: [
        { label: "ST1 (19.6&deg;)", value: "ST1" },
        { label: "ST2 (24.2&deg;)", value: "ST2" },
        { label: "ST3 (30.5&deg;)", value: "ST3" },
        { label: "ST4 (33.6&deg;)", value: "ST4" },
        { label: "ST5 (36.5&deg;)", value: "ST5" },
        { label: "ST6 (41.5&deg;)", value: "ST6" },
        { label: "ST7 (44.9&deg;)", value: "ST7" }
      ]
    }
  ],
  render: function() {
    
    this.renderButtonset( this.model.toJSON(), 'beam', this.el, this.beamModes, 'r1', 'beam' );

    
    $(this.el).find('.checkbox').each(function(index) {
      $(this).buttonset();
    });

    $(this.el).dialog({
      width: 700,
      modal: true,
      draggable: false,
      resizable: false,
      title: "RADARSAT-1 Beam Modes",
      position: "center"
    });
  }
}
);