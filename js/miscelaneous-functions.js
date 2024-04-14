// Links to some external functions

text.addEventListener("blur", function () {
  console.log(document.getElementById("text").innerHTML);
  text.innerHTML = refreshFormat(text.innerHTML);
});

// Remove unnecessary spaces
const cleanText = (text) => {
  return text.replace(/ +/g, " ").replace(/&nbsp;/g, " ");
};

function refreshFormat(text) {
  if (!text) return "";
  if (!text.length) return "";
  text = removeHTMLTags(text);
  text = cleanText(text);
  text = addBrs(text);
  console.log(text);
  return text;
}

function removeHTMLTags(text) {
  return text
    .replace(/<br(\s+)?\/?>/gi, "\n")
    .replace(/<div(\s+)?\/?>/gi, "\n")
    .replace(/<[^>]*>/gi, "");
}

function addBrs(text) {
  return text.replace(/\n/g, "<br />");
}

// Get data from a key of localStorage by a secure way
// Maybe it could be entirely replaced by adding ?? [altValue]
// to all localStorage.getItem
const getKeyData = (keyName, def, ret) => {
  if (localStorage.getItem(keyName) === null)
    localStorage.setItem(keyName, def);
  if (ret) return localStorage.getItem(keyName);
};

// https://stackoverflow.com/questions/7176908/how-can-i-get-the-index-of-an-object-by-its-property-in-javascript/
// It's like indexOf but related to objects
function findWithAttr(array, attr, value) {
  for (let i = 0; i < array.length; i++) {
    if (array[i][attr] === value) {
      return i;
    }
  }
  return -1;
}

// Like a find function, but instead of equals, the criteria is "starts with"
function findStartsWith(array, attr, value) {
  for (let i = 0; i < array.length; i++) {
    const regex = new RegExp(`^${value}`);
    if (regex.test(array[i][attr])) {
      return i;
    }
  }
  return -1;
}

// This function filters which characters put by user is a letter/num (to be able to color)
function checkAvailableLetter(evt) {
  var code = evt.which ? evt.which : evt.keyCode;
  if (code <= 32) {
    return false;
  } else {
    return true;
  }
}

// A function to add an eventListener to all elements that contain a specific class
const addEventListenerToClass = (evt, className, func) => {
  let els = document.getElementsByClassName(className);
  for (let el of els) {
    el.addEventListener(evt, func);
  }
};

// Same as previous, but to change the innerHTML
const changeInnerHTMLToClass = (className, inner) => {
  let els = document.getElementsByClassName(className);
  for (let el of els) {
    el.innerHTML = inner;
  }
};

// Same as previous, but to change the syles
const changeStylesToClass = (className, style, value, unit) => {
  let els = document.getElementsByClassName(className);
  for (let el of els) {
    el.style[style] = `${value}${unit}`;
  }
};

// https://stackoverflow.com/questions/6562727/is-there-a-function-to-deselect-all-text-using-javascript
// Deselect all text to select the text inside #text and copy it
function clearSelection() {
  if (window.getSelection) {
    window.getSelection().removeAllRanges();
  } else if (document.selection) {
    document.selection.empty();
  }
}

// https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep/951057#951057
// Typical sleep function
function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

// https://stackoverflow.com/a/36281449
// Get the b64 code of an image
function getBase64(file) {
  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function () {
    return reader.result;
  };
  reader.onerror = function (error) {
    console.log("Error: ", error);
  };
}

const removeClass = (className, inner) => {
  const els = document.getElementsByClassName(className);
  for (let el of els) {
    console.log(el.innerHTML, inner);
    if (el.innerHTML == inner) el.classList.remove(className);
  }
};

const copyFrom = (elId) => {
  const el = document.getElementById(elId);
  el.focus();
  el.select();
  el.setSelectionRange(0, 99999); /* For mobile devices */

  /* Copy the text inside the text field */
  navigator.clipboard.writeText(el.innerHTML);
  clearSelection();
  el.blur();

  toast.innerHTML = feedback["copy"];
  toast.classList.remove("hidden");
  sleep(3000).then(() => {
    toast.classList.add("hidden");
  });
};

const clearInput = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = "";
};

/**
 * Removes all the characters that aren't letters from a text. Spaces are kept.
 *
 *
 * @param {string} text - The text to remove punctuation from
 * @returns The text without punctuation
 */
const removePunctuation = (text) => {
  return text.replace(/[^a-zA-Z\s]/g, "");
};

const showWordCorrector = (el, coords) => {
  const yDesv = 35;
  const word = el.innerHTML
    .replace(/<br \/>/, "\n")
    .replace(/<br>/, "\n")
    .replace(/<[^>]*>/gi, "");
  const wordCorrector = document.getElementById("word-corrector");
  console.log(wordCorrector);
  const msgBox = `Añadir "${word}" al diccionario`;
  wordCorrector.innerHTML = msgBox;
  wordCorrector.dataset.word = word;
  openPopup("word-corrector");
  console.log(coords);
  wordCorrector.style.top = `${yDesv + coords.y}px`;
  wordCorrector.style.left = `${coords.x}px`;
  wordCorrector.style.transform = "none";
};

/**
 *
 * @param {event} evt - The event
 * @param {string} targetClass - Class of the target element
 * @param {function} callback - Callback
 */
const propagateEvent = (evt, targetClass, callback) => {
  if (![...evt.target.classList].includes(targetClass)) return;
  callback(evt.target, { x: evt.clientX, y: evt.clientY });
};

const promptAddToDict = (el, coords) => {
  showWordCorrector(el, coords);
  return;
};

/**
 * Sets a new word in the personal dictionary (saved in localStorage)
 *
 * @param {HTML element} el - The span that has been clicked
 *
 */
const addWordToDict = (el) => {
  const word = el.dataset.word;
  let options = JSON.parse(localStorage.getItem("sunflower-seeds") ?? "{}");
  if (!options.dictionary) options.dictionary = [];
  if (options.dictionary.includes(word)) return;
  options.dictionary.push(word);
  console.log(options);
  localStorage.setItem("sunflower-seeds", JSON.stringify(options));
  hideAllPopups();
  removeClass("spelling-error", word);
};

const saveStat = (stat, valToSum) => {
  let stats = JSON.parse(localStorage.getItem("sunflower-seeds-stats") || "{}");
  let newVal = stats[stat] ?? 0;
  newVal += valToSum;
  stats[stat] = newVal;
  localStorage.setItem("sunflower-seeds-stats", JSON.stringify(stats));
};
