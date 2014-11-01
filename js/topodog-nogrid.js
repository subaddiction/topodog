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
	//pathMode: 'new', //new, addPoint, edit
	selectedObject: 0,
	selectedTessel: 0,
	selectedAction: 0,
	selectedItem: 0,
	activeBeing: false,
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
	
	firstID: false,
	lastID: false,
	
	loadTessels: function(){
		$('#tessels').html('');
		
		var tessels = loql.select('tessels');
		for(i=0;i<tessels.length;i++){
		
			
			var currentTessel = loql.select('tessels', tessels[i]);
			//console.log(currentBeing);
			
			var tag = '<a id="tessel-'+currentTessel.id+'" class="tessel" href="javascript:;" data-id="'+currentTessel.id+'" data-color="'+currentTessel.color+'" style="background:'+currentTessel.color+';border:3px solid '+currentTessel.color+'">'+currentTessel.name+'</a>';
			$('#tessels').append(tag);
		}
		
		$('#tessels a').off();
		
////		$('#tessels a').click(function(){
////			$('#tessels a').css('border', '3px solid #000000');
////			$(this).css('border', '3px solid #ffffff');
////			topoDog.selectedTessel = $(this).attr('data-id');
////			topoDog.modeSwitch('tessel');
////		});

		$('#tessels a').on({
		
			'click touchstart': function(){
				$('#tessels a').css('border', '3px solid #000000');
				$(this).css('border', '3px solid #ffffff');
				topoDog.selectedTessel = $(this).attr('data-id');
				topoDog.modeSwitch('tessel');
			}
		
		});
	},
	
	loadItems: function(i, limit){
	
		var items = loql.select('objects');
		
		if(!limit){
			$('#itemsControls').html('');
			limit = items.length;
		}
		
		var currentItem = loql.select('objects', items[i]);
		var tag = '';
		var shapeData = false;
		if(i < limit){
			
//			console.log(i);
//			console.log(limit);
//			console.log(currentItem);
			shapeData = $.get('./svg/'+currentItem.shape, function(){
		//alert(shapeData.responseText);
				tag += '<a id="itemSelect-'+currentItem.id+'" class="itemSelector" href="javascript:;" data-id="'+currentItem.id+'">\n';
				//onclick="topoDog.selectItem(\''+currentItem.id+'\');"
				tag += shapeData.responseText+'\n';
				//console.log(shapeData.responseText);
				tag += '<span>'+currentItem.name+'</span>\n';
				tag += '</a>\n';
			
				if(i < limit){
					$('#itemsControls').append(tag);
					$('#itemsControls svg path').css('fill', '#ffffff');
					i = i+1;
					topoDog.loadItems(i, limit);
				}
			
			});
			
		} else {
			var oneItemW = $('#itemsControls a').width();
			var oneItemM = parseInt($('#itemsControls a').css('margin-right'));
			var itemsW = (oneItemW + (2 * oneItemM)) * (items.length + 1);
			$('#itemsControls').width(itemsW+'px');
			
			$('#itemsControls a').on({
				'click touchend': function(){
					topoDog.selectItem($(this).attr('data-id'));
				}
			});
		}
	},
	
	drawItems: function(){
		
		var items = loql.select('object');
		if(!items){
			return;
			//alert('no actions found!');
		}
		
		//console.log(actions);
		
		for(i=1;i<items.length;i++){
			var currentItem = loql.select('object', items[i]);
			//console.log(currentAction);
			//ATTENZIONE PASSARE COME ULTIMO PARAMETRO id AZIONE PER NON REINSERIRE NEL DB!
			
			this.newItem(currentItem.oid,currentItem.x,currentItem.y,items[i].toString());
			
			//console.log(currentAction.n);
			//console.log(actions[i].toString());
			
		}	
	
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
			
			//
			if(currentBeing.active < 1){
				//Usare campo active per farlo vedere o no
				//continue;
			}
			
			var tag = '<a class="being" href="javascript:;" data-id="'+currentBeing.id+'" data-color="'+currentBeing.color+'" style="background:'+currentBeing.color+';border:3px solid '+currentBeing.color+'">'+currentBeing.name+'</a>';
			$('#beings').append(tag);
		}
		
		var oneBeingW = $('#beings a').width();
		var oneBeingM = parseInt($('#beings a').css('margin-right'));
		var beingsW = (oneBeingW + (2 * oneBeingM)) * (beings.length + 1);
		$('#beings').width(beingsW+'px');
		
		$('#beings a').off();
