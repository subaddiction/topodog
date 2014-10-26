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
	pathMode: 'new', //new, addPoint, edit
	selectedObject: 0,
	selectedTessel: 0,
	selectedItem: 0,
	selectedAction: 0,
	theNewAction: false,
	orientBegin: false,
	
	timestamp: function(){
		var now = new Date().getTime();
		return now;
	},
	
	//containers
	sceneId: 'scenario',
	tilesId: 'grid',
	objectsId: '',
	actionsId: '',
	tesselClass: 'mapTile',
	
	
	
	tiles: Array(), //lista textures
	objects: Array(), //lista oggetti
	actions: Array(), // lista azioni
	
	tessels: {}, // texture disegnata
	
	beings: {}, // esseri umani e cani
	
	activeBeing: false,
	
	
	loadAssets: function(){
		//Load tiles and objects from json files
	},
	
	loadBeings: function(){
		$('#beings').html('');
	
		var beings = loql.select('beings');
		for(i=0;i<beings.length;i++){
		
			
			var currentBeing = loql.select('beings', beings[i]);
			//console.log(currentBeing);
			
			var tag = '<a class="being" href="javascript:;" data-id="'+currentBeing.id+'" data-color="'+currentBeing.color+'" style="border:2px solid '+currentBeing.color+'">'+currentBeing.name+'</a>';
			$('#beings').append(tag);
		}
		
		$('#beings a').unbind('click');
		$('#beings a').click(function(){
			$('#actions a').css('border', '2px solid '+$(this).attr('data-color'));
			topoDog.activeBeing = loql.select('beings', $(this).attr('data-id'));
		});
		
		
	},
	
	loadActions: function(){
		$('#actions').html('');
		
		var actions = loql.select('actions');
		for(i=0;i<actions.length;i++){
		
			
			var currentAction = loql.select('actions', actions[i]);
			
			var tag = '<a class="actionSelector" href="javascript:;" onclick="topoDog.selectedAction=\''+currentAction.id+'\';topoDog.mode=\'insertActions\';topoDog.modeSwitch()" data-id="'+currentAction.id+'">'+currentAction.name+'</a>\n';
			$('#actions').append(tag);
		}
	},
	
	init: function(){
		var row = 0;
		var col = 0;
		var subGrid = 10;
//		for(col=0;col<=this.h;col++){
//			for(row=0;row<=this.w;row++){
//				$('#'+this.tilesId).append('<div id="tile-'+row+'-'+col+'" class="mapTile" tessel="false" tilex="'+row+'" tiley="'+col+'"></div>');
//				this.tessels[row+'-'+col] = 'false';
//			}
//			$('#'+this.tilesId).append('<div class="clear" tilex="'+row+'" tilex="'+col+'"></div>\n');
//		}
		
		/***
		$('#'+this.tilesId).append('<div id="gridTable" cellspacing="0" cellpadding="0"></div>\n');
		for(row=0;row<=this.h;row++){
			$('#gridTable').append('<div id="R'+row+'" class="clear"></div>\n');
			for(col=0;col<=this.w;col++){
				$('#R'+row).append('<div id="tile-'+col+'-'+row+'" class="mapTile" tessel="false" tilex="'+col+'" tiley="'+row+'"></div>\n');
				this.tessels[row+'-'+col] = 'false';
			}
		}
		***/
		
		for(row=0;row<=this.h;row++){
			
			var moduloQuadroY = (row % subGrid);
			var rowQuadro = Math.floor(row/subGrid);
			//$('#gridTable').append('<div id="R'+row+'" class="clear"></div>\n');			
			if(moduloQuadroY == 0){	
				$('#'+this.tilesId).append('<div id="R'+row+'" class="clear"></div>\n');		
			}
			for(col=0;col<=this.w;col++){
				
				var moduloQuadroX = (col % subGrid);
				var colQuadro = Math.floor(col/subGrid);
				
				if( moduloQuadroX == 0 && moduloQuadroY == 0 ){
					$('#R'+row).append('<div class="quadro" id="Q-'+rowQuadro+'-'+colQuadro+'"></div>\n');
				}
				//$('#'+this.tilesId).append('<div id="tile-'+row+'-'+col+'" class="mapTile" tessel="false" tilex="'+row+'" tiley="'+col+'"></div>');
				$('#Q-'+rowQuadro+'-'+colQuadro).append('<div id="tile-'+col+'-'+row+'" class="mapTile" tessel="false" tilex="'+col+'" tiley="'+row+'"></div>\n');
				this.tessels[row+'-'+col] = 'false';
				
			}
		}
		
		$('.quadro').css({width:(this.tileSize*subGrid)+'px',height:(this.tileSize*subGrid)+'px'});

		$('.mapTile').css({width:this.tileSize+'px',height:this.tileSize+'px'});
		
		$('#scenario').on({
			'touchmove': function(e){
				e.preventDefault();
			}
		});
		
		// Load all tiles, objects, beings actions
		this.loadBeings();
		this.loadActions();
	},
	
	modeSwitch: function(mode){
		if(mode){
			topoDog.mode = mode;
		}
		
//		$('.mapTile').unbind('click');
//		$('.mapTile').unbind('mousedown');
//		$('.mapTile').unbind('mousemove');
//		$('.mapTile').unbind('mouseup');
//		$('#grid').unbind('touchstart');
//		$('#grid').unbind('touchmove');
//		$('#grid').unbind('touchend');
		$('.mapTile').off();
		$('#grid').off();
		$('.action').off();

		
		loql.set('savedtexture', '0', this.tessels);
		
		$(function(){
			
			switch(topoDog.mode){
				case 'erase':
					$('#grid').on({
					
						'mousemove touchmove': function(e){
							e.preventDefault();
							
							if(e.originalEvent.touches){
								var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
							
								var X = Math.floor((touch.pageX - ($(this).offset().left)) / topoDog.tileSize);
								var Y = Math.floor((touch.pageY - ($(this).offset().top)) / topoDog.tileSize);
							} else {
								var button = (typeof(e.buttons) != "undefined") ? e.buttons : e.which;
								if(button==1){
									var touch = e.originalEvent;
									var X = Math.floor((touch.clientX - ($(this).offset().left)) / topoDog.tileSize);
									var Y = Math.floor((touch.clientY - ($(this).offset().top)) / topoDog.tileSize);
								}
							}
						
						
							tesselate('erase',X,Y);
						}
					});
				break;
				
				case 'tessel':
					
					$('#actionsControls').hide(0);
					$('#paintControls').show(0);
					$('#itemsControls').hide(0);
					$('#tesselControls').show(0);
					
					
					
//					$('.mapTile').mousemove(
//					});
					$('body').on({
						'touchmove': function(e){ e.preventDefault(); }
					});
					
					/*
					$('.mapTile').on({
						
						
						'mousemove': function(e){
						
							var button = (typeof(e.buttons) != "undefined") ? e.buttons : e.which;
								if(button==1){
									var X = $(this).attr('tilex');
									var Y = ($(this).attr('tiley'));
									var theTessel = loql.select('tessels', topoDog.selectedTessel.toString());
									tesselate(theTessel.name,X,Y);
								}
							}
					});
					*/
					
					
					$('#grid').on({
					
						'mousemove touchmove': function(e){
							
							e.preventDefault();
							
							if(e.originalEvent.touches){
								var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
								
								var X = Math.floor((touch.pageX - ($(this).offset().left)) / topoDog.tileSize);
								var Y = Math.floor((touch.pageY - ($(this).offset().top)) / topoDog.tileSize);
							} else {
								var button = (typeof(e.buttons) != "undefined") ? e.buttons : e.which;
								if(button==1){
									var touch = e.originalEvent;
									var X = Math.floor((touch.clientX - ($(this).offset().left)) / topoDog.tileSize);
									var Y = Math.floor((touch.clientY - ($(this).offset().top)) / topoDog.tileSize);
								}
							}
							
							var theTessel = loql.select('tessels', topoDog.selectedTessel.toString());
							tesselate(theTessel.name,X,Y);
							//console.log(X+' '+Y);
							
							
						}
					});
					
					
					
				break;
				
				case 'insertItems':
					
					$('#actionsControls').hide(0);
					$('#paintControls').show(0);
					$('#tesselControls').hide(0);
					$('#itemsControls').show(0);
					
					
					$('.mapTile').click(function(e){
						var button = (typeof(e.buttons) != "undefined") ? e.buttons : e.which;
						if(button==1){
							var X = $(this).attr('tilex');
							var Y = ($(this).attr('tiley'));
							var theObject = loql.select('objects', topoDog.selectedObject.toString());
							newItem(topoDog.selectedObject,X,Y);
						}
					});
					
				break;
				
				case 'insertActions':
					
					$('#paintControls').hide(0);
					$('#actionsControls').show(0);
					
					
					var X = 0;
					var Y = 0;
					var startX = 0;
					var startY = 0;
					var endX = 0;
					var endY = 0;
					var rotation = 0;
					topoDog.theNewAction = false;
					
					$('#grid').on({
					
						'mousedown touchstart': function(e){
					
							e.preventDefault();
							if(e.originalEvent.touches){
								var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
								X = Math.floor((touch.pageX - ($(this).offset().left)) / topoDog.tileSize);
								Y = Math.floor((touch.pageY - ($(this).offset().top)) / topoDog.tileSize);
								
								startX = touch.pageX;
								startY = touch.pageY;
							} else {
								var touch = e.originalEvent;
								X = Math.floor((touch.clientX - ($(this).offset().left)) / topoDog.tileSize);
								Y = Math.floor((touch.clientY - ($(this).offset().top)) / topoDog.tileSize);
								
								startX = touch.clientX;
								startY = touch.clientY;
							}
							
							//var button = (typeof(e.buttons) != "undefined") ? e.buttons : e.which;
							//if(button==1){

							if(topoDog.theNewAction == false){
								
								//
								//endX = ($(this).attr('tilex'));
								//endY = ($(this).attr('tiley'));
								var theAction = loql.select('actions', topoDog.selectedAction.toString());
								topoDog.theNewAction = newAction(topoDog.selectedAction,X,Y,rotation);
								topoDog.theNewAction = topoDog.theNewAction.toString();
								//topoDog.orientBegin = $(this).attr('id');
								//console.log(theNewAction);
								//setTimeout('topoDog.theNewAction = false', 100)
							}
							
							//}
						},
					
					
					
						'mousemove touchmove' : function(e){
							
								e.preventDefault();
								//alert(JSON.stringify(e));
								//console.log(e.target);
								if(e.originalEvent.touches){
									var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
									endX = touch.pageX;
									endY = touch.pageY;
								} else {
									var touch = e.originalEvent;
									endX = touch.pageX;
									endY = touch.pageY;
								}
							
								if(topoDog.theNewAction != false){
								
									var ipotenusa;
									var radRot;
									var rotation;
						
									
									var dX = endX-startX;
									var dY = endY-startY;
								
								
									ipotenusa = Math.sqrt((dY*dY)+(dX*dX));
									radRot = (dX * Math.sin(90)) / ipotenusa;

									rotation = Math.asin(radRot);
									rotation = rotation * (180/Math.PI);
									
								
									if((dX > 0) && (dY > 0)){
										rotation = 180 - rotation;
									}
									
									if((dX > 0) && (dY < 0)){
										//rotation = rotation;
									}
								
									if((dX < 0) && (dY < 0)){
										//rotation = rotation;
									}
									
								
									if((dX < 0) && (dY > 0)){
										rotation = 180 - rotation;
									} 
									
									
									var tolerance = 10;
									if(dY == 0 || (dY < tolerance && dY > -tolerance)){
										if(dX >= 0){
											rotation = 90;
										} else if(dX <= 0) {
											rotation = -90
										} else {
											rotation = 0;
										}
									}
								
									if(dX == 0 || (dX < tolerance && dX > -tolerance)){
										if(dY >= 0){
											rotation = 180;
										} else if(dY <= 0){
											rotation = 0;
										} else {
											rotation = 0;
										}
									}
									
								
									$('#action-'+topoDog.theNewAction).css('transform', 'rotate('+rotation+'deg)');
							
									//rotation = Math.asin(Math.sqrt(Math.abs(dY*dY)+Math.abs(dX*dX))/dX);
									//rotation = dY/dX;
									//console.log(rotation);
									//alert(rotation);
									//alert(topoDog.theNewAction);
									
									//$(this).css('transform', 'rotate('+rotation+'deg)');
									//alert($(this).attr('id'));
								}
							
						
						},
						
					
						'mouseup touchend' : function(e){
							
								topoDog.theNewAction = false;

						},
					
					});
					
					
				break;
				
				case 'editActions':
					$('.action').on({
						'taphold': function(){
							alert('muovi,ruota,elimina');
						}
					});
				break;
				
				/***
				case 'insertPath':
				
					switch(topoDog.pathMode){
						case 'new':
							console.log('create path, then add points');
							topoDog.pathMode = 'addpoint';
						break;
						
						case 'addpoint':
							console.log('add point to selected path');
						break;
						
						case 'delete':
							console.log('delete selected path');
							topoDog.pathMode = 'new';
						break;
					
					}
					$('.mapTile').click(function(e){
						var button = (typeof(e.buttons) != "undefined") ? e.buttons : e.which;
						if(button==1){
							var X = $(this).attr('tilex');
							var Y = ($(this).attr('tiley'));
							
							
							//var svg = '<svg class="pattern" version = \"1.1\">';
							var svg = '<path id = "'+'testPath'+'"';
							svg += 'd="';
							svg += 'M '+Y*topoDog.tileSize+' '+X*topoDog.tileSize; 
							svg += ' L '+(Y*topoDog.tileSize)+' '+(X*topoDog.tileSize);
							svg += ' L '+(Y*topoDog.tileSize)+' '+(X*topoDog.tileSize +topoDog.tileSize);
							svg += '"';
							svg += ' fill="green" stroke="black" stroke-width="4"/>';
							//svg +='</svg>';
							
							$('#patterns').prepend(svg);
						}
					});
				break;
				***/
			}
			
		});
	
	},
	
	newDogForm: function(){
		
		$('#newDog_color').val('');
		$('#newDog_name').val('');
		$('#newDog_type').val('');
		$('#newDog_image').val('');
		$('#newDog').show(0);
	},
	
	insertBeing:function(){
	
		var color = $('#newDog_color').val();
		var name = $('#newDog_name').val();
		var type = $('#newDog_type').val();
		var image= $('#newDog_image').val();
		if(!name){
			alert('Please insert a name!');
			return false;
		}
		if(!color){
			alert('Please select a color!');
			return false;
		}
		newBeingElement(color, name, type, image);
		$('#newDog').hide(0);
	},
	
	save:function(){
		// Save tiles, objects, beings,actions to files
	},
	
	tdExport: function(){
		var content = JSON.stringify(localStorage);

//		var content = JSON.stringify(localStorage,function(k, v) {
//		    //console.log(typeof(k));
//		    //console.log(typeof(v));
//		    return (typeof(v) === 'object') ? JSON.stringify(v) : v;
//		});
		
		uriContent = "data:application/octet-stream," + encodeURIComponent(content);
		
		var now = new Date();
		$('#export').attr('download', 'scenario-'+now.getFullYear()+'-'+now.getMonth()+'-'+now.getDate()+'_'+now.getHours()+'-'+now.getMinutes()+'.json');
		$('#export').attr('href', uriContent);
		$('#export').click();
	
	},
	
	tdImport: function(file){
		var content = JSON.parse(file);
		for(var k in content){
			localStorage.setItem(k, content[k]);
		}
		
		//Setup beings
		
		//Draw textures
		
		//Draw objects
		
		//Draw actions
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
		topoDog.tessels[x+'-'+y] = name;
		//$('#tile-'+x+'-'+y).css('background','#0000ff');
		$('#tile-'+x+'-'+y).attr('tessel', name);
		
	} else {
		topoDog.tessels[x+'-'+y] = "false";
		//$('#tile-'+x+'-'+y).css('background','transparent');
		//console.log('#tile-'+x+'-'+y);
		$('#tile-'+x+'-'+y).attr('tessel', 'false');
	}
}

