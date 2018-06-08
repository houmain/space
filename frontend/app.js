"use strict"

var config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scene: {
    preload: preload,
    create: create,
    update: update,
    resize: resize,
  }
};

var socket;
var game = new Phaser.Game(config);

function preload() {

  socket = new WebSocket(window.location.origin.replace(/https?/g, "ws"), "websocket");
  socket.onopen = function() {
    console.log("connected");
    socket.send('{ "action": "joinGame", "gameId": 0 }');
    socket.send('{ "something": 10 }');
    socket.send('{ "action": "sendSquadron", sourcePlanetId: 1, targetPlanetId: 2, shipIds: [1,2,3,4] }');
  };
  socket.onclose = function() {
    console.log("disonnected");
  };
  socket.onmessage = function(event) {
    console.log(event.data);
  };
  Object.seal(socket);


  this.load.image('logo', 'phaser-logo-small.png');
}

function create() {
  this.events.on('resize', resize, this);

  this.logo = this.add.sprite(game.config.width / 2, game.config.height / 2, 'logo');
  this.cameras.main.fadeIn(1000);

  document.body.addEventListener('click', goFullscreen);
}

function resize (width, height) {
  if (width === undefined) { width = this.sys.game.config.width; }
  if (height === undefined) { height = this.sys.game.config.height; }

  this.cameras.resize(width, height);
  this.logo.setPosition(width / 2, height / 2);
}

function update() {
}

window.addEventListener('resize', function (event) {
  game.resize(window.innerWidth, window.innerHeight);
}, false);

function goFullscreen() {
  var el = document.getElementsByTagName('canvas')[0];
  var requestFullScreen = el.requestFullscreen ||
    el.msRequestFullscreen || el.mozRequestFullScreen || el.webkitRequestFullscreen;
  if(requestFullScreen)
    requestFullScreen.call(el);
}
