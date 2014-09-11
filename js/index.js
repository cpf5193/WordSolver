// Constants
ALPHABET_Q = ['a', 'b', 'c', 'd', 'e', 'f', 'g',
     'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
     'p', 'q', 'r', 's', 't', 'u', 'v',
     'w', 'x', 'y', 'z'];
ALPHABET_QU = ['a', 'b', 'c', 'd', 'e', 'f', 'g',
     'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
     'p', 'qu', 'r', 's', 't', 'u', 'v',
     'w', 'x', 'y', 'z'];
TILE_SIZE = 60;

// Onload function
$(function(){
  // Register help button callback
  $('.help-icon').hover(showHelpTooltip);

  // Retrieve the game options
  getGameOptions();

  // Set up handler for changing game rules
  $('.modal-footer button.btn-primary').click(function () {
    setGameOptions();
	// Close the modal
    $('.modal-footer button.btn-default').click();
  });

  // Set handler for clearing the board
  $('.gridButtons .btn-danger').click(function () {
    clearBoard();
  });

  $( window ).resize(replaceSvg);
});

// Clears the board
function clearBoard() {
  // Clear content
  $('.tile').not($('.template')).find('input').val("");
  $('.svg').empty().css('zIndex', -1);
  $('.results ul').empty();
  $('.numResults').empty();
  $('.specialTile').not('.template').each(function() {
    if ($(this).data('special') !== 'blank' && $(this).data('special') !== undefined) {
      $(this).empty();
      $(this).data('special', 'blank');
      $(this).removeClass('dl tl dw tw');
    }
  });

  // Disable the submit button
  $('.gridButtons .btn-success').attr('disabled', 'disabled');
  $('.submit-btn-wrapper').tooltip('show').tooltip('hide');
}

// Set the fields that are displayed in the 'Change Game Rules' modal
// options: an object holding the options, containing minWordLen, boardSize, qType, and tileWeights 
function setModalDisplay(options) {
  // Set default selected options
  $('.minWordLength option:nth-child(' + parseInt(options.minWordLen) +
    ')').attr('selected', 'selected');
  $('.numTiles option:nth-child(' + (Math.sqrt(parseInt(options.boardSize)) - 1) +
    ')').attr('selected', 'selected');
  if (options.qType === 'Q') {
    $('.qType option:nth-child(1)').attr('selected', 'selected');
  } else {
    $('.qType option:nth-child(2)').attr('selected', 'selected');
  }

  // Set the tile weight selects
  var template = $('.template.tileWeightBox');
  var container = $('.tileWeightContainer');
  var alphabet = options.qType === 'Q' ? ALPHABET_Q : ALPHABET_QU;
  var copy, letter;
  for(var i=0; i<alphabet.length; ++i) {
    letter = alphabet[i];
    copy = template.clone();
    copy.find('select').before('<p>' + letter + ': </p>');
    copy.find('option:nth-child(' + options.tileWeights[letter] + ')')
        .attr('selected', 'selected');
    copy.removeClass('template');
    container.append(copy);
  }

  // Set the handler for changing the q tile weight label
  $('.qType').change(function() {
    if ($(this).val() === 'Q') {
      $('.tileWeightBox:nth-child(17) p').html('q: ');
    } else {
      $('.tileWeightBox:nth-child(17) p').html('qu: ');
    }
  });
}

