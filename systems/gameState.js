function triggerGameOver() {
    if (gameOver) return;

    gameOver = true;
    gameOverFade = 0;
    gameOverTimer = 0;

    gameplayActive = false;
    playerCanShoot = false;
}

function restartGame() {
    gameOver = false;
    gameOverFade = 0;
    gameOverTimer = 0;

    victory = false;
    victoryTimer = 0;

    gameplayActive = true;
    playerCanShoot = true;

    bullets = [];
    playerBullets = [];
    effects = [];
    familiars = [];

    player = new Player(getPlayerSpawnX(), getPlayerSpawnY(), playerImg);
    boss = new Boss(0, 0, bullets, player, bossImg, currentBossId);
}

function triggerVictory() {
    victory = true;
    victoryTimer = 0;
}