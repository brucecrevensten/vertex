var PostFilters = Backbone.Model.extend(
  {
    postFilters: [],
    initialize: function() {
      this.postFilters = [
        new AlosFacet(),
        new RadarsatFacet(),
        new LegacyFacet( { 'platform':'ERS-1','offset':0} ),
        new LegacyFacet( { 'platform':'ERS-2','offset':10} ),
        new LegacyFacet( { 'platform':'JERS-1','offset':20} )
      ];

      self = this;

      _.each( this.postFilters, function(e, i, l) {

        e.bind('all', function(e) { console.log('PostFiltersModel observed postFilterComponent='+e); } );
        e.bind('change', function(filter) {
          self.trigger('change:postfilter', filter);
        })
      });

      this.bind('all', function(e) { console.log('PostFiltersModel observed self event = '+e); } );
      this.bind("change:postfilter", function(filter) {
        var v = {};
        v[filter.platform] = filter.toJSON();
        this.set( v );
      });

    },

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

    this.options.searchResults.bind('all', function(e) { console.log('PostFiltersView observed SearchResults = '+e); } );

    this.options.searchResults.bind('refresh', this.render);
    this.options.searchResults.bind('add', this.render);
    this.options.searchResults.bind('remove', this.render);
  },

  setWidgets: function() {
    this.widgets = [];
    for ( var i in this.model.postFilters ) {
      // TODO: another possible memory leak here if the widgets aren't getting destroyed
      this.widgets.push(this.model.postFilters[i].getWidget());
    }
  },
  // platforms: array of platform names present in search results
  render: function(platforms) {

    this.setWidgets();
    var render = false;
    $(this.el).accordion("destroy");
    $(this.el).empty();
    var d = jQuery('<div/>');
    var u = jQuery('<ul/>');

    for ( var i in this.widgets ) {
      if( -1 != _.indexOf( this.options.searchResults.platforms, this.widgets[i].name )) {
        u.append( jQuery('<li/>').append( this.widgets[i].render().el) );
        render = true;
      } 
    }
    if ( render ) {
      var r = jQuery('<button/>').click( jQuery.proxy( function(e) {
        this.model.reset();
 
      }, this ) ).button( { icons: { primary: 'ui-icon-refresh'}, label: 'Reset all filters'});

      d.append(u);
      d.append(r);
      $(this.el).append( jQuery('<h3><a href="#">Filter By Platform</a></h3>')).append(d).accordion();
    }
    return this;
  }

});

var ProcessingFacetButton = BaseWidget.extend( {
  name: "Processing Type",
  tagName: "button",
  initialize: function() {
    _.bindAll(this, "render", "openDialog");
  },
  events: {
    "click" : "openDialog"
  },
  openDialog: function(e) {
    var v = new ProcessingFacetDialog( { model: this.model } );
  },
  render: function() {
    $(this.el).button(
      {
        icons: {
          primary: "ui-icon-zoomin"
        },
        label: this.name
      }
    );
    return this;
  }
});

/* TODO deprecate / re-implement elsewhere
var ProcessingFacetDialog = BaseWidget.extend( {

  className: "platformFacet",
  tagName: "form",

  events: { 
    "change input" : "changed",
  },
  initialize: function() {
    this.render();
    this.model.unbind('change');
    this.model.bind( 'change', jQuery.proxy( this.render, this) );
  },
  changed: function(e) {
    this.model.clear( { silent: true });
    var direction = $(this.el).find('input[name="direction"]:checked').val();
    var path = $(this.el).find('input[name="path"]').val();
    var frame = $(this.el).find('input[name="frame"]').val();

    this.model.set({
      beamoffnadir: beamoffnadir,
      direction: direction,
      path: path,
      frame: frame
    }, { silent: true });
  },
 
  render: function() {

    $(this.el).empty();
    var checked = this.model.get('procTypes');
    var ul = $('<ul/>');
    _.each( this.model.get('procTypes'), function(procType) {
      var p = this.model.processingTypes.get(procType).toJSON();
      var rowData = {
        "id":"procinfo_"+p.id.replace('.','_'),
        "procType":p.id,
        "ifChecked": ( _.indexOf(checked, procType) > -1 ) ? 'checked="checked"' : '',
        "name":p.display,
        "description":p.description
      };
      var i = $('<li>').html( _.template('\
<div class="composite_checkbox_wrapper">\
<input type="checkbox" id="<%= id %>" <%= ifChecked %> name="processingTypeSelector" value="<%= procType %>" /><label style="text-align: left; width: 160px;" for="<%= id %>"><%= name %></label>\
<button style="display:inline-block;" procType="<%= procType %>" title="<%= description %>">?</button>\
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
      $(i).find('button').button( { icons: { primary: "ui-icon-info"}, text: false}).click( function() { return false; });
      ul.append(i);
    }, this);

    $(this.el).append(ul);

    $(this.el).dialog({
      width: 220,
      modal: false,
      draggable: true,
      resizable: false,
      title: "Product processing choices",
      position: [20,90],
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
*/

