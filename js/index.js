ALPHABET_Q = ['a', 'b', 'c', 'd', 'e', 'f', 'g',
     'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
     'p', 'q', 'r', 's', 't', 'u', 'v',
     'w', 'x', 'y', 'z'];
ALPHABET_QU = ['a', 'b', 'c', 'd', 'e', 'f', 'g',
     'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
     'p', 'qu', 'r', 's', 't', 'u', 'v',
     'w', 'x', 'y', 'z'];
$(function(){
  getGameOptions();

  // Change game rules
  $('.modal-footer button.btn-primary').click(function () {
    setGameOptions();
    $('.modal-footer button.btn-default').click();
  });

  // Clear board
  $('.gridButtons .btn-danger').click(function () {
    clearBoard();
  });
});

function clearBoard() {
  $('.tile').not($('.template')).find('input').val("");
  $('.results ol').empty();
  $('.numResults').empty();
}

function setModalDisplay(options) {
  $('.minWordLength option:nth-child(' + parseInt(options.minWordLen) +
    ')').attr('selected', 'selected');
  $('.numTiles option:nth-child(' + (Math.sqrt(parseInt(options.boardSize)) - 1) +
    ')').attr('selected', 'selected');
  if (options.qType === 'Q') {
    $('.qType option:nth-child(1)').attr('selected', 'selected');
  } else {
    $('.qType option:nth-child(2)').attr('selected', 'selected');
  }
  var template = $('.template.tileWeightBox');
  var container = $('.tileWeightContainer');
  container.empty();
  var alphabet = options.qType === 'Q' ? ALPHABET_Q : ALPHABET_QU;
  var copy, letter;
  for(var i=0; i<alphabet.length; ++i) {
    letter = alphabet[i];
    copy = template.clone();
    copy.find('select').before(letter + ": ");
    copy.find('option:nth-child(' + options.tileWeights[letter] + ')')
        .attr('selected', 'selected');
    copy.removeClass('template');
    container.append(copy);
  }
}

function setupBoard(options) {
  MIN_WORD_LEN = options.minWordLen;
  NUM_TILES = options.boardSize;
  Q_TYPE = options.qType;
  TILE_WEIGHTS = options.tileWeights;
  // SPECIAL_TILES = options.specialTiles;
  $('.results ol').empty();
  $('.numResults').empty();
  drawGrid(NUM_TILES, Q_TYPE);
  enforceInputRules(Q_TYPE, NUM_TILES);
  setModalDisplay(options);
  getMatches(MIN_WORD_LEN, NUM_TILES, TILE_WEIGHTS, Q_TYPE/*, SPECIAL_TILES*/);
}

function setGameOptions() {
  var numTiles = parseInt($('.numTiles').val());
  var minWordLength = parseInt($('.minWordLength').val());
  var qType = $('.qType').val();
  var tileWeights = {};
  $('.tileWeightBox').not('.template').find('select')
    .each(function(index, elt) {
      if (qType === 'Q') {
        tileWeights[ALPHABET_Q[index]] = $(elt).val();
      } else {
        tileWeights[ALPHABET_QU[index]] = $(elt).val();
      }
    });
  // $('.specialTile')
  var jsonObj = { "minWordLen" : minWordLength,
                  "maxWordLen" : (qType === 'Q' ? numTiles : numTiles + 1),
                  "boardSize" : numTiles,
                  "qType" : qType,
                  "tileWeights" : tileWeights/*,
                  "specialTiles" : specialTiles*/ };
  localStorage.setItem('gameOptions', JSON.stringify(jsonObj));
  setupBoard(jsonObj);
}

function getGameOptions() {
  
  var storedOptions = localStorage.getItem('gameOptions');
  if (storedOptions) {
    setupBoard(JSON.parse(storedOptions));
  } else {
    var request = $.ajax({
      url : "getOptions.php",
      type : "GET",
      dataType: "json",
      success : function(response) {
        setupBoard(JSON.parse(response));
      },
      fail: function (jqXHR, textStatus) {
        alert( "Request failed: " + textStatus );
      }
    });
  }
}

function enforceInputRules(qType, numTiles) {
  var lastTile = $('.tile' + numTiles);
  var allButLast = $('.tile').not(lastTile).not('.tile.template')
                             .find('input[type="text"]');
  allButLast.keyup(function(event) {
    var content = this.value;
    if (qType === 'Q') {
      if (isLegalKey(content)) {
        moveFocusToNextTile(this);
      } else {
        this.value = '';
      }
    } else {
      if (content === 'q') {
        $(this).attr('maxlength', 2);
      } else if (content === 'qu' || isLegalKey(content)) {
        moveFocusToNextTile(this);
      } else if (content.charAt(0) === 'q' && content.charAt(1) !== 'u') {
        this.value = content.charAt(0);
      } else {
        this.value = '';
        $(this).attr('maxlength', '1');
      }
    }
  });
}

function moveFocusToNextTile(current) {
  var nextIndex = parseInt(current.parentNode.classList[1].substring(4)) + 1;
  $('.tile' + nextIndex + " input").focus();
}

function isLegalKey(key) {
  return key.match(/^[a-z]$/i) !== null;
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
      tileCopy.html('<input type="text" size="1" maxlength="1" align="middle"></div>');
      rowCopy.append(tileCopy);
    }
    gridContainer.append(rowCopy);
  }
}
/*, specialTiles*/
function getMatches(minWordLength, numTiles, tileWeights, qType) {
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
        var matches = lookupMatches(JSON.parse(response), gridVals, minWordLength, tileWeights, qType/*, specialTiles*/);
      },
      fail: function (jqXHR, textStatus) {
        alert( "Request failed: " + textStatus );
      }
    });
  })
}

// Build the trie using the filtered matches
function buildTrie(words, tileWeights) {
  var trie = new Trie();
  for(var i=0; i<words.length; ++i) {
    trie.insert(words[i]);
  }
  return trie;
}
/*, specialTiles*/
// Use a trie to find all the paths in the grid that match the dictionary
function lookupMatches(words, gridVals, minWordLength, tileWeights, qType) {
  var trie = buildTrie(words, tileWeights);
  var finder = new MatchFinder(trie, gridVals, minWordLength, tileWeights, qType/*, specialTiles*/);
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
    var scorediff = b.score - a.score;
    if (scorediff !== 0) {
      return scorediff;
    } 
    var wordLenComp = b.word.length - a.word.length;
    if (wordLenComp !== 0) {
      return wordLenComp;
    } else {
      return ((a.word < b.word) ? -1 : (a.word > b.word) ? 1 : 0);
    }
  });
  var uniqueMatches = [];
  $.each(matches, function(index, obj){
    if($.inArray(obj, uniqueMatches) === -1) {
      uniqueMatches.push(obj);
    }
  });
  var matchContainer = $('.results ul');
  matchContainer.empty();
  var matchTemplate = $('.result.template');
  var match;
  //take the matches and render them in a space below the page
  $.each(uniqueMatches, function(index, obj) {
    match = matchTemplate.clone();
    match.removeClass('template');
    match.html(obj.word + " - " + obj.score);
    matchContainer.append(match);
  });
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