// Main function to render the page
// options: an object holding the options, containing minWordLen, boardSize, qType, and tileWeights
function setupBoard(options) {
  MIN_WORD_LEN = options.minWordLen;
  NUM_TILES = options.boardSize;
  Q_TYPE = options.qType;
  TILE_WEIGHTS = options.tileWeights;

  // Empty any old content before rendering
  $('.svg').empty().css('zIndex', -1);
  $('.results ul').empty();
  $('.numResults').empty();

  // Render the grids
  drawGrid(NUM_TILES, Q_TYPE);
  drawSpecialGrid(NUM_TILES);

  // Set handlers on grid
  enforceInputRules(Q_TYPE, NUM_TILES);

  // Set handler for enabling and disabling the submit button
  $('.tile input[type="text"]').keyup(function() {
    if (allTilesFilled()) {
      $('.gridButtons .btn-success').attr('disabled', null)
      $('.submit-btn-wrapper').tooltip('destroy');
      $('.submit-btn-wrapper button').focus();
    } else {
      $('.gridButtons .btn-success').attr('disabled', 'disabled');
      $('.submit-btn-wrapper').tooltip('show').tooltip('hide');
    }
  });
  $('.submit-btn-wrapper').tooltip('show').tooltip('hide');

  // Set handlers on special tile grid
  handleSpecialTileEvents();

  // Set the content to display in the change game options modal
  setModalDisplay(options);

  // Compute the results
  getMatches(MIN_WORD_LEN, NUM_TILES, TILE_WEIGHTS, Q_TYPE);
}

// Set the options that will be used to determine the rules of the game
function setGameOptions() {
  // Get the currently selected options from the modal
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

  // Create json to store
  var jsonObj = { "minWordLen" : minWordLength,
                  "maxWordLen" : (qType === 'Q' ? numTiles : numTiles + 1),
                  "boardSize" : numTiles,
                  "qType" : qType,
                  "tileWeights" : tileWeights };

  // Set the options in localstorage
  localStorage.setItem('gameOptions', JSON.stringify(jsonObj));
  
  // Render with new options
  setupBoard(jsonObj);
}

// Retrieve the game options from persistent storage or get default options
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

// Handle events for the special tile weights grid
function handleSpecialTileEvents() {
  var choices = ['blank', 'dl', 'tl', 'dw', 'tw'];
  var prevChoice, choice;
  $('.specialTile').click(function() {
	// Get the state of the clicked tile before the click
    prevChoice = $(this).data('special') ? $(this).data('special') : 'blank';

    // Get the new state of the tile after the click
    choice = choices[(choices.indexOf(prevChoice) + 1) % choices.length];

	// Toggle the UI appearance of the tile
    $(this).removeClass(prevChoice);
    $(this).addClass(choice);
    $(this).data('special', choice);
    if (choice === 'blank') {
      $(this).html('');
    } else {
      $(this).html('<p>' + choice.toUpperCase() + '</p>');
    }
  });
}

// Automatically moves focuses to the next tile
// current: the tile to move focus from
function moveFocusToNextTile(current) {
  var nextIndex = parseInt(current.parentNode.classList[1].substring(4)) + 1;
  $('.tile' + nextIndex + " input").focus();
}

// Returns true if the typed key is valid
// key: the character to validate
function isLegalKey(key) {
  return key.match(/^[a-z]$/i) !== null;
}

// Setup handler for showing the help tooltip
function showHelpTooltip() {
  // Set the contents of the tooltip
  var contents = 
    "<h2>About Word Scramble Solver</h2>" + 
    "<p><strong>Purpose: </strong>Word Scramble solver is a helper" +
    " for word games that require users to find words in a grid of" +
    " letters, such as in the games Boggle™ and Scramble with Friends™." +
    " This app is based on Zynga's Scramble with Friends.</p>" +
    "<p><strong>How to use: </strong> Enter the letters into the grid on" +
    " the left by typing the letters. The grid will only accept valid letter" +
    " sequences. You can modify the rules of the game using the 'Modify Game Rules'" + 
    " button. You can click on the grid on the right to place special tile weights." +
    " Currently, it supports DL, TL, DW, and TW, which stand for Double Letter, " +
    "Triple Letter, Double Word, and Triple Word. Click a tile multiple times to " +
    "cycle through the options. To clear the board and the results, click on the" +
    " red 'Clear' button. Once you have entered all of the tiles, click the " +
    "'Find Matches' button to get your results. You can click on the result words" +
    " to see the swipe path for that word. To remove the swipe path, simply" +
    " re-click the selected word. For further understanding of this application," +
    " try out Scramble with Friends™ using the links above.</p>";

  // Set the handler for the tooltip
  $('.help-icon').tooltip({
    'trigger': 'hover',
    'html' : true,
    'title': contents
  });
}

