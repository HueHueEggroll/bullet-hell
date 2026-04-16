class BulletEmitter {
  constructor(owner, bullets, player = null) {
    this.owner = owner;
    this.bullets = bullets;
    this.player = player;

    this.baseAngle = 0; // internal radians
    this.baseAngleDeg = 0; // convenience mirror for pattern code
    this.spinDir = 1;

    this.sweepBaseAngle = 0;
    this.sweepDirection = 1;
    this.arcSweepBaseAngle = 0;
    this.arcSweepCycleIndex = -1;
    this.arcSweepStartT = 0;
  }

  // #region Core state / spawn

  reset() {
    this.baseAngle = 0;
    this.baseAngleDeg = 0;
    this.spinDir = 1;

    this.sweepBaseAngle = 0;
    this.sweepDirection = 1;
    this.arcSweepBaseAngle = 0;
    this.arcSweepCycleIndex = -1;
    this.arcSweepStartT = 0;
  }

  rotateBaseAngle(stepDeg) {
    this.baseAngle += radians(stepDeg);
    this.baseAngleDeg += stepDeg;
  }

  spawnBullet(x, y, angle, speed, bulletData = {}) {
    this.bullets.push(
      new Bullet(x, y, angle, speed, {
        ...bulletData,
        player: this.player,
        spawnBullet: (bx, by, bAngle, bSpeed, bOptions = {}) => {
          this.spawnBullet(bx, by, bAngle, bSpeed, bOptions);
        },
      }),
    );
  }

  update() { }

  // #endregion

  // #region Instant angular helpers

  _getInstantAngles({
    centerAngleDeg = 90,
    aimed = false,
    totalArcDeg = 60,
    count = 5,
    fullCircle = false,
    startAngleDeg = 0,
    gapAngleDeg = null,
    gapArcDeg = 0,
    gapOffsetDeg = 0,
  } = {}) {
    if (count <= 0) return [];

    let baseAngle = radians(centerAngleDeg);

    if (aimed) {
      if (!this.player) return [];

      baseAngle = atan2(
        this.player.y - this.owner.y,
        this.player.x - this.owner.x,
      );
    }

    let totalArc = radians(totalArcDeg);
    let startAngle = radians(startAngleDeg);
    let gapArc = radians(gapArcDeg);

    let resolvedGapAngle = gapAngleDeg !== null ? radians(gapAngleDeg) : null;

    if (gapArc > 0 && resolvedGapAngle === null) {
      resolvedGapAngle =
        (fullCircle ? startAngle : baseAngle) + radians(gapOffsetDeg);
    }

    let angles = [];

    if (fullCircle) {
      for (let i = 0; i < count; i++) {
        let angle = startAngle + (TWO_PI * i) / count;

        if (gapArc > 0 && resolvedGapAngle !== null) {
          let diff = atan2(
            sin(angle - resolvedGapAngle),
            cos(angle - resolvedGapAngle),
          );

          if (abs(diff) <= gapArc / 2) continue;
        }

        angles.push(angle);
      }

      return angles;
    }

    if (count === 1) {
      let angle = baseAngle;

      if (gapArc > 0 && resolvedGapAngle !== null) {
        let diff = atan2(
          sin(angle - resolvedGapAngle),
          cos(angle - resolvedGapAngle),
        );

        if (abs(diff) <= gapArc / 2) return [];
      }

      return [angle];
    }

    let spreadStart = baseAngle - totalArc / 2;
    let spreadEnd = baseAngle + totalArc / 2;

    for (let i = 0; i < count; i++) {
      let angle = map(i, 0, count - 1, spreadStart, spreadEnd);

      if (gapArc > 0 && resolvedGapAngle !== null) {
        let diff = atan2(
          sin(angle - resolvedGapAngle),
          cos(angle - resolvedGapAngle),
        );

        if (abs(diff) <= gapArc / 2) continue;
      }

      angles.push(angle);
    }

    return angles;
  }

  _fireAngles(angles, speed, bulletData = {}) {
    for (let angle of angles) {
      this.spawnBullet(this.owner.x, this.owner.y, angle, speed, bulletData);
    }
  }

  // #endregion

  // #region Spread family

  fireSpread(centerAngleDeg, totalArcDeg, count, speed, bulletData = {}) {
    let angles = this._getInstantAngles({
      centerAngleDeg,
      totalArcDeg,
      count,
    });

    this._fireAngles(angles, speed, bulletData);
  }

  fireAimedSpread(totalArcDeg, count, speed, bulletData = {}) {
    let angles = this._getInstantAngles({
      aimed: true,
      totalArcDeg,
      count,
    });

    this._fireAngles(angles, speed, bulletData);
  }

  fireGapSpread(
    centerAngleDeg,
    totalArcDeg,
    count,
    speed,
    gapAngleDeg,
    gapArcDeg,
    bulletData = {},
  ) {
    let angles = this._getInstantAngles({
      centerAngleDeg,
      totalArcDeg,
      count,
      gapAngleDeg,
      gapArcDeg,
    });

    this._fireAngles(angles, speed, bulletData);
  }

  fireAimedGapSpread(
    totalArcDeg,
    count,
    speed,
    gapOffsetDeg = 0,
    gapArcDeg = 20,
    bulletData = {},
  ) {
    let angles = this._getInstantAngles({
      aimed: true,
      totalArcDeg,
      count,
      gapOffsetDeg,
      gapArcDeg,
    });

    this._fireAngles(angles, speed, bulletData);
  }

  // #endregion

  // #region Ring family

  fireRing(count, speed, bulletData = {}) {
    let angles = this._getInstantAngles({
      fullCircle: true,
      count,
      startAngleDeg: 0,
    });

    this._fireAngles(angles, speed, bulletData);
  }

  fireRingOffset(count, speed, startAngleDeg = 0, bulletData = {}) {
    let angles = this._getInstantAngles({
      fullCircle: true,
      count,
      startAngleDeg,
    });

    this._fireAngles(angles, speed, bulletData);
  }

  fireAimedRing(count, speed, bulletData = {}) {
    let startAngleDeg = 0;

    if (this.player) {
      let aimedAngle = atan2(
        this.player.y - this.owner.y,
        this.player.x - this.owner.x,
      );
      startAngleDeg = degrees(aimedAngle);
    }

    let angles = this._getInstantAngles({
      fullCircle: true,
      count,
      startAngleDeg,
    });

    this._fireAngles(angles, speed, bulletData);
  }

  fireGapRing(
    count,
    speed,
    startAngleDeg = 0,
    gapAngleDeg = 0,
    gapArcDeg = 20,
    bulletData = {},
  ) {
    let angles = this._getInstantAngles({
      fullCircle: true,
      count,
      startAngleDeg,
      gapAngleDeg,
      gapArcDeg,
    });

    this._fireAngles(angles, speed, bulletData);
  }

  fireAimedGapRing(
    count,
    speed,
    gapOffsetDeg = 0,
    gapArcDeg = 20,
    bulletData = {},
  ) {
    let startAngleDeg = 0;

    if (this.player) {
      let aimedAngle = atan2(
        this.player.y - this.owner.y,
        this.player.x - this.owner.x,
      );
      startAngleDeg = degrees(aimedAngle);
    }

    let angles = this._getInstantAngles({
      fullCircle: true,
      count,
      startAngleDeg,
      gapArcDeg,
      gapOffsetDeg,
    });

    this._fireAngles(angles, speed, bulletData);
  }

  // #endregion

  // #region Sequential angular helpers
  // Public API uses degrees. Internal math stays in radians.

  startSequentialAngle(angleDeg = 0) {
    this.baseAngle = radians(angleDeg);
    this.baseAngleDeg = angleDeg;
  }

  startAimedSequentialAngle(angleOffsetDeg = 0) {
    if (!this.player) return;

    let aimedAngle = atan2(
      this.player.y - this.owner.y,
      this.player.x - this.owner.x,
    );

    this.baseAngle = aimedAngle + radians(angleOffsetDeg);
    this.baseAngleDeg = degrees(this.baseAngle);
  }

  startSequentialArcAtEdge(
    arcWidthDeg,
    side = -1,
    aimed = true,
    baseAngleDeg = 90,
    angleOffsetDeg = 0,
  ) {
    let centerAngle;

    if (aimed) {
      if (!this.player) return;

      centerAngle = atan2(
        this.player.y - this.owner.y,
        this.player.x - this.owner.x,
      );
    } else {
      centerAngle = radians(baseAngleDeg);
    }

    let halfArc = radians(arcWidthDeg) / 2;

    this.baseAngle = centerAngle + radians(angleOffsetDeg) + halfArc * side;
    this.baseAngleDeg = degrees(this.baseAngle);
  }

  setSequentialDirection(direction = 1) {
    this.spinDir = direction >= 0 ? 1 : -1;
  }

  _getSweepRelative(progress, halfArc) {
    return this.spinDir >= 0
      ? lerp(-halfArc, halfArc, progress)
      : lerp(halfArc, -halfArc, progress);
  }

  _fireSequentialAngle(angle, speed, bulletData = {}) {
    this.spawnBullet(this.owner.x, this.owner.y, angle, speed, bulletData);
  }

  stepSpiral(speed, stepDeg, bulletData = {}) {
    let angle = this.baseAngle;

    this._fireSequentialAngle(angle, speed, bulletData);

    this.baseAngle += radians(stepDeg) * this.spinDir;
    this.baseAngleDeg = degrees(this.baseAngle);
  }

  stepAimedArcSpiral(speed, stepDeg, arcWidthDeg, bulletData = {}) {
    if (!this.player) return;

    let aimedAngle = atan2(
      this.player.y - this.owner.y,
      this.player.x - this.owner.x,
    );

    let halfArc = radians(arcWidthDeg) / 2;
    let step = radians(stepDeg) * this.spinDir;

    let relative = atan2(
      sin(this.baseAngle - aimedAngle),
      cos(this.baseAngle - aimedAngle),
    );

    relative += step;

    if (relative > halfArc) {
      relative = -halfArc;
    } else if (relative < -halfArc) {
      relative = halfArc;
    }

    let angle = aimedAngle + relative;

    this._fireSequentialAngle(angle, speed, bulletData);

    this.baseAngle = angle;
    this.baseAngleDeg = degrees(this.baseAngle);
  }

  stepArcSweep(
    progress,
    arcWidthDeg,
    speed,
    bulletData = {},
    anchorProgress = null,
    anchorOffsetDeg = 0,
  ) {
    let halfArc = radians(arcWidthDeg) / 2;

    let relative = this._getSweepRelative(progress, halfArc);

    if (anchorProgress !== null) {
      let anchorRelative = this._getSweepRelative(anchorProgress, halfArc);
      relative -= anchorRelative;
    }

    let angle = this.baseAngle + relative + radians(anchorOffsetDeg);

    this._fireSequentialAngle(angle, speed, bulletData);
  }

  stepArcSweepIndexed(
    shotIndex,
    shotCount,
    arcWidthDeg,
    speed,
    bulletData = {},
    anchorIndex = null,
    anchorOffsetDeg = 0,
  ) {
    let progress = shotCount > 1 ? shotIndex / (shotCount - 1) : 0;

    let anchorProgress = null;

    if (anchorIndex !== null && shotCount > 1) {
      anchorProgress = anchorIndex / (shotCount - 1);
    }

    this.stepArcSweep(
      progress,
      arcWidthDeg,
      speed,
      bulletData,
      anchorProgress,
      anchorOffsetDeg,
    );
  }

  fireTimedIndexedArcSweep({
    timer,
    cycle = 180,
    fireWindow = 96,
    shotInterval = 4,
    arcWidthDeg = 110,
    speed = 2.25,
    aimed = true,
    baseAngleDeg = 90,

    // Direction control
    directionMode = "alternate", // "alternate", "ltr", "rtl", "sequence"
    firstDirection = "rtl", // "ltr" or "rtl"
    directionRepeat = 1, // how many full sweeps before switching
    directionSequence = null, // e.g. ["ltr", "rtl", "ltr", "ltr"]

    // Anchor control
    anchorMode = "late", // "early", "late", "center", "ratio", "index"
    anchorRatio = 0.35, // used for early/late/ratio
    anchorIndex = null, // used when anchorMode === "index"

    anchorOffsetDeg = 0,
    bulletData = {},
  } = {}) {
    if (timer < 0) return false;
    if (shotInterval <= 0) return false;
    if (directionRepeat <= 0) directionRepeat = 1;

    let t = timer % cycle;
    let cycleIndex = floor(timer / cycle);

    let shotsPerSweep = floor(fireWindow / shotInterval);
    if (shotsPerSweep <= 0) return false;

    // Determine sweep direction
    let sweepLeftToRight = true;

    if (directionMode === "ltr") {
      sweepLeftToRight = true;
    } else if (directionMode === "rtl") {
      sweepLeftToRight = false;
    } else if (
      directionMode === "sequence" &&
      Array.isArray(directionSequence) &&
      directionSequence.length > 0
    ) {
      let seqDir = directionSequence[cycleIndex % directionSequence.length];
      sweepLeftToRight = seqDir === "ltr";
    } else {
      // grouped alternating
      let groupedCycleIndex = floor(cycleIndex / directionRepeat);
      let firstIsLTR = firstDirection === "ltr";
      let evenGroup = groupedCycleIndex % 2 === 0;
      sweepLeftToRight = firstIsLTR ? evenGroup : !evenGroup;
    }

    // Keep your current visual mapping
    let direction = sweepLeftToRight ? -1 : 1;

    // Lock cycle state once per cycle
    if (this.arcSweepCycleIndex !== cycleIndex) {
      this.arcSweepCycleIndex = cycleIndex;
      this.arcSweepStartT = t;

      if (aimed) {
        if (!this.player) return false;

        this.arcSweepBaseAngle = atan2(
          this.player.y - this.owner.y,
          this.player.x - this.owner.x,
        );
      } else {
        this.arcSweepBaseAngle = radians(baseAngleDeg);
      }
    }

    // Local timer starts from the first frame this cycle was actually seen
    let localT = t - this.arcSweepStartT;
    if (localT < 0) return false;

    let maxFireT = (shotsPerSweep - 1) * shotInterval;

    if (localT > maxFireT) return false;
    if (localT % shotInterval !== 0) return false;

    let shotIndex = floor(localT / shotInterval);
    if (shotIndex >= shotsPerSweep) return false;

    // Anchor resolution
    let earlySideAnchorIndex = floor((shotsPerSweep - 1) * anchorRatio);
    let lateSideAnchorIndex = shotsPerSweep - 1 - earlySideAnchorIndex;

    let resolvedAnchorIndex = lateSideAnchorIndex; // default matches your current setup

    if (anchorMode === "early") {
      resolvedAnchorIndex = earlySideAnchorIndex;
    } else if (anchorMode === "late") {
      resolvedAnchorIndex = lateSideAnchorIndex;
    } else if (anchorMode === "center") {
      resolvedAnchorIndex = floor(shotsPerSweep / 2);
    } else if (anchorMode === "ratio") {
      let ratioIndex = floor((shotsPerSweep - 1) * anchorRatio);
      resolvedAnchorIndex = constrain(ratioIndex, 0, shotsPerSweep - 1);
    } else if (anchorMode === "index") {
      let explicitIndex = anchorIndex ?? 0;
      resolvedAnchorIndex = constrain(explicitIndex, 0, shotsPerSweep - 1);
    }

    let progress = shotsPerSweep > 1 ? shotIndex / (shotsPerSweep - 1) : 0;

    let anchorProgress =
      shotsPerSweep > 1 ? resolvedAnchorIndex / (shotsPerSweep - 1) : 0;

    let halfArc = radians(arcWidthDeg) / 2;

    let relative =
      direction >= 0
        ? lerp(-halfArc, halfArc, progress)
        : lerp(halfArc, -halfArc, progress);

    let anchorRelative =
      direction >= 0
        ? lerp(-halfArc, halfArc, anchorProgress)
        : lerp(halfArc, -halfArc, anchorProgress);

    relative -= anchorRelative;

    let angle = this.arcSweepBaseAngle + relative + radians(anchorOffsetDeg);

    this.spawnBullet(this.owner.x, this.owner.y, angle, speed, bulletData);
    return true;
  }

  // Readable compatibility wrappers

  startAimedSpiral(angleOffsetDeg = 0) {
    this.startAimedSequentialAngle(angleOffsetDeg);
  }

  startAimedSpiralAtArcEdge(arcWidthDeg, side = -1, angleOffsetDeg = 0) {
    this.startSequentialArcAtEdge(arcWidthDeg, side, true, 90, angleOffsetDeg);
  }

  fireSpiralShot(speed, stepDeg, bulletData = {}) {
    this.stepSpiral(speed, stepDeg, bulletData);
  }

  fireAimedSpiralArcShot(speed, stepDeg, arcWidthDeg, bulletData = {}) {
    this.stepAimedArcSpiral(speed, stepDeg, arcWidthDeg, bulletData);
  }

  startArcSweep(aimed = true, baseAngleDeg = 90, direction = 1) {
    if (aimed) {
      this.startAimedSequentialAngle(0);
    } else {
      this.startSequentialAngle(baseAngleDeg);
    }

    this.setSequentialDirection(direction);
  }

  fireArcSweepShot(
    progress,
    arcWidthDeg,
    speed,
    bulletData = {},
    anchorProgress = null,
    anchorOffsetDeg = 0,
  ) {
    this.stepArcSweep(
      progress,
      arcWidthDeg,
      speed,
      bulletData,
      anchorProgress,
      anchorOffsetDeg,
    );
  }

  fireArcSweepIndexedShot(
    shotIndex,
    shotCount,
    arcWidthDeg,
    speed,
    bulletData = {},
    anchorIndex = null,
    anchorOffsetDeg = 0,
  ) {
    this.stepArcSweepIndexed(
      shotIndex,
      shotCount,
      arcWidthDeg,
      speed,
      bulletData,
      anchorIndex,
      anchorOffsetDeg,
    );
  }

  // #endregion

  // #region Special helpers

  fireRandomBurst(count, minSpeed, maxSpeed, bulletData = {}) {
    if (count <= 0) return;

    for (let i = 0; i < count; i++) {
      let angle = random(TWO_PI);
      let speed = random(minSpeed, maxSpeed);
      this.spawnBullet(this.owner.x, this.owner.y, angle, speed, bulletData);
    }
  }

  // #endregion
}