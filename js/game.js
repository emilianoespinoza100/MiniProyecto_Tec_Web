document.addEventListener('DOMContentLoaded', function () {
    // Iniciar música después de la interacción del usuario
    document.addEventListener('click', function () {
        if (!isMusicPlaying) {
            toggleMusic();
        }
    });
});

// Variables de música y estado
var music = null; // Asegúrate de inicializar music como null
var isMusicPlaying = false;
let personajeSeleccionado = ''; // Variable para almacenar el personaje seleccionado

// Variables para controlar el estado de pausa
let isPaused = false;
let pauseButton, resumeButton;

// Función para reproducir/pausar música
function toggleMusic() {
    if (isMusicPlaying) {
        music.pause();
    } else {
        // Si no existe una instancia de música, créala
        if (!music) {
            music = new Audio('assets/Samba do Brasil (Radio Remix).mp3');
            music.loop = true;
            music.muted = false; // Asegúrate de que no esté silenciado
        }
        music.play().then(() => {
            console.log("Música iniciada correctamente.");
        }).catch((error) => {
            console.error("Error al reproducir la música:", error);
        });
    }
    isMusicPlaying = !isMusicPlaying;
}

// Función para detener la música
function stopMusic() {
    if (music) {
        music.pause();
        music.currentTime = 0; // Reiniciar la música al principio
        isMusicPlaying = false;
    }
}

// Función para pausar el juego
function pauseGame() {
    if (!isPaused) {
        isPaused = true;
        game.scene.pause(); // Pausar la escena de Phaser
        pauseButton.style.display = 'none'; // Ocultar el botón de pausa
        resumeButton.style.display = 'block'; // Mostrar el botón de reanudar
        if (isMusicPlaying) {
            music.pause(); // Pausar la música
        }
    }
}

// Función para reanudar el juego
function resumeGame() {
    if (isPaused) {
        isPaused = false;
        game.scene.resume(); // Reanudar la escena de Phaser
        resumeButton.style.display = 'none'; // Ocultar el botón de reanudar
        pauseButton.style.display = 'block'; // Mostrar el botón de pausa
        if (!isMusicPlaying) {
            music.play(); // Reanudar la música
        }
    }
}

// Función para crear los botones de pausa y reanudación
function createPauseResumeButtons() {
    // Crear el botón de pausa
    pauseButton = document.createElement('button');
    pauseButton.innerHTML = '⏸️'; // Icono de pausa
    pauseButton.style.position = 'absolute';
    pauseButton.style.top = '10px';
    pauseButton.style.right = '10px';
    pauseButton.style.fontSize = '24px';
    pauseButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    pauseButton.style.color = 'white';
    pauseButton.style.border = '2px solid white';
    pauseButton.style.borderRadius = '50%';
    pauseButton.style.width = '50px';
    pauseButton.style.height = '50px';
    pauseButton.style.cursor = 'pointer';
    pauseButton.onclick = pauseGame;

    // Crear el botón de reanudar
    resumeButton = document.createElement('button');
    resumeButton.innerHTML = '▶️'; // Icono de reanudar
    resumeButton.style.position = 'absolute';
    resumeButton.style.top = '10px';
    resumeButton.style.right = '10px';
    resumeButton.style.fontSize = '24px';
    resumeButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    resumeButton.style.color = 'white';
    resumeButton.style.border = '2px solid white';
    resumeButton.style.borderRadius = '50%';
    resumeButton.style.width = '50px';
    resumeButton.style.height = '50px';
    resumeButton.style.display = 'none'; // Ocultar inicialmente
    resumeButton.onclick = resumeGame;

    // Agregar los botones al contenedor del juego
    document.getElementById('game-container').appendChild(pauseButton);
    document.getElementById('game-container').appendChild(resumeButton);
}

// Función para iniciar el proceso de presentación
function iniciarJuego() {
    document.getElementById('pantallaPresentacion').style.display = 'none';
    startMenu();
}

// Función para mostrar el menú
function startMenu() {
    document.getElementById('menu').style.display = 'block';
}

// Función para mostrar la captura de alias
function startGame() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('capturaAlias').style.display = 'block';
}

