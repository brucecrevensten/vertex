var PostFilters = Backbone.Model.extend(
  {
    postFilters: [],
    initialize: function() {
      this.trigger('initialize');
      this.postFilters = [
        new AlosFacet(),
        new RadarsatFacet(),
        new LegacyFacet( { 'platform':'ERS-1','offset':0} ),
        new LegacyFacet( { 'platform':'ERS-2','offset':10} ),
        new LegacyFacet( { 'platform':'JERS-1','offset':20} )
      ];

      var self = this;
    },

    reset: function() {
      for( var i in this.postFilters ) {
        this.postFilters[i].set(this.postFilters[i].defaults);
      }
    },
    
    applyFilters: function( data ) {
    }
  }
);

var PostFiltersView = Backbone.View.extend(
{
  widgets: [],
  initialize: function() {
    _.bindAll(this, 'render');
    this.setWidgets();

    this.options.searchResults.bind('refresh', this.render);
    this.options.searchResults.bind('add', this.render);
    this.options.searchResults.bind('remove', this.render);
  },

  setWidgets: function() {
    this.widgets = [];
    for ( var i in this.model.postFilters ) {
      this.trigger('setWidget:'+i);
      this.widgets.push(this.model.postFilters[i].getWidget());
    }
  },

  // platforms: array of platform names present in search results
  render: function(platforms) {
   
	  this.model.reset();
    var el = $(this.el);
    var render = false;
    
    el.accordion("destroy");
    el.empty();
    
    var u = jQuery('<ul/>');

    for ( var i in this.widgets ) {
      if( -1 != _.indexOf( this.options.searchResults.platforms, this.widgets[i].name )) {
        u.append( jQuery('<li/>').append( this.widgets[i].render().el) );
        render = true;
      } 
    }
    if ( render ) {
          this.trigger('render');

      var d = jQuery('<div/>');
      
      var r = jQuery('<button/>').click( jQuery.proxy( function(e) {
        this.model.reset();
      }, this ) ).button( { icons: { primary: 'ui-icon-refresh'}, label: 'Reset all filters'});

      d.append(u);
      d.append(r);
      
      el.append( jQuery('<h3><a href="#">Filter By Platform</a></h3>')).append(d).accordion();
    }
    return this;
  }

});

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
    el = $(el);
    for( var i in source ) {
      el.append( _.template('<h5><%= title %></h5>', source[i] ));
      newEl = jQuery('<div/>', {
        id: id+"_"+source[i].group,
        "class": "beamSelector"
      });
      newEl.prop('beam', source[i].group);
      for( var j in source[i].modes ) {
        idVal = source[i].modes[j].value.replace('.','_');
        newEl.append( 
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
      newEl.buttonset();
      el.append( newEl );
    }
  }

} );

var AlosFacet = PlatformFacet.extend(
  {
    name: "ALOS",
    platform: 'ALOS',
    defaults: {
      path: null,
      frame: null,
      direction: 'any',
      beamoffnadir: [
      /* To make a checkbox default to on, place it's value in here
       ie   

        'FBS 21.5',
        'FBS 34.3',
        'FBS 41.5',
        'FBS 50.8',
        'FBD 34.3',
        'PLR 21.5',
        'PLR 23.1',
        'WB1',
        'WB2'*/
      ]
    },
    initialize: function() {

    },
    getWidget: function() {
      return new AlosFacetButton({model: this});
    },
  }
);

