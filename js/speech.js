// CODE UNDER MIT LICENSE
// BY GUILLEM URIEL BAGUR MOLL - 2021
// CONTACT ME VIA guillembagurmoll@gmail.com

const langSel = document.getElementById("audio-langsel");
const accentSel = document.getElementById("audio-accentsel");
toast = document.getElementById("modal");
let num = 0;

// This two JSONs will be used to display the value when a voice equals a key
// For example: if a voice is in 'es' (Spanish), will appear Español
// Same for accents
const langNames = {
  es: "Espa&ntildeol",
  en: "English",
  de: "Deutsch",
  fr: "Fran&ccedilais",
  ca: "Catal&agrave;",
  pt: "Portugu&ecircs",
  gl: "Galego",
  eu: "Euskara",
};

const langCountry = {
  es: "ES",
  en: "GB",
  fr: "FR",
  de: "DE",
};

const accentNames = {
  ES: "Espa&ntildea",
  US: "United States",
  GB: "Great Britain",
  DE: "Deutschland",
  FR: "France",
  PT: "Portugal",
  BR: "Brasil",
};

let btnPlay = document.getElementsByClassName("btn-speech");
let r = 1; // Start reading = true

// Preparing all arrays to push elements inside forward
let textSrc,
  voices,
  synth,
  msg,
  uniqueLangs = [];
msg = new SpeechSynthesisUtterance();

// When the voices are loaded
window.speechSynthesis.onvoiceschanged = async function () {
  if (speechSynthesis) {
    speechSynthesis.cancel(); // Just in case
  }

  if (typeof responsiveVoice != "undefined") {
    responsiveVoice.cancel();
  }

  voices = window.speechSynthesis.getVoices(); // Get the voices
  for (voice of voices) {
    // Split process to get the language of the voice
    !uniqueLangs.includes(voice.lang.split("-")[0])
      ? uniqueLangs.push(voice.lang.split("-")[0])
      : () => {};
  }

  // Refresh the langSel innerHTMl (to avoid duplicated options)
  langSel.innerHTML = "<option value='ca'>Catalan</option>";
  for (lang of uniqueLangs) {
    // Append options
    // altLang is the 'alternative name' for that langs stored in the array
    let altLang = langNames[lang] != undefined ? langNames[lang] : lang;

    let selected = lang == options["audio-langsel"] ? "selected" : "";
    langSel.innerHTML += `<option ${selected} value="${lang}">${altLang}</option>`;
  }

  updateAccents();
  //Get the user-saved language. If not exists, get Spanish
  let audioLang = getKeyData("audio-lang", "es", true);
  langSel.value = audioLang;
};

// Load accents.
// Same as loading languages, more or less.
const updateAccents = () => {
  accents = voices.filter((voice) => voice.lang.includes(langSel.value));
  accentSel.innerHTML = `
  <option selected></option>`;
  for (accent of accents) {
    let altAccent =
      accentNames[accent.lang.split("-")[1]] != undefined
        ? accentNames[accent.lang.split("-")[1]]
        : accent.lang.split("-")[1];

    let selected = accent.name == options["audio-accentsel"] ? "selected" : "";
    accentSel.innerHTML += `<option value='${accent.name}'>${altAccent}</option>`;
  }

  if (langSel.value == "ca") {
    accentSel.innerHTML += "<option value='ca' selected>Catalan</option>";
  }

  updateVoice();
};

const updateVoice = () => {
  let voiceName = getKeyData("audio-accent", "", true);
  if (!voiceName?.length || voiceName === "{}") {
    voiceName = langSel.value;
  }
  console.log(voiceName);
  if (!voiceName?.length) {
    voiceName = "es";
  }

  let chosenVoice = voices[findStartsWith(voices, "lang", voiceName)];
  return chosenVoice;
};

langSel.addEventListener("click", () => {
  localStorage.setItem("audio-lang", langSel.value);
  updateAccents();
});
accentSel.addEventListener("click", () => {
  localStorage.setItem("audio-accent", accentSel.value);
  updateVoice();
});

// SpeechSynthesis onend
const end = () => {
  toast.classList.add("hidden");
  r = 1;

  if (speechSynthesis) {
    speechSynthesis.cancel(); // Just in case
  }

  if (typeof responsiveVoice != "undefined") {
    responsiveVoice.cancel();
  }

  changeInnerHTMLToClass(
    "btn-speech",
    `<i class="icofont-audio"></i> ${speechButtonInner}`
  );

  text.innerHTML = textSrc;
  renderLetters();
};

const nextWord = (words, num) => {
  return words[num];
};

document.getElementById("highlight-color").addEventListener("change", () => {
  localStorage.setItem(
    "highlight-color",
    document.getElementById("highlight-color").value
  );
});

// This function invokes itself for every word in the text
// If there aren't any words or the user has clicked on 'stop', it ends
const speak = () => {
  let hlColor = localStorage.getItem("highlight-color") ?? "#5401d0";
  let words = removeHTMLTags(text.innerHTML).split(/\s/g);
  let word = nextWord(words, num);
  if (word == null || word == undefined || r) return end();
  words[
    num
  ] = `<span style="background-color:${hlColor};">${words[num]}</span>`;
  text.innerHTML = addBrs(words.join(" "));

  console.log(msg);
  if (langSel.value == "ca") {
    try {
      responsiveVoice.speak(word, "Catalan Male", { onend: speak });
    } catch (err) {
      alert("La voz seleccionada no está disponible actualmente");
      console.log(err);
      return;
    }
  } else {
    msg.voice = updateVoice();
    msg.text = word;
    window.speechSynthesis.speak(msg);
  }

  num++;

  msg.onend = speak;

  if (!responsiveVoice) return;
  responsiveVoice.onend = speak;
};

/* *** MAIN FUNCTION *** */
const textToSpeech = async () => {
  if (r == 1) {
    saveStat("speech", 1);
    msg.rate = parseFloat(document.getElementById("speech-rate").value);
    toast.innerHTML = feedback["speech"];
    toast.classList.remove("hidden");
    let cleanText = removeHTMLTags(text.innerHTML);
    if (document.getElementById("speech-highlight").checked) {
      num = 0;
      textSrc = cleanText;
      r = 0;
      speak();
    } else {
      textSrc = cleanText;
      r = 0;
      msg.text = textSrc;

      if (speechSynthesis) {
        speechSynthesis.cancel(); // Just in case
      }

      if (typeof responsiveVoice != "undefined") {
        responsiveVoice.cancel();
      }
      if (msg) {
        if (langSel.value == "ca") {
          try {
            console.log(msg);
            await responsiveVoice.speak(msg?.text, "Catalan Male", {
              onend: end,
            });
          } catch (err) {
            msg.voice = updateVoice();
            window.speechSynthesis.speak(msg);
            return;
          }
        } else {
          msg.voice = updateVoice();
          window.speechSynthesis.speak(msg);
        }
      }
    }

    changeInnerHTMLToClass(
      "btn-speech",
      `<i class="icofont-close"></i> ${speechButtonInner}`
    );
  } else if (r == 0) {
    end();
  }
};

msg.onend = end;

addEventListenerToClass("click", "btn-speech", textToSpeech);
