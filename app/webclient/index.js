"use strict"

// extremely quick "authentication" prompt
// server and consequently client MUST be reworked for actual security
var token = ""
fetch("/gettoken/?" + new URLSearchParams({
	username: prompt("Username"),
	sha512_password: prompt("Password")
})).then(r => r.json()).then(r => {
	if (!r.token) {
		alert("Login fail");
	} else {
		token = r.token;
		fetch("/userdata/?" + new URLSearchParams({
			token:token, tiles: true, inventory: true, buildables: true
		}))
			.then(r => r.json()).then(r => mergeUserData(r));
	}
})

var view = new ol.View({
	center: ol.proj.fromLonLat([114.119,22.337]),
	resolution: 80,
	maxResolution: 100,
	extent: [
		...ol.proj.fromLonLat([113.819,22.037]),
		...ol.proj.fromLonLat([114.419,22.637])
	],
	constrainOnlyCenter: true
});

var geolocation = new ol.Geolocation({
	projection: view.getProjection(),
	tracking: true
});
var positionFeature = new ol.Feature();
positionFeature.setStyle(
	new ol.style.Style({
		image: new ol.style.Circle({
			radius: 8,
			fill: new ol.style.Fill({
				color: "#3399CC"
			}),
			stroke: new ol.style.Stroke({
				color: "#FFFFFF",
				width: 2
			})
		})
	})
);
geolocation.on("change:position", function() {
	let coords = geolocation.getPosition();
	positionFeature.setGeometry(coords ? new ol.geom.Point(coords) : null);
});

var binPinLayer = new ol.layer.Vector({
	style: new ol.style.Style({
		image: new ol.style.Circle({
			radius: 8,
			fill: new ol.style.Fill({
				color: "#CC3399"
			}),
			stroke: new ol.style.Stroke({
				color: "#FFFFFF",
				width: 2
			})
		})
	}),
	maxResolution: 5
});
/**
* bins.json
* longitude and latitudes of waste separation bins.
* Addresses from <www.wastereduction.gov.hk/en/quickaccess/vicinity.htm?collection_type=bin> passed through <geocodeapi.io>
*/
fetch("./bins.json")
	.then(r => r.json())
	// turn list of {lon:x,lat:y} into list of ol.Feature
	.then(bins => {
		return bins.map(bin => new ol.Feature({
			geometry: new ol.geom.Point(
				ol.proj.fromLonLat([bin.lon,bin.lat])
			),
		}))
	})
	// set binPinSource
	.then(bins => {
		binPinLayer.setSource(new ol.source.Vector({features:bins}));
	});

var buildingLayer = new ol.layer.Vector({
	style: new ol.style.Style({
		image: new ol.style.Circle({
			radius: 8,
			fill: new ol.style.Fill({
				color: "#99CC33"
			}),
			stroke: new ol.style.Stroke({
				color: "#FFFFFF",
				width: 2
			})
		})
	}),
	minResolution: 5,
	maxResolution: 200
});
fetch("./point_ids.json")
	.then(r => r.json())
	// turn list of {lon:x,lat:y} into list of ol.Feature
	.then(bs => {
		return bs.map(b => {
			let feature = new ol.Feature({
				geometry: new ol.geom.Point(
					ol.proj.fromLonLat([b.lon,b.lat])
				)
			})
			feature.setId(b.id);
			return feature;
		})
	})
	.then(bs => {
		buildingLayer.setSource(new ol.source.Vector({features:bs}));
	});


var plotInfoOverlay = new ol.Overlay({
	element: document.getElementById("plotinfodiv")
});

var select = new ol.interaction.Select({
	toggleCondition: ol.events.condition.never,
	layers: [buildingLayer]
})
select.on("select", function(evt) {
	// only one feature selected/deselected at once
	if (evt.selected.length > 0) {
		plotInfoOverlay.setPosition(
			evt.selected[0].getGeometry().getCoordinates()
		);
		let tile = buildings[evt.selected[0].getId()];
		if (!tile) {
			tile = {name:"Empty Tile",description:"Put something here"};
		}
		document.getElementById("plottitle").innerHTML = tile.name;
		document.getElementById("plotdesc").innerHTML = tile.description;
	}
	else if (evt.deselected.length > 0) {
		plotInfoOverlay.setPosition(undefined);
	}
});


var map = new ol.Map({
	target: "map",
	layers: [
		new ol.layer.Tile({
			source: new ol.source.OSM()
		}),
		new ol.layer.Vector({
			source: new ol.source.Vector({
				features: [positionFeature]
			})
		}),
		binPinLayer,
		buildingLayer
	],
	view: view,
	overlays: [plotInfoOverlay],
	interactions: [...ol.interaction.defaults().getArray(), select]
});

var buildings = {};
var buildables = [];
var inventory = [];

function mergeUserData(data) {
	function updateMenu(element,source,fetchFunc) {
		// clear menu items
		while (element.firstChild) {
			element.removeChild(element.firstChild);
		}
		// add menu items
		for (let i of source) {
			let e = document.createElement("DIV");
			e.setAttribute("class","tilemenu-item");
			e.innerHTML = i.name;
			e.addEventListener("click", function() {
				fetchFunc(i).then(r => r.json()).then(r => mergeUserData(r));
				// hide overlay
				plotInfoOverlay.setPosition(undefined);
			});
			element.appendChild(e);
		}
	}
	if (data.tiles) buildings = data.tiles;
	if (data.inventory) {
		inventory = data.inventory;
		updateMenu(
			document.getElementById("buildinv-menu"),
			inventory,
			function(tile) {
				return fetch("/swaptile/?token="+token,{
					method: "PUT",
					body: JSON.stringify({
						tile: select.getFeatures().getArray()[0].getId(),
						inventory: inventory.indexOf(tile)
					})
				});
			}
		);
	}
	if (data.buildables) {
		buildables = data.buildables;
		updateMenu(
			document.getElementById("buildnew-menu"),
			buildables,
			function(buildable) {
				return fetch("/buildnew/?token="+token,{
					method: "PUT",
					body: JSON.stringify({
						tile: select.getFeatures().getArray()[0].getId(),
						type: buildable.name
					})
				})
			}
		);
	}
}
