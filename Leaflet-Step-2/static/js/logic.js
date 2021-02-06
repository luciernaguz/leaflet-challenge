// queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// d3 json
d3.json(queryUrl, function(data) {
  createFeatures(data.features);
  //console.log(data.features)
});

// features
function createFeatures(earthquakeData) {

  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  // Function to create the circle radius based on the magnitude
  function radiusSize(magnitude) {
    return magnitude * 20000;
  }

  // Function to set the circle color based on the magnitude
  function circleColor(magnitude) {
    if (magnitude < 1) {
      return "#CCFF33"
    }
    else if (magnitude < 2) {
      return "#FFFF33"
    }
    else if (magnitude < 3) {
      return "#FFCC33"
    }
    else if (magnitude < 4) {
      return "#FF9933"
    }
    else if (magnitude < 5) {
      return "#FF6633"
    }
    else {
      return "#FF3333"
    }
  }

  // create each earthquake
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(earthquakeData, latlng) {
      return L.circle(latlng, {
        radius: radiusSize(earthquakeData.properties.mag),
        color: circleColor(earthquakeData.properties.mag),
        fillOpacity: 1
      });
    },
    onEachFeature: onEachFeature
  });

  // createMap function
  createMap(earthquakes);
}
// Define outdoormap, satellitemap, and grayscalemap layers
function createMap(earthquakes) {
  
  var outdoorsmap =  L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}" , {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var grayscalemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "light-v10",
  accessToken: API_KEY
  });

  // Create faultline layer
  var faultLine = new L.LayerGroup();
  
  // baseMaps 
  var baseMaps = {
    "Outdoor Map": outdoorsmap,
    "Greyscale Map": grayscalemap,
    "Satellite Map": satellitemap
  };

  // overlay object 
  var overlayMaps = {
    Earthquakes: earthquakes,
    FaultLines: faultLine
  };

  // Create map
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4,
    layers: [outdoorsmap, earthquakes, faultLine]    
  });

  // layer control
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // faultline data
  var faultlinequery = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";
  
  // faultlines 
  d3.json(faultlinequery, function(data) {
    L.geoJSON(data, {
      style: function() {
        return {color: "orange", fillOpacity: 0}
      }
    }).addTo(faultLine)
  })

  //Legend 
  let legend = L.control({
    position: "bottomright"
  });
  
  legend.onAdd = function(map) {
  
      let div = L.DomUtil
                 .create("div","legend");
      let levels = [0, 1, 2, 3, 4, 5];
      
      let colors = [
        "#98EE00",
        "#D4EE00",
        "#EECC00",
        "#EE9C00",
        "#EA822C",
        "#EA2C2C"
      ];
  
      for (var i = 0; i < levels.length; i++) {
        div.innerHTML += "<i style='background: " + colors[i] + "'></i> " +
          levels[i] + (levels[i + 1] ? "&ndash;" + levels[i + 1] + "<br>" : "+");
      }
      return div;
  };
  
  legend.addTo(myMap);
}