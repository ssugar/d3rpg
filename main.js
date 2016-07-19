
//Size settings
var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
var canvasMargin = 10;
var canvasWidth = w - canvasMargin*2;
var canvasHeight = h - canvasMargin*2;
var horizontalCenter = canvasWidth/2;
var verticalCenter = canvasHeight/2;

//Animation and transition settings
var redrawCanvasInterval = 50;
var transitionObjectInterval = 5000;
var takeAction = 0;
var takeActionThreshold = 250;

//Game Flags and Settings
var gameOver = 0;
var moveNumber = 0;
var startingNumOfCircles = 10;
var sizeOfUserFigure = 30;
var sizeOfCircleMin = 10;
var sizeOfCircleMax = 80;

//Adding the canvas and creating context
var canvas = d3.select("body").append("canvas")
    .attr("id", "main-canvas")
    .attr("height", canvasHeight)
    .attr("width", canvasWidth);
var context = canvas.node().getContext("2d")

//Building a container to hold our user figure and circle settings
var hiddenElement = document.createElement("custom");
var objectContainer = d3.select(hiddenElement);

//for(i = 0; i < startingNumOfCircles; i++) {
//    addNewBuilding();
//}

//north south road
addNewRoad((horizontalCenter-sizeOfUserFigure*2), 0, sizeOfUserFigure*4, canvasHeight);
//east west roads
addNewRoad(0, verticalCenter/2-sizeOfUserFigure*2, canvasWidth, sizeOfUserFigure*4);
addNewRoad(50, verticalCenter*1.5-sizeOfUserFigure*2, canvasWidth, sizeOfUserFigure*4);

var userFigure = objectContainer.append("circle")
    .attr("class", "userCircleNode")
    .attr("id", "userCircle")
    .attr("cx", horizontalCenter)
    .attr("cy", (canvasHeight - (sizeOfUserFigure*2)))
    .attr("r", sizeOfUserFigure)
    .attr("fill", "black");

//Selecting the user figure and the circles 
var userBinding = objectContainer.selectAll(".userCircleNode");
var buildingBinding = objectContainer.selectAll(".buildingNode");
var roadBinding = objectContainer.selectAll(".roadNode");

//Starting the animation
runTimer();

//Adding touch controls to the canvas
d3.select("#main-canvas")
    .on("touchstart", touchStart)
    .on("touchmove", touchMove)
    .on("touchend", touchEnd);

keyboardJS.bind('w', function(e) {
  keyboardMove(0, -10);  
});
keyboardJS.bind('a', function(e) {
  keyboardMove(-10, 0);  
});
keyboardJS.bind('d', function(e) {
  keyboardMove(10, 0);  
});
keyboardJS.bind('s', function(e) {
  keyboardMove(0, 10);  
});

function addNewBuilding(){
    var randomX = d3.randomUniform(0, canvasWidth)();
    var randomY = d3.randomUniform(0, canvasHeight)();
    var randomSize = d3.randomUniform(sizeOfCircleMin, sizeOfCircleMax)();
    var building = objectContainer.append("rect")
        .attr("class", "buildingNode")
        .attr("x", randomX)
        .attr("y", randomY)
        .attr("width", randomSize)
        .attr("height", randomSize)
        .attr("fill", randomColor);
}

function addNewRoad(startX, startY, width, height){
    var road = objectContainer.append("rect")
        .attr("class", "roadNode")
        .attr("x", startX)
        .attr("y", startY)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "grey");
}

//Removes all circles except the starting circles
function removeExtraCircles(){
    buildingBinding = objectContainer.selectAll(".circleNode");
    var loopCounter = 0;
    buildingBinding.each(function(d) {
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
        drawCanvas(buildingBinding, context);
    }, redrawCanvasInterval);
}

//Clear the canvas so it can be redrawn
function clearCanvas(context){
    context.beginPath();
    context.clearRect(0, 0, canvasWidth, canvasHeight);
}

function drawCanvas(circleBinding, context){
    //reselect all circles as more may have been added.    
    buildingBinding = objectContainer.selectAll(".buildingNode");
    buildingBinding.each(function(d) {
        var node = d3.select(this);
        context.fillStyle = node.attr("fill");
        context.beginPath();
        context.rect(node.attr("x"), node.attr("y"), node.attr("width"), node.attr("height"));
        context.fill();
        context.closePath();
    });
    roadBinding = objectContainer.selectAll(".roadNode");
    roadBinding.each(function(d) {
        var node = d3.select(this);
        context.fillStyle = node.attr("fill");
        context.beginPath();
        context.rect(node.attr("x"), node.attr("y"), node.attr("width"), node.attr("height"));
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
        buildingBinding = objectContainer.selectAll(".buildingNode");
        buildingBinding.each(function(d) {
            var node = d3.select(this);
            var randomX = d3.randomUniform(0, canvasWidth)();
            var randomY = d3.randomUniform(0, canvasHeight)();
            var randomSize = d3.randomUniform(sizeOfCircleMin, sizeOfCircleMax)();
            node.transition()
            .duration(transitionObjectInterval)
            .attr("x", randomX)
            .attr("y", randomY)
            .attr("width", randomSize)
            .attr("height", randomSize)
            .attr("fill", randomColor);
        });
        moveNumber = moveNumber + 1;
        takeAction = 0;
    }
    else{
        takeAction = takeAction + 1;
    }
}

//move all circles off the canvas, called after user loses so they can re-start anywhere on the screen and not collide immediately.
function setTransitionOffCanvas(){
    buildingBinding = objectContainer.selectAll(".buildingNode");
    buildingBinding.each(function(d) {
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
    buildingBinding = objectContainer.selectAll(".buildingNode");
    buildingBinding.each(function(d) {
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
    //read in the roads
    roadBinding = objectContainer.selectAll(".roadNode");
    var roadStartX = [];
    var roadStartY = [];
    var roadEndX = [];
    var roadEndY = [];
    roadBinding.each(function() {
      var node = d3.select(this);
      roadStartX.push(+node.attr("x"));
      roadStartY.push(+node.attr("y"));
      roadEndX.push(+node.attr("width") + +node.attr("x"));
      roadEndY.push(+node.attr("height") + +node.attr("y"));
    });

    //for each user item, should only be 1
    userBinding.each(function() {
        var node = d3.select(this);
        var curX = node.attr("cx");
        var curY = node.attr("cy");
        var curR = node.attr("r");
        var nextX = +curX + +chX;
        var nextY = +curY + +chY;
        var validMove = 0;
        for(i = 0; i < roadStartX.length; i++){
            if((+curX - +curR >= +roadStartX[i] && +curX + +curR <= +roadEndX[i]) || (+nextX - +curR >= +roadStartX[i] && +nextX + +curR <= +roadEndX[i])){
                if((+curY - +curR >= +roadStartY[i] && +curY + +curR <= +roadEndY[i]) || (+nextY - +curR >= +roadStartY[i] && +nextY + +curR <= +roadEndY[i])){
                    validMove = 1;
                    console.log("move valid on road" + i);
                }
            }
            //console.log(i + ' X ' + +curX + ' ' + +curR + ' ' + +roadStartX[i] + ' ' + +roadEndX[i] + ' ' + +nextX);
            //console.log(i + ' Y ' +curY + ' ' + +curR + ' ' + +roadStartY[i] + ' ' + +roadEndY[i] + ' ' + +nextY);
        }
        if(validMove == 1){
                node.attr("cx", +curX + +chX);
                node.attr("cy", +curY + +chY);          
        }
  });
}
