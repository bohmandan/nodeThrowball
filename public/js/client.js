console.log('Application is starting.');

 var socket = io.connect('http://localhost:4004');

var canvas;
var ctx;
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

		ctx.clearRect(0,0,bounds.right,600);
		ctx.beginPath();
		ctx.arc(ball.x,ball.y,ball.radius,0,Math.PI * 2, false);
		ctx.stroke();
		ctx.fillStyle = 'red';	
		ctx.fill();
		ctx.closePath();

}

socket.on('init', function (data) {
	console.log(bounds);
    ball = data.ballObj;
    bounds = data.boundsObj;
    console.log(data);
    console.log(bounds);
    extraRight = data.extraRight;
    drawBall();
  });

socket.on('ballPos', function (data) {
	ball.y = data.ballPosY;
	ball.x = data.ballPosX - extraRight;
	drawBall();
});

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
	grab();
}

/* grabity / ball end */