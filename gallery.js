let gameFont;

let starfieldImg;
let capstoneImg;

let starImgs = 2;
let capImgs = 2;

let curStar = 0;
let curCap = 0;
let curGal = 0; 

let galText;
let descText;
let starText;
let capText;


function preload() {
    gameFont = loadFont('prstart.ttf');
    starfieldImg = [];
    capstoneImg = [];
    galText = ["Starscape", "Secret Third Thing"];
    descText = [];
    starText = ["An image of the Max Interface with the javascript running.", "An image of a glass filled with an amber liquid, an ice cube, and a cherry."];
    capText = ["Image 1", "Image 2"];
    for(let s = 0; s < starImgs; s++) {
        starfieldImg[s] = loadImage("starimg/image" + s + ".png");
    }
    for(let c = 0; c < capImgs; c++) {
        capstoneImg[c] = loadImage("capstoneImg/image" + c + ".jpg");
    }
    descText[0] = "A javascript and Max project that is meant to immerse the viewer, letting them feel like they are gazing out of a starship's viewport as it travels the stars.";
    descText[1] = "In June 2024 I participated in an exhibit at the Paragon Arts Gallery by the PCC Sonic Arts and Creative Coding Department and Universal Sound Design, a group working to bring the joys of music to the deaf and hard of hearing. \n\n\nThis Exhibit tried to highlight technology and nature converging.";
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    textFont(gameFont);
    background(10);
    imageMode(CENTER);
    textAlign(CENTER);
}

function draw() {
    background(10);

    fill(200,20,255);
    textSize(height*0.055);
    text(galText[curGal], 0, height*0.04, width, height*0.1);

    fill(230, 200, 255);
    textSize(height*0.018);
    text(descText[curGal], 0, height*0.13, width, height*0.3);
    if (curGal == 0) {
        image(starfieldImg[curStar], width*0.5, height*0.6, width*0.6, height*0.6);

        text(starText[curStar], 0, height*0.912, width, height * 0.09);
    }
    else {
        image(capstoneImg[curCap], width*0.5, height*0.6, width*0.6, height*0.6);

        text(capText[curCap], 0, height*0.912, width, height * 0.09);
    }
}

/************************************NEED TO MAKE BUTTONS FOR MOBILE NAVIGATOIN *********************************************************
 ************************************CREATE FX FOR IMAGE AND TEXT CHANGES & ADD SOUNDS**************************************************/
function backToMenu() {
    window.location.href = "index.html"
}

function changeGallery() {
    if (curGal == 0) {
        curGal = 1;
    }
    else {
        curGal = 0;
    }
}

function changeImage() {
    if (curGal == 0) {
        curStar++;
        if (curStar >= starImgs)  {
            curStar = 0;
        }
    }
    else {
        curCap++;
        if (curCap >= capImgs) {
            curCap = 0;
        }
    }
}

function keyPressed() {
    if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
        changeImage();
    }
    else if (keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
        changeGallery();
    }
    else if (keyCode === 32) {
        backToMenu();
    }
}