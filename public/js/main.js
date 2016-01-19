$(function(){
	//Because I want to be able to do String.format
	if (!String.format) {
		String.format = function(format) {
			var args = Array.prototype.slice.call(arguments, 1);
			return format.replace(/{(\d+)}/g, function(match, number) { 
				return typeof args[number] != 'undefined'
				? args[number] 
				: match
				;
			});
		};
	}

	//Variables
	var socket = io();
	var $table = $('.tbl');
	var soundMap = ['a#6','f5','d#5','c#5','a#5','g#4','f4','d#4','snare_50','kick_10'];
	var size = {};
	var state = []; //[COLUMN][ROW] for easier access when iterating through
	var speed = 240;//BPM
	var animation = 'pulse';//Select an animation from animation.css, pulse works best IMO

	//Initilization 
	ion.sound({
		sounds: [
			{name: soundMap[0]},
			{name: soundMap[1]},
			{name: soundMap[2]},
			{name: soundMap[3]},
			{name: soundMap[4]},
			{name: soundMap[5]},
			{name: soundMap[6]},
			{name: soundMap[7]},
	        {name: soundMap[8]},
	        {name: soundMap[9]},
	    ],

	    // main config
	    path: "sounds/",
	    preload: true,
	    multiplay: true,
	    volume: 0.9
	});
	socket.emit('connected',{});

	//io Events
	socket.on('initialize', function(data){
		console.log('Received \'initialize\'...');
		size = data.size;
		state = data.state;
		buildTable($table, size);
		initializeTable(size, state);
		attachHandlers();
		loop(0);//Start loop
	});

	socket.on('toggle node',function(data){
		console.log('Received \'toggle node\'...');
		toggleNode(data.row, data.col);
	});

	function nodeIsClicked(row, col, socket){
		console.log('Emitting \'node clicked\'...');
		socket.emit('node clicked', {
			'row' : row,
			'col' : col
		});
	}

	//EventHandlers
	function attachHandlers(){
		$('.node').change(function(){
			var $element = $(this);
			toggleCheckbox($element);
			var ndx = idToIntArr($element.attr('id'));
			nodeIsClicked(ndx[0], ndx[1], socket);
		});
	}
	
	//Functions
	function buildTable($table,size){
		var content = '';
		var row = '<div class="tbl-row">';
		var cell = '<div class="tbl-cell">';
		var columnGroup = '<div class="tbl-col-group">';
		var column = '<div id="{0}" class="tbl-col">';
		var checkbox = '<input id={0} type="checkbox" class="node"/><label id="{0}-label" for="{0}"></label>'
		var endTag = '</div>';
		content += columnGroup;
		for (var i = 0; i < size.col; i++){
			content += String.format(column,'col-' + i) + endTag;
		}
		content += endTag;
		for (var i = 0; i < size.row; i++){
			content += row;
			for (var j = 0; j < size.col; j++){
				content += cell + String.format(checkbox,i + '-' + j) + endTag;
			}
			content+= endTag;
		}
		// console.log(content);
		$table.html(content);
	}

	function initializeTable(size, state){
		for (var i = 0; i < size.row; i++){
			for (var j = 0; j < size.col; j++){
				if (state[j][i]){
					toggleCheckbox($(String.format('#{0}', ndxToIdString(i,j))));
				}
			}
		}
	}

	function toggleNode(row,col){
		var $element = $(String.format('#{0}', ndxToIdString(row,col)));
		toggleCheckbox($element);
		state[col][row] = !state[col][row];
	}

	function idToIntArr(id){
		var arr = id.split('-');
		arr.forEach(function(element, ndx, arr){
			arr[ndx] = parseInt(element);
		});
		return arr;
	}

	function ndxToIdString(row,col){
		return row + '-' + col;
	}

	function toggleCheckbox($checkbox){
		$checkbox.prop('checked',!($checkbox.is(":checked")));
	}

	function BPMtoMilli(bpm){//Each Block is an eighth note
		return 30000/bpm;
	}

	function loop(col){
		// $('#col-' + (col-1)).removeClass('active-col');
		if (col >= size.col){
			col = 0;
		}
		// $('#col-' + col).addClass('active-col');
		// console.log('Column :: %d', col);
		var column = state[col];
		// console.log(column);
		animateColumn(column, col);	
		setTimeout(function(){loop(col+1)},BPMtoMilli(speed));
	}

	function animateColumn(colArr,col){
		for (var i = 0; i < size.row; i++){
			if (colArr[i]){
				ion.sound.play(soundMap[i]);
				$(String.format('#{0}-label',ndxToIdString(i,col))).addClass('animated ' + animation)
				.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',function(){
					$(this).removeClass('animated ' + animation);
				});
			}
		}
	}
});


