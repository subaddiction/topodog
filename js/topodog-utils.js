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

	$('.action, .actionClone').each(function(){
		$(this).css({
		'width':$(this).width()*value,
		'height':$(this).height()*value,
		'margin-top':parseInt($(this).css('margin-top'))*value +'px',
		'margin-left':parseInt($(this).css('margin-left'))*value +'px'
		});
	});
	
	
	topoDog.tileSize = topoDog.tileSize*value;
	topoDog.zoomFactor = topoDog.tileSize/topoDog.originalTileSize;
	
//////	
	
//////	
//////	topoDog.zoomFactor = topoDog.tileSize/topoDog.originalTileSize;
//////	$('.object svg').each( function(){
//////		$(this).css('transform', 'scale('+topoDog.zoomFactor+')');
//////	});

	
	$('.action, .actionClone').each( function(){
		var rotation = $(this).attr('data-rot');
		$(this).css('transform', 'scale('+topoDog.zoomFactor+') rotate('+rotation+'deg)');
	});
	
	$('.action svg, .actionClone svg').each( function(){
		var rotation = $(this).attr('data-rot');
		$(this).css('transform', 'scale('+topoDog.zoomFactor+') rotate('+rotation+'deg)');
	});
	
	$('.object').each( function(){
		$(this).css('transform', 'scale('+topoDog.zoomFactor*$(this).attr('data-scale')+')');
	});
	
}

function zoomReset(){
	var resetFactor = topoDog.tileSize / topoDog.originalTileSize;
	//console.log(1/(resetFactor));
	zoomField(1/(resetFactor));

}


var play = false;
function playPresentation(status, interval){
	
	clearInterval(play);
	if(status !== false){
		if(!interval) { interval = 1000 }
		//$('#lastFrameFlag').parent().children('.t-id').click();
		presentationStep();
		play = setInterval("presentationStep()", interval);
	}
}

function presentationStep(direction){

	if(play != false){
		var stophere = $('#lastFrameFlag').parent().children('#flagStop');
		if(stophere.length >= 1){
			clearInterval(play);
			play = false;
			return;
		}
		
	}
	
	if(direction === "rew"){
		var nextFrame = $('#lastFrameFlag').parent().prevAll('.time[frame-hide="false"]:first');
		
	} else {
		var nextFrame = $('#lastFrameFlag').parent().nextAll('.time[frame-hide="false"]:first');
		
	}
	
	if(nextFrame.length < 1){
		clearInterval(play);
		//console.log("PRESENTATION END");
	} else {
		if(topoDog.lastID < topoDog.firstID){
			nextFrame.children('.t-detail').click();
		}
		nextFrame.children('.t-id').click();
		
		scroll_timeline.scrollToElement('#'+nextFrame.attr('id'), 1000, 0, 0, IScroll.utils.ease.quadratic);
	}
}

function presentationRew(){
	//$('.time:nth-child(2)').children('.t-detail').click();
	//$('.time:nth-child(2)').children('.t-id').click();
	//scroll_timeline.scrollToElement('#'+$('.time:nth-child(2)').attr('id'));
	
	var firstFrameID = $('.time[frame-hide="false"]').first().attr('id');
	$('#'+firstFrameID).children('.t-detail').click();
	$('#'+firstFrameID).children('.t-id').click();
	scroll_timeline.scrollToElement('#'+firstFrameID, 1000, 0, 0, IScroll.utils.ease.quadratic);
}

function presentationFwd(){
	//$('.time:last-child').children('.t-detail').click();
	//$('.time:last-child').children('.t-id').click();
	//scroll_timeline.scrollToElement('#'+$('.time:last-child').attr('id'));
	
	var lastFrameID = $('.time[frame-hide="false"]').last().attr('id');
	
	//$('#'+lastFrameID).children('.t-detail').click();
	$('#'+lastFrameID).children('.t-id').click();
	scroll_timeline.scrollToElement('#'+lastFrameID, 1000, 0, 0, IScroll.utils.ease.quadratic);
}

function gotoStart(){
	//var firstFrameID = $('#firstFrameFlag').parent().attr('id');
	var firstFrameID = $('#flagStart').parent().attr('id');
	scroll_timeline.scrollToElement('#'+firstFrameID, 1000, 0, 0, IScroll.utils.ease.quadratic);
	$('#'+firstFrameID).children('.t-detail').click();
	$('#'+firstFrameID).children('.t-id').click();
}

function gotoEnd(){
	//var lastFrameID = $('#lastFrameFlag').parent().attr('id');
	var lastFrameID = $('#flagStop').parent().attr('id');
	scroll_timeline.scrollToElement('#'+lastFrameID, 1000, 0, 0, IScroll.utils.ease.quadratic);
	$('#'+lastFrameID).children('.t-id').click();
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


function topoDogLauncher(){

	
	jQuery.event.swipe.min = 50;
	jQuery.event.swipe.max = 800;
	//jQuery.event.swipe.delay = 1000;
	
	/***
	//topoDog.w = ($(document).width()/topoDog.tileSize) -4;
	//topoDog.h = (($(document).height() - $('#actionsControls').height() - $('#modeControls').height()) / topoDog.tileSize) -3;
	
	var userWidth = prompt('Insert field width');
	var userHeight = prompt('Insert field height');
	topoDog.w = userWidth;
	topoDog.h = userHeight;
	***/
	
	topoDog.w = 100;
	topoDog.h = 100;
	
	//document.body.addEventListener('touchstart', function(e){ e.preventDefault(); });
	
	var firstAction = loql.select('action', '0');
	if(firstAction == null){
		topoDog.newAction(0,0,0,0,0,false);
	}
	
	loql.drop('tessels');
	loql.drop('objects');
	loql.drop('actions');
	
	topoDogAssets();
	
	topoDog.init();
	scrollBars();

}


var scroll_newDog;
var scroll_tessels
var scroll_modeControlsBox;
var scroll_actionsBox;
var scroll_timeline;

function scrollBars(){

	$('.iScrollLoneScrollbar').remove();
	
	scroll_newDog = false;
	scroll_newDog = new IScroll('#newDog', {
		scrollbars: true,
		bounce: false,
		momentum: false,
		deceleration:1,
	});
	
	
	scroll_tesselsBox = new IScroll('#tesselsBox', {
		scrollbars: true,
		scrollY: false,
		scrollX: true,
		bounce: false,
		momentum: false,
		deceleration:1,
	});
	
	scroll_sizesBox = new IScroll('#sizesBox', {
		scrollbars: true,
		scrollY: false,
		scrollX: true,	
		bounce: false,
		momentum: false,
		deceleration:1,
	});
	
	scroll_actionsBox = new IScroll('#actionsBox', {
		scrollbars: true,
		scrollY: false,
		scrollX: true,	
		bounce: false,
		momentum: false,
		deceleration:1,
	});
	
	scroll_beingsBox = new IScroll('#beingsBox', {
		scrollbars: true,
		scrollY: false,
		scrollX: true,
		bounce: false,
		momentum: false,
		deceleration:1,
	});
	
	
	scroll_modeControlsBox = false;
	scroll_modeControlsBox = new IScroll('#modeControlsBox', {
		scrollbars: true,
		scrollY: false,
		scrollX: true,
		bounce: false,
		momentum: false,
		deceleration:1,
	});
	
	scroll_timeline = false;
	scroll_timeline = new IScroll('#timelineBox', {
		scrollbars: true,
		scrollY: false,
		scrollX: true,
		bounce: false,
		momentum: false,
		deceleration:1,
	});
	
}

