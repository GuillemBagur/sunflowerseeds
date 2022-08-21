const overwrite = document.getElementById("overwrite");
let spellingMistakes;

// Delete the whole text of a page
const deleteText = () => {
  let ans = confirm("¿Seguro que quieres eliminar todo el texto de esta hoja?");
  if (!ans) return;
  // If confirmation == true
  text.innerHTML = ""; // Delete
  renderLetters(); // Just in case
  // Save changes

  // Feedback
  toast.innerHTML = feedback["delete"];
  toast.classList.remove("hidden");
  sleep(2500).then(() => {
    toast.classList.add("hidden");
  });
};

// Copy the whole text of a page
const copyText = () => {
  text.select();
  text.setSelectionRange(0, 99999); /* For mobile devices */

  /* Copy the text inside the text field */
  navigator.clipboard.writeText(text.innerHTML);
  clearSelection();
  text.blur();

  toast.innerHTML = feedback["copy"];
  toast.classList.remove("hidden");
  sleep(3000).then(() => {
    toast.classList.add("hidden");
  });
};

const pasteText = () => {
  navigator.clipboard.readText().then(
    (cliptext) => {
      text.innerText = cliptext;
      console.log(cliptext);
    },
    (err) => console.log(err)
  );
};

const checkSpelling = () => {
  const options = JSON.parse(localStorage.getItem("sunflower-seeds") ?? "{}");
  if (!options["active-dict"]) {
    document.getElementById("text").innerHTML =
      document.getElementById("text").innerText;
    return;
  }
  const dict = options.dictionary ?? [];
  console.log(text.innerHTML);
  if (text.innerHTML == "") {
    text.innerHTML = (options || {}).hasOwnProperty("text")
      ? options["text"]
      : "";
  }
  const allWords = removePunctuation(text.innerHTML).split(/\s+/g);
  console.log(dict);
  const allDifferentWords = allWords
    .filter((el, index) => allWords.indexOf(el) == index)
    .filter((el, index) => {
      console.log(el, !dict.includes(el));
      return !dict.includes(el);
    });

  const maxLengthWords = allDifferentWords.slice(0, 200); // Only 200 different words allowed
  const url = "corrector.php?";
  const params = new URLSearchParams({ words: JSON.stringify(maxLengthWords) });

  const xhr = new XMLHttpRequest();
  xhr.open("GET", url + params);
  xhr.onload = () => {
    console.log(url + params);
    if (xhr.status === 200) {
      const response = JSON.parse(xhr.responseText) || xhr.responseText;
      console.log(response);
      highLightSpellingErrors(response);
      spellingMistakes = response;
    } else {
      console.log("Error " + xhr.status);
    }
  };

  xhr.send();
};
