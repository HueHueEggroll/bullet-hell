class Boss {
  constructor(x, y, bullets, player, sprite = null, bossId = "demoBoss") {
    this.bossId = bossId;
    this.bossData = bossDefs[bossId];

    this.x = -60;
    this.y = -60;

    this.bullets = bullets;
    this.player = player;

    this.setupVisualDefaults(sprite);
    this.setupStateDefaults();
    this.setupMovementDefaults();
    this.setupMovementTuning();
    this.setupTimingDefaults();
    this.setupDisplayDefaults();
    this.setupUiDefaults();
    this.setupDeathTuning();

    this.emitter = new BulletEmitter(this, bullets, player);
    this.emitters = [];

    this.lives = this.createLives();

    this.currentLife = 0;
    this.lifeCount = this.lives.length;

    this.sectionType = "nonspell";
    this.sectionHp = 0;
    this.sectionHpMax = 0;

    this.prepareFirstSection();
  }

  // #region Setup helpers

  setupVisualDefaults(sprite) {
    this.sprite = sprite;
    this.drawWidth = this.bossData.drawWidth;
    this.drawHeight = this.bossData.drawHeight;
    this.contactRadius = this.bossData.contactRadius;
  }

  setupStateDefaults() {
    this.visible = true;
    this.active = true;
    this.vulnerable = false;
    this.phaseReady = false;

    this.isEntering = true;
    this.waitingToEnter = true;
    this.hasStartedFight = false;
    this.hasShownFightUi = false;

    this.isDying = false;
    this.deathTimer = 0;
  }

  setupMovementDefaults() {
    this.targetX = this.x;
    this.targetY = this.y;
    this.moveSpeed = 3;
    this.useBounds = false;
    this.useDriftSlowdown = false;

    this.minX = GAME_LAYOUT.playfieldX + this.drawWidth / 2;
    this.maxX =
      GAME_LAYOUT.playfieldX + GAME_LAYOUT.playfieldW - this.drawWidth / 2;

    this.minY = GAME_LAYOUT.playfieldY + this.drawHeight / 2;
    this.maxY =
      GAME_LAYOUT.playfieldY + GAME_LAYOUT.playfieldH / 3 - this.drawHeight / 2;

    this.restTimer = 0;
    this.randomMoveReady = true;

    this.currentPause = 0;
    this.pauseMin = 120;
    this.pauseMax = 180;

    this.pathPoints = [];
    this.pathIndex = 0;
    this.pathPause = 20;
    this.pathLoop = true;
    this.followingPath = false;
  }

  setupMovementTuning() {
    this.entranceSpeed = 8.8;

    // Phase transitions should take about as long as a normal drift move
    this.transitionDurationFrames = 20;

    this.arrivalSlowdownRadius = 72;
    this.arrivalMinSpeed = 0.75;

    this.entranceSlowdownRadius = 140;
    this.entranceMinSpeed = 1.1;
  }

  setupTimingDefaults() {
    this.actionCount = 0;
    this.nextActionTime = 0;
    this.phaseTimer = 0;
    this.phaseStartDelay = 60;
    this.nonspellIntroDelay = 30;
    this.spellIntroDelay = 75;

    this.sectionTimeMax = 0;
    this.sectionTime = 0;

    this.timerPaused = false;
    this.patternPaused = false;
  }

  setupDisplayDefaults() {
    this.displaySectionHp = 0;
    this.displayLifeRefillTimer = 0;
    this.displayLifeRefillDuration = 80;

    this.displayBarFillRatio = null;
    this.displayRefillStartBarRatio = 0;
    this.transitionHoldBarRatio = null;

    this.timeoutDrainTimer = 0;
    this.timeoutDrainDuration = 80;
    this.displayDrainStartBarRatio = 1;
    this.displayDrainTargetBarRatio = 0;
    this.pendingSectionAdvance = false;

    this.uiIntroTimer = 0;
    this.uiIntroDuration = 60;
  }

  setupUiDefaults() {
    this.hpBarLifeAreaW = 80;
    this.hpBarTimerAreaW = 40;
    this.hpBarMargin = 0;
    this.hpBarY = 12;
    this.hpBarH = 5;

    this.hpBarVisualNonspellWeight = 4;
    this.hpBarVisualSpellWeight = 1;

    this.hpBarNonspellColor = [215, 215, 225];
    this.hpBarSpellColor = [235, 120, 165];
    this.hpBarShadowAlpha = 110;

    this.timerTextSize = 24;
    this.timerShadowOffsetX = 2;
    this.timerShadowOffsetY = 2;
    this.timerMainX = 7;
    this.timerMainY = 8;

    this.timerColorHigh = [150, 220, 255];
    this.timerColorMid = [190, 160, 255];
    this.timerColorLow = [255, 150, 210];
    this.timerColorCritical = [255, 100, 100];

    this.enemyLabelText = "Enemy";
    this.enemyLabelTextSize = 14;
    this.enemyLivesTextSize = 24;

    this.enemyLabelOffsetX = 0;
    this.enemyLabelOffsetY = 2;
    this.enemyLivesOffsetX = 50;
    this.enemyLivesOffsetY = 0;

    this.enemyShadowOffsetX = 2;
    this.enemyShadowOffsetY = 2;

    this.enemyLabelColor = [255, 200, 90];
    this.enemyLivesColor = [255, 240, 160];
  }

  setupDeathTuning() {
    let slowmo = this.bossData.deathSlowmo ?? {};

    this.deathSlowmoEnabled = slowmo.enabled ?? false;
    this.deathDuration = slowmo.duration ?? 90;
    this.deathSlowmoScale = slowmo.scale ?? 0.35;
  }

  createLives() {
    return this.bossData.lives.map((life) => ({ ...life }));
  }

  // #endregion

  // #region Core flow

  update() {
    if (!this.active) return;

    if (this.isDying) {
      this.updateDeathSequence();
      return;
    }

    if (this.waitingToEnter) {
      if (this.player.invulnTimer <= 0) {
        this.waitingToEnter = false;
        this.hasStartedFight = true;
        this.beginPhaseTransition();
      }
      return;
    }

    let life = this.lives[this.currentLife];
    if (!life) return;

    this.emitter.update?.();

    for (let e of this.emitters) {
      e.update?.();
    }

    let arrived = this.moveTowardTarget();

    if (!this.phaseReady && arrived) {
      this.finishPhaseTransition();
    }

    if (!this.timerPaused && this.sectionTime > 0) {
      this.sectionTime--;
    }

    if (this.phaseReady && !this.pendingSectionAdvance) {
      if (!this.patternPaused) {
        this.phaseTimer++;
      }

      this.vulnerable = this.phaseTimer >= this.getCurrentPhaseIntroDelay();

      this.runCurrentPattern(life);
    }

    if (
      this.vulnerable &&
      keyIsDown(88) &&
      frameCount % 5 === 0 &&
      !this.pendingSectionAdvance
    ) {
      this.sectionHp -= 2;
    }

    if (this.phaseReady && !this.pendingSectionAdvance && this.sectionHp <= 0) {
      this.advanceSection();
      this.updateDisplayHp();
      return;
    }

    if (
      this.phaseReady &&
      !this.pendingSectionAdvance &&
      this.sectionTime <= 0
    ) {
      if (this.sectionType === "spell") {
        this.advanceSection();
        this.updateDisplayHp();
        return;
      } else {
        this.startTimeoutDrain();
      }
    }

    this.updateDisplayHp();
    this.updateUiIntro();
  }

  prepareFirstSection() {
    let life = this.lives[this.currentLife];
    if (!life) return;

    this.sectionType = "nonspell";
    this.sectionHpMax = life.nonspellHpMax;
    this.sectionHp = this.sectionHpMax;

    this.sectionTimeMax = life.nonspellTime * 60;
    this.sectionTime = this.sectionTimeMax;

    this.displaySectionHp = this.sectionHp;
    this.displayBarFillRatio = 0;
    this.displayRefillStartBarRatio = 0;
    this.displayLifeRefillTimer = this.displayLifeRefillDuration;

    this.phaseReady = false;
    this.vulnerable = false;
    this.isEntering = true;
  }

  startCurrentSection() {
    let life = this.lives[this.currentLife];
    if (!life) return;

    if (this.sectionType === "nonspell" && !life.nonspell) {
      this.sectionType = "spell";
    }

    this.timerPaused = false;
    this.patternPaused = false;
    this.pendingSectionAdvance = false;
    this.timeoutDrainTimer = 0;

    if (this.sectionType === "nonspell") {
      this.sectionHpMax = life.nonspellHpMax;
      this.sectionHp = this.sectionHpMax;

      this.sectionTimeMax = life.nonspellTime * 60;
      this.sectionTime = this.sectionTimeMax;
    } else {
      this.sectionHpMax = life.spellHpMax;
      this.sectionHp = this.sectionHpMax;

      this.sectionTimeMax = life.spellTime * 60;
      this.sectionTime = this.sectionTimeMax;
    }

    if (this.displayLifeRefillTimer <= 0) {
      if (this.transitionHoldBarRatio === null) {
        this.displayBarFillRatio = null;
      }
      this.displaySectionHp = this.sectionHp;
    }

    this.beginPhaseTransition();
  }

  advanceSection() {
    let life = this.lives[this.currentLife];

    if (this.sectionType === "nonspell" && life.spell) {
      this.displayLifeRefillTimer = 0;

      let holdRatio = this.getSpellSectionBaseRatio(life);
      this.transitionHoldBarRatio = holdRatio;
      this.displayBarFillRatio = holdRatio;

      this.sectionType = "spell";
      this.sectionHpMax = life.spellHpMax;
      this.sectionHp = this.sectionHpMax;
      this.displaySectionHp = this.sectionHp;

      this.startCurrentSection();
      return;
    }

    let refillStartRatio = this.getDisplayedBarFillRatio();

    this.currentLife++;
    this.lifeCount--;

    if (this.currentLife >= this.lives.length) {
      this.startDeathSequence();
      return;
    }

    this.sectionType = "nonspell";
    this.displayLifeRefillTimer = this.displayLifeRefillDuration;
    this.displayRefillStartBarRatio = refillStartRatio;
    this.displayBarFillRatio = refillStartRatio;

    this.startCurrentSection();
  }

  beginPhaseTransition() {
    let life = this.lives[this.currentLife];
    if (!life) return;

    this.phaseTimer = 0;
    this.phaseReady = false;
    this.vulnerable = false;

    this.isEntering = this.currentLife === 0 && this.sectionType === "nonspell";

    this.timerPaused = false;
    this.patternPaused = false;

    this.emitter.reset?.();
    this.emitters = [];

    familiars = [];

    this.restTimer = 0;
    this.randomMoveReady = true;
    this.currentPause = 0;

    this.pathPoints = [];
    this.pathIndex = 0;
    this.followingPath = false;

    this.actionCount = 0;
    this.nextActionTime = 0;

    let startY =
      this.sectionType === "nonspell"
        ? (life.nonspellY ?? 100)
        : (life.spellY ?? 90);

    let targetX = GAME_LAYOUT.playfieldX + GAME_LAYOUT.playfieldW / 2;
    let targetY = startY;

    if (
      !this.isEntering &&
      this.sectionType === "nonspell" &&
      this.currentLife > 0
    ) {
      targetX = this.x;
    }

    let transitionSpeed;

    if (this.isEntering) {
      transitionSpeed = this.entranceSpeed;
    } else {
      transitionSpeed = this.getSpeedForDuration(
        targetX,
        targetY,
        this.transitionDurationFrames,
      );
    }

    this.setTarget(targetX, targetY, transitionSpeed, false, !this.isEntering);

    for (let b of this.bullets) {
      destroyEnemyBulletWithPop(b);
    }
  }

  finishPhaseTransition() {
    this.phaseReady = true;
    this.vulnerable = false;
    this.phaseTimer = 0;

    if (!this.hasShownFightUi) {
      this.startUiIntro();
      this.hasShownFightUi = true;
    }

    this.isEntering = false;
    this.emitter.reset?.();
  }

  startDeathSequence() {
    if (this.isDying) return;

    this.isDying = true;
    this.deathTimer = this.deathDuration;

    this.phaseReady = false;
    this.vulnerable = false;

    this.timerPaused = true;
    this.patternPaused = true;

    this.emitter.reset?.();
  }

  updateDeathSequence() {
    if (this.deathTimer > 0) {
      this.deathTimer--;

      // Small random pops while dying
      if (frameCount % 3 === 0) {
        let offsetX = random(-this.drawWidth / 2, this.drawWidth / 2);
        let offsetY = random(-this.drawHeight / 2, this.drawHeight / 2);

        spawnBulletPop(
          this.x + offsetX,
          this.y + offsetY,
          null,
          20,
          random(12, 24)
        );
      }
    }

    if (this.deathTimer <= 0) {
      for (let b of this.bullets) {
        destroyEnemyBulletWithPop(b);
      }

      // Big burst of pops when boss dies
      for (let i = 0; i < 20; i++) {
        let angle = random(TWO_PI);
        let radius = random(0, this.drawWidth * 0.6);

        let x = this.x + cos(angle) * radius;
        let y = this.y + sin(angle) * radius;

        spawnBulletPop(
          x,
          y,
          null,
          24,
          random(24, 48)
        );
      }

      familiars = [];
      this.emitters = [];

      this.isDying = false;
      this.active = false;
      this.visible = false;

      playerCanShoot = false;
      gameplayActive = false;

      triggerVictory();
    }
  }

  // #endregion

  // #region Movement

  moveTowardTarget() {
    let dx = this.targetX - this.x;
    let dy = this.targetY - this.y;
    let dist = sqrt(dx * dx + dy * dy);

    if (dist < 1) {
      this.x = this.targetX;
      this.y = this.targetY;
      this.restTimer++;
      return true;
    }

    this.restTimer = 0;

    let speed = this.moveSpeed;

    let slowdownRadius;
    let minSpeed;

    if (this.isEntering) {
      slowdownRadius = this.entranceSlowdownRadius;
      minSpeed = this.entranceMinSpeed;
    } else if (this.useDriftSlowdown) {
      slowdownRadius = this.arrivalSlowdownRadius;
      minSpeed = this.arrivalMinSpeed;
    } else {
      slowdownRadius = this.arrivalSlowdownRadius;
      minSpeed = this.arrivalMinSpeed;
    }

    if (dist < slowdownRadius) {
      let t = constrain(dist / slowdownRadius, 0, 1);
      speed = lerp(minSpeed, this.moveSpeed, t * t);
    }

    speed = min(speed, dist);

    this.x += (dx / dist) * speed;
    this.y += (dy / dist) * speed;

    if (this.useBounds) {
      this.x = constrain(this.x, this.minX, this.maxX);
      this.y = constrain(this.y, this.minY, this.maxY);
    }

    return false;
  }

  setTarget(
    x,
    y,
    speed = this.moveSpeed,
    bounded = false,
    useDriftSlowdown = false,
  ) {
    if (bounded) {
      x = constrain(x, this.minX, this.maxX);
      y = constrain(y, this.minY, this.maxY);
    }

    this.targetX = x;
    this.targetY = y;
    this.moveSpeed = speed;
    this.useBounds = bounded;
    this.useDriftSlowdown = useDriftSlowdown;
    this.currentPause = 0;
  }

  getSpeedForDuration(targetX, targetY, durationFrames) {
    if (durationFrames <= 0) return this.moveSpeed;

    let dx = targetX - this.x;
    let dy = targetY - this.y;
    let dist = sqrt(dx * dx + dy * dy);

    return dist / durationFrames;
  }

  moveInDirection(
    angle,
    distance,
    speed = this.moveSpeed,
    bounded = false,
    useDriftSlowdown = true,
  ) {
    let x = this.x + cos(angle) * distance;
    let y = this.y + sin(angle) * distance;
    this.setTarget(x, y, speed, bounded, useDriftSlowdown);
  }

  getCurrentPause() {
    if (this.currentPause === 0) {
      this.currentPause = floor(random(this.pauseMin, this.pauseMax));
    }
    return this.currentPause;
  }

  driftMove({
    distance = 45,
    speed = 2.3,
    centerAngle = null,
    arcWidth = null,
    bounded = true,
    pauseMin = 90,
    pauseMax = 140,
    immediateFirstMove = false,
  } = {}) {
    this.pauseMin = pauseMin;
    this.pauseMax = pauseMax;

    let pause = this.getCurrentPause();

    if (!(immediateFirstMove && this.phaseTimer === 0)) {
      if (this.restTimer < pause) {
        this.randomMoveReady = true;
        return;
      }
    }

    if (!this.randomMoveReady) return;

    let angle;

    if (centerAngle === null || arcWidth === null) {
      angle = random(TWO_PI);
    } else {
      angle = random(centerAngle - arcWidth / 2, centerAngle + arcWidth / 2);
    }

    this.moveInDirection(angle, distance, speed, bounded, true);

    this.randomMoveReady = false;
    this.currentPause = 0;
  }

  laneBiasMove({
    speed = 2.3,
    pauseMin = 90,
    pauseMax = 140,
    playerBias = 0.35,
    xJitter = 20,
    yJitter = 12,
  } = {}) {
    this.pauseMin = pauseMin;
    this.pauseMax = pauseMax;

    let pause = this.getCurrentPause();

    if (this.restTimer < pause) {
      this.randomMoveReady = true;
      return;
    }

    if (!this.randomMoveReady) return;

    let targetX = lerp(
      this.x + random(-xJitter, xJitter),
      this.player.x,
      playerBias,
    );

    let targetY = this.y + random(-yJitter, yJitter);

    targetX = constrain(targetX, this.minX, this.maxX);
    targetY = constrain(targetY, this.minY, this.maxY);

    this.setTarget(targetX, targetY, speed, true, true);

    this.randomMoveReady = false;
    this.currentPause = 0;
  }

  startPath(points, speed = 3, pauseFrames = 20, loop = true, bounded = false) {
    this.pathPoints = points.map((p) => ({
      x: p.x,
      y: p.y,
      pause: p.pause ?? pauseFrames,
      speed: p.speed ?? speed,
    }));

    this.pathIndex = 0;
    this.pathPause = pauseFrames;
    this.pathLoop = loop;
    this.followingPath = this.pathPoints.length > 0;

    if (this.followingPath) {
      let p = this.pathPoints[0];
      this.setTarget(p.x, p.y, p.speed, bounded);
    }
  }

  updatePathMovement(speed = this.moveSpeed, bounded = false) {
    if (!this.followingPath || this.pathPoints.length === 0) return;

    let currentPoint = this.pathPoints[this.pathIndex];
    let currentPause = currentPoint.pause ?? this.pathPause;

    if (this.restTimer < currentPause) return;

    this.pathIndex++;

    if (this.pathIndex >= this.pathPoints.length) {
      if (this.pathLoop) {
        this.pathIndex = 0;
      } else {
        this.followingPath = false;
        return;
      }
    }

    let p = this.pathPoints[this.pathIndex];
    let pointSpeed = p.speed ?? speed;
    this.setTarget(p.x, p.y, pointSpeed, bounded);
  }

  // #endregion

  // #region Pause / timing helpers

  setPauseState({
    timerPaused = this.timerPaused,
    patternPaused = this.patternPaused,
  } = {}) {
    this.timerPaused = timerPaused;
    this.patternPaused = patternPaused;
  }

  isSectionPaused() {
    return this.timerPaused || this.patternPaused;
  }

  isInPhaseStartup(delayFrames) {
    return this.phaseTimer < delayFrames;
  }

  getCurrentPhaseIntroDelay() {
    return this.sectionType === "spell"
      ? this.spellIntroDelay
      : this.nonspellIntroDelay;
  }

  getPatternTimer() {
    return this.phaseTimer - this.getCurrentPhaseIntroDelay();
  }

  isPatternActive() {
    return this.getPatternTimer() >= 0;
  }

  // #endregion

  // #region HP / UI state helpers

  getCurrentBarFillRatio() {
    if (this.sectionHpMax <= 0) return 0;
    return constrain(this.displaySectionHp / this.sectionHpMax, 0, 1);
  }

  getActualBarFillRatio() {
    let life = this.lives[this.currentLife];
    if (!life) return 0;

    let visualNonspellWeight = this.hpBarVisualNonspellWeight;
    let visualSpellWeight = this.hpBarVisualSpellWeight;
    let visualTotal = visualNonspellWeight + visualSpellWeight;

    let hasNonspell = life.nonspell && life.nonspellHpMax > 0;

    if (this.sectionType === "nonspell") {
      if (!hasNonspell || life.nonspellHpMax <= 0) return 0;

      let nonspellRatio = constrain(this.sectionHp / life.nonspellHpMax, 0, 1);
      return (
        (visualSpellWeight + nonspellRatio * visualNonspellWeight) / visualTotal
      );
    }

    if (this.sectionType === "spell") {
      if (life.spellHpMax <= 0) return 0;

      let spellRatio = constrain(this.sectionHp / life.spellHpMax, 0, 1);

      if (!hasNonspell) {
        return spellRatio;
      }

      return (spellRatio * visualSpellWeight) / visualTotal;
    }

    return 0;
  }

  getSpellSectionBaseRatio(life = this.lives[this.currentLife]) {
    if (!life) return 0;

    let visualNonspellWeight = this.hpBarVisualNonspellWeight;
    let visualSpellWeight = this.hpBarVisualSpellWeight;
    let visualTotal = visualNonspellWeight + visualSpellWeight;

    let hasNonspell = life.nonspell && life.nonspellHpMax > 0;

    if (!hasNonspell) return 1;
    return visualSpellWeight / visualTotal;
  }

  getDisplayedBarFillRatio() {
    if (this.transitionHoldBarRatio !== null) {
      return constrain(this.transitionHoldBarRatio, 0, 1);
    }

    if (this.displayBarFillRatio !== null) {
      return constrain(this.displayBarFillRatio, 0, 1);
    }

    return this.getActualBarFillRatio();
  }

  startUiIntro() {
    this.uiIntroTimer = this.uiIntroDuration;
  }

  updateUiIntro() {
    if (this.uiIntroTimer > 0) {
      this.uiIntroTimer--;
    }
  }

  getUiIntroProgress() {
    if (this.uiIntroDuration <= 0) return 1;
    return 1 - this.uiIntroTimer / this.uiIntroDuration;
  }

  getUiTextIntroProgress() {
    if (this.currentLife !== 0) return 1;
    return this.getUiIntroProgress();
  }

  getUiTextVisibilityProgress() {
    let intro = this.getUiTextIntroProgress();
    let outro = this.isDying
      ? constrain(this.deathTimer / this.deathDuration, 0, 1)
      : 1;

    return intro * outro;
  }

  startTimeoutDrain() {
    if (this.pendingSectionAdvance) return;

    this.pendingSectionAdvance = true;
    this.timeoutDrainTimer = this.timeoutDrainDuration;
    this.displayDrainStartBarRatio = this.getDisplayedBarFillRatio();

    let life = this.lives[this.currentLife];

    if (this.sectionType === "nonspell" && life && life.spell) {
      this.displayDrainTargetBarRatio = this.getSpellSectionBaseRatio(life);
    } else {
      this.displayDrainTargetBarRatio = 0;
    }

    this.displayBarFillRatio = this.displayDrainStartBarRatio;

    this.setPauseState({
      timerPaused: true,
      patternPaused: true,
    });
  }

  shouldDelayBarFill() {
    if (!this.phaseReady) return true;
    if (this.currentLife === 0 && this.uiIntroTimer > 0) return true;
    return false;
  }

  updateDisplayHp() {
    if (this.timeoutDrainTimer > 0) {
      this.timeoutDrainTimer--;

      let t = 1 - this.timeoutDrainTimer / this.timeoutDrainDuration;
      this.displayBarFillRatio = lerp(
        this.displayDrainStartBarRatio,
        this.displayDrainTargetBarRatio,
        t,
      );

      if (this.timeoutDrainTimer <= 0) {
        this.displayBarFillRatio = this.displayDrainTargetBarRatio;
        this.pendingSectionAdvance = false;
        this.advanceSection();
      }

      return;
    }

    if (this.displayLifeRefillTimer > 0) {
      if (this.shouldDelayBarFill()) {
        this.displayBarFillRatio = this.displayRefillStartBarRatio;
        return;
      }

      this.displayLifeRefillTimer--;

      let t = 1 - this.displayLifeRefillTimer / this.displayLifeRefillDuration;
      let targetRatio = this.getActualBarFillRatio();

      this.displayBarFillRatio = lerp(
        this.displayRefillStartBarRatio,
        targetRatio,
        t,
      );

      if (this.displayLifeRefillTimer <= 0) {
        this.displayBarFillRatio = null;
        this.displaySectionHp = this.sectionHp;
      }

      return;
    }

    if (this.phaseReady) {
      this.transitionHoldBarRatio = null;
    }

    this.displayBarFillRatio = null;
    this.displaySectionHp = this.sectionHp;
  }

  // #endregion

  // #region UI drawing helpers

  drawUiShadowRect(x, y, w, h, color) {
    fill(0, 0, 0, this.hpBarShadowAlpha);
    rect(x + 1, y + 2, w, h);

    fill(...color);
    rect(x, y, w, h);
  }

  drawAnimatedHpBar(
    x,
    y,
    barW,
    barH,
    spellW,
    hasNonspell,
    spellColor,
    nonspellColor,
    overrideRatio = null,
  ) {
    let ratio =
      overrideRatio !== null ? overrideRatio : this.displayBarFillRatio;

    let fillW = constrain(ratio, 0, 1) * barW;

    if (fillW <= 0) return;

    if (!hasNonspell) {
      this.drawUiShadowRect(x, y, fillW, barH, spellColor);
      return;
    }

    if (fillW <= spellW) {
      this.drawUiShadowRect(x, y, fillW, barH, spellColor);
    } else {
      this.drawUiShadowRect(x, y, spellW, barH, spellColor);
      this.drawUiShadowRect(x + spellW, y, fillW - spellW, barH, nonspellColor);
    }
  }

  drawSectionHpBar(
    x,
    y,
    barH,
    spellW,
    nonspellW,
    life,
    spellColor,
    nonspellColor,
  ) {
    if (this.sectionType === "nonspell") {
      let whiteW = map(
        this.displaySectionHp,
        0,
        life.nonspellHpMax,
        0,
        nonspellW,
      );

      if (spellW > 0) {
        this.drawUiShadowRect(x, y, spellW, barH, spellColor);
      }

      if (whiteW > 0) {
        this.drawUiShadowRect(x + spellW, y, whiteW, barH, nonspellColor);
      }
    } else if (this.sectionType === "spell") {
      let redW = map(this.displaySectionHp, 0, life.spellHpMax, 0, spellW);

      if (redW > 0) {
        this.drawUiShadowRect(x, y, redW, barH, spellColor);
      }
    }
  }

  // #endregion

  // #region UI / rendering

  showHpBar() {
    let life = this.lives[this.currentLife];
    if (!life) return;

    if (!this.hasShownFightUi) return;

    let x = GAME_LAYOUT.playfieldX + this.hpBarLifeAreaW + this.hpBarMargin;
    let y = GAME_LAYOUT.playfieldY + this.hpBarY;
    let barH = this.hpBarH;
    let barW =
      GAME_LAYOUT.playfieldW -
      this.hpBarLifeAreaW -
      this.hpBarTimerAreaW -
      this.hpBarMargin * 2;

    let visualNonspellWeight = this.hpBarVisualNonspellWeight;
    let visualSpellWeight = this.hpBarVisualSpellWeight;
    let visualTotal = visualNonspellWeight + visualSpellWeight;

    let hasNonspell = life.nonspell && life.nonspellHpMax > 0;

    let spellW = hasNonspell ? barW * (visualSpellWeight / visualTotal) : barW;

    let nonspellW = hasNonspell
      ? barW * (visualNonspellWeight / visualTotal)
      : 0;

    rectMode(CORNER);
    noStroke();

    let nonspellColor = this.hpBarNonspellColor;
    let spellColor = this.hpBarSpellColor;

    if (this.transitionHoldBarRatio !== null) {
      let holdW = spellW;

      if (holdW > 0) {
        this.drawUiShadowRect(x, y, holdW, barH, spellColor);
      }

      rectMode(CENTER);
      return;
    }

    if (this.displayBarFillRatio !== null) {
      this.drawAnimatedHpBar(
        x,
        y,
        barW,
        barH,
        spellW,
        hasNonspell,
        spellColor,
        nonspellColor,
      );

      rectMode(CENTER);
      return;
    }

    this.drawSectionHpBar(
      x,
      y,
      barH,
      spellW,
      nonspellW,
      life,
      spellColor,
      nonspellColor,
    );

    rectMode(CENTER);
  }

  showTimer() {
    if (!this.active || this.waitingToEnter) return;
    if (!this.hasShownFightUi) return;

    let seconds = ceil(this.sectionTime / 60);
    seconds = constrain(seconds, 0, 99);

    let display = nf(seconds, 2);

    let timerColor;

    if (seconds >= 20) {
      timerColor = this.timerColorHigh;
    } else if (seconds >= 10) {
      timerColor = this.timerColorMid;
    } else if (seconds >= 5) {
      timerColor = this.timerColorLow;
    } else {
      timerColor = this.timerColorCritical;
    }

    let visibility = this.getUiTextVisibilityProgress();

    textAlign(RIGHT, TOP);

    fill(0, 0, 0, this.hpBarShadowAlpha * visibility);
    textSize(this.timerTextSize);
    text(
      display,
      GAME_LAYOUT.playfieldX +
      GAME_LAYOUT.playfieldW -
      this.timerMainX +
      this.timerShadowOffsetX,
      GAME_LAYOUT.playfieldY + this.timerMainY + this.timerShadowOffsetY,
    );

    fill(...timerColor, 255 * visibility);
    textSize(this.timerTextSize);
    text(
      display,
      GAME_LAYOUT.playfieldX + GAME_LAYOUT.playfieldW - this.timerMainX,
      GAME_LAYOUT.playfieldY + this.timerMainY,
    );
  }

  show() {
    if (!this.visible) return;
    if (this.waitingToEnter) return;

    push();
    translate(this.x, this.y);

    if (this.sprite) {
      imageMode(CENTER);
      image(this.sprite, 0, 0, this.drawWidth, this.drawHeight);
    } else {
      noStroke();
      fill(this.vulnerable ? 255 : 180);
      rectMode(CENTER);
      rect(0, 0, this.drawWidth, this.drawHeight);
    }

    pop();

    // Debug boss contact circle
    // push();
    // noFill();
    // stroke(255, 0, 0);
    // strokeWeight(1);
    // circle(this.x, this.y, this.contactRadius * 2);
    // pop();

    for (let e of this.emitters) {
      e.show?.();
    }
  }

  // #endregion

  // #region Pattern helpers

  cycleActions(
    actionInterval,
    actionsPerCycle,
    pauseFrames,
    actionFunc,
    timer = this.phaseTimer,
  ) {
    if (timer < this.nextActionTime) return;

    actionFunc(this.actionCount);

    this.actionCount++;

    if (this.actionCount >= actionsPerCycle) {
      this.actionCount = 0;
      this.nextActionTime = timer + pauseFrames;
    } else {
      this.nextActionTime = timer + actionInterval;
    }
  }

  runCurrentPattern(life) {
    let patternName =
      this.sectionType === "nonspell" ? life.nonspell : life.spell;

    if (!patternName) return;

    let timer = this.getPatternTimer();
    if (timer < 0) return;

    let runner = patternRunners[patternName];
    if (!runner) return;

    let cfg = patternConfigs[patternName] ?? {};
    runner(this, cfg, timer);
  }

  // #endregion
}