var columnMax = 24;
var rowMax = 24;
var totalTiles = columnMax * rowMax;

var backgroundMap = generateMapArray(0);
var roadMap = generateMapArray(1);
var foregroundMap = generateMapArray(2);
var overlayMap = generateMapArray(3);

function generateMapArray(layerNumber){
    var mapArray = [];
    var randomTreeSeeds = [];
    for(i = 0; i < totalTiles; i++){
        var randomNum = Math.floor(Math.random() * 10);
        if(randomNum <= 2){
            randomTreeSeeds.push(1);
        }
        else{
            randomTreeSeeds.push(0);
        }
    }
    var randomRow = Math.floor(Math.random() * rowMax);
    var randomCol = Math.floor(Math.random() * columnMax);

    //BACKGROUND LAYER - GRASS AND TREES
    if(+layerNumber == 0){
        for(i = 0; i < totalTiles; i++){
            if(randomTreeSeeds[i] == 1){
                mapArray.push(3);
            }
            else{
                mapArray.push(1);
            }
        }
    }
    //ROAD LAYER - ROADS/PATHS
    else if(+layerNumber == 1) {
        for(i = 0; i < totalTiles; i++){
            //ROADS GOING DOWN A RANDOM COLUMN and ACROSS A RANDOM ROW
            if(i%columnMax == randomCol || (i >= columnMax*randomRow && i < columnMax*(randomRow+1))){
                mapArray.push(2);
                if(+backgroundMap[i+columnMax] == 3){
                    backgroundMap[i+columnMax] = 1;
                }
                if(+backgroundMap[i] == 3){
                    backgroundMap[i] = 1;
                }
            }
            else{
                mapArray.push(0);
            }
        }
    }
    //FOREGROUND LAYER - TREE TOPS
    else if(+layerNumber == 2) {
        for(i = 0; i < totalTiles; i++){
            if(+backgroundMap[i+columnMax] == 3 && +roadMap[i] != 2){
                mapArray.push(4);
            }
            else{
                mapArray.push(0);
            }
        }
    }
    //OVERLAY LAYER - BUSHES
    else {
        for(i = 0; i < totalTiles; i++){
            if(i%28 == 0 && foregroundMap[i] != 4 && roadMap[i] != 2){
                mapArray.push(5);
            }
            else{
                mapArray.push(0);
            }
        }
    }
    return mapArray;
}
