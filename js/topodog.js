// topoDog
// Requires:
//	loql.js

topoDog = { // Oggetto base con parametri fondamentali

	id: '',
	w: 10,
	h: 10,
	tileSize: 12,
	tileZoom: 12, // altri valori: 4,8
	//date: date(),
	
	mode: 'tessel', //tessel, erase, insert, editItems, editActions
	selectedObject: 0,
	selectedTessel: 0,
	selectedItem: 0,
	selectedAction: 0,
	
	timestamp: function(){
		var now = new Date().getTime();
		return now;
	},
	
	//containers
	sceneId: 'scenario',
	tilesId: 'grid',
	objectsId: '',
	actionsId: '',
	
	
	
	tiles: Array(), //lista tassellature
	objects: Array(), //lista oggetti
	
	tessels: Array(), // Tassellatura disegnata
	setup: Array(), // Scenario impostato
	
	beings: Array(),
	actions: Array(),
	
	
	
	loadAssets: function(){
		//Load tiles and objects from json files
	},
	
	init: function(){
		var row = 0;
		var col = 0;
		for(col=0;col<=this.h;col++){
			for(row=0;row<=this.w;row++){
				$('#'+this.tilesId).append('<div id="tile-'+row+'-'+col+'" class="mapTile" tessel="" tilex="'+row+'" tiley="'+col+'"></div>');
				//this.tessels[row+'-'+col] = '';
			}
			$('#'+this.tilesId).append('<div class="clear" tilex="'+row+'" tilex="'+col+'"></div>');
		}
		
		$('.mapTile').css({width:this.tileSize+'px',height:this.tileSize+'px'});
		
		
		
		// Load all tiles, objects, beings actions
	},
	
	modeSwitch: function(){
		
		$('.mapTile').unbind('click');
		$('.mapTile').unbind('mousemove');
		
		$(function(){	
			
			switch(topoDog.mode){
				case 'erase':
					$('.mapTile').mousemove(function(e){
						if(e.buttons==1){
							var X = $(this).attr('tilex');
							var Y = ($(this).attr('tiley'));
							tesselate('erase',X,Y);
						}
					});
				break;
				
				case 'tessel':
					$('.mapTile').mousemove(function(e){
							var X = $(this).attr('tilex');
							var Y = ($(this).attr('tiley'));
						if(e.buttons==1){
							var theTessel = loql.select('tessels', topoDog.selectedTessel.toString());
							tesselate(theTessel.name,X,Y);
						}
					});
				break;
				
				case 'insertItems':
					$('.mapTile').click(function(e){
						if(e.buttons==1){
							var X = $(this).attr('tilex');
							var Y = ($(this).attr('tiley'));
							var theObject = loql.select('objects', topoDog.selectedObject.toString());
							newItem(topoDog.selectedObject,X,Y);
						}
					});
				break;
				
				case 'insertActions':
					$('.mapTile').click(function(e){
						if(e.buttons==1){
							var X = $(this).attr('tilex');
							var Y = ($(this).attr('tiley'));
							var theAction = loql.select('actions', topoDog.selectedAction.toString());
							newAction(topoDog.selectedAction,X,Y);
						}
					});
				break;
			}
			
			
		});
	
	},
	
	save:function(){
		// Save tiles, objects, beings,actions to files
	},
	
	tdExport: function(){
		var content = JSON.stringify(localStorage);
		uriContent = "data:application/octet-stream," + encodeURIComponent(content);
		newWindow=window.open(uriContent);
	},
	
	tdImport: function(file){
		var content = JSON.parse(file);
		for(var k in content){
			localStorage.setItem(k, content[k]);
		}
	},
	
	clear: function(){
		//fare un export forzato
		//Eliminare tutti i beings e tutte le actions
	}
	
}

tileElement = { // elementi disegnabili a tasselli
	name:'',
	image:'',
	size:'',
}

function newTileElement(name, image, size){

}

