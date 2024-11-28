let gameFont;

let instDisplay = true;

function preload() {
    gameFont = loadFont('prstart.ttf');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    textFont(gameFont);
    background(10);
    fill(200, 50, 255);
    textAlign(CENTER);
}

function draw() {
    background(10);
    if (instDisplay)
    {
        displayInstr();
    }
}

function displayInstr() {
    text("Use arrow keys or mouse to control ship. \n\nLeft click or press Space bar to fire. \n\n\nPress any key to start game.", width/2, height/2);
}

function backToMenu() {
    window.location.href = "index.html"
}

function keyPressed() {
    if (instDisplay) {
        instDisplay = !instDisplay;
    }
    else {
        backToMenu();
    }
}

class bubbles {
    constructor(x, y, size, position, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.position = position;
        this.color = color;
    }
}