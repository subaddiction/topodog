$(document).ready(function(){
	//localStorage.clear();
	
	
	//Pulizia tabelle assets
	loql.drop('tessels');
	loql.drop('actions');
	
	topoDogAssets();
	topoDogLauncher();
});
