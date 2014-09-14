// Handler for showing the swipe path when a user clicks a match
// event: the object representing the click event
//  event.target: the clicked-on DOM element
//  event.data: the object holding parameters, e.g.
//    {'obj': {'word':'cat', 'score': 3}, 'numTiles':16}
function toggleSwipePath(event) {
  var elt = $(event.target);
  $('.svg').empty();

  // If this match is not already clicked, add swipe indication
  if ($('.result.active').attr('class') !== elt.attr('class')) {
    $('.result.active').removeClass('active');
    elt.addClass('active');
    showSwipePath(event.data.obj, event.data.numTiles);
    $('.svg').attr('class', 'svg').css('zIndex', 1);
  } else { // remove swipe indication
    elt.removeClass('active');
    $('.svg').attr('class', 'svg hidden').css('zIndex', -1);
  }
}

// Repositions the svg element on top of the letters grid
function replaceSvg() {
  var firstTileOffset = $('.tile:not(.template):first').offset();
  d3.select("svg")
    .attr('style', 'top: ' + firstTileOffset.top +
          '; left: ' + firstTileOffset.left + ';');
}

// Renders the path of a given word on top of the letters grid
// wordObj: the object that holds the word and score, e.g. 
//   {'word':'cat', 'score': 3}
// numTiles: the number of tiles in the grid
function showSwipePath(wordObj, numTiles) {
  var word = wordObj.word, path = $(wordObj.path);
  var boardWidth = Math.sqrt(numTiles);
  var xPos, yPos;
  var lineData = [];

  // Figure out coordinates of each tile in the path relative to the svg
  path.each(function(index, tileNum) {
    xPos = Math.floor((tileNum-1) % boardWidth) * TILE_SIZE + TILE_SIZE/2;
    yPos = Math.floor((tileNum-1) / boardWidth) * TILE_SIZE + TILE_SIZE/2;
    lineData.push({'x': xPos, 'y': yPos});
  });

  var lineFunction = d3.svg.line()
                       .x(function(d) { return d.x; })
                       .y(function(d) { return d.y; })
                       .interpolate('linear');
  var firstTileOffset = $('.tile:not(.template):first').offset();

  var svgContainer = d3.select("svg")
                       .attr('width', boardWidth * TILE_SIZE)
                       .attr('height', boardWidth * TILE_SIZE)
                       .attr('style', 'position: absolute; top: ' +
                              firstTileOffset.top + "; left: " +
                              firstTileOffset.left + ";");

  var lineGraph = svgContainer.append("path")
                              .attr("d", lineFunction(lineData))
                              .attr("stroke", "#145CBA")
                              .attr("stroke-width", 5)
                              .attr("opacity", 0.5)
                              .attr("fill", "none");
  $('.svg').attr('class', 'svg').css('zIndex', 1);
}