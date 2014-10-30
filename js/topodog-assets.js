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
		'color':'#ffaa66',
	}
	loql.insert('tessels', terra);
	
	var erba = {
		'name':'erba',
		'color':'#99ff99',
	}
	loql.insert('tessels', erba);
	
	var acqua = {
		'name':'acqua',
		'color':'#9999ff',
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
	
	/*** AZIONI ***/
	
	var azioneDummy = {
		'name':'dummy',
		'size':'0',
		'shape':'null.svg',
	}
	loql.insert('actions', azioneDummy);
	
	var ingresso = {
		'name':'ingresso',
		'size':'3',
		'shape':'ingresso.svg',
	}
	loql.insert('actions', ingresso);
	
	var conduttore = {
		'name':'conduttore',
		'size':'3',
		'shape':'conduttore.svg',
	}
	
	loql.insert('actions', conduttore);
	
	var pipi = {
		'name':'pipi',
		'size':'3',
		'shape':'pipi.svg',
	}
	loql.insert('actions', pipi);
	
	var pipiraspata = {
		'name':'pipi+raspa',
		'size':'3',
		'shape':'pipiraspata.svg',
	}
	loql.insert('actions', pipiraspata);
	
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
	
	var chew = {
		'name':'mastica',
		'size':'3',
		'shape':'chew.svg',
	}
	loql.insert('actions', chew);
	
	var controllo = {
		'name':'controllo',
		'size':'3',
		'shape':'controllo.svg',
	}
	loql.insert('actions', controllo);
	
	var gestione = {
		'name':'gestione',
		'size':'3',
		'shape':'gestione.svg',
	}
	loql.insert('actions', gestione);
	
	var possessivita = {
		'name':'poss.',
		'size':'2',
		'shape':'possessivita.svg',
	}
	loql.insert('actions', possessivita);
	
	var area = {
		'name':'area',
		'size':'2',
		'shape':'area.svg',
	}
	loql.insert('actions', area);
	
//	newBeingElement('#ff0000', 'fido', 'dog', '');
//	newBeingElement('#00ff00', 'ettore', 'dog', '');
//	newBeingElement('#0000ff', 'gunther', 'dog', '');
	
	
}
