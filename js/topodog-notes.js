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

function moveItem(objectID,x,y){


}

function deleteItem(objectID,x,y){

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