var AlosFacetDialog = PlatformFacetView.extend( {
  className: "platformFacet",
  tagName: "form",

  events: { 
    "change input" : "changed",
  },

  initialize: function() {
    _.bindAll(this);
    this.model.bind('change', this.renderHtml, this);    
  },

  changed: function(e) {
  },

  beamModes: [
    {
      title: "FBS (Fine Beam Single Polarization)",
      group: "FBS",
      modes: [
        { label: "21.5&deg;", value: "FBS 21.5" },
        { label: "34.3&deg;", value: "FBS 34.3" },
        { label: "41.5&deg;", value: "FBS 41.5" },
        { label: "50.8&deg;", value: "FBS 50.8" }
      ]
    },
    {
      title: "FBD (Fine Beam Double Polarization)",
      group: "FBD",
      modes: [
        { label: "34.3&deg", value: "FBD 34.3" }
      ]
    },
    {
      title: "PLR (Polarimetric Mode)",
      group: "PLR",
      modes: [
        { label: "21.5&deg;", value: "PLR 21.5" },
        { label: "23.1&deg;", value: "PLR 23.1" }
      ]
    },
    {
      title: "WB1 (ScanSAR Burst Mode 1)",
      group: "WB1",
      modes: [
        { label: "27.1&deg;", value: "WB1" }
      ]
    },
    {
      title: "WB2 (ScanSAR Burst Mode 2)",
      group: "WB2",
      modes: [
        { label: "27.1&deg;", value: "WB2" }
      ]
    },
  ],
  renderHtml: function() {
      
      var el = $(this.el);
      el.empty();
      var b = jQuery('<div/>');
      this.renderButtonset( this.model.toJSON(), 'beamoffnadir', b, this.beamModes, 'a3', 'offnadir');

      var fs = jQuery('<fieldset/>').html( jQuery('<legend>Beam Modes & Off-Nadir Angles</legend>')).append(b);
      el.append(fs);

      var d = new DirectionWidgetComponent( { model: this.model });
      var fs = jQuery('<fieldset/>').html( jQuery('<legend>Flight Direction</legend>')).append(d.render().el);
      el.append(fs);

      var p = new PathFrameWidgetComponent( { model: this.model });
      p.legend = 'Path/Frame';
      p.pathLabel = 'Path';

      el.append( p.render().el );

      this.hasRendered = true;

      this.setFilters();

  },
  setFilters: function() {
     // Beam Modes
        $(this.el).find('.beamSelector').each( function(i, element) { 
          $(element).find('input').click(function(e) {

            $('.ui-dialog-buttonpane').find('button:contains("Apply")').button().focus();

            var el = $(e.currentTarget);
             if (el.attr('checked') == "checked") {
                if (!SearchApp.filterDictionaryA3.has( el.val() )) {
                  SearchApp.filterDictionaryA3.add( el.val(), el.val() );
                }
              } else {
                if ( SearchApp.filterDictionaryA3.has( el.val() ) ) {
                  SearchApp.filterDictionaryA3.remove( el.val() );
                }
              }  
          });     
        });

       // Flight Directions
       $(this.el).find('input[name="direction"]').click(jQuery.proxy(function(e) {

        $('.ui-dialog-buttonpane').find('button:contains("Apply")').button().focus();

          var curEl = $(e.currentTarget);
          $(this.el).find('input[type="radio"]').each( function(i,element) {
                SearchApp.filterDictionaryA3.remove( $(element).val() + " ALOS" );
          });
          if (curEl.val() != "any") {
             SearchApp.filterDictionaryA3.add($(curEl).val() + " ALOS");
          }
        },this));     

      // ALOS Path
     $(this.el).find('input[name="path"]').bind('input', jQuery.proxy(function(e) { 
      $('.ui-dialog-buttonpane').find('button:contains("Apply")').attr("class", 'ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only ui-state-hover');
            var el = $(e.currentTarget);
            if (el.val() == "") {
              SearchApp.filterDictionaryA3.remove('PATHALOS');
            } else {
               SearchApp.filterDictionaryA3.add('PATHALOS',el.val());
            }
          }, this));

          // ALOS FRAME
     $(this.el).find('input[name="frame"]').bind('input', jQuery.proxy(function(e) { 
     $('.ui-dialog-buttonpane').find('button:contains("Apply")').attr("class", 'ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only ui-state-hover');
            var el = $(e.currentTarget);
            if (el.val() == "") {
              SearchApp.filterDictionaryA3.remove('FRAMEALOS');
            } else {
               SearchApp.filterDictionaryA3.add('FRAMEALOS',el.val());
            }
          }, this));

  },
  render: function() {

    if( true !== this.hasRendered ) {
        this.renderHtml();        
    }

    $(this.el).dialog({
      width: 300,
      modal: false,
      draggable: true,
      resizable: false,
      title: "ALOS PALSAR Options",
      position: [30,100],
      buttons: {
        "Apply": jQuery.proxy(function() 
                 { 
                    SearchApp.dataTable.fnDraw();
                    SearchApp.searchResultsView.refreshMap();
                  },this),
        "Reset": jQuery.proxy( function() {
          this.model.set(this.model.defaults);
          this.renderHtml();
          SearchApp.filterDictionaryA3.clear();
          SearchApp.dataTable.fnDraw();
          SearchApp.searchResultsView.refreshMap();
        }, this)
      }
    }).bind( "dialogclose", function(event, ui) {SearchApp.dataTable.fnDraw(); } ); 
   
    
     
  }
  
});
 
