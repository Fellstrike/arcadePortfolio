let player;
let walls = [];
let enemies = [];
let powerUps = [];
let fragments = [];
let projectiles = [];
let grid = [];
let rows, cols, cellSize = 40;
let totalEnemies = 1;
let totalFragments = 1;
let gameStarted = false;
let gameLost = false;
let gameWon = false;
let level = 0;
let curLevel = 0;
let buttText = "[S]tart Game";
let firingMode = false;
let wallCooldown = 0;

// Initialization
function setup() {
    // Subtract cellSize to create a precise border
    createCanvas(windowWidth - cellSize, windowHeight - cellSize);

    // Determine grid size
    cellSize = min(width, height)/20;
    rows = int(height / cellSize);
    cols = int(width / cellSize);

    resetGame();
}

// Game loop
function draw() {
    if (!gameStarted) {
        displayStartButt();
        return;
    }

    if (gameLost) {
        gameStarted = false;
        level = 0;
        totalEnemies = 1;
        totalFragments = 1;
        buttText = "GAME OVE[R]";
    }
    else if (gameWon) {
        gameStarted = false;
        level++;
        console.log("Level: " + level);
        buttText = "[N]EXT LEVEL";
        return;
    }

    background(50);

    // Draw grid for debugging
    //drawGrid();

    // Display walls
    for (let w = 0; w < walls.length; w++) {
        walls[w].display();
        if (walls[w].hits <= 0 && wallCooldown === 0) {
            walls.splice(w, 1);
            wallCooldown = 1200;
        }
    }

    if (wallCooldown > 0) wallCooldown--;

    // Display and update other elements
    player.update(walls);
    player.display();

    for (let enemy of enemies) {
        enemy.update(player, walls);
        enemy.display();
        if (dist(player.x, player.y, enemy.x, enemy.y) < 20) { //checks if player and enemy are touching
            gameLost = player.lifeLost();
            //console.log("Did you lose all lives?" + gameLost);
        }
    }

    for (let f = 0; f < fragments.length; f++) {
        fragments[f].display();
        if (player.isTouching(fragments[f])) {
            player.updateScore();
            fragments.splice(f, 1);
            gameWon = checkWinCondition();
        }
    }

    handleProjectiles();

    if (keyIsDown(87) || keyIsDown(UP_ARROW)) {
        player.targetY = player.y - cellSize; 
    }
    if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) {
        player.targetY = player.y + cellSize;
    }
    if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) {
        player.targetX = player.x - cellSize;
    }
    if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) {
        player.targetX = player.x + cellSize;
    }
}

function mousePressed() {
    if (!gameStarted) {
        if (mouseX > width / 2 - 75 && mouseX < width / 2 + 75 && mouseY > height / 2 - 25 && mouseY < height / 2 + 25) {
            gameStarted = true;
            resetGame();
        }
    }
    else if (!firingMode && mouseButton === LEFT) {
        player.setTarget(mouseX, mouseY);
    }
    else {
        player.shoot();
    }
}

function touchStarted() {
    
    if (touches.length > 1) {
        player.shoot();
    }
    else {
        player.setTarget(mouseX, mouseY);
    }
}

function keyPressed() {
    if (gameLost || gameWon) {
        if (key === "r") resetGame();
        return;
    }
    else if (key === ' ') player.shoot(); 
}

function resetGame() {
    if (gameLost) {
        //console.log("You lost the game");
        player.score = 0;
        level = 0;
        player.lives = 3;
    }
    else if (gameWon && level % 2 === 0) {
        //console.log("Extra Life");
        player.lives++;
    }
    totalEnemies += level;
    //console.log("Enemy #: " + totalEnemies);
    totalFragments += min(totalEnemies, level);
    enemies = [];
    fragments = [];
    walls = [];
    projectiles = [];
    // Initialize grid
    initializeGrid();

    // Spawn player
    if (!(gameLost || gameWon)) {
        player = new Player(cellSize * 0.5, cellSize * 0.5, cellSize * 0.5);
    }
    else {
        player.x = cellSize * 0.5;
        player.y = cellSize * 0.5;
        player.targetX = player.x;
        player.targetY = player.y;
        player.shotCooldown = 30;
        player.cooldown = 60;
    }
    // Initialize walls, enemies, power-ups, and fragments
    initializeWalls();
    spawnEnemies();
    spawnFragments();
    //validateObjectPlacement();
    gameLost = false;
    gameWon = false;
    curLevel = level;
    regenerateWallsIfNeeded();
    //console.log("Level: " + level);
}

