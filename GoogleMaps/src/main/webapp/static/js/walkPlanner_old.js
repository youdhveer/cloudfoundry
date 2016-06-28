function routePoint(marker, roadPath) {
    this.marker = marker;
    this.roadPath = roadPath;
    this.polyline = null;
    this.walkDistance = 0;
    this.walkTime = 0;
    this.pathPoints = 0;
    this.altitude = 0;
    this.setMarker = function(marker) {
        this.marker = marker;
    };
    this.getMarker = function() {
        return this.marker;
    };
    this.isRoadPath = function() {
        return this.roadPath;
    };
    this.setPolyline = function(polyline) {
        this.polyline = polyline;
    };
    this.getPolyline = function() {
        return this.polyline;
    };
    this.getWalkDistance = function() {
        return this.walkDistance;
    };
    this.setWalkDistance = function(walkDistance) {
        this.walkDistance = walkDistance;
    };
    this.getWalkTime = function() {
        return this.walkTime;
    };
    this.setWalkTime = function(walkTime) {
        this.walkTime = walkTime;
    };
    this.getPathPoints = function() {
        return this.pathPoints;
    };
    this.setPathPoints = function(pathPoints) {
        this.pathPoints = pathPoints;
    };
    this.getAltitude = function() {
        return this.altitude;
    };
    this.setAltitude = function(altitude) {
        this.altitude = altitude;
    }
}

function pointOfInterest(marker) {
    this.marker = marker;
    this.setMarker = function(marker) {
        this.marker = marker;
    };
    this.getMarker = function() {
        return this.marker;
    }
}

function initialize() {
    geocoder = new google.maps.Geocoder;
    var mapOptions = {
        zoom: 8,
        disableDoubleClickZoom: true,
        panControl: false,
        scaleControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: new google.maps.LatLng(28.6139, 77.2090),
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        },
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL
        },
        scrollwheel: false,
        draggableCursor: "crossHair"
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    elevator = new google.maps.ElevationService;
    google.maps.event.addListener(map, "dblclick", function(a) {});
    listenerHandle1 = google.maps.event.addListener(map, "click", recordLocation);
    google.maps.event.addListener(map, "zoom_changed", checkSnapToRoad);
    $("#totalPathPoints").html(0);
}

function enableSnapToRoad() {
    if (map.getZoom() < 14) {
        alert("To use 'Snap To Road' increase your zoom level (zoom in) until the map scale shows 500m.");
        document.getElementById("onRoad").checked = false
    } else {}
}

function checkSnapToRoad() {
    if (document.getElementById("onRoad").checked == true && map.getZoom() < 14) {
        document.getElementById("onRoad").checked = false
    }
}

