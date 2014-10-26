// topoDog
// Requires:
//	loql.js

topoDog = { // Oggetto base con parametri fondamentali

	id: '',
	w: 100,
	h: 100,
	tileSize: 12,
	originalTileSize: 12, // altri valori: 4,8
	zoomFactor:1,
	paintSize: 1,
	
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
	
	//objectsId: '',
	//actionsId: '',
	//tesselClass: 'mapTile',
	//tiles: Array(), //lista textures
	//objects: Array(), //lista oggetti
	//actions: Array(), // lista azioni
	//tessels: {}, // texture disegnata
	//beings: {}, // esseri umani e cani
	
	activeBeing: '0',
	
	loadTessels: function(){
		$('#tessels').html('');
		
		var tessels = loql.select('tessels');
		for(i=0;i<tessels.length;i++){
		
			
			var currentTessel = loql.select('tessels', tessels[i]);
			//console.log(currentBeing);
			
			var tag = '<a id="tessel-'+currentTessel.id+'" class="tessel" href="javascript:;" data-id="'+currentTessel.id+'" data-color="'+currentTessel.color+'" style="background:'+currentTessel.color+';border:3px solid '+currentTessel.color+'">'+currentTessel.name+'</a>';
			$('#tessels').append(tag);
		}
		
		$('#tessels a').unbind('click');
		
		$('#tessels a').click(function(){
			$('#tessels a').css('border', '3px solid #000000');
			$(this).css('border', '3px solid #ffffff');
			topoDog.selectedTessel = $(this).attr('data-id');
			topoDog.modeSwitch('tessel');
		});
	},
	
	loadBeings: function(){
		$('#beings').html('');
	
		var beings = loql.select('beings');
		if(!beings){
			return;
		}
		
		for(i=0;i<beings.length;i++){
		
			
			var currentBeing = loql.select('beings', beings[i]);
			//console.log(currentBeing);
			
			var tag = '<a class="being" href="javascript:;" data-id="'+currentBeing.id+'" data-color="'+currentBeing.color+'" style="background:'+currentBeing.color+';border:3px solid '+currentBeing.color+'">'+currentBeing.name+'</a>';
			$('#beings').append(tag);
		}
		
		$('#beings a').unbind('click');
		$('#beings a').click(function(){
			$('#actions a').css('background', $(this).attr('data-color'));
			topoDog.activeBeing = loql.select('beings', $(this).attr('data-id'));
		});
		
		
	},
	
	loadActions: function(i, limit){
	
		var actions = loql.select('actions');
		
		if(!limit){
			$('#actions').html('');
			limit = actions.length;
		}
		
		var currentAction = loql.select('actions', actions[i]);
		var tag = '';
		var shapeData = false;
		if(i < limit){
			shapeData = $.get('./svg/'+currentAction.shape, function(){
		//alert(shapeData.responseText);
				tag += '<a id="actSelect-'+currentAction.id+'" class="actionSelector" href="javascript:;" onclick="topoDog.selectAction(\''+currentAction.id+'\');" data-id="'+currentAction.id+'">\n';
				tag += shapeData.responseText+'\n';
				//console.log(shapeData.responseText);
				tag += '<span>'+currentAction.name+'</span>\n';
				tag += '</a>\n';
			
				if(i < limit){
					$('#actions').append(tag);
					$('#actions svg path').css('fill', '#ffffff');
					i = i+1;
					topoDog.loadActions(i, limit);
				}
			
			});
			
		}
		
		
		
	},
	
	init: function(){
		var row = 0;
		var col = 0;

		
		$('#'+this.tilesId).width((this.w*this.tileSize)+'px');
		$('#'+this.tilesId).height((this.h*this.tileSize)+'px');
		
		//$('canvas').remove();
		//$('#grid').prepend('<canvas id="bgCanvas"></canvas>');
		
		$('#bgCanvas').attr('width', (this.w*this.tileSize));
		$('#bgCanvas').attr('height', (this.h*this.tileSize));
		
		$('#bgCanvas').css('margin-bottom', -(this.h*this.tileSize));

		
		$('body').on({
			'mousemove touchmove': function(e){
				e.preventDefault();
			}
		});
		
		$('a.mode').on({
			'click': function(e){
				$('a.mode').css({
					'background':'#000000',
					'color':'#cccccc'
				});
				$(this).css({
					'background':'#ffffff',
					'color':'#000000'
				});
			}
		});
		
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
		
		document.getElementById('filechooser').addEventListener('change', handleFileSelect, false);
		
		
		
		// Load all tiles, objects, beings actions
		this.loadTessels();
		this.loadBeings();
		this.loadActions(1,false);
	},
	
	modeSwitch: function(mode){
		if(mode){
			topoDog.mode = mode;
		}
		
		$('#scenario').off();
		$('#grid').off();
		$('.object').off();
		$('.action').off();
		
		if(mode != 'view3d'){
			$('#grid').css({
				'transform':'rotate3d(1, 0, 0, 0deg) rotate(0deg)',
			});
		}
		
		$('#tesselControls').hide(0);
		$('#itemsControls').hide(0);
		$('#actionsControls').hide(0);
		$('#editControls').hide(0);
		$('#dataControls').hide(0);
		$('#timeline').hide(0);
		
		$(function(){
			
			switch(topoDog.mode){
				
				case 'tessel':
					
					$('#tesselControls').show(0);
					
					
					var theTessel = loql.select('tessels', topoDog.selectedTessel.toString());
					var paintColor = theTessel.color;
					
					var gridCanvas = document.getElementById("bgCanvas");
    					var ctx = gridCanvas.getContext("2d");
					
					
					$('#grid').on({
					
						'mousemove touchmove': function(e){
							
							e.preventDefault();
							
							
							/*** NOGRID ***/
							
							var tesselSize = topoDog.originalTileSize * topoDog.paintSize;
							var tesselZoom = topoDog.tileSize * topoDog.paintSize;
							
							if(e.originalEvent.touches){
								var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
								
								var X = Math.floor((touch.pageX - ($(this).offset().left)) / tesselZoom);
								var Y = Math.floor((touch.pageY - ($(this).offset().top)) / tesselZoom);
								
								ctx.fillStyle = paintColor;
        							ctx.fillRect(X*tesselSize, Y*tesselSize, tesselSize, tesselSize);
								
							} else {
								var button = (typeof(e.buttons) != "undefined") ? e.buttons : e.which;
								if(button==1){
								
								var touch = e.originalEvent;
								var X = Math.floor((touch.clientX - ($(this).offset().left)) / tesselZoom);
								var Y = Math.floor((touch.clientY - ($(this).offset().top)) / tesselZoom);
								
								
								
								
								ctx.fillStyle = paintColor;
								ctx.fillRect(X*tesselSize, Y*tesselSize, tesselSize, tesselSize);
									
								}
							}
							
							/***
							if(e.originalEvent.touches){
								var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
								
								var X = Math.floor((touch.pageX - ($(this).offset().left)) / topoDog.tileSize);
								var Y = Math.floor((touch.pageY - ($(this).offset().top)) / topoDog.tileSize);
								
								ctx.fillStyle = paintColor;
        							ctx.fillRect(X*topoDog.originalTileSize, Y*topoDog.originalTileSize, topoDog.originalTileSize, topoDog.originalTileSize);
								
							} else {
								var button = (typeof(e.buttons) != "undefined") ? e.buttons : e.which;
								if(button==1){
									var touch = e.originalEvent;
									var X = Math.floor((touch.clientX - ($(this).offset().left)) / topoDog.tileSize);
									var Y = Math.floor((touch.clientY - ($(this).offset().top)) / topoDog.tileSize);
									
									
									
									
									ctx.fillStyle = paintColor;
									ctx.fillRect(X*topoDog.originalTileSize, Y*topoDog.originalTileSize, topoDog.originalTileSize, topoDog.originalTileSize);
									
									
								}
							}
							
							***/
							
							
							
							/*** /NOGRID ***/
							
							
						}
					});
					
					
					
				break;
				
				case 'insertItems':
					
					$('#itemsControls').show(0);
					
					
					
					/*** NOGRID ***/
					$('#grid').click(function(e){
						if(e.originalEvent.touches){
								var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
								
								var X = touch.pageX - ($(this).offset().left);
								var Y = touch.pageY - ($(this).offset().top);
								
								newItem(topoDog.selectedObject,X,Y);
								
							} else {
								var button = (typeof(e.buttons) != "undefined") ? e.buttons : e.which;
								if(button==1){
									var touch = e.originalEvent;
									var X = touch.clientX - ($(this).offset().left);
									var Y = touch.clientY - ($(this).offset().top);
									
									newItem(topoDog.selectedObject,X,Y);
								}
							}
						
						
					});
					/*** /NOGRID ***/
					
				break;
				
				case 'insertActions':
					
					
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
								X = touch.pageX - ($(this).offset().left);
								Y = touch.pageY - ($(this).offset().top);
								
								
								startX = touch.pageX;
								startY = touch.pageY;
							} else {
								var touch = e.originalEvent;
								X = touch.clientX - ($(this).offset().left);
								Y = touch.clientY - ($(this).offset().top);
								
								
								startX = touch.clientX;
								startY = touch.clientY;
							}
							

							if(topoDog.theNewAction == false){
								
								var theAction = loql.select('actions', topoDog.selectedAction.toString());
								topoDog.theNewAction = newAction(topoDog.selectedAction,topoDog.activeBeing.id,X,Y,rotation,false);
								
								
							}
						},
					
					
					
						'mousemove touchmove' : function(e){
							
								e.preventDefault();
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
									
									var dX = endX-startX;
									var dY = endY-startY;
								
								
									ipotenusa = Math.sqrt((dY*dY)+(dX*dX));
									radRot = (dX * Math.sin(90)) / ipotenusa;

									rotation = Math.asin(radRot);
									rotation = rotation * (180/Math.PI);
									
									rotation = Math.floor(rotation);
								
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
									
								
									$('#action-'+topoDog.theNewAction).children('svg').css('transform', 'scale('+topoDog.zoomFactor+') rotate('+rotation+'deg)');
									$('#action-'+topoDog.theNewAction).children('svg').attr('data-rot', rotation);
									//$('#action-'+topoDog.theNewAction).css('transform', 'rotate('+rotation+'deg)');
							
									
								}
							
						
						},
						
					
						'mouseup touchend' : function(e){
								var confirmAction = {
									'aid':topoDog.selectedAction,
									'bid':topoDog.activeBeing.id,
									'x':X,
									'y':Y,
									'r':rotation,
									't':topoDog.timestamp()
								}
								loql.set('action', topoDog.theNewAction, confirmAction);
								topoDog.theNewAction = false;
								

						},
					
					});
					
					
				break;
				
				case 'editActions':
					
					$('#editControls').show(0);
					
					$('.object').on({
						'taphold': function(){
							//alert('muovi,ruota,elimina');
							var objectID = $(this).attr('data-id');
							if(confirm('Vuoi eliminare questo oggetto? [id:'+objectID+']')){
								$(this).remove();
								loql.del('object', objectID);
							}
						}
					});
				
					$('.action').on({
						'taphold': function(){
							//alert('muovi,ruota,elimina');
							var actionID = $(this).attr('data-id');
							if(confirm('Vuoi eliminare questa azione? [id:'+actionID+']')){
								$(this).remove();
								loql.del('action', actionID);
							}
						}
					});
				break;
				
				case 'manageData':
					$('#dataControls').show(0);
				
				break;
				
				case 'view3d':
					
					$('#timeline').html('');
					$('#timeline').show(0);
				
					var rotZ = 0;
					var rotX = 0;
					
					$('#scenario').css('perspective', ((topoDog.h+topoDog.w)/2)*topoDog.tileSize);
				
					$('#scenario').on({
					
						'swipeleft': function(e){
							rotZ = rotZ-15;
							$('#grid').css({
								'transform':'rotate3d(1, 0, 0, '+rotX+'deg) rotate('+rotZ+'deg)',
							});
						},
						
						
						
						'swiperight': function(e){
							rotZ = rotZ+15;
							$('#grid').css({
								'transform':'rotate3d(1, 0, 0, '+rotX+'deg) rotate('+rotZ+'deg)',
							});
						},
						
						'swipeup': function(e){
							rotX = rotX+15;
							$('#grid').css({
								'transform':'rotate3d(1, 0, 0, '+rotX+'deg) rotate('+rotZ+'deg)',
							});
						},
						
						'swipedown': function(e){
							rotX = rotX-15;
							$('#grid').css({
								'transform':'rotate3d(1, 0, 0, '+rotX+'deg) rotate('+rotZ+'deg)',
							});
						}
					
					});
					
					
					// [RI]Costruisco la timeline
					var actions = loql.select('action');
					for(i=0;i<actions.length;i++){
						
						var action = loql.select('action', actions[i]);
						
						//var hours = date.getHours(); var minutes = date.getMinutes(); var seconds = date.getSeconds(); // will display time in 21:00:00 format var formattedTime = hours + ':' + minutes + ':' + seconds;
						
						var date = new Date(action.t);
						var humanDate = date.getFullYear()+'/'+date.getMonth()+'/'+date.getDate();
						var humanTime = date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
						var tag = '';
						
						tag += '<div class="time" data-id="'+actions[i]+'">';
						tag += '<div class="t-id">'+actions[i]+'</div>';
						tag += '<div class="t-detail">'+humanDate+'<br />['+humanTime+']</div>';
						tag += '</div>'
						$('#timeline').append(tag);
					
					}
					
					$('.time').css({
						'float':'left',
						'width':(100/actions.length)+'%',
					});
					
					$('.time').on({
						'click': function(){
							
							var lastID = parseInt($(this).attr('data-id'));
								
								for(i=0;i<actions.length;i++){
									var action = loql.select('action', actions[i]);
									if(lastID > actions[i]){
										$('#action-'+actions[i]).show(0);
									} else {
										$('#action-'+actions[i]).hide(0);
									}
								}
							
						},
						
						'dblclick': function(e){
							e.preventDefault();
							var firstID = parseInt($(this).attr('data-id'));
								
								for(i=0;i<actions.length;i++){
									var action = loql.select('action', actions[i]);
									if(firstID > actions[i]){
										$('#action-'+actions[i]).hide(0);
									} else {
										$('#action-'+actions[i]).show(0);
									}
								}
							
						}
					});
					
				
				break;
				
				
			}
			
			
			
			
		});
	
	},
	
	setPaintSize: function(size, elem){
		topoDog.paintSize = size;
		$('#sizes a').css('border', '3px solid #000000');
		$(elem).css('border', '3px solid #ffffff');
	
	},
	
	selectAction: function(id){
		topoDog.selectedAction = id;
		$('#actions a').css('border', '3px solid #000000');
		$('#actSelect-'+id).css('border', '3px solid #ffffff');
	
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
		// Save tiles, objects, beings, actions to files
	},
	
	tdExport: function(){
		
		var canvas = document.getElementById('bgCanvas');
		var imgData = canvas.toDataURL();
		loql.set('savedtexture', '0', imgData);
	
		var content = JSON.stringify(localStorage);

//		var content = JSON.stringify(localStorage,function(k, v) {
//		    //console.log(typeof(k));
//		    //console.log(typeof(v));
//		    return (typeof(v) === 'object') ? JSON.stringify(v) : v;
//		});
		
		uriContent = "data:application/octet-stream," + encodeURIComponent(content);
		
		var now = new Date();
		var filename = 'scenario-'+now.getFullYear()+'-'+now.getMonth()+'-'+now.getDate()+'_'+now.getHours()+'-'+now.getMinutes()+'.json';
		
		
		if (typeof window.requestFileSystem != 'undefined') {
				//alert(cordova.file.externalRootDirectory);
				//alert(cordova.file.externalDataDirectory);
				//var sdCardPath = cordova.file.externalRootDirectory;
				
				
				var sdCardPath = cordova.file.externalRootDirectory.replace('file\:\/\/', '');
				//var sdCardPath = cordova.file.externalDataDirectory.replace('file\:\/\/', '');
				//alert(sdCardPath);
				
				GapFile.writeFile(sdCardPath+filename, content, function(){
					alert('Esportazione completata.');
				}, function(){
					alert('Esportazione non riuscita.');
				});
				
				
				/***
				window.resolveLocalFileSystemURL(window.PERSISTENT, 0, function(fs) {
				//window.requestFileSystem(window.PERSISTENT, 0, function(fs) {

				  fs.root.getFile(sdCardPath+filename, {create: true}, function(fileEntry) {

				    // Create a FileWriter object for our FileEntry (log.txt).
				    fileEntry.createWriter(function(fileWriter) {

				      fileWriter.onwriteend = function(e) {
					console.log('Write completed.');
				      };

				      fileWriter.onerror = function(e) {
					console.log('Write failed: ' + e.toString());
				      };

				      // Create a new Blob and write it to log.txt.
				      var blob = new Blob(content, {type: 'text/plain'});

				      fileWriter.write(blob);

				    }, function() {  alert('Error: fileEntry.createWriter'); });

				  }, function() {  alert('Error: fs.root.getFile'); });

				}, function() {  alert('Error: request file system'); });
				
				***/
				
				

		} else {
				//Assuming we are in a browser
			$('#export').attr('download', filename);
			$('#export').attr('href', uriContent);
			$('#export').click();

			//alert('NO FS');
		
		}
		
	
	},
	
	
	tdImportDialog: function(){
		
		var fileData = '';
		
		if (typeof window.requestFileSystem != 'undefined') {
		
			window.plugins.mfilechooser.open([], function (uri) {
				
				//alert(uri);
				
				GapFile.readFile(uri, true, function(data){
				
					fileData = data;
					//alert(fileData);

				}, function(){
					alert('Non riesco a leggere questo file.');
				});

			}, function (error) {

				alert(error);

			});
	
//////				window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
//////					//alert(filesystem.root);
//////					
//////					   
//////				});
		} else {
			//Assuming we are in a browser
			//alert('NO FS');
			$('#filechooser').click();
			
		
		}
		
		//alert(fileData);
		topoDog.tdImport(fileData);
	
	},
	
	
	
	tdImport: function(fileData){
		
		topoDog.tdReset();
		
		//alert(fileData);
	
		var content = JSON.parse(fileData);
		
		//alert(content);
		for(var k in content){
			localStorage.setItem(k, content[k]);
		}
		
		
		//Draw textures
		var tesselSource = loql.select('savedtexture', '0');
		var canvas = document.getElementById('bgCanvas');
		var context = canvas.getContext('2d');
		var imageObj = new Image();

		imageObj.onload = function() {
			context.drawImage(imageObj, 0, 0);
		};
		
		imageObj.src = tesselSource;
		
		//Draw objects
		
		//Draw actions
		var actions = loql.select('action');
		if(!actions){
			return;
		}
		
		for(i=1;i<actions.length;i++){
			var currentAction = loql.select('action', actions[i]);
			//console.log(currentAction);
			//ATTENZIONE PASSARE COME ULTIMO PARAMETRO id AZIONE PER NON REINSERIRE NEL DB!
			newAction(currentAction.aid,currentAction.bid,currentAction.x,currentAction.y,currentAction.r,actions[i].toString());
			//console.log(actions[i].toString());
			
		}
		
		topoDog.loadBeings();
		
	},
	
	tdReset: function(resetCanvas){
		
		//Svuoto database locale
		localStorage.clear();
		
		//Eliminare tutti i beings e tutte le actions
		$('.object').remove();
		$('.action').remove();
		
		
		//MANTENERE CANVAS
		topoDogAssets();
		topoDog.loadBeings();
		
		
		
		//PER CANCELLARE CANVAS E BEINGS
		if(resetCanvas){
			topoDogLauncher();
		} else {
			newAction(0,0,0,0,0,false);
		}
	}
	
}

