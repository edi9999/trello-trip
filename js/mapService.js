metreTotals=0;
secondesTotals=0;

!function()
{
	console.log("trello mapservice")
	var TrelloMapService={};

	TrelloMapService.addMap=function(id,start,end,descId,callback){

		var directionsDisplay;
		var directionsService = new google.maps.DirectionsService();
		var map;

  	  	  directionsDisplay = new google.maps.DirectionsRenderer();
  	  	  var helsinki = new google.maps.LatLng(61.0033, 26.0000523);
  	  	  var mapOptions = {
    		zoom:7,
    		center: helsinki
  	  	  }
  	  	  map = new google.maps.Map(document.getElementById(id), mapOptions);
  	  	  directionsDisplay.setMap(map);

  	  	  var request = {
      	  	  origin:start,
      	  	  destination:end,
      	  	  travelMode: google.maps.TravelMode.DRIVING
  	  	  };
  	  	  directionsService.route(request, function(response, status) {
			  var desc=document.getElementById(descId);
		  		var routeInfo=response.routes[0].legs[0];
		  	  desc.innerHTML=routeInfo.distance.text+"..."+routeInfo.duration.text;
				metreTotals+=routeInfo.distance.value;
				secondesTotals+=routeInfo.duration.value;
    		if (status == google.maps.DirectionsStatus.OK) {
      	  	  directionsDisplay.setDirections(response);
			  callback()
    		}
  	  	  });
	}
	this.TrelloMapService=TrelloMapService;
}()