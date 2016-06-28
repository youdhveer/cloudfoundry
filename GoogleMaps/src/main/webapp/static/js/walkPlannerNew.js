var map;
		var polyWalkPath;
		var markersArray;
		var isGeoPath = false;
		var directionsService;
		var directionsDisplay;

				
		function initMap() {
			markersArray = new google.maps.MVCArray();
			var delhiLoc = {
				lat : 28.6139,
				lng : 77.2090
			};

			var mapDiv = document.getElementById('map');
			map = new google.maps.Map(mapDiv, {
				center : delhiLoc,
				zoom : 8
			});

			polyWalkPath = new google.maps.Polyline({
				strokeColor : '#000000',
				strokeOpacity : 1.0,
				strokeWeight : 3,
				geodesic:true
			});
			polyWalkPath.setMap(map);
			
			/*   map.addListener('click', function(event) {
			  	drawMyWalk(event.latLng);
			  }); */

			map.addListener('click', drawMyWalk);
			  
		    directionsService = new google.maps.DirectionsService;
			directionsDisplay = new google.maps.DirectionsRenderer({
			    draggable: true,
			    map: map
			});
			directionsDisplay.addListener('directions_changed', function() {
				    computeTotalDistance(directionsDisplay.getDirections());
			});
loud 
		}

		// Adds a marker to the map and push to the array.
		function drawMyWalk(event) {	
			var directionsService = new google.maps.DirectionsService;
			var directionsDisplay = new google.maps.DirectionsRenderer({
			    draggable: true,
			    map: map
			});
			
			if (isGeoPath) {
				var totalMarkers=markersArray.getLength();
				if(totalMarkers>0){
					var origin=event.latLng;
					var marker=markersArray.getAt(totalMarkers-1);					
					var destination=marker.getPosition();
					displayRoute(origin, destination, directionsService, directionsDisplay);
					
				}
				 
			} else {
				var path = polyWalkPath.getPath();
				path.push(event.latLng);
			}
			
			var marker = new google.maps.Marker({
				position : event.latLng,
				title : '#' + (markersArray.getLength()+1),
				map : map
				
			});
			
			markersArray.push(marker);
			
		}

		function updateMyWalk(event){
			if(isGeoPath){
				
			}else{
				var path = polyWalkPath.getPath();
				
				path.push(event.latLng);
			}
		}
		
		function displayRoute(origin, destination, service, display) {
			
			  service.route({
			    origin: origin,
			    destination: destination,
			    //waypoints: [{location: 'Adelaide, SA'}, {location: 'Broken Hill, NSW'}],
			    travelMode: google.maps.TravelMode.WALKING,
			    avoidTolls: true
			  }, function(response, status) {
			    if (status === google.maps.DirectionsStatus.OK) {
			      display.setDirections(response);
			      computeTotalDistance(display.getDirections());
			    } else {
			      alert('Could not display directions due to: ' + status);
			    }
			  });
		}

		function computeTotalDistance(result) {
			  var walkTime=0;
			  var walkDistance=0;
			  var myroute = result.routes[0];
			  for (var i = 0; i < myroute.legs.length; i++) {
				  walkDistance += myroute.legs[i].distance.value;
				  walkTime += myroute.legs[i].duration.value;
			  }
			  walkDistance = walkDistance / 1000;
			  walkTime = walkTime / 60;
			  $('#distanceCalc').val(walkDistance);
			  $('#timeCalc').val(walkTime);
		 
		}
			
		function setGeoFlag() {			
			if ($('#geoPath').is(':checked')) {
				isGeoPath = true;
			} else {
				isGeoPath = false;
			}
		}

		function undoPath() {
			if(markersArray.getLength()>0){
				var marker = markersArray.pop();
				marker.setMap(null);				
				if (isGeoPath) {
					alert('not ready this service yet..');
				} else {
					var path = polyWalkPath.getPath();
					path.pop();
				}
			}
			
		}

		function resetPath() {
			if(markersArray.getLength()>0){				
				while(markersArray.getLength()>0){
					var marker=markersArray.pop();
					marker.setMap(null);
				}		
				
				var path = polyWalkPath.getPath();
				while(path.getLength()>0){
					path.pop();
				}
			}
			
		}

		// ###################################################################################### //     

		function getDistance(p1, p2) {
			var R = 6378137; // Earth’s mean radius in meter
			var dLat = rad(p2.lat() - p1.lat());
			var dLong = rad(p2.lng() - p1.lng());
			var a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
					+ Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat()))
					* Math.sin(dLong / 2) * Math.sin(dLong / 2);
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
			var d = R * c;
			return d; // returns the distance in meter
		}

		var rad = function(x) {
			return x * Math.PI / 180;
		};