var PlatformFacet = BaseFilter.extend( {

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

} ); 
var PlatformFacetView = BaseWidget.extend( {

  // selected = this.model.toJSON
  // key = key name to use in selected.key
  // container = element into which all these items should be appended
  // source = data structure in format: [ { title:string, group:string, modes: [ { label:label, value:inputValue }, ... ] }, ... ]
  // id = string, ID fragment to prepend in dynamically-generated elements
  // param = string, name of http parameter
  renderButtonset: function( selected, key, el, source, id, name) {

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
  }

} );

var AlosFacet = PlatformFacet.extend(
  {
    name: "ALOS-PALSAR",
    platform: 'ALOS',
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
        'WB1',
      ]
    },
    getWidget: function() {
      return new AlosFacetButton({model: this});
    },
    filter: function( d ) {
      var f = this.toJSON();
      
      // only do filtering on this platform
      var a = _.select( d, function(row) {
        return ( 'ALOS' == row.PLATFORM );
      });
      d = _.reject( d, function(row) {
        return ( 'ALOS' == row.PLATFORM );
      });

      a = _.reject( a, function(row) {
        return ( f.direction != 'any' && row.ASCENDINGDESCENDING != f.direction ); 
      });

      // todo: move building the arrays to validation / setting phase? later.
      if( f.frame ) {
        var frames = this.buildArrayFromString(f.frame);
        a = _.reject( a, function(row) {
          return ( -1 == _.indexOf( frames, row.FRAMENUMBER ) );
        });
      }

      if( f.path ) {
        var paths = this.buildArrayFromString(f.path);
        a = _.reject( a, function(row) {
          return ( -1 == _.indexOf( paths, row.PATHNUMBER ) );
        });
      }

      if( f.beamoffnadir.length ) {
          a = _.reject( a, function(row) {
            if(row.BEAMMODETYPE == 'WB1') {
              return ( -1 == _.indexOf( f.beamoffnadir, row.BEAMMODETYPE));
            } else {
              return ( -1 == _.indexOf( f.beamoffnadir, row.BEAMMODETYPE.concat(row.OFFNADIRANGLE)));
            }
          });
      }
      return _.union(a, d);
    }

  }
);

var AlosFacetDialog = PlatformFacetView.extend( {
  className: "platformFacet",
  tagName: "form",

  events: { 
    "change input" : "changed",
  },
  initialize: function() {
    this.model.bind('all', function(e) { console.log('AlosFacetDialog observed AlosFacet = '+e); } );
    this.model.bind( 'change', jQuery.proxy( this.render, this) );
  },
  changed: function(e) {
    this.model.clear( { silent: true });
    var beamoffnadir  = [];
    $(this.el).find('.beamSelector :checked').each( function(i, el) { beamoffnadir.push( $(el).val() ); });
    var direction = $(this.el).find('input[name="direction"]:checked').val();
    var path = $(this.el).find('input[name="path"]').val();
    var frame = $(this.el).find('input[name="frame"]').val();

    this.model.set({
      'beamoffnadir': beamoffnadir,
      'direction': direction,
      'path': path,
      'frame': frame
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
        { label: "27.1&deg;", value: "WB1" }
      ]
    }
  ],
  render: function() {

    $(this.el).empty();

    var b = jQuery('<div/>');
    this.renderButtonset( this.model.toJSON(), 'beamoffnadir', b, this.beamModes, 'a3', 'offnadir');

    var fs = jQuery('<fieldset/>').html( jQuery('<legend>Beam Modes & Off-Nadir Angles</legend>')).append(b);
    $(this.el).append(fs);

    var d = new DirectionWidgetComponent( { model: this.model });
    var fs = jQuery('<fieldset/>').html( jQuery('<legend>Flight Direction</legend>')).append(d.render().el);
    $(this.el).append(fs);

    var p = new PathFrameWidgetComponent( { model: this.model });
    p.legend = 'Path/Frame';
    p.pathLabel = 'Path';

    $(this.el).append( p.render().el );

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
    v.render();
    $(v.el).dialog({
      width: 300,
      modal: false,
      draggable: true,
      resizable: false,
      title: "ALOS-PALSAR Platform Options",
      position: [30,100],
      buttons: {
        "Close": function() { $(this).dialog('close'); },
        "Reset": jQuery.proxy( function() {
          this.model.reset();
        }, this)
      }
    });
  },
  render: function() {
    $(this.el).button(
      {
        icons: {
          primary: "ui-icon-zoomin"
        },
        label: 'ALOS-PALSAR'
      }
    );
    return this;
  }
});

