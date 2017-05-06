!function()
{
    var metreTotals=0;
    var secondesTotals=0;
    console.log("trello mapservice")
    var TrelloMapService={};

    TrelloMapService.addMap=function(id,start,end,descId,callback,waypoints){
        if (waypoints==null)
            waypoints=[];

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
            waypoints:waypoints,
            travelMode: google.maps.TravelMode.DRIVING
        };
        if (!start) {
            console.log({id,start,end});
            throw new Error("No startpoint");
        }
        if (!end) {
            throw new Error("No endpoint");
        }
        directionsService.route(request, function(response, status) {
            console.log(response)
            if(status=="NOT_FOUND") {
                console.log(request);
                throw new Error("Adress not found : '" + request.destination + "'");
            }
            var desc=document.getElementById(descId);
            var routeInfo=response.routes[0].legs[0];
            if (desc!=null && desc!=undefined)
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
