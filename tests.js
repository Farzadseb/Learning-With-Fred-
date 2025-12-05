/* ---------------------------------------------------------
   TEST ENGINE – Learning With Fred
   FULL VERSION – PHASE 2 (Anti-Cheat + Auto-Resume 24h)
--------------------------------------------------------- */

let QUESTIONS = [];
let currentIndex = 0;
let userAnswers = [];
let startTime = null;
let remainingTime = null;
let selectedOption = null;
let cheatCount = 0;
let cheatLog = [];
let examSessionKey = "fred_exam_session_v1"; // versioning for upgrades

/* ---------------------------------------------------------
   LOAD OR RESTORE SESSION
--------------------------------------------------------- */

function loadSavedSession() {
    const saved = localStorage.getItem(examSessionKey);
    if (!saved) return null;

    const session = JSON.parse(saved);

    // Check expiration (24 hours)
    const now = Date.now();
    if (now - session.timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(examSessionKey);
        return null;
    }

    return session;
}

function saveSession() {
    const session = {
        timestamp: Date.now(),
        questions: QUESTIONS,
        index: currentIndex,
        answers: userAnswers,
        remaining: remainingTime,
        cheatCount,
        cheatLog
    };

    localStorage.setItem(examSessionKey, JSON.stringify(session));
}

/* ---------------------------------------------------------
   LOAD QUESTIONS (Sheet + Cache)
--------------------------------------------------------- */

async function loadQuestions() {
    const CACHE_KEY = "fred_test_cache_main";

    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
        QUESTIONS = JSON.parse(cached);
        return;
    }

    const sheetURL =
        "https://script.google.com/macros/s/AKfycbxrsVMOjWXCorHll5-x_gL1e-Zs9JqMHH9C3QQ9SHdExoL-8GMNhJ_XBLGqXpX2jU6y/exec";

    const response = await fetch(sheetURL);
    const data = await response.json();

    QUESTIONS = data.questions;

    localStorage.setItem(CACHE_KEY, JSON.stringify(QUESTIONS));
}

/* ---------------------------------------------------------
   START OR RESUME EXAM
--------------------------------------------------------- */

async function startExam() {
    document.body.style.overflow = "hidden";

    await loadQuestions();
    const old = loadSavedSession();

    if (old) {
        // RESUME MODE
        QUESTIONS = old.questions;
        currentIndex = old.index;
        userAnswers = old.answers;
        cheatCount = old.cheatCount;
        cheatLog = old.cheatLog;
        remainingTime = old.remaining;

        restoreTimer();
        loadQuestion();
        return;
    }

    // NEW EXAM
    startTime = Date.now();
    remainingTime = 10 * 60; // 10 minutes

    loadQuestion();
    startTimer();
}

/* ---------------------------------------------------------
   LOAD QUESTION
--------------------------------------------------------- */

function loadQuestion() {
    if (currentIndex >= QUESTIONS.length) {
        finishExam();
        return;
    }

    selectedOption = null;

    const Q = QUESTIONS[currentIndex];

    document.querySelector(".questionNumber").innerText =
        "Question " + (currentIndex + 1);

    document.getElementById("questionText").innerText = Q.question;

    const box = document.getElementById("optionsBox");
    box.innerHTML = "";

    Q.options.forEach((opt, idx) => {
        const div = document.createElement("div");
        div.className = "option";
        div.innerText = opt;
        div.onclick = () => selectOption(idx, div);
        box.appendChild(div);
    });

    saveSession();
}

/* ---------------------------------------------------------
   SELECT OPTION (LOCKED)
--------------------------------------------------------- */

function selectOption(index, div) {
    if (selectedOption !== null) return;

    selectedOption = index;

    document.querySelectorAll(".option").forEach(o => {
        o.classList.remove("selected");
    });

    div.classList.add("selected");

    saveSession();
}

/* ---------------------------------------------------------
   NEXT QUESTION
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

    currentIndex++;
    saveSession();
    loadQuestion();
}

/* ---------------------------------------------------------
   FINISH EXAM
--------------------------------------------------------- */

function finishExam() {
    document.body.style.overflow = "auto";
    localStorage.removeItem(examSessionKey);

    const total = userAnswers.length;
    const correctCount = userAnswers.filter(a => a.isCorrect).length;

    alert(
        "Exam Finished!\n\n" +
        "Score: " + correctCount + " / " + total + "\n" +
        "Cheat Attempts: " + cheatCount
    );

    // TODO: Save mistakes
    // TODO: Send result to Sheet + WhatsApp
}

/* ---------------------------------------------------------
   TIMER + RESUME TIMER
--------------------------------------------------------- */

function startTimer() {
    const timerBox = document.getElementById("timer");

    const interval = setInterval(() => {
        if (remainingTime <= 0) {
            clearInterval(interval);
            finishExam();
            return;
        }

        let m = Math.floor(remainingTime / 60);
        let s = remainingTime % 60;

        timerBox.innerText =
            m.toString().padStart(2, "0") + ":" +
            s.toString().padStart(2, "0");

        remainingTime--;
        saveSession();

    }, 1000);
}

function restoreTimer() {
    startTimer();
}

/* ---------------------------------------------------------
   ANTI-CHEAT (Tab Switch)
--------------------------------------------------------- */

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        cheatCount++;
        cheatLog.push({
            time: new Date().toLocaleTimeString(),
            question: currentIndex + 1
        });

        alert("⚠️ Switching away from the exam is not allowed.");

        if (cheatCount >= 3) {
            alert("❌ Exam ended due to repeated cheating.");
            finishExam();
        }

        saveSession();
    }
});

/* ---------------------------------------------------------
   BLOCK BACK BUTTON
--------------------------------------------------------- */

history.pushState(null, null, location.href);

window.onpopstate = function () {
    history.go(1);
    alert("⚠️ You cannot go back during the exam.");
};
