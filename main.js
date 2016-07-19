
//Size settings
var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
var canvasMargin = 10;
var canvasWidth = w - canvasMargin*2;
var canvasHeight = h - canvasMargin*2;

//Animation and transition settings
var redrawCanvasInterval = 50;
var transitionObjectInterval = 5000;
var takeAction = 0;
var takeActionThreshold = 250;

//Game Flags and Settings
var gameOver = 0;
var moveNumber = 0;
var startingNumOfCircles = 10;
var sizeOfUserFigure = 100;
var sizeOfCircleMin = 10;
var sizeOfCircleMax = 80;

//Adding the canvas and creating context
var canvas = d3.select("body").append("canvas")
    .attr("id", "main-canvas")
    .attr("height", canvasHeight)
    .attr("width", canvasWidth);
var context = canvas.node().getContext("2d")

//Building a container to hold our user figure and circle settings
var circleHolder = document.createElement("custom");
var circleContainer = d3.select(circleHolder);
for(i = 0; i < startingNumOfCircles; i++) {
    addNewCircle();
}
var userFigure = circleContainer.append("circle")
    .attr("class", "userCircleNode")
    .attr("id", "userCircle")
    .attr("r", sizeOfUserFigure)
    .attr("fill", "black");

//Selecting the user figure and the circles 
var userBinding = circleContainer.selectAll(".userCircleNode");
var circleBinding = circleContainer.selectAll(".circleNode");

//Starting the animation
runTimer();

//Adding touch controls to the canvas
d3.select("#main-canvas")
    .on("touchstart", touchStart)
    .on("touchmove", touchMove)
    .on("touchend", touchEnd);

keyboardJS.bind('a', function(e) {
  console.log('a is pressed');
});

//Adds a new circle, initial placement is outside the radius of the user starting position
function addNewCircle(){
    var randomX = d3.randomUniform(sizeOfUserFigure, canvasWidth)();
    var randomY = d3.randomUniform(sizeOfUserFigure, canvasHeight)();
    var circleItem = circleContainer.append("circle")
        .attr("class", "circleNode")
        .attr("cx", randomX)
        .attr("cy", randomY)
        .attr("r", sizeOfCircleMin)
        .attr("fill", randomColor);
}

//Removes all circles except the starting circles
function removeExtraCircles(){
    circleBinding = circleContainer.selectAll(".circleNode");
    var loopCounter = 0;
    circleBinding.each(function(d) {
        if(loopCounter >= startingNumOfCircles){
            var node = d3.select(this);
            node.remove();
        }
        loopCounter = loopCounter + 1;
    });
}

function runTimer(){
    var d3timer = d3.timer(function(elapsed) {
        clearCanvas(context)
        setTransition();
        //detectCollision(d3timer, elapsed);
        drawCanvas(circleBinding, context);
    }, redrawCanvasInterval);
}

//Clear the canvas so it can be redrawn
function clearCanvas(context){
    context.beginPath();
    context.clearRect(0, 0, canvasWidth, canvasHeight);
}

function drawCanvas(circleBinding, context){
    //reselect all circles as more may have been added.    
    circleBinding = circleContainer.selectAll(".circleNode");
    circleBinding.each(function(d) {
        var node = d3.select(this);
        context.fillStyle = node.attr("fill");
        context.beginPath();
        context.arc(node.attr("cx"), node.attr("cy"), node.attr("r"), 0, 2 * Math.PI, true);
        context.fill();
        context.closePath();
    });
    userBinding.each(function(d) {
        var node = d3.select(this);
        context.fillStyle = node.attr("fill");
        context.beginPath();
        context.arc(node.attr("cx"), node.attr("cy"), node.attr("r"), 0, 2 * Math.PI, true);
        context.fill();
        context.closePath();
    });
}

