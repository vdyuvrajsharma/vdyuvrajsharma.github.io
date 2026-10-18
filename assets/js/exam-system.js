const questions = [
    { text: "Which HTML element is used to include JavaScript code?", options: ["<js>", "<javascript>", "<script>", "<code>"], answer: 2 },
    { text: "What does CSS stand for?", options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Syntax", "Colorful Style Sheets"], answer: 1 },
    { text: "Which method converts JSON text into a JavaScript object?", options: ["JSON.parse()", "JSON.stringify()", "JSON.object()", "JSON.toObject()"], answer: 0 },
    { text: "Which array method creates a new array with items that pass a test?", options: ["reduce()", "forEach()", "filter()", "map()"], answer: 2 },
    { text: "Which Bootstrap class creates a primary button?", options: ["btn-primary", "button-primary", "btn-main", "btn-blue"], answer: 0 },
    { text: "In Git, which command stages all modified files?", options: ["git add .", "git stage all", "git push", "git commit -a"], answer: 0 },
    { text: "Which HTTP status code means 'Not Found'?", options: ["200", "301", "404", "500"], answer: 2 },
    { text: "Which keyword declares a block-scoped variable in JavaScript?", options: ["var", "const", "define", "static"], answer: 1 },
    { text: "What is the default flex direction in CSS flexbox?", options: ["column", "row", "row-reverse", "column-reverse"], answer: 1 },
    { text: "Which SQL clause is used to filter grouped results?", options: ["WHERE", "GROUP BY", "ORDER BY", "HAVING"], answer: 3 },
    { text: "Which command initializes a new npm project quickly?", options: ["npm start", "npm install", "npm init", "npm create"], answer: 2 },
    { text: "Which HTML tag is used for the largest heading?", options: ["<heading>", "<h6>", "<h1>", "<head>"], answer: 2 },
    { text: "Which JavaScript operator checks both value and type equality?", options: ["==", "=", "===", "!="], answer: 2 },
    { text: "Which function schedules code execution after a delay?", options: ["setTimeout", "setInterval", "delay", "wait"], answer: 0 },
    { text: "Which property is commonly used to make a webpage responsive?", options: ["display", "viewport meta tag", "z-index", "float"], answer: 1 }
];

const totalTimeSeconds = 30 * 60;
let currentQuestionIndex = 0;
let remainingTime = totalTimeSeconds;
let timer = null;
let submitted = false;

let responses = [];
let reviewFlags = [];
let visited = [];

const introScreen = document.getElementById("introScreen");
const examScreen = document.getElementById("examScreen");
const resultScreen = document.getElementById("resultScreen");

const startExamBtn = document.getElementById("startExamBtn");
const submitExamBtn = document.getElementById("submitExamBtn");
const clearResponseBtn = document.getElementById("clearResponseBtn");
const markReviewBtn = document.getElementById("markReviewBtn");
const saveNextBtn = document.getElementById("saveNextBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");

const questionNumber = document.getElementById("questionNumber");
const questionText = document.getElementById("questionText");
const optionsForm = document.getElementById("optionsForm");
const questionPalette = document.getElementById("questionPalette");
const statsList = document.getElementById("statsList");
const timerDisplay = document.getElementById("timerDisplay");
const questionStatusBadge = document.getElementById("questionStatusBadge");
const candidateInfo = document.getElementById("candidateInfo");
const reviewTableBody = document.getElementById("reviewTableBody");

function initializeState() {
    responses = Array(questions.length).fill(null);
    reviewFlags = Array(questions.length).fill(false);
    visited = Array(questions.length).fill(false);
    currentQuestionIndex = 0;
    remainingTime = totalTimeSeconds;
    submitted = false;
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60).toString().padStart(2, "0");
    const sec = (seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
}

function getQuestionStatus(index) {
    if (!visited[index]) return "not-visited";
    if (reviewFlags[index] && responses[index] !== null) return "answered-review";
    if (reviewFlags[index]) return "marked";
    if (responses[index] !== null) return "answered";
    return "not-answered";
}

function setBadge(status) {
    const map = {
        "not-visited": ["Not Visited", "text-bg-secondary"],
        "not-answered": ["Not Answered", "text-bg-danger"],
        "answered": ["Answered", "text-bg-success"],
        "marked": ["Marked for Review", "text-bg-warning"],
        "answered-review": ["Answered + Review", "text-bg-primary"]
    };
    const [label, cls] = map[status];
    questionStatusBadge.className = `badge ${cls}`;
    questionStatusBadge.textContent = label;
}

function renderQuestion() {
    visited[currentQuestionIndex] = true;
    const question = questions[currentQuestionIndex];
    questionNumber.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    questionText.textContent = question.text;
    setBadge(getQuestionStatus(currentQuestionIndex));

    optionsForm.innerHTML = "";
    question.options.forEach((option, idx) => {
        const id = `q${currentQuestionIndex}-opt${idx}`;
        const wrapper = document.createElement("div");
        wrapper.className = "option-item";
        wrapper.innerHTML = `
            <div class="form-check">
                <input class="form-check-input" type="radio" name="answer" id="${id}" value="${idx}" ${responses[currentQuestionIndex] === idx ? "checked" : ""}>
                <label class="form-check-label w-100" for="${id}">${option}</label>
            </div>`;
        optionsForm.appendChild(wrapper);
    });

    updatePalette();
    updateStats();
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = currentQuestionIndex === questions.length - 1;
}

function updatePalette() {
    questionPalette.innerHTML = "";
    questions.forEach((_, idx) => {
        const status = getQuestionStatus(idx);
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `palette-btn ${status} ${idx === currentQuestionIndex ? "current" : ""}`;
        btn.textContent = idx + 1;
        btn.addEventListener("click", () => {
            currentQuestionIndex = idx;
            renderQuestion();
        });
        questionPalette.appendChild(btn);
    });
}

function updateStats() {
    const countByStatus = {
        "not-visited": 0,
        "not-answered": 0,
        "answered": 0,
        "marked": 0,
        "answered-review": 0
    };
    questions.forEach((_, idx) => {
        countByStatus[getQuestionStatus(idx)] += 1;
    });
    statsList.innerHTML = `
        <li>Answered: <strong>${countByStatus.answered}</strong></li>
        <li>Not Answered: <strong>${countByStatus["not-answered"]}</strong></li>
        <li>Marked for Review: <strong>${countByStatus.marked}</strong></li>
        <li>Answered + Review: <strong>${countByStatus["answered-review"]}</strong></li>
        <li>Not Visited: <strong>${countByStatus["not-visited"]}</strong></li>`;
}

function moveToNextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex += 1;
        renderQuestion();
    }
}

