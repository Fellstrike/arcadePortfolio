let player;
let walls = [];
let enemies = [];
let fragments = [];
let projectiles = [];
let grid = [];
let rows, cols, cellSize = 40;
let totalEnemies = 1;
let totalFragments = 0;
let gameStarted = false;
let gameLost = false;
let gameWon = false;
let level = 0;
let wallCooldown = 0;
let startButtonText = "[S]tart Game";
let keys = {}; // Tracks currently held keys

const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const pauseButton = document.getElementById("pauseButton");
const pauseOverlay = document.getElementById("pauseOverlay");
const resumeButton = document.getElementById("resumeButton");
const mainMenuButton = document.getElementById("mainMenuButton");

// Pause the game
pauseButton.addEventListener("click", togglePause);
resumeButton.addEventListener("click", togglePause);
mainMenuButton.addEventListener("click", () => {
    window.location.href = "index.html"; // Redirect to main menu
});

let isPaused = true;

// Initialization
function setup() {
    createCanvas(windowWidth - cellSize, windowHeight - cellSize);
    cellSize = min(width, height) / 20;
    rows = int(height / cellSize);
    cols = int(width / cellSize);
    resetGame();
    togglePause();
}

function draw() {
    if (isPaused) return;

    background(50);
    if (!gameStarted) {
        displayStartButton();
        return;
    }

    if (gameLost) {
        level = 0;
        totalEnemies = 1;
        totalFragments = 0;
        displayEndMessage("Game Over", "Press 'R' to Restart");
        return;
    }

    if (gameWon) {
        level++;
        if (level % 2 == 0) player.lives++;
        displayEndMessage("You Win!", "Press 'R' to Next Level");
        return;
    }

    updateHUD();

    // Continuous movement based on held keys
    handleKeyboardMovement();

    // Walls
    for (let i = walls.length - 1; i >= 0; i--) {
        walls[i].display();
        if (walls[i].hits <= 0) {
            walls.splice(i, 1);
            wallCooldown = 600;
        }
    }
    if (wallCooldown > 0) wallCooldown--;

    // Player
    player.update(walls);
    player.display();

    // Enemies
    for (let enemy of enemies) {
        enemy.update(player, walls);
        enemy.display();
        if (player.isTouching(enemy)) {
            gameLost = player.lifeLost();
            if (gameLost) return;
        }
    }

    // Fragments
    for (let i = fragments.length - 1; i >= 0; i--) {
        fragments[i].display();
        if (player.isTouching(fragments[i])) {
            player.updateScore();
            fragments.splice(i, 1);
        }
    }

    // Projectiles
    handleProjectiles();

    // Win Condition
    if (fragments.length === 0 && enemies.length === 0) gameWon = true;
}

function updateHUD() {
    scoreDisplay.textContent = `Score: ${player.score}`;
    livesDisplay.textContent = `Lives: ${player.lives}`;
}

function togglePause() {
    isPaused = !isPaused;
    pauseOverlay.style.display = isPaused ? "flex" : "none";
    if (isPaused) {
        noLoop(); // Stop the game loop
    } else {
        loop(); // Resume the game loop
    }
}

function handleKeyboardMovement() {
    let dx = 0;
    let dy = 0;

    // Movement based on WASD keys
    if (keys["w"] || keys["W"]) dy -= player.speed*2;
    if (keys["s"] || keys["S"]) dy += player.speed*2;
    if (keys["a"] || keys["A"]) dx -= player.speed*2;
    if (keys["d"] || keys["D"]) dx += player.speed*2;

    if (dx !== 0 || dy !== 0) {
        let nextX = player.x + dx;
        let nextY = player.y + dy;

        // Check for collisions and update player position
        if (!player.isCollidingWithWalls(nextX, nextY, walls)) {
            player.targetX = nextX;
            player.targetY = nextY;
        }
    }

    // Aiming direction based on arrow keys
    if (keys["ArrowUp"] && (!keys["ArrowLeft"] && !keys["ArrowRight"])) player.aimAngle = -HALF_PI;
    else if (keys["ArrowDown"] && (!keys["ArrowLeft"] && !keys["ArrowRight"])) player.aimAngle = HALF_PI;
    else if (keys["ArrowLeft"] && (!keys["ArrowUp"] && !keys["ArrowDown"])) player.aimAngle = PI;
    else if (keys["ArrowRight"] && (!keys["ArrowUp"] && !keys["ArrowDown"])) player.aimAngle = 0;
    else if (keys["ArrowUp"] && keys["ArrowLeft"]) player.aimAngle = -QUARTER_PI - HALF_PI;
    else if (keys["ArrowUp"] && keys["ArrowRight"]) player.aimAngle = - QUARTER_PI;
    else if (keys["ArrowDown"] && keys["ArrowRight"]) player.aimAngle = QUARTER_PI;
    else if (keys["ArrowDown"] && keys["ArrowLeft"]) player.aimAngle = QUARTER_PI + HALF_PI;
}

