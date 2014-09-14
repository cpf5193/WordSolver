// Returns whether the letter tiles all have content
function allTilesFilled() {
  var tiles = $('.tile input[type="text"]');
  for(var i=tiles.length-1; i >= 0; --i) {
    if ($(tiles[i]).val().length === 0) {
      return false;
    }
  }
  return true;
}

// Computes and returns the (x,y) coordinates of the letter tiles
// tiles: an array of tile positions representing the letter tiles
function getTilePositions(tiles) {
  var positions = {}, coordinate;
  tiles.each(function(index, val) {
    coordinate = { 'x': $('.tile' + (index+1)).position().left,
                   'y': $('.tile' + (index+1)).position().top }

    // Get the position of the center of the tile
    coordinate.x += TILE_SIZE / 2;
    coordinate.y += TILE_SIZE / 2;
    positions[index] = coordinate;
  });
  return positions;
}

// Determines whether this device is a touch device or not
function isTouchScreen() {
  return 'ontouchstart' in document.documentElement;
}

// Returns true if the typed key is valid
// key: the character to validate
function isLegalKey(key) {
  return key.match(/^[a-z]$/i) !== null;
}