// Función para mostrar los datos del localStorage en la consola
function mostrarLocalStorageEnConsola() {
    console.log("Datos en localStorage:");
    console.log("username:", localStorage.getItem('username'));
    console.log("users:", JSON.parse(localStorage.getItem('users')));
    console.log("records:", JSON.parse(localStorage.getItem('records')));
    console.log("previousScore:", localStorage.getItem('previousScore'));
}

// Función para validar el alias
function validarAlias() {
    const username = document.getElementById('username').value;
    const regex = /^[a-zA-Z0-9_]{4,8}$/;

    if (!regex.test(username)) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El alias debe tener entre 4 y 8 caracteres y solo puede contener letras, números y _.',
        });
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const records = JSON.parse(localStorage.getItem('records')) || [];

    // Verificar si el alias ya existe
    const existingUserIndex = users.findIndex(user => user.username === username);

    if (existingUserIndex !== -1) {
        // Si el alias ya existe, cargar la puntuación anterior
        const previousScore = records.find(record => record.username === username)?.score || 0;
        localStorage.setItem('previousScore', previousScore); // Guardar la puntuación anterior

        Swal.fire({
            icon: 'info',
            title: 'Alias ya registrado',
            text: 'Este alias ya está registrado. Tu puntuación anterior se acumulará con la nueva.',
        }).then(() => {
            localStorage.setItem('username', username); // Guardar el alias en localStorage
            document.getElementById('capturaAlias').style.display = 'none';
            mostrarSeleccionPersonaje();
        });
    } else {
        // Si el alias no existe, crear un nuevo registro
        users.push({ username });
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('username', username); // Guardar el alias en localStorage
        localStorage.setItem('previousScore', 0); // Iniciar con puntuación 0

        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Alias registrado correctamente.',
        }).then(() => {
            document.getElementById('capturaAlias').style.display = 'none';
            mostrarSeleccionPersonaje();
        });
    }

    mostrarLocalStorageEnConsola(); // Mostrar datos en la consola
}

// Función para mostrar la pantalla de selección de personaje
function mostrarSeleccionPersonaje() {
    document.getElementById('seleccionPersonaje').style.display = 'block';
}

// Funciones de drag and drop
function allowDrop(ev) {
    ev.preventDefault(); // Permitir que el elemento sea soltado
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id); // Guardar el id del personaje arrastrado
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text"); // Obtener el id del personaje

    // Verificar cuál personaje se ha soltado
    if (data === "jugador1") {
        personajeSeleccionado = 'Jugador 1';
    } else if (data === "jugador2") {
        personajeSeleccionado = 'Jugador 2';
    }

    // Mostrar mensaje de confirmación
    Swal.fire({
        title: `Has seleccionado a ${personajeSeleccionado}`,
        text: "¡Buena elección!",
        icon: "success",
        confirmButtonText: "Continuar"
    }).then(() => {
        // Ocultar la pantalla de selección de personaje y continuar con el juego
        document.getElementById('seleccionPersonaje').style.display = 'none';
        startGameInternal();
    });
}

// Función para empezar el juego
function startGameInternal() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    game = new Phaser.Game(config);

    // Iniciar la música al comenzar el juego
    if (!isMusicPlaying) {
        toggleMusic();
    }

    // Crear los botones de pausa y reanudación
    createPauseResumeButtons();
}

// Configuración de Phaser para el juego
var config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Variables del juego
var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var level = 1;
var levelText;
var lives = 3;
var livesImages = [];
var specialResources; // Grupo para recursos especiales (guantes)
var gameBackground; // Variable global para el fondo
var starRounds = 0; // Contador de rondas de estrellas en el nivel 2

// Función preload (cargar recursos)
function preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('sky2', 'assets/sky2.png'); // Cargar la nueva imagen de fondo
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.image('specialResource', 'assets/guante.png'); // Cargar el recurso especial (guante)
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('dude2', 'assets/dude2.png', { frameWidth: 128, frameHeight: 128 });

    // Cargar los sonidos
    this.load.audio('collectStar', 'assets/sounds/collectStar.mp3'); // Sonido al recolectar estrella
    this.load.audio('lose', 'assets/sounds/lose.mp3'); // Sonido al perder
    this.load.audio('collectSpecial', 'assets/sounds/collectSpecial.mp3'); // Sonido al recolectar recurso especial
    this.load.audio('hitBomb', 'assets/sounds/hitBomb.mp3'); // Sonido al tocar una bomba
}

