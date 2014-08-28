$(function(){
  // Get this later from a form
  var NUM_TILES = 16;
  var MIN_WORD_LEN = 3;
  drawGrid(NUM_TILES);
  sanitizeKeystrokes();
  getMatches(MIN_WORD_LEN, NUM_TILES);
  $('.modal-footer button.btn-primary').click(function () {
    MIN_WORD_LEN = $('.minWordLength').val();
    NUM_TILES = $('.numTiles').val()
    $('.results ol').empty();
    $('.numResults').empty();
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
      tileCopy.addClass('tile' + (i * Math.sqrt(numTiles) + j));
      tileCopy.html('<input type="text" size="2" maxlength="2" align="middle"></div>');
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
  
  var matchContainer = $('.results ol');
  matchContainer.empty();
  var matchTemplate = $('.result.template');
  var match;
  //take the matches and render them in a space below the page
  for(var i=0; i<matches.length; ++i) {
    match = matchTemplate.clone();
    match.removeClass('template');
    match.html(matches[i]);
    matchContainer.append(match);
  }
}


//TODO:
/*
  Make grid tiles compatible with 'Qu' tile
  disable the findWords button until all of the fields are filled out/
    show error tooltip on boxes if not filled out on submit
  Implement showMatches
  Change fonts to sans-serif
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