function displayStartButt() {
    background(44);
    push();
    fill(100, 255, 100);
    rectMode(CENTER);
    rect(width / 2, height / 2, 150, 50);
    fill(155);
    textSize(20);
    textAlign(CENTER);
    text(buttText, width / 2, height / 2 + 7);
    pop();
}

function handleProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        projectiles[i].update(walls);
        projectiles[i].display();

        if (projectiles[i].hitWall || projectiles[i].offScreen()) {
            projectiles.splice(i, 1);
            break;
        }

        for (let j = enemies.length - 1; j >= 0; j--) {
            if (projectiles[i].hits(enemies[j])) {
                enemies.splice(j, 1);
                projectiles.splice(i, 1);
                gameWon = checkWinCondition();
                //console.log(gameWon);
                break;
            }
        }
    }
}

function displayEndMessage(title, subtitle) {
    fill(255);
    textSize(width * 0.05);
    textAlign(CENTER, CENTER);
    text(title, width / 2, height / 2);
    textSize(width * 0.03);
    text(subtitle, width / 2, height / 2 + height * 0.07);
}

function initializeGrid() {
    grid = Array.from({ length: cols }, () =>
        Array.from({ length: rows }, () => true) // True means walkable
    );
}

// Initialize walls
function initializeWalls() {
    walls = [];
    let attempts = 0;
    const MAX_WALL_ATTEMPTS = 10000;
    const MAX_TOTAL_FAIL_THRESHOLD = 100; // Number of total generation fails before forced minimal walls
    let totalGenerationFails = 0;

    // Reset grid to walkable
    grid = Array.from({ length: cols }, () =>
        Array.from({ length: rows }, () => true)
    );

    while (attempts < MAX_WALL_ATTEMPTS) {
        // Reset walls and grid
        walls = [];
        grid = Array.from({ length: cols }, () =>
            Array.from({ length: rows }, () => true)
        );

        let wallCount = min(20 + 4*level, floor(rows*cols/4));
        let maxWallSize = min(1 + level, 3);

        // Player's initial grid position
        let playerGridX = floor(player.x / cellSize);
        let playerGridY = floor(player.y / cellSize);

        for (let i = 0; i < wallCount; i++) {
            let wallX, wallY;
            let validWallPosition = false;
            let positionAttempts = 0;

            // Find a valid wall position
            while (!validWallPosition && positionAttempts < 100) {
                wallX = floor(random(cols));
                wallY = floor(random(rows));

                // Ensure wall doesn't overlap player's initial area (3x3 grid around player)
                if (
                    Math.abs(wallX - playerGridX) > 1 || 
                    Math.abs(wallY - playerGridY) > 1
                ) {
                    validWallPosition = true;
                }
                positionAttempts++;
            }

            // Skip if no valid position found
            if (!validWallPosition) continue;

            let wallW = floor(random(1, maxWallSize)) * cellSize;
            let wallH = floor(random(1, maxWallSize)) * cellSize;

            // Constrain walls within canvas bounds
            if (wallX * cellSize + wallW > width) wallW = width - wallX * cellSize;
            if (wallY * cellSize + wallH > height) wallH = height - wallY * cellSize;

            let wall = new Wall(wallX * cellSize, wallY * cellSize, wallW, wallH);
            
            // Mark wall area as unwalkable
            for (let x = wallX; x < wallX + floor(wallW / cellSize); x++) {
                for (let y = wallY; y < wallY + floor(wallH / cellSize); y++) {
                    if (x < cols && y < rows) grid[x][y] = false;
                }
            }

            walls.push(wall);
        }

        // Validate map connectivity
        let playerX = floor(player.x / cellSize);
        let playerY = floor(player.y / cellSize);
        
        if (validateMapConnectivity(grid, playerX, playerY, [...enemies, ...fragments])) {
            return; // Map is valid, exit function
        }

        attempts++;
        totalGenerationFails++;

        // Emergency brake if too many fails
        if (totalGenerationFails > MAX_TOTAL_FAIL_THRESHOLD) {
            console.warn("Repeatedly failed to generate valid map. Creating minimal walls.");
            walls = [];
            return;
        }
    }

    console.warn("Could not generate a valid map after maximum attempts.");
    walls = []; // Ensure walls are empty if generation fails
}

