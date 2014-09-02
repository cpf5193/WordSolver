<?php
  $jsonObj = file_get_contents('lib/GameOptions.json');
  echo json_encode($jsonObj);
?>