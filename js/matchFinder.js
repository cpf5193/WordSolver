/* 
  Constructor for a MatchFinder object
  trie: the Trie in which to search for matches
  gridVals: an array of values representing the grid e.g. ['a', 'b', 'c', ...]
  neighbors: 1-indexed dictionary representing the neighbor tiles for each tile position
	e.g. {1: [2,5,6], 2:[...], ...}
  minWordSize: the minimum length of a word as defined by the user
  tileWeights: a dictionary of weights per letter, e.g. {'a':1, 'b':4, ...}
  qType: whether the 'q' letter is present in the board as 'q' or 'qu'
  specialTiles: 0-indexed dictionary of tiles with special weights, e.g. {0: 'dw', ...}
*/
function MatchFinder(trie, gridVals, minWordSize, tileWeights, qType, specialTiles) {
  this.trie = trie;
  this.gridVals = gridVals;
  this.neighbors = {};
  this.tileWeights = tileWeights;
  this.specialTiles = specialTiles;
  this.matches = [];
  this.minWordSize = minWordSize;
  this.qType = qType;
}

// Constructs a dictionary that maps the tile positions to the positions of their neighbors
MatchFinder.prototype.defineNeighbors = function() {
  var boardWidth = Math.sqrt(this.gridVals.length);

  // define neighbors for first row
  this.setTopRowNeighbors(boardWidth);

  // define neighbors for middle rows
  this.setMiddleRowsNeighbors(boardWidth);

  // define neighbors for last row
  this.setLastRowNeighbors(boardWidth);
};

// Sets the neighbors of the tiles in the first row
MatchFinder.prototype.setTopRowNeighbors = function(boardWidth) {
   // upper left corner:
  this.neighbors[1] = [2, 1+boardWidth, 1+boardWidth+1];
  // upper row not on edges:
  for(var i=2; i<boardWidth; ++i) {
    this.neighbors[i] = [i-1, i+boardWidth-1, i+boardWidth, i+boardWidth+1, i+1];
  }
  // upper right corner:
  this.neighbors[boardWidth] = [boardWidth-1, boardWidth*2-1, boardWidth*2];
};

// Sets the neighbors of tiles not in the first or last row
MatchFinder.prototype.setMiddleRowsNeighbors = function(boardWidth) {
  var leftEdge, centerTile, rightEdge;
  for(var row=2; row<boardWidth; ++row) {
    // left edge:
    leftEdge = (row-1) * boardWidth + 1;
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
MatchFinder.prototype.setLastRowNeighbors = function(boardWidth) {
  // Bottom left tile:
  var bottomLeft = (boardWidth-1)*boardWidth+1;
  this.neighbors[bottomLeft] = [bottomLeft-boardWidth, bottomLeft-boardWidth+1,
                                bottomLeft+1];
  
  // Middle tiles:
  for(var i=bottomLeft+1; i<(boardWidth*boardWidth); ++i) {
    this.neighbors[i] = [i-1, i-boardWidth-1, i-boardWidth, i-boardWidth+1, i+1];
  }

  // Bottom right tile:
  var bottomRight = boardWidth*boardWidth;
  this.neighbors[bottomRight] = [bottomRight-1, bottomRight-boardWidth-1,
                                 bottomRight-boardWidth];
}

// Sets all the matches found based on the grid values and trie
MatchFinder.prototype.searchTiles = function() {
  var prefix = '', letter;
  for(var tileNum = 1; tileNum <= this.gridVals.length; ++tileNum) {
    letter = this.gridVals[tileNum-1];
    // Because of the preprocessing, the first letter is guaranteed to be in the trie,
	// start with singleton set of this tileNum
    this.searchForWords(letter, tileNum, [tileNum]);
  }
};

/* 
  Recursive helper to find matches in the trie
  prefix: the prefix searched for so far
  tileNum: the position of the current tile
  usedTiles: the 1-indexed positions of the tiles that have been used so far in the current prefix
*/
MatchFinder.prototype.searchForWords = function(prefix, tileNum, usedTiles) {
  // use recursion to build strings to look for in the trie
  if (prefix === 'disqualifications') {
    console.log('searching disqualifications');
  }
  var isMatch = this.trie.lookup(prefix);
  if (isMatch) {
    // This prefix is present in the trie
    if (prefix.length >= this.minWordSize  && this.trie.isWordInTrie(prefix)) {
    // This match is a full word
      this.matches.push({'word' : prefix, 'score' : this.getScore(usedTiles),
                         'path' : usedTiles.slice(0) });
    }

    // Search with each of the tile's neighbors
    var neighbors = this.neighbors[tileNum];
    var availableNeighbors = neighbors.filter(
      function(elt) {
        return usedTiles.indexOf(elt) < 0;
      }
    );

	// Search each of this node's children recursively
    var nextPrefix, neighborTileNum, newUsedTiles;
    for(var i=1; i<=availableNeighbors.length; ++i) {
      neighborTileNum = availableNeighbors[i-1];
      nextPrefix = prefix + this.gridVals[neighborTileNum-1];
      newUsedTiles = usedTiles;
      newUsedTiles.push(neighborTileNum);
      this.searchForWords(nextPrefix, neighborTileNum, newUsedTiles);
      newUsedTiles.pop();
    }
  }
  // else the prefix does not exist in the trie, stop recursing
};

// Returns the score associated with this word
// tileIndices: an array of values representing the positions of the 
//   tiles that make up this word
MatchFinder.prototype.getScore = function(tileIndices) {
  var letter, wordScore = 0, dw = false, tw = false, that = this;

  // Apply special tile weights
  $.each(tileIndices, function(arrayIndex, tileIndex) {
    letter = that.gridVals[tileIndex - 1];
    switch(that.specialTiles[tileIndex - 1]) {
      case 'dl':
        wordScore += (that.tileWeights[letter] * 2);
        break;
      case 'tl':
        wordScore += (that.tileWeights[letter] * 3);
        break;
      case 'dw':
        dw = true;
        wordScore += parseInt(that.tileWeights[letter]);
        break; 
      case 'tw':
        tw = true;
        wordScore += parseInt(that.tileWeights[letter]);
        break;
      default:
        wordScore += parseInt(that.tileWeights[letter]);
    }
  });

  // Apply bonuses based on word length
  if (tileIndices.length === 2) {
    wordScore = 1;
  }
  if (dw) {
    wordScore *= 2;
  }
  if (tw) {
    wordScore *= 3;
  }
  if (tileIndices.length  === 5) {
    wordScore += 3;
  } else if (tileIndices.length === 6) {
    wordScore += 6;
  } else if (tileIndices.length === 7) {
    wordScore += 10;
  } else if (tileIndices.length === 8) {
    wordScore += 15;
  } else if (tileIndices.length === 9) {
    wordScore += 20;
  } else if (tileIndices.length >= 10) {
    wordScore += 25;
  }
  return wordScore;
};