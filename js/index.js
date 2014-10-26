$(document).ready(function(){
	//Reset totale database - DEPRECATO
	//localStorage.clear();

	//Pulizia tabelle assets
	loql.drop('tessels');
	loql.drop('actions');
	
	topoDogAssets();
	topoDogLauncher();
});
