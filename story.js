let gameFont;
let artStatement;
let nilsPic;
let pixelatedImage;
let pixelation_level = 500;
let currentText = '';
let textRevealIndex = 0;
let textRevealTimer = 0;
let textRevealSpeed = 1.5; // Lower is faster

let menuButton = [];
let curBttn = 0;
let email = false;

let homeButton;
let cvButton;
let capSiteButton; //Capstone Website button (unimplimented)
let openPButton; //Open Processing Button (unimplimented)
let gitButton;
let mailButton;
let storyButton;

let isMobileDevice;

function preload() {
    try {
        gameFont = loadFont('prstart.ttf');
        nilsPic = loadImage("butterflySelf.png");
    } catch (error) {
        console.error("Failed to load assets:", error);
    }

    let details = navigator.userAgent || '';
    let regexp = /android|iphone|kindle|ipad/i;
    isMobileDevice = regexp.test(details);

    // Create and style buttons
    homeButton = createButton("Main Menu");
    homeButton.mousePressed(backToMenu);
    homeButton.style('padding', '10px');
    homeButton.style('background-color', '#5D3FEE');
    homeButton.style('color', 'white');
    homeButton.style('border', 'none');
    homeButton.style('border-radius', '5px');

    cvButton = createButton("Artist CV");
    cvButton.mousePressed(downloadCV);
    cvButton.style('padding', '10px');
    cvButton.style('background-color', '#5D2FD0');
    cvButton.style('color', 'white');
    cvButton.style('border', 'none');
    cvButton.style('border-radius', '5px');

    gitButton = createButton("Github");
    gitButton.mousePressed(toGithub);
    gitButton.style('padding', '10px');
    gitButton.style('background-color', '#5D2FA0');
    gitButton.style('color', 'white');
    gitButton.style('border', 'none');
    gitButton.style('border-radius', '5px');

    openPButton = createButton("Open Processing");
    openPButton.mousePressed(toOpenP);
    openPButton.style('padding', '10px');
    openPButton.style('background-color', '#5D2F93');
    openPButton.style('color', 'white');
    openPButton.style('border', 'none');
    openPButton.style('border-radius', '5px');

    mailButton = createButton("E-mail Me");
    mailButton.mousePressed(sendEmail);
    mailButton.style('padding', '10px');
    mailButton.style('background-color', '#5C0FA0');
    mailButton.style('color', 'white');
    mailButton.style('border', 'none');
    mailButton.style('border-radius', '5px');

    storyButton = createButton("Interactive Story");
    storyButton.mousePressed(toInteractiveStory);
    storyButton.style('padding', '10px');
    storyButton.style('background-color', '#5A0EC9');
    storyButton.style('color', 'white');
    storyButton.style('border', 'none');
    storyButton.style('border-radius', '5px');

    artStatement = "I'm Nilsine, an immersive artist out of Portland, OR. I create experiences that blend the real and digital worlds allowing anyone regardless of age to discover and play without shame. I want my work to drive people to interact and explore my art in a natural way.\n\n\nUsing small computers my art can register what people are doing and have that change how those people experience my art. \n\nMy art is influenced by my experiences growing up as a queer nerd in the 90s, playing D&D despite the satanic panic, collaborative online storytelling, spending time in arcades, and early internet culture. I want to let people rediscover childlike wonder by viewing and interacting with my art. Hoping that people can carry those discoveries into their ‘mundane’ life allowing them to find small moments of magic in their day to day experience.";

    menuButton = [homeButton, cvButton, storyButton, openPButton, gitButton, mailButton];
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    textFont(gameFont);

    pixelatedImage = createGraphics(width, height);

    resizeButtons();


    // ARIA Labels
    homeButton.attribute('aria-label', 'Return to Main Menu');
    cvButton.attribute('aria-label', 'Download Artist CV');
    storyButton.attribute('aria-label', "Go Read My Interactive Story");
    gitButton.attribute('aria-label', 'View My GitHub Profile');
    openPButton.attribute('aria-label', 'Viewable Work at Open Processing');
    mailButton.attribute('aria-label', 'Send Email to Nilsine');
}

function draw() {
    background(10);
    if (email) text("nickwihtol@gmail.com", width*0.85, height*0.15);

    for (b = 0; b < menuButton.length; b++) {
        if (b == curBttn) menuButton[b].style('outline', '3px solid yellow');
        else menuButton[b].style('outline', 'none');
    }
    
    // Render pixelated image progressively
    renderPixelatedImage();

    // Reveal text progressively
    revealText();

    // Display the current text
    displayArtStatement();

    // Display navigation instructions
    displayNavigationText();
}

