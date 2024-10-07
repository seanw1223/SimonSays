const circles = document.querySelectorAll('.circle:not(.circle1)'); // Selects all circles except the first one
const startButton = document.querySelector('.start-button'); // Selects the start button
const redLight = document.querySelector('.red-light'); // Selects the red light
const numberDisplay1 = document.querySelector('.number-display1'); // Selects the display for the last game score
const numberDisplay2 = document.querySelector('.number-display2'); // Selects the display for the high score

let sequence = []; // Stores the sequence of colors
let userSequence = []; // Stores the user's input sequence
let score = 0; // Stores the current score
let highScore = 0; // Stores the highest score achieved
let sequenceIndex = 0; // Stores the current index in the sequence
let gameStatus = 'RED'; // Indicates the current game status (RED or GREEN)
let userInputTimeout; // Stores the timeout for user input
let intervalTime = 1000; // Initial interval time between signals
let gameInterval; // Stores the interval for controlling the game speed

function resetGame() { // Resets the game state
    sequence = [];
    userSequence = [];
    sequenceIndex = 0;
    score = 0;
    updateScoreDisplay();
    toggleGameStatus('RED'); // Reset the game status indicator to red
}

function startGame() { // Starts the game
    resetGame();
    toggleGameStatus('GREEN'); // Changes the game status indicator to green
    setTimeout(() => {
        nextSequence(); // Starts the next sequence after 3 seconds
    }, 3000);
}

function nextSequence() { // Next sequence
    userSequence = [];
    sequenceIndex = 0;
    addToSequence(); // Adds a new color 
    playSequence(); // Plays the sequence
}

function addToSequence() { // Adds a new color to the sequence
    const colors = ['green', 'red', 'yellow', 'blue']; // colors that could be added
    const randomIndex = Math.floor(Math.random() * colors.length); // Randomly selects a color
    sequence.push(randomIndex); // Adds the selected color to the sequence
    if (sequence.length === 5 || sequence.length === 9 || sequence.length === 13) {
        intervalTime -= 100; // Speeds up the interval time after certain sequences
    }
}

function playSequence() { // Plays the sequence of colors
    let i = 0;
    gameInterval = setInterval(() => {
        if (i >= sequence.length) {
            clearInterval(gameInterval); // Stops playing the sequence
            userInputTimeout = setTimeout(() => {
                flashAllColors(5); // Flashes all colors if user takes too long to respond
            }, 5000); // Sets a timeout for 5 seconds
            return;
        }
        const colorIndex = sequence[i];
        flash(circles[colorIndex]); // Flashes the circle with the specified color
        i++;
    }, intervalTime);
}

function flash(circle) { // Flashes the specified circle
    const originalColor = circle.style.backgroundColor;
    circle.style.backgroundColor = 'white'; // Changes the color to white
    setTimeout(() => {
        circle.style.backgroundColor = originalColor; // Restores the original color after a delay
    }, intervalTime / 2);
}

function userSequenceHandler(index) { // Handles user input
    userSequence.push(index); // Adds the clicked circle index to the user's sequence
    checkUserInput(); // Checks if the input is correct
}

function checkUserInput() { // Checks the user's input
    const currentColor = sequence[sequenceIndex]; // Retrieves the current color in the sequence
    const userInputColor = userSequence[userSequence.length - 1]; // Retrieves the latest user input

    if (currentColor !== userInputColor || userSequence.length > sequence.length) { // Checks if the input is incorrect
        flashAllColors(5); // Flashes all colors before displaying game over
        return;
    }

    sequenceIndex++;

    if (sequenceIndex === sequence.length) { // Checks if the sequence is complete
        score = sequence.length; // Updates the score
        updateScoreDisplay(); // Updates the score display
        clearInterval(gameInterval); // Stops the game interval
        clearTimeout(userInputTimeout); // Clears the user input timeout
        setTimeout(() => {
            nextSequence(); // Starts the next sequence
        }, 1000); // Waits for a second before starting the next sequence
    }
}

