var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = 4000;
var gridSize = {
	row : 10,
	col : 24
};
var gridState = buildEmptyGridState(gridSize); //[COLUMN][ROW] for easier iterating in client

server.listen(port, function(){
	console.log("Server listening on port %d...", port);
})

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){
	socket.on('connected', function(data){
		console.log('Received \'connected\'...');
		console.log('Emitting \'initialize\'...');
		socket.emit('initialize', {
			size : gridSize,
			state : gridState
		});
	});

	socket.on('node clicked', function(data){
		console.log('Received \'node clicked\'...');
		console.log('Emitting \'toggle node\'...');
		toggleNodeState(data.row,data.col);
		io.emit('toggle node', data);
	});
});

function buildEmptyGridState(size){
	var state = [];
	for (var i = 0 ; i < size.col; i++){
		state.push([]);
		for (var j = 0; j < size.row; j++){
			state[i].push(false);
		}
	}
	return state;
}

function toggleNodeState(row, col){
	gridState[col][row] = !gridState[col][row];
}