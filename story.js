let gameFont;

let artStatement;

let nilsPic;

function preload() {
    gameFont = loadFont('prstart.ttf');
    nilsPic = loadImage("standardp/img/pictureMe.jpg");
    artStatement = "I'm Nilsine, an immersive artist out of Portland, OR. I create experiences that blend the real and digital worlds allowing anyone regardless of age discover and play without shame. I want my work to drive people to interact and explore my art in a natural way.\n\n\nUsing small computers my art can register what people are doing and have that change how those people experience my art. \n\nMy art is influenced by my experiences growing up as a queer nerd in the 90s, playing D&D despite the satanic panic, collaborative online storytelling, spending time in arcades, and early internet culture. I want to let people rediscover childlike wonder by viewing and interacting with my art. Hoping that  people can carry those discoveries into their ‘mundane’ life allowing them to find small moments of magic in their day to day experience.";
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    textFont(gameFont);
    background(10);
    imageMode(CENTER);
    textAlign(CENTER);
    fill(200, 40, 255);
}

function draw() {
    background(10);

    image(nilsPic, width * 0.5, height * 0.25, width * 0.15, height * 0.45);

    textSize(height * 0.02);
    text(artStatement, 0, height * 0.6, width, height);
    text("Press Any Key to Return to Title", 0, height * 0.95, width, height);

    if (keyIsPressed) {
        backToMenu();
    }
}

function backToMenu() {
    window.location.href = "index.html"
}