function mousePressed() {
    if (!gameStarted) {
        // Handle starting the game
        if (
            mouseX > width / 2 - 50 && mouseX < width / 2 + 50 &&
            mouseY > height / 2 - 25 && mouseY < height / 2 + 25
        ) {
            gameStarted = true;
        }
    } else if (mouseButton === LEFT) {
        // Set player target with left-click
        player.setTarget(mouseX, mouseY);
    } else if (mouseButton === RIGHT) {
        // Shoot projectile with right-click
        let angle = atan2(mouseY - player.y, mouseX - player.x);
        projectiles.push(new Projectile(player.x, player.y, player.size * 0.2, angle));
    }
}

let lastTap = 0;

function touchStarted() {
    if (!gameStarted) {
        // Handle starting the game for touch input
        if (
            touches[0].x > width / 2 - 50 && touches[0].x < width / 2 + 50 &&
            touches[0].y > height / 2 - 25 && touches[0].y < height / 2 + 25
        ) {
            gameStarted = true;
        }
    } else {
        let currentTime = millis();
        let timeSinceLastTap = currentTime - lastTap;

        if (timeSinceLastTap < 300) {
            // Double-tap detected, shoot projectile
            let touchX = touches[0].x;
            let touchY = touches[0].y;
            let angle = atan2(touchY - player.y, touchX - player.x);
            projectiles.push(new Projectile(player.x, player.y, player.size * 0.2, angle));
        } else {
            // Single-tap detected, set movement target
            player.setTarget(touches[0].x, touches[0].y);
        }

        lastTap = currentTime;
    }
}

function keyPressed() {
    keys[key] = true; // Mark key as pressed

    if (key === " " && gameStarted) {
        // Fire projectile in the current direction
        player.shoot2();
    }

    if (key === "r" && (gameLost || gameWon)) {
        //console.log("Released R");
        resetGame(); // Restart the game
        loop();
    }
}

function keyReleased() {
    keys[key] = false; // Mark key as released

    if ((key === 'r' || key === 'R') && (gameLost || gameWon)) {
        //console.log("Released R");
        loop();
        resetGame();
    }
}

function resetGame() {
    //console.log("Released R");
    walls = [];
    enemies = [];
    fragments = [];
    projectiles = [];
    initializeGrid();

    gameLost = false;
    gameWon = false;
    totalEnemies += level;
    totalFragments += totalEnemies;

    // Player Spawn
    if (level == 0) player = new Player(cellSize / 2, cellSize / 2, cellSize * 0.5);
    else {
        player.x = cellSize/2;
        player.y = cellSize/2;
        player.targetX = player.x;
        player.targetY = player.y;
        //console.log("test");
    }

    initializeWalls();
    spawnEnemies();
    spawnFragments();
    validateObjectPlacement();
}

function displayStartButton() {
    push();
    fill(100, 255, 100);
    rectMode(CENTER);
    rect(width / 2, height / 2, 150, 50);
    fill(0);
    textSize(20);
    textAlign(CENTER, CENTER);
    text(startButtonText, width / 2, height / 2);
    pop();
}

function displayEndMessage(title, subtitle) {
    fill(255);
    textSize(width * 0.05);
    textAlign(CENTER, CENTER);
    text(title, width / 2, height / 2);
    textSize(width * 0.03);
    text(subtitle, width / 2, height / 2 + height * 0.07);
    noLoop();
}

function initializeGrid() {
    grid = Array.from({ length: cols }, () => Array.from({ length: rows }, () => true));
}

/*function drawGrid() {                 //TURN BACK ON FOR DEBUGGING
    stroke(100);
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            if (!grid[x][y]) fill(100);
            else noFill();
            rect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
}*/

