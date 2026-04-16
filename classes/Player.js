class Player {
  constructor(x, y, sprite = null, characterId = "reimuB") {
    this.x = x;
    this.y = y;

    this.spawnX = x;
    this.spawnY = y;

    this.characterId = characterId;
    this.characterData = characterDefs[characterId];

    this.fullSpeed = this.characterData.fullSpeed ?? 5;
    this.slowSpeed = this.characterData.slowSpeed ?? 2;
    this.moveSpeedMultiplier = 1;
    this.shotTimeScale = 1;

    this.size = 28;
    this.hitboxRadius = this.characterData.hitboxRadius;
    this.grazeRadius = this.characterData.grazeRadius;

    this.sprite = sprite;
    this.drawWidth = 64;
    this.drawHeight = 96;

    this.invulnTimer = 300; // 5 seconds at stage start
    this.respawnTimer = 0;
    this.deathTimer = 0;

    // Death / deathbomb system
    this.deathbombWindow = 0;
    this.pendingDeath = false;
    this.pendingDeathSource = null;
    this.deathbombFrames = this.characterData.deathbombFrames ?? 6;

    this.bulletClearTimer = 0;
    this.enemyBulletSuppressTimer = 0;

    this.grazeCount = 0;

    this.shotCooldown = 0;
    this.shotInterval = this.characterData.shotInterval ?? 6;
    this.focusShotInterval = this.characterData.focusShotInterval ?? 4;

    this.spreadShotConfig = this.characterData.spreadShot;
    this.focusShotConfig = this.characterData.focusShot;
    this.bombType = this.characterData.bombType;

    // Life system (settings-controlled)
    this.lives = gameSettings.startingLives;
    this.maxLives = gameSettings.startingLives;

    // Bomb system
    this.bombs = this.characterData.bombCapacity;
    this.maxBombs = this.characterData.bombCapacity;
    this.bombPressed = false;

    this.isDead = false;
    this.debugInvincible = false;
  }

  update() {
    if (this.invulnTimer > 0) this.invulnTimer--;
    if (this.respawnTimer > 0) this.respawnTimer--;
    if (this.deathTimer > 0) this.deathTimer--;
    if (this.shotCooldown > 0) this.shotCooldown--;
    if (this.bulletClearTimer > 0) this.bulletClearTimer--;
    if (this.enemyBulletSuppressTimer > 0) this.enemyBulletSuppressTimer--;

    if (this.pendingDeath) {
      if (this.deathbombWindow > 0) {
        this.deathbombWindow--;
      } else {
        this.resolveDeath();
      }
    }

    if (this.isDead && this.deathTimer <= 0) {
      if (this.lives <= 0) {
        triggerGameOver();
        return;
      }

      this.isDead = false;
      this.x = this.spawnX;
      this.y = this.spawnY;
      this.respawnTimer = 30;
    }

    if (!this.isDead && this.respawnTimer === 0 && !this.pendingDeath) {
      this.move();
    }
  }

  move() {
    const focused = keyIsDown(16); // Shift
    let speed = focused ? this.slowSpeed : this.fullSpeed;
    speed *= this.moveSpeedMultiplier;

    let moveX = 0;
    let moveY = 0;

    if (keyIsDown(LEFT_ARROW)) moveX -= 1;
    if (keyIsDown(RIGHT_ARROW)) moveX += 1;
    if (keyIsDown(UP_ARROW)) moveY -= 1;
    if (keyIsDown(DOWN_ARROW)) moveY += 1;

    if (moveX !== 0 || moveY !== 0) {
      const len = Math.hypot(moveX, moveY);
      this.x += (moveX / len) * speed;
      this.y += (moveY / len) * speed;
    }

    let offscreenAllowanceX = 6;
    let offscreenAllowanceY = 6;

    let leftBound =
      GAME_LAYOUT.playfieldX + this.drawWidth / 2 - offscreenAllowanceX;
    let rightBound =
      GAME_LAYOUT.playfieldX +
      GAME_LAYOUT.playfieldW -
      this.drawWidth / 2 +
      offscreenAllowanceX;

    let topBound =
      GAME_LAYOUT.playfieldY + this.drawHeight / 2 - offscreenAllowanceY;
    let bottomBound =
      GAME_LAYOUT.playfieldY +
      GAME_LAYOUT.playfieldH -
      this.drawHeight / 2 +
      offscreenAllowanceY;

    this.x = constrain(this.x, leftBound, rightBound);
    this.y = constrain(this.y, topBound, bottomBound);
  }

  fireShotLayout(layout, playerBullets) {
    for (let shot of layout.bullets) {
      let angle = radians(shot.angleDeg);

      let vx = sin(angle) * shot.speed;
      let vy = -cos(angle) * shot.speed;

      playerBullets.push(
        new PlayerBullet(
          this.x + shot.offsetX,
          this.y + 4 + shot.offsetY,
          vx,
          vy,
        ),
      );
    }
  }

  shoot(playerBullets) {
    if (!gameplayActive || !playerCanShoot || this.pendingDeath) return;
    if (this.isDead) return;
    if (this.respawnTimer > 0) return;
    if (!keyIsDown(90)) return;
    if (this.shotCooldown > 0) return;

    let focused = keyIsDown(16);

    let baseInterval = focused ? this.focusShotInterval : this.shotInterval;

    let interval = max(1, ceil(baseInterval / this.shotTimeScale));

    let layout = focused ? this.focusShotConfig : this.spreadShotConfig;

    this.fireShotLayout(layout, playerBullets);

    this.shotCooldown = interval;
  }

  hit() {
    if (!this.canBeHit()) return;
    this.startDeathbombWindow();
  }

  startDeathbombWindow() {
    if (this.debugInvincible) return;
    if (this.isDead) return;
    if (this.respawnTimer > 0) return;
    if (this.invulnTimer > 0) return;
    if (this.pendingDeath) return;

    this.pendingDeath = true;
    this.deathbombWindow = this.deathbombFrames;
  }

  cancelPendingDeath() {
    this.pendingDeath = false;
    this.deathbombWindow = 0;
  }

  resolveDeath() {
    this.pendingDeath = false;
    this.deathbombWindow = 0;

    if (this.lives > 0) {
      this.lives--;
    }

    this.isDead = true;
    this.deathTimer = 45;
    this.invulnTimer = 240;
    this.bulletClearTimer = 12;
    this.enemyBulletSuppressTimer = 120;
  }

  canBeHit() {
    if (this.debugInvincible) return false;

    return (
      !this.isDead &&
      !this.pendingDeath &&
      this.invulnTimer <= 0 &&
      this.respawnTimer <= 0
    );
  }

  canGraze() {
    return !this.isDead && this.respawnTimer <= 0;
  }

  graze() {
    this.grazeCount++;
  }

  shouldClearEnemyBullets() {
    return this.enemyBulletSuppressTimer > 0;
  }

  show() {
    if (this.isDead) return;

    push();
    translate(this.x, this.y + 4);

    let alpha = 255;

    // Flicker between solid and semi-transparent instead of disappearing
    if (this.invulnTimer > 0) {
      alpha = frameCount % 8 < 3 ? 160 : 255;
    }

    if (this.sprite) {
      imageMode(CENTER);
      tint(255, alpha);
      image(this.sprite, -2, 0, this.drawWidth, this.drawHeight);
      noTint();
    } else {
      noStroke();
      fill(255, alpha);
      rectMode(CENTER);
      rect(0, 0, this.drawWidth, this.drawHeight);
    }

    pop();
  }

  showHitbox() {
    if (this.isDead) return;

    // Show hitbox if focusing OR if deathbomb window is active
    if (!this.pendingDeath && !keyIsDown(16)) return;

    push();
    translate(this.x, this.y + 4);

    noStroke();

    if (this.pendingDeath) {
      fill(80, 160, 255); // blue during deathbomb window
    } else {
      fill(255, 0, 0); // red when focused
    }

    circle(0, 0, this.hitboxRadius * 2);

    pop();
  }
}