tileElement = { // elementi disegnabili a tasselli
	name:'',
	image:'',
	size:'',
}

function newTileElement(name, image, size){

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
	var theID = loql.insert('object', values);
	
	var theItem = loql.select('objects', objectID);
	
	
	var Isize = theItem.size*topoDog.tileSize;
	/***
	var Imargin = (Isize/2)-(topoDog.tileSize/2);
	// inserisci oggetto nella DOM 
	$('#tile-'+x+'-'+y).append('<div class="object '+theItem.name+'" style="width:'+Isize+'px;height:'+Isize+'px;margin-top:-'+Imargin+'px;margin-left:-'+Imargin+'px;"></div>');
	
	***/
	
	var ImarginTop = y - (Isize/2);
	var ImarginLeft = x - (Isize/2);
	$('#grid').append('<div id="object-'+theID+'" class="object '+theItem.name+'" data-id="'+theID+'" style="position:absolute;width:'+Isize+'px;height:'+Isize+'px;margin-top:'+ImarginTop+'px;margin-left:'+ImarginLeft+'px;"></div>');
	
	$('#action-'+theID).load('./svg/'+theItem.shape);
	
	
	
	
}

function moveItem(objectID,x,y){


}

function deleteItem(objectID,x,y){

}



function newAction(actionID,bid,x,y,rotation,nodb){
	
	if(nodb != false){
		var theID = nodb;
	} else {
		
		var values = {
			'aid':actionID,
			//'bid':topoDog.activeBeing.id,
			'bid':bid,
			'x':x,
			'y':y,
			'r':rotation,
			't':topoDog.timestamp()
		}
	
		var theID = loql.insert('action', values);
		//console.log('INSERT');
	}

	var theAction = loql.select('actions', actionID);
	var Asize = theAction.size*topoDog.tileSize;
	
	var AmarginTop = y - (Asize/2);
	var AmarginLeft = x - (Asize/2);
	// inserisci oggetto nella DOM
	
	
	$('#grid').append('<div id="action-'+theID+'" class="action" data-id="'+theID+'" data-bid="'+bid+'" data-action="'+theAction.name+'" style="position:absolute;width:'+Asize+'px;height:'+Asize+'px;margin-top:'+AmarginTop+'px;margin-left:'+AmarginLeft+'px;"></div>');
	
	
	var theBeing = loql.select('beings', bid);
	
	if(theBeing){
		$('#action-'+theID).load('./svg/'+theAction.shape, function(){
		
			$('#action-'+theID).children('svg').css('transform', 'scale('+topoDog.zoomFactor+') rotate('+rotation+'deg)');
			//$('#action-'+theID+' svg path').css('fill', topoDog.activeBeing.color);
			$('#action-'+theID+' svg path').css('fill', theBeing.color);
			$('#action-'+theID).children('svg').attr('data-rot', rotation);
			//console.log(rotation);
			
		});
	}
	
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
	//$('.mapTile').css({'width':$('.mapTile').width()*value, 'height':$('.mapTile').height()*value});
			
	if(topoDog.tileSize < 1 && value < 1){
		return;
		//value=2;
	}
	
	if(topoDog.tileSize > 48 && value > 1){
		return;
		//value=0.5;
	}
	
	var originalMarginTop = parseInt($('#grid').css('margin-top'));
	var originalMarginLeft = parseInt($('#grid').css('margin-left'));
	
	var originalGridW = parseInt($('#grid').width());
	var originalGridH = parseInt($('#grid').height());
	
	var newGridW = originalGridW*value;
	var newGridH = originalGridH*value;

	
	var midH = $(document).height()/2;
	var DH0 = midH - originalMarginTop;
	var DH1 = DH0*value;
	
	var newMarginTop = midH - DH1;
	
	
	var midW = $(document).width()/2;
	var DW0 = midW - originalMarginLeft;
	var DW1 = DW0*value;
	
	var newMarginLeft = midW - DW1;

	
	$('#grid').css({
		'margin-top':(newMarginTop)+'px',
		'margin-left':(newMarginLeft)+'px',
		'width':(newGridW)+'px',
		'height':(newGridH)+'px'
		});
	
	$('#bgCanvas').css({
		'margin-bottom':-$('#bgCanvas').height()*value,
		'width':$('#bgCanvas').width()*value,
		'height':$('#bgCanvas').height()*value
	});

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
	
	topoDog.zoomFactor = topoDog.tileSize/topoDog.originalTileSize;
	//$('.object svg, .action svg').css('transform', 'scale('+topoDog.zoomFactor+')');
	$('.action svg').each( function(){
		var rotation = $(this).attr('data-rot');
		$(this).css('transform', 'scale('+topoDog.zoomFactor+') rotate('+rotation+'deg)');
	});
	
}

