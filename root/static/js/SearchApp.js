$(function() {

//******* In place until we update jquery ************//
// Gets rid of deprecation warnings that pop up in the console. 
  (function(){
    // remove layerX and layerY
    var all = $.event.props,
        len = all.length,
        res = [];
    while (len--) {
      var el = all[len];
      if (el != 'layerX' && el != 'layerY') res.push(el);
    }
    $.event.props = res;
}());
////////////////////

window.SearchAppView = Backbone.View.extend({	
  initialize: function() {
    this.filterDictionaryA3 = new Dictionary();
    this.filterDictionaryR1 = new Dictionary();
    this.filterDictionaryE1 = new Dictionary();
    this.filterDictionaryE2 = new Dictionary();
    this.filterDictionaryJ1 = new Dictionary();

    $.fn.dataTableExt.afnFiltering.push(
      jQuery.proxy( function( oSettings, aData, iDataIndex ) {
        var h = $(aData[0]);
        var c = h.find("div").attr("product_id"); // might make this faster by providing lookup using iDataIndex
        
        var returnVal=false;

        if (this.searchResults.get(c).get("PLATFORM") == "ALOS") {
              if (SearchApp.filterDictionaryA3.has('FBS 21.5')) {
                if (this.searchResults.get(c).get("BEAMMODETYPE") == "FBS" && 
                    this.searchResults.get(c).get("OFFNADIRANGLE") == "21.5" ) {
                  returnVal= true;
                } 
              }

              
              if (SearchApp.filterDictionaryA3.has('FBS 34.3')) {
                if (this.searchResults.get(c).get("BEAMMODETYPE") == "FBS" && 
                    this.searchResults.get(c).get("OFFNADIRANGLE") == "34.3") {
                  returnVal= true;
                }   
              } 
              
             if (SearchApp.filterDictionaryA3.has('FBS 41.5')) {
                if (this.searchResults.get(c).get("BEAMMODETYPE") == "FBS" && 
                    this.searchResults.get(c).get("OFFNADIRANGLE") == "41.5") {
                  returnVal= true;
                }   
              } 

                      
             if (SearchApp.filterDictionaryA3.has('FBS 50.8')) {
                if (this.searchResults.get(c).get("BEAMMODETYPE") == "FBS" && 
                    this.searchResults.get(c).get("OFFNADIRANGLE") == "50.8") {
                  returnVal= true;
                }   
              } 
                
             if (SearchApp.filterDictionaryA3.has('FBD 34.3')) {
                if (this.searchResults.get(c).get("BEAMMODETYPE") == "FBD" && 
                    this.searchResults.get(c).get("OFFNADIRANGLE") == "34.3") {
                  returnVal= true;
                }   
              }   

              if (SearchApp.filterDictionaryA3.has('PLR 21.5')) {
                if (this.searchResults.get(c).get("BEAMMODETYPE") == "PLR" && 
                    this.searchResults.get(c).get("OFFNADIRANGLE") == "21.5") {
                  returnVal= true;
                }   
              }   
             
              if (SearchApp.filterDictionaryA3.has('PLR 23.1')) {
                if (this.searchResults.get(c).get("BEAMMODETYPE") == "PLR" && 
                    this.searchResults.get(c).get("OFFNADIRANGLE") == "23.1") {
                  returnVal= true;
                }   
              }
              
              
              if (SearchApp.filterDictionaryA3.has('WB1')) {
                if (this.searchResults.get(c).get("BEAMMODETYPE") == "WB1") {
                  returnVal= true;
                }   
              }    

              if (SearchApp.filterDictionaryA3.has('WB2')) {
                if (this.searchResults.get(c).get("BEAMMODETYPE") == "WB2") {
                  returnVal= true;
                }   
              }

              if (SearchApp.filterDictionaryA3.has('ASCENDING ALOS')) {
                if (this.searchResults.get(c).get("ASCENDINGDESCENDING") == "Ascending") {
                  returnVal= true;
                }   
              }

              if (SearchApp.filterDictionaryA3.has('DESCENDING ALOS')) {
                if (this.searchResults.get(c).get("ASCENDINGDESCENDING") == "Descending") {
                    
                  returnVal= true;
                }   
              }

             if (SearchApp.filterDictionaryA3.has('PATHALOS')) {
                if (this.searchResults.get(c).get("PATHNUMBER") == SearchApp.filterDictionaryA3.val('PATHALOS')) {
                  returnVal= true;
                }   
             }
            
             if (SearchApp.filterDictionaryA3.has('FRAMEALOS')) {
                if (this.searchResults.get(c).get("FRAMENUMBER") == SearchApp.filterDictionaryA3.val('FRAMEALOS')) {
                  returnVal= true;
                }   
             }
      }

      if (this.searchResults.get(c).get("PLATFORM") == "RADARSAT-1") {
          if (SearchApp.filterDictionaryR1.has(this.searchResults.get(c).get("BEAMMODETYPE"))) {
                if (this.searchResults.get(c).get("BEAMMODETYPE") == SearchApp.filterDictionaryR1.val(this.searchResults.get(c).get("BEAMMODETYPE")) ) {
                  returnVal= true;
                }   
          }

           if (SearchApp.filterDictionaryR1.has('ORBITRADARSAT')) {
                if (this.searchResults.get(c).get("ORBIT") == SearchApp.filterDictionaryR1.val('ORBITRADARSAT')) {
                  returnVal= true;
                }   
             }
            
             if (SearchApp.filterDictionaryR1.has('FRAMERADARSAT')) {
                if (this.searchResults.get(c).get("FRAMENUMBER") == SearchApp.filterDictionaryR1.val('FRAMERADARSAT')) {
                  returnVal= true;
                }   
             }
      }


      if (this.searchResults.get(c).get("PLATFORM") == "ERS-1") {
          
          if (SearchApp.filterDictionaryE1.has('ASCENDINGERS-1')) {
            if (this.searchResults.get(c).get("ASCENDINGDESCENDING") == "Ascending") {
                returnVal= true;
              }   
            }

            if (SearchApp.filterDictionaryE1.has('DESCENDINGERS-1')) {
              if (this.searchResults.get(c).get("ASCENDINGDESCENDING") == "Descending") {
                  
                returnVal= true;
              }   
            }

           if (SearchApp.filterDictionaryE1.has('ORBITERS-1')) {
                if (this.searchResults.get(c).get("ORBIT") == SearchApp.filterDictionaryE1.val('ORBITERS-1')) {
                  returnVal= true;
                }   
             }
            
             if (SearchApp.filterDictionaryE1.has('FRAMEERS-1')) {
                if (this.searchResults.get(c).get("FRAMENUMBER") == SearchApp.filterDictionaryE1.val('FRAMEERS-1')) {
                  returnVal= true;
                }   
             }
      }

      if (this.searchResults.get(c).get("PLATFORM") == "ERS-2") {
       if (SearchApp.filterDictionaryE2.has('ASCENDINGERS-2')) {
            if (this.searchResults.get(c).get("ASCENDINGDESCENDING") == "Ascending") {
                returnVal= true;
              }   
            }

            if (SearchApp.filterDictionaryE2.has('DESCENDINGERS-2')) {
              if (this.searchResults.get(c).get("ASCENDINGDESCENDING") == "Descending") {
                  
                returnVal= true;
              }   
            }

           if (SearchApp.filterDictionaryE2.has('ORBITERS-2')) {
                if (this.searchResults.get(c).get("ORBIT") == SearchApp.filterDictionaryE2.val('ORBITERS-2')) {
                  returnVal= true;
                }   
             }
            
             if (SearchApp.filterDictionaryE2.has('FRAMEERS-2')) {
                if (this.searchResults.get(c).get("FRAMENUMBER") == SearchApp.filterDictionaryE2.val('FRAMEERS-2')) {
                  returnVal= true;
                }   
             }
      }

      if (this.searchResults.get(c).get("PLATFORM") == "JERS-1") {
       if (SearchApp.filterDictionaryJ1.has('ASCENDINGJERS-1')) {
          if (this.searchResults.get(c).get("ASCENDINGDESCENDING") == "Ascending") {
              returnVal= true;
            }   
          }

          if (SearchApp.filterDictionaryJ1.has('DESCENDINGJERS-1')) {
            if (this.searchResults.get(c).get("ASCENDINGDESCENDING") == "Descending") {
                
              returnVal= true;
            }   
          }

       if (SearchApp.filterDictionaryJ1.has('ORBITJERS-1')) {
            if (this.searchResults.get(c).get("ORBIT") == SearchApp.filterDictionaryJ1.val('ORBITJERS-1')) {
              returnVal= true;
            }   
         }
        
         if (SearchApp.filterDictionaryJ1.has('FRAMEJERS-1')) {
            if (this.searchResults.get(c).get("FRAMENUMBER") == SearchApp.filterDictionaryJ1.val('FRAMEJERS-1')) {
              returnVal= true;
            }   
         }
      }
        
      if (SearchApp.filterDictionaryA3.length==0 && SearchApp.filterDictionaryR1.length==0 &&
          SearchApp.filterDictionaryE1.length==0 && SearchApp.filterDictionaryE2.length==0 && 
          SearchApp.filterDictionaryJ1.length==0) {
        returnVal= true;
      }

      if (returnVal) {
       // $('.productRowTools').find('[product_id="'+c+'"]').attr({filtered:false});
       // console.log($('.productRowTools').find('[product_id="'+c+'"]'));
       // $(h.find("div")).attr({filtered:false});
       // console.log(h);
       this.searchResults.get(c).set({filtered:false});
      } else {
        
        //$('.productRowTools').find('[product_id="'+c+'"]').attr({filtered:true});
        //console.log( $('.productRowTools').find('[product_id="'+c+'"]'));
       // $(h.find("div")).attr({filtered:true});
      //  console.log(h);
       this.searchResults.get(c).set({filtered:true});
      }

      return returnVal;  
        
      }, this)
  );

	 $.storage = new $.store();

    this.user = new User();

    this.userLoginView = new UserLoginView( { model: this.user, el: $('#login_dialog') } );
    this.userLoginButton = new UserLoginButton( { model: this.user, el: $('#user_tools') });
    this.userLoginButton.render();
    this.userLoginFields = new UserLoginFields({ model: this.user, el: $('#form1')});
    this.userLoginMessage = new UserLoginMessage( {model: this.user, el: $('#login_msg')});
    this.userLoginMessage.render();
    this.searchParameters = new SearchParameters();
    this.postFilters = new PostFilters();
    this.searchResults = new SearchResults();
    this.searchResults.searchParameters = this.searchParameters;
    this.searchResults.postFilters = this.postFilters;
    this.searchResults.postFilters.bind('change', jQuery.proxy( this.searchResults.filter, this.searchResults) ); // manual binding between two models

    this.searchParametersView = new SearchParametersView( 
    { 
      model: this.searchParameters, 
      el: $("#filters") 
    }
    );
    this.searchParametersView.render();  

    this.activeSearchFiltersView = new ActiveSearchFiltersView(
    { 
      'searchParameters': this.searchParameters,
      'postFilters': this.postFilters
    }
    );

    this.downloadQueue = new DownloadQueue();
    this.downloadQueueView = new DownloadQueueView( 
    { 
      collection: this.downloadQueue,
      el: $("#download_queue")
    } 
    );

    this.searchResultsView = new SearchResultsView(
    {
      'postFilters': this.postFilters,
      'collection': this.searchResults,
      'el': $("#searchResults"),
      'model': this.user,
      'downloadQueue': this.downloadQueue
    }
    );

    this.postFiltersView = new PostFiltersView(
    {
      'searchResults': this.searchResults,
      'model': this.postFilters,
      'el': $("#platform_facets")
    }
    );

    // Hack to ensure buttons look "off" after filtering/rendering clicks occur
    $('#platform_facets fieldset button').live('click', function() {
      $(this).removeClass("ui-state-focus");
    });

    this.searchResultsProcTool = new SearchResultsProcessingWidget(
    {
      collection: this.searchResults
    }
    );

    this.downloadQueueSummaryView = new DownloadQueueSummaryView( 
    { 
      collection: this.downloadQueue,
      el: $("#queue_summary")
    }
    );
    this.downloadQueueSummaryView.render();
    this.user.bind("authSuccess", this.downloadQueueSummaryView.render);
    this.user.bind("authError", this.downloadQueueSummaryView.render);
    this.user.bind("authRefresh", this.downloadQueueSummaryView.render);
    
    //TODO:move this
    $("#queue_summary").bind("click", this.downloadQueueView.render );

    this.downloadQueueSearchResultsView = new DownloadQueueSearchResultsView(
    {
      collection: this.downloadQueue 
    }
    );
    
    //TODO: move this
    this.downloadQueueSearchResultsView.setSearchResultsView(this.searchResultsView);

    this.downloadQueueMapView = new DownloadQueueMapView( {
      collection: this.downloadQueue
    });
    //TODO: move this
    this.downloadQueueMapView.setSearchResultsView(this.searchResultsView);


    $('#resetSearch').button(
    { 
      icons: { primary: "ui-icon-refresh"}, 
      label: "Reset"
    }
    ).bind("click",
    { 
      sp: this.searchParameters,
      spv: this.searchParametersView,
      sr: this.searchResults,
      srv:this.searchResultsView,
      pf: this.postFilters
    }, jQuery.proxy(function(e) {
      if(typeof ntptEventTag == 'function') {
        ntptEventTag('ev=resetSearch');
      }
      e.data.sp.setDefaults();
      e.data.spv.setWidgets();
      e.data.spv.render();
      e.data.pf.reset();


      e.data.sr.data = {};
      e.data.sr.reset(); // can't be silent here, must be loud
      e.data.srv.render();

      e.data.sr.trigger('clear_results');
      e.data.srv.showBeforeSearchMessage();
      $("#srCount").empty()
      $("#triggerSearch").button('disable').focus();
      $("#con").html('');
       $("#con").html('<table id="searchResults" style="margin:20px 0px 20px 0px;"></table>');

       this.filterDictionaryA3.clear();
       this.filterDictionaryR1.clear();
       this.filterDictionaryE1.clear();
       this.filterDictionaryE2.clear();
       this.filterDictionaryJ1.clear();


    },this));

  


	this.searchButtonState = new SearchButtonState(); // defaults to searchState as opposed to stopSearchState
    this.searchButtonView = new SearchButtonView( 
				{ 
					"el": $("#triggerSearch"), 
					"el2": $("#stopSearch"),
					"model": this.searchButtonState,
					"geographicFilter": this.searchParameters.getGeographicFilter(),
					"granuleFilter": this.searchParameters.getGranuleFilter()
				} );
	this.geoFilter = this.searchParameters.getGeographicFilter();
	
	this.searchButtonView.toggleButton();
    this.searchResults.bind('refresh', jQuery.proxy(function(e) {
      this.searchButtonView.model.set({'state': 'searchButtonState'});
    }, this));
				
	this.searchButtonView.render();

    //fire up the map
    initMap('searchMap');

    v = new FeedbackButton();
    v.render();

  }
});

window.SearchApp = new SearchAppView;  

// Instead of using serialzeArray() we can use serializeJSON to return JSON formatted form data. 
$.fn.serializeJSON=function() {
		var json = {};
		jQuery.map($(this).serializeArray(), function(n, i){
			json[n['name']] = n['value'];
		});
		return json;
	};
}
);