// Función create (configurar la escena)
function create() {
    console.log("Personaje seleccionado:", personajeSeleccionado); // Depuración
    let playerTexture = (personajeSeleccionado === 'Jugador 1') ? 'dude' : 'dude2';
    console.log("Textura del jugador:", playerTexture); // Depuración

    // Inicializar el fondo
    gameBackground = this.add.image(400, 300, 'sky').setDisplaySize(800, 600);

    // Mostrar las vidas (bombas) en la parte superior derecha
    for (let i = 0; i < lives; i++) {
        let lifeImage = this.add.image(750 - i * 40, 50, 'bomb').setDisplaySize(40, 40).setOrigin(1, 0);
        livesImages.push(lifeImage);
    }

    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    player = this.physics.add.sprite(100, 450, playerTexture); // Usar la textura correcta
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    player.setScale(0.5);

    // Configurar animaciones para el jugador
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers(playerTexture, { start: 0, end: 1 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: playerTexture, frame: 2 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers(playerTexture, { start: 3, end: 4 }),
        frameRate: 10,
        repeat: -1
    });

    cursors = this.input.keyboard.createCursorKeys();

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (star) {
        star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        star.setScale(2);
    });

    bombs = this.physics.add.group();

    // Crear 1 bomba en el nivel 1
    if (level === 1) {
        let bomb = bombs.create(Phaser.Math.Between(50, 750), 0, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }

    // Grupo para recursos especiales (guantes)
    specialResources = this.physics.add.group();

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);
    this.physics.add.collider(player, bombs, hitBomb, null, this);
    this.physics.add.overlap(player, specialResources, collectSpecialResource, null, this);

    scoreText = this.add.text(16, 16, 'Puntaje: 0', { fontSize: '32px', fill: '#000' });
    levelText = this.add.text(16, 50, 'Nivel: 1', { fontSize: '32px', fill: '#000' });

    // Mostrar alias y fecha en la parte inferior
    const username = localStorage.getItem('username');
    const date = new Date().toLocaleDateString();
    this.add.text(16, 550, `Alias: ${username}`, { fontSize: '20px', fill: '#fff', fontStyle: 'bold', backgroundColor: '#000', padding: { left: 10, right: 10, top: 5, bottom: 5 } });
    this.add.text(16, 580, `Fecha: ${date}`, { fontSize: '20px', fill: '#fff', fontStyle: 'bold', backgroundColor: '#000', padding: { left: 10, right: 10, top: 5, bottom: 5 } });
}

// Función update (actualizar cada cuadro)
function update() {
    if (gameOver || isPaused) {
        player.setVelocityX(0);
        player.setVelocityY(0);
        player.anims.stop();
        return;
    }

    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }
}

// Función para recolectar estrellas
function collectStar(player, star) {
    star.disableBody(true, true);

    score += 10;
    scoreText.setText('Puntaje: ' + score);

    // Reproducir sonido al recolectar estrella
    this.sound.play('collectStar');

    if (stars.countActive(true) === 0) {
        if (level === 1) {
            isPaused = true;
            player.setVelocityX(0);
            player.setVelocityY(0);
            player.anims.stop();
            game.scene.pause();
            document.getElementById('levelCompleteMessage').style.display = 'block';
        } else if (level === 2) {
            // Si es el nivel 2, generar nuevas estrellas
            if (starRounds < 2) { // Solo generar 2 rondas adicionales
                starRounds++;
                generateNewStars.call(this);
            } else {
                // Si ya se completaron las rondas adicionales, pasar al siguiente nivel
                nextLevel();
            }
        } else {
            nextLevel();
        }
    }
}

// Función para generar nuevas estrellas
function generateNewStars() {
    stars.clear(true, true); // Limpiar las estrellas existentes

    // Generar nuevas estrellas
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (star) {
        star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        star.setScale(2);
    });

    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);
}

// Función para recolectar recursos especiales (guantes)
function collectSpecialResource(player, specialResource) {
    specialResource.disableBody(true, true); // Desactivar el recurso especial
    score += 50; // Sumar puntos adicionales
    scoreText.setText('Puntaje: ' + score);

    // Reproducir sonido al recolectar recurso especial
    this.sound.play('collectSpecial');
}

