function MatchFinder(trie, gridVals) {
  this.trie = trie;
  this.gridVals = gridVals;
  this.neighbors = {};
  this.matches = [];
}

MatchFinder.prototype.defineNeighbors = function() {
  var boardWidth = Math.sqrt(this.gridVals.length);

  // define neighbors for first row
  this.setTopRowNeighbors();

  // define neighbors for middle rows
  this.setMiddleRowsNeighbors();

  // define neighbors for last row
  this.setLastRowNeighbors();
};

MatchFinder.prototype.setTopRowNeighbors = function() {
   // upper left corner:
  this.neighbors[1] = [2, 1+boardWidth, i+boardWidth+1];
  // upper row not on edges:
  for(var i=2; i<boardWidth; ++i) {
    this.neighbors[i] = [i-1, i+boardWidth-1, i+boardWidth, i+boardWidth+1, i+1];
  }
  // upper right corner:
  this.neighbors[boardWidth] = [boardWidth-1, boardWidth*2-1, boardWidth*2];
};

MatchFinder.prototype.setMiddleRowsNeighbors = function() {
  var leftEdge, centerTile, rightEdge;
  for(var row=2; row<boardWidth; ++row) {
    // left edge:
    leftEdge = (row-1)*boardWidth+1)
    this.neighbors[leftEdge] = [leftEdge-boardWidth, leftEdge-boardWidth+1, leftEdge+1,
                                leftEdge+boardWidth+1, leftEdge+boardWidth];
    for(var col=2; col<boardWidth; ++col) {
      // Tiles not on any edges:
      centerTile = (row-1)*boardWidth+col;
      this.neighbors[centerTile] = [centerTile-boardWidth-1, centerTile-boardWidth,
                                    centerTile-boardWidth+1, centerTile-1, centerTile+1,
                                    centerTile+boardWidth-1, centerTile+boardWidth,
                                    centerTile+boardWidth+1];
    }
    // right edge:
    rightEdge = row * boardWidth;
    this.neighbors[rightEdge] = [rightEdge-boardWidth-1, rightEdge-boardWidth,
                                 rightEdge-1, rightEdge+boardWidth-1, rightEdge+boardWidth];
  }
};

MatchFinder.prototype.setLastRowNeighbors = function() {
  var bottomLeft = (boardWidth-1)*boardWidth+1;
  this.neighbors[bottomLeft] = [bottomLeft-boardWidth, bottomLeft-boardWidth+1,
                                bottomLeft+1];
  for(var i=bottomLeft+1; i<(boardWidth*boardWidth); ++i) {
    this.neighbors[i] = [i-1, i-boardWidth-1, i-boardWidth, i-boardWidth+1, i+1];
  }
  var bottomRight = boardWidth*boardWidth;
  this.neighbors[bottomRight] = [bottomRight-1, bottomRight-boardWidth-1,
                                 bottomRight-boardWidth];
}

MatchFinder.prototype.searchTiles = function() {
  // use recursive backtracking to build strings to look for in the trie
  // If the prefix does not exist in the trie, stop recursing
  // Do not try to look up a prefix in the trie until it is over the min word length
}