function initializeWalls() {
    walls = [];
    let wallCount = 20; // Number of walls to generate
    let maxWallSize = 3; // Maximum size of a wall in grid cells

    for (let i = 0; i < wallCount; i++) {
        let wallX = floor(random(cols));
        let wallY = floor(random(rows));
        let wallW = floor(random(1, maxWallSize)) * cellSize;
        let wallH = floor(random(1, maxWallSize)) * cellSize;

        // Constrain wall dimensions within canvas bounds
        if (wallX * cellSize + wallW > width) wallW = width - wallX * cellSize;
        if (wallY * cellSize + wallH > height) wallH = height - wallY * cellSize;

        let newWall = new Wall(wallX * cellSize, wallY * cellSize, wallW, wallH);

        // Ensure the wall doesn't overlap the player's spawn
        if (overlapsPlayerSpawn(newWall)) continue;

        // Add wall to the array and mark corresponding grid cells as unwalkable
        walls.push(newWall);
        for (let x = wallX; x < wallX + floor(wallW / cellSize); x++) {
            for (let y = wallY; y < wallY + floor(wallH / cellSize); y++) {
                if (x < cols && y < rows) grid[x][y] = false;
            }
        }
    }
}

// Helper function: Check if a wall overlaps the player's spawn area
function overlapsPlayerSpawn(wall) {
    let playerSpawnX = floor(player.x / cellSize);
    let playerSpawnY = floor(player.y / cellSize);

    for (let x = floor(wall.x / cellSize); x < floor((wall.x + wall.w) / cellSize); x++) {
        for (let y = floor(wall.y / cellSize); y < floor((wall.y + wall.h) / cellSize); y++) {
            if (x === playerSpawnX && y === playerSpawnY) return true;
        }
    }
    return false;
}

// Validate Placement
function validateObjectPlacement() {
    let reachable = isReachable(floor(player.x / cellSize), floor(player.y / cellSize));

    enemies = enemies.filter(enemy => reachable[floor(enemy.x / cellSize)][floor(enemy.y / cellSize)]);
    fragments = fragments.filter(fragment => reachable[floor(fragment.x / cellSize)][floor(fragment.y / cellSize)]);
}

function handleProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        let projectile = projectiles[i];
        
        // Update projectile position and check for collisions
        projectile.update(walls);
        projectile.display();

        // If projectile hits a wall or goes off-screen, remove it
        if (projectile.hitWall || projectile.offScreen()) {
            projectiles.splice(i, 1);
            continue;
        }

        // Check for collision with enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (projectile.hits(enemies[j])) {
                enemies.splice(j, 1); // Remove enemy
                projectiles.splice(i, 1); // Remove projectile
                break; // Exit the loop early for this projectile
            }
        }
    }
}

// Check Reachability (BFS)
function isReachable(x, y) {
    let visited = Array.from({ length: cols }, () => Array(rows).fill(false));
    let queue = [[x, y]];

    while (queue.length > 0) {
        let [cx, cy] = queue.shift();
        if (visited[cx][cy]) continue;

        visited[cx][cy] = true;

        for (let [nx, ny] of [
            [cx + 1, cy],
            [cx - 1, cy],
            [cx, cy + 1],
            [cx, cy - 1]
        ]) {
            if (nx >= 0 && ny >= 0 && nx < cols && ny < rows && grid[nx][ny] && !visited[nx][ny]) {
                queue.push([nx, ny]);
            }
        }
    }

    return visited;
}

// Utility Functions
function repositionObject(object) {
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            if (grid[x][y]) {
                object.x = x * cellSize + cellSize / 2;
                object.y = y * cellSize + cellSize / 2;
                return;
            }
        }
    }
}

// Spawning Functions
function spawnEnemies() {
    for (let i = 0; i < totalEnemies; i++) {
        let [x, y] = findValidSpawnPoint();
        enemies.push(new Enemy(x, y, cellSize * 0.6, color(255, 0, 0)));
    }
}

function spawnFragments() {
    for (let i = 0; i < totalFragments; i++) {
        let [x, y] = findValidSpawnPoint();
        fragments.push(new TemporalObject(x, y, cellSize * 0.4));
    }
}

function findValidSpawnPoint() {
    while (true) {
        let x = floor(random(cols)) * cellSize + cellSize / 2;
        let y = floor(random(rows)) * cellSize + cellSize / 2;
        if (grid[floor(x / cellSize)][floor(y / cellSize)]) return [x, y];
    }
}

// Enemy Class
class Enemy {
    constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = size * 0.1;
        this.angle = random(TWO_PI);
        this.color = color;
    }

    update(player, walls) {
        let dx = player.x - this.x;
        let dy = player.y - this.y;
        this.angle = atan2(dy, dx);

        let nextX = this.x + cos(this.angle) * this.speed;
        let nextY = this.y + sin(this.angle) * this.speed;

        let canMove = true;
        for (let wall of walls) {
            if (wall.isColliding({ x: nextX, y: nextY, size: this.size })) {
                canMove = false;
                break;
            }
        }

        if (canMove) {
            this.x = nextX;
            this.y = nextY;
        }
    }

    display() {
        fill(this.color);
        ellipse(this.x, this.y, this.size);
    }
}