function gameOver() { // Displays  game over message and resets game
    alert('Game Over! Your score was: ' + score);
    if (score > highScore) {
        highScore = score;
        numberDisplay2.textContent = highScore.toString().padStart(2, '0');
    }
    resetGame();
}

function updateScoreDisplay() { // Updates score display
    numberDisplay1.textContent = score.toString().padStart(2, '0');
}

function toggleGameStatus(status) { // Toggles game status
    gameStatus = status;
    redLight.style.backgroundColor = status === 'RED' ? 'red' : 'green'; // Changes the light color based on the status
}

function flashAllColors(times) { // Flashes all colors 5 times
    let count = 0;
    const flashInterval = setInterval(() => {
        circles.forEach(circle => {
            flash(circle); // Flashes each circle
        });
        count++;
        if (count === times) {
            clearInterval(flashInterval); // Stops flashing after the 5 times
            setTimeout(() => {
                circles.forEach(circle => {
                    circle.style.backgroundColor = ''; // Resets the background color to its original color
                });
                gameOver(); // Displays game over message and resets game
            }, intervalTime); // Waits for the last flash  before showing game over
        }
    }, intervalTime);
}

startButton.addEventListener('click', startGame); // Adds event listener to the start button

circles.forEach((circle, index) => { // Adds event listeners to each circle
    circle.addEventListener('click', () => {
        if (gameStatus === 'GREEN') {
            userSequenceHandler(index); 
        }
    });
});

resetGame(); // Resets the game 


// to make this run, i used a wide array of sources to carefully build the functions as close to the required as i possibly could, 

// the html was mostly created using w3schools to link to css and to create div classes to store the start button and red light,
// i simply searched "Orbitron html" and found it on w3 schools very easily and followed its steps to make the link to the font,
// i did this on html as it was how it had been somewhat done by w3 schools

// for the css i created a circle class which i was able to do from one of the links given to us for assignment 1, the link i used was https://css-tricks.com/the-shapes-of-css/
// i also used elements of codepen to create sizes for my circles, when it came to positioning i used w3schools to assign my circles
// i found making the positons of my circles as well as my start button 'absolute' the easiest to position using bottom,left,right,top
// w3 schools also was useful for me adding a hover function for my circles to allow them to enlarge when hovering over them adding a slight flair
// i copied the same method for my number displays and start button, my positions did take time and i believe a faster way is possible but i just tried aligning manually this time

// for my javascript i used many different sources and had to mix and match quite a bit to get it running as close as i could
// i looked at different developers on Github to see their different ways, i looked at codes for js such as https://github.com/pc555/simon-game
// i also looked at https://github.com/topics/simon-game?l=javascript which was more of a topic page on github but i had to try not to study versions of the game with elements from C
// github also had plenty of versions where audio was incorporated on a massive level so i had to find ways to avoid that being so essential and focus on the sequence itself.
// i also looked at some source code on codepen for a rough outline on getting the game to simply go along with a sequence
// youtube was also an extremely useful source, in particular for understanding the array storage needed for the game, 
// i watched videos such as "Live Coding a Simon Game: HTML, CSS, Javascript" by" Web Dev Cody", whos video showed me a way of using the constants as well as helping with invaluable methods such as the flash method
// i also watched "Simon Game JavaScript Tutorial for Beginners" by "freeCodeCamp.org" who was much more focused on the js side of things
// this suited me well but i found his video to be less helpful than the previous as his game was very much focused on the audio side of the js
//W3 scghools helped with more simple functions such as the start button stating the sequence
// i used another youtube video called "Simon Game Clone Using HTML, CSS and JS ..." by "Coding Spot" which was another video that i found extremely useful
// one of the harder parts of the js was making the next sequence as well as the 5 flashes before it ends and this video was very good at helping me make improvements in this
//"How To Create Simon Game | Javascript Project With Source" by "Coding Artist" also helped me work around the sequence if it is in the wrong order

//overall i found websites such as codepen and w3schools extremely good in terms of the css and html
// js was much better found in videos as some of the functions/requirements were quite detailed.
