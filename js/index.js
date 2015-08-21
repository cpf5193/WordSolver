// Onload function
$(function(){
  // Register help button callback
  showHelpPopover();

  // Retrieve the game options
  getGameOptions();

  // Set up handler for changing game rules
  $('.modal-footer button.btn-primary').click(setGameOptions);

  // Set handler for clearing the board
  $('.gridButtons .btn-danger').click(clearBoard);

  $(window).resize(replaceSvg);
});

// Clears the board
function clearBoard() {
  // Clear content
  $('.tile').not($('.template')).find('input').val("");
  $('.svg').attr('class', 'svg hidden').css('zIndex', -1);
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
  $('.tile:not(.template):first input').focus();
  if (isTouchScreen()) {
    $('.tile:not(.template):first input').click();
  }
}

// Main function to render the page
// options: an object holding the options, containing minWordLen, boardSize, qType, and tileWeights
function setupBoard(options) {
  MIN_WORD_LEN = options.minWordLen;
  NUM_TILES = options.boardSize;
  Q_TYPE = options.qType;
  TILE_WEIGHTS = options.tileWeights;

  // Empty any old content before rendering
  $('.svg').empty().attr('class', 'svg hidden').css('zIndex', -1);
  $('.results ul').empty();
  $('.numResults').empty();
  $('.tileWeightContainer').empty();

  // Render the grids
  drawGrid(NUM_TILES, Q_TYPE);
  drawSpecialGrid(NUM_TILES);

  // Set handlers on grid
  enforceInputRules(Q_TYPE, NUM_TILES);

  // Set handler for enabling and disabling the submit button
  $('.tile input[type="text"]').keyup(toggleGetMatchesBtn);
  $('.submit-btn-wrapper').tooltip('show').tooltip('hide');

  // Set handlers on special tile grid
  handleSpecialTileEvents();

  // Set the content to display in the change game options modal
  setModalDisplay(options);

  // Compute the results
  $('.gridButtons .btn-success').click(getMatches);
}

// Enables the get matches button if grid is filled out,
// disable if not
function toggleGetMatchesBtn() {
  if (allTilesFilled()) {
    $('.gridButtons .btn-success').attr('disabled', null)
    $('.submit-btn-wrapper').tooltip('destroy');
    $('.submit-btn-wrapper button').focus();
  } else {
    $('.gridButtons .btn-success').attr('disabled', 'disabled');
    $('.submit-btn-wrapper').tooltip('show').tooltip('hide');
  }
}

// Setup handler for showing the help tooltip
function showHelpPopover() {
  // Set the contents of the tooltip
  var contents = 
    "<p><strong>Purpose: </strong>Word Scramble solver is a helper" +
    " for word games that require users to find words in a grid of" +
    " letters, such as in the games Boggle\u2122 and Scramble with Friends\u2122." +
    " This app is based on Zynga's Scramble with Friends\u2122.</p>" +
    "<p><strong>How to use: </strong> Enter the letters into the grid on" +
    " the left by typing the letters. The grid will only accept valid letter" +
    " sequences. You can modify the rules of the game using the 'Modify Game Rules'" + 
    " button. You can click on the grid on the right to place special tile weights." +
    " Currently, it supports DL, TL, DW, and TW, which stand for Double Letter, " +
    "Triple Letter, Double Word, and Triple Word. Click a tile multiple times to " +
    "cycle through the options. If a word can only apply the DW or TW special " + 
    "tile once each. To clear the board and the results, click on the" +
    " red 'Clear' button. Once you have entered all of the tiles, click the " +
    "'Find Matches' button to get your results. You can click on the result words" +
    " to see the swipe path for that word. To remove the swipe path, simply" +
    " re-click the selected word. For further understanding of this application," +
    " try out Scramble with Friends\u2122 using the links above.</p>";

  // Set the handler for the tooltip
  if (isTouchScreen()) {
    $('.help-icon').popover({
      'html' : true,
      'content' : contents,
      'title' : 'About Word Scramble Solver'
    });
  }
  $('.help-icon').popover({
    'html' : true,
    'content': contents,
    'title' : 'About Word Scramble Solver'
  });
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