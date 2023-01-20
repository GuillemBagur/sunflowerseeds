// CODE UNDER MIT LICENSE
// BY GUILLEM URIEL BAGUR MOLL - 2021
// CONTACT ME VIA guillembagurmoll@gmail.com

// All option-inputs/selects
const appOptions = document.getElementsByClassName("app-option");
const coloredLetters = document.getElementById("colored-letters");
const displayText = document.getElementById("text");

// Add highlighted letter button and input
const addLetter = document.getElementById("add-letter");
const letterToColor = document.getElementById("new-letter");
const chosenColor = document.getElementById("letter-color");

const appLang = document.getElementById("langsel");

// getKeyData function is in 'js/miscelaneous-functions.js'
let options = JSON.parse(getKeyData("sunflower-seeds", "{}", true));
const text = document.getElementById("text");

// Load user-selected options from localStorage
// The unique key is 'sunflower-seeds'. It's a JSON
const loadOptions = () => {
  // If a property already exists, get the saved value
  // If not, use the current value of the input
  for (let el of appOptions) {
    el.value = options.hasOwnProperty(el.id) ? options[el.id] : el.value;
  }
};

const saveText = () => {
  savingTimes = 0;

  const cleanText = text.innerText.replace("\n", "</br>");
  options["text"] = cleanText;
  localStorage.setItem("sunflower-seeds", JSON.stringify(options));
};

let savingTimes = 0;
const execSaveText = () => {
  savingTimes++;
  if (savingTimes < 10) return;
  saveText();
};

// Update options when input is changing
const updateOptions = () => {
  for (let el of appOptions) {
    // Every option-input id is the name of the property
    let styleProperty = el.id
      // This regex converts the dash-case to camelCase (used in vanilla JS to modify CSS)
      .replace(/-([a-zA-Z])/g, (letter) => `${letter.toUpperCase()}`)
      .replace(/\-/g, "");

    // If the property needs units, append 'px'
    let unit = el.classList.contains("option-input") ? "px" : "";
    changeStylesToClass("text", styleProperty, el.value, unit);
  }
};

// Save all the values when a change is done
const saveOptions = () => {
  for (let el of appOptions) {
    options[el.id] = el.value;
  }

  localStorage.setItem("sunflower-seeds", JSON.stringify(options));
};

const deleteColoredLetter = (el) => {
  // Ask for a confirmation to delete a letter configuration
  let ans = confirm(`¿Seguro que quieres eliminar la letra "${el.innerHTML}"?`);
  if (!ans) return;

  // If confirmed, delete the letter
  el.remove();
  delete options["letters"][el.innerHTML];
  localStorage.setItem("sunflower-seeds", JSON.stringify(options));
};

const showColoredLetters = () => {
  // Display all letters into the 'colored-letters' div
  for (let letter in options["letters"]) {
    // If a letter is empty, don't show
    if (letter == "") continue;

    let color = options["letters"][letter];
    coloredLetters.innerHTML += `<span class="colored-letter" onclick="deleteColoredLetter(this)" style="background-color:${color}">${letter}</span>`;
  }
};

// Highlight specific characters
const hlLetters = () => {
  // Load all letters/chars chosen by user (in options)
  // Struct: "char":"color"
  let letters = options.hasOwnProperty("letters") ? options["letters"] : {};
  let processedText = text.innerHTML;

  // Convert all chars to a string (we'll use that string in the regex)
  let chars = "";
  for (let letter in letters) {
    chars += letter;
  }

  // Global regex that turns every letter/char to its color
  let regex = new RegExp(`(?<!<[^>]*)[${chars}]`, "gi");
  processedText = processedText
    .replace(/\r?\n|\r/gi, "<br>")
    .replace(regex, (char) => {
      let color = letters[char.toLowerCase()] ?? letters[char.toUpperCase()];
      return `<span style='color:${color}'>${char}</span>`;
    });

  document.getElementById("text").innerHTML = processedText;
};

// Load and prepare to display colored letters into div correctly
const renderLetters = () => {
  coloredLetters.innerHTML = "";
  options["letters"] = options.hasOwnProperty("letters")
    ? options["letters"]
    : {};
  options["letters"][letterToColor.value] = chosenColor.value;
  localStorage.setItem("sunflower-seeds", JSON.stringify(options));

  if (spellingMistakes) {
    highLightSpellingErrors(spellingMistakes);
  }

  hlLetters();
  showColoredLetters();
  updateOptions();
};

const saveOverwrite = () => {
  options["overwrite"] = overwrite.checked;
  localStorage.setItem("sunflower-seeds", JSON.stringify(options));
};

