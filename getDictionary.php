<?php 
$dictionary;
$filteredWords;
$dictionaryName = 'lib/dictionary.txt';

// Retrieve the dictionary from file
function getDictionary() {
  global $dictionaryName;
  return file($dictionaryName, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
}

// Use the game options to filter out words
function filterWords() {
  // Get the options from the $_POST array
  global $filteredWords;
  $filteredWords = array();
  $allowedLetters = splitQu($_POST["letters"]);
  $dictionary = getDictionary();
  $minLength = $_POST["minWordLen"];
  $maxLength = $_POST["maxLength"];
  $index;
  $valid;
  $trimmed;

  // Filter the words
  foreach ($dictionary as $word) {
    $trimmed = trim($word);
    if (strlen($trimmed) >= $minLength && $maxLength >= strlen($trimmed)) {
      $valid = TRUE;
      for($i=0; $i<strlen($trimmed); $i++) {
        if (!in_array(substr($trimmed, $i, 1), $allowedLetters)) {
          $valid = FALSE;
          break;
        }
      } 
      if ($valid) {
        array_push($filteredWords, $trimmed);
      }
    }
  }

  // Return response text
  echo json_encode($filteredWords);
}

// Split any 'qu' tiles into q and u to enable 
// character-by-character validation
// $letterList: an array of tile contents
function splitQu($letterList) {
  $splitWords = array();
  foreach ($letterList as $tileContent) {
    if (strtolower($tileContent) == "qu") {
      array_push($splitWords, "q");
      array_push($splitWords, "u");
    } else {
      array_push($splitWords, $tileContent);
    }
  }
  return $splitWords;
}

filterWords();
?>