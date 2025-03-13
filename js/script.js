document.addEventListener('DOMContentLoaded', function () {
    toggleMusic(); // Iniciar la música automáticamente cuando la página se cargue
});

// Variables de música y estado
var music;
var isMusicPlaying = false;

// Función para reproducir/pausar música
function toggleMusic() {
    if (isMusicPlaying) {
        music.pause();
    } else {
        music = new Audio('assets/Samba do Brasil (Radio Remix).mp3');
        music.loop = true;
        music.play();
    }
    isMusicPlaying = !isMusicPlaying;
}

// Función para detener la música
function stopMusic() {
    if (music) {
        music.pause();
        isMusicPlaying = false;
    }
}

// Función para iniciar el menú
function iniciarJuego() {
    // Ocultar la pantalla de presentación
    document.getElementById('pantallaPresentacion').style.display = 'none';
    // Mostrar el menú de inicio
    startMenu();
}

// Función para mostrar el menú de inicio
function startMenu() {
    document.getElementById('menu').style.display = 'block';
}

// Mostrar la captura de alias
function startGame() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('capturaAlias').style.display = 'block';
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
    if (users.includes(username)) {
        Swal.fire({
            icon: 'info',
            title: 'Alias ya registrado',
            text: 'Este alias ya está registrado, pero puedes continuar.',
        }).then(() => {
            document.getElementById('capturaAlias').style.display = 'none';
            startGameInternal();
        });
    } else {
        users.push(username);
        localStorage.setItem('users', JSON.stringify(users));
        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Alias registrado correctamente.',
        }).then(() => {
            document.getElementById('capturaAlias').style.display = 'none';
            startGameInternal();
        });
    }
}

// Función para empezar el juego
function startGameInternal() {
    document.getElementById('menu').style.display = 'none';
    game = new Phaser.Game(config);
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
var isPaused = false; // Variable para controlar el estado de pausa
var lives = 3; // Número de vidas
var livesImages = []; // Array para almacenar las imágenes de las vidas

// Función preload (cargar recursos)
function preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', {
        frameWidth: 128,
        frameHeight: 128,
    });
}

// Función create (configurar la escena)
function create() {
    this.add.image(400, 300, 'sky').setDisplaySize(800, 600);

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

    player = this.physics.add.sprite(100, 450, 'dude');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    player.setScale(0.5);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 1 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 2 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 3, end: 4 }),
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
        star.setScale(2); // Aumentar el tamaño de las estrellas
    });

    bombs = this.physics.add.group();

    // Solo una bomba en el primer nivel
    if (level === 1) {
        let bomb = bombs.create(Phaser.Math.Between(50, 750), 0, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);
    this.physics.add.collider(player, bombs, hitBomb, null, this);

    scoreText = this.add.text(16, 16, 'Puntaje: 0', { fontSize: '32px', fill: '#000' });
    levelText = this.add.text(16, 50, 'Nivel: 1', { fontSize: '32px', fill: '#000' });
}