function recordLocation(a) { // a means 'event'
    if (userId == "-1") {
        alert("Please login or register to create a walk.")
    } else {
        var b = new google.maps.Geocoder;
        var c = 0;
        var d = "None";
        b.geocode({
            latLng: a.latLng
        }, function(b, e) {
            if (e == google.maps.GeocoderStatus.OK) {
                for (var f = 0; f < b[0].address_components.length; f++) {
                    for (var g = 0; g < b[0].address_components[f].types.length; g++) {
                        if (b[0].address_components[f].types[g] == "postal_code") {
                            c = b[0].address_components[f].long_name
                        } else {
                            c = "0"
                        }
                        if (b[0].address_components[f].types[g] == "country") {
                            d = b[0].address_components[f].long_name
                        }
                    }
                }
            }
            if (c != 0 && d == "Australia") {
                var h = new google.maps.Marker({
                    position: a.latLng,
                    draggable: true,
                    raiseOnDrag: true,
                    icon: new google.maps.MarkerImage("images/greenmarker.png"),
                    map: map
                });
                routePointArray[routePointArray.length] = new routePoint(h, onRoad());
                totalPoints[totalPoints.length] = totalPoints.push(h.getPosition());
                extendRoute();
                if (routePointArray.length == 1) {
                    getAddressAndPostalCode();
                   $("#totalPathPoints").html(1);
                }
                getElevation(a.latLng, routePointArray.length - 1);
                listenerHandle2 = google.maps.event.addListener(h, "dragstart", function() {
                    for (var a = 0; a < routePointArray.length; a++) {
                        if (routePointArray[a].getMarker().getPosition().equals(h.getPosition())) {
                            draggedMarkerPosition = h.getPosition();
                            modifiedPointIndex = a;
                            break;
                        }
                    }
                });
                listenerHandle3 = google.maps.event.addListener(h, "dragend", function() {
                    var a = 0;
                    var b = "None";
                    var c = h.getPosition().lat();
                    var d = h.getPosition().lng();
                    var e = new google.maps.LatLng(c, d);
                    geocoder.geocode({
                        latLng: e
                    }, function(c, d) {
                        if (d == google.maps.GeocoderStatus.OK) {
                            for (var f = 0; f < c[0].address_components.length; f++) {
                                for (var g = 0; g < c[0].address_components[f].types.length; g++) {
                                    if (c[0].address_components[f].types[g] == "postal_code") {
                                        a = c[0].address_components[f].long_name
                                    } else {
                                        a = "0"
                                    }
                                    if (c[0].address_components[f].types[g] == "country") {
                                        b = c[0].address_components[f].long_name
                                    }
                                }
                            }
                        }
                        if (a != 0 && b == "India") {
                            routePointArray[modifiedPointIndex].setMarker(h);
                            redrawRouteSection(modifiedPointIndex)
                        } else {
                            alert("You can not drag outside India region.");
                            h.setPosition(draggedMarkerPosition);
                            routePointArray[modifiedPointIndex].setMarker(h)
                        }
                        if (modifiedPointIndex == 0) {
                            getAddressAndPostalCode()
                        }
                        getElevation(e, modifiedPointIndex)
                    })
                })
            } else {
                aert("Please click only on India region to create a walk.")
            }
        })
    }
}

function extendRoute() {
    if (routePointArray.length > 1) {
        if (routePointArray[routePointArray.length - 1].isRoadPath()) {
            updateRoadRoute(routePointArray[routePointArray.length - 2].getMarker().getPosition(), routePointArray[routePointArray.length - 1].getMarker().getPosition())
        } else {
            updateNonRoadRoute(routePointArray[routePointArray.length - 2].getMarker().getPosition(), routePointArray[routePointArray.length - 1].getMarker().getPosition())
        }
    }
}

function updateRoadRoute(a, b) {
    var c = 0;
    var d = 0;
    var e = 0;
    var f = new google.maps.DirectionsService;
    var g = {
        origin: a,
        destination: b,
        provideRouteAlternatives: false,
        travelMode: google.maps.DirectionsTravelMode.WALKING
    };
    var h = new google.maps.Polyline({
        path: [],
        strokeColor: "#6A5ACD",
        strokeOpacity: .8,
        strokeWeight: 5
    });
    f.route(g, function(a, b) {
        if (b == google.maps.DirectionsStatus.OK) {
            var f = a.routes[0].overview_path;
            var g = a.routes[0].legs;
            for (i = 0; i < g.length; i++) {
                var l = g[i].steps;
                for (j = 0; j < l.length; j++) {
                    var m = l[j].path;
                    e += m.length;
                    for (k = 0; k < m.length; k++) {
                        h.getPath().push(m[k])
                    }
                }
            }
            for (i = 0; i < g.length; i++) {
                c += g[i].distance.value;
                d += g[i].duration.value
            }
            c = c / 1e3;
            d = d / 60;
            routePointArray[routePointArray.length - 1].setWalkDistance(c);
            routePointArray[routePointArray.length - 1].setWalkTime(d);
            routePointArray[routePointArray.length - 1].setPolyline(h);
            routePointArray[routePointArray.length - 1].setPathPoints(e);
            h.setMap(map);
            totalWalkDistanceTime();
            checkRoutePointsLimit()
        }
    })
}

