
/* 
  Constructor for a MatchFinder object
  trie: the trie in which to search for matches
  gridVals: an array of values representing the grid
  neighbors: the dictionary representing the neighbor tiles for each tile position
  matches: the list of matching words
*/
function MatchFinder(trie, gridVals) {
  this.trie = trie;
  this.gridVals = gridVals;
  this.neighbors = {};
  this.matches = [];
}

// Constructs a dictionary that maps the tile positions to the positions of their neighbors
MatchFinder.prototype.defineNeighbors = function() {
  var boardWidth = Math.sqrt(this.gridVals.length);

  // define neighbors for first row
  this.setTopRowNeighbors();

  // define neighbors for middle rows
  this.setMiddleRowsNeighbors();

  // define neighbors for last row
  this.setLastRowNeighbors();
};

// Sets the neighbors of the tiles in the first row
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

// Sets the neighbors of tiles not in the first or last row
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

// Sets the neighbors of tiles in the last row
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

// Sets all the matches found based on the grid values and trie
MatchFinder.prototype.searchTiles = function() {
  var prefix = '', letter, usedTiles = [];
  for(var tileNum = 1; tileNum <= this.gridVals.length; ++i) {
    letter = gridVals[tileNum-1];
    usedTiles.push(tileNum);
    // Because of the preprocessing, the first letter is guaranteed to be in the trie
    searchForWords(letter, tileNum, usedTiles);
  }
};

/* 
  Recursive helper to find matches in the trie
  prefix: the prefix searched for so far
  tileNum: the number of the current tile
  usedTiles: the numbers of the tiles that have been used so far in the current prefix
*/
MatchFinder.prototype.searchForWords = function(prefix, tileNum, usedTiles) {
  // use recursion to build strings to look for in the trie
  var isMatch = this.trie.lookup(prefix);
  if (isMatch) {
    // This prefix is present in the trie

    if (this.trie.isWordInTrie(prefix)) {
    // This match is a full word
      this.matches.push(prefix);
    }

    // Search with each of the tile's neighbors
    var neighbors = this.neighbors[tileNum];
    var availableNeighbors = neighbors.filter(
      function(elt) {
        return usedTiles.indexOf(elt) < 0;
      }
    );
    var nextPrefix, neighborTileNum, newUsedTiles;
    for(var i=1; i<=availableNeighbors; ++i) {
      neighborTileNum = availableNeighbors[i];
      nextPrefix = prefix + this.gridVals[neighborTileNum-1];
      newUsedTiles = usedTiles;
      newUsedTiles.push(neighborTileNum);
      this.searchForWords(nextPrefix, neighborTileNum, newUsedTiles);
    }
  }
  // else the prefix does not exist in the trie, stop recursing
};