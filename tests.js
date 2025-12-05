/* ---------------------------------------------------------
   TEST ENGINE – Learning With Fred
   Phase 1: Core engine + Google Sheet + Cache
--------------------------------------------------------- */

let QUESTIONS = [];          // Main question list
let currentIndex = 0;        // Current question number
let userAnswers = [];        // User's selected answers
let startTime = null;        // Exam start time
let sheetVersion = 1;        // Used for caching

/* ---------------------------------------------------------
   1) Load questions from Sheet OR Cache
--------------------------------------------------------- */

async function loadQuestions() {
    const CACHE_KEY = "fred_test_cache_v" + sheetVersion;

    // Try loading from cache first
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
        console.log("Loaded test from cache.");
        QUESTIONS = JSON.parse(cached);
        return;
    }

    // Otherwise load from Google Sheet
    console.log("Loading test from Google Sheet...");
    
    const sheetURL = "https://script.google.com/macros/s/AKfycbxrsVMOjWXCorHll5-x_gL1e-Zs9JqMHH9C3QQ9SHdExoL-8GMNhJ_XBLGqXpX2jU6y/exec";

    const response = await fetch(sheetURL);
    const data = await response.json();

    QUESTIONS = data.questions;

    // Save to cache
    localStorage.setItem(CACHE_KEY, JSON.stringify(QUESTIONS));
}

/* ---------------------------------------------------------
   2) Start Exam
--------------------------------------------------------- */

async function startExam() {
    await loadQuestions();
    startTime = Date.now();

    currentIndex = 0;
    userAnswers = [];

    loadQuestion();
    startTimer(10 * 60);  // 10-minute exam
}

/* ---------------------------------------------------------
   3) Load Question into UI
--------------------------------------------------------- */

function loadQuestion() {
    if (currentIndex >= QUESTIONS.length) {
        finishExam();
        return;
    }

    const Q = QUESTIONS[currentIndex];

    document.querySelector(".questionNumber").innerText =
        "Question " + (currentIndex + 1);

    document.getElementById("questionText").innerText = Q.question;

    // Load options
    const box = document.getElementById("optionsBox");
    box.innerHTML = "";

    Q.options.forEach((opt, idx) => {
        const div = document.createElement("div");
        div.className = "option";
        div.innerText = opt;
        div.onclick = () => selectOption(idx, div);
        box.appendChild(div);
    });
}

/* ---------------------------------------------------------
   4) Select Option
--------------------------------------------------------- */

let selectedOption = null;

function selectOption(index, div) {
    selectedOption = index;

    // Remove previous selections
    document.querySelectorAll(".option").forEach(o => {
        o.classList.remove("selected");
    });

    div.classList.add("selected");
}

/* ---------------------------------------------------------
   5) Next Question
--------------------------------------------------------- */

function nextQuestion() {
    if (selectedOption === null) {
        alert("Please choose an answer.");
        return;
    }

    userAnswers.push({
        question: QUESTIONS[currentIndex].question,
        correct: QUESTIONS[currentIndex].answer,
        chosen: selectedOption,
        isCorrect: selectedOption === QUESTIONS[currentIndex].answer
    });

    selectedOption = null;
    currentIndex++;

    loadQuestion();
}

/* ---------------------------------------------------------
   6) Finish Exam
--------------------------------------------------------- */

function finishExam() {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    const correctCount = userAnswers.filter(a => a.isCorrect).length;
    const total = userAnswers.length;

    alert(
        "Exam Finished!\n\n" +
        "Score: " + correctCount + " / " + total + "\n" +
        "Time: " + timeTaken + " seconds"
    );

    // TODO: Send to Google Sheet
    // TODO: Send summary to WhatsApp/Telegram
    // TODO: Save Mistakes in Leitner
}

/* ---------------------------------------------------------
   7) Timer
--------------------------------------------------------- */

function startTimer(seconds) {
    let remaining = seconds;

    const timerBox = document.getElementById("timer");

    const interval = setInterval(() => {
        let m = Math.floor(remaining / 60);
        let s = remaining % 60;

        timerBox.innerText =
            m.toString().padStart(2, "0") + ":" +
            s.toString().padStart(2, "0");

        remaining--;

        if (remaining < 0) {
            clearInterval(interval);
            finishExam();
        }
    }, 1000);
}/ tests engine
