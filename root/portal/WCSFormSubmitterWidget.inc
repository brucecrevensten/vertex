<div id="subsetter">
<iframe id="hifrm" height="0" width="0">
  <html>
    <head>
    </head>
    <body>
      <form id="formSub" action="" method="post"></form>
    </body>
  </html>
</iframe>

<div id="datasetSelection">
	<div id="bt1" class="boxTop">
	Available Datasets
	</div> 
	
    <div id="bb1" class="boxBody">
    <label for="dataset" class="WCSfields WCSlabelShort" id="dataSetField">Data Set:</label>
    <div name="dataset" id="dataset" class="WCSfields"  /></div><br />
    <label for="dataset" class="WCSfields WCSlabelShort" id="layerSetField">Layer:</label>
    <div name="layer" id="layer" class="WCSfields"  /></div><br />

 <!--   <div id="accordion">
    <h3><a href="#">Section 1</a></h3>
    <div>
        <p>
        Mauris 
        </p>
    </div>
    <h3><a href="#">Section 2</a></h3>
    <div>
        <p>
        Sed 
        </p>
    </div>
    <h3><a href="#">Section 3</a></h3>
    <div>
        <p>
        Nam 
        </p>
        <ul>
            <li>List item one</li>
            <li>List item two</li>
            <li>List item three</li>
        </ul>
    </div>
    <h3><a href="#">Section 4</a></h3>
    <div>
        <p>
        Cras 
        </p>
        <p>
        Suspendisse eu 
        </p>
    </div>
</div>-->


  	</div>
  

    

</div>

<div id="map"></div>

<div id="subsetterRightColumn">
<div id="formContainer">
	
	<div id="bt2" class="boxTop boxTopWide">
	Define Your Image Subset
	</div>
	
	<div id="bb2" class="boxBody boxBodyWide">
  	<form name="form1" id="form1" class="form1">
    <!--    <label for="imgW" class="WCSfields">Image Width</label>
        <input type="text" name="imgW" id="imgW" class="WCSfields"  /><br /> 
        <label for="imgH" class="WCSfields">Image Height</label>
        <input type="text" name="imgH" id="imgH" class="WCSfields"  /><br /> -->

        <label for="projection" class="WCSfields">Projection:</label>
        <div name="projection" id="projection" class="WCSfields"  /></div><br />

        <label for="imgF" class="WCSfields">Image Format:</label>
        <div name="imgF" id="imageFormat" class="WCSfields"  /></div><br />

        <label for="interpolation" class="WCSfields">Interpolation Method:</label>
        <div name="interpolation" id="interpolation" class="WCSfields"  /></div><br />

        <label for="imageWidth" class="WCSfields">Resolution X:</label>
        <div name="imageWidth" id="imageWidth" class="WCSfields WCSfieldsShort"  /></div>
        	<div class="postFieldText">degrees</div><br />

        <label for="imageHeight" class="WCSfields">Y:</label>
        <div name="imageHeight" id="imageHeight" class="WCSfields WCSfieldsShort"  /></div>
        	<div class="postFieldText">degrees</div><br /><br /><br />

		<label for="b1" class="WCSfields"><!--Top--></label><div id="fill1" class="filler1" /></div>
		<div id="b2" class="WCSfields WCSfieldsShort" style="margin-bottom: 3px;" /></div><br />
        <label for="b1" class="WCSfields"><!--Left-->Spatial Extent:
<!--        		<br />East and North bounds are adjusted automatically to make width/height to be integer multiples of resolution x/y-->
        		</label>
        <div id="b1" class="WCSfields WCSfieldsShort"  /></div>
		<div class="arrow4way"> 
			<img src="[% c.uri_for('/static/images/arrow4way.png') %]" alt="" />
		</div>
<!--        <label for="b3" class="WCSfields">Right</label>-->
        <div id="b3" class="WCSfields WCSfieldsShort"  /></div><br />
		<label for="b0" class="WCSfields"><!--Bottom--></label><div id="fill1" class="filler1" /></div>
		<div id="b0" class="WCSfields WCSfieldsShort" style="margin-top: -1px;"  /></div><br />
 


     <!--   <label for="band" class="WCSfields">Bands</label>
        <div name="band" id="band" class="WCSfields"  /></div><br /> -->
       
       <!-- <label for="interp" class="WCSfields">Interpolation Method</label>
        <input type="text" name="interp" id="interp" class="WCSfields"  /><br />
        <label for="outProj" class="WCSfields">Output Projection</label>
        <input type="text" name="outProj" id="outProj" class="WCSfields"  /><br /> -->
    </form>
    </div>
</div>
	<div id="formButtons">
		<div id="downloadButton"></div>
		&nbsp;|&nbsp;<a href="#">Reset Settings</a>
	</div>
</div>



<div class="content">
    <div class="categories">
      <ul>
        <li>Africa Mozaic</li>
        <li>Antarctica Mozaic</li>
        <li>The moon</li>
        <li>My House</li>
        <div class="clear"></div>
      </ul>
    </div>

</div>