var RadarsatFacet = PlatformFacet.extend(
  {
    defaults: {
      path: null,
      frame: null,
      direction: 'any',
      beam: [
        'EH3',
        'EH5',
        'EH6',
        'EL1',
        'FN1',
        'FN2',
        'FN3',
        'FN4',
        'FN5',
        'SNA',
        'SNB',
        'SWA',
        'SWB',
        'ST1',
        'ST2',
        'ST3',
        'ST4',
        'ST5',
        'ST6',
        'ST7'
      ]
    },
    platform: 'RADARSAT-1',
    name: "RADARSAT-1",
    getWidget: function() {
      return new RadarsatFacetButton({model: this});
    },
    filter: function( d ) {
      var f = this.toJSON();
      
      // only do filtering on this platform
      var a = _.select( d, function(row) {
        return ( 'RADARSAT-1' == row.PLATFORM );
      });
      d = _.reject( d, function(row) {
        return ( 'RADARSAT-1' == row.PLATFORM );
      });

      a = _.reject( a, function(row) {
        return ( f.direction != 'any' && row.ASCENDINGDESCENDING != f.direction ); 
      });

      // todo: move building the arrays to validation / setting phase? later.
      if( f.frame ) {
        var frames = this.buildArrayFromString(f.frame);
        a = _.reject( a, function(row) {
          return ( -1 == _.indexOf( frames, row.FRAMENUMBER ) );
        });
      }

      if( f.path ) {
        var paths = this.buildArrayFromString(f.path);
        a = _.reject( a, function(row) {
          return ( -1 == _.indexOf( paths, row.ORBIT ) );
        });
      }

      if( f.beam.length ) {
        a = _.reject( a, function(row) {
          return ( -1 == _.indexOf( f.beam, row.BEAMMODETYPE ));
        });
      }
      return _.union(a, d);
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
          primary: "ui-icon-zoomin"
        },
        label: "RADARSAT-1"
      }
    );

    return this;
 
  }
});
                                           
var RadarsatFacetDialog = PlatformFacetView.extend( {
  className: "platformFacet",
  tagName: "form",
  events: {
   "change input" : "changed",
  },
  initialize: function() {
    this.render();
    this.model.bind('all', function(e) { console.log('RadarsatFacetDialog observed RadarsatFacet = '+e); } );
    this.model.bind( 'change', jQuery.proxy( this.render, this) );
  },
  changed: function(e) {
    this.model.clear( { silent: true });
    var beam = [];
    $(this.el).find('.beamSelector :checked').each( function(i, el) { beam.push( $(el).val() ); });
    var direction = $(this.el).find('input[name="direction"]:checked').val();
    var path = $(this.el).find('input[name="path"]').val();
    var frame = $(this.el).find('input[name="frame"]').val();

    this.model.set({
      beam: beam,
      direction: direction,
      path: path,
      frame: frame
    });
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
    $(this.el).empty();

    var b = jQuery('<div/>');
    this.renderButtonset( this.model.toJSON(), 'beam', b, this.beamModes, 'r1', 'beam');

    var fs = jQuery('<fieldset/>').html( jQuery('<legend>Beam Modes</legend>')).append(b);
    $(this.el).append(fs);

    var d = new DirectionWidgetComponent( { model: this.model });
    var fs = jQuery('<fieldset/>').html( jQuery('<legend>Flight Direction</legend>')).append(d.render().el);
    $(this.el).append(fs);

    var p = new PathFrameWidgetComponent( { model: this.model });
    p.legend = 'Orbit/Frame';
    p.pathLabel = 'Orbit';

    $(this.el).append( p.render().el );

    $(this.el).dialog({
      width: 700,
      modal: false,
      draggable: true,
      resizable: false,
      title: "RADARSAT-1 Platform Options",
      position: [40,110],
      buttons: {
        "Close": function() { $(this).dialog('close'); },
        "Reset": jQuery.proxy( function() {
          this.model.reset();
          this.render();
        }, this)
      }
    });
  }
}
);

