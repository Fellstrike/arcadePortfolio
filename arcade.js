/*
*******NEED A WAY TO MAKE RANDOM MAZES*******
*******Let enemies fire as it gets harder****
*****Create actual powerups******************
*/
let player;
let enemies = [];
let fragments = [];
let walls = [];
let projectiles = [];
let gameLost = false;
let gameStarted = false;
let totalFragments = 2;
let totalEnemies = 2;
let newLocationX = 0;
let newLocationY = 0;

function setup() {
    createCanvas(windowWidth, windowHeight);
    resetGame();
}

function draw() {
    background(30);
    if (!gameStarted) {
        displayStartButton();
    } else {
        if (gameLost) {
            fill(255);
            textSize(width * 0.05);
            textAlign(CENTER, CENTER);
            text("Game Over", width / 2, height / 2);
            textSize(width * 0.03);
            text("Press R to Restart", width / 2, height / 2 + height * 0.07);
            return;
        }

        if (checkWinCondition()) {
            fill(0, 255, 0);
            textSize(width * 0.05);
            textAlign(CENTER, CENTER);
            text("You Win!", width / 2, height / 2);
            textSize(width * 0.03);
            text("Press R to Play Again", width / 2, height / 2 + height * 0.07);
            noLoop();
            return;
        }

        // Draw walls
        for (let wall of walls) {
            wall.display();
        }

        // Draw and update fragments
        for (let fragment of fragments) {
            if (!fragment.collected) fragment.display();
        }

        // Draw and update enemies
        for (let enemy of enemies) {
            enemy.update(player, walls);
            enemy.display();
        }

        //Draw and update the player
        player.update(walls);
        player.display();

        //draw and updat eprojectiles
        for (let i = projectiles.length - 1; i >= 0; i--) {
            projectiles[i].update(walls);
            if (projectiles[i].hitWall) {
                projectiles.splice(i, 1);
                break
            }
            projectiles[i].display();
        
            // Check for collision with enemies
            let hitEnemy = false;
            for (let j = enemies.length - 1; j >= 0; j--) {
                if (projectiles[i].hits(enemies[j])) {
                    enemies.splice(j, 1); // Remove the enemy
                    hitEnemy = true;
                    break; // Stop checking other enemies
                }
            }
        
            // Remove projectile if it hit an enemy
            if (hitEnemy) {
                projectiles.splice(i, 1);
            } else if (projectiles[i].offScreen()) {
                // Remove projectile if it goes off-screen
                projectiles.splice(i, 1);
            }
        }

        for (let fragment of fragments) {
            if (dist(player.x, player.y, fragment.x, fragment.y) < fragment.size / 2 + player.size / 2 && !fragment.collected) {
                player.updateScore();
                fragment.itemReceived();
            }
        }

        for (let enemy of enemies) {
            if (dist(player.x, player.y, enemy.x, enemy.y) < enemy.size / 2 + player.size / 2 && player.isVulnerable()) {
                gameLost = player.lifeLost();
            }
        }
    }
}

// Display the start button
function displayStartButton() {
    push();
    fill(0, 255, 0);
    rect(width / 2 - 50, height / 2 - 25, 100, 50); // Button rectangle
    fill(255);
    textSize(18);
    textAlign(CENTER, CENTER);
    text("Start Game", width / 2, height / 2);
    pop();
}

function mousePressed() {
    if (!gameStarted) {
        let buttonX = width / 2 - 50;
        let buttonY = height / 2 - 25;
        let buttonW = 100;
        let buttonH = 50;
        
        // Check if mouse click is within the button
        if (mouseX > buttonX && mouseX < buttonX + buttonW &&
            mouseY > buttonY && mouseY < buttonY + buttonH) {
            gameStarted = true; // Start the game
        }
    }
    else {
    player.setTarget(mouseX, mouseY);
    }
}

function touchStarted() {
    player.setTarget(mouseX, mouseY);
}

function keyPressed() {
    if (gameLost || checkWinCondition()) {
        if (key === "r") resetGame();
    } else if (key === " ") {
        player.shoot();
    }
}

function detectSpawnpoint(objectSize) {
    let spawnX, spawnY;
    let validSpawn = false;
    let attempts = 0;
    const maxAttempts = 100;

    while (!validSpawn && attempts < maxAttempts) {
        // Generate random position
        spawnX = random(width);
        spawnY = random(height);

        // Check for collisions with walls
        validSpawn = true;
        for (let wall of walls) {
            if (isPointInsideWall({ x: spawnX, y: spawnY }, wall, objectSize)) {
                validSpawn = false;
                break;
            }
        }

        attempts++;
    }

    // Fallback if no valid spawn found
    if (!validSpawn) {
        spawnX = width / 2;
        spawnY = height / 2;
    }

    newLocationX = spawnX;
    newLocationY = spawnY;
}

// Helper function to check if a point is inside a wall. Isn't working quite right. Sometimes enemies are still spawning in walls.
function isPointInsideWall(point, wall, objectSize) {
    return (
        point.x + objectSize > wall.x && 
        point.x < wall.x + wall.w && 
        point.y + objectSize > wall.y && 
        point.y < wall.y + wall.h &&
        point.x < 0 &&
        point.x + objectSize > width &&
        point.y < 0 &&
        point.y  + objectSize > height
    );
}