var ActiveSearchFiltersView = Backbone.View.extend(
{
  el: '#active-filters-list',
  initialize: function() {

    _.bindAll(this);
    this.options.searchParameters.bind('change', this.render);
    this.options.postFilters.bind('change', this.render);

  },
  render: function() {
    $('#active-filters').show();
    $(this.el).empty();
    var p = this.options.searchParameters.get('platform');
    var platformText;
    if ( _.isEqual( p, AsfPlatformConfig.platform ) ) {
      platformText = 'All Platforms';
    } else if( _.isEmpty( p ) ) {
      platformText = 'No platforms selected'
    } else {
      platformText = AsfUtility.rtrim( _.reduce( p, function( m, e ) {
        return m + AsfPlatformConfig.platformTypes[e] + ', ';
      }, ''), ', ');
    }

    var activeDateAndPlatforms = this.options.searchParameters.toJSON();
    activeDateAndPlatforms['platformText'] = platformText;

    $(this.el).append(
      _.template('<h4><%= platformText %>: <%= start %>&mdash;<%= end %></li>', activeDateAndPlatforms )
    );
    var ul = $('<ul/>');

    var postFilterText;
    if( true != _.isUndefined( this.options.postFilters ) ) {
      
      // We want to iterate over the list of post filters, hence
      // the unfortunate syntax below
      _.each( this.options.postFilters.postFilters, function(e, i, l) {

        var f = e.toJSON();

        var postFilterItems = [];
        if( f.direction && 'any' != f.direction ) {
          postFilterItems.push( AsfUtility.ucfirst( f.direction ) );
        }
        if( f.path ) {
          // ALOS = special case
          if( 'ALOS' == i ) {
            postFilterItems.push( 'Path(s) ' + f.path);
          } else {
            postFilterItems.push( 'Orbit(s) ' + f.path);
          }
        }
        if( f.frame ) {
          postFilterItems.push('Frame(s) '+f.frame)  
        }

        // ALOS case
        if( f.beamoffnadir ) {
          var beamsOffNadirs = [];
          if ( _.isEqual( f.beamoffnadir, e.defaults.beamoffnadir ) ) {
            // this either means that _all_ beam modes are selected, so don't paint anything
          } else {
            
            if( _.isEqual( ['empty'], f.beamoffnadir ) ) {
              // No beam modes selected
              beamsOffNadirs.push('(No beam modes selected)');
            } else { 
              _.each( f.beamoffnadir, function( e, i, l ) {
                if( 'WB1' == e ) {
                  beamsOffNadirs.push('WB1');
                } else if( 'WB2' == e ) {
                  beamsOffNadirs.push('WB1');                
                } else {
                  beamsOffNadirs.push(e.substr(0, 3) + ' (' + e.substr(3) + '&deg;)');
                }
              });
            postFilterItems.push(beamsOffNadirs.join(' / '));
            }
          }          
        }

        // RADARSAT case
        if( f.beam ) {
          var beams = [];
          if( _.isEqual( f.beam, e.defaults.beam) ) {
            // All beam modes selected, don't display anything
          } else {
            if( _.isEqual( ['empty'], e.beam )) {
              beams.push( '(No beam modes selected)' );            
            } else {
              _.each( f.beam, function( e, i, l ) {
                beams.push(e.substring(1, 3));
              });
            }
            postFilterItems.push(beams.join(' / '));
          }
        }

        if( true != _.isEmpty( postFilterItems ) ) {
          ul.append(
            _.template('<li><%= postFilters %></li>', { 'postFilters': e.platform + ': '+postFilterItems.join(', ') } )
          );
        }

      }, this);
    }
    $(this.el).append(ul);
    return this;
  }

  


});

JSON.stringify = JSON.stringify || function (obj) {
	var t = typeof (obj);
	if (t != "object" || obj === null) {

		if (t == "string") obj = '"'+obj+'"';
		return String(obj);
	}
	else {

		var n, v, json = [], arr = (obj && obj.constructor == Array);
		for (n in obj) {
			v = obj[n]; t = typeof(v);
			if (t == "string") v = '"'+v+'"';
			else if (t == "object" && v !== null) v = JSON.stringify(v);
			json.push((arr ? "" : '"' + n + '":') + String(v));
		}
		return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
	}
};

JSON.parse = JSON.parse || function (str) {
	if (str === "") str = '""';
	eval("var p=" + str + ";");
	return p;
};
