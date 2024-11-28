let gameFont;
let artStatement;
let nilsPic;
let pixelatedImage;
let pixelation_level = 500;
let currentText = '';
let textRevealIndex = 0;
let textRevealTimer = 0;
let textRevealSpeed = 2; // Lower is faster

function preload() {
    gameFont = loadFont('prstart.ttf');
    nilsPic = loadImage("butterflySelf.png");
    artStatement = "I'm Nilsine, an immersive artist out of Portland, OR. I create experiences that blend the real and digital worlds allowing anyone regardless of age discover and play without shame. I want my work to drive people to interact and explore my art in a natural way.\n\n\nUsing small computers my art can register what people are doing and have that change how those people experience my art. \n\nMy art is influenced by my experiences growing up as a queer nerd in the 90s, playing D&D despite the satanic panic, collaborative online storytelling, spending time in arcades, and early internet culture. I want to let people rediscover childlike wonder by viewing and interacting with my art. Hoping that  people can carry those discoveries into their ‘mundane’ life allowing them to find small moments of magic in their day to day experience.";
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    textFont(gameFont);
    background(10);
    imageMode(CENTER);
    textAlign(LEFT);
    pixelatedImage = createGraphics(width, height);
}

function draw() {
    background(10);

    // Render image with progressive pixelation
    pixelatedImage.clear();
    pixelatedImage.image(nilsPic, width * 0.35, height * 0.1, width * 0.3, height * 0.45);
    pixelatedImage.loadPixels();
    
    noStroke();
    for (let x = width * 0.15; x < width * 0.65; x += pixelation_level) {
        for (let y = height * 0.05; y < height * 0.65; y += pixelation_level) {
            let i = (floor(x) + floor(y) * width) * 4;
            
            let r = pixelatedImage.pixels[i + 0];
            let g = pixelatedImage.pixels[i + 1];
            let b = pixelatedImage.pixels[i + 2];
            let a = pixelatedImage.pixels[i + 3];
            
            fill(r, g, b, a);
            square(x, y, pixelation_level);
        }
    }

    // Progressive text reveal and pixelation reduction
    textRevealTimer++;
    if (textRevealTimer >= textRevealSpeed) {
        if (textRevealIndex < artStatement.length) {
            currentText += artStatement[textRevealIndex];
            textRevealIndex++;
            textRevealTimer = 0;

            // Reduce pixelation as text reveals
            if (pixelation_level > 5 && frameCount % 50) {
                pixelation_level = max(5, pixelation_level - 1);
            }
        }
    }

    fill(205, 155, 255); 
    
    textSize(height * 0.016); 
    let statementX = width * 0.05;
    let statementY = height * 0.66;
    let statementWidth = width * 0.9;
    
    text(currentText, statementX, statementY, statementWidth, height * 0.3);

    // Navigation text
    textSize(height * 0.015);
    textAlign(CENTER);
    text("Press Any Key to Return to Title", width / 2, height * 0.98);

    if (keyIsPressed) {
        backToMenu();
    }
}

function backToMenu() {
    window.location.href = "index.html"
}

function keyPressed() {
    // Optional: Speed up text reveal or skip to full text
    if (textRevealIndex < artStatement.length) {
        currentText = artStatement;
        textRevealIndex = artStatement.length;
        pixelation_level = 5;
    }
}