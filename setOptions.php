<?php
  $jsonObj = array(
    'minWordLen' => $_POST['minWordLen'],
    'maxWordLen' => $_POST['maxWordLen'],
    'boardSize' => $_POST['boardSize'],
    'qType' => $_POST['qType'],
    'tileWeights' => $_POST['tileWeights']
  );
  file_put_contents('lib/GameOptions.json', json_encode($jsonObj));
  echo json_encode($jsonObj);
?>