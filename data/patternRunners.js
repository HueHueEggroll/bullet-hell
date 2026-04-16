const patternRunners = {

    // #region Initial Demo Spells

    demo_nonspell1(boss, cfg, timer) {
        // Movement: simple drifting movement throughout the nonspell
        boss.driftMove();

        // Attack cycle:
        // Step 0-1: rotating ring bursts
        // Step 2: aimed spread
        runCycleActions(boss, timer, cfg, (step) => {
            if (step === 0 || step === 1) {
                boss.emitter.fireRingOffset(
                    cfg.ringCount,
                    cfg.ringSpeed,
                    boss.emitter.baseAngleDeg,
                    {
                        type: "medium",
                        color: "cyan"
                    }
                );

                boss.emitter.rotateBaseAngle(cfg.ringRotationStep);
            } else if (step === 2) {
                boss.emitter.fireAimedSpread(
                    cfg.spreadArc,
                    cfg.spreadCount,
                    cfg.spreadSpeed,
                    {
                        type: "rice",
                        color: "yellow"
                    }
                );
            }
        });
    },

    demo_spell1(boss, cfg, timer) {
        // Movement: drifting movement with longer pauses than nonspell 1
        boss.driftMove({
            distance: cfg.driftDistance,
            speed: cfg.driftSpeed,
            pauseMin: cfg.driftPauseMin,
            pauseMax: cfg.driftPauseMax
        });

        // Attack cycle:
        // Step 0: aimed spread
        // Step 1: rotating ring burst
        // Step 2: downward spread
        runCycleActions(boss, timer, cfg, (step) => {
            if (step === 0) {
                boss.emitter.fireAimedSpread(
                    cfg.aimedSpreadArc,
                    cfg.aimedSpreadCount,
                    cfg.aimedSpreadSpeed,
                    {
                        type: "rice",
                        color: "orange"
                    }
                );
            } else if (step === 1) {
                boss.emitter.fireRingOffset(
                    cfg.ringCount,
                    cfg.ringSpeed,
                    boss.emitter.baseAngleDeg,
                    {
                        type: "small",
                        color: "red"
                    }
                );

                boss.emitter.rotateBaseAngle(cfg.ringRotationStep);
            } else if (step === 2) {
                boss.emitter.fireSpread(
                    cfg.spreadAngle,
                    cfg.spreadArc,
                    cfg.spreadCount,
                    cfg.spreadSpeed,
                    {
                        type: "medium",
                        color: "blue"
                    }
                );
            }
        });
    },

    demo_nonspell2(boss, cfg, timer) {
        let cycleTimer = timer % cfg.cycle;

        // Movement:
        // After the sweep window ends, the boss repositions with a mild bias toward the player.
        if (cycleTimer >= cfg.fireWindow) {
            boss.laneBiasMove({
                speed: cfg.moveSpeed,
                pauseMin: cfg.pauseMin,
                pauseMax: cfg.pauseMax,
                playerBias: cfg.playerBias,
                xJitter: cfg.xJitter,
                yJitter: cfg.yJitter
            });
        }

        // Main attack:
        // A mirrored aimed sweep where one indexed bullet stays locked to the player.
        boss.emitter.fireTimedIndexedArcSweep({
            timer,
            cycle: cfg.cycle,
            fireWindow: cfg.fireWindow,
            shotInterval: cfg.shotInterval,
            arcWidthDeg: cfg.arcWidthDeg,
            speed: cfg.sweepSpeed,
            aimed: true,
            directionMode: cfg.directionMode,
            firstDirection: cfg.firstDirection,
            directionRepeat: cfg.directionRepeat,
            anchorMode: cfg.anchorMode,
            bulletData: {
                type: "bubble",
                color: "cyan"
            }
        });

        // Secondary attack:
        // Periodic aimed support spread layered over the sweep pattern.
        doEvery(timer, cfg.supportSpreadEvery, () => {
            boss.emitter.fireAimedSpread(
                cfg.supportSpreadArcDeg,
                cfg.supportSpreadCount,
                cfg.supportSpreadSpeed,
                {
                    type: "rice",
                    color: "yellow"
                }
            );
        });
    },

    demo_spell2(boss, cfg, timer) {
        // Startup:
        // Resolve playfield-relative path points once at the beginning of the spell.
        onPatternStart(timer, () => {
            boss.startPath(
                resolvePlayfieldPathPoints(cfg.pathPoints),
                cfg.pathSpeed,
                cfg.defaultPause,
                cfg.loopPath,
                false
            );
        });

        // Movement:
        // Continue moving along the preset path.
        boss.updatePathMovement(cfg.pathSpeed, false);

        // Center attack:
        // While lingering at the designated center point, fire denser attacks.
        if (isAtPathPoint(boss, cfg.centerLingerIndex)) {
            doEvery(timer, cfg.centerRingEvery, () => {
                boss.emitter.fireAimedRing(
                    cfg.centerRingCount,
                    cfg.centerRingSpeed,
                    {
                        type: "rice",
                        color: "yellow"
                    }
                );
            });

            doEvery(timer, cfg.centerSpreadEvery, () => {
                boss.emitter.fireSpread(
                    cfg.centerSpreadAngle,
                    cfg.centerSpreadArc,
                    cfg.centerSpreadCount,
                    cfg.centerSpreadSpeed,
                    {
                        type: "small",
                        color: "magenta"
                    }
                );
            });
        } else {
            // Roaming attack:
            // While moving between path points, fire lighter pressure patterns.
            doEvery(timer, cfg.moveSpreadEvery, () => {
                boss.emitter.fireSpread(
                    cfg.moveSpreadAngle,
                    cfg.moveSpreadArc,
                    cfg.moveSpreadCount,
                    cfg.moveSpreadSpeed,
                    {
                        type: "small",
                        color: "magenta"
                    }
                );
            });

            // Special attack:
            // Periodically fire bullets that stop, then split toward the player.
            doEvery(timer, cfg.burstEvery, () => {
                boss.emitter.fireRandomBurst(
                    cfg.burstCount,
                    cfg.burstMinSpeed,
                    cfg.burstMaxSpeed,
                    {
                        type: "medium",
                        color: "white",
                        events: [
                            {
                                time: cfg.transformStopTime,
                                action: (b) => {
                                    b.speed = 0;
                                }
                            },
                            {
                                time: cfg.transformSplitTime,
                                action: (b) => {
                                    if (!b.player) return;

                                    let baseAngle = atan2(
                                        b.player.y - b.y,
                                        b.player.x - b.x
                                    );

                                    for (let i = 0; i < cfg.transformSplitCount; i++) {
                                        let angle = map(
                                            i,
                                            0,
                                            cfg.transformSplitCount - 1,
                                            baseAngle - cfg.transformSplitArc,
                                            baseAngle + cfg.transformSplitArc
                                        );

                                        b.spawnBullet(
                                            b.x,
                                            b.y,
                                            angle,
                                            cfg.transformSplitSpeed,
                                            {
                                                type: "rice",
                                                color: "orange"
                                            }
                                        );
                                    }

                                    b.kill();
                                }
                            }
                        ]
                    }
                );
            });
        }
    },

    demo_spell3(boss, cfg, timer) {
        // Startup:
        // Reset the main emitter, initialize the spiral, and create the two side emitters.
        onPatternStart(timer, () => {
            boss.emitters = [];

            boss.actionCount = 0;
            boss.nextActionTime = 0;

            boss.emitter.reset();
            boss.emitter.startAimedSpiral();
            boss.emitter.spinDir = 1;

            let leftEmitter = new VisualEmitter(
                boss.x,
                boss.y,
                boss.bullets,
                boss.player,
                emitterImg,
            );
            leftEmitter.attachTo(boss, -cfg.orbitRadius, 0);

            let rightEmitter = new VisualEmitter(
                boss.x,
                boss.y,
                boss.bullets,
                boss.player,
                emitterImg,
            );
            rightEmitter.attachTo(boss, cfg.orbitRadius, 0);

            boss.emitters.push(leftEmitter, rightEmitter);
        });

        // Orbiter movement:
        // If orbiting is enabled, move the side emitters around the boss.
        if (cfg.orbitEnabled && boss.emitters.length >= 2) {
            let orbitAngle = timer * cfg.orbitSpeed;

            boss.emitters[0].setOrbitOffset(
                cfg.orbitRadius,
                cfg.orbitRadius,
                orbitAngle + PI,
            );

            boss.emitters[1].setOrbitOffset(
                cfg.orbitRadius,
                cfg.orbitRadius,
                orbitAngle,
            );
        }

        // Main spiral:
        // Reverse the spiral direction once at the configured time.
        if (timer === cfg.spiralReverseTime) {
            boss.emitter.spinDir *= -1;
        }

        // Main spiral:
        // Fire the boss-centered spiral repeatedly throughout the spell.
        doEvery(timer, cfg.spiralEvery, () => {
            boss.emitter.fireSpiralShot(cfg.spiralSpeed, cfg.spiralStepDeg, {
                type: "bubble",
                color: "purple",
            });
        });

        // Orbiter attack:
        // The side emitters periodically fire spread shots.
        doEvery(timer, cfg.orbiterSpreadEvery, () => {
            if (boss.emitters.length >= 2) {
                boss.emitters[0].emitter.fireSpread(
                    120,
                    cfg.orbiterSpreadArc,
                    cfg.orbiterSpreadCount,
                    cfg.orbiterSpreadSpeed,
                    {
                        type: "rice",
                        color: "blue",
                    },
                );

                boss.emitters[1].emitter.fireSpread(
                    60,
                    cfg.orbiterSpreadArc,
                    cfg.orbiterSpreadCount,
                    cfg.orbiterSpreadSpeed,
                    {
                        type: "rice",
                        color: "blue",
                    },
                );
            }
        });

        // Cycle attack:
        // Rotate between ring bursts, heart bullets that stop and split,
        // and random bursts that stop and split outward.
        runCycleActions(boss, timer, cfg, (step) => {
            if (step === 0) {
                // Ring burst:
                // Side emitters fire rings if present, otherwise the boss fires a fallback ring.
                if (boss.emitters.length >= 2) {
                    boss.emitters[0].emitter.fireRing(cfg.ringCount, cfg.ringSpeed, {
                        type: "medium",
                        color: "blue",
                    });

                    boss.emitters[1].emitter.fireRing(cfg.ringCount, cfg.ringSpeed, {
                        type: "medium",
                        color: "blue",
                    });
                } else {
                    boss.emitter.fireRing(cfg.fallbackRingCount, cfg.fallbackRingSpeed, {
                        type: "medium",
                        color: "blue",
                    });
                }
            } else if (step === 1) {
                // Heart attack:
                // Fire aimed heart bullets that stop, then split toward the player.
                boss.emitter.fireAimedSpread(
                    cfg.heartSpreadArc,
                    cfg.heartSpreadCount,
                    cfg.heartSpreadSpeed,
                    {
                        type: "heart",
                        color: "pink",
                        events: [
                            {
                                time: cfg.heartStopTime,
                                action: (b) => {
                                    b.speed = 0;
                                },
                            },
                            {
                                time: cfg.heartSplitTime,
                                action: (b) => {
                                    if (!b.player) return;

                                    let baseAngle = atan2(b.player.y - b.y, b.player.x - b.x);

                                    for (let i = 0; i < cfg.heartSplitCount; i++) {
                                        let angle = map(
                                            i,
                                            0,
                                            cfg.heartSplitCount - 1,
                                            baseAngle - cfg.heartSplitArc,
                                            baseAngle + cfg.heartSplitArc,
                                        );

                                        b.spawnBullet(b.x, b.y, angle, cfg.heartSplitSpeed, {
                                            type: "small",
                                            color: "white",
                                        });
                                    }

                                    b.kill();
                                },
                            },
                        ],
                    },
                );
            } else if (step === 2) {
                // Random burst:
                // Fire random bullets that stop, then split outward in a ring.
                boss.emitter.fireRandomBurst(
                    cfg.randomBurstCount,
                    cfg.randomBurstMinSpeed,
                    cfg.randomBurstMaxSpeed,
                    {
                        type: "bubble",
                        color: "cyan",
                        events: [
                            {
                                time: cfg.burstStopTime,
                                action: (b) => {
                                    b.speed = 0;
                                },
                            },
                            {
                                time: cfg.burstSplitTime,
                                action: (b) => {
                                    for (let i = 0; i < cfg.burstSplitCount; i++) {
                                        let angle = (TWO_PI * i) / cfg.burstSplitCount;

                                        b.spawnBullet(b.x, b.y, angle, cfg.burstSplitSpeed, {
                                            type: "small",
                                            color: "blue",
                                        });
                                    }

                                    b.kill();
                                },
                            },
                        ],
                    },
                );
            }
        });
    },

    // #endregion

    // #region Final Demo Spells

    finaldemo_nonspell1(boss, cfg, timer) {
        // Boss movement:
        // Random drifting movement across the upper playfield.
        boss.driftMove({
            distance: cfg.driftMoveDistance,
            speed: cfg.driftMoveSpeed,
            bounded: true,
            pauseMin: cfg.driftPauseMin,
            pauseMax: cfg.driftPauseMax,
        });

        // Attack:
        // Fire two aimed rings at the same time, one slightly faster than the other.
        doEvery(timer, cfg.ringEvery, () => {
            let aimAngleDeg = degrees(
                atan2(boss.player.y - boss.y, boss.player.x - boss.x),
            );

            boss.emitter.fireRingOffset(
                cfg.ringCount,
                cfg.ringSpeed1,
                aimAngleDeg,
                cfg.ringBulletData,
            );

            boss.emitter.fireRingOffset(
                cfg.ringCount,
                cfg.ringSpeed2,
                aimAngleDeg,
                cfg.ringBulletData,
            );
        });
    },

    finaldemo_spell1(boss, cfg, timer) {
        let cycleTimer = timer % cfg.cycle;

        // Movement:
        // After the sweep window ends, the boss repositions with a mild bias toward the player.
        if (cycleTimer >= cfg.fireWindow) {
            boss.laneBiasMove({
                speed: cfg.moveSpeed,
                pauseMin: cfg.pauseMin,
                pauseMax: cfg.pauseMax,
                playerBias: cfg.playerBias,
                xJitter: cfg.xJitter,
                yJitter: cfg.yJitter
            });
        }

        // Main attack:
        // A mirrored aimed sweep where one indexed bullet stays locked to the player.
        // Use heart bullets instead of bubbles.
        boss.emitter.fireTimedIndexedArcSweep({
            timer,
            cycle: cfg.cycle,
            fireWindow: cfg.fireWindow,
            shotInterval: cfg.shotInterval,
            arcWidthDeg: cfg.arcWidthDeg,
            speed: cfg.sweepSpeed,
            aimed: true,
            directionMode: cfg.directionMode,
            firstDirection: cfg.firstDirection,
            directionRepeat: cfg.directionRepeat,
            anchorMode: cfg.anchorMode,
            bulletData: {
                type: "heart",
                color: "pink"
            }
        });

        // Secondary attack:
        // Periodic aimed bubble spread layered over the sweep pattern.
        doEvery(timer, cfg.supportSpreadEvery, () => {
            boss.emitter.fireAimedSpread(
                cfg.supportSpreadArcDeg,
                cfg.supportSpreadCount,
                cfg.supportInitialSpeed,
                {
                    type: "bubble",
                    color: "blue",
                    events: [
                        makeSetSpeedEvent(
                            cfg.supportSlowTime,
                            cfg.supportSlowSpeed
                        )
                    ]
                }
            );
        });
    },

    finaldemo_nonspell2(boss, cfg, timer) {
        // Boss movement:
        // Random drifting movement across the upper playfield.
        boss.driftMove({
            distance: cfg.driftMoveDistance,
            speed: cfg.driftMoveSpeed,
            bounded: true,
            pauseMin: cfg.driftPauseMin,
            pauseMax: cfg.driftPauseMax,
        });

        // Attack:
        // Fire a 9-wide aimed spread 6 times per cycle in semi-rapid succession.
        runCycleActions(boss, timer, cfg, () => {
            boss.emitter.fireAimedSpread(
                cfg.spreadArc,
                cfg.spreadCount,
                cfg.spreadSpeed,
                cfg.spreadBulletData,
            );
        });
    },

    finaldemo_spell2(boss, cfg, timer) {
        // Boss movement:
        // Player-biased drifting movement
        boss.laneBiasMove({
            speed: cfg.moveSpeed,
            pauseMin: cfg.movePauseMin,
            pauseMax: cfg.movePauseMax,
            playerBias: cfg.playerBias,
            xJitter: cfg.xJitter,
            yJitter: cfg.yJitter,
        });

        // Boss support attack:
        // The boss fires two quick ring bursts each cycle.
        let cycleTimer = timer % cfg.supportRingCycle;
        let waveIndex = floor(timer / cfg.supportRingCycle);
        let rotationDir = waveIndex % 2 === 0 ? 1 : -1;

        onPatternStart(timer, () => {
            familiars = [];
            boss.familiarsInFormation = false;
            boss.familiarOrbitHoldStart = -1;
            boss.familiarAttack1Active = false;
            boss.familiarSpawnFinished = false;
            boss.familiarFormationSettled = false;
        });

        // Shared orbit phase:
        // All orbiting familiars use the same base angle so they stay evenly spaced.
        let orbitBaseAngle = timer * cfg.familiarOrbitSpeed;

        // Familiar spawn:
        // Spawn one familiar at a time from the boss center.
        // Each new familiar starts orbiting once the previous one has expanded outward enough.
        if (!boss.familiarSpawnFinished && familiars.length < cfg.familiarCount) {
            let canSpawnNext = false;

            if (familiars.length === 0) {
                canSpawnNext = true;
            } else {
                let lastFamiliar = familiars[familiars.length - 1];
                canSpawnNext =
                    lastFamiliar.mode === "orbit" &&
                    abs(lastFamiliar.orbitRadiusX - lastFamiliar.orbitTargetRadiusX) < 2;
            }

            if (canSpawnNext) {
                let index = familiars.length;

                let familiar = new FamiliarEnemy(
                    boss.x,
                    boss.y,
                    boss.bullets,
                    boss.player,
                    emitterImg
                );

                familiar.hp = cfg.familiarHp;
                familiar.maxHp = cfg.familiarHp;

                let angleStep = TWO_PI / cfg.familiarCount;
                let orbitOffsetAngle = -HALF_PI - index * angleStep;

                familiar.startOrbit(
                    boss,
                    orbitBaseAngle,
                    orbitOffsetAngle,
                    cfg.familiarOrbitRadius,
                    cfg.familiarOrbitRadius,
                    cfg.familiarOrbitSpeed,
                );

                familiars.push(familiar);

                if (familiars.length >= cfg.familiarCount) {
                    boss.familiarSpawnFinished = true;
                }
            }
        }

        // Keep all orbiting familiars locked to the same shared orbit phase.
        for (let familiar of familiars) {
            if (familiar.mode === "orbit") {
                familiar.setOrbitBaseAngle(orbitBaseAngle);
            }
        }

        // Orbit hold:
        // Once all familiars are spawned and orbiting, keep them circling for a short time.
        if (
            familiars.length === cfg.familiarCount &&
            boss.familiarOrbitHoldStart < 0
        ) {
            let allOrbiting = true;

            for (let familiar of familiars) {
                if (familiar.mode !== "orbit") {
                    allOrbiting = false;
                    break;
                }
            }

            if (allOrbiting) {
                boss.familiarOrbitHoldStart = timer;
            }
        }

        // Familiar formation:
        // After a short orbit hold, move familiars into two centered rows in front of the boss.
        if (
            !boss.familiarsInFormation &&
            boss.familiarOrbitHoldStart >= 0 &&
            timer >= boss.familiarOrbitHoldStart + cfg.familiarOrbitHoldTime
        ) {
            boss.familiarsInFormation = true;

            let backRowXs = getCenteredRowOffsets(
                cfg.familiarBackRowCount,
                cfg.familiarBackRowSpacing,
            );

            let frontRowXs = getCenteredRowOffsets(
                cfg.familiarFrontRowCount,
                cfg.familiarFrontRowSpacing,
            );

            for (let i = 0; i < familiars.length; i++) {
                let familiar = familiars[i];
                familiar.stopOrbit();

                if (i < cfg.familiarBackRowCount) {
                    familiar.moveToRelativeTarget(
                        boss,
                        backRowXs[i],
                        cfg.familiarBackRowY,
                        cfg.familiarFormationMoveSpeed,
                        false,
                        true,
                    );
                } else {
                    let frontIndex = i - cfg.familiarBackRowCount;

                    familiar.moveToRelativeTarget(
                        boss,
                        frontRowXs[frontIndex],
                        cfg.familiarFrontRowY,
                        cfg.familiarFormationMoveSpeed,
                        false,
                        true,
                    );
                }
            }
        }

        // Familiar formation settle:
        // Once all active familiars have reached their formation targets, enable attack 1.
        if (boss.familiarsInFormation && !boss.familiarFormationSettled) {
            let allSettled = true;

            for (let familiar of familiars) {
                if (!familiar.active) continue;

                if (familiar.mode !== "target" || familiar.restTimer <= 0) {
                    allSettled = false;
                    break;
                }
            }

            if (allSettled) {
                boss.familiarFormationSettled = true;
                boss.familiarAttack1Active = true;
            }
        }

        // Familiar attack 1:
        // Once familiars are in formation, each familiar fires a staggered 3x3 grouped aimed spread.
        if (boss.familiarAttack1Active) {
            for (let i = 0; i < familiars.length; i++) {
                let familiar = familiars[i];
                if (!familiar.active) continue;

                let fireTimer = timer - i * cfg.familiarAttack1Stagger;

                if (fireTimer >= 0 && fireTimer % cfg.familiarAttack1Every === 0) {
                    fireNestedAimedSpread(
                        familiar,
                        boss.player,
                        cfg.familiarOuterSpreadArc,
                        cfg.familiarOuterSpreadCount,
                        cfg.familiarInnerSpreadArc,
                        cfg.familiarInnerSpreadCount,
                        cfg.familiarBulletInitialSpeed,
                        {
                            type: "small",
                            color: "blue",
                            events: [
                                makeSetSpeedEvent(
                                    cfg.familiarBulletSlowTime,
                                    cfg.familiarBulletSlowSpeed,
                                ),
                            ],
                        },
                    );
                }
            }
        }

        if (cycleTimer === 0) {
            // First ring
            boss.emitter.fireRingOffset(
                cfg.supportRingCount,
                cfg.supportRingInitialSpeed,
                boss.emitter.baseAngleDeg,
                {
                    type: "rice",
                    color: "yellow",
                    events: [
                        makeSetSpeedEvent(
                            cfg.supportRingSlowTime,
                            cfg.supportRingSlowSpeed1,
                        ),
                    ],
                },
            );
        }

        if (cycleTimer === cfg.supportRingGap) {
            // Second ring
            boss.emitter.fireRingOffset(
                cfg.supportRingCount,
                cfg.supportRingInitialSpeed,
                boss.emitter.baseAngleDeg + 12 * rotationDir,
                {
                    type: "rice",
                    color: "yellow",
                    events: [
                        makeSetSpeedEvent(
                            cfg.supportRingSlowTime,
                            cfg.supportRingSlowSpeed2,
                        ),
                    ],
                },
            );

            // Shift the whole ring pattern for the next wave
            boss.emitter.rotateBaseAngle(12 * rotationDir);
        }

        // Familiar attack will go here later
    },

    finaldemo_spell3(boss, cfg, timer) {
        // Startup:
        // All emitters spawn at the boss, then deploy to their own staging positions.
        onPatternStart(timer, () => {
            boss.emitters = [];
            boss.verticalWallsStarted = false;
            boss.verticalWallsFinished = false;
            boss.horizontalWallsStarted = false;

            // 0 = top vertical-shooting wall emitter
            let topEmitter = new VisualEmitter(
                boss.x,
                boss.y,
                boss.bullets,
                boss.player,
                emitterImg,
            );

            // 1 = bottom vertical-shooting wall emitter
            let bottomEmitter = new VisualEmitter(
                boss.x,
                boss.y,
                boss.bullets,
                boss.player,
                emitterImg,
            );

            // 2 = left horizontal-shooting wall emitter
            let leftEmitter = new VisualEmitter(
                boss.x,
                boss.y,
                boss.bullets,
                boss.player,
                emitterImg,
            );

            // 3 = right horizontal-shooting wall emitter
            let rightEmitter = new VisualEmitter(
                boss.x,
                boss.y,
                boss.bullets,
                boss.player,
                emitterImg,
            );

            // Top/bottom emitters deploy first to the top and bottom edges
            topEmitter.setTarget(
                cfg.verticalTopStartX,
                cfg.verticalTopY,
                cfg.emitterDeploySpeed,
                false,
                false,
            );

            bottomEmitter.setTarget(
                cfg.verticalBottomStartX,
                cfg.verticalBottomY,
                cfg.emitterDeploySpeed,
                false,
                false,
            );

            // Left/right emitters deploy to offscreen staging points for later
            leftEmitter.setTarget(
                cfg.horizontalLeftX,
                cfg.horizontalLeftStartY,
                cfg.emitterDeploySpeed,
                false,
                false,
            );

            rightEmitter.setTarget(
                cfg.horizontalRightX,
                cfg.horizontalRightStartY,
                cfg.emitterDeploySpeed,
                false,
                false,
            );

            boss.emitters.push(topEmitter, bottomEmitter, leftEmitter, rightEmitter);
        });

        if (boss.emitters.length < 4) return;

        let topEmitter = boss.emitters[0];
        let bottomEmitter = boss.emitters[1];
        let leftEmitter = boss.emitters[2];
        let rightEmitter = boss.emitters[3];

        // Start the vertically-shooting walls first once they reach the top/bottom edges.
        if (
            !boss.verticalWallsStarted &&
            abs(topEmitter.x - cfg.verticalTopStartX) < 1 &&
            abs(topEmitter.y - cfg.verticalTopY) < 1 &&
            abs(bottomEmitter.x - cfg.verticalBottomStartX) < 1 &&
            abs(bottomEmitter.y - cfg.verticalBottomY) < 1
        ) {
            boss.verticalWallsStarted = true;

            // top wall: fires down, moves left along top edge
            topEmitter.setTarget(
                cfg.verticalTopTargetX,
                cfg.verticalTopY,
                cfg.boundaryMoveSpeed,
                false,
                false,
            );

            // bottom wall: fires up, moves right along bottom edge
            bottomEmitter.setTarget(
                cfg.verticalBottomTargetX,
                cfg.verticalBottomY,
                cfg.boundaryMoveSpeed,
                false,
                false,
            );
        }

        // Mark first phase finished once both top/bottom emitters reach final positions.
        if (
            boss.verticalWallsStarted &&
            !boss.verticalWallsFinished &&
            abs(topEmitter.x - cfg.verticalTopTargetX) < 1 &&
            abs(bottomEmitter.x - cfg.verticalBottomTargetX) < 1
        ) {
            boss.verticalWallsFinished = true;
        }

        // Only after the vertical phase finishes do the horizontal walls begin closing.
        if (
            boss.verticalWallsFinished &&
            !boss.horizontalWallsStarted &&
            abs(leftEmitter.x - cfg.horizontalLeftX) < 1 &&
            abs(leftEmitter.y - cfg.horizontalLeftStartY) < 1 &&
            abs(rightEmitter.x - cfg.horizontalRightX) < 1 &&
            abs(rightEmitter.y - cfg.horizontalRightStartY) < 1
        ) {
            boss.horizontalWallsStarted = true;

            // left wall: fires right, moves down along left edge
            leftEmitter.setTarget(
                cfg.horizontalLeftX,
                cfg.horizontalLeftTargetY,
                cfg.boundaryMoveSpeed,
                false,
                false,
            );

            // right wall: fires left, moves up along right edge
            rightEmitter.setTarget(
                cfg.horizontalRightX,
                cfg.horizontalRightTargetY,
                cfg.boundaryMoveSpeed,
                false,
                false,
            );
        }

        // Vertically-shooting walls fire first.
        if (boss.verticalWallsStarted) {
            doEvery(timer, cfg.boundaryStreamEvery, () => {
                // Top wall -> down
                topEmitter.emitter.spawnBullet(
                    topEmitter.x,
                    topEmitter.y,
                    radians(90),
                    cfg.boundaryBulletSpeed,
                    cfg.boundaryBulletData,
                );

                // Bottom wall -> up
                bottomEmitter.emitter.spawnBullet(
                    bottomEmitter.x,
                    bottomEmitter.y,
                    radians(270),
                    cfg.boundaryBulletSpeed,
                    cfg.boundaryBulletData,
                );
            });
        }

        // Horizontally-shooting walls fire after the first phase finishes.
        if (boss.horizontalWallsStarted) {
            doEvery(timer, cfg.boundaryStreamEvery, () => {
                // Left wall -> right
                leftEmitter.emitter.spawnBullet(
                    leftEmitter.x,
                    leftEmitter.y,
                    radians(0),
                    cfg.boundaryBulletSpeed,
                    cfg.boundaryBulletData,
                );

                // Right wall -> left
                rightEmitter.emitter.spawnBullet(
                    rightEmitter.x,
                    rightEmitter.y,
                    radians(180),
                    cfg.boundaryBulletSpeed,
                    cfg.boundaryBulletData,
                );
            });
        }

        // Boss intrusion attack:
        // Hearts originate from the boss and head toward random points outside the final safe area,
        // traveling far enough to burst even behind the player.
        doEvery(timer, cfg.heartVolleyEvery, () => {
            for (let i = 0; i < cfg.heartVolleyCount; i++) {
                let targetPoint = getRandomPointNearBoundaryOutside(
                    cfg.verticalBottomTargetX,
                    cfg.verticalTopTargetX,
                    cfg.horizontalLeftTargetY,
                    cfg.horizontalRightTargetY,
                    90,
                );

                let angle = atan2(targetPoint.y - boss.y, targetPoint.x - boss.x);

                boss.emitter.spawnBullet(
                    boss.x,
                    boss.y,
                    angle,
                    cfg.heartInitialSpeed,
                    {
                        type: "heart",
                        color: "pink",
                        events: [
                            makeSetSpeedEvent(cfg.heartSlowTime, cfg.heartSlowSpeed),
                            makeDirectionalRandomBurstEvent(
                                cfg.heartBurstTime,
                                cfg.heartBurstDirections,
                                cfg.heartBurstCountPerDirection,
                                cfg.heartBurstArcPerDirection,
                                cfg.heartBurstSpeed,
                                cfg.heartBurstBulletData,
                            ),
                        ],
                    },
                );
            }
        });
    },

    // #endregion

};