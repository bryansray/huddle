var Ractive = require('ractive'),
		superagent = require('superagent'),
		_ = require('lodash'),
		io = require('socket.io-client'),
		// socket = io('http://localhost:3000', { query: "userId=1234" }),
		helpers = require('./helpers');

var socket = io.connect('http://localhost:3000', { query: "userId=34567" });

var RoomsComponent = require('./components/rooms'),
		RoomMessagesComponent = require('./components/roomMessages'),
		RoomUsersComponent = require('./components/roomUsers');

var RoomComponent = Ractive.extend({
	template: "#room-template",

	components: {
		RoomMessages: RoomMessagesComponent,
		RoomUsers: RoomUsersComponent
	},

	oninit: function() {
	}
});

var huddle = new Ractive({
	el: '#huddle-app',
	template: '#huddle-template',
	socket: socket,

	components: { 
		Room: RoomComponent,
		RoomList: RoomsComponent,
	},

	oninit: function() {
		console.log("Initializing Huddle ...");
	},

	oncomplete: function() {
		console.log("Huddle Complete ...");
		var component = this.findComponent('RoomList');
		component.observe('activeRoom', this.activateRoom, { context: this });
	},

	activateRoom: function(room, oldRoom, keypath) {
		var currentRoom = this.get('activeRoom');
		
		if (currentRoom !== room) {
			this.set('activeRoom', room);
			socket.emit('join', { roomId: room.id });
		}
	},
});

window.onpopstate = function(event) {
	console.log("popstate: ", event.state);
}

socket.on('connect', function() {
});

socket.on('error', function(data) {
	console.log('error: ', data);
});