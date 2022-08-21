<?php
//header('Content-type: application/json');

$verb_endings = array(
    "es" => array(
        "ar" => array(
            "o", "as", "a", "amos", "a/is", "an", // Present
            "e", "es", "emos", "e/is", "en", // Subjunt
            "ad", // Imperative
            "ando", // Infinitive
            "ado",
            "ari/a", "ari/as", "ari/amos", "ari/ais", "ari/an",

            "e/", "aste", "o/", "aste/is", "aron", // Past
            "aba", "abas", "a/bamos", "aba/is", "aban", // Past

            "are/", "ara/s", "ara/", "aremos", "are/is", "ara/n", // Future

        ),

        "er" => array(
            "es", "e", "emos", "e/is", "en", // Present
            "a", "as", "a", "amos", "a/is", "an", // Subjunt
            "ed", // Imperative
            "iendo", // Infinitive
            "eri/a", "eri/as", "eri/amos", "eri/ais", "eri/an",

            "i/", "iste", "io/", "iste/is", "ieron", // Past
            "i/a", "i/as", "i/amos", "i/ais", "i/an", // Past

            "ere/", "era/s", "era/", "eremos", "ere/is", "era/n", // Future

        ),

        "ir" => array(
            "imos", "i/s", // Present
            // Subjunt equal to "er"
            "id", // Imperative
            // Infinitive equal to "er"
            "iri/a", "iri/as", "iri/amos", "iri/ais", "iri/an",

            // Past equal to "er"
            // Past equal to "er"

            "ire/", "ira/s", "iremos", "irei/s", "ira/n" // Future
        )

    )
);


$letter_exceptions = array(
    "es" => array(
        "c" => "z"
    )
);


function echoln($str){
    echo($str."<br>");
}


// Only in spanish


/**
 * Returns if the current $needle is a conjugation of a verb or not
 */
function check_verb($needle, $haystack){
    global $verb_endings, $letter_exceptions;
    $pattern = "/[a, e, i]r#$/";
    foreach($haystack as $word){
        if(!preg_match($pattern, $word)) continue;
        // Gets the root. Ex: jugar# -> jug
        $word_root = substr($word, 0, -3);

        // Let's see if one of those words is a verb (and fits with the conj of the $needle)
        foreach($verb_endings["es"] as $conj){
            foreach($conj as $ending){
                if("*".$needle == $word_root.$ending){
                    return true;
                }
            }
        }

        // Now, the same process, but, changing one letter (to handle exceptions)
        // Example: (spanish) vencer -> venza (not venca)
        foreach($verb_endings["es"] as $conj){
            // Removes the letter that could be the exeption
            $word_sub_root = substr($word_root, 0, -1);
            foreach($letter_exceptions["es"] as $letter){
                $word_root = $word_sub_root.$letter;
                foreach($conj as $ending){
                    if("*".$needle == $word_root.$ending){
                        return true;
                    }
                }
            }
        }



    }

    return false;
}


/**
 * Converts accent characters in the normal vocal followed by a slash
 */
function remove_accents($word){
    $word = utf8_encode($word);
    $word = str_replace('ñ', 'n~', $word);
    $word = str_replace(
        array('á', 'à', 'ä', 'â'),
        'a/',
        $word
    );

    $word = str_replace(
        array('é', 'è', 'ë', 'ê'),
        'e/',
        $word
    );

    $word = str_replace(
        array('í', 'ì', 'ï', 'î'),
        'i/',
        $word
    );

    $word = str_replace(
        array('ó', 'ò', 'ö', 'ô'),
        'o/',
        $word
    );

    $word = str_replace(
        array('ú', 'ù', 'ü', 'û'),
        'u/',
        $word
    );


    return $word;
}


/**
 * Return which array contains the needle
 */
function compare_arrays($needle, $array1, $array2){
    $index = 0;
    
    $cleanNeedle = str_replace("/", "", $needle);
    $asciiNeedle = ord($cleanNeedle[$index]);

    $firstChunk = str_replace("*", "", str_replace("/", "", $array1[count($array1) - 1]));
    $firstChunkAscii = ord($firstChunk[$index]);

    $lastChunk = str_replace("*", "", str_replace("/", "", $array2[0]));
    $lastChunkAscii = ord($lastChunk[$index]);

    
    while(($asciiNeedle < $firstChunkAscii && $asciiNeedle > $lastChunkAscii) || ($asciiNeedle == $firstChunkAscii && $asciiNeedle == $lastChunkAscii)){
        $index++;
        if($index >= strlen($cleanNeedle)){
            return -1;
        }
        
        $asciiNeedle = ord($cleanNeedle[$index]);
        $firstChunkAscii = ord($firstChunk[$index]);
        $lastChunkAscii = ord($lastChunk[$index]);


    }

    
    if (ord($cleanNeedle[$index]) < $firstChunkAscii) {
        // First array may contain the word
        return 0;
    }


    if (ord($cleanNeedle[$index]) > $lastChunkAscii) {
        // Second array may contain the word
        return 1;
    }

    // If the word hasn't been found
    return -1;
}


function search_needle($haystack, $delim, $needle){
    global $response;
    $array = explode($delim, $haystack);

    if (count($array) < 300) {
        $to_search = "*".$needle."#";
        $result = strpos($haystack, $to_search);
        if(!$result){
            $result = check_verb($needle, $array);
        }

        $response[$needle] = $result ? true : false;
        return;
    }

    $sub_arrs = array();
    array_push($sub_arrs, array_slice($array, 0, round(count($array) / 2)));
    array_push($sub_arrs, array_slice($array, round(count($array) / 2), count($array)));

    // Index starting at 1 to avoid * character
    $result = compare_arrays($needle, $sub_arrs[0], $sub_arrs[1]);
    if($result < 0) {
        $response[$needle] = false;
        return;
    }

    search_needle(implode($delim, $sub_arrs[$result]), $delim, $needle);
}

if(!isset($_GET["words"])) die();
$allWords = json_decode($_GET["words"]);

if(empty($allWords)) die();

// Max num of words per call
if(count($allWords) > 200){
    $allWords = array_slice($allWords, 0, 200);
}



$dict = file_get_contents('./words-base/spanish.lex');


$response = array();
foreach($allWords as $word){
    if($word == "") continue;
    $word = utf8_decode(strtolower($word));
    if(!empty($response[$word])) continue;
    $parsedWord = remove_accents($word);
    search_needle($dict, "\n", $parsedWord);
}

echo (json_encode($response));