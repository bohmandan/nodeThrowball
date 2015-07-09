/*
 * Serve content over a socket
 */

module.exports = function (io) {

/* GAME */

var roomX = 600,
    roomY = 600; // change to increase roomsize server side.
    
var ball = {
    x: 200, 
    y: 400,
    radius: 30,
    vx: 0,
    vy: 0,
    extraRight: 0
};
var bounds = {
    left: 0,
    right: roomX
};
var currentX = ball.x;
var lastX = currentX;
var currentY = ball.y;
var lastY = currentY;
var isDragging = false;
var isTouchMove = false;
var touchobj = false;
var offset;
var gravity = 10;
var bounce = 0.6;
var mousePosX = 0;
var mousePosY = 0;
var clientsConnected = 0;
var firstMultiBoundsX = roomX;
var clients = [];
var clientDragging;
var lastActionDrag;


function deleteFromArray(my_array, element) {
  position = my_array.indexOf(element);
  my_array.splice(position, 1);
}


function updateBounds() {
    
    console.log('running updateBounds - clientsConnected === ' + clientsConnected);
    var clientsLength = clients.length;
    for (var i = 0; i < clientsLength; i++) {
        // myStringArray[i]
        var extraRight = roomX * i;
        bounds.left = roomX * i;
        bounds.right = (roomX * i) + roomX;
        var playerNumber = i + 1;
        console.log('for client: ' + i);
        console.log('extraRight: ' + extraRight);
        console.log('playerNumber: ' + playerNumber);
        
        io.to(clients[i]).emit('init',
        {
            status: 'ok',
            ballObj: ball,
            boundsObj: bounds,
            extraRight: extraRight,
            playerNumber: i + 1,
            clientsLength: clientsLength
        });
        
    }
    firstMultiBoundsX = roomX * clientsLength;
    
}

function animate() {

if(isDragging === true) {

    /* ADDED */


    // throw physics for x
    lastX = currentX;
    currentX = mousePosX;
    ball.vx = (currentX - lastX) / 2;
    // throw physics for y
    lastY = currentY;
    currentY = mousePosY;
    ball.vy = (currentY - lastY) / 2;

    ball.x = mousePosX;
    ball.y = mousePosY;

}
else
{
    // ball motion and bounds testing
    ball.x += ball.vx;
    // left
    if(ball.x - ball.radius <= 0)
    {
        // reverse velocity sign
        ball.vx *= -1;
        // move ball back off the edge so it doesn't duplicate the hit detection on
        // consecutive frames
        ball.x = ball.x + (ball.radius - ball.x);
    }
    // right
    if(ball.x + ball.radius >= firstMultiBoundsX)
    {
        ball.vx *= -1;
        ball.x = ball.x - ((ball.x + ball.radius) - firstMultiBoundsX);
    }
    // top
    if(ball.y - ball.radius <= 0)
    {
        ball.vy *= -1;
        ball.y = ball.y + (ball.radius - ball.y);
    }
    // bottom
    if(ball.y + ball.radius >= roomY)
    {
        ball.vy *= -1;
        ball.vy *= bounce;
        ball.y = ball.y - ((Math.floor(ball.y) + ball.radius) - roomY);
    }
    ball.y += ball.vy;
    ball.vy = ball.vy + (gravity / 40);
    // sideways friction
    ball.vx *= 0.99;                

}
io.emit('ballPos',
    {
    ballPosY: ball.y,
    ballPosX: ball.x
});

//drawBall();
/* console.log("ball.y: "+ball.y+", ball.x: "+ball.x); */
}
setInterval(animate, 1000 / 45);

//Socket.io will call this function when a client connects,
//So we can send that client looking for a game to play,
//as well as give that client a unique ID to use so we can
//maintain the list if players.
io.on('connection', function (socket) {
        
        console.log(socket.id);
        clients.push(socket.id);
        console.log("CONNECT:" + ++clientsConnected);
        socket.userNumber = clientsConnected;
        console.log('amountOfPlayers: ' + clientsConnected);
        console.log('playerId: ' +clients.indexOf(socket.id));
    
        updateBounds(); // and emit init



        socket.on('inputPos', function (data) {
            mousePosX = data.mousePosX;
            mousePosY = data.mousePosY;
            isDragging = data.isDragging;
            // console.log('mousePosX: '+mousePosX+' mousePosY: '+mousePosY+' isDragging: '+data.isDragging+' reported by socket.id: '+socket.id);
        });
    
    /* console.log("ball.y: "+ball.y+", ball.x: "+ball.x); */

     
}); //io.sockets.on connection

io.on('disconnect', function () {

        //Useful to know when soomeone disconnects
    console.log('\t socket.io:: client disconnected ');

    deleteFromArray(clients, socket.id);
    
    updateBounds(); // and emit init
    
    console.log("DISCONNECT: ", --clientsConnected);
        //If the client was in a game, set by game_server.findGame,
        //we can tell the game server to update that game state.

}); //socket.on disconnect
    
};