//function eraseTessel(x,y){

//}

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
	var Isize = theItem.size*topoDog.tileSize;
	var Imargin = (Isize/2)-(topoDog.tileSize/2);
	// inserisci oggetto nella DOM 
	$('#tile-'+x+'-'+y).append('<div class="object '+theItem.name+'" style="width:'+Isize+'px;height:'+Isize+'px;margin-top:-'+Imargin+'px;margin-left:-'+Imargin+'px;"></div>');
}

function moveItem(objectID,x,y){


}

function deleteItem(objectID,x,y){

}



function newAction(actionID,x,y,rotation){
	
	var values = {
		'aid':actionID,
		'bid':topoDog.activeBeing.id,
		'x':x,
		'y':y,
		'r':rotation,
		't':topoDog.timestamp()
	}
	var theID = loql.insert('action', values);

	var theAction = loql.select('actions', actionID);
	var Asize = theAction.size*topoDog.tileSize;
	var Amargin = (Asize/2)-(topoDog.tileSize/2);
	// inserisci oggetto nella DOM 
	$('#tile-'+x+'-'+y).append('<div id="action-'+theID+'" class="action" data-action="'+theAction.name+'" style="background:'+topoDog.activeBeing.color+';width:'+Asize+'px;height:'+Asize+'px;margin-top:-'+Amargin+'px;margin-left:-'+Amargin+'px;transform:rotate('+rotation+'deg)">'+theAction.name+'</div>');
	
	return theID;
}

