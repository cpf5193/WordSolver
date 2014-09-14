// Draws the grid for the special weights tiles
// numTiles: the number of tiles in the grid
function drawSpecialGrid(numTiles) {
  var specialGridContainer = $('.specialGrid');
  var gridSize = Math.sqrt(numTiles);
  specialGridContainer.css('width', gridSize * TILE_SIZE + "px");
  specialGridContainer.html('<label>Special Weights</label>');
  var rowTemplate = $('.gridRow.template');
  var tileTemplate = $('.specialTile.template');
  var tileContainer, rowCopy, tileCopy;
  for(var i=1; i<= gridSize; ++i) {
    rowCopy = rowTemplate.clone();
    rowCopy.removeClass('template');
    rowCopy.addClass('specialGridRow' + i);
    for(var j=1; j<= gridSize; ++j) {
      tileCopy = tileTemplate.clone();
      tileCopy.removeClass('template');
      tileCopy.addClass('specialTile' + ((i-1) * gridSize + j));
      rowCopy.append(tileCopy);
    }
    specialGridContainer.append(rowCopy);
  }
}

// Handle events for the special tile weights grid
function handleSpecialTileEvents() {
  var choices = ['blank', 'dl', 'tl', 'dw', 'tw'];
  $('.specialTile, .specialTile p').click({"choices" : choices}, switchSpecialTile);
}

// Cycles to the next special tile option on a given element
// event: the object representing the registered event:
//   event.target: the selected special tile DOM element
//   event.data: {"choices":['blank', 'dl', ...]}
function switchSpecialTile(event) {
  var choices = event.data.choices, prevChoic, tileElt;
 
  // Get the state of the clicked tile before the click
  if (event.target.tagName === "P") {
    tileElt = $(event.target).parent();
    prevChoice = $(event.target).html().toLowerCase();
  } else {
    tileElt = $(event.target);
    prevChoice = tileElt.data('special') ? tileElt.data('special') : 'blank';
  }

  // Get the new state of the tile after the click
  var choice = choices[(choices.indexOf(prevChoice) + 1) % choices.length];

  // Toggle the UI appearance of the tile
  tileElt.removeClass(prevChoice);
  tileElt.addClass(choice);
  tileElt.data('special', choice);
  if (choice === 'blank') {
    tileElt.html('');
  } else {
    tileElt.html('<p>' + choice.toUpperCase() + '</p>');
  }
}