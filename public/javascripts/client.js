console.log('Application is starting.');

//var socket = io.connect(window.location.hostname);
var socket = io(); // should work according to: http://andriyadi.me/talk-develop-deploy-node-js-app-on-windows-azure/

console.log('connected via transport: '+socket.io.engine.transport.name); // should print "websocket". implement check later.

var roomX = 600,
    roomY = 600;// change to increase roomsize client side.

var canvas;
var minimap;
var ctx;
var ctxMini;
/*
var ball = {
	x: 200, 
	y: 400,
	radius: 20,
	vx: 0,
	vy: 0
}; */
var ball;
var extraRight;
var widthValue;
/*
var bounds = {
	left: 0,
	right: 600
};
*/
var bounds;
//var currentX = ball.x;
	var currentX;
//var lastX = currentX;
	var lastX;
//var currentY = ball.y;
	var currentY;
//var lastY = currentY;
	var lastY;
var isDragging = false;
var isTouchMove = false;
var touchobj = false;
var offset;
//var gravity = 5;
	var gravity;
//var bounce = 0.6;
	var bounce;
var mousePosX = 0;
var mousePosY = 0;
var lastSentX;
var lastSentY;
var lastSentAction;
var detecttouch = !! ('ontouchstart' in window) || !! ('ontouchstart' in document.documentElement) || !! window.ontouchstart || !! window.Touch || !! window.onmsgesturechange || (window.DocumentTouch && window.document instanceof window.DocumentTouch)

function drawBall() {

		ctx.clearRect(0,0,bounds.right,roomY);
		ctx.beginPath();
		ctx.arc(ball.x,ball.y,ball.radius,0,Math.PI * 2, false);
		ctx.stroke();
		ctx.fillStyle = 'red';	
		ctx.fill();
		ctx.closePath();
        
        ctxMini.fillStyle="grey";
        //ctxMini.clearRect(0,0,bounds.right,roomX/10); // rest of the play area
        ctxMini.fillRect(0,0,widthValue,roomY/10);
        ctxMini.clearRect(extraRight/10,0,roomX/10,roomY/10); // players room
		ctxMini.beginPath();
		ctxMini.arc((ball.x+extraRight)/10,ball.y/10,ball.radius/10,0,Math.PI * 2, false);
		ctxMini.stroke();
		ctxMini.fillStyle = 'red';	
		ctxMini.fill();
		ctxMini.closePath();

}

function updatePos(mousePosX, mousePosY, dragStatus) {
/*  console.log('updatePos');
    console.log('mousePosX: '+mousePosX);
	console.log('mousePosY: '+mousePosY);
	console.log('dragStatus: '+dragStatus); */
    if ((mousePosX !== lastSentX) && (mousePosY !== lastSentY) || (lastSentAction !== dragStatus)) {
        // console.log('coordinates or dragStatus new, updating...');
        socket.emit('inputPos',	{
                mousePosX: mousePosX+extraRight,
                mousePosY: mousePosY,
                isDragging: dragStatus
        });
    }
    else {
    // console.log('coordinates the same, not updating...');
    }
    lastSentX = mousePosX;
    lastSentY = mousePosY;
    lastSentAction = dragStatus;
}

function onDown(e) {
	console.log('running onDown');

	isDragging = true;
	if (isTouchMove) {
		touch = e.touches[0]; // Get the information for finger #1
		mousePosX = touch.pageX-canvas.offsetLeft;
		mousePosY = touch.pageY-canvas.offsetTop;
	}
	else {
		mousePosX = e.clientX-canvas.offsetLeft;
		mousePosY = e.clientY-canvas.offsetTop;
	}
	try
	{

		if (detecttouch) {
		    addEventListener('touchmove', function (e) {
		    	isTouchMove = true;
	        	onMove(e);
	        	e.preventDefault()
    		}, false)
		}

		addEventListener('mousemove', function(e) { 
			isTouchMove = false;
			onMove(e);
		} , false);

	}
	catch(e)
	{
		// ie
		attachEvent('mousemove', function(e) { 
			isTouchMove = false;
			onMove(e);
		} , false);
	}
	updatePos(mousePosX,mousePosY, true);
}

