let gameFont;

let titleText;
let titleTextSize;
let titleTextColor;

let menuText;
let menuTextSize;
let menuTextColor;

let selectionText = '>  ';
let selectionTextColor;
let curSelection = 0;

let menuLoaded = true;
let isMobileDevice;
let textPlacement;

function preload() {
  try {
    gameFont = loadFont('prstart.ttf');
  } catch (error) {
    console.error('Font failed to load:', error);
  }

  let details = navigator.userAgent || '';
  let regexp = /android|iphone|kindle|ipad/i;
  isMobileDevice = regexp.test(details);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(gameFont);
  textAlign(CENTER);
  
  setColorsAndSizes();
}

function draw() {
  background(10);
  drawBG();
  if (menuLoaded) {
    drawMenu();
  }
}

function setColorsAndSizes() {
  titleText = "Nilsine's Interactive Art Portfolio";
  titleTextSize = min(windowWidth, windowHeight) / 20;
  titleTextColor = color(200, 50, 255);

  menuText = ['Story Mode', 'Arcade Mode', 'Gallery', 'Regular Portfolio Site'];
  menuTextSize = titleTextSize * 0.75;
  menuTextColor = color(120, 30, 153);
  selectionTextColor = color(250, 40, 100);
}

function drawBG() {
  let size = width * 0.575;
  let red = 150, green = 100, blue = 255;
  let red2 = 9, green2 = 4, blue2 = 199;
  let xPos = width * 0.29, yPos = height * 0.005;
  let x2 = width - xPos * 0.51, y2 = height * 0.48;
  let count = 0;
  let shape2 = true;

  noStroke();
  noFill();
  drawShape(xPos, yPos + height * 0.11, color(red - 130, green - 85, blue - 195), size * 0.9, !shape2);
  drawShape(x2, y2 * 1.07, color(red2 - 5, green2 - 3, blue2 - 150), -size * 0.75, shape2);
  stroke(155);
  while (size >= 0) {
    drawShape(xPos, yPos, color(red, green, blue), size, !shape2);
    drawShape(x2, y2, color(red2, green2, blue2), -size * 0.8, shape2);
    textPlacement = (x2- (xPos+size)*3) /2;
    size -= 5;
    red -= 1.25;
    red2 += 1.25;
    green -= 0.85;
    green2 += 0.85;
    if (count >= 1) {
      blue--;
      blue2++;
      count = 0;
    } else {
      count++;
    }
  }
}

function drawShape(x, y, fillColor, size, shape2) {
  fill(fillColor);
  stroke(fillColor);
  beginShape();
  vertex(x, y);
  if (!shape2) {
    bezierVertex(x + size, y + size, x - size, y + size, x, y);
  } else {
    bezierVertex(x + size, y + size, x + size, y - size, x, y);
  }
  endShape(CLOSE);
}

function drawMenu() {
  // Calculate positions dynamically
  let leftShapeX = width * 0.29;
  let rightShapeX = width - leftShapeX * 0.51;
  let rightShapePointX = rightShapeX + (width * 0.575) * 0.8; // Right shape point X-coordinate
  let titleX = textPlacement; // Center between shapes
  let titleWidth = rightShapePointX - leftShapeX; // Available width for title
  
  // Dynamically adjust title size to fit
  textSize(1); // Start small for measurement
  while (textWidth(titleText) < titleWidth && textSize() < windowHeight / 24) {
    textSize(textSize() + 1);
  }
  titleTextSize = textSize(); // Save the final size
  menuTextSize = titleTextSize * 0.7;

  // Draw the title
  fill(titleTextColor);
  textAlign(CENTER);
  text(titleText, titleX, height / 2 - titleTextSize*0.25, rightShapePointX - leftShapeX);

  // Draw menu instructions and selections
  menuSelection();

  textSize(menuTextSize * 0.8);
  fill(255);
  stroke(100, 55, 55);
  let instructionText = isMobileDevice
    ? "Tap on a Menu Option to Select it."
    : "Use the Up/Down Arrow Keys to Select. Enter or Left Click to Confirm.";
  text(instructionText, 0, height - menuText.length * titleTextSize, width, menuTextSize * 3);
}

function menuSelection() {
  for (let c = 0; c < menuText.length; c++) {
    textSize(c === curSelection ? menuTextSize * 1.1 : menuTextSize);
    fill(c === curSelection ? selectionTextColor : menuTextColor);
    text(
      (c === curSelection ? selectionText : "") + menuText[c],
      0,
      height / 2 + menuTextSize * (3 + 2 * c),
      width
    );
  }
}

function keyPressed() {
  if (keyCode === ENTER) {
    gotoSelection();
  } else if (keyCode === DOWN_ARROW) {
    curSelection = (curSelection + 1) % menuText.length;
  } else if (keyCode === UP_ARROW) {
    curSelection = (curSelection - 1 + menuText.length) % menuText.length;
  }
}

function mousePressed() {
  for (let c = 0; c < menuText.length; c++)
  {
    if (mouseY > height / 2 + menuTextSize * (1 + 2*c) && mouseY <= height / 2 + menuTextSize * (1 + 2*(c+1))) {
      if (curSelection != c) {
        curSelection = c;
      }
      else {
        gotoSelection();
      }
    }
  }
}

function gotoSelection() {
  console.log("You selected", menuText[curSelection]);
  const pages = ["story.html", "arcade.html", "gallery.html", "standardp/index.html"];
  if (curSelection >= 0 && curSelection < pages.length) {
    window.location.href = pages[curSelection];
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setColorsAndSizes();
}