function updateNonRoadRoute(a, b) {
    var c = 0;
    var d = 0;
    var e = [a, b];
    var f = new google.maps.Polyline({
        path: e,
        strokeColor: "#6A5ACD",
        strokeOpacity: .8,
        strokeWeight: 5,
        clickable: true,
        geodesic: false
    });
    routePointArray[routePointArray.length - 1].setPolyline(f);
    f.setMap(map);
    c += f.inKm();
    d = c / NONROAD_WALK_SPEED * 60;
    routePointArray[routePointArray.length - 1].setWalkDistance(c);
    routePointArray[routePointArray.length - 1].setWalkTime(d);
    routePointArray[routePointArray.length - 1].setPathPoints(0);
    totalWalkDistanceTime();
    checkRoutePointsLimit()
}

function recordLocationPOI(a) {
    document.pointOfInterestForm.duplicatePOI.value = "false";
    if (pointOfInterestArray.length < 40) {
        if (!top.frames["content"].poiInserted) {
            if (document.getElementById("CreatePointOfInterest_hazard").checked) {
                var b = new google.maps.Marker({
                    position: a.latLng,
                    draggable: false,
                    //icon: new google.maps.MarkerImage("images/Flagmarker.png"),
                    map: map
                })
            } else {
                var b = new google.maps.Marker({
                    position: a.latLng,
                    draggable: false,
                   // icon: new google.maps.MarkerImage("images/bluedot.png"),
                    map: map
                })
            }
            pointOfInterestArray[pointOfInterestArray.length] = new pointOfInterest(b);
            totalPointsOfInterests();
            top.frames["content"].poiInserted = true;
            top.frames["content"].poiMarker = true;
            top.frames["content"].document.pointOfInterestForm.duplicatePOI.value = "false";
            google.maps.event.addListener(b, "rightclick", function() {
                undoLastPOI()
            })
        } else {
            alert("Please click 'Save & Add another Point of Interest' before continuing");
        }
    } else {
        top.frames["content"].document.pointOfInterestForm.duplicatePOI.value = "true";
        alert("You have entered 40 Points of Interest! Thank you.Unfortunately no more Points of Interest can be added to this walk.");
        return false
    }
}

function undoLastRoutePoint() {
    if (routePointArray.length > 1 && !poiFlag && !savePOIFlag) {
        if (routePointArray[routePointArray.length - 1].isRoadPath()) {
            var a = routePointArray[routePointArray.length - 1].getMarker();
            var b = routePointArray[routePointArray.length - 1].getPolyline();
            a.setMap(null);
            if (b != null) {
                b.setMap(null)
            }
            routePointArray.splice(routePointArray.length - 1, 1)
        } else {
            var a = routePointArray[routePointArray.length - 1].getMarker();
            var c = routePointArray[routePointArray.length - 1].getPolyline();
            a.setMap(null);
            c.setMap(null);
            routePointArray.splice(routePointArray.length - 1, 1)
        }
        totalWalkDistanceTime();
        checkRoutePointsLimit()
    } else if (routePointArray.length == 1) {
        var a = routePointArray[routePointArray.length - 1].getMarker();
        a.setMap(null);
        routePointArray.splice(routePointArray.length - 1, 1);
        document.getElementById("totalPathPoints").innerHTML = 0
    } else if (poiFlag && !savePOIFlag) {
        if (setConfirmPOIMessage()) {
            confirm(confirmMsg, function() {
                undoLastPOI()
            })
        } else {
            tb_alert_show("", "", "", "Sorry, there are no Points of Interest to undo at this stage.", 100, 300)
        }
    } else {}
}

function undoLastPOI() {
    if (pointOfInterestArray.length >= 1) {
        var a = pointOfInterestArray[pointOfInterestArray.length - 1].getMarker();
        var b = a.getPosition().lat();
        var c = a.getPosition().lng();
        a.setMap(null);
        top.frames["content"].poiMarker = false;
        pointOfInterestArray.splice(pointOfInterestArray.length - 1, 1);
        poiNumber = poiNumber - 1;      
       
    }
}

