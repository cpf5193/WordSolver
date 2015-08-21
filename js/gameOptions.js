// Set the options that will be used to determine the rules of the game
function setGameOptions() {
  // Get the currently selected options from the modal
  var numTiles = parseInt($('.numTiles').val());
  var minWordLen = parseInt($('.minWordLen').val());
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
  var jsonObj = { "minWordLen" : minWordLen,
                  "maxWordLen" : (qType === 'Q' ? numTiles : numTiles + 1),
                  "boardSize" : numTiles,
                  "qType" : qType,
                  "tileWeights" : tileWeights };

  // Set the options in localstorage
  localStorage.setItem('gameOptions', JSON.stringify(jsonObj));
  
  // Render with new options
  getGameOptions();

  // Close the modal
  $('.modal-footer button.btn-default').click();
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
        localStorage.setItem('gameOptions', response);
        setupBoard(JSON.parse(response));
      },
      fail: function (jqXHR, textStatus) {
        alert( "Request failed: " + textStatus );
      }
    });
  }
}

// Set the fields that are displayed in the 'Change Game Rules' modal
// options: an object holding the options, containing minWordLen, boardSize, qType, and tileWeights 
function setModalDisplay(options) {
  // Set default selected options
  $('.minWordLen option:nth-child(' + parseInt(options.minWordLen) +
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
  $('.qType').change(switchModalQ);
}

// Changes the label of the q tile weight label in the modal
// event: the object that represents the triggered event:
//   event.target: the selected dropdown
function switchModalQ(event) {
  if ($(event.target).val() === 'Q') {
    $('.tileWeightBox:nth-child(17) p').html('q: ');
  } else {
    $('.tileWeightBox:nth-child(17) p').html('qu: ');
  }
}