// Draws the grid for the letter tiles
// numTiles: The number of tiles in the grid
// qType: whether the grid uses 'q' or 'qu' tiles
function drawGrid(numTiles, qType) {
  var gridContainer = $('.grid');
  gridContainer.html('<label>Letters</label>');
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
  $('.tile:not(.template):first input').focus();
}

// Draws the grid for the special weights tiles
// numTiles: the number of tiles in the grid
function drawSpecialGrid(numTiles) {
  var specialGridContainer = $('.specialGrid');
  specialGridContainer.html('<label>Special Weights</label>');
  var rowTemplate = $('.gridRow.template');
  var tileTemplate = $('.specialTile.template');
  var tileContainer, rowCopy, tileCopy;
  for(var i=1; i<= Math.sqrt(numTiles); ++i) {
    rowCopy = rowTemplate.clone();
    rowCopy.removeClass('template');
    rowCopy.addClass('specialGridRow' + i);
    for(var j=1; j<= Math.sqrt(numTiles); ++j) {
      tileCopy = tileTemplate.clone();
      tileCopy.removeClass('template');
      tileCopy.addClass('specialTile' + ((i-1) * Math.sqrt(numTiles) + j));
      rowCopy.append(tileCopy);
    }
    specialGridContainer.append(rowCopy);
  }
}

// Retrieves the preprocessed words from the back end and
//   calls the function to get the matches
function getMatches(minWordLength, numTiles, tileWeights, qType) {
  $('.gridButtons .btn-success').click(function() {
    $('.svg').empty().css('zIndex', -1);
    $(this).button('loading');

    // Get the needed information from the page
    var tiles = $('.tile input[type="text"]');
    var specialTiles = $('.specialTile').not('.template');
    var gridVals = [], specialVal, specialVals = {}, correspondingLetter;
    tiles.each(function() {
      gridVals.push($(this).val().toLowerCase());
    });
    specialTiles.each(function(index) {
      specialVal = $(this).data('special');
      if (specialVal !== 'blank' && specialVal !== undefined) {
        specialVals[index] = specialVal;
      }
    });

    // Use an ajax call to get the filtered words from the dictionary
    var request = $.ajax({
      url: "getDictionary.php",
      type: "POST",
      data: { minWordLen: minWordLength,
              letters: gridVals,
              gridSize: numTiles},
      dataType: "html",
      success: function(response) {
        var matches = lookupMatches(JSON.parse(response), gridVals, minWordLength, tileWeights, qType, specialVals);
      },
      fail: function (jqXHR, textStatus) {
        alert( "Request failed: " + textStatus );
      }
    });
  });
}

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

// Builds the trie using the filtered matches
// words: an array of words that can be found in the grid
// tileWeights: 
function buildTrie(words) {
  var trie = new Trie();
  for(var i=0; i<words.length; ++i) {
    trie.insert(words[i]);
  }
  return trie;
}

// Uses a trie to find all the paths in the grid that match the dictionary
// words: an array of words that 
function lookupMatches(words, gridVals, minWordLength, tileWeights, qType, specialVals) {
  var trie = buildTrie(words);
  var finder = new MatchFinder(trie, gridVals, minWordLength, tileWeights, qType, specialVals);
  finder.defineNeighbors();
  finder.searchTiles();
  this.showMatches(finder.matches, gridVals.length);
}