function validateMapConnectivity(grid, startX, startY, targetObjects) {
    let visited = Array.from({ length: cols }, () => Array(rows).fill(false));
    let queue = [[startX, startY]];
    visited[startX][startY] = true;
    let reachableTargets = 0;

    while (queue.length > 0) {
        let [currentX, currentY] = queue.shift();

        // Check if we've reached any targets
        for (let obj of targetObjects) {
            let objX = floor(obj.x / cellSize);
            let objY = floor(obj.y / cellSize);
            if (currentX === objX && currentY === objY) {
                reachableTargets++;
            }
        }

        // Check neighbors
        let neighbors = [
            [currentX + 1, currentY],
            [currentX - 1, currentY],
            [currentX, currentY + 1],
            [currentX, currentY - 1],
        ];

        for (let [nx, ny] of neighbors) {
            if (
                nx >= 0 && ny >= 0 && 
                nx < cols && ny < rows && 
                !visited[nx][ny] && 
                grid[nx][ny]
            ) {
                queue.push([nx, ny]);
                visited[nx][ny] = true;
            }
        }
    }

    return reachableTargets === targetObjects.length;
}

// Add a helper function to regenerate walls if map is unwinnable
function regenerateWallsIfNeeded() {
    let playerX = floor(player.x / cellSize);
    let playerY = floor(player.y / cellSize);
    
    if (!validateMapConnectivity(grid, playerX, playerY, [...enemies, ...fragments])) {
        initializeWalls();
    }
}

function isReachable(x, y) {
    let visited = Array.from({ length: cols }, () => Array(rows).fill(false));
    let queue = [[x, y]];

    while (queue.length > 0) {
        let [currentX, currentY] = queue.shift();
        if (visited[currentX][currentY]) continue;

        visited[currentX][currentY] = true;

        // Check neighbors
        let neighbors = [
            [currentX + 1, currentY],
            [currentX - 1, currentY],
            [currentX, currentY + 1],
            [currentX, currentY - 1],
        ];

        for (let [nx, ny] of neighbors) {
            if (nx >= 0 && ny >= 0 && nx < cols && ny < rows && !visited[nx][ny] && grid[nx][ny]) {
                queue.push([nx, ny]);
            }
        }
    }

    return visited;
}

function validateObjectPlacement() {
    let startX = floor(player.x / cellSize);
    let startY = floor(player.y / cellSize);
    let reachable = isReachable(startX, startY);

    // Check enemies
    for (let enemy of enemies) {
        let x = floor(enemy.x / cellSize);
        let y = floor(enemy.y / cellSize);
        if (!reachable[x][y]) {
            repositionObject(enemy); // Move the enemy to a valid location
        }
    }

    // Check fragments
    for (let fragment of fragments) {
        let x = floor(fragment.x / cellSize);
        let y = floor(fragment.y / cellSize);
        if (!reachable[x][y]) {
            repositionObject(fragment); // Move the fragment to a valid location
        }
    }
}

function repositionObject(object) {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (grid[i][j]) {
                object.x = i * cellSize + cellSize / 2;
                object.y = j * cellSize + cellSize / 2;
                return;
            }
        }
    }
}