var AlosFacetButton = PlatformFacetView.extend( {
  name: "ALOS",
  tagName: "button",
  initialize: function() {
    _.bindAll(this);
      this.trigger('initialize');
    this.dialog = new AlosFacetDialog( { model: this.model } );
  },
  render: function() {
    $(this.el).button(
      {
        icons: {
          primary: "ui-icon-zoomin"
        },
        label: 'ALOS PALSAR'
      }
    ).click(this.dialog.render);
    return this;
  }
});

var RadarsatFacet = PlatformFacet.extend(
  {
    initialize: function() {
      
    },
    defaults: {
      path: null,
      frame: null,
      direction: 'any',
      beam: [
       /* 'EH3',
        'EH4',
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
        'ST7',
        'WD1',
        'WD2',
        'WD3'*/
      ]
    },
    platform: 'RADARSAT-1',
    name: "RADARSAT-1",

    getWidget: function() {
      return new RadarsatFacetButton({model: this});
    },
    
    filter: function( d ) {
    }
  }
);

var RadarsatFacetButton = PlatformFacetView.extend( {
  name: "RADARSAT-1",
  tagName: "button",
  initialize: function() {
    _.bindAll(this);
    this.dialog = new RadarsatFacetDialog( { model: this.model } );
  },
  render: function() {
    $(this.el).button(
      {
        icons: {
          primary: "ui-icon-zoomin"
        },
        label: "RADARSAT-1"
      }
    ).click(this.dialog.render);
    return this;
  }
});
                                           