// Función cuando el jugador toca una bomba
function hitBomb(player, bomb) {
    lives--;
    if (livesImages.length > 0) {
        let lifeImage = livesImages.pop();
        lifeImage.destroy();
    }

    // Reproducir el sonido al tocar una bomba
    this.sound.play('hitBomb');

    if (lives === 0) {
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('turn');
        gameOver = true;

        // Reproducir sonido al perder
        this.sound.play('lose');

        Swal.fire({
            icon: 'error',
            title: 'Game Over',
            text: `Has perdido en el nivel ${level} con un puntaje de ${score}.`,
            confirmButtonText: 'Volver al menú'
        }).then(() => {
            document.getElementById('game-container').style.display = 'none';
            document.getElementById('menu').style.display = 'block';
            updateRecords(score);
            resetGame();
        });
    } else {
        player.setPosition(100, 450);
    }
}

// Función para reiniciar el juego
function resetGame() {
    gameOver = false;
    score = 0;
    level = 1;
    lives = 3;
    isPaused = false;
    starRounds = 0; // Reiniciar el contador de rondas de estrellas

    // Detener la música al reiniciar el juego
    stopMusic();

    if (game) {
        game.destroy(true);
        game = null;
    }

    document.getElementById('game-container').innerHTML = '';
}

// Función para mostrar los récords
function showRecords() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('records').style.display = 'block';

    const records = JSON.parse(localStorage.getItem('records')) || [];
    const recordsTableBody = document.getElementById('recordsTableBody');
    recordsTableBody.innerHTML = '';

    records.forEach(record => {
        const row = document.createElement('tr');
        const usernameCell = document.createElement('td');
        usernameCell.textContent = record.username;
        usernameCell.style.padding = '10px';
        usernameCell.style.border = '1px solid #f39c12';

        const scoreCell = document.createElement('td');
        scoreCell.textContent = record.score;
        scoreCell.style.padding = '10px';
        scoreCell.style.border = '1px solid #f39c12';

        const dateCell = document.createElement('td');
        dateCell.textContent = record.date;
        dateCell.style.padding = '10px';
        dateCell.style.border = '1px solid #f39c12';

        row.appendChild(usernameCell);
        row.appendChild(scoreCell);
        row.appendChild(dateCell);
        recordsTableBody.appendChild(row);
    });
}

// Función para actualizar los récords
function updateRecords(score) {
    const username = localStorage.getItem('username');
    const date = new Date().toLocaleDateString();
    let records = JSON.parse(localStorage.getItem('records')) || [];

    // Obtener la puntuación anterior
    const previousScore = parseInt(localStorage.getItem('previousScore')) || 0;
    const totalScore = previousScore + score; // Acumular la puntuación

    // Verificar si el usuario ya tiene un récord
    const existingRecordIndex = records.findIndex(record => record.username === username);
    if (existingRecordIndex !== -1) {
        // Actualizar el puntaje acumulado
        records[existingRecordIndex].score = totalScore;
        records[existingRecordIndex].date = date;
    } else {
        // Agregar un nuevo récord
        records.push({ username, score: totalScore, date });
    }

    // Ordenar los récords por puntaje (de mayor a menor)
    records.sort((a, b) => b.score - a.score);
    localStorage.setItem('records', JSON.stringify(records));

    mostrarLocalStorageEnConsola(); // Mostrar datos en la consola
}

// Función para volver al menú principal
function backToMenu() {
    // Ocultar todas las pantallas excepto el menú
    document.getElementById('creditsScreen').style.display = 'none';
    document.getElementById('records').style.display = 'none';
    document.getElementById('felicitacion').style.display = 'none';
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('capturaAlias').style.display = 'none';
    document.getElementById('seleccionPersonaje').style.display = 'none';

    // Reiniciar la puntuación anterior
    localStorage.removeItem('previousScore');

    // Detener la música al volver al menú
    stopMusic();

    // Mostrar el menú principal
    document.getElementById('menu').style.display = 'block';

    mostrarLocalStorageEnConsola(); // Mostrar datos en la consola
}