function undoFailedPOI() {
    var a = pointOfInterestArray[pointOfInterestArray.length - 1].getMarker();
    var b = a.getPosition().lat();
    var c = a.getPosition().lng();
    a.setMap(null);
    top.frames["content"].poiInserted = false;
    pointOfInterestArray.splice(pointOfInterestArray.length - 1, 1);
    poiNumber = poiNumber - 1;
    parent.content.document.getElementById("total").innerHTML = pointOfInterestArray.length
}

function deleteAnyPOI(a) {
    var b = [];
    var c = [];
    for (var d = 0; d < a; d++) {
        b[d] = pointOfInterestArray[d]
    }
    for (var e = a + 1; e < pointOfInterestArray.length; e++) {
        b[b.length] = pointOfInterestArray[e]
    }
    var f = pointOfInterestArray[a].getMarker();
    var g = f.getPosition().lat();
    var h = f.getPosition().lng();
    var i = confirm("You are about to delete this Point of Interest. Are you sure?");
    if (i == true) {
        pointOfInterestArray = [];
        f.setMap(null);
        top.frames["content"].poiInserted = false;
        pointOfInterestArray = b.concat(c);
        poiNumber = poiNumber - 1;
        top.frames["content"].deletePOIRequest(g, h);
        parent.content.document.getElementById("total").innerHTML = pointOfInterestArray.length
    }
}

function onRoad() {
    return document.getElementById("onRoad").checked
}

function resetRoute() {
    if (!poiFlag) {
        while (routePointArray.length > 0) {
            undoLastRoutePoint()
        }
    } else {
        alert("Sorry, you cannot change the route of the map at this stage.  If you'd like to do so, click 'Start again' - beware, this will delete all the Points of Interests you have entered!");
    }
}

function redrawNonRoadWalk(a, b, c) {
    var d = 0;
    var e = 0;
    var f = routePointArray[a].getPolyline();
    f.setMap(null);
    var g = [b, c];
    var h = new google.maps.Polyline({
        path: g,
        strokeColor: "#6A5ACD",
        strokeOpacity: .8,
        strokeWeight: 5,
        clickable: true,
        geodesic: false
    });
    routePointArray[a].setPolyline(h);
    h.setMap(map);
    e += h.inKm();
    d = e / NONROAD_WALK_SPEED * 60;
    routePointArray[a].setWalkDistance(e);
    routePointArray[a].setWalkTime(d);
    routePointArray[a].setPathPoints(0);
    totalWalkDistanceTime();
    checkRoutePointsLimit()
}

function redrawRoadWalk(a, b, c) {
    var d = 0;
    var e = 0;
    var f = 0;
    var g = routePointArray[a].getPolyline();
    g.setMap(null);
    var h = new google.maps.DirectionsService;
    var l = {
        origin: b,
        destination: c,
        provideRouteAlternatives: false,
        travelMode: google.maps.DirectionsTravelMode.WALKING
    };
    var m = new google.maps.Polyline({
        path: [],
        strokeColor: "#6A5ACD",
        strokeOpacity: .8,
        strokeWeight: 5
    });
    h.route(l, function(b, c) {
        if (c == google.maps.DirectionsStatus.OK) {
            var g = b.routes[0].overview_path;
            var h = b.routes[0].legs;
            for (i = 0; i < h.length; i++) {
                var l = h[i].steps;
                for (j = 0; j < l.length; j++) {
                    var n = l[j].path;
                    f += n.length;
                    for (k = 0; k < n.length; k++) {
                        m.getPath().push(n[k])
                    }
                }
            }
            for (i = 0; i < h.length; i++) {
                d += h[i].distance.value;
                e += h[i].duration.value
            }
            d = d / 1e3;
            e = e / 60;
            routePointArray[a].setWalkDistance(d);
            routePointArray[a].setWalkTime(e);
            routePointArray[a].setPolyline(m);
            routePointArray[a].setPathPoints(f);
            m.setMap(map);
            totalWalkDistanceTime();
            checkRoutePointsLimit()
        }
    })
}

