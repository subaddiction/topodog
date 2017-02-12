// topoDog
// Requires:
//	loql.js

topoDog = {

	id: '',
	w: 100,
	h: 100,
	tileSize: 12,
	originalTileSize: 12, // altri valori: 4,8
	zoomFactor:1,
	paintSize: 1,
	itemSize: 1,
	
	mode: 'tessel', //tessel, erase, insert, editItems, editActions
	//pathMode: 'new', //new, addPoint, edit
	selectedObject: 0,
	selectedTessel: 0,
	selectedAction: 0,
	selectedItem: 0,
	activeBeing: false,
	theNewAction: false,
	orientBegin: false,
	
	movingAction: false,
	rotatingAction: false,
	
	timestamp: function(){
		var now = new Date().getTime();
		return now;
	},
	
	//containers
	sceneId: 'scenario',
	tilesId: 'grid',
	
	firstID: 0,
	lastID: 1,
	
	isApp: function(){
		if(typeof(cordova) == 'undefined'){
			return false;
		} else {
			return true;
		}
	},
	
	
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
			var itemsW = (oneItemW + (4 * oneItemM)) * (items.length);
			$('#itemsControls').width(itemsW+'px');
			
			$('#itemsControls a').on({
				'click': function(){
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
		
		
		$('#beings a').remove();
	
		var beings = loql.select('beings');
		if(!beings){
			return;
		}
		
		for(i=0;i<beings.length;i++){
		
			
			var currentBeing = loql.select('beings', beings[i]);
			
			var tag = '<a class="being" href="javascript:;" data-id="'+currentBeing.id+'" data-color="'+currentBeing.color+'" style="background:'+currentBeing.color+';border:3px solid '+currentBeing.color+'">';
			
			//console.log(currentBeing.show);
			//console.log(typeof(currentBeing.show));
			if(currentBeing.show < 1){
				tag += '<span class="flagHide glyphicon glyphicon-eye-close"></span>';
			}
			tag += '<span class="beingName">';
				if(currentBeing.image != ''){
					tag += '<div class="beingImg"><img class="photo" src="'+currentBeing.image+'" /></div>';
					tag += '<div class="beingTxt">'+currentBeing.name+'</div>'
				} else {
					tag += '<div class="beingTxtOnly">'+currentBeing.name+'</div>';
				}
			tag += '</span>';
			tag +='</a>';
			
			//console.log(tag);
			
			$('#beings').append(tag);
		}
		
		var oneBeingW = $('#beings a').innerWidth();
		var oneBeingM = parseInt($('#beings a').css('margin-right'));
		var beingsW = (oneBeingW + (4 * oneBeingM)) * (beings.length);
		$('#beings').width(beingsW+'px');
		
//		$('#beings a').off();
//		$('#beings a').click(function(){
//			$('#actions a').css('background', $(this).attr('data-color'));
//			topoDog.activeBeing = loql.select('beings', $(this).attr('data-id'));
//		});
		
		$('#beings a').on({
		
			'click': function(e){
				e.preventDefault();
				$('#actions a').css('background', $(this).attr('data-color'));
				topoDog.activeBeing = loql.select('beings', $(this).attr('data-id'));
			},
			
			'taphold dblclick': function(e){
				e.preventDefault();
				
				//$(this).addClass('editing');
				
				$('#showBeing').remove();
				
				if($(this).hasClass('editing')){
					$(this).removeClass('editing');
					return;
				} else {
					$(this).addClass('editing');
				}
				
				var id = $(this).attr('data-id');
				var color = $(this).attr('data-color');
				
				var showBeingModal = '<div id="showBeing" style="background:'+color+';">';
				
				showBeingModal += '<a class="deleteB" href="javascript:;"><span class="glyphicon glyphicon-remove-circle"></span></a>';
				showBeingModal += '<br />';
				showBeingModal += '<a class="editB" href="javascript:;"><span class="glyphicon glyphicon-edit"></span></a>';
				showBeingModal += '<br />';
				
				showBeingModal += '<a class="showB" href="javascript:;"><span class="glyphicon glyphicon-eye-open"></span></a>';
				showBeingModal += '<br />';
				showBeingModal += '<a class="hideB" href="javascript:;"><span class="glyphicon glyphicon-eye-close"></span></a>';
				showBeingModal += '</div>';
				$(this).prepend(showBeingModal);
				
				
				$('.deleteB').on({
					'click': function(){
						if(confirm("Sei sicuro di voler ELIMINARE questo cane?\nQuesta azione ELIMINA tutti i dati relativi al cane e NON può essere annullata!")){
							
							//topoDog.hideBeing(id);
							topoDog.deleteActionsById(1, id);
							topoDog.regenTimeline();
							scrollBars();
						
						}
						
						//console.log(id);
					}
				});
				
				
				$('.editB').on({
					'click': function(){
						
						topoDog.editDogForm(id);
						//$('.being').removeClass('editing');
						//console.log(id);
					}
				});
				
				
				
				$('.showB').on({
					'click': function(){
						
						$(this).parent().parent().children('.flagHide').remove();
						topoDog.showBeing(id);
						//$('.being').removeClass('editing');
						//console.log(id);
					}
				});
				$('.hideB').on({
					'click': function(){
						$(this).parent().parent().children('.flagHide').remove();
						$(this).parent().parent().prepend('<span class="flagHide glyphicon glyphicon-eye-close"></span>');
						topoDog.hideBeing(id);
						//$('.being').removeClass('editing');
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
			var actionsW = (oneActionW + (4 * oneActionM)) * ($('#actions a').length);
			$('#actions').width(actionsW+'px');
			
			$('#actions a').on({
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
	
	
	drawAreas:function(){
			var thePath;
			var theArea;
	
			var areas = loql.select('areas');
	
			for(i in areas){
	
				theArea = loql.select('areas', areas[i]);
	
				thePath = null;
				thePath = createSvgElement("path");
				thePath.setAttribute("fill", theArea.color);
				thePath.setAttribute("shape-rendering", "geometricPrecision");
				thePath.setAttribute("stroke-linejoin", "round");
				thePath.setAttribute("stroke", theArea.color);
				thePath.setAttribute("style", "opacity:0.25;");
		
				thePath.setAttribute("d", theArea.path);
				thePath.setAttribute("data-id", areas[i]);
				thePath.setAttribute("data-note", (areas[i].n == null)?'':areas[i].n);
		
				document.getElementById('svgCanvas').appendChild(thePath);
		
			}
	},
	
	startControls: function(){
		
		$('.flagHide').remove();
		
		var oneControlW = $('#modeControls li').width();
		var oneControlM = parseInt($('#modeControls li').css('margin-right'));
		var controlsW = ((oneControlW + (4 * oneControlM))) * ($('#modeControls li:not(.hidden)').length);
		$('#modeControls').width(controlsW+'px');
		
		var oneTesselW = $('#tessels a').width();
		var oneTesselM = parseInt($('#tessels a').css('margin-right'));
		var tesselsW = (oneTesselW + (4 * oneTesselM)) * ($('#tessels a').length);
		$('#tessels').width(tesselsW+'px');
		
		var oneSizeW = $('#sizes a').width();
		var oneSizeM = parseInt($('#sizes a').css('margin-right'));
		var sizesW = (oneSizeW + (4 * oneSizeM)) * ($('#sizes a').length);
		$('#sizes').width(sizesW+'px');
		
		var oneItemSizeW = $('#itemsSizes a').width();
		var oneItemSizeM = parseInt($('#itemsSizes a').css('margin-right'));
		var itemsSizesW = (oneItemSizeW + (4 * oneItemSizeM)) * ($('#itemsSizes a').length);
		$('#itemsSizes').width(sizesW+'px');
		
		$('body').off();
		$('body').on({
			'mousemove touchmove taphold': function(e){
				e.preventDefault();
			}
		});
		
		$('#openScenarioForm').off();
		$('#openScenarioForm').on({
			'click': function(){
				topoDog.scenarioForm();
			}
		});
		
		$('#openNewDogForm').off();
		$('#openNewDogForm').on({
			'click': function(){
				topoDog.newDogForm();
			}
		});
		
		$('#showAllPrevious').off();
		$('#showAllPrevious').on({
			'click': function(){
				var switched = $(this).attr('data-switched');
				if(switched == '0'){
					$('.action').addClass('forceShow');
					$(this).attr('data-switched', '1');
					$(this).children('span').removeClass('glyphicon-eye-close').addClass('glyphicon-eye-open');
				} else {
					$('.action').removeClass('forceShow');
					$(this).attr('data-switched', '0');
					$(this).children('span').removeClass('glyphicon-eye-open').addClass('glyphicon-eye-close');
				}
			}
		});
		
		$('#showStats').off();
		$('#showStats').on({
			'click': function(){
				showStats();
			}
		});
		
		$('#zoomMore').off();
		$('#zoomMore').on({
			'click': function(){
				if(topoDog.mode != 'view3d'){
					$('#presentation').click();
				}
				zoomField(1.1);
			}
		});
		
		$('#zoomLess').off();
		$('#zoomLess').on({
			'click': function(){
				if(topoDog.mode != 'view3d'){
					$('#presentation').click();
				}
				zoomField(.9);
			}
		});
		
		$('#zoomReset').off();
		$('#zoomReset').on({
			'click': function(){
				if(topoDog.mode != 'view3d'){
					$('#presentation').click();
				}
				zoomReset();
			}
		});
		
		$('.colorSelect').each(
			function(){
				$(this).css('background', $(this).attr('data-color'));
			}
		);
		
		$('.colorSelect').off();
		$('.colorSelect').on({
			'click': function(){
				$('.colorSelect').css('outline', '0');
				$('.colorSelect').css('opacity', '0.6');
				$('.colorSelect').css('box-shadow', 'none');
				$('#newDog_color').val($(this).attr('data-color'));
				$(this).css('outline', '8px solid #000000');
				$(this).css('opacity', '1');
				
				
			}
		});
		
		$('.pan').off();
		$('.pan').on({
			'mouseup touchend': function(){
				gridPan(parseInt($(this).attr('data-panx')), parseInt($(this).attr('data-pany')));
			}	
		});
		
		$('#closeNewDogForm').off();
		$('#closeNewDogForm').on({
			'click': function(){
				$('#newDog').hide(0);
				$('#modeControlsBox, #scenario, #bottomControls').show(0);
				scrollBars();
			}
		});
		
		$('#submitNewDogForm').off();
		$('#submitNewDogForm').on({
			'click': function(){
				topoDog.insertBeing();
			}
		});
		
		$('#sizes a').off();
		$('#sizes a').on({
			'click': function(){
				topoDog.setPaintSize($(this).attr('data-size'), $(this));
			}
		});
		
		$('#itemsSizes a').off();
		$('#itemsSizes a').on({
			'click': function(){
				topoDog.setItemSize($(this).attr('data-size'), $(this));
			}
		});
		
		$('#filechooser').off();
		document.getElementById('filechooser').addEventListener('change', handleFileSelect, false);
////		$('#filechooser').on({
////			'change': function(){
////				handleFileSelect(this);
////			}
////		});
		
		
		
		
	},
	
	modeControls: function(){
		$('a.mode').off();
		$('a.mode').on({
			'click': function(){
				//zoomReset(); //Stucks all in cordova app!!!
				
				//console.log('modeSwitch');
				
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
	},
	
	timelineControls: function(){
		
		$('#presentationControls').remove();
		
		var showhide = '';
		showhide += '<div id="presentationControls">';
		
		showhide += '<div id="play">';
		showhide += '<a class="play" href="javascript:;" data-interval="2500">2.5</a>';
		showhide += '<a class="play" href="javascript:;" data-interval="5000">5.0</a>';
		showhide += '<a class="play" href="javascript:;" data-interval="10000">10</a>';
		showhide += '<a class="play" href="javascript:;" data-interval="15000">15</span></a>';
		showhide += '</div>';
		
		
		showhide += '<div>';
		showhide += '<a class="stepRew" href="javascript:;" title="Torna indietro di una azione"><span class="glyphicon glyphicon-step-backward"></span></a>';
		showhide += '<a class="showplay" href="javascript:;" title="Play (selezionare intervallo di tempo tra una azione e la successiva)"><span class="glyphicon glyphicon-play"></span></a>';
		showhide += '<a class="pause" href="javascript:;" title="Pausa"><span class="glyphicon glyphicon-pause"></span></a>';
		showhide += '<a class="stepFwd" href="javascript:;" title="Vai avanti di una azione"><span class="glyphicon glyphicon-step-forward"></span></a>';
		showhide += '</div>';
		
		showhide += '<div>';
		showhide += '<a class="rew" href="javascript:;" title="Vai alla prima azione registrata"><span class="glyphicon glyphicon-fast-backward"></span></a>';
		showhide += '<a class="gotoStart" href="javascript:;" title="Vai all\'azione selezionata come INIZIO"><span class="glyphicon glyphicon-step-backward"></span></a>';
		showhide += '<a class="gotoEnd" href="javascript:;" title="Vai all\'azione selezionata come FINE"><span class="glyphicon glyphicon-step-forward"></span></a>';
		showhide += '<a class="fwd" href="javascript:;" title="Vai all\'ultima azione registrata"><span class="glyphicon glyphicon-fast-forward"></span></a>';
		
		showhide += '</div>';
		
		showhide += '<div>';
		showhide += '<a class="showAllTimeline" href="javascript:;"><span class="glyphicon glyphicon-eye-open"></span></a>';
		showhide += '<a class="hideFromTimeline" href="javascript:;"><span class="glyphicon glyphicon-eye-close"></span></a>';
		
		showhide += '<a class="makeSnapshot" href="javascript:;" title="Crea una immagine in tasparenza delle azioni visibili."><span class="glyphicon glyphicon-camera"></span></a>';
		showhide += '<a class="clearSnapshot" href="javascript:;" title="Elimina l\'immagine in trasparenza."><span class="glyphicon glyphicon-remove"></span></a>';
		showhide += '</div>';
		
		showhide += '</div>';
		
		$('#timelineBox').append(showhide);
		
		
		$('.showplay').off();
		$('.showplay').on({
			'click': function(e){
				e.preventDefault();
				$('#play').slideToggle();
			}
		});
		
		$('.play').off();
		$('.play').on({
			'click': function(e){
				e.preventDefault();
				playPresentation(true, $(this).attr('data-interval'));
				$('#play').slideToggle();
			}
		});
		
		$('.pause').off();
		$('.pause').on({
			'click': function(e){
				e.preventDefault();
				playPresentation(false);
			}
		});
		
		$('.fwd').off();
		$('.fwd').on({
			'click': function(e){
				e.preventDefault();
				presentationFwd();
			}
		});
		
		$('.rew').off();
		$('.rew').on({
			'click': function(e){
				e.preventDefault();
				presentationRew();
			}
		});
		
		$('.stepFwd').off();
		$('.stepFwd').on({
			'click': function(e){
				e.preventDefault();
				presentationStep();
			}
		});
		
		$('.stepRew').off();
		$('.stepRew').on({
			'click': function(e){
				e.preventDefault();
				presentationStep("rew");
			}
		});
		
		$('.gotoStart').off();
		$('.gotoStart').on({
			'click': function(e){
				e.preventDefault();
				gotoStart();
			}
		});
		
		$('.gotoEnd').off();
		$('.gotoEnd').on({
			'click': function(e){
				e.preventDefault();
				gotoEnd();
			}
		});
		
		$('.makeSnapshot').off();
		$('.makeSnapshot').on({
			'click': function(e){
				e.preventDefault();
				topoDog.snapShot();
			}
			
		});
		
		$('.clearSnapshot').off();
		$('.clearSnapshot').on({
			'click': function(e){
				e.preventDefault();
				topoDog.clearSnapShot();
			}
			
		});
		
		$('.showAllTimeline').off();
		$('.showAllTimeline').on({
			'click': function(e){
				e.preventDefault();
				$('.time').attr('frame-hide', 'false');
				scrollBars();
			}
			
		});
		
		$('.hideFromTimeline').off();
		$('.hideFromTimeline').on({
			'click tap': function(e){
				e.preventDefault();
				var beings = loql.select('beings');
				if(beings){
					for(i=0;i<beings.length;i++){
					
						if($('[data-bid='+beings[i]+']').attr('being-hide') == 'true'){
							$('.time[data-bid='+beings[i]+']').attr('frame-hide', 'true');
						} else {
							$('.time[data-bid='+beings[i]+']').attr('frame-hide', 'false');
						}
					}
				}
				scrollBars();
			}
			
			
		});
		
		
	},
	
	
	highlightAction: function(id){
		var hl = $('#'+id).clone().attr('id', 'hl-'+id);
		$('#grid').append(hl);
		var rot = $('#hl-'+id+' > svg').attr('data-rot');
		$('#hl-'+id+' > svg').animate({
			transform:'scale(4) rotate('+rot+'deg)',
			//transform:'scale(4) rotate(0deg)',
			opacity:0,
		}, 1000, function(){
			$('#hl-'+id).remove();
		});
	},
	
	init: function(){
		var row = 0;
		var col = 0;

		
//		$('#'+this.tilesId).width((this.w*this.tileSize)+'px');
//		$('#'+this.tilesId).height((this.h*this.tileSize)+'px');
//		
//		
//		$('#bgCanvas').attr('width', (this.w*this.tileSize));
//		$('#bgCanvas').attr('height', (this.h*this.tileSize));

//		$('#bgCanvas').css('margin-bottom', -(this.h*this.tileSize));
//		
//		$('#snapshot').css('width', (this.w*this.tileSize));
//		$('#snapshot').css('height', (this.h*this.tileSize));

		$('#'+this.tilesId).css('width', '100vw');
		$('#'+this.tilesId).css('height', '100vh');;
		
		
		$('#bgCanvas, #svgCanvas').attr('width', ($('#'+this.tilesId).width()));
		$('#bgCanvas, #svgCanvas').attr('height', ($('#'+this.tilesId).height()));
		
			
		$('#bgCanvas').css('margin-bottom', -($('#'+this.tilesId).height()));
		
		$('#snapshot').css('width', ($('#'+this.tilesId).width()));
		$('#snapshot').css('height', ($('#'+this.tilesId).height()));
		
		
		
		
		// Load all tiles, objects, beings actions
		this.drawTexture();
		this.loadTessels();
		
		
		this.timelineControls();
		var actions = loql.select('action');
		if(actions){
			this.regenTimeline();
		} else {
			$('.time').remove();
		}
		
		if(this.isApp()){
			$('.zoomMore, .zoomLess, .zoomReset').addClass('hidden');
		}
		
		this.startControls();
		this.modeControls();
		

		this.loadItems(0,false);
		this.loadActions(1,false);
		this.loadBeings();
		
		
		this.drawItems();
		this.drawActions();
		this.drawAreas();
		
		
		
	},
	
	modeSwitch: function(mode){
		
		
		if(this.mode == 'tessel' && mode != 'tessel'){
			//alert('Salvo texture');
			this.saveTexture();
		}
		
		if(mode){
			topoDog.mode = mode;
		}
		
		$('#scenario').off();
		$('#grid').off();
		$('.object').off();
		$('.action').off();
		
		if(mode != 'view3d' && mode != 'notes'){
			$('#grid').css({
				'transform':'rotate3d(1, 0, 0, 0deg) rotate(0deg)',
			});
		}
		
		
		$('#tesselControls').addClass('ctrlH');
		$('#itemsControlsBox').addClass('ctrlH');
		$('#actionsControls').addClass('ctrlH');
		$('#moveControls').addClass('ctrlH');
		$('#rotateControls').addClass('ctrlH');
		$('#editControls').addClass('ctrlH');
		$('#noteControls').addClass('ctrlH');
		$('#dataControls').addClass('ctrlH');
		$('#areaControls').addClass('ctrlH');
		$('#timelineBox').addClass('ctrlH');
		$('#helpBox').addClass('ctrlH');
		
		
		
		$('#svgCanvas').css('z-index', 0);
	
		
		switch(topoDog.mode){
			
			case 'tessel':
				
				$('#tesselControls').removeClass('ctrlH');
				
				
				var theTessel = loql.select('tessels', topoDog.selectedTessel.toString());
				var paintColor = theTessel.color;
				
				var gridCanvas = document.getElementById("bgCanvas");
				var ctx = gridCanvas.getContext("2d");
				ctx.lineCap = "round";
				ctx.lineJoin = "round";
				
				var X;
				var Y;
				var lastX;
				var lastY;
				
				var restartPath = true;
				
				//$('#grid').off();
				$('#grid').on({
				
					'mousemove touchmove': function(e){
						
						e.preventDefault();
						
						lastX = X;
						lastY = Y;
						
						var tesselSize = topoDog.originalTileSize * topoDog.paintSize;
						var tesselZoom = topoDog.tileSize * topoDog.paintSize;
						
						if(e.originalEvent.touches){
							var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
							

							X = touch.pageX - ($(this).offset().left) - (tesselSize/2);
							Y = touch.pageY - ($(this).offset().top) - (tesselSize/2);
							
							//ctx.fillStyle = paintColor;
							//ctx.fillRect(X, Y, tesselSize, tesselSize);
							if(restartPath == false){
								ctx.beginPath();
								ctx.moveTo(lastX, lastY);
								ctx.lineTo(X, Y);
								ctx.closePath();
								ctx.strokeStyle = paintColor;
    								ctx.lineWidth   = tesselSize;
								ctx.stroke();
							} else {
								restartPath = false;
							}
							
						} else {
							var button = (typeof(e.buttons) != "undefined") ? e.buttons : e.which;
							if(button==1){
							
								var touch = e.originalEvent;
								X = touch.clientX - ($(this).offset().left) - (tesselSize/2);
								Y = touch.clientY - ($(this).offset().top) - (tesselSize/2);
							
							
							
							
								//ctx.fillStyle = paintColor;
								//ctx.fillRect(X, Y, tesselSize, tesselSize);
							
								if(restartPath == false){
									ctx.beginPath();
									ctx.moveTo(lastX, lastY);
									ctx.lineTo(X, Y);
									ctx.closePath();
									ctx.strokeStyle = paintColor;
    									ctx.lineWidth   = tesselSize;
									ctx.stroke();
								} else {
									restartPath = false;
								}
								
							}
						}
						
						
						
					},
					
					'mouseup touchend': function(e){
						
						e.preventDefault();
						restartPath = true;
						
					}
				});
				
				
				
			break;
			
			case 'insertItems':
				
				$('#itemsControlsBox').removeClass('ctrlH');
				
				//$('#grid').off();
				$('#grid').on({
					'click': function(e){
						
						if(topoDog.selectedObject === false){
							return;
						}
						if(e.originalEvent.touches){
							var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
						
							var X = touch.pageX - ($(this).offset().left);
							var Y = touch.pageY - ($(this).offset().top);
						
							topoDog.newItem(topoDog.selectedObject,X,Y,false);
						
						} else {
							var button = (typeof(e.buttons) != "undefined") ? e.buttons : e.which;
							if(button==0 || button==1){
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
				
				
				$('#actionsControls').removeClass('ctrlH');
				
				
				var X = 0;
				var Y = 0;
				var startX = 0;
				var startY = 0;
				var endX = 0;
				var endY = 0;
				var rotation = 0;
				topoDog.theNewAction = false;
				
				//$('#grid').off();
				$('#grid').on({
				
					'mousedown touchstart': function(e){
				
						e.preventDefault();
						
						if(topoDog.activeBeing === false){
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
						

						if(topoDog.theNewAction === false){
							
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
							
							if(topoDog.activeBeing === false){
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
			
			case 'moveActions':
				
				$('#moveControls').removeClass('ctrlH');
				
				var X = 0;
				var Y = 0;
				var offset = parseInt($('.action').width()) / 2;
				topoDog.movingAction = false;
				
				//$('.action').off();
				$('.action').on({
					
					'taphold dblclick':function(e){
						
						e.preventDefault();
						
						X = parseInt($(this).css('margin-left')) - offset;
						Y = parseInt($(this).css('margin-top')) - offset;
					
						//console.log(X);
						//console.log(Y);
						
						$(this).css('background', '#cccccc');
						$(this).css('z-index', '9999');
					
						topoDog.moveAction = true;
						
						
						$(this).on({
					
						'mousemove touchmove': function(e){
						
							e.preventDefault();
						
							if(e.originalEvent.touches){
								var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
								X = touch.pageX - offset;
								Y = touch.pageY - offset;
							} else {
								var touch = e.originalEvent;
								X = touch.pageX - offset;
								Y = touch.pageY - offset;
							}
						
							if(topoDog.moveAction != false){
						
								$(this).css('margin-left', X+'px');
								$(this).css('margin-top', Y+'px');
						
							}
						},
					
						'mouseup touchend': function(e){
				
							e.preventDefault();
						
							topoDog.moveAction = false;
							$(this).css('background', '');
							$(this).css('z-index', '');
							
							
							var record = loql.select('action', $(this).attr('data-id'));
							//console.log(record);
							record.x = X + offset;
							record.y = Y + offset;
							
							loql.set('action', $(this).attr('data-id'), record);
							
						},
						
						})
					
					}
					
					
					
					
				});
			break;
			
			case 'rotateActions':
				
				$('#rotateControls').removeClass('ctrlH');
				
				var offset = parseInt($('.action').width()) / 2;
				
				//$('.action').off();
				$('.action').on({
					'mousemove touchmove': function(e){
						e.preventDefault();
					},
					
					'taphold':function(e){
						
						e.preventDefault();
						
						var startX = 0;
						var startY = 0;
						var endX = 0;
						var endY = 0;
						var rotation = 0;
						var actionId = $(this).attr('data-id');
						topoDog.rotatingAction = true;
						
						
						startX = parseInt($(this).css('margin-left')) + offset;
						startY = parseInt($(this).css('margin-top')) + offset;
						
						
						$(this).css('background', '#cccccc');
						$(this).css('z-index', '9999');
						
						$('#grid').on({
							
							'mousemove touchmove':function(e){
								e.preventDefault();
								
								
								if(e.originalEvent.touches){
									var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
									endX = touch.pageX;
									endY = touch.pageY;
								} else {
									var touch = e.originalEvent;
									endX = touch.pageX;
									endY = touch.pageY;
								}
						
								if(topoDog.rotatingAction != false){
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
								
							
									$('#action-'+actionId).children('svg').css('transform', 'scale('+topoDog.zoomFactor+') rotate('+rotation+'deg)');
									$('#action-'+actionId).children('svg').attr('data-rot', rotation);
								}
								
							},
							
							'mouseup touchend':function(e){
								e.preventDefault();
								
								topoDog.rotatingAction = false;
								
								var record = loql.select('action', actionId);
								//console.log(record);
								record.r = rotation;
							
								loql.set('action', actionId, record);
								
								$('#action-'+actionId).css('background', '');
								$('#action-'+actionId).css('z-index', '');
								
							}
						});
						
					}
				});
					
				
			break;
			
			case 'editActions':
				
				$('#editControls').removeClass('ctrlH');
				
				//$('.object').off();
				$('.object').on({
					'mouseup touchend': function(e){
						e.preventDefault();
						
						var objectID = $(this).attr('data-id');
						//if(confirm('Vuoi eliminare questo oggetto? [id:'+objectID+']')){
							
							loql.del('object', objectID);
							$(this).remove();
							topoDog.sumActions();
						//}
					}
				});
				
				//$('.action').off();
				$('.action').on({
					'mouseup touchend': function(e){
						e.preventDefault();
						//alert('muovi,ruota,elimina');
						var actionID = $(this).attr('data-id');
						//if(confirm('Vuoi eliminare questa azione? [id:'+actionID+']')){
							
							loql.del('action', actionID);
							$('#frame-'+actionID).remove();
							$(this).remove();
							topoDog.sumActions();
						//}
					}
				});
				
				
//////				$('.object *, .action *').on({
//////					'click mousedown mouseup touchstart touchend mousemove touchmove': function(e){
//////						e.preventDefault();
//////					}
//////				});

				
			break;
			
			case 'manageData':
				$('#dataControls').removeClass('ctrlH');
				$('#exportData').hide(0);
				$('#dataexportData').hide(0);
				$('#export').show();
				$('#dataexport').show();
			
			break;
			
			
			case 'drawAreas':
				
				$('#areaControls').removeClass('ctrlH');
				
				$('#svgCanvas').css('z-index', 9);
				
				
				$('.areaColor').each(function(){
					$(this).css('background', $(this).attr('data-color'));
				});
				
				$('.areaColor[data-color='+currentAreaColor+']').addClass('active');
				
				$('#svgCanvas').off();
				$('#svgCanvas').on({
					'mousemove touchmove':function(e){
						e.preventDefault();
					}
				});
				
				$('#areaDraw').off();
				$('#areaDraw').on({
					'click':function(){
					
						$('#areaControlsButtons a').removeClass('active');
						$(this).addClass('active');
						
						unbindDrawSvgPaths('svgCanvas', 'svgCanvas');
						drawSvgPaths('svgCanvas', 'svgCanvas');
						
						$('.areaColor').off();
						$('.areaColor').on({
							'click':function(){
								$('.areaColor').removeClass('active');
								$(this).addClass('active');
								
								currentAreaColor = $(this).attr('data-color');
							}
							
							
						});
						
					}
				});
				
				$('#areaNote').off();
				$('#areaNote').on({
					'click':function(){
						
						unbindDrawSvgPaths('svgCanvas', 'svgCanvas');
						
						$('#areaControlsButtons a').removeClass('active');
						$(this).addClass('active');
					
						//drawSvgPaths('svgCanvas', 'svgCanvas');
						
						
						$('#svgCanvas path').off();
						$('#svgCanvas path').on({
							'click':function(e){
								
								areaID = $(this).attr('data-id');
								var theArea = loql.select('areas', areaID);
							
								var noteForm = '<div id="noteForm">';
								noteForm += '<textarea rows="3" cols="24">'+theArea.n+'</textarea>';
								noteForm += '<a id="saveNote" href="javascript:;" data-id="'+areaID+'">';
								noteForm += '<span class="glyphicon glyphicon-ok"></span>';
								noteForm += '</a>';
								noteForm += '</div>';
						
								//$('#action-'+actionID).prepend(noteForm);
								$('#areaControls').prepend(noteForm);
						
								$('#saveNote').on({
									'click touchstart':function(){
										topoDog.addAreaNote(areaID);
										//$('.action').attr('data-note', false);
									}
								});
							}
						});
						
					}
				});
				
				$('#areaDelete').off();
				$('#areaDelete').on({
					'click':function(){
						
						unbindDrawSvgPaths('svgCanvas', 'svgCanvas');
						
						$('#areaControlsButtons a').removeClass('active');
						$(this).addClass('active');
				
						$('#svgCanvas path').off();
						$('#svgCanvas path').on({
							'click':function(e){
								loql.del('areas', $(this).attr('data-id'));
								$(this).remove();
							}
						});
					}
				});
				
				

				
				
				
				//bindAreaActions();
				
				
			
			break;
			
			
			case 'view3d':
				
				
				var actions = loql.select('action');
				
				if(actions){
					$('#timeline').width(($('.time').width() + 2) * (actions.length));
				}
				$('#timelineBox').removeClass('ctrlH');
				
				
				
				
				var closeNote = false;
				//$('.action').off();
				$('.action').on({
					
					'click':function(){
						//console.log($(this).attr('data-id'));
						if(closeNote == true){
							$('#noteShow, #noteForm').remove();
							$('.action').attr('data-note', false);
							closeNote = false;
						} else {
							$('#frame-'+$(this).attr('data-id')).children('.t-id').click();
							scroll_timeline.scrollToElement('#frame-'+$(this).attr('data-id'), 1000, 0, 0, IScroll.utils.ease.quadratic);
							closeNote = true;
						}
					},
					
					'taphold': function(e){
						e.preventDefault();
						$('#noteShow').remove();
						$('.action').attr('data-note', false);
						$(this).attr('data-note', 'true');
						//alert('muovi,ruota,elimina');
						var actionID = $(this).attr('data-id');
						var noteAction = loql.select('action', actionID);
						if(noteAction.n){
							var currentNote = noteAction.n;
						} else {
							return;
						}
						
						var leftOffset = $(this).width()*-1;
						var topOffset = $(this).height()*-1;
						var noteShow = '<div id="noteShow" style="margin-top:-'+topOffset+'px;margin-left:'+leftOffset+'px;">';
						//noteForm += '<textarea rows="3" cols="24">'+currentNote+'</textarea>';
						noteShow += '<div class="clearfix">';
						noteShow += currentNote;
						noteShow += '</div>';
						noteShow += '<a id="closeNote" href="javascript:;">';
						noteShow += '<span class="glyphicon glyphicon-remove"></span>';
						noteShow += '</a>';
						noteShow += '</div>';
						
						
						closeNote = true;
						$('#action-'+actionID).prepend(noteShow);
						//$('#timelineBox').prepend(noteShow);
//////							$('#noteShow').on({
//////								'mouseup touchend':function(e){
//////									e.preventDefault();
//////									return false;
//////								}
//////							});
						
					
					}
				});
				
				
			
				var rotZ = 0;
				var rotX = 0;
				
				$('#scenario').css('perspective', ((topoDog.h+topoDog.w)/2)*topoDog.tileSize);
				
				//$('#scenario').off();
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
				
				
				
				
				
				$('.time').off();
				$('.time').on({
					
					'taphold dblclick': function(e){
						e.preventDefault();
						//console.log('start/stop here');
						$('#stopHere').off();
						$('#flagDialog').remove();
						
						
						var flagDialog = '';
						flagDialog += '<div id="flagDialog">';
						flagDialog += '<a href="javascript:;" id="startHere">';
						flagDialog += '<span class="glyphicon glyphicon-step-forward"></span>';
						flagDialog += '</a>';
						flagDialog += '<a href="javascript:;" id="stopHere">';
						flagDialog += '<span class="glyphicon glyphicon-step-backward"></span>';
						flagDialog += '</a>';
						flagDialog += '<a href="javascript:;" id="cancelStop">';
						flagDialog += '<span class="glyphicon glyphicon-remove"></span>';
						flagDialog += '</a>';
						flagDialog += '</div>';
						$(this).prepend(flagDialog);
						
						$('#startHere').on({
							'click': function(e){
								e.preventDefault();
								$('#flagStart').remove();
								var flagStart = '';
								flagStart += '<span id="flagStart">';
								flagStart += '<span class="glyphicon glyphicon-step-forward"></span>';
								flagStart += '</span>';
								//$(this).parent().parent().addClass('stop');
								$(this).parent().parent().prepend(flagStart);
								$(this).parent().remove();
							}
						
						});
						
						$('#stopHere').on({
							'click': function(e){
								e.preventDefault();
								$('#flagStop').remove();
								var flagStop = '';
								flagStop += '<span id="flagStop">';
								flagStop += '<span class="glyphicon glyphicon-step-backward"></span>';
								flagStop += '</span>';
								//$(this).parent().parent().addClass('stop');
								$(this).parent().parent().prepend(flagStop);
								$(this).parent().remove();
							}
						
						});
						
						$('#cancelStop').on({
							'click': function(e){
									e.preventDefault();
									$('#flagDialog').remove();
								}
						});
					}
				
				});
				
				$('.time .t-id').off();
				$('.time .t-id').on({
					'click touchstart': function(e){
						e.preventDefault();
						topoDog.lastID = parseInt($(this).parent().attr('data-id'));
						
						
							
							for(i=0;i<actions.length;i++){
								var action = loql.select('action', actions[i]);
								if(topoDog.lastID >= actions[i] && topoDog.firstID <= actions[i]){
									//$('#action-'+actions[i]).show(0);
									$('#action-'+actions[i]).attr('time-hide', 'false');
								} else {
									//$('#action-'+actions[i]).hide(0);
									$('#action-'+actions[i]).attr('time-hide', 'true');
								}
							}
							
							topoDog.highlightAction('action-'+topoDog.lastID);
							
							$('#lastFrameFlag').remove();
							var lastFrameFlag = '<div id="lastFrameFlag"><span class="glyphicon glyphicon-step-forward"></span></div>';
							$('.time[data-id='+topoDog.lastID+']').append(lastFrameFlag);
							
							if(topoDog.lastID < topoDog.firstID){
								$('.time[data-id='+topoDog.lastID+']').children('.t-detail').click();
							}
						
					},
					
					
				});
				
				$('.time .t-detail').off();
				$('.time .t-detail').on({
					'click touchstart': function(e){
						e.preventDefault();
						topoDog.firstID = parseInt($(this).parent().attr('data-id'));
						
						
							
							for(i=0;i<actions.length;i++){
								var action = loql.select('action', actions[i]);
								if(topoDog.firstID > actions[i]){
									//$('#action-'+actions[i]).hide(0);
									$('#action-'+actions[i]).attr('time-hide', 'true');
								} else {
									if(actions[i] <= topoDog.lastID){
										//$('#action-'+actions[i]).show(0);
										$('#action-'+actions[i]).attr('time-hide', 'false');
									}
								}
							}
							
						$('#firstFrameFlag').remove();
						var firstFrameFlag = '<div id="firstFrameFlag"><span class="glyphicon glyphicon-step-backward"></span></div>';
						$('.time[data-id='+topoDog.firstID+']').append(firstFrameFlag);
						
						//riporto in pari lastframeflag se piu indietro
						if(topoDog.lastID < topoDog.firstID){
							$('.time[data-id='+topoDog.firstID+']').children('.t-id').click();
						}
						
						
						
					}
				
				});
				
				
				$('.hideFromTimeline').click();
				//presentationRew();
				
			break;
			
			case 'notes':
			
				$('#noteControls').removeClass('ctrlH');
				//$('.action').off();
				$('.action').on({
					'mouseup touchend': function(e){
						e.preventDefault();
						$('#noteForm, #noteShow').remove();
						$('.action').attr('data-note', false);
						$(this).attr('data-note', 'true');
						
						var actionID = $(this).attr('data-id');
						var noteAction = loql.select('action', actionID);
						if(noteAction.n){
							var currentNote = noteAction.n;
						} else {
							var currentNote = '';
						}
						
						var leftOffset = $(this).width()/2;
						var topOffset = $(this).height()/2;
						//var noteForm = '<div id="noteForm" style="margin-top:-'+topOffset+'px;margin-left:'+leftOffset+'px;">';
						var noteForm = '<div id="noteForm">';
						noteForm += '<textarea rows="3" cols="24">'+currentNote+'</textarea>';
						noteForm += '<a id="saveNote" href="javascript:;" data-id="'+actionID+'">';
						noteForm += '<span class="glyphicon glyphicon-ok"></span>';
						noteForm += '</a>';
						noteForm += '</div>';
						
						//$('#action-'+actionID).prepend(noteForm);
						$('#noteControls').prepend(noteForm);
						
						$('#saveNote').on({
							'click touchstart':function(){
								topoDog.addNote($(this).attr('data-id'));
								$('.action').attr('data-note', false);
							}
						});
					},
					
					'touchmove': function(e){
						e.preventDefault();
					}
				});
			
			break;
			
			case 'help':
			
				$('#helpBox').removeClass('ctrlH');
				$('a.mode').off();
				$('a.mode').on({
					'taphold dblclick': function(){
						$('#help').html($(this).attr('title'));
					},
					
					'mouseup touchend': function(){
						$('a.mode').off();
						topoDog.modeControls();
					}
				});
				
				$('#help').html($('#inlineHelp').attr('title'));
			break;
			
			
		}
		
		
		
		scrollBars();
	
	},
	
	sumActions:function(){
		var somma = loql.select('action');
		$('#somma').html(somma.length - 1);
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
	
	
	addAreaNote: function(areaID){
		
//		var label = $('# path[data-id='+areaID+']').children('.noteLabel').html();
//		if(!label){
//			$('#action-'+actionID).prepend('<span class="noteLabel glyphicon glyphicon-comment"></span>');
//		}
		
		var noteArea = loql.select('areas', areaID);
		noteArea.n = $('#noteForm textarea').val();
		
//		if(!noteArea.n){
//			$('# path[data-id='+areaID+']').children('.noteLabel').remove();
//		}
		
		//console.log(noteAction);
		loql.set('areas', areaID, noteArea);
		$('#noteForm').remove();
	},
	
	setPaintSize: function(size, elem){
		topoDog.paintSize = size;
		$('#sizes a').css('border', '3px solid #000000');
		$(elem).css('border', '3px solid #ffffff');
	
	},
	
	setItemSize: function(size, elem){
		topoDog.itemSize = size;
		$('#itemsSizes a').css('border', '3px solid #000000');
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
	
	
	scenarioForm:function(){
		$('#modeControlsBox, #scenario, #bottomControls').hide(0);
		$('#scenarioForm').show(0);
		
		var locationSettings = loql.select('locationSettings', 0) || {};
		$('#scenario_name').val(locationSettings.name);
		$('#scenario_data').val(locationSettings.data);
		$('#scenario_setting').val(locationSettings.setting);
		$('#scenario_evento').val(locationSettings.evento);
		
		scrollBars();
		
		
		$('#submitScenarioForm').off();
		$('#submitScenarioForm').on({
			'click': function(){
				
				theSettings = {
					name: $('#scenario_name').val(),
					data: $('#scenario_data').val(),
					setting: $('#scenario_setting').val(),
					evento: $('#scenario_evento').val(),
				}
				
			
				loql.set('locationSettings', '0', theSettings);
				
				$('#scenarioForm').hide(0);
				$('#modeControlsBox, #scenario, #bottomControls').show(0);
				
			}
		});
		
		$('#closeScenarioForm').off();
		$('#closeScenarioForm').on({
			'click': function(){
				$('#scenarioForm').hide(0);
				$('#modeControlsBox, #scenario, #bottomControls').show(0);
				scrollBars();
			}
		});
		
		
	},
	
	newDogForm: function(){
		
		$('#newDog_castrato').hide();
		$('#newDog_sterilizzata').hide();
		
		$('#newDog_color').val('');
		$('#newDog_name').val('');
		$('#newDog_image').val('');
		$('#photo').attr('src', 'img/defaultDog.png');
		$('#newDog_eta').val('');
		$('#newDog_peso').val('');
		$('#newDog_razza').val('');
		$('#newDog_prov').val('');
		$('#newDog_status').val('');
		$('#newDog_sesso').val('');
		$('#newDog_castrato').val('');
		$('#newDog_sterilizzata').val('');
		$('#newDog_alimentazione').val('');
		
		
		$('#modeControlsBox, #scenario, #bottomControls').hide(0);
		$('#newDog').show(0);
		
		topoDog.dogFormFields();
		
		scrollBars();
	},
	
	editDogForm: function(id){
		
		var theBeing = loql.select('beings', id);
		//console.log(theBeing);
		
		$('#newDog_color').val(theBeing.color);
		$('#newDog_name').val(theBeing.name);
		$('#photo').attr('src', theBeing.image);
		
		$('#newDog_eta').val(theBeing.eta);
		$('#newDog_peso').val(theBeing.peso);
		$('#newDog_razza').val(theBeing.razza);
		$('#newDog_prov').val(theBeing.prov);
		$('#newDog_status').val(theBeing.status);
		$('#newDog_sesso').val(theBeing.sesso);
		$('#newDog_castrato').val(theBeing.cast);
		$('#newDog_sterilizzata').val(theBeing.ster);
		$('#newDog_alimentazione').val(theBeing.alim);
		
		
		//$('.colorSelect[data-color='+theBeing.color+']').click();
		
		$('#submitNewDogForm').hide(0);
		$('#submitEditDogForm').show(0);
		
		topoDog.dogFormFields();
		
		$('#submitEditDogForm').off();
		$('#submitEditDogForm').on({
			'click': function(){
				//topoDog.insertBeing();
				
				theBeing = {
					id: id, 
					color: $('#newDog_color').val(),
					name: $('#newDog_name').val(),
					image: $('#photo').attr('src'),
					eta: $('#newDog_eta').val(),
					peso: $('#newDog_peso').val(),
					razza: $('#newDog_razza').val(),
					prov: $('#newDog_prov').val(),
					status: $('#newDog_status').val(),
					sesso: $('#newDog_sesso').val(),
					cast: $('#newDog_castrato').val(),
					ster: $('#newDog_sterilizzata').val(),
					alim: $('#newDog_alimentazione').val(),
				}
				
				loql.set('beings', id, theBeing);
				
				topoDog.loadBeings();
				topoDog.drawActions();
				topoDog.regenTimeline();
				
				
				$('#newDog').hide(0);
				$('#modeControlsBox, #scenario, #bottomControls').show(0);
				$(this).hide(0);
				$('#submitNewDogForm').show(0);
				scrollBars();
			}
		});
		
		
		$('#modeControlsBox, #scenario, #bottomControls').hide(0);
		$('#newDog').show(0);
		scrollBars();
	},
	
	dogFormFields: function(){
		
		$('select').off();
		$('select').on({
			'change': function(){
			scroll_newDog.refresh();
			}
		
		});
		
		switch($('#newDog_sesso').val()){
			case 'M':
				$('#newDog_castrato').show();
				$('#newDog_sterilizzata').hide();
			break;
			
			case 'F':
				$('#newDog_castrato').hide();
				$('#newDog_sterilizzata').show();
			break;
			
			default:
				$('#newDog_castrato').hide();
				$('#newDog_sterilizzata').hide();
		
		}
		
		
		$('#newDog_sesso').off();
		$('#newDog_sesso').on({
			'change': function(){
				
				switch($(this).val()){
					case 'M':
						$('#newDog_castrato').show();
						$('#newDog_sterilizzata').hide();
					break;
					
					case 'F':
						$('#newDog_castrato').hide();
						$('#newDog_sterilizzata').show();
					break;
					
					default:
						$('#newDog_castrato').hide();
						$('#newDog_sterilizzata').hide();
				
				}
				
				scroll_newDog.refresh();
				
			}
		});
		
	},
	
	insertBeing:function(){
		
		newBeing = {
			color: $('#newDog_color').val(),
			name: $('#newDog_name').val(),
			image: $('#photo').attr('src'),
			eta: $('#newDog_eta').val(),
			peso: $('#newDog_peso').val(),
			razza: $('#newDog_razza').val(),
			prov: $('#newDog_prov').val(),
			status: $('#newDog_status').val(),
			sesso: $('#newDog_sesso').val(),
			cast: $('#newDog_castrato').val(),
			ster: $('#newDog_sterilizzata').val(),
			alim: $('#newDog_alimentazione').val(),
		}
		
		
		if(!newBeing.name){
			alert('Please insert a name!');
			return false;
		}
		if(!newBeing.color){
			alert('Please select a color!');
			return false;
		}
		
		
		$('#newDog').hide(0);
		$('#modeControlsBox, #scenario, #bottomControls').show(0);
		
		
		
		var newBeingID = loql.insert('beings', newBeing);
		this.loadBeings();
		scrollBars();
		return newBeingID;
		
		
		//this.newBeingElement(color, name, type, image, eta, peso, razza);
	},
	
	/*****
	newBeingElement: function(color, name, type, image){
		// insert new being in topoDog.beings
	
		// insert new being_id in localstorage
		newBeing = {
			'color':color,
			'name':name,
			'type':type,
			'image':image,
			'show': 1,
		}
		var newBeingID = loql.insert('beings', newBeing);
		this.loadBeings();
		scrollBars();
		return newBeingID;
	},
	*****/
	
	showBeing: function(id){
		//$('#beings > a[data-id='+id+']').show();
		//$('div[data-bid='+id+']').show();
		
		var theBeing = loql.select('beings', id);
		theBeing.show = 1;
		loql.set('beings', id, theBeing);
		
		$('div[data-bid='+id+']').attr('being-hide', 'false');
		$('#showBeing').remove();
	},
	
	hideBeing: function(id){
		//$('#beings > a[data-id='+id+']').show();
		//$('div[data-bid='+id+']').hide();
		
		var theBeing = loql.select('beings', id);
		theBeing.show = 0;
		loql.set('beings', id, theBeing);
		
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
	
	snapShot: function(){
	
		//duplicare step visibili in #snapshot
		
		$('.action[time-hide=false]').each(function(){
			var snapAction = $(this).clone();
			snapAction.attr('id', '');
			snapAction.removeClass('action');
			snapAction.addClass('actionClone');
			$('#snapshot').append(snapAction);
		});
		
		$( '.makeSnapshot' ).css('background', '#ffffff');
		setTimeout("$( '.makeSnapshot' ).css('background', '#000000');", 500);
		
	},
	
	clearSnapShot: function(){
		$('#snapshot .actionClone').remove();
	},
	
	timeHide: function(){
		$('.action').attr('time-hide', 'true');
	},
	
	timeShow: function(){
		$('.action').attr('time-hide', 'false');
	},
	
	tdExport: function(){
		
		this.saveTexture();
	
		var content = JSON.stringify(localStorage);
		
		uriContent = "data:application/octet-stream," + encodeURIComponent(content);
		
		var now = new Date();
		var filename = 'scenario-'+now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate()+'_'+now.getHours()+'-'+now.getMinutes()+'.json';
		
		
		/*****
		if (typeof window.requestFileSystem != 'undefined') {
				//alert(cordova.file.externalRootDirectory);
				//var sdCardPath = cordova.file.externalRootDirectory;
				
				
				var sdCardPath = cordova.file.externalRootDirectory.replace('file\:\/\/', '');
				//var sdCardPath = cordova.file.externalDataDirectory.replace('file\:\/\/', '');
				//alert(sdCardPath);
				
				GapFile.writeFile(sdCardPath+filename, content, function(){
					alert('Esportazione completata.');
				}, function(){
					alert('Esportazione non riuscita.');
				});
				
				

		} else {
			//Assuming we are in a browser
			$('#export').hide('0');
			$('#exportData').show('0');
			$('#exportData').attr('download', filename);
			$('#exportData').attr('href', uriContent);
			$('#exportData').off();
			$('#exportData').on({
				'click': function(){
					$('#exportData').hide(0);
					$('#export').show(0);
				}
			
			});
			//alert('NO FS');
		
		}
		*****/
		
		//Always assuming we are in a browser
		$('#export').hide('0');
		$('#exportData').show('0');
		$('#exportData').attr('download', filename);
		$('#exportData').attr('href', uriContent);
		$('#exportData').off();
		$('#exportData').on({
			'click': function(){
				$('#exportData').hide(0);
				$('#export').show(0);
			}
		
		});
		
	
	},
	
	
	tdImportDialog: function(){
		
		var fileData = '';
		
//		if (typeof window.requestFileSystem != 'undefined') {
//		
//			window.plugins.mfilechooser.open([], function (uri) {
//				
//				//alert(uri);
//				
//				GapFile.readFile(uri, true, function(data){
//				
//					fileData = data;
//					//alert(fileData);
//					topoDog.tdImport(fileData);
//				}, function(){
//					alert('Non riesco a leggere questo file.');
//				});
//			}, function (error) {
//				alert(error);
//			});
//		} else {
//			//Assuming we are in a browser
//			//alert('NO FS');
//			$('#filechooser').click();
//		}
		
		//Always assuming we are in a browser
		//alert('NO FS');
		$('#filechooser').click();
		

	
	},
	
	
	
	tdImport: function(fileData){
		
		localStorage.clear();
	
		var content = JSON.parse(fileData);
		
		//alert(content);
		for(var k in content){
			localStorage.setItem(k, content[k]);
		}
		
		
		topoDogLauncher();
		
	},
	
	tdReset: function(resetCanvas){
		
		//Svuoto database locale
		localStorage.clear();
		
		//Elimino tutti i beings e tutte le actions dalla DOM
		$('.object').remove();
		$('.action').remove();
		
		$('#svgCanvas path').remove();
		
		
		
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
		
		
		var theScale;
		if(nodb != false){
			var theID = nodb;
			var selectedItem = loql.select('object', theID);
			theScale = selectedItem.s;
		} else {
			var values = {
				'oid':objectID,
				'x':x,
				'y':y,
				's':this.itemSize
			}
			theID = loql.insert('object', values);
			theScale = this.itemSize;
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
		$('#grid').append('<div id="object-'+theID+'" class="object '+theItem.name+'" data-id="'+theID+'" data-scale="'+theScale+'" style="position:absolute;width:'+Isize+'px;height:'+Isize+'px;margin-top:'+ImarginTop+'px;margin-left:'+ImarginLeft+'px;"></div>');
	
		$('#object-'+theID).load('./svg/'+theItem.shape, function(){
			$('#object-'+theID).css('transform', 'scale('+theScale+')');
		});
	
	
	
	
	},



 	newAction: function(actionID,bid,x,y,rotation,nodb){
		
		var theAction = loql.select('actions', actionID);
				
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
			
			if(theAction.name == 'dummy'){
				return false;
			}
			
			var action = values;
			var being = loql.select('beings', action.bid);
			
			if(!being){
				return false;
			}
			
			//var hours = date.getHours(); var minutes = date.getMinutes(); var seconds = date.getSeconds(); // will display time in 21:00:00 format var formattedTime = hours + ':' + minutes + ':' + seconds;
			
			var date = new Date(action.t);
			var humanDate = date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate();
			var humanTime = date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
			var tag = '';
			
			tag += '<div id="frame-'+theID+'" class="time" data-id="'+theID+'" data-bid="'+action.bid+'">';
			tag += '<div class="t-id" style="background:'+being.color+';">';
			tag += '<div style="background:'+being.color+';">'+being.name+'</div>';
			tag += '<div style="background:'+being.color+';">'+theID+'</div>';
			tag += '</div>';
			tag += '<div class="t-detail">'+humanDate+'<br />['+humanTime+']</div>';
			tag += '</div>'
			$('#timeline').append(tag);
			
			
		}

		
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
		
				$('#action-'+theID).children('svg').css(
					{
						'transform': 'scale('+topoDog.zoomFactor+') rotate('+rotation+'deg)',
					}
				);
				//$('#action-'+theID+' svg path').css('fill', topoDog.activeBeing.color);
				$('#action-'+theID+' svg path').css('fill', theBeing.color);
				$('#action-'+theID).children('svg').attr('data-rot', rotation);
				//console.log(rotation);
				if(actionNote){
					$('#action-'+theID).prepend( '<span class="noteLabel glyphicon glyphicon-comment"></span>');
				}
				if(theBeing.show == 0){
					$('#action-'+theID).attr('being-hide', 'true');
				}
			
			});
		}
		
		topoDog.lastID = theID;
		//console.log(topoDog.lastID);
		
		topoDog.sumActions();
		
		return theID;
	},
	
	
	deleteActionsById: function(id, bid){
		var actions = loql.select('action');
//		console.log(actions);
			
		var currentAction = loql.select('action', id);
		//console.log('checking action '+ id);
		var next = id+1;
		
		//console.log(currentAction);
		
		if(!currentAction){
			//console.log('no action with id '+ id);
			if(id < actions[actions.length -1]){
				//console.log(id +' < '+ actions[actions.length -1]);
				topoDog.deleteActionsById(next, bid);
			} else {
				loql.del('beings', bid);
				topoDog.loadBeings();
				$('.action').remove();
				topoDog.drawActions();
			}
		} else {
			//console.log('>>> found action with id '+ id);
			if(currentAction.bid == bid){
				loql.del('action', id);
				//console.log('>>> deleted action '+ id);
			
			}
			topoDog.deleteActionsById(next, bid);
		}
		
		topoDog.sumActions();
		
	},
	
	regenTimeline: function(){
		$('#timeline > .time').remove();
		// [RI]Costruisco la timeline
		var actions = loql.select('action');
		if(actions.length <= 1){
			return;
		}
		
		
		
		for(i=0;i<actions.length;i++){
			
			var action = loql.select('action', actions[i]);
			var being = loql.select('beings', action.bid);
			var theAction = loql.select('actions', action.aid);
			
			if(!being){
				continue;
			}
			
			//var hours = date.getHours(); var minutes = date.getMinutes(); var seconds = date.getSeconds(); // will display time in 21:00:00 format var formattedTime = hours + ':' + minutes + ':' + seconds;
			
			var date = new Date(action.t);
			var humanDate = date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate();
			var humanTime = date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
			var tag = '';
			
			if(theAction.name != 'dummy'){
			
				tag += '<div id="frame-'+actions[i]+'" class="time" data-id="'+actions[i]+'" data-bid="'+action.bid+'">';
				tag += '<div class="t-id" style="background:'+being.color+';">';
				tag += '<div style="background:'+being.color+';">'+being.name+'</div>';
				tag += '<div style="background:'+being.color+';">'+actions[i]+'</div>';
				tag += '</div>';
				tag += '<div class="t-detail">'+humanDate+'<br />['+humanTime+']</div>';
				tag += '</div>'
				$('#timeline').append(tag);
			
			}
		
		}			
					
	
	},
	
	exportData: function(){
		var actions = loql.select('action');
		var output = "id,data,cane,interazione,x,y,direzione,note";
		for(i=0;i<actions.length;i++){
			var action = loql.select('action', actions[i]);
			var being = loql.select('beings', action.bid);
			var theAction = loql.select('actions', action.aid);
			
			if(!being){
				continue;
			}
			
			action.x = Math.round(action.x,0);
			action.y = Math.round(action.y,0);
			action.r = Math.round(action.r,0);
			
			var date = new Date(action.t);
			var humanDate = date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate();
			var humanTime = date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
			
			var nota = "";
			if (action.n){
				nota = action.n;
			}
			
			if(theAction.name != 'dummy' && theAction.name != 'area' && theAction.name != 'possessivita'){
				output += "\n"+actions[i]+","+humanDate+" "+humanTime+","+being.name+","+theAction.name+","+action.x+","+action.y+","+action.r+","+"\""+nota+"\"";
			}
		}
		
		//return output;
		uriContent = "data:application/octet-stream," + encodeURIComponent(output);
		
		var now = new Date();
		var filename = 'dati-'+now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate()+'_'+now.getHours()+'-'+now.getMinutes()+'.csv';
		
		
		/*****
		if (typeof window.requestFileSystem != 'undefined') {
				//alert(cordova.file.externalRootDirectory);
				//var sdCardPath = cordova.file.externalRootDirectory;
				
				
				var sdCardPath = cordova.file.externalRootDirectory.replace('file\:\/\/', '');
				//var sdCardPath = cordova.file.externalDataDirectory.replace('file\:\/\/', '');
				//alert(sdCardPath);
				
				GapFile.writeFile(sdCardPath+filename, output, function(){
					alert('Esportazione dati completata.');
				}, function(){
					alert('Esportazione dati non riuscita.');
				});
				
				

		} else {
			//Assuming we are in a browser
			$('#dataexport').hide('0');
			$('#dataexportData').show('0');
			$('#dataexportData').attr('download', filename);
			$('#dataexportData').attr('href', uriContent);
			$('#dataexportData').off();
			$('#dataexportData').on({
				'click': function(){
					$('#dataexportData').hide(0);
					$('#dataexport').show(0);
				}
			
			});
			//alert('NO FS');
		}
		*****/
		
		//Always assuming we are in a browser
		$('#dataexport').hide('0');
		$('#dataexportData').show('0');
		$('#dataexportData').attr('download', filename);
		$('#dataexportData').attr('href', uriContent);
		$('#dataexportData').off();
		$('#dataexportData').on({
			'click': function(){
				$('#dataexportData').hide(0);
				$('#dataexport').show(0);
			}
		
		});
		
		
		
	},
	
	
	exportStats: function(){
	
		var actionsTable = loql.select('actions');
		var actionsData = [];

		for(i in actionsTable){
			var theAction = loql.select('actions', actionsTable[i]);
			actionsData.push(
				{
					//id: theAction.id,
					name: theAction.name,
					f_int: 0,
					f_ster: 0,
					m_int: 0,
					m_cast: 0,
					tot: 0,
				}
			);
		}
		


		
		var actions = loql.select('action');
		var output = "azione,femmina_int,femmina_ster,maschio_int,maschio_castr,totale";
		
		for(i=0;i<actions.length;i++){
			var action = loql.select('action', actions[i]);
			var being = loql.select('beings', action.bid);
			//var theAction = loql.select('actions', action.aid);
			
			if(!being || !being.sesso){
				continue;
			}
			
			if(being.sesso == 'F'){
				if(being.ster == ''){
					actionsData[action.aid].f_int++;
				} else if(being.ster == 'ster'){
					actionsData[action.aid].f_ster++;
				}
			}
		
			if(being.sesso == 'M'){
				if(being.cast == ''){
					actionsData[action.aid].m_int++;
				} else if(being.cast == 'cast'){
					actionsData[action.aid].m_cast++;
				}
			}
			
			actionsData[action.aid].tot++;
		}
		
		//console.log(actionsData);
		
		for(i in actionsData){
			if(actionsData[i].name != 'dummy' && theAction.name != 'area' && theAction.name != 'possessivita'){
				output += "\n"+
				actionsData[i].name+","+
				actionsData[i].f_int+","+
				actionsData[i].f_ster+","+
				actionsData[i].m_int+","+
				actionsData[i].m_cast+","+
				actionsData[i].tot+",";
			}
			
		}
		
		//////////////////////////////////////////////////////////////////////////
		
		uriContent = "data:application/octet-stream," + encodeURIComponent(output);
		
		var now = new Date();
		var filename = 'statistiche-'+now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate()+'_'+now.getHours()+'-'+now.getMinutes()+'.csv';
		
		
		//Always assuming we are in a browser
//		$('#statsexport').hide('0');
//		$('#statsexportData').show('0');
//		$('#statsexportData').attr('download', filename);
//		$('#statsexportData').attr('href', uriContent);
//		$('#statsexportData').off();
//		$('#statsexportData').on({
//			'click': function(){
//				$('#statsexportData').hide(0);
//				$('#statsexport').show(0);
//			}
//		
//		});

		//Always assuming we are in a browser
		$('#dataexport').hide('0');
		$('#dataexportData').show('0');
		$('#dataexportData').attr('download', filename);
		$('#dataexportData').attr('href', uriContent);
		$('#dataexportData').off();
		$('#dataexportData').on({
			'click': function(){
				$('#dataexportData').hide(0);
				$('#dataexport').show(0);
			}
		
		});

	}
	
	
}

// FINE CLASSE TOPODOG
