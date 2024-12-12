let gameFont;

let starfieldImg = [];
let capstoneImg = [];
let tchDesImg = [];
let kinectImg = [];

let starVidCt = 0; 
let capVidCt = 0; 
let tchDesVidCt = 1; 
let kinVidCt = 0;

let tchDesVideo = [];
let curGal = 0;

let reSizeV = 0.5;

let galText = ["Starscape", "Secret Third Thing", "Touch Designer", "Interactive Camera"];
let descText = [
    "A javascript and Max project that immerses viewers, simulating a starship's viewport.",
    "An exhibit showcasing the convergence of technology and nature. Click this text to see the interactive website made for the project.",
    "Touch Designer is a visual programming app for interactive media.",
    "A Processing program combining Kinect and microcontroller data to create interactive 3D visuals."
];
let starText = ["An image of the Max Interface with the javascript running.", "An image of a glass filled with an amber liquid, an ice cube, and a cherry."];
let capText = ["Custom motherboards for some microcontrollers", "A tree with light strings connected to touch sensors, and videos playing nature live streams."];
let tchDesText = ["The 'eye' tracks the mouse and/or the location of a person in the view of an attached Kinect."];
let kinectText = ["A program that takes data from a Kinect camera and a custom motion controller to catch on screen 3d objects.", "Another shot of the same program."];

let curStar = 0, curCap = 0, curTchDes = 0, curKinect = 0;

let prevButton, nextButton, nextGalButton, prevGalButton, homeButton;

function preload() {
    gameFont = loadFont('prstart.ttf');

    // Load starfield images
    for (let i = 0; i < 2; i++) {
        starfieldImg[i] = loadImage(`starimg/image${i}.png`);
    }

    // Load capstone images
    for (let i = 0; i < 2; i++) {
        capstoneImg[i] = loadImage(`capstoneImg/image${i}.png`);
    }

    // Load Kinect images
    for (let i = 0; i < 2; i++) {
        kinectImg[i] = loadImage(`kinect/image${i}.jpg`);
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    textFont(gameFont);
    background(10);
    textAlign(CENTER);
    imageMode(CENTER);

    setupButtons();

    // Load Touch Designer video
    let vidWidth = int(min(width*0.7, height*0.7));
    let vidHeight = int(min(height*0.4, width*0.4));
    tchDesVideo[0] = createDiv('<iframe width="' + vidWidth + '" height="' + vidHeight + '" src="https://www.youtube.com/embed/eqExJ7ufHBI?si=VJjQTyVspV7spoIS" frameborder="0" allowfullscreen></iframe>');
    //tchDesVideo.attribute('align', 'center');
    tchDesVideo[0].hide();

    for (let i = 0; i < 2; i++) {
        starfieldImg[i].resize(min(width * (reSizeV+0.05), height * (reSizeV+0.05)), 0);
    }

    starfieldImg[0].resize(width*0.5, 0);

    // Load capstone images
    for (let i = 0; i < 2; i++) {
        capstoneImg[i].resize(min(width * (reSizeV+0.05), height * (reSizeV+0.05)), 0);
    }
    capstoneImg[1].resize(0, height*0.55);

    // Load Kinect images
    for (let i = 0; i < 2; i++) {
        kinectImg[i].resize(0, min(width * (reSizeV+0.05), height * (reSizeV+0.05)));
    }
}

function draw() {
    background(10);

    // Display current gallery and description
    fill(200, 20, 255);
    textSize(min(height * 0.065, width * 0.065));
    text(galText[curGal], 0, 0, width, height*0.14);

    fill(230, 200, 255);
    textSize(min(height * 0.02, width * 0.02));
    textAlign(CENTER);
    text(descText[curGal], width*0.1, height * 0.15, width * 0.8, height*0.2);
    if (curGal === 1 && mouseIsPressed && mouseX > width*0.1 && mouseX < width*0.9 && mouseY > height*0.15 && mouseY < height * 0.2) {
        gotoSecretSite();
    }
   

    // Display gallery content
    displayGalleryContent();
}

function gotoSecretSite() {
    window.location.href = 'https://p5c2024.netlify.app';
}

function setupButtons() {
    // Create buttons
    prevButton = createButton("Previous Image");
    nextButton = createButton("Next Image");
    prevGalButton = createButton("Previous Gallery");
    nextGalButton = createButton("Next Gallery");
    homeButton = createButton("Return to Title");

    // Position buttons
    positionButtons();

    // Add event listeners
    prevButton.mousePressed(() => changeImage(-1));
    nextButton.mousePressed(() => changeImage(1));
    prevGalButton.mousePressed(() => changeGallery(-1));
    nextGalButton.mousePressed(() => changeGallery(1));
    homeButton.mousePressed(backToMenu);

    // Style buttons
    styleButtons([prevButton, nextButton, prevGalButton, nextGalButton, homeButton]);
}

function positionButtons() {
    prevButton.position(width * 0.065, height * 0.75);
    nextButton.position(width * 0.81, height * 0.75);
    prevGalButton.position(width * 0.05, height * 0.2);
    nextGalButton.position(width * 0.81, height * 0.2);
    homeButton.position(width * 0.85, height * 0.05);
}

function styleButtons(buttons) {
    for (let btn of buttons) {
        btn.style('padding', '10px');
        btn.style('background-color', '#BC88C2');
        btn.style('color', 'white');
        btn.style('border', 'none');
        btn.style('border-radius', '5px');
    }
}

function displayGalleryContent() {
    switch (curGal) {
        case 0:
            if (curStar < starfieldImg.length) {
                image(starfieldImg[curStar], width / 2, height / 2);
            }
            text(starText[curStar], 0, height*0.912, width, height * 0.09)
            break;
        case 1:
            if (curCap < capstoneImg.length) {
                image(capstoneImg[curCap], width / 2, height / 2);
            }
            text(capText[curCap], 0, height*0.912, width, height * 0.09);
            break;
        case 2:
            for (let vid of tchDesVideo) vid.hide();
            tchDesVideo[curTchDes].show();
            tchDesVideo[curTchDes].position(width / 2 - 280, height / 2 - 157); // Center video
            text(tchDesText[curTchDes], 0, height*0.912, width, height * 0.09);
            break;
        case 3:
            if (curKinect < kinectImg.length) {
                image(kinectImg[curKinect], width / 2, height / 2);
            }
            text(kinectText[curKinect], 0, height*0.912, width, height*0.09);
            break;
    }
}

function changeGallery(direction) {
    tchDesVideo[curTchDes].hide(); // Hide Touch Designer video
    curGal = (curGal + direction + galText.length) % galText.length; // Cycle galleries
}

function changeImage(direction) {
    switch (curGal) {
        case 0:
            curStar = (curStar + direction + starfieldImg.length) % starfieldImg.length;
            break;
        case 1:
            curCap = (curCap + direction + capstoneImg.length) % capstoneImg.length;
            break;
        case 2:
            curTchDes = (curTchDes + direction + tchDesVideo.length) % tchDesVideo.length;
            break;
        case 3:
            curKinect = (curKinect + direction + kinectImg.length) % kinectImg.length;
            break;
    }
}

function backToMenu() {
    window.location.href = "index.html";
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    positionButtons();
}