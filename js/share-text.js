const execShare = () => {
  const currentUrl = document.location.href;
  const alreadyGotCode = currentUrl.includes("code=");
  if (alreadyGotCode) {
    openPopup("share-text");
  } else {
    saveStat("share-text", 1);
    const text = document.getElementById("text");
    // Send text to API removing all HTML tags
    window.location.href = `get-share-code.php?lang=${jsLang}&text=${text.innerHTML.replace(
      /<[^>]*>/gi,
      ""
    )}`;
  }
};

const getTextFromCode = () => {
  const code = document.getElementById("shared-code").value;
  window.location.href = window.location.href.split("?")[0] + `?text=${code}`;
};