// Función update (actualizar cada cuadro)
function update() {
    if (gameOver || isPaused) { // No mover al jugador si el juego está pausado
        player.setVelocityX(0); // Detener el movimiento en el eje X
        player.setVelocityY(0); // Detener el movimiento en el eje Y
        player.anims.stop(); // Detener todas las animaciones
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

    if (stars.countActive(true) === 0) {
        if (level === 1) {
            // Pausar el juego y mostrar el mensaje de nivel completado
            isPaused = true; // Pausar el juego
            player.setVelocityX(0); // Detener el movimiento en el eje X
            player.setVelocityY(0); // Detener el movimiento en el eje Y
            player.anims.stop(); // Detener todas las animaciones
            game.scene.pause();
            document.getElementById('levelCompleteMessage').style.display = 'block';
        } else {
            // Continuar al siguiente nivel
            nextLevel();
        }
    }
}

// Función cuando el jugador toca una bomba
function hitBomb(player, bomb) {
    lives--; // Reducir las vidas
    if (livesImages.length > 0) {
        let lifeImage = livesImages.pop(); // Eliminar la última vida
        lifeImage.destroy(); // Destruir la imagen de la vida
    }

    if (lives === 0) {
        // Si no quedan vidas, terminar el juego
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('turn');
        gameOver = true;

        // Mostrar SweetAlert de Game Over
        Swal.fire({
            icon: 'error',
            title: 'Game Over',
            text: `Has perdido en el nivel ${level} con un puntaje de ${score}.`,
            confirmButtonText: 'Volver al menú'
        }).then(() => {
            // Volver al menú principal después de cerrar el alert
            document.getElementById('game-container').style.display = 'none'; // Ocultar el juego
            document.getElementById('menu').style.display = 'block'; // Mostrar el menú
            updateRecords(score); // Actualizar los récords
            resetGame(); // Reiniciar el juego
        });
    } else {
        // Si aún hay vidas, reiniciar la posición del jugador
        player.setPosition(100, 450);
    }
}

// Función para reiniciar el juego
function resetGame() {
    gameOver = false;
    score = 0;
    level = 1;
    lives = 3; // Reiniciar las vidas
    isPaused = false;

    // Reiniciar el juego de Phaser
    if (game) {
        game.destroy(true); // Destruir la instancia actual del juego
    }
    document.getElementById('game-container').innerHTML = ''; // Limpiar el contenedor del juego
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

        row.appendChild(usernameCell);
        row.appendChild(scoreCell);
        recordsTableBody.appendChild(row);
    });
}

// Función para actualizar los récords
function updateRecords(score) {
    const username = localStorage.getItem('username');
    let records = JSON.parse(localStorage.getItem('records')) || [];
    records.push({ username, score });
    records.sort((a, b) => b.score - a.score); // Ordenar de mayor a menor
    localStorage.setItem('records', JSON.stringify(records));
}

// Función para volver al menú principal
function backToMenu() {
    document.getElementById('records').style.display = 'none';
    document.getElementById('menu').style.display = 'block';
}

// Función para mostrar ayuda
function showHelp() {
    Swal.fire({
        title: 'Instrucciones del juego',
        html: `
            <p>- Usa las flechas para mover al jugador.</p>
            <p>- Recoge estrellas para sumar puntos.</p>
            <p>- Evita las bombas para no perder el juego.</p>
            <p>- Tienes 3 vidas. Pierdes una vida cada vez que tocas una bomba.</p>
        `,
        icon: 'info',
        confirmButtonText: 'Entendido'
    });
}

// Función para salir del juego
function exitGame() {
    Swal.fire({
        title: '¿Estás seguro que quieres salir del juego?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            window.close(); // Cerrar la ventana del navegador
        }
    });
}

// Función para continuar al siguiente nivel
function nextLevel() {
    document.getElementById('levelCompleteMessage').style.display = 'none';
    isPaused = false; // Reanudar el juego
    level++;
    levelText.setText('Nivel: ' + level);

    // Reiniciar las estrellas y bombas para el nuevo nivel
    stars.children.iterate(function (star) {
        star.enableBody(true, star.x, 0, true, true);
    });

    // Añadir más bombas en el nivel 2
    if (level === 2) {
        for (let i = 0; i < 4; i++) {
            let bomb = bombs.create(Phaser.Math.Between(50, 750), 0, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-300, 300), 30); // Bombas más rápidas
        }
    }

    // Reanudar el juego
    game.scene.resume();
}

// Función para mostrar el mensaje de nivel completado
function showLevelCompleteMessage() {
    document.getElementById('levelCompleteMessage').style.display = 'block';
}

// Función para ocultar el mensaje de nivel completado
function hideLevelCompleteMessage() {
    document.getElementById('levelCompleteMessage').style.display = 'none';
}