//		$('#beings a').click(function(){
//			$('#actions a').css('background', $(this).attr('data-color'));
//			topoDog.activeBeing = loql.select('beings', $(this).attr('data-id'));
//		});
		
		$('#beings a').on({
		
			'click touchend': function(){
				$('#actions a').css('background', $(this).attr('data-color'));
				topoDog.activeBeing = loql.select('beings', $(this).attr('data-id'));
			},
			
			'taphold': function(e){
				e.preventDefault();
				$('#showBeing').remove();
				var id = $(this).attr('data-id');
				var color = $(this).attr('data-color');
				
				var showBeingModal = '<div id="showBeing" style="background:'+color+';">';
				showBeingModal += '<a class="showB" href="javascript:;"><span class="glyphicon glyphicon-eye-open"></span></a>';
				showBeingModal += '<br />';
				showBeingModal += '<a class="hideB" href="javascript:;"><span class="glyphicon glyphicon-eye-close"></span></a>';
				showBeingModal += '</div>';
				$(this).prepend(showBeingModal);
				
				$('.showB').on({
					'click touchend': function(){
						topoDog.showBeing(id);
						//console.log(id);
					}
				});
				$('.hideB').on({
					'click touchend': function(){
						topoDog.hideBeing(id);
						//console.log(id);
					}
				});
			}
		
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
				tag += '<a id="actSelect-'+currentAction.id+'" class="actionSelector" href="javascript:;" data-id="'+currentAction.id+'">\n';
				//onclick="topoDog.selectAction(\''+currentAction.id+'\');" ontouchstart="topoDog.selectAction(\''+currentAction.id+'\');"
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
			
		} else {
		
			var oneActionW = $('#actions a').width();
			var oneActionM = parseInt($('#actions a').css('margin-right'));
			var beingsW = (oneActionW + (2 * oneActionM)) * ($('#actions a').length + 2);
			$('#actions').width(beingsW+'px');
			
			$('#actionsControls a').on({
				'click touchstart': function(){
					topoDog.selectAction($(this).attr('data-id'));
				}
			});
		
		}
		
		
		
	},
	
	drawActions: function(){
		
		var actions = loql.select('action');
		if(!actions){
			return;
			//alert('no actions found!');
		}
		
		//console.log(actions);
		
		for(i=1;i<actions.length;i++){
			var currentAction = loql.select('action', actions[i]);
			//console.log(currentAction);
			//ATTENZIONE PASSARE COME ULTIMO PARAMETRO id AZIONE PER NON REINSERIRE NEL DB!
			this.newAction(currentAction.aid,currentAction.bid,currentAction.x,currentAction.y,currentAction.r,actions[i].toString());
			
			//console.log(currentAction.n);
			//console.log(actions[i].toString());
			
		}	
	
	},
	
	startControls: function(){
		
		
		
		var oneControlW = $('#modeControls li').width();
		var oneControlM = parseInt($('#modeControls li').css('margin-right'));
		var controlsW = (oneControlW + (2 * oneControlM)) * ($('#modeControls li').length + 2);
		$('#modeControls').width(controlsW+'px');
		
		var oneTesselW = $('#tessels a').width();
		var oneTesselM = parseInt($('#tessels a').css('margin-right'));
		var tesselsW = (oneTesselW + (2 * oneTesselM)) * ($('#tessels a').length + 2);
		$('#tessels').width(tesselsW+'px');
		
		var oneSizeW = $('#sizes a').width();
		var oneSizeM = parseInt($('#sizes a').css('margin-right'));
		var sizesW = (oneSizeW + (2 * oneSizeM)) * ($('#sizes a').length + 2);
		$('#sizes').width(sizesW+'px');
		
		$('body').on({
			'mousemove touchmove': function(e){
				e.preventDefault();
			}
		});
		
		$('a.mode').on({
			'tap': function(){
				zoomReset();
				topoDog.modeSwitch($(this).attr('data-mode'));
				
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
		
		$('#openNewDogForm').on({
			'tap': function(){
				topoDog.newDogForm();
			}
		});
		
		$('#zoomMore').on({
			'tap': function(){
				if(topoDog.mode != 'view3d'){
					$('#presentation').click();
				}
				zoomField(2);
			}
		});
		
		$('#zoomLess').on({
			'tap': function(){
				if(topoDog.mode != 'view3d'){
					$('#presentation').click();
				}
				zoomField(.5);
			}
		});
		
		$('.colorSelect').each(
			function(){
				$(this).css('background', $(this).attr('data-color'));
			}
		);
		$('.colorSelect').on({
			'tap': function(){
				$('.colorSelect').css('outline', '0');
				$('.colorSelect').css('opacity', '0.6');
				$('.colorSelect').css('box-shadow', 'none');
				$('#newDog_color').val($(this).attr('data-color'));
				$(this).css('outline', '8px solid #000000');
				$(this).css('opacity', '1');
				
				
			}
		});
		
		$('.pan').on({
			'click touchend': function(){
				gridPan(parseInt($(this).attr('data-panx')), parseInt($(this).attr('data-pany')));
			}	
		});
		
		$('#closeNewDogForm').on({
			'click touchend': function(){
				$('#newDog').hide(0);
			}
		});
		
		$('#submitNewDogForm').on({
			'click touchend': function(){
				topoDog.insertBeing();
			}
		});
		
		
		$('#sizes a').on({
			'tap': function(){
				topoDog.setPaintSize($(this).attr('data-size'), $(this));
			}
		});
		
		
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
		
		
		
		// Load all tiles, objects, beings actions
		this.drawTexture();
		this.loadTessels();
		this.loadBeings();
		//this.loadItems(1,false);
		this.loadItems(0,false);
		this.loadActions(1,false);
		
		this.startControls();
		this.drawItems();
		this.drawActions();
		
		
	},
	
	modeSwitch: function(mode){
		
		if(this.mode == 'tessel' && mode != 'tessel'){
			//Salvo texture
			this.saveTexture();
		}
		
		if(mode){
			topoDog.mode = mode;
		}
		
		$('#scenario').off();
		$('#grid').off();
		$('.object').off();
		$('.action').off();
		$('#modeControls a').unbind('taphold');
		
		if(mode != 'view3d'){
			$('#grid').css({
				'transform':'rotate3d(1, 0, 0, 0deg) rotate(0deg)',
			});
		}
		
		
		
		$('#tesselControls').hide(0);
		$('#itemsControls').hide(0);
		$('#actionsControls').hide(0);
		$('#editControls').hide(0);
		$('#noteControls').hide(0);
		$('#dataControls').hide(0);
		$('#timelineBox').hide(0);
		$('#helpBox').hide(0);
		
		
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
								
//								var X = Math.floor((touch.pageX - ($(this).offset().left)) / tesselZoom);
//								var Y = Math.floor((touch.pageY - ($(this).offset().top)) / tesselZoom);

								var X = touch.pageX - ($(this).offset().left) - (tesselSize/2);
								var Y = touch.pageY - ($(this).offset().top) - (tesselSize/2);
								
								ctx.fillStyle = paintColor;
        							//ctx.fillRect(X*tesselSize, Y*tesselSize, tesselSize, tesselSize);
								ctx.fillRect(X, Y, tesselSize, tesselSize);
								
							} else {
								var button = (typeof(e.buttons) != "undefined") ? e.buttons : e.which;
								if(button==1){
								
								var touch = e.originalEvent;
//								var X = Math.floor((touch.clientX - ($(this).offset().left)) / tesselZoom);
//								var Y = Math.floor((touch.clientY - ($(this).offset().top)) / tesselZoom);
								var X = touch.clientX - ($(this).offset().left) - (tesselSize/2);
								var Y = touch.clientY - ($(this).offset().top) - (tesselSize/2);
								
								
								
								
								ctx.fillStyle = paintColor;
								//ctx.fillRect(X*tesselSize, Y*tesselSize, tesselSize, tesselSize);
								ctx.fillRect(X, Y, tesselSize, tesselSize);
									
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
					
					$('#grid').on({
						'click touchend': function(e){
							if(topoDog.selectedObject == false){
								return;
							}
							if(e.originalEvent.touches){
									var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
								
									var X = touch.pageX - ($(this).offset().left);
									var Y = touch.pageY - ($(this).offset().top);
								
									topoDog.newItem(topoDog.selectedObject,X,Y,false);
								
								} else {
									var button = (typeof(e.buttons) != "undefined") ? e.buttons : e.which;
									if(button==1){
										var touch = e.originalEvent;
										var X = touch.clientX - ($(this).offset().left);
										var Y = touch.clientY - ($(this).offset().top);
									
										topoDog.newItem(topoDog.selectedObject,X,Y,false);
									}
								}
						
						
						}
					});
					
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
							
							if(topoDog.activeBeing == false){
								return;
							}
							
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
								topoDog.theNewAction = topoDog.newAction(topoDog.selectedAction,topoDog.activeBeing.id,X,Y,rotation,false);
								
								
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
								e.preventDefault();
								
								if(topoDog.activeBeing == false){
									return;
								}
								
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
						'taphold': function(e){
							e.preventDefault();
							//alert('muovi,ruota,elimina');
							var objectID = $(this).attr('data-id');
							//if(confirm('Vuoi eliminare questo oggetto? [id:'+objectID+']')){
								
								loql.del('object', objectID);
								$(this).remove();
							//}
						}
					});
				
					$('.action').on({
						'taphold': function(e){
							e.preventDefault();
							//alert('muovi,ruota,elimina');
							var actionID = $(this).attr('data-id');
							//if(confirm('Vuoi eliminare questa azione? [id:'+actionID+']')){
								
								loql.del('action', actionID);
								$(this).remove();
							//}
						}
					});
				break;
				
				case 'manageData':
					$('#dataControls').show(0);
				
				break;
				
				case 'view3d':
					
					$('#timeline > .time').remove();
					$('#timelineBox').show(0);
				
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
					
					if(actions.length <= 1){
						return;
					}
					for(i=0;i<actions.length;i++){
						
						var action = loql.select('action', actions[i]);
						var being = loql.select('beings', action.bid);
						
						//var hours = date.getHours(); var minutes = date.getMinutes(); var seconds = date.getSeconds(); // will display time in 21:00:00 format var formattedTime = hours + ':' + minutes + ':' + seconds;
						
						var date = new Date(action.t);
						var humanDate = date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate();
						var humanTime = date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
						var tag = '';
						
						tag += '<div class="time" data-id="'+actions[i]+'" data-bid="'+action.bid+'">';
						tag += '<div class="t-id" style="background:'+being.color+';">'+actions[i]+'</div>';
						tag += '<div class="t-detail">'+humanDate+'<br />['+humanTime+']</div>';
						tag += '</div>'
						$('#timeline').append(tag);
					
					}
					
					var showhide = '';
					showhide += '<div class="time">';
					showhide += '<a class="showAllTimeline" href="javascript:;"><span class="glyphicon glyphicon-eye-open"></span></a>';
					showhide += '<a class="hideFromTimeline" href="javascript:;"><span class="glyphicon glyphicon-eye-close"></span></a>';
					showhide += '</div>';
					
					$('#timeline').prepend(showhide);
					$('#timeline').append(showhide);
					
					//$('#timelineBox .iScrollLoneScrollbar').remove();
					
					$('#timeline').width($('.time').width() * (actions.length + 3));
					
					$('.time').css({
						'float':'left',
						//'width':(100/actions.length)+'%',
					});
					
					$('.time .t-id').on({
						'click touchstart': function(e){
							e.preventDefault();
							topoDog.lastID = parseInt($(this).parent().attr('data-id'));
								
								for(i=0;i<actions.length;i++){
									var action = loql.select('action', actions[i]);
									if(topoDog.lastID >= actions[i] && topoDog.firstID <= actions[i]){
										$('#action-'+actions[i]).show(0);
									} else {
										$('#action-'+actions[i]).hide(0);
									}
								}
								
								$('#lastFrameFlag').remove();
								var lastFrameFlag = '<div id="lastFrameFlag"><span class="glyphicon glyphicon-step-forward"></span></div>';
								$('.time[data-id='+topoDog.lastID+']').append(lastFrameFlag);
							
						},
						
						
					});
					
					$('.time .t-detail').on({
						'click touchstart': function(e){
							e.preventDefault();
							topoDog.firstID = parseInt($(this).parent().attr('data-id'));
								
								for(i=0;i<actions.length;i++){
									var action = loql.select('action', actions[i]);
									if(topoDog.firstID > actions[i]){
										$('#action-'+actions[i]).hide(0);
									} else {
										if(actions[i] <= topoDog.lastID){
											$('#action-'+actions[i]).show(0);
										}
									}
								}
								
							$('#firstFrameFlag').remove();
							var firstFrameFlag = '<div id="firstFrameFlag"><span class="glyphicon glyphicon-step-backward"></span></div>';
							$('.time[data-id='+topoDog.firstID+']').append(firstFrameFlag);
							
						}
					
					});
					
					$('.showAllTimeline').on({
						'click touchstart': function(){
							$('.time').show();
						}
					});
					
					$('.hideFromTimeline').on({
						'click touchstart': function(){
							var beings = loql.select('beings');
							//$('[data-bid=]').attr('being-hide')
							for(i=0;i<beings.length;i++){
								//var being = loql.select('beings', beings[i]);
								if($('[data-bid='+beings[i]+']').attr('being-hide') == 'true'){
									$('.time[data-bid='+beings[i]+']').hide();
								}
							}
						}
					});
					
				break;
				
				case 'notes':
				
					$('#noteControls').show(0);
					$('.action').on({
						'taphold': function(e){
							e.preventDefault();
							$('#noteForm').remove();
							$('.action').attr('data-note', false);
							$(this).attr('data-note', 'true');
							//alert('muovi,ruota,elimina');
							var actionID = $(this).attr('data-id');
							var noteAction = loql.select('action', actionID);
							if(noteAction.n){
								var currentNote = noteAction.n;
							} else {
								var currentNote = '';
							}
							
							var leftOffset = $(this).width()/2;
							var topOffset = $(this).height()/2;
							var noteForm = '<div id="noteForm" style="margin-top:-'+topOffset+'px;margin-left:'+leftOffset+'px;">';
							noteForm += '<textarea rows="3" cols="24">'+currentNote+'</textarea>';
							noteForm += '<a id="saveNote" href="javascript:;" data-id="'+actionID+'">';
							noteForm += '<span class="glyphicon glyphicon-ok"></span>';
							noteForm += '</a>';
							noteForm += '</div>';
							
							$('#action-'+actionID).prepend(noteForm);
							
							$('#saveNote').on({
								'click touchstart':function(){
									topoDog.addNote($(this).attr('data-id'));
									$('.action').attr('data-note', false);
								}
							});
						}
					});
				
				break;
				
				case 'help':
				
					$('#helpBox').show();
					$('#modeControls a').on({
						'taphold': function(){
							$('#help').html($(this).attr('title'));
						}
					});
					
					$('#help').html($('#inlineHelp').attr('title'));
				break;
				
				
			}
			
			scrollBars();
			
			
		});
	
	},
	
	addNote: function(actionID){
		
		var label = $('#action-'+actionID).children('.noteLabel').html();
		if(!label){
			$('#action-'+actionID).prepend('<span class="noteLabel glyphicon glyphicon-comment"></span>');
		}
		
		var noteAction = loql.select('action', actionID);
		noteAction.n = $('#noteForm textarea').val();
		
		if(!noteAction.n){
			$('#action-'+actionID).children('.noteLabel').remove();
		}
		
		//console.log(noteAction);
		loql.set('action', actionID, noteAction);
		$('#noteForm').remove();
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
	
	selectItem: function(id){
		topoDog.selectedObject = id;
		$('#itemsControls a').css('border', '3px solid #000000');
		$('#itemSelect-'+id).css('border', '3px solid #ffffff');
	
	},
	
	newDogForm: function(){
		
		$('#newDog_color').val('');
		$('#newDog_name').val('');
		$('#newDog_type').val('');
		$('#newDog_image').val('');
		$('#newDog').show(0);
		scrollBars();
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
		this.newBeingElement(color, name, type, image);
		$('#newDog').hide(0);
	},
	
	newBeingElement: function(color, name, type, image){
		// insert new being in topoDog.beings
	
		// insert new being_id in localstorage
		newBeing = {
			'color':color,
			'name':name,
			'type':type,
			'image':image,
			'show': 0,
		}
		var newBeingID = loql.insert('beings', newBeing);
		topoDog.loadBeings();
		return newBeingID;
	},
	
	showBeing: function(id){
		$('#beings > a[data-id='+id+']').show();
		//$('div[data-bid='+id+']').show();
		$('div[data-bid='+id+']').attr('being-hide', 'false');
		$('#showBeing').remove();
	},
	
	hideBeing: function(id){
		$('#beings > a[data-id='+id+']').show();
		//$('div[data-bid='+id+']').hide();
		$('div[data-bid='+id+']').attr('being-hide', 'true');
		$('#showBeing').remove();
	},
	
	saveTexture:function(){
		var canvas = document.getElementById('bgCanvas');
		var imgData = canvas.toDataURL();
		loql.set('savedtexture', '0', imgData);
	},
	
	drawTexture: function(){
		var tesselSource = loql.select('savedtexture', '0');
		var canvas = document.getElementById('bgCanvas');
		var context = canvas.getContext('2d');
		var imageObj = new Image();

		imageObj.onload = function() {
			context.drawImage(imageObj, 0, 0);
		};
		
		imageObj.src = tesselSource;
	},
	
	tdExport: function(){
		
		this.saveTexture();
	
		var content = JSON.stringify(localStorage);

//		var content = JSON.stringify(localStorage,function(k, v) {
//		    //console.log(typeof(k));
//		    //console.log(typeof(v));
//		    return (typeof(v) === 'object') ? JSON.stringify(v) : v;
//		});
		
		uriContent = "data:application/octet-stream," + encodeURIComponent(content);
		
		var now = new Date();
		var filename = 'scenario-'+now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate()+'_'+now.getHours()+'-'+now.getMinutes()+'.json';
		
		
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
		this.tdImport(fileData);

	
	},
	
	
	
	tdImport: function(fileData){
		
		localStorage.clear();
	
		var content = JSON.parse(fileData);
		
		//alert(content);
		for(var k in content){
			localStorage.setItem(k, content[k]);
		}
		
		topoDogAssets();
		topoDogLauncher();
		
	},
	
	tdReset: function(resetCanvas){
		
		//Svuoto database locale
		localStorage.clear();
		
		//Elimino tutti i beings e tutte le actions dalla DOM
		$('.object').remove();
		$('.action').remove();
		
		//Ricarico assets
		topoDogAssets();
		
		//Salvo texture se necessario
		if(!resetCanvas){
			this.saveTexture();
		}
		
		// Reinizializzo
		topoDogLauncher();
		
		
		
		
		
		
		
		
		
	},
	
	newItem: function(objectID,x,y,nodb){
		
		if(nodb != false){
			var theID = nodb;
		} else {
			var values = {
				'oid':objectID,
				'x':x,
				'y':y
			}
			theID = loql.insert('object', values);
		}
	
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
	
		$('#object-'+theID).load('./svg/'+theItem.shape);
	
	
	
	
	},



 	newAction: function(actionID,bid,x,y,rotation,nodb){
	
		if(nodb != false){
			var theID = nodb;
			var currentAction = loql.select('action', theID);
			var actionNote = currentAction.n;
		} else {
		
			var values = {
				'aid':actionID,
				//'bid':topoDog.activeBeing.id,
				'bid':bid,
				'x':x,
				'y':y,
				'r':rotation,
				't':topoDog.timestamp(),
				'n':'',
			}
	
			var theID = loql.insert('action', values);
			//console.log('INSERT');
		}

		var theAction = loql.select('actions', actionID);
		var Asize = theAction.size*topoDog.tileSize;
	
		var AmarginTop = y - (Asize/2);
		var AmarginLeft = x - (Asize/2);
		// inserisci oggetto nella DOM
		
		var actionMarkup = '<div id="action-'+theID+'" class="action" data-id="'+theID+'" data-bid="'+bid+'" data-action="'+theAction.name+'" style="position:absolute;width:'+Asize+'px;height:'+Asize+'px;margin-top:'+AmarginTop+'px;margin-left:'+AmarginLeft+'px;">';
			

		actionMarkup += '</div>';
		
		
		//INSERISCO ACTION NELLA DOM
		$('#grid').append(actionMarkup);
		
		

			
	
	
		var theBeing = loql.select('beings', bid);
	
		if(theBeing){
			$('#action-'+theID).load('./svg/'+theAction.shape, function(){
		
				$('#action-'+theID).children('svg').css('transform', 'scale('+topoDog.zoomFactor+') rotate('+rotation+'deg)');
				//$('#action-'+theID+' svg path').css('fill', topoDog.activeBeing.color);
				$('#action-'+theID+' svg path').css('fill', theBeing.color);
				$('#action-'+theID).children('svg').attr('data-rot', rotation);
				//console.log(rotation);
				if(actionNote){
					$('#action-'+theID).prepend( '<span class="noteLabel glyphicon glyphicon-comment"></span>');
				}
			
			});
		}
	
		return theID;
	}
	
}

// FINE CLASSE TOPODOG
