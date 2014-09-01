$(function(){
  // Get this later from a form
  var NUM_TILES = parseInt($('.numTiles').val());
  var MIN_WORD_LEN = parseInt($('.minWordLength').val());
  var Q_TYPE = $('.qType').val();
  drawGrid(NUM_TILES, Q_TYPE);
  sanitizeKeystrokes();
  automaticMoveFields(NUM_TILES);
  getMatches(MIN_WORD_LEN, NUM_TILES);
  $('.modal-footer button.btn-primary').click(function () {
    MIN_WORD_LEN = $('.minWordLength').val();
    NUM_TILES = $('.numTiles').val();
    Q_TYPE = $('.qType').val();
    $('.results ol').empty();
    $('.numResults').empty();
    drawGrid(NUM_TILES, Q_TYPE);
    sanitizeKeystrokes();
    $('.modal-footer button.btn-default').click();
    automaticMoveFields(NUM_TILES);
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

function automaticMoveFields(numTiles) {
  $('.tile1 input').attr('autofocus', 'autofocus');
  var sizeLimit = $('.qType').val().length;
  var lastTile = $('.tile' + numTiles);
  $('.tile').not(lastTile).not('.tile.template').find('input[type="text"]')
    .on('keyup paste', function() {
      if(this.value.length === this.maxLength) {
        var nextIndex = parseInt(this.parentNode.classList[1].substring(4)) + 1;
        $('.tile' + nextIndex + " input").focus();
      }
  });
}

function drawGrid(numTiles, qType) {
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
      tileCopy.addClass('tile' + ((i-1) * Math.sqrt(numTiles) + j));
      if (qType === 'Q') {
        tileCopy.html('<input type="text" size="1" maxlength="1" align="middle"></div>');        
      } else {
        tileCopy.html('<input type="text" size="2" maxlength="2" align="middle"></div>');        
      }
      rowCopy.append(tileCopy);
    }
    gridContainer.append(rowCopy);
  }
}

function getMatches(minWordLength, numTiles) {
  $('.gridButtons .btn-success').click(function() {
    var tiles = $('.tile input[type="text"]');
    var gridVals = [];
    tiles.each(function() {
      gridVals.push($(this).val());
    });

    var request = $.ajax({
      url: "getDictionary.php",
      type: "POST",
      data: { minWordLen: minWordLength,
              letters: gridVals,
              gridSize: numTiles},
      dataType: "html",
      success: function(response) {
        var matches = lookupMatches(JSON.parse(response), gridVals, minWordLength);
      },
      fail: function (jqXHR, textStatus) {
        alert( "Request failed: " + textStatus );
      }
    });
  })
}

// Build the trie using the filtered matches
function buildTrie(words) {
  var trie = new Trie();
  for(var i=0; i<words.length; ++i) {
    trie.insert(words[i]);
  }
  return trie;
}

// Use a trie to find all the paths in the grid that match the dictionary
function lookupMatches(words, gridVals, minWordLength) {
  var trie = buildTrie(words);
  var finder = new MatchFinder(trie, gridVals, minWordLength);
  finder.defineNeighbors();
  finder.searchTiles();
  this.showMatches(finder.matches);
}

// Render the results in the page
function showMatches(matches) {
  if (matches.length === 0) {
    $('.numResults').html("No matches found");
  } else if (matches.length === 1) {
    $('.numResults').html("1 result found:");
  } else {
    $('.numResults').html(matches.length + " results found:");
  }
  matches.sort(function(a, b){
    return b.length - a.length; // ASC -> a - b; DESC -> b - a
  });
  var uniqueMatches = [];
  $.each(matches, function(index, match){
    if($.inArray(match, uniqueMatches) === -1) uniqueMatches.push(match);
  });
  var matchContainer = $('.results ol');
  matchContainer.empty();
  var matchTemplate = $('.result.template');
  var match;
  //take the matches and render them in a space below the page
  for(var i=0; i<uniqueMatches.length; ++i) {
    match = matchTemplate.clone();
    match.removeClass('template');
    match.html(uniqueMatches[i]);
    matchContainer.append(match);
  }
}


//TODO:
/*
  Make grid tiles compatible with 'Qu' tile: insert as game rule option
  disable the findWords button until all of the fields are filled out/
    show error tooltip on boxes if not filled out on submit
  Limit input so that it only takes valid tiles
  add header and footer templates
  Add tooltips, instructions
  filter dictionary to match zynga's (separate dictionary)
 
  Added features:
    user dictionaries
    d3.js paths to show connections between tiles for matches
    add in tile weights
    sorting by alphabetical/score
    loading spinner
    add 'report mismatches' button
*/