function drawGrid() {
    stroke(100);
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            if (!grid[x][y]) fill(100); // Mark walls
            else noFill();
            rect(x * cellSize, y * cellSize, cellSize, cellSize);
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

function isCollidingWithWalls(x, y, size) {
    for (let wall of walls) {
        if (wall.isColliding({ x: x, y: y, size: size })) {
            return true;
        }
    }
    return false;
}

function spawnEnemies() {
    for (let i = 0; i < totalEnemies; i++) {
        let validSpawn = false;
        let spawnX, spawnY;

        while (!validSpawn) {
            spawnX = random(cellSize, width - cellSize);
            spawnY = random(cellSize, height - cellSize);
            validSpawn = !isCollidingWithWalls(spawnX, spawnY, cellSize * 0.5);
        }

        enemies.push(new Enemy(spawnX, spawnY, cellSize * 0.5, color(255, 0, 0)));
    }
}

function spawnFragments() {
    for (let i = 0; i < totalFragments; i++) {
        let validSpawn = false;
        let spawnX, spawnY;

        while (!validSpawn) {
            spawnX = random(cellSize, width - cellSize);
            spawnY = random(cellSize, height - cellSize);
            validSpawn = !isCollidingWithWalls(spawnX, spawnY, cellSize * 0.4);
        }

        fragments.push(new TemporalObject(spawnX, spawnY, cellSize * 0.4, color(0, 255, 0)));
    }
}


function checkWinCondition() {
    return fragments.length === 0 && enemies.length === 0;
}

class Player {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = size * 0.15;
        this.lives = 3;
        this.score = 0;
        this.cooldown = 60;
        this.targetX = x;
        this.targetY = y;
        this.shotCooldown = 30;
    }

    update(walls) {
        let dx = this.targetX - this.x;
        let dy = this.targetY - this.y;
        let distance = dist(this.x, this.y, this.targetX, this.targetY);
        if (distance > this.speed) {
            let nextX = this.x + (dx / distance) * this.speed;
            let nextY = this.y + (dy / distance) * this.speed;
            
            // Constrain player within screen borders
            nextX = constrain(nextX, this.size / 2, width - this.size / 2);
            nextY = constrain(nextY, this.size / 2, height - this.size / 2);
            
            if (!this.isCollidingWithWalls(nextX, nextY, walls)) {
                this.x = nextX;
                this.y = nextY;
            }
        }
        if (this.cooldown > 0) this.cooldown--;
        if (this.shotCooldown > 0) this.shotCooldown--;
    }

    display() {
        textSize(width * 0.03);
        fill(155);
        text(`Score: ${this.score}`, 50, 30);
        text(`Lives: ${this.lives}`, 50, 70);
        if (this.cooldown >= 0 && this.cooldown % 3 != 1) {
            fill(155, 55, 255);
            ellipse(this.x, this.y, this.size);
        }
        else {
            fill(0, 255, 255);
            ellipse(this.x, this.y, this.size);
        }
    }

    isVulnerable() {
        return this.cooldown === 0;
    }

    lifeLost() {
        if (this.cooldown == 0) {
            this.lives--;
            if (this.lives < 1) return true;
            else  this.cooldown = 60;
        }
        return false;
    }

    updateScore() {
        this.score++;
    }

    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
    }

    shoot() {
        if (this.shotCooldown === 0) {
            let angle = atan2(mouseY - this.y, mouseX - this.x);
            projectiles.push(new Projectile(this.x, this.y, this.size * 0.45, angle));
            this.shotCooldown = 15;
        }
    }

    isTouching(object) {
        return dist(this.x, this.y, object.x, object.y) < this.size / 2 + object.size / 2;
    }

    isCollidingWithWalls(nextX, nextY, walls) {
        for (let wall of walls) {
            if (wall.isColliding({ x: nextX, y: nextY, size: this.size })) return true;
        }
        return false;
    }
}

