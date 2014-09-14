// Draws the grid for the letter tiles
// numTiles: The number of tiles in the grid
// qType: whether the grid uses 'q' or 'qu' tiles
function drawGrid(numTiles, qType) {
  var gridContainer = $('.grid');
  var gridSize = Math.sqrt(numTiles);
  gridContainer.css('width', gridSize * TILE_SIZE + "px");
  gridContainer.html('<label>Letters</label>');
  var rowTemplate = $('.gridRow.template');
  var tileTemplate = $('.tile.template');
  var tileContainer, rowCopy, tileCopy;
  for(var i = 1; i <= gridSize; ++i) {
    rowCopy = rowTemplate.clone();
    rowCopy.removeClass('template');
    rowCopy.addClass('gridRow' + i);
    for(var j = 1; j <= gridSize; ++j) {
      tileCopy = tileTemplate.clone();
      tileCopy.removeClass('template');
      tileCopy.addClass('tile' + ((i-1) * gridSize + j));
      tileCopy.html('<input type="text" size="1" maxlength="1" align="middle"></div>');
      rowCopy.append(tileCopy);
    }
    gridContainer.append(rowCopy);
  }
  $('.tile:not(.template):first input').focus();
  if (isTouchScreen()) {
    $('.tile:not(.template):first input').click();
  }
}

// Automatically moves focuses to the next tile
// current: the tile to move focus from
function moveFocusToNextTile(current) {
  var nextIndex = parseInt(current.parentNode.classList[1].substring(4)) + 1;
  $('.tile' + nextIndex + " input").focus();
}

// Controls the input to the letter tiles
// qType: whether the q tile is in the board as 'q' or 'qu'
// numTiles: the number of tiles in the grid
function enforceInputRules(qType, numTiles) {
  var lastTile = $('.tile' + numTiles);
  var allTiles = $('.tile').not('.tile.template')
                           .find('input[type="text"]');
  allTiles.keyup(function(event) {
    var content = this.value;
  // Only allow valid character sequences in grid, autofocus to next tile
  //   when the user types a valid sequence
    if (qType === 'Q') {
      if (isLegalKey(content)) {
        if ($(this).parent().attr('class') != lastTile.attr('class')) {
          moveFocusToNextTile(this);
        }
      } else {
        this.value = '';
      }
    } else {
      if (content === 'q') {
        $(this).attr('maxlength', 2);
      } else if (content === 'qu' || isLegalKey(content)) {
        if ($(this).parent().attr('class') != lastTile.attr('class')) {
          moveFocusToNextTile(this);
        }
      } else if (content.charAt(0) === 'q' && content.charAt(1) !== 'u') {
        this.value = content.charAt(0);
      } else {
        this.value = '';
        $(this).attr('maxlength', '1');
      }
    }
  });
}