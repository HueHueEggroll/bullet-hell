function onPatternStart(timer, fn) {
  if (timer === 0) {
    fn();
  }
}

function doEvery(timer, interval, fn) {
  if (interval > 0 && timer % interval === 0) {
    fn();
  }
}

function runCycleActions(boss, timer, cfg, actionFunc) {
  boss.cycleActions(
    cfg.actionInterval,
    cfg.actionsPerCycle,
    cfg.cyclePauseFrames,
    actionFunc,
    timer
  );
}

function getCenteredRowOffsets(count, spacing) {
  let totalWidth = (count - 1) * spacing;
  let leftX = -totalWidth / 2;

  let offsets = [];
  for (let i = 0; i < count; i++) {
    offsets.push(leftX + i * spacing);
  }

  return offsets;
}

function resolvePlayfieldPathPoints(points) {
  return points.map((p) => ({
    x: GAME_LAYOUT.playfieldX + GAME_LAYOUT.playfieldW * p.xRatio,
    y: p.y,
    pause: p.pause,
    speed: p.speed
  }));
}

function isAtPathPoint(boss, index) {
  return boss.pathIndex === index && boss.restTimer > 0;
}

function makeSetSpeedEvent(time, speed) {
  return {
    time,
    action: (b) => {
      b.speed = speed;

      if (b.angle !== undefined) {
        b.vx = cos(b.angle) * speed;
        b.vy = sin(b.angle) * speed;
      }
    },
  };
}

function fireNestedAimedSpread(
  familiar,
  player,
  outerArcDeg,
  outerCount,
  innerArcDeg,
  innerCount,
  speed,
  bulletData,
) {
  let baseAngleDeg = degrees(
    atan2(player.y - familiar.y, player.x - familiar.x),
  );

  for (let i = 0; i < outerCount; i++) {
    let groupAngleDeg =
      outerCount === 1
        ? baseAngleDeg
        : map(
          i,
          0,
          outerCount - 1,
          baseAngleDeg - outerArcDeg / 2,
          baseAngleDeg + outerArcDeg / 2,
        );

    familiar.emitter.fireSpread(
      groupAngleDeg,
      innerArcDeg,
      innerCount,
      speed,
      bulletData,
    );
  }
}

function makeDirectionalRandomBurstEvent(
  time,
  directionCount,
  burstCountPerDirection,
  burstArcDeg,
  speed,
  bulletData,
  baseAngle = -HALF_PI,
) {
  return {
    time,
    action: (b) => {
      let burstArc = radians(burstArcDeg);

      for (let i = 0; i < directionCount; i++) {
        let directionAngle = baseAngle + (TWO_PI * i) / directionCount;

        for (let j = 0; j < burstCountPerDirection; j++) {
          let randomOffset = random(-burstArc / 2, burstArc / 2);
          let angle = directionAngle + randomOffset;

          b.spawnBullet(b.x, b.y, angle, speed, bulletData);
        }
      }

      b.kill();
    },
  };
}

function moveValueToward(current, target, step) {
  if (current < target) return min(current + step, target);
  if (current > target) return max(current - step, target);
  return current;
}

function makeDirectionalRandomBurstEvent(
  time,
  directionCount,
  burstCountPerDirection,
  burstArcDeg,
  speed,
  bulletData,
  baseAngle = -HALF_PI,
) {
  return {
    time,
    action: (b) => {
      let burstArc = radians(burstArcDeg);

      for (let i = 0; i < directionCount; i++) {
        let directionAngle = baseAngle + (TWO_PI * i) / directionCount;

        for (let j = 0; j < burstCountPerDirection; j++) {
          let randomOffset = random(-burstArc / 2, burstArc / 2);
          let angle = directionAngle + randomOffset;

          b.spawnBullet(b.x, b.y, angle, speed, bulletData);
        }
      }

      b.kill();
    },
  };
}

function getRandomPointNearBoundaryOutside(leftX, rightX, topY, bottomY, padding = 24) {
  let side = floor(random(4));

  if (side === 0) {
    return {
      x: leftX - padding,
      y: random(topY, bottomY),
    };
  }

  if (side === 1) {
    return {
      x: rightX + padding,
      y: random(topY, bottomY),
    };
  }

  if (side === 2) {
    return {
      x: random(leftX, rightX),
      y: topY - padding,
    };
  }

  return {
    x: random(leftX, rightX),
    y: bottomY + padding,
  };
}