function zoomReset(){
	var resetFactor = topoDog.tileSize / topoDog.originalTileSize;
	//console.log(1/(resetFactor));
	zoomField(1/(resetFactor));

}


function handleFileSelect(evt) {
	
	var result = '';
	var files = evt.target.files; // FileList object

	// Loop through the FileList and render image files as thumbnails.
	for (var i = 0, f; f = files[i]; i++) {

		var reader = new FileReader();
		reader.onload = (function(theFile) {
			return function(e) {
			  //console.log (theFile);
			  result = (e.target.result);
			  topoDog.tdImport(result);
			};
		      })(f);
		reader.readAsText(f);
		
	}
	
}


function topoDogAssets(){
	var gomma = {
		'name':'gomma',
		'color':'#eeeeee',
	}
	loql.insert('tessels', gomma);
	
	var matita = {
		'name':'matita',
		'color':'#333333',
	}
	loql.insert('tessels', matita);
	
	var terra = {
		'name':'terra',
		'color':'#ffaa44',
	}
	loql.insert('tessels', terra);
	
	var erba = {
		'name':'erba',
		'color':'#99ff99',
	}
	loql.insert('tessels', erba);
	
	var acqua = {
		'name':'acqua',
		'color':'#3333ff',
	}
	loql.insert('tessels', acqua);
	
	//////////////////////////////
	
	
	
	var ciotola = {
		'type':'object',
		'name':'ciotola',
		'size': 2,
		'shape':'ciotola.svg',
	}
	loql.insert('objects', ciotola);
	
	
	var albero = {
		'type':'object',
		'name':'albero',
		'size': 3,
		'shape':'albero.svg',
	}
	loql.insert('objects', albero);
	
	var cespuglio = {
		'type':'object',
		'name':'cespuglio',
		'size': 2,
		'shape':'cespuglio.svg',
	}
	loql.insert('objects', cespuglio);
	
	/*
	var fido = {
		'color':'#ff0000',
		'name':'fido',
		'type':'dog',
		'image':,
	}
	*/
	
	var azioneDummy = {
		'name':'dummy',
		'size':'0',
		'shape':'null.svg',
	}
	loql.insert('actions', azioneDummy);
	
	var pipi = {
		'name':'pipi',
		'size':'3',
		'shape':'pipi.svg',
	}
	loql.insert('actions', pipi);
	
	var cacca = {
		'name':'cacca',
		'size':'3',
		'shape':'cacca.svg',
	}
	loql.insert('actions', cacca);
	
	
	var spalle = {
		'name':'spalle',
		'size':'3',
		'shape':'spalle.svg',
	}
	loql.insert('actions', spalle);
	
	var inibita = {
		'name':'inibita',
		'size':'3',
		'shape':'inibita.svg',
	}
	loql.insert('actions', inibita);
	
	var raspa = {
		'name':'raspa',
		'size':'3',
		'shape':'raspa.svg',
	}
	loql.insert('actions', raspa);
	
	var buca = {
		'name':'buca',
		'size':'3',
		'shape':'buca.svg',
	}
	loql.insert('actions', buca);
	
	var sicurezza = {
		'name':'sicur.',
		'size':'3',
		'shape':'sicurezza.svg',
	}
	loql.insert('actions', sicurezza);
	
	var spallesu = {
		'name':'spalle >',
		'size':'3',
		'shape':'spallesu.svg',
	}
	loql.insert('actions', spallesu);
	
	var esplora = {
		'name':'esplora',
		'size':'3',
		'shape':'esplora.svg',
	}
	loql.insert('actions', esplora);
	
	var possessivita = {
		'name':'poss.',
		'size':'2',
		'shape':'possessivita.svg',
	}
	loql.insert('actions', possessivita);
	
//	newBeingElement('#ff0000', 'fido', 'dog', '');
//	newBeingElement('#00ff00', 'ettore', 'dog', '');
//	newBeingElement('#0000ff', 'gunther', 'dog', '');
	
	
}


function topoDogLauncher(){
	
	//localStorage.clear();
	
	jQuery.event.swipe.min = 50;
	jQuery.event.swipe.max = 800;
//	jQuery.event.swipe.delay = 1000;
	
	//topoDog.w = ($(document).width()/topoDog.tileSize) -4;
	//topoDog.h = (($(document).height() - $('#actionsControls').height() - $('#modeControls').height()) / topoDog.tileSize) -3;
	
	/***
	var userWidth = prompt('Insert field width');
	var userHeight = prompt('Insert field height');
	topoDog.w = userWidth;
	topoDog.h = userHeight;
	***/
	
	topoDog.w = 100;
	topoDog.h = 100;
	
	//document.body.addEventListener('touchstart', function(e){ e.preventDefault(); });
	newAction(0,0,0,0,0,false);
	topoDog.init();


}


$(document).ready(function(){
	localStorage.clear();
	topoDogAssets();
	topoDogLauncher();
});