function redrawRouteSection(a) {
    if (routePointArray.length > 1) {
        if (a == 0 && !routePointArray[a + 1].isRoadPath()) {
            redrawNonRoadWalk(a + 1, routePointArray[a].getMarker().getPosition(), routePointArray[a + 1].getMarker().getPosition())
        } else if (a == 0 && routePointArray[a + 1].isRoadPath()) {
            redrawRoadWalk(a + 1, routePointArray[a].getMarker().getPosition(), routePointArray[a + 1].getMarker().getPosition())
        } else if (a == routePointArray.length - 1 && !routePointArray[a].isRoadPath()) {
            redrawNonRoadWalk(a, routePointArray[a - 1].getMarker().getPosition(), routePointArray[a].getMarker().getPosition())
        } else if (a == routePointArray.length - 1 && routePointArray[a].isRoadPath()) {
            redrawRoadWalk(a, routePointArray[a - 1].getMarker().getPosition(), routePointArray[a].getMarker().getPosition())
        } else if (!routePointArray[a].isRoadPath() && !routePointArray[a + 1].isRoadPath()) {
            redrawNonRoadWalk(a, routePointArray[a - 1].getMarker().getPosition(), routePointArray[a].getMarker().getPosition());
            redrawNonRoadWalk(a + 1, routePointArray[a].getMarker().getPosition(), routePointArray[a + 1].getMarker().getPosition())
        } else if (routePointArray[a].isRoadPath() && routePointArray[a + 1].isRoadPath()) {
            redrawRoadWalk(a, routePointArray[a - 1].getMarker().getPosition(), routePointArray[a].getMarker().getPosition());
            redrawRoadWalk(a + 1, routePointArray[a].getMarker().getPosition(), routePointArray[a + 1].getMarker().getPosition())
        } else if (!routePointArray[a].isRoadPath() && routePointArray[a + 1].isRoadPath()) {
            redrawNonRoadWalk(a, routePointArray[a - 1].getMarker().getPosition(), routePointArray[a].getMarker().getPosition());
            redrawRoadWalk(a + 1, routePointArray[a].getMarker().getPosition(), routePointArray[a + 1].getMarker().getPosition())
        } else if (routePointArray[a].isRoadPath() && !routePointArray[a + 1].isRoadPath()) {
            redrawRoadWalk(a, routePointArray[a - 1].getMarker().getPosition(), routePointArray[a].getMarker().getPosition());
            redrawNonRoadWalk(a + 1, routePointArray[a].getMarker().getPosition(), routePointArray[a + 1].getMarker().getPosition())
        }
    }
}

function checkRoutePointsLimit() {
    var a = 0;
    for (var b = 0; b < routePointArray.length; b++) {
        a += routePointArray[b].getPathPoints()
    }
    a += routePointArray.length;
    if (a > 60) {
        tb_alert_show("", "", "", "You have used all 60 route points. 'Snap to Road' may take up many route points, especially over long distances or curved roads. Use undo to remove some route points to complete your walk.", 150, 350);
        undoLastRoutePoint()
    } else {
        document.getElementById("totalPathPoints").innerHTML = a
    }
}

function saveRoute() {
    for (var a = 1; a < routePointArray.length - 1; a++) {
        var b = routePointArray[a].getMarker();
        b.setMap(null)
    }
    for (var a = 0; a < routePointArray.length; a++) {
        var b = routePointArray[a].getMarker();
        b.setDraggable(false)
    }
    google.maps.event.removeListener(listenerHandle1);
    google.maps.event.removeListener(listenerHandle2);
    google.maps.event.removeListener(listenerHandle3)
}

function drawPOI() {
    for (var a = 0; a < routePointArray.length; a++) {
        if (routePointArray[a].getPolyline() != null) {
            listenerPOI[listenerPOI.length] = new google.maps.event.addListener(routePointArray[a].getPolyline(), "click", recordLocationPOI)
        }
    }
}

