function setupCamera() {
  capture = createCapture(VIDEO);
  capture.size(width, height);
  capture.hide();
}