var LegacyFacet = PlatformFacet.extend(
  {
    platform: null, // to be specified by child classes
    defaults: {
      path: null,
      frame: null,
      direction: 'any'
    },
    initialize: function(d) {
      this.platform = d.platform;
      this.offset = d.offset;
    },
    getWidget: function() {
      return new LegacyFacetButton({model: this});
    },
    filter: function( d ) {
      var f = this.toJSON();
      
      var p = this.platform;
      // only do filtering on this platform
      var a = _.select( d, function(row) {
        return ( p == row.PLATFORM );
      });
      d = _.reject( d, function(row) {
        return ( p == row.PLATFORM );
      });

      a = _.reject( a, function(row) {
        return ( f.direction != 'any' && row.ASCENDINGDESCENDING != f.direction ); 
      });

      if( f.frame ) {
        var frames = this.buildArrayFromString(f.frame);
        a = _.reject( a, function(row) {
          return ( -1 == _.indexOf( frames, row.FRAMENUMBER ) );
        });
      }

      if( f.path ) {
        var paths = this.buildArrayFromString(f.path);
        a = _.reject( a, function(row) {
          return ( -1 == _.indexOf( paths, row.ORBIT ) );
        });
      }

      return _.union(a, d);
    }
  }
);

var LegacyFacetButton = PlatformFacetView.extend( {
  tagName: "button",
  initialize: function() {
    this.name = this.model.platform;
    _.bindAll(this, "render", "openDialog");
  },
  events: {
    "click" : "openDialog"
  },
  openDialog: function(e) {
    var v = new LegacyFacetDialog( { model: this.model } );
  },
  render: function() {
    $(this.el).button(
      {
        icons: {
          primary: "ui-icon-zoomin"
        },
        label: this.model.platform
      }
    );

    return this;
 
  }
});
                                           
var LegacyFacetDialog = PlatformFacetView.extend( {
  className: "platformFacet",
  tagName: "form",
  events: {
   "change input" : "changed",
  },
  initialize: function() {
    this.render();
    this.model.bind('all', function(e) { console.log( this.platform +' observed selfFacet = '+e); } );
    this.model.bind( 'change', jQuery.proxy( this.render, this) );
  },
  changed: function(e) {
    this.model.clear( { silent: true });
    this.model.set({
      'direction': $(this.el).find('input[name="direction"]:checked').val(),
      'path': $(this.el).find('input[name="path"]').val(),
      'frame': $(this.el).find('input[name="frame"]').val()
    });
  },
 
  render: function() {
    $(this.el).empty();

    var d = new DirectionWidgetComponent( { model: this.model });
    var fs = jQuery('<fieldset/>').html( jQuery('<legend>Flight Direction</legend>')).append(d.render().el);
    $(this.el).append(fs);

    var p = new PathFrameWidgetComponent( { model: this.model });
    p.legend = 'Orbit/Frame';
    p.pathLabel = 'Orbit';

    $(this.el).append( p.render().el );

    $(this.el).dialog({
      width: 300,
      modal: false,
      draggable: true,
      resizable: false,
      title: this.model.platform + " Platform Options",
      position: [50 + this.model.offset, 120 + this.model.offset ],
      buttons: {
        "Close": function() { $(this).dialog('close'); },
        "Reset": jQuery.proxy( function() {
          this.model.reset();
          this.render();
        }, this)
      }
    });
  }
}
);
