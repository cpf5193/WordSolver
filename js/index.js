$(function(){
  // Get this later from a form
  var NUM_TILES = 16;
  var MIN_WORD_LEN = 3;
  drawGrid(NUM_TILES);
  sanitizeKeystrokes();
  setupGameChangeHandler();
  $('.modal-footer button.btn-primary').click(function () {
    MIN_WORD_LEN = $('.minWordLength').val();
    NUM_TILES = $('.numTiles').val()
    drawGrid(NUM_TILES);
    $('.modal-footer button.btn-default').click();
  });
});

function sanitizeKeystrokes() {
  var allowedKeys = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i',
                     'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
                     's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A',
                     'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
                     'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S',
                     'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];  
  $('.tile input').keyup(function(e) {
    var charCode = e.keyCode;
    var content = this.value, currentChar;
    for(var i=0; i<content.length; ++i) {
      currentChar = content.charAt(i);
      if (allowedKeys.indexOf(currentChar) === -1) {
        content = content.slice(0, i) + content.slice(i+1, content.length);
        --i;
      }
    }
    this.value = content;
  });
}

function drawGrid(numTiles) {
  // Render the rows
  var gridContainer = $('.grid');
  gridContainer.empty();
  var rowTemplate = $('.gridRow.template');
  var tileTemplate = $('.tile.template');
  var tileContainer, rowCopy, tileCopy;
  for(var i = 1; i <= Math.sqrt(numTiles); ++i) {
    rowCopy = rowTemplate.clone();
    rowCopy.removeClass('template');
    rowCopy.addClass('gridRow' + i);
    for(var j = 1; j <= Math.sqrt(numTiles); ++j) {
      tileCopy = tileTemplate.clone();
      tileCopy.removeClass('template');
      tileCopy.addClass('tile' + j);
      tileCopy.html('<input type="text" size="2" maxlength="2" align="middle"></div>');
      rowCopy.append(tileCopy);
    }
    gridContainer.append(rowCopy);
  }
}

function setupGameChangeHandler() {
  $('.modal-footer button.btn-primary').click(function () {
    var minWordLength = $('.minWordLength option[selected]').val();
    var boardSize = $('.numTiles option[selected]').val();

  });
}