// Render the results in the page
// matches: An array of words that can be found in the grid
// numTiles: The number of tiles in the grid
function showMatches(matches, numTiles) {
  if (matches.length === 0) {
    $('.numResults').html("No matches found");
  } else if (matches.length === 1) {
    $('.numResults').html("1 result found:");
  } else {
    $('.numResults').html(matches.length + " results found:");
  }
  
  // Get rid of duplicates
  var noDups = {}, word;
  $.each(matches, function(index, obj) {
    word = obj.word, score = obj.score;
    if (noDups[word]) {
      if (noDups[word].score < score) {
        noDups[word] = {'score': score,
                        'path': obj.path };
      }
    } else {
      noDups[word] = { 'score': score,
                       'path': obj.path };
    }
  });

  // Convert associative array to array of objects
  var uniqueMatches = [];
  $.each(noDups, function(word, obj) {
    uniqueMatches.push({ 'word':word, 'score':obj.score,
                         'path':obj.path });
  })

  // Sort the matches
  uniqueMatches.sort(function(a, b){
    var scorediff = b.score - a.score;
    if (scorediff !== 0) {
      return scorediff;
    }
    return ((a.word < b.word) ? -1 : (a.word > b.word) ? 1 : 0);
  });
 
  // display the matches
  var matchContainer = $('.results ul');
  matchContainer.empty();
  var matchTemplate = $('.result.template');
  var match;
  $.each(uniqueMatches, function(index, obj) {
    match = matchTemplate.clone();
    match.removeClass('template');
    match.html(obj.word + " - " + obj.score);
    match.addClass('word' + (index+1));
    matchContainer.append(match);
    match.click({'obj': obj, 'numTiles': numTiles}, toggleSwipePath);
  });
  $('.gridButtons .btn-success').button('reset');
}

// Handler for showing the swipe path when a user clicks a match
// event: the object representing the click event
//  event.target: the clicked-on DOM element
//  event.data: the object holding parameters, e.g.
//    {'obj': {'word':'cat', 'score': 3}, 'numTiles':16}
function toggleSwipePath(event) {
  var elt = $(event.target);
  $('.svg').empty();

  // If this match is already clicked, remove swipe indication
  if ($('.result.active').attr('class') !== elt.attr('class')) {
    $('.result.active').removeClass('active');
    elt.addClass('active');
    showSwipePath(event.data.obj, event.data.numTiles);
    $('.svg').css('zIndex', 1);
  } else { // Add swipe indication
    elt.removeClass('active');
    $('.svg').css('zIndex', -1);
  }
}

function replaceSvg() {
  var firstTileOffset = $('.tile:not(.template):first').offset();
  d3.select("svg")
    .attr('style', 'top: ' + firstTileOffset.top +
          '; left: ' + firstTileOffset.left + ';');
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

// Renders the path of a given word on top of the letters grid
// wordObj: the object that holds the word and score, e.g. 
//   {'word':'cat', 'score': 3}
// numTiles: the number of tiles in the grid
function showSwipePath(wordObj, numTiles) {
  var word = wordObj.word, path = $(wordObj.path);
  var boardWidth = Math.sqrt(numTiles);
  var xPos, yPos;
  var lineData = [];

  // Figure out coordinates of each tile in the path relative to the svg
  path.each(function(index, tileNum) {
    xPos = Math.floor((tileNum-1) % boardWidth) * TILE_SIZE + TILE_SIZE/2;
    yPos = Math.floor((tileNum-1) / boardWidth) * TILE_SIZE + TILE_SIZE/2;
    lineData.push({'x': xPos, 'y': yPos});
  });

  var lineFunction = d3.svg.line()
                       .x(function(d) { return d.x; })
                       .y(function(d) { return d.y; })
                       .interpolate('linear');
  var firstTileOffset = $('.tile:not(.template):first').offset();

  var svgContainer = d3.select("svg")
                       .attr('width', boardWidth * TILE_SIZE)
                       .attr('height', boardWidth * TILE_SIZE)
                       .attr('style', 'position: absolute; top: ' +
                              firstTileOffset.top + "; left: " +
                              firstTileOffset.left + ";");

  var lineGraph = svgContainer.append("path")
                              .attr("d", lineFunction(lineData))
                              .attr("stroke", "#145CBA")
                              .attr("stroke-width", 5)
                              .attr("opacity", 0.5)
                              .attr("fill", "none");
  $('.svg').css('zIndex', 1);
}