function moveAction(objectID,x,y){


}

function deleteAction(objectID,x,y){

}


beingElement = {
	id: '',
	color: '',
	name: '',
	type: '', //person | dog
	image: '',
}

function newBeingElement(color, name, type, image){
	// insert new being in topoDog.beings
	
	// insert new being_id in localstorage
	newBeing = {
		'color':color,
		'name':name,
		'type':type,
		'image':image,
	}
	var newBeingID = loql.insert('beings', newBeing);
	topoDog.loadBeings();
	return newBeingID;
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

function gridPan(X,Y){
	$('#grid').css('margin-top', (parseInt($('#grid').css('margin-top')) + Y)+'px');
	$('#grid').css('margin-left', (parseInt($('#grid').css('margin-left')) + X)+'px');
}

function zoomField(value){
	$('.mapTile').css({'width':$('.mapTile').width()*value, 'height':$('.mapTile').height()*value});
	
	$('.object').each(function(){
		$(this).css({
		'width':$(this).width()*value,
		'height':$(this).height()*value,
		'margin-top':parseInt($(this).css('margin-top'))*value +'px',
		'margin-left':parseInt($(this).css('margin-left'))*value +'px'
		});
	});
	
	$('.action').each(function(){
		$(this).css({
		'width':$(this).width()*value,
		'height':$(this).height()*value,
		'margin-top':parseInt($(this).css('margin-top'))*value +'px',
		'margin-left':parseInt($(this).css('margin-left'))*value +'px'
		});
	});
		
	topoDog.tileSize = topoDog.tileSize*value;
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
	
	//ALTRA SOLUZIONE: fare tiles di topoDog.tileSizepx con zoom

}

*/

function dirAction(){
	
	
	
}


function test(){
	
	localStorage.clear();
	
	jQuery.event.swipe.min = 2;
	jQuery.event.swipe.max = 6;
	jQuery.event.swipe.delay = 1000;
	
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
	
	
	
	var ciotola = {
		'type':'object',
		'name':'ciotola',
		'size': 3,
		'shape':'img/ciotola.png',
	}
	loql.insert('objects', ciotola);
	
	
	var altro = {
		'type':'object',
		'name':'altro',
		'size': 6,
		'shape':'img/altro.png',
	}
	loql.insert('objects', altro);
	
	/*
	var fido = {
		'color':'#ff0000',
		'name':'fido',
		'type':'dog',
		'image':,
	}
	*/
	
	var azione = {
		'name':'annusa',
		'size':'2',
	}
	loql.insert('actions', azione);
	
	var azione1 = {
		'name':'piscia',
		'size':'3',
	}
	loql.insert('actions', azione1);
	var azione2 = {
		'name':'scava',
		'size':'4',
	}
	loql.insert('actions', azione2);
	
	newBeingElement('#ff0000', 'fido', 'dog', '');
	newBeingElement('#00ff00', 'ettore', 'dog', '');
	newBeingElement('#0000ff', 'gunther', 'dog', '');
	
	
	
	topoDog.w = ($(document).width()/topoDog.tileSize) -4;
	topoDog.h = (($(document).height() - $('#actionsControls').height() - $('#modeControls').height()) / topoDog.tileSize) -3;
	
	
	var userWidth = prompt('Insert field width');
	var userHeight = prompt('Insert field height');
	topoDog.w = userWidth;
	topoDog.h = userHeight;
	
	//topoDog.w = 40;
	//topoDog.h = 20;
	
	//document.body.addEventListener('touchstart', function(e){ e.preventDefault(); });
	
	topoDog.init();
	
	
	
	/*** Init ui ***/
	$('.colorSelect').each(
		function(){
			$(this).css('background', $(this).attr('data-color'));
		}
	);
	$('.colorSelect').on({
		'click': function(){
			$('.colorSelect').css('outline', '0');
			$('#newDog_color').val($(this).attr('data-color'));
			$(this).css('outline', '2px solid #000000');
		}
	});
	
	
	
	// Creates canvas 240 × 240 at 0 0
//var paper = Raphael(0, 0, 250, 250);

//var path = paper.path();
//path.addPart(['M', 100, 100]); //moveto 100, 100
//path.addPart(['L', 100, 150]); //lineto 150, 150
//path.addPart(['L', 150, 150]); //lineto 200, 150
//path.addPart(['Z']);           //closepath


//var path2 = paper.path();
//path2.addPart(['M', 200, 200]); //moveto 100, 100
//path2.addPart(['L', 200, 240]); //lineto 150, 150
//path2.addPart(['L', 240, 240]); //lineto 200, 150
//path2.addPart(['Z']);           //closepath
//	


}


$(document).ready(function(){
	test();
});














