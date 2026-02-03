// script.js — Updated for PlantAR QR flow

document.addEventListener("DOMContentLoaded", () => {
  // when the scanner successfully reads a QR
  function onScanSuccess(decodedText) {
    console.log("QR decoded:", decodedText);

    // If the QR contains "plantar:" (for example "plantar:sunflower")
    if (/^plantar:/i.test(decodedText)) {
      // send the user to your plant info page
      window.location.href = "main.html";
    }
    // If it's a website URL
    else if (/^https?:\/\//i.test(decodedText)) {
      if (confirm(`Open link?\n\n${decodedText}`)) {
        window.open(decodedText, "_blank");
      }
    }
    // Otherwise just show the scanned text
    else {
      alert(`Your QR says: ${decodedText}`);
    }
  }

  // if the scan fails
  function onScanError(errorMessage) {
    console.warn("QR scan error:", errorMessage);
  }

  // set up the scanner
  const htmlscanner = new Html5QrcodeScanner("my-qr-reader", {
    fps: 10,    // frames per second for scanning
    qrbox: 250  // box size
  });

  htmlscanner.render(onScanSuccess, onScanError);
});