function menuFunction() {
    switch (curBttn) {
        case 0:
            backToMenu();
            break;
        case 1:
            downloadCV();
            break;
        case 2:
            toInteractiveStory();
            break;
        case 3:
            toOpenP();
            break;
        case 4:
            toGithub();
            break;
        case 5:
            sendEmail();
            break;
    }
}

function toOpenP() {
    window.location.href = "https://openprocessing.org/user/475647?o=3&view=sketches";
}

function keyPressed() {
    switch (keyCode) {
        case ENTER:
            menuFunction();
            break;
        case RIGHT_ARROW:
            curBttn++;
            break;
        case LEFT_ARROW:
            curBttn--;
            break;
    }
    if (curBttn < 0) {
        curBttn = menuButton.length - 1;
    }
    else if (curBttn >= menuButton.length) {
        curBttn = 0;
    }
    console.log(curBttn);
}

function toInteractiveStory() {
    window.location.href = "standardp/story1/index.html";
}

function setupButtonsAccessibility(buttons) {
    buttons.forEach((btn, index) => {
        btn.attribute('tabindex', index + 1); // Set focus order
        btn.mouseOver(() => btn.style('outline', '2px solid yellow')); // Highlight on focus
        btn.mouseOut(() => btn.style('outline', 'none'));
    });
}

function resizeButtons() {
    let buttonSize = min(width * 0.02, height * 0.02); // Base size scaling
    let buttonWidth = buttonSize * 10; // Fixed button width
    let buttonHeight = buttonSize * 2.5; // Fixed button height
    let totalButtonWidth = buttonWidth * menuButton.length; // Total width occupied by buttons
    let centerSpace = width - (totalButtonWidth*1.5);
    let spacing = (width - totalButtonWidth - centerSpace) / (menuButton.length + 50); // Spacing between buttons

    // Position and style buttons
    for (let i = 0; i < menuButton.length; i++) {
        let xPos = centerSpace + spacing + i * (buttonWidth + spacing); // Calculate x-position
        let yPos = height * 0.05; // Consistent vertical position

        menuButton[i].position(xPos, yPos);
        menuButton[i].size(buttonWidth, buttonHeight);

        // Adjust text size based on button width and text length
        let textLength = menuButton[i].elt.innerHTML.length;
        let textSize = min(buttonWidth / (textLength * 0.72), buttonHeight * 0.35); // Dynamic scaling
        menuButton[i].style('font-size', `${textSize}px`);
        menuButton[i].style('padding', `${buttonSize / 4}px`);
    }
}

function renderPixelatedImage() {  
    if (isMobileDevice) {
        image(nilsPic, width * 0.35, height * 0.175, width * 0.3, height * 0.45);
    }
    else if (nilsPic) {
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
    } else {
        fill(255, 50, 50);
        textSize(height * 0.02);
        textAlign(CENTER);
        text("Image failed to load.", width / 2, height / 2);
    }
}

function revealText() {
    textRevealTimer++;
    if (textRevealTimer >= textRevealSpeed) {
        if (textRevealIndex < artStatement.length) {
            currentText += artStatement[textRevealIndex];
            textRevealIndex++;
            textRevealTimer = 0;

            // Reduce pixelation as text reveals
            if (pixelation_level > 5 && frameCount % 2 === 0) {
                pixelation_level = max(5, pixelation_level - 0.75);
            }
        }
    }
}

function displayArtStatement() {
    fill(205, 155, 255);
    let baseSize = min(width, height);
    textSize(baseSize * 0.0195); // Scale text size
    fill(205, 155, 255);
    text(currentText, width * 0.05, height * 0.53, width * 0.9, height * 0.45);
}

function displayNavigationText() {
    fill(205, 155, 255); // Matching text color
    textSize(min(width, height) * 0.015); // Responsive font size
    textAlign(CENTER);
    text("Use Left and Right Arrow Keys to navigate, and Enter to activate menu buttons.", width / 2.5, height - 30); 
}

function backToMenu() {
    window.location.href = "index.html";
}

function toGithub () {
    window.location.href = "https://github.com/Fellstrike";
}

function downloadCV () {
    // Trigger the download of the resume file
    let resumeLink = document.createElement("a");
    resumeLink.href = "standardp/myResume.pdf"; // Update with the actual path to your resume file
    resumeLink.download = "Nilsine_Resume.pdf";
    resumeLink.click();
}

let clicked = true;
function sendEmail () {
    window.location.href = "mailto:nickwihtol@gmail.com?subject=Interested in Your Work";
    if (clicked) {
        email = true;
    }
    else {
        email = false;
    }
    clicked = !clicked;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    resizeButtons();
}
