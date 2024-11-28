let gameFont;

let instDisplay = true;

let currentBubble;

const gridCols = 10;
const gridRows = 12;
const bubbleSize = 40;
let grid = [];

function preload() {
    gameFont = loadFont('prstart.ttf');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    textFont(gameFont);
    setupGrid(); // Initialize the grid
    background(10);
    fill(200, 50, 255);
    textAlign(CENTER);
}

function draw() {
    background(10);

    if (instDisplay) {
        displayInstr(); // Show instructions
    } else {
        drawGrid(); // Draw the grid

        if (currentBubble) {
            currentBubble.move();
            currentBubble.display();

            let collision = currentBubble.checkCollision();
            if (collision) {
                placeBubble(currentBubble, collision);
                let matches = findMatches(collision.r, collision.c, currentBubble.color);
                if (matches.length) popMatches(matches);
            }
        }
    }
}

// Initialize the grid with null values
function setupGrid() {
    for (let r = 0; r < gridRows; r++) {
        let row = [];
        for (let c = 0; c < gridCols; c++) {
            row.push(null); // Empty spots initially
        }
        grid.push(row);
    }
}

// Draw the grid and bubbles
function drawGrid() {
    for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
            let x = c * bubbleSize + bubbleSize / 2;
            let y = r * bubbleSize + bubbleSize / 2;

            if (grid[r][c]) {
                fill(grid[r][c]); // Use color stored in grid
                ellipse(x, y, bubbleSize);
            } else {
                noFill();
                stroke(255);
                ellipse(x, y, bubbleSize); // Empty grid spot
            }
        }
    }
}

// Display instructions
function displayInstr() {
    text(
        "Use mouse to aim. Left click to fire. \n\nPress any key to start.",
        width / 2,
        height / 2
    );
}

// Detect matches of 3 or more bubbles of the same color
function findMatches(row, col, color) {
    let visited = new Set();
    let stack = [[row, col]];
    let matches = [];

    while (stack.length) {
        let [r, c] = stack.pop();
        let key = `${r},${c}`;
        if (visited.has(key)) continue;

        visited.add(key);
        if (grid[r] && grid[r][c] && grid[r][c].toString() === color.toString()) {
            matches.push([r, c]);
            stack.push([r - 1, c]); // Up
            stack.push([r + 1, c]); // Down
            stack.push([r, c - 1]); // Left
            stack.push([r, c + 1]); // Right
        }
    }

    return matches.length >= 3 ? matches : [];
}

// Place a bubble in the grid
function placeBubble(bubble, collision) {
    console.log("Placing bubble at:", collision);
    grid[collision.r][collision.c] = bubble.color;
    currentBubble = null; // Ready for the next bubble
}

// Remove matching bubbles from the grid
function popMatches(matches) {
    console.log("Popping matches:", matches);
    for (let [r, c] of matches) {
        grid[r][c] = null;
    }
}

// Return to the menu (placeholder function)
function backToMenu() {
    console.log("Back to menu");
}

// Start the game when a key is pressed
function keyPressed() {
    if (instDisplay) {
        instDisplay = false; // Stop showing instructions
        shootBubble(); // Start the first bubble
    }
}

// Create and launch a new bubble
function shootBubble() {
    currentBubble = new Bubble(
        width / 2,
        height - 50,
        color(random(255), random(255), random(255))
    );
}

// Handle mouse input for aiming and shooting
function mousePressed() {
    if (!currentBubble) {
        shootBubble();
    } else if (currentBubble.angle === 0) { // Only set angle once
        let dx = mouseX - currentBubble.x;
        let dy = mouseY - currentBubble.y;
        currentBubble.angle = atan2(dy, dx);
    }
}

// Bubble class
class Bubble {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = bubbleSize;
        this.color = color;
        this.speed = 5;
        this.angle = 0;
    }

    display() {
        fill(this.color);
        noStroke();
        ellipse(this.x, this.y, this.size);
    }

    move() {
        this.x += this.speed * cos(this.angle);
        this.y += this.speed * sin(this.angle);
    }

    checkCollision() {
        for (let r = 0; r < gridRows; r++) {
            for (let c = 0; c < gridCols; c++) {
                if (grid[r][c]) {
                    let gx = c * bubbleSize + bubbleSize / 2;
                    let gy = r * bubbleSize + bubbleSize / 2;
                    let d = dist(this.x, this.y, gx, gy);
                    if (d < bubbleSize) {
                        // Return the nearest empty grid cell
                        return {
                            r: round((this.y - bubbleSize / 2) / bubbleSize),
                            c: round((this.x - bubbleSize / 2) / bubbleSize),
                        };
                    }
                }
            }
        }
        return null;
    }
}
