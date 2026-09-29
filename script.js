// variables de estado 
let playerName = "";
let allQuestions = []; 
let currentRound = 1;
const questionsPerRound = 1; // Mostramos 1 por ronda para que sea más claro
const totalRounds = 10; // Límite de preguntas por partida
let correctAnswersCount = 0;
let wrongAnswersCount = 0;

// elementos del dom
const inputNickname = document.getElementById('nickname');
const btnStart = document.getElementById('btn-start');
const landingScreen = document.getElementById('landing-screen');
const quizScreen = document.getElementById('quiz-screen');
const displayPlayer = document.getElementById('display-player');
const btnCheck = document.getElementById('btn-check');

// iniciamos el quiz con el evento ---
btnStart.addEventListener('click', () => {
    // cogemos el nombre del usuario
    playerName = inputNickname.value.trim() || "Guest";
    displayPlayer.textContent = `👤 Player: ${playerName}`;

    // Cambiamos de pantalla
    landingScreen.classList.remove('active');
    landingScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    quizScreen.classList.add('active');

    // Llamamos a la función que importa el json
    loadQuestions();
});

// --- 4. CARGAR PREGUNTAS (ASÍNCRONO) ---
const loadQuestions = async () => {
    try {
        // Importación asíncrona mediante el fichero json tal y como pide la práctica
        const response = await fetch('questions.json');
        const data = await response.json();
        
        // Mezclamos las preguntas aleatoriamente
        allQuestions = data.sort(() => Math.random() - 0.5);
        
        renderRound();
    } catch (error) {
        console.error("Error al cargar el JSON:", error);
    }
};

// --- 5. PINTAR LA PREGUNTA EN PANTALLA ---
const renderRound = () => {
    const container = document.getElementById('questions-container');
    
    // Extraemos la pregunta de la ronda actual
    const startIndex = (currentRound - 1) * questionsPerRound;
    const roundQuestions = allQuestions.slice(startIndex, startIndex + questionsPerRound);
    
    const questionsHTML = roundQuestions.map((q, index) => {
        // Juntamos la correcta y las incorrectas, y colocamos las respuestas de forma aleatoria
        const allAnswers = [q.correct_answer, ...q.incorrect_answers].sort(() => Math.random() - 0.5);
        
        // Generamos los botones con el estilo azul oscuro que elegiste
        const answersHTML = allAnswers.map(answer => 
            `<button class="answer-btn" onclick="selectAnswer(this)">${answer}</button>`
        ).join('');

        return `
            <div class="question-card" style="background: #1e293b; padding: 20px; border-radius: 15px; border: 1px solid #334155; box-shadow: 0 10px 20px rgba(0,0,0,0.5);">
                <p style="color: #38bdf8; font-weight: bold; margin-bottom: 10px;">QUESTION ${currentRound}</p>
                <h3 style="margin-bottom: 20px;">${q.question}</h3>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${answersHTML}
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = questionsHTML;
    btnCheck.classList.remove('hidden');
};

// --- 6. SELECCIONAR UNA RESPUESTA ---
// Esta función necesita ser global (window) porque la inyectamos como "onclick" en el HTML
window.selectAnswer = (btn) => {
    const allBtns = document.querySelectorAll('.answer-btn');
    allBtns.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
};

// --- 7. COMPROBAR RESPUESTA ---
btnCheck.addEventListener('click', () => {
    const selectedBtn = document.querySelector('.answer-btn.selected');
    
    if (!selectedBtn) {
        alert("Please, select an answer first!");
        return;
    }

    const userAnswer = selectedBtn.textContent;
    const actualQuestion = allQuestions[currentRound - 1]; 

    if (userAnswer === actualQuestion.correct_answer) {
        correctAnswersCount++;
        
        if (currentRound === totalRounds) {
            endGame(true); // Gana
        } else {
            // Pasa de ronda y genera dinámicamente las nuevas preguntas
            currentRound++;
            document.getElementById('display-round').textContent = `🏆 Round ${currentRound} of ${totalRounds}`;
            renderRound(); 
        }
    } else {
        // Si falla una, se acaba el juego
        wrongAnswersCount++;
        endGame(false); 
    }
});

// --- 8. FINALIZAR EL JUEGO Y ENVIAR DATOS ---
const endGame = async (hasWon) => {
    const modal = document.getElementById('result-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalScore = document.getElementById('modal-score');

    modal.classList.remove('hidden');

    if (hasWon) {
        modalTitle.textContent = "Congratulations!";
        modalTitle.style.color = "#38bdf8";
        modalMessage.textContent = "You won the EmojiQuiz!";
    } else {
        modalTitle.textContent = "Game Over";
        modalTitle.style.color = "#ef4444"; 
        modalMessage.textContent = `Wrong! The correct answer was: ${allQuestions[currentRound - 1].correct_answer}`;
    }

    modalScore.textContent = `${correctAnswersCount} / ${totalRounds} Correct`;

    // Estructura JSON para enviar al backend al terminar el juego
    const gameResults = {
        jugador: playerName,
        aciertos: correctAnswersCount,
        fallos: wrongAnswersCount,
        haGanado: hasWon
    };

    // Envío del json a un programa backend
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(gameResults)
        });
        console.log("Datos enviados al servidor (Simulado):", gameResults);
    } catch (error) {
        console.error("Error enviando los datos:", error);
    }
};

// --- 9. REINICIAR JUEGO ---
document.getElementById('btn-restart').addEventListener('click', () => {
    location.reload(); 
});