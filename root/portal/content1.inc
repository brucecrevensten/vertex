  <div id="contents">

    <div id="platform_profile" style="display: none;"></div>
    <div id="product_profile" style="display: none;"></div>
    <div id="download_queue"><table id="download_queue_table" style="width: 100%"></table></div>
    <div id="platform_facet" style="display: none;"></div>

	  <table><tr><td id="tableleftcol">
    <div id="leftColumn">
	  	
      <div id="filters"></div>
      <div style="margin: 1em 0;" id="platform_facets"></div>
      <div style="margin: 1em 0;">

        <button id="triggerSearch"></button>
		    <button id="stopSearch"></button>
		    <button id="resetSearch"></button>

		    <div>
          <br />
          <div id="searchMessage"></div> 
		    </div>
      </div>
    </div>

    </td><td id="tablecentercol">

    <div id="centerColumn">
      <div id="searchMap"></div>
    </div> <!-- end center column -->

    </td><td id="tablerightcol">

    <div id="rightColumn">

	    <!-- default search message -->
		  <div class="ui-widget">
	      <div id="before-search-msg" class="ui-state-highlight ui-corner-all">
	        <strong>Please use the map and/or the search parameters on the left to select your search criteria.</strong>
	      </div>
	    </div>
	
      <!-- loading async spinner -->
      <div class="ui-widget">
        <div id="async-spinner" class="ui-state-highlight ui-corner-all">
          <span class="ui-icon"></span>
          <strong>Loading search results&hellip;</strong>
        </div>
      </div>

      <!-- results banner -->
      <div class="ui-widget">
        <div id="results-banner" class="ui-state-highlight ui-corner-all"> 
          <span class="ui-icon ui-icon-info"></span>
          <strong>No results were found</strong> for your current search criteria.
        </div>
      </div>

      <!-- error banner -->
      <div class="ui-widget">
        <div id="error-message" class="ui-state-error ui-corner-all"> 
          <span class="ui-icon ui-icon-alert"></span>
          <code id="error-message-text"></code>
        </div>
      </div>

		
		  <div>
		    <div id="srCount"></div>
	      <div id="srProcLevelTool"></div>
		  </div>

      <div id="con">
        <table id="searchResults" style="margin:20px 0px 20px 0px;"></table>
      </div>
    </div>
    </td></tr></table>

  </div> <!-- end contents -->