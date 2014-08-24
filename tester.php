<?php 
$dictionary;
$dictionaryName = 'lib/dictionary.txt';
function getDictionary() {
  global $dictionary, $dictionaryName;
  $dictionary = file($dictionaryName);
}

function printWords() {
  global $dictionary;
  foreach ($dictionary as $word) {
    echo "<li class='result'>{$word}</li>";
  }
}

getDictionary();
?>

<html>
<head>
  <title>Word Scramble Solver</title>
</head>
<body>
  <ul class="resultList">
    <?php printWords(); ?>
  </ul>
</body>