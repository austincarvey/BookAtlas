var response;
var mapData = [];
var locations = [];
var articleMentions = [];
var articleText;
// var request = "https://api.dandelion.eu/datatxt/nex/v1/?min_confidence=0.6&social=False&text=The+Mona+Lisa+is+a+16th+century+oil+painting+created+by+Leonardo.+It%27s+held+at+the+Louvre+in+Paris.&include=image%2Cabstract%2Ctypes%2Ccategories%2Clod&country=-1&types&$app_id=8f218eb1&$app_key=2f4459d8ae048b4ffc04aca40366eac0"
//var request = "https://api.dandelion.eu/datatxt/nex/v1/?min_confidence=0.6&social=False&url=http%3A%2F%2Fcontent.time.com%2Ftime%2Fspecials%2F2007%2Farticle%2F0%2C28804%2C1690753_1690757_1695382%2C00.html&country=-1&social=False&include=image%2Cabstract%2Ctypes%2Ccategories%2Clod&types&$app_id=8f218eb1&$app_key=2f4459d8ae048b4ffc04aca40366eac0"
// fix this function \/
function createRequestQuery(){
	//creates the request to send to dandelion
	request = "https://api.dandelion.eu/datatxt/nex/v1/?min_confidence=0.6&social=False&url=";
	request +=  document.getElementById('url').value;//text addition goes here (need to convert the text to stuff that the api can understand)
	request += "&include=image%2Cabstract%2Ctypes%2Ccategories%2Clod&country=-1&categories&$app_id=8f218eb1&tags&$app_key=2f4459d8ae048b4ffc04aca40366eac0";
}

//Removes all the linear duplicates from the location list
function cleanList(){
  var uniqueLocations = [];
  $.each(locations, function(i, el){
      if($.inArray(el, uniqueLocations) === -1) uniqueLocations.push(el);
   });
   locations = uniqueLocations;
  getGoogleMapsInfo();
}

function startProcess(){
  createRequestQuery();
	initialize()
  $.getJSON(request, function(json){
			alert('done');
			console.log(json);
      response = json;
      getLocationsFromQuery();
  });
}

function getLocationsFromQuery(){ //need to add text variable for later
	//console.log(response.annotations);
	articleText= response.text;
	for (var i = 0; i < response.annotations.length; i++) {
    //console.log(response.annotations[i]);
    var parsedData = JSON.parse(JSON.stringify(response.annotations[i]));
    //console.log(parsedData.types);
    for (var z = 0; z < parsedData.types.length; z++) {
      //alert(array[i]);
      //console.log("bye");
      if(parsedData.types[z] == "http://dbpedia.org/ontology/Place"){
      	articleMentions.push(findSentence(parsedData.start));
				if(parsedData.spot.slice(-2) != 'an' && parsedData.spot.slice(-3) != 'ans' && parsedData.spot != 'Europe'){
      		locations.push([parsedData.spot]);
				}
      }
    }
	}
	cleanList();
}

function getGoogleMapsInfo(){
	//gets the json for the map crap
	for (var i= 0;i<locations.length;i++){
		console.log(i);
  	$.getJSON("https://maps.googleapis.com/maps/api/geocode/json?address=" + locations[i][0] + "&key=AIzaSyCt-DafRlApAhWwM9SbK4DuGEQiJcxmuDc", function(json){
      //response = json;
      //console.log("Running" + i + "Time");
      tempData = JSON.parse(JSON.stringify(json.results));
      //console.log(tempData[0]);
      tempData = JSON.parse(JSON.stringify(tempData[0]));
      mapData.push([tempData.geometry['location'].lat,tempData.geometry['location'].lng]);
      //tempInfo.push(json);
      //console.log(mapData);
  	});
  }
}

function markMap(){
  for(var i = 0; i < mapData.length - 1; i++){
		var location = locations[i];
		//console.log(location);
    makeMarker(mapData[i][0],mapData[i][1],location,i); //lat , lng , name , info
  }
	makeLine();
}
var viewCount = 0;
var showContent = function(){
	var count = viewCount;
	$('#content').html('');
	var html = '<h2>' + locations[count][0] + '</h2>';
	for(var i = 0; i < articleMentions.length; i++){
		var text = articleMentions[i];
		if(text.indexOf(locations[count][0]) > -1){
			html += '<h3>' + text + '</h3>';
		}
	}
	$('#content').html(html);
	map.setZoom(14);
	map.panTo(markers[count].position);
	viewCount += 1;
}

var lineObjects = [];

function convert(arr){
		lineObjects.push({'lat':arr[0],'lng':arr[1]});
}

function makeLine(){
	mapData.map(convert);
	var line = new google.maps.Polyline({
	    path:lineObjects,
	    geodesic:true,
	    strokeColor:'#FF0000',
	    strokeOpacity:1.0,
	    strokeWeight:2
	});
	line.setMap(map)
}

function findSentence(index){
	console.log(index);
	var start;
	var end;
	var count = index;
	var str = "";
	while (start == null){
		str = articleText.charAt(count);
		if (str =='.'){
			start = count;
		}
		count += 1;
	}
	count = index
	str = '';
	while (end == null){
		str = articleText.charAt(count);
		if (str =='.'){
			end = count;
		}
		count -= 1;
	}
	return articleText.substring(start,end+1);
}