function totalPointsOfInterests() {
    poiNumber += 1;
    if (poiNumber > pointOfInterestArray.length + 1) {
        poiNumber = poiNumber - 1
    }
    top.frames["content"].document.pointOfInterestForm.totalPOI.value = pointOfInterestArray.length;
    top.frames["content"].document.pointOfInterestForm.latitude.value = pointOfInterestArray[pointOfInterestArray.length - 1].getMarker().getPosition().lat();
    top.frames["content"].document.pointOfInterestForm.longitude.value = pointOfInterestArray[pointOfInterestArray.length - 1].getMarker().getPosition().lng();
    top.frames["content"].document.pointOfInterestForm.altitude.value = 0;
    top.frames["content"].document.pointOfInterestForm.moveNext.value = 0
}

function updateHazardMarker() {
    if (top.frames["content"].poiMarker) {
        var a = pointOfInterestArray[pointOfInterestArray.length - 1];
        var b = a.getMarker();
        if (hazardFlag) {
            b.setIcon(new google.maps.MarkerImage("images/Flagmarker.png"))
        } else {
            b.setIcon(new google.maps.MarkerImage("images/bluedot.png"))
        }
    } else {
        tb_alert_show("", "", "", "Please mark the location of the hazard by clicking on the map. Afterwards, tick this box and a red flag should appear.", 150, 350);
        top.frames["content"].document.pointOfInterestForm.hazard.checked = false
    }
}

function totalWalkDistanceTime() {
    var a = 0;
    var b = 0;
    for (var c = 0; c < routePointArray.length; c++) {
        a += routePointArray[c].getWalkDistance();
        b += routePointArray[c].getWalkTime()
    }
    if (b < 10) {
    	$("#time").val("00:0" + Math.round(b) + "");
    } else if (b >= 10 && b < 60) {
    	$("#time").val("00:" + Math.round(b) + "");
    } else {
        b = Math.round(b);
        var d = b / 60;
        var e = b % 60;
        if (e < 10) {
        	 $("#time").val(Math.round(d) + ":0" + e + "");
        } else {
        	$("#time").val(Math.round(d) + ":" + e + "");
        }
    }
    $("#distance").val( Math.round(a * 10) / 10 + " Km");
}

function createJSONString() {
    data = "{";
    data += '"updatedOn":' + '""' + ",";
    data += '"createdBy":' + '""' + ",";
    data += '"createdOn":' + '""' + ",";
    data += '"staticMapUrl":' + '""' + ",";
    data += '"difficultyLevel":' + '"' + top.frames["content"].document.createWalkForm.level.value + '"' + ",";
    data += '"authorRating":' + '"' + top.frames["content"].document.createWalkForm.rating.value + '"' + ",";
    data += '"url":' + '""' + ",";
    data += '"title":' + '"' + top.frames["content"].document.createWalkForm.mapName.value + '"' + ",";
    data += '"uid":' + '""' + ",";
    data += '"walkAddress":' + '"' + walkAddress + '"' + ",";
    data += '"walkPostCode":' + '"' + walkPostCode + '"' + ",";
    var a = "[";
    for (var b = 0; b < routePointArray.length; b++) {
        var c = "{";
        var d = routePointArray[b];
        c += '"latitude":' + '"' + d.getMarker().getPosition().lat() + '"' + ",";
        c += '"longitude":' + '"' + d.getMarker().getPosition().lng() + '"' + ",";
        c += '"altitude":' + '"' + d.getAltitude() + '"' + ",";
        c += '"isPoi":' + '"0"' + ",";
        if (d.isRoadPath()) {
            c += '"snapToRoad":' + '"1"'
        } else {
            c += '"snapToRoad":' + '"0"'
        }
        c += "}";
        if (a == "[") {
            a += c
        } else {
            a += "," + c
        }
    }
    data += '"vwRoute":' + a + "]}";
    top.frames["content"].document.createWalkForm.walkDetails.value = data
}