// Enemy class
class Enemy {
    constructor(x, y, size, eColor) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = eColor;
        this.speed = size * 0.1;
        this.angle = random(TWO_PI); // Initial direction (random)
        this.lastKnownPlayerX = null;
        this.lastKnownPlayerY = null;
        this.wallFollowDirection = 1; // 1 or -1 to alternate wall following
    }

    hasLineOfSight(player, walls) {
        // Check if there's a clear line between enemy and player
        for (let wall of walls) {
            if (this.lineIntersectsWall(this.x, this.y, player.x, player.y, wall)) {
                return false;
            }
        }
        return true;
    }

    lineIntersectsWall(x1, y1, x2, y2, wall) {
        // Previous line-rectangle intersection method
        let left = wall.x;
        let right = wall.x + wall.w;
        let top = wall.y;
        let bottom = wall.y + wall.h;

        if ((x1 <= left && x2 <= left) || 
            (x1 >= right && x2 >= right) || 
            (y1 <= top && y2 <= top) || 
            (y1 >= bottom && y2 >= bottom)) {
            return false;
        }

        let m = (y2 - y1) / (x2 - x1);
        let b = y1 - m * x1;

        let intersectTop = (top - b) / m;
        let intersectBottom = (bottom - b) / m;
        let intersectLeft = m * left + b;
        let intersectRight = m * right + b;

        return (
            (intersectTop >= left && intersectTop <= right) ||
            (intersectBottom >= left && intersectBottom <= right) ||
            (intersectLeft >= top && intersectLeft <= bottom) ||
            (intersectRight >= top && intersectRight <= bottom)
        );
    }

    moveAlongWall(walls) {
        // More dynamic wall following
        let nearestWall = null;
        let smallestDistance = Infinity;
        let wallDistances = [];

        // Find all nearby walls and their distances
        for (let wall of walls) {
            let distance = dist(this.x, this.y, wall.x + wall.w/2, wall.y + wall.h/2);
            if (distance < smallestDistance) {
                smallestDistance = distance;
                nearestWall = wall;
            }
            wallDistances.push({ wall, distance });
        }

        if (nearestWall) {
            // Multiple strategies for wall movement
            let moveX = 0;
            let moveY = 0;

            // Alternate between different wall movement strategies
            switch(Math.floor(frameCount / 60) % 3) {
                case 0:
                    // Move parallel to wall
                    if (nearestWall.w > nearestWall.h) {
                        // Horizontal wall
                        moveX = this.speed * this.wallFollowDirection;
                    } else {
                        // Vertical wall
                        moveY = this.speed * this.wallFollowDirection;
                    }
                    break;

                case 1:
                    // Slightly random movement near wall
                    moveX = this.speed * cos(this.angle) * this.wallFollowDirection;
                    moveY = this.speed * sin(this.angle) * this.wallFollowDirection;
                    break;

                case 2:
                    // Diagonal wall tracing
                    moveX = this.speed * cos(this.angle + QUARTER_PI) * this.wallFollowDirection;
                    moveY = this.speed * sin(this.angle + QUARTER_PI) * this.wallFollowDirection;
                    break;
            }

            // Calculate next position
            let nextX = this.x + moveX;
            let nextY = this.y + moveY;

            // Check for wall collisions
            let canMove = true;
            for (let wall of walls) {
                if (wall.isColliding({ x: nextX, y: nextY, size: this.size })) {
                    // If collision detected, switch wall follow direction
                    this.wallFollowDirection *= -1;
                    canMove = false;
                    break;
                }
            }

            if (canMove) {
                this.x = nextX;
                this.y = nextY;
                // Occasionally change wall follow direction to add randomness
                if (frameCount % 120 === 0) {
                    this.wallFollowDirection *= -1;
                }
            }
        }
    }

    update(player, walls) {
        // Check if enemy has direct line of sight to player
        if (this.hasLineOfSight(player, walls)) {
            // Directly seek the player
            let dx = player.x - this.x;
            let dy = player.y - this.y;
            this.angle = atan2(dy, dx);

            // Update last known player position
            this.lastKnownPlayerX = player.x;
            this.lastKnownPlayerY = player.y;
        } else if (this.lastKnownPlayerX !== null) {
            // No direct line of sight - move along walls
            this.moveAlongWall(walls);
        } else {
            // Wander randomly if player not seen
            this.angle += random(-0.1, 0.1);
        }

        // Calculate movement
        let moveX = cos(this.angle) * this.speed;
        let moveY = sin(this.angle) * this.speed;

        // Calculate the next position
        let nextX = this.x + moveX;
        let nextY = this.y + moveY;

        // Constrain enemy within screen borders
        nextX = constrain(nextX, this.size / 2, width - this.size / 2);
        nextY = constrain(nextY, this.size / 2, height - this.size / 2);

        // Check for wall collisions and update position if no collision
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
        ellipse(this.x, this.y, this.size, this.size);
    }
}

//the collectible object
class TemporalObject {
    constructor(x, y, size, oColor) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = oColor;
    }

    display() {
        push();
        fill(this.color);
        ellipse(this.x, this.y, this.size);
        pop();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
    }

    itemReceived() {
        this.collected = true;
        this.x = width * 2; // Move offscreen
        this.y = height * 2; // Move offscreen
    }
}

class Wall {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.hits = 2;
    }

    display() {
        if (this.hits > 0) {
            fill(100);
            rect(this.x, this.y, this.w, this.h);
        }
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

class Projectile {
    constructor(x, y, size, angle) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = 10;
        this.angle = angle;
        this.hitWall = false;
    }

    update(walls) {
        this.x += cos(this.angle) * this.speed;
        this.y += sin(this.angle) * this.speed;

        // Constrain projectile within screen borders
        this.x = constrain(this.x, 0, width);
        this.y = constrain(this.y, 0, height);

        for (let wall of walls) {
            if (wall.isColliding(this)) {
                this.hitWall = true;
                if (wallCooldown === 0) wall.hits--;
                break;
            }
        }
    }

    offScreen() {
        return this.x <= 0 || this.x >= width - this.size || this.y <= 0 || this.y >= height;
    }

    display() {
        fill(255, 0, 0);
        ellipse(this.x, this.y, this.size);
    }

    hits(enemy) {
        return dist(this.x, this.y, enemy.x, enemy.y) < this.size / 2 + enemy.size / 2;
    }
}