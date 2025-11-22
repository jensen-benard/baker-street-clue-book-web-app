
let clueData = null;
let maxClueNumber = null;
let minClueNumber = null;
let timerMusic = null;
let timer = null;

async function initClueData() {
    try {
        const result = await fetch("data/clue_data.json");
        clueData = await result.json();
        maxClueNumber = clueData.maxClueNumber;
        minClueNumber = clueData.minClueNumber;
        timerMusic = new Audio(clueData.timerMusicFile);

        document.getElementById("submit").disabled = false;
    } catch (error) {
        console.error("Failed to load clue_data.json: ", error);
    }
}

initClueData();

document.addEventListener("DOMContentLoaded", () => {
    const inputBox = document.getElementById("clue-number");

    inputBox.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            registerClueNumber();
        }
    });
});


function isValidClueNumber(value)
{
    return value != "" && !isNaN(value) && Number.isInteger(parseInt(value)) && value >= minClueNumber && value <= maxClueNumber;
}


function registerClueNumber()
{
    let inputBox = document.getElementById("clue-number");
    let clueNumber = inputBox.value.trim();
    let errorMessage = document.getElementById("error-message");

    if(!isValidClueNumber(clueNumber)) {
        inputBox.value = "";
        errorMessage.textContent = "Please enter a valid clue number.";
        return;
    }

    inputBox.value = "";
    errorMessage.textContent = "";
    clueNumber = parseInt(clueNumber);


    let matchesFound = false;
    clueData.imageFilenames.forEach(filename => {
        [startClue, endClue] = filename.match(/\d+/g).map(Number)

        if (clueNumber >= startClue && clueNumber <= endClue) {
            let img = document.createElement("img");
            img.src  = `data/images/${filename}`;
            let clueImages = document.getElementById("clue-images");
            clueImages.append(img);
            matchesFound = true;
        }
    })

    if (!matchesFound) {
        errorMessage.textContent = "No clues found"
    }
    else {
        document.getElementById("input-section").style.display = "none";
        let clueSection = document.getElementById("clue-section");
        clueSection.style.display = "flex";

        runTimer();
    }
}


function runTimer()
{
    clearInterval(timer);

    let remainingTime = clueData.timerDuration;
    let timerText = document.getElementById("timer-value");
    timerText.textContent = remainingTime;

    timerMusic.currentTime = clueData.timerMusicStartTime;
    timerMusic.play();
    timer = setInterval(() => {
        remainingTime--;

        timerText.textContent = remainingTime;

        if (remainingTime < 1) {
            onTimerFinish();
        }
    }, 1000);
}

function onTimerFinish()
{   
    timerMusic.pause();
    timerMusic.currentTime = 0;
    clearInterval(timer);

    endTimerMusic = new Audio(clueData.endTimerMusicFile);
    endTimerMusic.currentTime = clueData.endTimerMusicStartTime
    endTimerMusic.play();
    
    document.getElementById("input-section").style.display = "block";
    document.getElementById("clue-section").style.display = "none";
    document.getElementById("clue-images").innerHTML = "";
}