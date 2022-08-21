// EXTERNAL LIBRARY: TESSERACT.JS
// BY NAPTHA: https://tesseract.projectnaptha.com
// THANKS A LOT

const toast = document.getElementById('modal');


// @PARAM url -> b64 image
// @PARAM lang -> string from 'lang' select
// @RETURN puts the result on the selected sheet
const ocr = (url, lang) => {
  toast.innerHTML = feedback['ocr'];
  toast.classList.remove('hidden');
  Tesseract.recognize(
    url,
    lang, {
      logger: m => console.log(m)
    }
  ).then(({
    data: {
      text
    }
  }) => {
    document.getElementById('text').innerHTML = (overwrite.checked) ? text : document.getElementById('text').innerHTML + text;
    renderLetters();
    toast.classList.add('hidden');
    saveStat("ocr", 1);
  });

}