function drawSvgPaths(listenerID, svgID){
	
	var listenerElement = document.getElementById(listenerID);
	var svgCanvas = document.getElementById(svgID);
	var svgPath;
	
	listenerElement.addEventListener("mousedown", startDrawTouch, false);
	listenerElement.addEventListener("mousemove", continueDrawTouch, false);
	listenerElement.addEventListener("mouseup", endDrawTouch, false);

	function startDrawTouch(event){
		//var touch = event.changedTouches[0];  
		//var touch = event;

		var touch = ('changedTouches' in event)?event.changedTouches[0]:event;


		svgPath =  createSvgElement("path");
		svgPath.setAttribute("fill", "#ff0000");
		svgPath.setAttribute("shape-rendering", "geometricPrecision");
		svgPath.setAttribute("stroke-linejoin", "round");
		svgPath.setAttribute("stroke", "#ff0000");
		svgPath.setAttribute("style", "opacity:0.25;");

		svgPath.setAttribute("d", "M" + touch.clientX  + "," + touch.clientY);  
		svgCanvas.appendChild(svgPath);
	}

	function continueDrawTouch(event){
		if (svgPath){

			var touch = ('changedTouches' in event)?event.changedTouches[0]:event;

			var newSegment = svgPath.createSVGPathSegLinetoAbs(touch.clientX, touch.clientY);
			//PER OFFSET
			//var newSegment = svgPath.createSVGPathSegLinetoAbs((touch.clientX - $("svgCanvas").offset().left), (touch.clientY - $("svgCanvas").offset().top));
			svgPath.pathSegList.appendItem(newSegment);


		}
	}

	function endDrawTouch(event){
		if (svgPath){
			var pathData = svgPath.getAttribute("d");
			var touch = ('changedTouches' in event)?event.changedTouches[0]:event;

			pathData = pathData + " L" + touch.clientX + "," + touch.clientY
			svgPath.setAttribute("d", pathData);  
			svgPath = null;
		}
	}

	function createSvgElement(tagName)
	{
		return document.createElementNS("http://www.w3.org/2000/svg", tagName);
	}
}




$(document).ready(function(){

	drawSvgPaths('svgCanvas', 'svgCanvas');

});
