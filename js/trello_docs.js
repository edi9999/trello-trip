var showPrices=true;
var conso_par_km;
var prix_essence;

$(document).ready(function(){
	var defaultOptions = {
        scope: {
            write: false
        },
        success: initDoc
    };
	if(typeof Trello==="undefined") {
		$("#view").html("<h1>Connection to Trello API is broken, Please <a href='javascript:window.reload();'>Reload</a></h1>");
	}

	Trello.authorize(_.extend({}, defaultOptions, {// Authentication
        interactive: false
    }));

    if (!Trello.authorized()) {
        return Trello.authorize(defaultOptions);
    }

	$(window).bind("hashchange",router);
});

var initDoc=function () {
	if (!Trello.authorized()) return Trello.authorize(defaultOptions);
	Trello.get('/members/me',{boards:"open",organizations:"all"}, function(me) {
		window.myself=me;
		router();
	},function(xhr){
		if (xhr.status == 401) {
			Trello.deauthorize();
			Trello.authorize(defaultOptions);
		} else {
			$("#view").html("<h1>Connection to Trello API is broken, Please <a href='javascript:reload();'>Reload</a></h1>");
		}
	});
};

var router=function(){
	var hash=location.hash.replace("#","");
	if (hash!=="")
	{
		getBoard(hash);
	}
	else {
		if(window.myself){
			listBoards();
		}else{
			initDoc();
		}
	}
};

var listBoards=function(){
	if(!myself.orgBoards) { // Not initiated yet
		var categories=_.groupBy(myself.boards,function(board){ // Categories Boards
			var id=board.idOrganization?board.idOrganization:"";
			return id;
		});
		var orgList=_.groupBy(myself.organizations,function(org){ // Map orgId-orgName
			return org.id;
		});

		myself.orgBoards=_.map(categories,function(value,key){ // Create Array of Organizations containing Array of Boards
			var list={};
			list.boards=value;
			if(key===""||key===null){
				list.name="Personal";
			}else if(!orgList.hasOwnProperty(key)){
				list.name="External Organization";
			}else{
				list.name=orgList[key][0].displayName
			}
			return list;
		});
	}

	$("#view").empty();
	var intro="<div class='list info-list'><h2>About Trello2HTML</h2><p>This is an web app to export Trello Boards to HTML, our team uses this to record our progress every month. We do not track or record you any way, and Trello access is read-only. You can host this on any static server. Google Chrome is tested and supported, your mileage may vary with other browsers(Firefox has a bug when downloading).</p><ul><a href='#4d5ea62fd76aa1136000000c'><li>Demo using Trello Development</li></a><a href='trello.zip'><li>Download zipped source</li></a><a href='https://trello.com/board/trello2html/4fb10d0e312c2b226f1eb4a0'><li>Feature Requests and Bug Reports</li></a><a href='http://tianshuohu.diandian.com/post/2012-06-08/Trello-Export-as-html'><li>Blog Article (Chinese/English)</li></a></ul></div>";
	var template="<h1>{{fullName}} ({{username}})</h1><div id='boardlist'>"+intro+"{{#orgBoards}}<div class='list'><h2>{{name}}</h2><ul>{{#boards}}<a href='#{{id}}' ><li>{{name}}</li></a>{{/boards}}</ul></div>{{/orgBoards}}</div>";
	var str=Mustache.render(template,myself);
	$("#view").html(str);
	$("#boardlist").masonry({
		itemSelector:'.list'
	});
};

var mainCard=null;