function onUp(e) {
	console.log('running onUp');

	isDragging = false;
	try
	{

		if (detecttouch) {
		    addEventListener('touchmove', function (e) {
		    	isTouchMove = true;
	        	onMove(e);
	        	e.preventDefault()
    		}, false)
		}

		removeEventListener('mousemove', function(e) { 
			isTouchMove = false;
			onMove(e);
		} , false);
	}
	catch(e)
	{
		// ie
		detachEvent('mousemove', function(e) { 
			isTouchMove = false;
			onMove(e);
		} , false);
	}
	updatePos(mousePosX,mousePosY, false);
}

function onMove(e) {

	if(isDragging) {
		if (isTouchMove) {
			touch = e.touches[0]; // Get the information for finger #1
			mousePosX = touch.pageX-canvas.offsetLeft;
			mousePosY = touch.pageY-canvas.offsetTop;
		}
		else {
			mousePosX = e.clientX-canvas.offsetLeft;
			mousePosY = e.clientY-canvas.offsetTop;
		}
		ball.x = mousePosX;
		ball.y = mousePosY;
		if(ball.x <= bounds.left)
			ball.x = bounds.left;
		else if(ball.x >= bounds.right)
			ball.x = bounds.right;
	updatePos(mousePosX,mousePosY, true);
	}

}

function grab()	{

	try	{

		if (detecttouch) {
			canvas.addEventListener('touchstart', function (e) {
			isTouchMove = true;
        	onDown(e);
        	e.preventDefault()
    	}, false)
 	   canvas.addEventListener('touchend', function (e) {
 	   		isTouchMove = true;
	        onUp(e);
	        e.preventDefault()
	    }, false)

 		}


		canvas.addEventListener('mousedown', function(e) {
			isTouchMove = false;
			onDown(e);
		} , false);
		canvas.addEventListener('mouseup', function(e) {
			isTouchMove = false;
			onUp(e);
		} , false);



	}
	catch(e) {

		// for IE
		canvas.attachEvent('mousedown', function(e) { 
			isTouchMove = false;
			onDown(e);
		} , false);
		canvas.attachEvent('mouseup', function(e) { 
			isTouchMove = false;
			onUp(e);
		} , false);

	}
	drawBall();
/*	setInterval(animate, 1000 / 60); */

}


/* window.onload = grab; */
window.onload = function () {
	canvas = document.getElementById('viewport');
	ctx = canvas.getContext('2d');
    minimap = document.getElementById('minimap');
    ctxMini = minimap.getContext('2d');
}

socket.on('init', function (data) {
    if (data.status === 'ok') {
        console.log(bounds);
        ball = data.ballObj;
        bounds = data.boundsObj;
        console.log(data);
        console.log(bounds);
        widthValue = (roomX/10) * data.clientsLength;
        minimap.setAttribute("width", widthValue.toString());
        extraRight = data.extraRight;
        grab();
        
        var playNumAllEl = document.getElementById('playnum-all');
        var playNumYouEl = document.getElementById('playnum-you');
        playNumAllEl.textContent = data.clientsLength.toString();
        playNumYouEl.textContent = data.playerNumber;
        
    }
    if (data.status === 'denied') {
        console.log('denied');
        var msgElement = document.getElementById("msg");
        msgElement.innerHTML = 'DENIED! Reload page please.';
    }
  });

socket.on('ballPos', function (data) {
	ball.y = data.ballPosY;
	ball.x = data.ballPosX - extraRight;
	drawBall();
});

socket.on('newServerInfo', function (data) {
	var msg = data.msg;
    console.log('Message from server: '+msg);
});

/* grabity / ball end */