//tell each circle where to move to and what color to change to next
function setTransition(){
    if(takeAction == takeActionThreshold) {
        circleBinding = circleContainer.selectAll(".circleNode");
        circleBinding.each(function(d) {
            var node = d3.select(this);
            var randomX = d3.randomUniform(0, canvasWidth)();
            var randomY = d3.randomUniform(0, canvasHeight)();
            var randomR = d3.randomUniform(sizeOfCircleMin, sizeOfCircleMax)();
            node.transition()
            .duration(transitionObjectInterval)
            .attr("cx", randomX)
            .attr("cy", randomY)
            .attr("r", randomR)
            .attr("fill", randomColor);
        });
        moveNumber = moveNumber + 1;
        takeAction = 0;
        addNewCircle();
    }
    else{
        takeAction = takeAction + 1;
    }
}

//move all circles off the canvas, called after user loses so they can re-start anywhere on the screen and not collide immediately.
function setTransitionOffCanvas(){
    circleBinding = circleContainer.selectAll(".circleNode");
    circleBinding.each(function(d) {
        var node = d3.select(this);
        node.transition()
        .duration(100)
        .attr("cx", canvasWidth)
        .attr("cy", canvasHeight)
        .attr("r", sizeOfCircleMin)
        .attr("fill", randomColor);
    });
}

function detectCollision(d3timer, elapsed){
    var currentX = [];
    var currentY = [];
    var currentColor = [];
    var currentRadius = [];
    var userX = [];
    var userY = [];
    var userColor = [];
    var userRadius = [];
    circleBinding = circleContainer.selectAll(".circleNode");
    circleBinding.each(function(d) {
        node = d3.select(this);
        currentX.push(Math.round(node.attr("cx")));
        currentY.push(Math.round(node.attr("cy")));
        currentColor.push(node.attr("fill"));
        currentRadius.push(+node.attr("r"));
    });
    userBinding.each(function(d) {
        node = d3.select(this);
        userX.push(Math.round(node.attr("cx")));
        userY.push(Math.round(node.attr("cy")));
        userColor.push(node.attr("fill"));
        userRadius.push(+node.attr("r"));
    })        
    for(i = 0; i < userX.length; i++) {
        for(h = 0; h < currentX.length; h++) {
            var dx = userX[i] - currentX[h]; 
            var dy = userY[i] - currentY[h];
            var distance = Math.sqrt(dx * dx + dy * dy);
            if(distance < userRadius[i] + currentRadius[h]){
                var numFormatter = d3.format(".1f");
                var notifyMessage = document.createElement("div");
                var notifyHtml = 'Last collision detected with circle ' + (h + 1) + ' after ' + moveNumber + ' direction changes and ' + numFormatter(elapsed/1000) + ' seconds with ' + currentX.length +  ' balls on the board.<br/>Touch message to clear.';
                notifyMessage.innerHTML = notifyHtml;
                alertify.notify(notifyMessage, 'collision', 0);
                alertify.alert('You lost with ' + currentX.length + ' balls on the board');
                setTransitionOffCanvas();
                moveNumber = 0;
                gameOver = 1;
                d3timer.stop();
                return true;
            }
        }
    }
}

//Touch controls
function touchStart() {
  d3.event.preventDefault();
  var d = d3.touches(this);
  if(gameOver == 1) { 
      //clear the board and start again.
      removeExtraCircles();
      runTimer();
      gameOver = 0;
  }
  userBinding.each(function() {
    var node = d3.select(this);
    node.attr("cx", +(d[0])[0]);
    node.attr("cy", +(d[0])[1]);
  });
}

function touchMove() {
  d3.event.preventDefault();
  var d = d3.touches(this);
  userBinding.each(function() {
    var node = d3.select(this);
    node.attr("cx", +(d[0])[0]);
    node.attr("cy", +(d[0])[1]);
  });
}

function touchEnd() {
  d3.event.preventDefault();
  //alert("Game Paused.  Close this and Touch again to continue.");
}

function keyboardMove(chX, chY) {
  userBinding.each(function() {
    var node = d3.select(this);
    node.attr("cx", +chX);
    node.attr("cy", +chY);
  });
}
