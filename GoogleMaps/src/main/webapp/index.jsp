<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
    <spring:url value="/static/css/bootstrap.min.css" var="bootstrapCss" />	
	<spring:url value="/static/js/bootstrap.min.js" var="bootstrapJs" />
	<spring:url value="/static/js/walkPlannerNew.js" var="walkPlannerJs" />
	
	<link href="${bootstrapCss}" rel="stylesheet" />
       
	<style>
		#map {
			width: 100%;
			height: 350px;
		}
	</style>
</head>
<body>
	
	
	 
	
	  <fieldset>
	     <div id="map"></div>
	 </fieldset>
	 
	   <form class="well form-inline">
	    <legend>Walk data</legend>
	    <div class="control-group">
	      <label class="control-label" for="distanceCalc">Distance</label>
	      <div class="controls">
	        <input type="text" class="input-small" id="distanceCalc" disabled="disabled">
	        <p class="help-block">Km</p>
	      </div>
	    </div>
	    <div class="control-group">
	      <label class="control-label" for="timeCalc">Time</label>
	      <div class="controls">
	        <input type="text" class="input-small" id="timeCalc" disabled="disabled">
	        <p class="help-block"></p>
	      </div>
	    </div>
	    <div class="control-group">
	       <label class="checkbox">
			    <input type="checkbox" id="geoPath" onchange="setGeoFlag()"> Snap To Road(Geo Walk)
		   </label>
	    </div>
	    <div class="control-group ">
	      <input type="button" id="undoBtn" value="Undo Path" class="btn btn-inverse" onclick="undoPath()" />
		  <button type="button" id="resetBtn" class="btn btn-danger" onclick="resetPath()" >Reset Path</button>
	    </div>
	 </form>

	<script	src="//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
	<script src="${bootstrapJs}"></script>
	<script src="${walkPlannerJs}"></script>	
	<script async defer
		src="https://maps.googleapis.com/maps/api/js?key=AIzaSyATV44LZY720qIRXK3ibS_OYqNkDv60uvg&callback=initMap">
		
	</script>
</body>
</html>