var RadarsatFacetDialog = PlatformFacetView.extend( {
  className: "platformFacet",
  tagName: "form",
  initialize: function() {
    _.bindAll(this);
    this.model.bind('change', this.renderHtml, this);
  },
  beamModes: [
    { title: "Extended High Incidence Beam, Off-Nadir 52-58&deg;",
      group: "ehib",
      modes: [
        { label: "EH3 (51.8&deg;)", value: "EH3" },
        { label: "EH4 (54.5&deg;)", value: "EH4" },
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
    },
    { title: "Wide Beam; Off-Nadir 20-45&deg;",
      group: "wd",
      modes: [
        { label: "WD1 (20&deg;)", value: "WD1" },
        { label: "WD2 (20&deg;)", value: "WD2" },
        { label: "WD3 (20&deg;)", value: "WD3" },
      ]
    },
  ],
  renderHtml: function() {
    var el = $(this.el);
    el.empty();
    var b = jQuery('<div/>');
    this.renderButtonset( this.model.toJSON(), 'beam', b, this.beamModes, 'r1', 'beam');

    var fs = jQuery('<fieldset/>').html( jQuery('<legend>Beam Modes</legend>')).append(b);
    el.append(fs);

    var d = new DirectionWidgetComponent( { model: this.model });
    var fs = jQuery('<fieldset/>').html( jQuery('<legend>Flight Direction</legend>')).append(d.render().el);
    el.append(fs);

    var p = new PathFrameWidgetComponent( { model: this.model });
    p.legend = 'Orbit/Frame';
    p.pathLabel = 'Orbit';

    el.append( p.render().el );
    this.hasRendered = true;

    this.setFilters();
  },
  setFilters: function() {
    
     $(this.el).find('.beamSelector').each( function(i, element) { 

          $(element).find('input').click(function(e) {
            $('.ui-dialog-buttonpane').find('button:contains("Apply")').button().focus();
            var el = $(e.currentTarget);
                if (el.attr('checked') == "checked") {
            if (!SearchApp.filterDictionaryR1.has( el.val() )) {
              SearchApp.filterDictionaryR1.add( el.val(), el.val() );
            }
          } else {
            if ( SearchApp.filterDictionaryR1.has( el.val() ) ) {
              SearchApp.filterDictionaryR1.remove( el.val() );
            }
          }  
          });     
        });

             //  Path
     $(this.el).find('input[name="path"]').bind('input', jQuery.proxy(function(e) { 
       $('.ui-dialog-buttonpane').find('button:contains("Apply")').attr("class", 'ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only ui-state-hover');
            var el = $(e.currentTarget);
            if (el.val() == "") {
              SearchApp.filterDictionaryR1.remove('ORBITRADARSAT');
            } else {
               SearchApp.filterDictionaryR1.add('ORBITRADARSAT',el.val());
            }
          }, this));

          //  FRAME
     $(this.el).find('input[name="frame"]').bind('input', jQuery.proxy(function(e) { 
       $('.ui-dialog-buttonpane').find('button:contains("Apply")').attr("class", 'ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only ui-state-hover');
            var el = $(e.currentTarget);
            if (el.val() == "") {
              SearchApp.filterDictionaryR1.remove('FRAMERADARSAT');
            } else {
               SearchApp.filterDictionaryR1.add('FRAMERADARSAT',el.val());
            }
          }, this));
  },
  render: function() {
    
    if( true !== this.hasRendered ) {
      this.renderHtml();
    }
    
    $(this.el).dialog({
      width: 700,
      modal: false,
      draggable: true,
      resizable: false,
      title: "RADARSAT-1 Platform Options",
      position: [40,110],
      buttons: {
        "Apply": function() { 
            SearchApp.dataTable.fnDraw();
            SearchApp.searchResultsView.refreshMap();/*$(this).dialog('close');*/ },
        "Reset": jQuery.proxy( function() {
          this.model.set(this.model.defaults);
          this.renderHtml();
          SearchApp.filterDictionaryR1.clear();
          SearchApp.dataTable.fnDraw();
          SearchApp.searchResultsView.refreshMap();
        }, this)
      }
    }).bind( "dialogclose", function(event, ui) {SearchApp.dataTable.fnDraw(); } );


  }
});

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
    }
  }
);

var LegacyFacetButton = PlatformFacetView.extend( {
  tagName: "button",
  initialize: function() {
    this.name = this.model.platform;
    this.dialog = new LegacyFacetDialog( { model: this.model } );
    _.bindAll(this);
  },
  render: function() {
    $(this.el).button(
      {
        icons: {
          primary: "ui-icon-zoomin"
        },
        label: this.model.platform
      }
    ).click(this.dialog.render);
    return this;
  }
});
                                           