function startTimer() {
    timerDisplay.textContent = formatTime(remainingTime);
    timer = setInterval(() => {
        remainingTime -= 1;
        timerDisplay.textContent = formatTime(Math.max(remainingTime, 0));
        if (remainingTime <= 0) {
            finalizeExam(true);
        }
    }, 1000);
}

function finalizeExam(autoSubmit = false) {
    if (submitted) return;
    if (!autoSubmit && !window.confirm("Do you want to submit the exam?")) return;

    submitted = true;
    clearInterval(timer);
    introScreen.classList.add("d-none");
    examScreen.classList.add("d-none");
    resultScreen.classList.remove("d-none");

    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    reviewTableBody.innerHTML = "";
    questions.forEach((question, idx) => {
        const userAnswerIndex = responses[idx];
        const isAttempted = userAnswerIndex !== null;
        const isCorrect = isAttempted && userAnswerIndex === question.answer;
        const status = getQuestionStatus(idx).replace(/-/g, " ");

        if (!isAttempted) unattempted += 1;
        else if (isCorrect) correct += 1;
        else incorrect += 1;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td class="text-capitalize">${status}</td>
            <td>${isAttempted ? question.options[userAnswerIndex] : "-"}</td>
            <td>${question.options[question.answer]}</td>
            <td class="fw-semibold ${isCorrect ? "text-success" : isAttempted ? "text-danger" : "text-secondary"}">${isCorrect ? "Correct" : isAttempted ? "Incorrect" : "Unattempted"}</td>`;
        reviewTableBody.appendChild(tr);
    });

    const score = correct;
    const percentage = ((score / questions.length) * 100).toFixed(2);
    document.getElementById("scoreText").textContent = `${score}/${questions.length} (${percentage}%)`;
    document.getElementById("correctText").textContent = correct;
    document.getElementById("incorrectText").textContent = incorrect;
    document.getElementById("unattemptedText").textContent = unattempted;

    if (autoSubmit) {
        alert("Time is up. Your exam has been submitted automatically.");
    }
}

function startExam() {
    const name = document.getElementById("candidateName").value.trim() || "Guest";
    const roll = document.getElementById("candidateRoll").value.trim() || "N/A";
    candidateInfo.textContent = `Candidate: ${name} | Roll No: ${roll}`;

    initializeState();
    introScreen.classList.add("d-none");
    resultScreen.classList.add("d-none");
    examScreen.classList.remove("d-none");
    renderQuestion();
    startTimer();
}

startExamBtn.addEventListener("click", startExam);
submitExamBtn.addEventListener("click", () => finalizeExam(false));
clearResponseBtn.addEventListener("click", () => {
    responses[currentQuestionIndex] = null;
    reviewFlags[currentQuestionIndex] = false;
    renderQuestion();
});
markReviewBtn.addEventListener("click", () => {
    reviewFlags[currentQuestionIndex] = true;
    moveToNextQuestion();
    updatePalette();
    updateStats();
});
saveNextBtn.addEventListener("click", () => {
    reviewFlags[currentQuestionIndex] = false;
    moveToNextQuestion();
    updatePalette();
    updateStats();
});

prevBtn.addEventListener("click", () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex -= 1;
        renderQuestion();
    }
});

nextBtn.addEventListener("click", () => {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex += 1;
        renderQuestion();
    }
});

optionsForm.addEventListener("change", (event) => {
    if (event.target.name === "answer") {
        responses[currentQuestionIndex] = Number(event.target.value);
        updatePalette();
        updateStats();
        setBadge(getQuestionStatus(currentQuestionIndex));
    }
});

restartBtn.addEventListener("click", () => {
    clearInterval(timer);
    document.getElementById("candidateName").value = "";
    document.getElementById("candidateRoll").value = "";
    introScreen.classList.remove("d-none");
    examScreen.classList.add("d-none");
    resultScreen.classList.add("d-none");
});
