const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const previewCanvas = document.getElementById('preview');
const previewCtx = previewCanvas.getContext('2d');
const gridSize = 20;
const cols = canvas.width / gridSize;
const rows = canvas.height / gridSize;
let score = 0;
let board = Array(rows).fill().map(() => Array(cols).fill(0));
let currentPiece, nextPiece;
let gameOver = false;

// Peças do Tetris (formas em 4x4)
const pieces = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]]  // Z
];
const colors = ['#00f', '#ff0', '#f0f', '#ffa500', '#00f', '#0f0', '#f00'];

// Função para gerar peça aleatória
function randomPiece() {
    const idx = Math.floor(Math.random() * pieces.length);
    return { shape: pieces[idx], color: colors[idx], x: cols / 2 - 2, y: 0 };
}

// Desenhar o tabuleiro
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c]) {
                ctx.fillStyle = board[r][c];
                ctx.fillRect(c * gridSize, r * gridSize, gridSize - 1, gridSize - 1);
            }
        }
    }
}

// Desenhar peça atual
function drawPiece(piece, ctx) {
    piece.shape.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val) {
                ctx.fillStyle = piece.color;
                ctx.fillRect((piece.x + x) * gridSize, (piece.y + y) * gridSize, gridSize - 1, gridSize - 1);
            }
        });
    });
}

// Desenhar preview da próxima peça
function drawPreview() {
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    nextPiece.shape.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val) {
                previewCtx.fillStyle = nextPiece.color;
                previewCtx.fillRect(x * 20 + 20, y * 20 + 20, 19, 19);
            }
        });
    });
}

// Verificar colisão
function collide(piece) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x] && (
                piece.y + y >= rows || 
                piece.x + x < 0 || 
                piece.x + x >= cols || 
                (board[piece.y + y] && board[piece.y + y][piece.x + x]))
            ) return true;
        }
    }
    return false;
}

// Movimento das peças
function moveDown() {
    currentPiece.y++;
    if (collide(currentPiece)) {
        currentPiece.y--;
        merge();
        clearLines();
        currentPiece = nextPiece;
        nextPiece = randomPiece();
        if (collide(currentPiece)) gameOver = true;
    }
    draw();
}

function moveLeft() {
    currentPiece.x--;
    if (collide(currentPiece)) currentPiece.x++;
    draw();
}

function moveRight() {
    currentPiece.x++;
    if (collide(currentPiece)) currentPiece.x--;
    draw();
}

function rotate() {
    const rotated = currentPiece.shape[0].map((_, idx) => 
        currentPiece.shape.map(row => row[idx]).reverse());
    const oldShape = currentPiece.shape;
    currentPiece.shape = rotated;
    if (collide(currentPiece)) currentPiece.shape = oldShape;
    draw();
}

// Juntar peça ao tabuleiro
function merge() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val) board[currentPiece.y + y][currentPiece.x + x] = currentPiece.color;
        });
    });
}

// Limpar linhas completas
function clearLines() {
    let lines = 0;
    for (let r = rows - 1; r >= 0; r--) {
        if (board[r].every(cell => cell)) {
            board.splice(r, 1);
            board.unshift(Array(cols).fill(0));
            lines++;
            r++;
        }
    }
    score += lines * 100;
    document.getElementById('score').textContent = score;
    if (lines) updateHighScores();
}

// Atualizar placar
function updateHighScores() {
    const name = document.getElementById('playerName').value || 'Anônimo';
    let scores = JSON.parse(localStorage.getItem('tetrisScores')) || [];
    scores.push({ name, score });
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 5);
    localStorage.setItem('tetrisScores', JSON.stringify(scores));
    displayHighScores();
}

function displayHighScores() {
    const scores = JSON.parse(localStorage.getItem('tetrisScores')) || [];
    const ul = document.getElementById('highScores');
    ul.innerHTML = '';
    scores.forEach(s => {
        const li = document.createElement('li');
        li.textContent = `${s.name}: ${s.score}`;
        ul.appendChild(li);
    });
}

// Desenhar tudo
function draw() {
    drawBoard();
    drawPiece(currentPiece, ctx);
    drawPreview();
}

// Loop do jogo
function gameLoop() {
    if (!gameOver) {
        moveDown();
        setTimeout(gameLoop, 500);
    } else {
        alert('Game Over! Score: ' + score);
        updateHighScores();
        resetGame();
    }
}

// Resetar jogo
function resetGame() {
    board = Array(rows).fill().map(() => Array(cols).fill(0));
    score = 0;
    document.getElementById('score').textContent = score;
    currentPiece = randomPiece();
    nextPiece = randomPiece();
    gameOver = false;
    draw();
    gameLoop();
}

// Controles por teclado
document.addEventListener('keydown', e => {
    if (gameOver) return;
    switch (e.key) {
        case 'ArrowLeft': moveLeft(); break;
        case 'ArrowRight': moveRight(); break;
        case 'ArrowDown': moveDown(); break;
        case 'ArrowUp': rotate(); break;
    }
});

// Iniciar o jogo
currentPiece = randomPiece();
nextPiece = randomPiece();
displayHighScores();
draw();
gameLoop();