// Wall Class
class Wall {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.hits = 3; // Number of hits wall can take
    }

    display() {
        fill(150 - this.hits * 30, 150, 150);
        rect(this.x, this.y, this.w, this.h);
    }

    isColliding(object) {
        return (
            object.x + object.size / 2 > this.x &&
            object.x - object.size / 2 < this.x + this.w &&
            object.y + object.size / 2 > this.y &&
            object.y - object.size / 2 < this.y + this.h
        );
    }
}

// Temporal Object (Fragment)
class TemporalObject {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color(0, 255, 0);
    }

    display() {
        fill(this.color);
        ellipse(this.x, this.y, this.size);
    }
}

// Projectile Class
class Projectile {
    constructor(x, y, size, angle) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.angle = angle;
        this.speed = 10;
        this.hitWall = false;
    }

    update(walls) {
        this.x += cos(this.angle) * this.speed;
        this.y += sin(this.angle) * this.speed;

        for (let wall of walls) {
            if (wall.isColliding(this)) {
                if (wallCooldown <= 0) wall.hits--;
                this.hitWall = true;
                break;
            }
        }
    }

    display() {
        fill(255, 255, 0);
        ellipse(this.x, this.y, this.size);
    }

    offScreen() {
        return this.x < 0 || this.x > width || this.y < 0 || this.y > height;
    }

    hits(enemy) {
        return dist(this.x, this.y, enemy.x, enemy.y) < this.size / 2 + enemy.size / 2;
    }
}

class Player {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = size * 0.15; // Speed relative to size
        this.lives = 3; // Number of lives
        this.score = 0; // Score
        this.cooldown = 0; // Frames of invulnerability
        this.cooldownTime = 60; // Invulnerability duration
        this.targetX = x; // Movement target x
        this.targetY = y; // Movement target y
        this.aimAngle = 0;
    }

    update(walls) {
        // Calculate movement direction
        let dx = this.targetX - this.x;
        let dy = this.targetY - this.y;
        let distance = dist(this.x, this.y, this.targetX, this.targetY);

        // Move player only if distance is greater than speed
        if (distance > this.speed) {
            let nextX = this.x + (dx / distance) * this.speed;
            let nextY = this.y + (dy / distance) * this.speed;

            // Check collision with walls before moving
            if (!this.isCollidingWithWalls(nextX, nextY, walls)) {
                this.x = nextX;
                this.y = nextY;
            }
        }

        // Reduce cooldown (invulnerability)
        if (this.cooldown > 0) {
            this.cooldown--;
        }
    }

    display() {
        // Display score and lives
        //textSize(width * 0.03);
        //fill(255);
        //text(`Score: ${this.score}`, 20, 30);
        //text(`Lives: ${this.lives}`, 20, 60);

        // Display player character
        fill(155, 55, 255);
        ellipse(this.x, this.y, this.size);
    }

    isVulnerable() {
        return this.cooldown === 0;
    }

    lifeLost() {
        // Decrease life if vulnerable
        if (this.isVulnerable()) {
            this.lives--;
            this.cooldown = this.cooldownTime; // Trigger invulnerability
            if (this.lives <= 0) {
                return true; // Game over
            }
        }
        return false;
    }

    updateScore() {
        this.score++;
    }

    setTarget(x, y) {
        // Ensure target stays within canvas boundaries
        this.targetX = constrain(x, 0, width);
        this.targetY = constrain(y, 0, height);
    }

    shoot2() {
        projectiles.push(new Projectile(this.x, this.y, this.size * 0.2, this.aimAngle));
    }

    shoot() {
        // Default shooting mechanism (can be triggered by keyboard, mouse, or touch)
        let angle = atan2(mouseY - this.y, mouseX - this.x);
        projectiles.push(new Projectile(this.x, this.y, this.size * 0.2, angle));
    }

    isTouching(object) {
        // Check if player touches an object
        return dist(this.x, this.y, object.x, object.y) < this.size / 2 + object.size / 2;
    }

    isCollidingWithWalls(nextX, nextY, walls) {
        // Check if the next position collides with any wall
        for (let wall of walls) {
            if (wall.isColliding({ x: nextX, y: nextY, size: this.size })) {
                return true;
            }
        }
        return false;
    }
}