function resetGame() {
    let objectSize = min(width, height) * 0.05;

    enemies = [];
    fragments = [];
    walls = [];
    projectiles = [];
    
    walls.push(new Wall(random(width - objectSize * 3), random(height - objectSize * 3), random(objectSize * 2, objectSize * 4), random(objectSize * 2, objectSize * 4)));

    for (let i = 0; i < 5; i++) {
        detectSpawnpoint(objectSize * 3);
        walls.push(new Wall(random(width), random(height), random(objectSize * 2, objectSize * 4), random(objectSize * 2, objectSize * 4)));
    }

    // Improved spawn detection for player
    detectSpawnpoint(objectSize);
    player = new Player(newLocationX, newLocationY, objectSize);
    
    // Improved spawn detection for enemies
    for (let i = 0; i < totalEnemies; i++) {
        detectSpawnpoint(objectSize);
        enemies.push(new Enemy(newLocationX, newLocationY, objectSize, color(255, 0, 0)));
    }
    
    // Improved spawn detection for fragments
    for (let i = 0; i < totalFragments; i++) {
        detectSpawnpoint(objectSize);
        fragments.push(new TemporalObject(newLocationX, newLocationY, objectSize * 0.75, color(0, 255, 0)));
    }

    gameLost = false;
    loop();
}

function checkWinCondition() {
    return fragments.every(f => f.collected) && enemies.length === 0;
}

// Player class
// Player class
class Player {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = size * 0.15; // Speed relative to size
        this.lives = 3;
        this.score = 0;
        this.cooldown = 0; // Timer for invulnerability
        this.cooldownTime = 60; // Frames of invulnerability
        this.targetX = this.x;
        this.targetY = this.y;
    }

    update(walls) {
        let nextX = this.x;
        let nextY = this.y;

        // Calculate next position
        let dx = this.targetX - this.x;
        let dy = this.targetY - this.y;
        let distance = dist(this.x, this.y, this.targetX, this.targetY);

        if (distance > this.speed) {
            nextX += (dx / distance) * this.speed;
            nextY += (dy / distance) * this.speed;
        }

        // Check for wall collisions
        let canMove = true;
        for (let wall of walls) {
            if (wall.isColliding({ x: nextX, y: nextY, size: this.size })) {
                canMove = false;
                //console.log("I hit a waall");
                break;
            }
        }

        // Update position if not colliding
        if (canMove) {
            this.x = nextX;
            this.y = nextY;
        }

        // Decrease cooldown timer
        if (this.cooldown > 0) {
            this.cooldown--;
        }
    }

    display() {
        // Display score
        textSize(width * 0.03);
        fill(200);
        textAlign(LEFT, TOP);
        text("Score: " + this.score, width * 0.05, height * 0.05);

        // Display lives
        text("Lives: ", width * 0.7, height * 0.05);
        for (let l = 0; l < this.lives; l++) {
            fill(200, 0, 200);
            rect(width * 0.8 + l * this.size * 0.4, height * 0.055, this.size * 0.3, this.size * 0.4);
        }

        // Display player
        push();
        fill(155, 55, 255);
        ellipse(this.x, this.y, this.size);
        pop();
    }

    isVulnerable() {
        return this.cooldown === 0;
    }

    lifeLost() {
        if (this.isVulnerable()) {
        this.lives--;
        this.cooldown = this.cooldownTime;
        if (this.lives <= 0) {
            return true;
        }
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
        let angle = atan2(mouseY - this.y, mouseX - this.x);
        projectiles.push(new Projectile(this.x, this.y, this.size * 0.2, angle));
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
        this.collected = false;
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
    }

    display() {
        fill(100);
        rect(this.x, this.y, this.w, this.h);
    }

        // Method to check collision
    isColliding(obj) {
        return (
            obj.x + obj.size / 2 > this.x && // Right side of object past wall's left
            obj.x - obj.size / 2 < this.x + this.w && // Left side of object past wall's right
            obj.y + obj.size / 2 > this.y && // Bottom of object past wall's top
            obj.y - obj.size / 2 < this.y + this.h // Top of object past wall's bottom
        );
    }
}

class Projectile {
    constructor(x, y, size, angle) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.angle = angle;
        this.speed = size * 1.5;
        this.hitWall = false;
    }

    update(walls) {
        // Update the position first
        this.x += cos(this.angle) * this.speed;
        this.y += sin(this.angle) * this.speed;

        // Check for wall collisions after updating position
        for (let wall of walls) {
            if (wall.isColliding({ x: this.x, y: this.y, size: this.size })) {
                this.hitWall = true;
                //console.log("Projectile hit a wall!");
                break;
            }
        }
    }

    display() {
        fill(255, 255, 0);
        ellipse(this.x, this.y, this.size);
    }

    hits(enemy) {
        return dist(this.x, this.y, enemy.x, enemy.y) < this.size / 2 + enemy.size / 2;
    }

    offScreen() {
        return this.x < 0 || this.x > width || this.y < 0 || this.y > height;
    }
}