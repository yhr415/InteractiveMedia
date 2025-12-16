PImage whiteGerbera;
PFont fontGalmuri;

int step = 8;
float thresh = 30;
String charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?@#$%&*";

float t = 0;
float speed = 0.02;
float freq = 0.08; // 노이즈 공간 주파수
float flickerZone = 200; // 임계값 주변(윤곽) 영역의 폭

void setup() {
  size(1000, 600);
  whiteGerbera = loadImage("whiteGerbera.png");
  rectMode(CENTER);
  colorMode(HSB, 255);
  imageMode(CENTER);
  fontGalmuri = createFont("Galmuri11.ttf", step * 1.2);
  textFont(fontGalmuri);
  textAlign(CENTER, CENTER);
  noStroke();
}

void draw() {
  background(0);
  whiteGerbera.loadPixels();
  float startX = (width - whiteGerbera.width) * 0.5;
  float startY = (height - whiteGerbera.height) * 0.5;

  for (int y = 0; y < whiteGerbera.height; y += step) {
    for (int x = 0; x < whiteGerbera.width; x += step) {
      int idx = y * whiteGerbera.width + x;
      int c = whiteGerbera.pixels[idx];
      float b = brightness(c);

      if (b >= thresh) {
        float hueVal = hue(c);
        float satVal = saturation(c);

        // 윤곽선 근처면 flicker (등장 확률 조절)
        float appearProb;

        if (b < thresh + flickerZone) {
          // thresh~thresh+flickerZone 사이 → 노이즈 기반 확률
          float n = noise(x * freq, y * freq, t);
          appearProb = map(b, thresh, thresh + flickerZone, 0.1, 1.0);
          // 노이즈가 appearProb보다 작을 때만 표시
          if (n > appearProb) continue;
        }

        // 글자 표시
        fill(hueVal, satVal, 255);
        char randChar = charset.charAt(int(random(charset.length())));
        float px = startX + x + step * 0.5;
        float py = startY + y + step * 0.5;
        text(str(randChar), px, py);
      }
    }
  }

  t += speed;
}
