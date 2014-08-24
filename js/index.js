$(function(){
  // Get this later from a form
  var NUM_TILES = 16;
  drawGrid(NUM_TILES);
  sanitizeKeystrokes();
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
    // if (charCode < 65 || charCode > 90) {
    //   content = this.value;
    //   firstChar = content.charAt(0);
    //   if (content.length > 1 && (allowedKeys.indexOf(firstChar) != -1)) {
    //     this.value = content.charAt(0);
    //   } else {
    //     this.value = '';
    //   }
    // }
  });
}

function drawGrid(numTiles) {
  // Render the rows
  var gridContainer = $('.grid');
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