// Función para mostrar las instrucciones del juego
function showHelp() {
    Swal.fire({
        title: '📜 Instrucciones del Juego',
        html: `
            <div style="text-align: left; font-family: 'Press Start 2P', cursive; color: #f39c12;">
                <p> Usa las <strong>flechas</strong> para mover al jugador.</p>
                <p> Recoge <strong>estrellas</strong> para sumar puntos.</p>
                <p> Evita las <strong>bombas</strong> para no perder el juego.</p>
                <p> Tienes <strong>3 vidas</strong>. Pierdes una vida cada vez que tocas una bomba.</p>
            </div>
        `,
        background: '#000',
        color: '#f39c12',
        confirmButtonText: '¡Entendido!',
        confirmButtonColor: '#f39c12',
        customClass: {
            popup: 'custom-popup',
            confirmButton: 'custom-button'
        }
    });
}

// Función para mostrar la pantalla de créditos
function showCredits() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('creditsScreen').style.display = 'block';
}

// Función para continuar al siguiente nivel
function nextLevel() {
    document.getElementById('levelCompleteMessage').style.display = 'none';
    isPaused = false;
    level++;
    levelText.setText('Nivel: ' + level);
    starRounds = 0; // Reiniciar el contador de rondas de estrellas

    // Cambiar el fondo en el nivel 2
    if (level === 2) {
        gameBackground.setTexture('sky2'); // Cambiar la textura del fondo
    }

    // Restaurar estrellas
    stars.children.iterate(function (star) {
        star.enableBody(true, star.x, 0, true, true);
    });

    // En el nivel 2, generar 2 bombas y 2 guantes especiales
    if (level === 2) {
        for (let i = 0; i < 2; i++) {
            let bomb = bombs.create(Phaser.Math.Between(50, 750), 0, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-300, 300), 30);
        }

        for (let i = 0; i < 2; i++) {
            let specialResource = specialResources.create(Phaser.Math.Between(50, 750), 0, 'specialResource');
            specialResource.setBounce(1);
            specialResource.setCollideWorldBounds(true);
            specialResource.setVelocity(Phaser.Math.Between(-200, 200), 20);
        }
    }

    verificarFinDelJuego();
    game.scene.resume();
}

// Función para verificar si el jugador ha completado todos los niveles
function verificarFinDelJuego() {
    if (level > 2) {
        mostrarFelicitacion();
        updateRecords(score); // Actualizar récords cuando el juego se gana
    }
}

// Función para mostrar la pantalla de felicitación
function mostrarFelicitacion() {
    const alias = localStorage.getItem('username');
    const felicitacionDiv = document.getElementById('felicitacion');

    // Estilo del contenedor de felicitación
    felicitacionDiv.style.display = 'block';
    felicitacionDiv.style.position = 'absolute';
    felicitacionDiv.style.top = '50%';
    felicitacionDiv.style.left = '50%';
    felicitacionDiv.style.transform = 'translate(-50%, -50%)';
    felicitacionDiv.style.backgroundColor = '#000';
    felicitacionDiv.style.border = '4px solid #f39c12';
    felicitacionDiv.style.borderRadius = '15px';
    felicitacionDiv.style.padding = '20px';
    felicitacionDiv.style.textAlign = 'center';
    felicitacionDiv.style.color = '#f39c12';
    felicitacionDiv.style.fontFamily = '"Press Start 2P", cursive';
    felicitacionDiv.style.fontSize = '24px';
    felicitacionDiv.style.boxShadow = '0 0 20px rgba(243, 156, 18, 0.5)';

    // Contenido del mensaje de felicitación
    felicitacionDiv.innerHTML = `
        <h2>¡Felicidades, ${alias}!</h2>
        <p>Has completado todos los niveles con un puntaje de ${score}.</p>
        <button onclick="volverAlMenu()" style="
            background-color: #f39c12;
            color: #000;
            border: none;
            padding: 10px 20px;
            font-family: 'Press Start 2P', cursive;
            font-size: 16px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 20px;
        ">Volver al Menú</button>
    `;

    // Ocultar el contenedor del juego
    document.getElementById('game-container').style.display = 'none';
}

// Función para volver al menú principal desde la pantalla de felicitación
function volverAlMenu() {
    document.getElementById('felicitacion').style.display = 'none';
    document.getElementById('menu').style.display = 'block';
    resetGame();
}