overwrite.addEventListener("click", saveOverwrite);

const saveUseDict = () => {
  options["active-dict"] = document.getElementById("active-dict").checked;
  console.log(document.getElementById("active-dict").checked, options["active-dict"]);
  localStorage.setItem("sunflower-seeds", JSON.stringify(options));
}

document.getElementById("active-dict").addEventListener("click", saveUseDict);

const highLightSpellingErrors = (mistakes) => {
  for (let word in mistakes) {
    if (!mistakes[word]) {
      const regex = new RegExp(word, "gi");
      document.getElementById("text").innerHTML = document
        .getElementById("text")
        .innerText.replace(
          regex,
          `<span class="spelling-error">${word}</span>`
        );
    }
  }
};

const checkUsedTimes = () => {
  const savedOptions =
    JSON.parse(localStorage.getItem("sunflower-seeds")) || {};
  savedOptions["used-times"] = savedOptions.hasOwnProperty("used-times")
    ? savedOptions["used-times"] + 1
    : 1;

  saveStat("used-times", 1);
  localStorage.setItem("sunflower-seeds", JSON.stringify(savedOptions));
  if (
    savedOptions.hasOwnProperty("show-share-app") &&
    !savedOptions["show-share-app"]
  ) {
    checkNewUser();
    return;
  }
  if (savedOptions["used-times"] % 10 === 0) {
    openPopup("share-app");
    return;
  }

  checkNewUser();
};

document.getElementById("show-share-app").addEventListener("click", () => {
  const savedOptions =
    JSON.parse(localStorage.getItem("sunflower-seeds")) || {};
  savedOptions["show-share-app"] =
    !document.getElementById("show-share-app").checked;
  localStorage.setItem("sunflower-seeds", JSON.stringify(savedOptions));
});

const changeLang = () => {
  window.location.href = `index.php?lang=${appLang.value}`;
};

window.addEventListener("DOMContentLoaded", () => {
  const options = JSON.parse(localStorage.getItem("sunflower-seeds") ?? "{}");
  checkUsedTimes();
  text.innerHTML = (options || {}).hasOwnProperty("text")
    ? options["text"]
    : "";

  loadOptions();
  updateOptions();
  addEventListenerToClass("change", "app-option", () => {
    saveOptions();
    updateOptions();
  });

  overwrite.checked = options["overwrite"] ?? false;
  document.getElementById("active-dict").checked = options["active-dict"] ?? false;

  // While changing a value, the option panel turns semi transparent
  addEventListenerToClass("mousedown", "option-input", () => {
    const optionsPanel = document.getElementById("options");
    optionsPanel.style.opacity = ".2";
  });

  // Then, 100% opac
  addEventListenerToClass("mouseup", "option-input", () => {
    const optionsPanel = document.getElementById("options");
    optionsPanel.style.opacity = "1";
  });

  addLetter.addEventListener("click", () => {
    if (letterToColor.value == "") {
      alert("Tienes que escribir un carácter");
      return;
    }

    renderLetters();
  });

  appLang.addEventListener("blur", changeLang);

  document.getElementById("speech-highlight").addEventListener("change", () => {
    options["speech-highlight"] =
      document.getElementById("speech-highlight").checked;
    saveOptions();
    updateOptions();
  });

  document.getElementById("speech-highlight").checked =
    options["speech-highlight"];

  fromOrtografia = localStorage.getItem("from-ortografia");
  if (fromOrtografia) {
    text.innerHTML = fromOrtografia;
  }

  localStorage.removeItem("from-ortografia");

  checkSpelling();

  if (options["text"]) {
    text.innerHTML = options["text"];
  }

  

  const saveTextIntoHistory = () => {
    let history = options["history"] ?? [];
    if (history === {}) history = [];
    const cleanText = text.innerHTML.replace(/<[^>]*>/gi, "");
    if (history.includes(cleanText)) return;
    history.unshift(cleanText);
    if (history.length > 10) {
      history.length = 10;
    }

    options["history"] = history;
    localStorage.setItem("sunflower-seeds", JSON.stringify(options));
    saveText();
  };

  text.addEventListener("input", execSaveText);
  text.addEventListener("blur", () => {
    saveTextIntoHistory();
    hlLetters();
    showColoredLetters();
    updateOptions();
  });

  text.addEventListener("click", (evt) =>
    propagateEvent(evt, "spelling-error", promptAddToDict)
  );

  background.addEventListener("click", () => {
    updateOptions();
  });
});


