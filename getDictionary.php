<?php 
$dictionary;
$filteredWords;
$dictionaryName = 'lib/dictionary.txt';
function getDictionary() {
  global $dictionaryName;
  return file($dictionaryName, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
}

function filterWords() {
  global $filteredWords;
  $filteredWords = array();
  $allowedLetters = $_POST["letters"];
  $minLength = $_POST["minWordLen"];
  $dictionary = getDictionary();
  $index;
  $valid;
  $trimmed;
  foreach ($dictionary as $word) {
    $trimmed = trim($word);
    if (strlen($trimmed) >= $minLength && $_POST["gridSize"] >= strlen($trimmed)) {
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
  echo json_encode($filteredWords);
}

filterWords();
?>