var LegacyFacetDialog = PlatformFacetView.extend( {
  className: "platformFacet",
  tagName: "form",
  initialize: function() {
    _.bindAll(this);
    this.model.bind('change', this.renderHtml, this);
  },
  renderHtml: function() {
    var el = $(this.el);

    el.empty();
    var d = new DirectionWidgetComponent( { model: this.model });
    var fs = jQuery('<fieldset/>').html( jQuery('<legend>Flight Direction</legend>')).append(d.render().el);
    el.append(fs);

    var p = new PathFrameWidgetComponent( { model: this.model });
    p.legend = 'Orbit/Frame';
    p.pathLabel = 'Orbit';

    el.append( p.render().el );
    this.hasRendered = true;

    this.setFilters();
  },

  setFilters: function() {

      if (this.model.platform == "JERS-1") {
        this.filterDictionaryObject=SearchApp.filterDictionaryJ1;
      }
      if (this.model.platform == "ERS-1") {
        this.filterDictionaryObject=SearchApp.filterDictionaryE1;
      }
      if (this.model.platform == "ERS-2") {
        this.filterDictionaryObject=SearchApp.filterDictionaryE2;
      }
     var filterDictionaryObject = this.filterDictionaryObject;
         // Flight Directions
       $(this.el).find('input[name="direction"]').click(jQuery.proxy(function(e) {
        $('.ui-dialog-buttonpane').find('button:contains("Apply")').button().focus();
          var curEl = $(e.currentTarget);
          $(this.el).find('input[type="radio"]').each( jQuery.proxy(function(i,element) {
                filterDictionaryObject.remove( $(element).val() + this.model.platform );
          },this));
          if (curEl.val() != "any") {
             filterDictionaryObject.add($(curEl).val() + this.model.platform, $(curEl).val());
          }
        },this)); 

                //  Path
     $(this.el).find('input[name="path"]').bind('input', jQuery.proxy(function(e) { 
       $('.ui-dialog-buttonpane').find('button:contains("Apply")').attr("class", 'ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only ui-state-hover');
            var el = $(e.currentTarget);
            if (el.val() == "") {
               
              filterDictionaryObject.remove("ORBIT"+this.model.platform);
            } else {
              filterDictionaryObject.add("ORBIT"+this.model.platform,el.val());
            }
          }, this));

          //  FRAME
     $(this.el).find('input[name="frame"]').bind('input', jQuery.proxy(function(e) { 
       $('.ui-dialog-buttonpane').find('button:contains("Apply")').attr("class", 'ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only ui-state-hover');
            var el = $(e.currentTarget);
            if (el.val() == "") {
              filterDictionaryObject.remove("FRAME"+this.model.platform);
            } else {
               filterDictionaryObject.add("FRAME"+this.model.platform,el.val());
            }
          }, this));
  },
  render: function() {
     
      if (this.model.platform == "JERS-1") {
        this.filterDictionaryObject=SearchApp.filterDictionaryJ1;
      }
      if (this.model.platform == "ERS-1") {
        this.filterDictionaryObject=SearchApp.filterDictionaryE1;
      }
      if (this.model.platform == "ERS-2") {
        this.filterDictionaryObject=SearchApp.filterDictionaryE2;
      }
     var filterDictionaryObject = this.filterDictionaryObject;
    
    if( true !== this.hasRendered ) {
      this.renderHtml();
    }

    $(this.el).dialog({
      width: 300,
      modal: false,
      draggable: true,
      resizable: false,
      title: this.model.platform + " Platform Options",
      position: [50 + this.model.offset, 120 + this.model.offset ],
      buttons: {
        "Apply": function() {  
            SearchApp.dataTable.fnDraw();
          SearchApp.searchResultsView.refreshMap();
          },
        "Reset": jQuery.proxy( function() {
          this.model.set(this.model.defaults);
          this.renderHtml();
          
           if (this.model.platform == "JERS-1") {
            SearchApp.filterDictionaryJ1.clear();
           }
           if (this.model.platform == "ERS-1") {
              SearchApp.filterDictionaryE1.clear();
            }
            if (this.model.platform == "ERS-2") {
                  
                SearchApp.filterDictionaryE2.clear();
            }
          SearchApp.dataTable.fnDraw();
          SearchApp.searchResultsView.refreshMap();
        }, this)
      }
    });

      
    



  }
}
);
