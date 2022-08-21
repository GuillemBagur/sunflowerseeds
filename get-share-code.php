<?php

if (!isset($_GET["text"])) {
    die();
}

$text = $_GET["text"];
$lang = (isset($_GET["lang"])) ? $_GET["lang"] : "es";
require_once("../jucar/upload/conexion.php");
$time = time();
$minutes = 10;
$timeLessMargin = $time - $minutes * 60 * 1000;

$codesQuery = mysqli_query($conexion, "SELECT * FROM sunflowerseeds");
$codes = array();

while ($row = mysqli_fetch_row($codesQuery)) {
    array_push($codes, $row[0]);
}


$code = null;

for ($i = 0; $i < 10000; $i++) {
    if (in_array($i, $codes)) continue;
    $code = $i;
}

$removedRows = mysqli_query($conexion, "DELETE FROM sunflowerseeds WHERE D < '$timeLessMargin'");

if ($code === null) {
    header("Location: index.php?lang=".$lang."&code=error");
    die();
}

$length = 4;
$string = substr(str_repeat(0, $length) . $code, -$length);
$code = strval($string);
$setNewCode = mysqli_query($conexion, "INSERT INTO sunflowerseeds (CODE, TEXT, D) VALUES ('$code', '$text', '$time')");


header("Location: index.php?lang=".$lang."&showCode=true&code={$code}");
