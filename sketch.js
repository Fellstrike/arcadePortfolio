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

function preload() {
  gameFont = loadFont('prstart.ttf');

    //DETECT A MOBILE PHONE OR TABLET
    // Storing user's device details in a variable
  let details = navigator.userAgent;

  /* Creating a regular expression 
  containing some mobile devices keywords 
  to search it in details string*/
  let regexp = /android|iphone|kindle|ipad/i;

  /* Using test() method to search regexp in details
  it returns boolean value*/
  isMobileDevice = regexp.test(details);
  console.log(details);
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  background(10);
  textFont(gameFont);
  textAlign(CENTER);

  titleText = "Nilsine's Interactive Art Portfolio";
  titleTextSize = windowWidth / 50;
  titleTextColor = color(200, 50, 255);

  menuText = ['Story Mode', 'Arcade Mode', 'Gallery', 'Regular Portfolio Site'];
  menuTextSize = titleTextSize * 0.75;
  menuTextColor = color(120, 30, 153);
  selectionTextColor = color(250, 40, 100);
}

function draw() {
  background(10);
  drawBG();
  if (menuLoaded) {
    drawMenu();
  }
}


function drawBG() {
  let size = width * 0.575;
  let red = 150;
  let red2 = 9;
  let green = 100;
  let green2 = 4;
  let blue = 255;
  let blue2 = 199;
  //let fillColor = color(red, green, blue);
  let xPos = width * 0.29;
  let yPos = height * 0.005;
  let x2 = width - xPos *0.51;
  let y2 = height *0.48;
  let count = 0;
  let shape2 = true;


  noStroke();
  noFill();
  drawShape(xPos, yPos + height * 0.11, color(red  - 130, green - 85, blue - 195), size * 0.9, !shape2);
  drawShape(x2, y2 * 1.07, color(red2 -5,green2- 3, blue2 - 150), -size * 0.75, shape2);
  stroke(155);
  while (size >= 0)
  {
    drawShape(xPos, yPos, color(red, green, blue), size, !shape2);
    drawShape(x2, y2, color(red2, green2, blue2), -size * 0.8, shape2);
    size = size - 5;
    red -= 1.25;
    red2 += 1.25;
    green -= 0.85;
    green2 += 0.85;
    if (count >= 1)
    {
      blue--;
      blue2++;
      count = 0;
    }
    else
    {
      count++;
    }
  }
  //console.log("Red: " + red + " Green: " + green + " Blue: " + blue);
}

function drawShape(x, y, fillColor, size, shape2) 
{
  fill(fillColor);
  stroke(fillColor);
  beginShape();
  vertex(x, y);
  if (!shape2) {
    bezierVertex(x + size , y + size, x - size, y + size, x, y); 
  }
  else {
    bezierVertex(x + size , y + size, x + size, y - size, x, y);
  }
  endShape(CLOSE);
}

function drawMenu() {
  textSize(titleTextSize);
  fill(titleTextColor);
  text(titleText, 0, height / 2 - titleTextSize, width, titleTextSize);
  
  menuSelection();

  textSize(menuTextSize * 0.8);
  fill(255, 255, 255);
  stroke(100, 55, 55);
  if (isMobileDevice) {
    text("Tap on a Menu Option to Select it.", 0, height - menuText.length * titleTextSize, width, menuTextSize * 3);
  }
  else {
    text("Use the Up and Down Arrow Keys to Select An Option.\n" + "\nLeft Click or Press Enter to Confirm Selection.", 0, height - menuText.length * titleTextSize, width, menuTextSize * 3);
  }
}

function menuSelection() {
  for (let c = 0; c < menuText.length; c++) {
    if (c == curSelection) {
      textSize(menuTextSize * 1.1);
      fill(selectionTextColor);
      text(selectionText + menuText[c], 0, height / 2 + menuTextSize * (1 + 2*c), width, menuTextSize*1.1);
    }
    else {
      textSize(menuTextSize);
      fill(menuTextColor);
      text(menuText[c], 0, height / 2 + menuTextSize * (1 + 2*c), width, menuTextSize);
    }
  }
}

function keyPressed() {
  switch(keyCode) {
    case ENTER:
      gotoSelection();
      break;
    case DOWN_ARROW:
      curSelection++;
      break;
    case UP_ARROW:
      curSelection--;
      break;
  }
  if (curSelection < 0) {
    curSelection = menuText.length - 1;
  }
  else if (curSelection >= menuText.length) {
    curSelection = 0;
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
  console.log("You selected  " + menuText[curSelection]);
  switch (curSelection) {
    case 0:
      window.location.href = "story.html";
      break;
    case 1:
      window.location.href = "arcade.html";
      break;
    case 2:
      window.location.href = "gallery.html";
      break;
    case 3:
      window.location.href = "standardp/index.html";
      break;
  }
}