function tesselate(name,x,y){
	//topoDog.tessels.push('{"name":"'+name+'","x":"'+x+'","y":"'+y+'"}');
	
	
	if(name != 'erase'){
		topoDog.tessels[x+'-'+y] = topoDog.selectedTessel;
		//$('#tile-'+x+'-'+y).css('background','#0000ff');
		$('#tile-'+x+'-'+y).attr('tessel', name);
		
	} else {
		topoDog.tessels[x+'-'+y] = "";
		//$('#tile-'+x+'-'+y).css('background','transparent');
		//console.log('#tile-'+x+'-'+y);
		$('#tile-'+x+'-'+y).attr('tessel', '');
	}
}

function eraseTessel(x,y){

}

objElement = { //elementi inseribili su livello oggetti
	type:'',
	size:'', // in tasselli^2
	name:'',
	shape:'',
	direction:'',
}

function newObjElement(type,size,name,shape,direction){

}

function newItem(objectID,x,y){
	
	var values = {
		'oid':objectID,
		'x':x,
		'y':y
	}
	loql.insert('object', values);
	
	var theItem = loql.select('objects', objectID);
	// inserisci oggetto nella DOM 
	$('#tile-'+x+'-'+y).append('<div class="object '+theItem.name+'"></div>');
}

function moveItem(objectID,x,y){


}

function deleteItem(objectID,x,y){

}



function newAction(actionID,x,y){
	
	var values = {
		'aid':actionID,
		'x':x,
		'y':y,
		't':topoDog.timestamp()
	}
	loql.insert('action', values);
	
	var theAction = loql.select('actions', actionID);
	// inserisci oggetto nella DOM 
	$('#tile-'+x+'-'+y).append('<div class="action '+theAction.name+'"></div>');
}

function moveAction(objectID,x,y){


}

function deleteAction(objectID,x,y){

}


beingElement = {
	id: '',
	color: '',
	name: '',
	type: '', //person or dog?
	image: '',
}

function newBeingElement(color, name, type, image){
	// insert new being in topoDog.beings
	// insert new being_id in localstorage
}

actionElement = {
	id: '',
	time: '',
	type: '',
	x: '',
	y: '',
	object: '',
	toType: '', //object or being
	toId: ''
}

function newActionElement(id,time,type,x,y,object,type){
	
}

function deleteActionElement(id){

}

/*
function fieldSetup(id,w,h){
	
	var row = 0;
	var col = 0;
	for(col=0;col<=h;col++){
		for(row=0;row<=w;row++){
			$('#'+id).append('<div class="mapTile" tileX="'+row+'" tileY="'+col+'"></div>');
		}
	}
	
	// get width and height of scene background div element
	var fieldWidth = $('#'+id).width();
	var fieldHeight = $('#'+id).height();
	
	var tileWidth = (fieldWidth * w) / 100; // w:100=tileWidth:x
	var tileHeight = (fieldHeight * h) / 100; // h:100=tileHeight:x
	
	$('.mapTile').css({width:tileWidth+'%',height:tileHeight+'%'});
	
	// trovare modo per navigare o fare tiles quadrate
	// modo 1: calcolare l'altezza del set in base a quante ce ne entrano
	
	//ALTRA SOLUZIONE: fare tiles di 12px con zoom

}

*/


function test(){
	
	localStorage.clear();
	
	var acqua = {
		'name':'acqua',
	}
	loql.insert('tessels', acqua);
	
	var terra = {
		'name':'terra',
	}
	loql.insert('tessels', terra);
	
	var erba = {
		'name':'erba',
	}
	loql.insert('tessels', erba);
	
	//////////////////////////////
	
	var azione = {
		'name':'azione',
	}
	loql.insert('actions', azione);
	
	var ciotola = {
		'type':'object',
		'name':'ciotola',
		'size': 3,
		'shape':'img/ciotola.png',
		'direction':0
	}
	loql.insert('objects', ciotola);
	
	
	var altro = {
		'type':'object',
		'name':'altro',
		'size': 3,
		'shape':'img/altro.png',
		'direction':0,
	}
	loql.insert('objects', altro);
	
	topoDog.w = 20;
	topoDog.h = 20;
	topoDog.init();
}

$(document).ready(function(){
	test();
});


