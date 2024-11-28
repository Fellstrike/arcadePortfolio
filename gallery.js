let gameFont;

let starfieldImg;
let capstoneImg;
let tchDesImg;

let starImgCnt = 2;
let capImgCnt = 2;
let tchDesImgCnt = 0;

let starVidCt = 0; //starfield video count
let capVidCt = 0 //capstone Video Count
let tchDesVidCt = 1; //Touch Designer Video Count

let starVideo;
let capVideo;
let tchDesVideo;
let showVideo = true;

let curStar = 0;
let curCap = 0;
let curTchDes = 0;
let curGal = 0; 

let galText;
let descText;
let starText;
let capText;
let tchDesText;


function preload() {
    gameFont = loadFont('prstart.ttf');
    
    starfieldImg = [];
    capstoneImg = [];
    tchDesImg = [];

    tchDesVideo = [];
    starVideo = [];
    capVideo = [];

    galText = ["Starscape", "Secret Third Thing", "Touch Designer"];
    descText = [];
    starText = ["An image of the Max Interface with the javascript running.", "An image of a glass filled with an amber liquid, an ice cube, and a cherry."];
    capText = ["Image 1", "Image 2"];
    tchDesText = ["The 'eye' tracks the mouse and/or the location of a person in the view of an attached Kinect."];

    for(let s = 0; s < starImgCnt; s++) {
        starfieldImg[s] = loadImage("starimg/image" + s + ".png");
    }

    for(let c = 0; c < capImgCnt; c++) {
        capstoneImg[c] = loadImage("capstoneImg/image" + c + ".jpg");
    }

    for (let t = 0; t < tchDesImgCnt; t++) {
        //tchDesImg[t] = loadImage("tchDes/image" + t + ".png");
    }

    descText[0] = "A javascript and Max project that is meant to immerse the viewer, letting them feel like they are gazing out of a starship's viewport as it travels the stars.";
    descText[1] = "In June 2024 I participated in an exhibit at the Paragon Arts Gallery by the PCC Sonic Arts and Creative Coding Department and Universal Sound Design, a group working to bring the joys of music to the deaf and hard of hearing. \n\n\nThis Exhibit tried to highlight technology and nature converging.";
    descText[2] = "Touch Designer is a visual programming app for creating interactive media.";
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    textFont(gameFont);
    background(10);
    imageMode(CENTER);
    textAlign(CENTER);

    let vidWidth = int(width*0.9);
    let vidHeight = int(height*0.6);

    //console.log(vidWidth + " " + vidHeight);
    for (let t = 0; t < tchDesVidCt; t++) {
        tchDesVideo[t] = createDiv('<iframe width="' + vidWidth + '" height="' + vidHeight + '" src="https://www.youtube.com/embed/JgKzJq5cO04?si=u-i5Y4-Gt2BMMGvq" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>');
        tchDesVideo[t].hide();
    }
    tchDesVideo[curTchDes].center();
}

function draw() {
    background(10);

    fill(200,20,255);
    textSize(height*0.055);
    text(galText[curGal], 0, height*0.04, width, height*0.1);

    fill(230, 200, 255);
    textSize(height*0.018);
    text(descText[curGal], 0, height*0.13, width, height*0.3);
    switch (curGal) {
        case 0:
            if (curStar <= starImgCnt) {
                image(starfieldImg[curStar], width*0.5, height*0.6, width*0.6, height*0.6);
            }
            else {
                //if (curStar > starImgCnt) starVideo(curStar -1).hide();
                //starVideo(curStar).show();
            }
            text(starText[curStar], 0, height*0.912, width, height * 0.09);
            break;
        case 1:
            if (curCap < capImgCnt) {
                image(capstoneImg[curCap], width*0.5, height*0.6, width*0.6, height*0.6);
            }
            else {
                //if (curCap > capImgCnt) capVideo[curCap - 1].hide();
                //capVideo[curCap].show();
            }
            text(capText[curCap], 0, height*0.912, width, height * 0.09);
            break;
        case 2:
            if (curTchDes < tchDesImgCnt) {
                //image(tchDesImg[curTchDes], width*0.5, height*0.6, width*0.6, height*0.6);
            }
            else {
                //if (curTchDes > tchDesImgCnt) tchDesVideo[curTchDes - 1].hide();
                tchDesVideo[0].show();
            }
        
            text(tchDesText[curTchDes], 0, height*0.912, width, height * 0.09);
            break;
    }
}

/************************************NEED TO MAKE BUTTONS FOR MOBILE NAVIGATOIN *********************************************************
 ************************************CREATE FX FOR IMAGE AND TEXT CHANGES & ADD SOUNDS**************************************************/
function backToMenu() {
    window.location.href = "index.html"
}

function changeGallery(direction) {
    if (curGal == 2) {
        tchDesVideo[tchDesVidCt-1].hide();
    }
    curGal += direction;
    if (curGal >= galText.length) {
        curGal = 0;
    }
    else if (curGal < 0) {
        curGal = galText.length - 1;
    }
}

function changeImage() {
    switch (curGal) {
        case 0:
            curStar++;
            if (curStar >= starImgCnt + starVidCt)  {
                //starVideo[starVidCt - 1].hide();
                curStar = 0;
            }
            break;

        case 1:
            curCap++;
            if (curCap >= capImgCnt + capVidCt) {
               // capVideo[capVidCt - 1].hide();
                curCap = 0;
            }
            break;
        case 2:
            curTchDes++;
            if (curTchDes >= tchDesImgCnt + tchDesVidCt) {
                tchDesVideo[tchDesVidCt-1].hide();
                curTchDes = 0;
            }
            break;
    }
}

function keyPressed() {
    if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
        changeImage();
    }
    else if (keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
        let direction;
        if (keyCode === UP_ARROW) {
            direction = -1;
        }
        else if (keyCode === DOWN_ARROW) {
            direction = 1;
        }
        changeGallery(direction);
    }
    else if (keyCode === 32) {
        backToMenu();
    }
}