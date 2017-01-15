var svgPath;
var prevSegTS;
var maxSegsPerSecond = 20;

var minAreaDrawTime = 500;
var startPathTS;

var currentAreaColor = '#ff0000';

	

var startDrawTouch = function(event){
	//var touch = event.changedTouches[0];  
	//var touch = event;

	var touch = ('changedTouches' in event)?event.changedTouches[0]:event;

	//console.log(typeof(createSvgElement));

	svgPath = createSvgElement("path");
	svgPath.setAttribute("fill", currentAreaColor);
	svgPath.setAttribute("shape-rendering", "geometricPrecision");
	svgPath.setAttribute("stroke-linejoin", "round");
	svgPath.setAttribute("stroke", currentAreaColor);
	svgPath.setAttribute("style", "opacity:0.25;");

	//console.log(svgPath)

	svgPath.setAttribute("d", "M" + touch.clientX  + "," + touch.clientY);  
	svgCanvas.appendChild(svgPath);
	
	startPathTS = moment().valueOf();
	prevSegTS = moment().valueOf();
  
}

var continueDrawTouch = function(event){
    if (svgPath)
    {
    
    var touch = ('changedTouches' in event)?event.changedTouches[0]:event;
    
    //console.log(event)
    
    var newSegment = svgPath.createSVGPathSegLinetoAbs(touch.clientX, touch.clientY);
    //PER OFFSET
    //var newSegment = svgPath.createSVGPathSegLinetoAbs((touch.clientX - $("svgCanvas").offset().left), (touch.clientY - $("svgCanvas").offset().top));
    
    if(moment().valueOf() > (prevSegTS + (1000 / maxSegsPerSecond))){
    	svgPath.pathSegList.appendItem(newSegment);
    	prevSegTS = moment().valueOf();
    }


    }
}

var endDrawTouch = function(event){
    if (svgPath)
    {
    
    	if(moment().valueOf() > (startPathTS + minAreaDrawTime)){
    
		var pathData = svgPath.getAttribute("d");
		var touch = ('changedTouches' in event)?event.changedTouches[0]:event;

		pathData = pathData + " L" + touch.clientX + "," + touch.clientY
		svgPath.setAttribute("d", pathData); 

		var areaID = loql.insert('areas', {color:currentAreaColor, path:svgPath.getAttribute("d"), n:''});

		svgPath.setAttribute("data-id", areaID); 

		svgPath = null;
		
	} else {
		//distruggi path;
		svgPath.remove();
	}
	
	
    }
}

var createSvgElement = function(tagName)
{
	return document.createElementNS("http://www.w3.org/2000/svg", tagName);
}




function writeAreaNote(noteText, x, y){
	
	var newText = createSvgElement("text");
	
	//newText.setAttributeNS(null,"x",Math.random() * 200 + 50);		
	//newText.setAttributeNS(null,"y",Math.random() * 180 + 60);
	
	newText.setAttributeNS(null,"x",x);		
	newText.setAttributeNS(null,"y",y);	
	
	newText.setAttributeNS(null,"font-size","13px");
	newText.setAttributeNS(null,"fill","#000000");
	var textNode = document.createTextNode(noteText);
	newText.appendChild(textNode);
	
	document.getElementById("svgCanvas").appendChild(newText);

}



//function bindAreaActions(){
//	
//	$('#svgCanvas path').off();
//	$('#svgCanvas path').on({
//		'click':function(e){
//			loql.del('areas', $(this).attr('data-id'));
//			$(this).remove();
//		}
//	});
//	
//}


function drawSvgPaths(listenerID, svgID){

	
	var listenerElement = document.getElementById(listenerID);
	var svgCanvas = document.getElementById(svgID);
	
	listenerElement.addEventListener("mousedown", startDrawTouch, false);
	listenerElement.addEventListener("mousemove", continueDrawTouch, false);
	listenerElement.addEventListener("mouseup", endDrawTouch, false);
	
//	listenerElement.addEventListener("touchstart", startDrawTouch, false);
//	listenerElement.addEventListener("touchmove", continueDrawTouch, false);
//	listenerElement.addEventListener("touchend", endDrawTouch, false);

	
}


function unbindDrawSvgPaths(listenerID, svgID){

	var listenerElement = document.getElementById(listenerID);
	var svgCanvas = document.getElementById(svgID);

	listenerElement.removeEventListener("mousedown", startDrawTouch, false);
	listenerElement.removeEventListener("mousemove", continueDrawTouch, false);
	listenerElement.removeEventListener("mouseup", endDrawTouch, false);
	
//	listenerElement.removeEventListener("touchstart", startDrawTouch, false);
//	listenerElement.removeEventListener("touchmove", continueDrawTouch, false);
//	listenerElement.removeEventListener("touchend", endDrawTouch, false);

}
