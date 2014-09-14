// Retrieves the preprocessed words from the back end and
//   calls the function to get the matches
// event: the object that represents the triggered event:
//   event.target: the selected submit button
//   event.data: {"minWordLen" : ...,
//                "numTiles" : ...,
//                "tileWeights" : ...,
//                "qType" : ...}
function getMatches(event) {
  $('.svg').empty().attr('class', 'svg hidden').css('zIndex', -1);
  $(this).button('loading');

  // Get the needed information from the page
  var tiles = $('.tile input[type="text"]');
  var specialTiles = $('.specialTile').not('.template');
  var gridVals = [], specialVal, specialVals = {}, correspondingLetter;
  var minWordLen = event.data.minWordLen, numTiles = event.data.numTiles;
  var tileWeights = event.data.tileWeights, qType = event.data.qType;
  tiles.each(function() {
    gridVals.push($(this).val().toLowerCase());
  });
  specialTiles.each(function(index) {
    specialVal = $(this).data('special');
    if (specialVal !== 'blank' && specialVal !== undefined) {
      specialVals[index] = specialVal;
    }
  });

  var maxLength = gridVals.length;
  if (qType === "Qu") {
    $.each(gridVals, function(index, elt) {
      if (elt.length === 2) {
        maxLength++;
      }
    });
  }

  // Use an ajax call to get the filtered words from the dictionary
  var request = $.ajax({
    url: "getDictionary.php",
    type: "POST",
    data: { minWordLen: minWordLen,
            letters: gridVals,
            maxLength: maxLength
          },
    dataType: "html",
    success: function(response) {
      lookupMatches(JSON.parse(response), gridVals, minWordLen, tileWeights, qType, specialVals);
    },
    fail: function (jqXHR, textStatus) {
      alert( "Request failed: " + textStatus );
    }
  });
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
function lookupMatches(words, gridVals, minWordLen, tileWeights, qType, specialVals) {
  var trie = buildTrie(words);
  var finder = new MatchFinder(trie, gridVals, minWordLen, tileWeights, qType, specialVals);
  finder.defineNeighbors();
  finder.searchTiles();
  this.showMatches(finder.matches, gridVals.length);
}