function createXMLHttpRequest() {
    if (window.ActiveXObject) {
        xmlHttp = new ActiveXObject("Microsoft.XMLHTTP")
    } else if (window.XMLHttpRequest) {
        xmlHttp = new XMLHttpRequest
    }
}

function getAddressAndPostalCode() {
    var a = routePointArray[0].getMarker();
    var b = a.getPosition().lat();
    var c = a.getPosition().lng();
    var d = new google.maps.LatLng(b, c);
    geocoder.geocode({
        latLng: d
    }, function(a, b) {
        if (b == google.maps.GeocoderStatus.OK) {
            walkAddress = a[0].formatted_address;
            for (var c = 0; c < a[0].address_components.length; c++) {
                for (var d = 0; d < a[0].address_components[c].types.length; d++) {
                    if (a[0].address_components[c].types[d] == "postal_code") {
                        walkPostCode = a[0].address_components[c].long_name
                    } else {
                        walkPostCode = "0"
                    }
                }
            }
            return true
        } else {
            alert("Geocoder failed due to: " + b);
            return false
        }
    })
}

function getAddressAndPostalCodeForDragMarker(a) {
    var b = 0;
    var c = "None";
    var d = a.getPosition().lat();
    var e = a.getPosition().lng();
    var f = new google.maps.LatLng(d, e);
    geocoder.geocode({
        latLng: f
    }, function(a, d) {
        if (d == google.maps.GeocoderStatus.OK) {
            for (var e = 0; e < a[0].address_components.length; e++) {
                for (var f = 0; f < a[0].address_components[e].types.length; f++) {
                    if (a[0].address_components[e].types[f] == "postal_code") {
                        b = a[0].address_components[e].long_name
                    } else {
                        b = "0"
                    }
                    if (a[0].address_components[e].types[f] == "country") {
                        c = a[0].address_components[e].long_name
                    }
                }
            }
        }
        if (b != 0 && c == "Australia") {
            return true
        } else {
            return false
        }
    })
}


function getElevation(a, b) {
    var c = [];
    c.push(a);
    var d = {
        locations: c
    };
    elevator.getElevationForLocations(d, function(a, c) {
        if (c == google.maps.ElevationStatus.OK) {
            if (a[0]) {
                routePointArray[b].setAltitude(a[0].elevation)
            } else {
                tb_alert_show("", "", "", "No elevation results found !", 100, 280)
            }
        } else {
            tb_alert_show("", "", "", "Elevation service failed due to: " + c, 100, 280)
        }
    })
}
var poiNumber = 0;
var map;
var data;
var walkAddress;
var walkPostCode;
var draggedMarkerPosition;
var listenerHandle1;
var listenerHandle2;
var listenerHandle3;
var listenerPOI = [];
var hazardFlag;
var poiFlag = false;
var savePOIFlag = false;
var NONROAD_WALK_SPEED = 48 / 10;
var geocoder;
var rendererOptions = {
    draggable: false,
    suppressMarkers: true,
    preserveViewport: true
};
var modifiedPointIndex = -1;
var routePointArray = [];
var pointOfInterestArray = [];
var totalPoints = new Array;
var confirmMsg;
var elevator;
google.maps.LatLng.prototype.kmTo = function(a) {
    var b = Math,
        c = b.PI / 180;
    var d = this.lat() * c,
        e = a.lat() * c,
        f = d - e;
    var g = this.lng() * c - a.lng() * c;
    var h = 2 * b.asin(b.sqrt(b.pow(b.sin(f / 2), 2) + b.cos(d) * b.cos(e) * b.pow(b.sin(g / 2), 2)));
    return h * 6378.137
};
google.maps.Polyline.prototype.inKm = function(a) {
    var b = this.getPath(a),
        c = b.getLength(),
        d = 0;
    for (var e = 0; e < c - 1; e++) {
        d += b.getAt(e).kmTo(b.getAt(e + 1))
    }
    return d
};