var getBoard=function(board){
  $("#view").empty();
  $("#view").html("<h1>Loading ...</h1>");
  Trello.get("/boards/"+board,{cards:"open",lists:"open",checklists:"all",members:"all",card_attachments:true},function(board){
	$("#view").html("<h1>Loading ...OK!!</h1>");
	window.doc=board; //debug
	window.title=board.name;
	var prixTotal=0;
	_.each(board.cards,function(card,i){ //iterate on cards
			card.show=true;

		if (card.idAttachmentCover!=null)
			_.each(card.attachments,function(attachment){
				attachment.hotel=attachment.name.substr(0,5)=="hotel"
				attachment.cover= attachment.id===card.idAttachmentCover;
			});

		if (card.name=="Configuration")
		{
			consommationRegex=new RegExp("\\*\\*ConsommationEssence\\*\\*: ([0-9]+) Litres/100km");
			prixEssenceRegex =new RegExp("\\*\\*Essence\\*\\*: ([0-9\.]+) €/Litre");
			coutsDiversRegex =new RegExp("\\*\\*CoutsDivers\\*\\*: ([0-9\.]+) €");
			card.show=false;
			conso_par_km=parseFloat(consommationRegex.exec(card.desc)[1])/100;
			prix_essence=parseFloat(prixEssenceRegex.exec(card.desc)[1]);
			coutsDivers=parseFloat(coutsDiversRegex.exec(card.desc)[1]);
			return;
		}

        mainHomeRegex=new RegExp("\\*\\*Home\\*\\*");
		if(mainHomeRegex.test(card.desc)) {
            mainCard=card;
        }

		adressRegex=new RegExp("\\*\\*Plan\\*\\*: (.*)");
		if(adressRegex.test(card.desc))
		{
			var result=adressRegex.exec(card.desc);
			card.adress=result[1];
		}

		petitDejRegex=new RegExp("\\*\\*PetitDej\\*\\*");
		if(petitDejRegex.test(card.desc))
		{
			card.desc=card.desc.replace(petitDejRegex,"![Image](http://clp.beequick.fr/img/icons/366.png)")
		}

		parkingRegex=new RegExp("\\*\\*Parking\\*\\*");
		if(parkingRegex.test(card.desc))
		{
			card.desc=card.desc.replace(parkingRegex,"![Image](http://clp.beequick.fr/img/icons/494.png)")
		}

		commentsRegex=/(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm
		card.desc=card.desc.replace(commentsRegex,"");

		var urlRegex = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/
		card.desc=card.desc.replace(urlRegex,function($0){
			return "["+$0+"]"+"("+$0+")";
		})


		card.map=true;
		noMapRegex=new RegExp("\\*\\*NoMap\\*\\*");
		if(noMapRegex.test(card.desc))
		{
			card.map=false;
			card.desc=card.desc.replace(noMapRegex,"")
		}

		prixRegex=new RegExp("\\*\\*Prix\\*\\*: ([0-9]+) €");
		if(prixRegex.test(card.desc))
		{
			var result=prixRegex.exec(card.desc);
			if (showPrices==false)
				card.desc=card.desc.replace(prixRegex,"")
			prixTotal+=parseInt(result[1])
		}
		else
		{
			alert("Erreur prix");
		}
		card.num=i;
	});//iterate on cards



	// Second Init Cards
	var listofcards=_.groupBy(board.cards, function(card){
		return card.idList;
	});
	_.each(board.lists,function(list){
		list.cards=listofcards[list.id];
		list.size=list.cards?list.cards.length:0;
		list.show=(list.size>0);
	});

	// Date function
	board.formatDate=function(){
		return function(text){
			var date;
			switch(text){
			case "":
				return "None";
			case "now":
				date=new Date();
				break;
			default:
				date=new Date(text);
			}
			return date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
		};
	};
	board.formatComments=function(){
		var converter = new Showdown.converter();
		return converter.makeHtml;
	};
	//
	// Start Rendering
	var htmltemplate;
	$.ajax({url:"template.html",async:false,success:function(r){
		htmltemplate=r;
	}})
	var csvtemplate="";//TODO

	var str=Mustache.render(htmltemplate,board);
	$("#view").html(str);

	var lastCard=null;
	var numMaps=0;
	var firstCard=0;
	waypoints=[];
    addCardCb=function () {
				numMaps--;
				if (numMaps==0)
					{
						coutEssence=parseInt(metreTotals/1000*conso_par_km*prix_essence);

						prixTotal+=coutEssence;
						prixTotal+=coutsDivers;
						if (showPrices)
						{
							$("#essenceprice").text("Cout essence:"+coutEssence+" € ="+(metreTotals/1000)+"km x "+conso_par_km+"L/km * "+prix_essence+" € /L  ---  "+parseInt(secondesTotals/3600)+" heures de routes");
							$("#diversprice").text("Cout divers:"+coutsDivers +" €")
							$("#totalprice").text("Prix total:"+prixTotal +" €")
						}
					}
			}

	_.each(board.cards,function(card){
	if (lastCard!=null && card.map)
		{
			if (firstCard===0)
				firstCard=card;
			latestCard=card;
			numMaps++;
			waypoints.push({ location:card.adress, stopover:true});
            if (mainCard===null)
                TrelloMapService.addMap("map-"+card.num,lastCard.adress,card.adress,"map-desc-"+card.num,addCardCb);
            else{
                if (card.adress!=mainCard.adress)
                {
                    TrelloMapService.addMap("map-"+card.num,mainCard.adress,card.adress,"map-desc-"+card.num,addCardCb);
                }
            }
		}
		lastCard=card;
	});

	TrelloMapService.addMap("map-total",firstCard.adress,latestCard.adress,null,function(){console.log("done")},waypoints);

	});
};
