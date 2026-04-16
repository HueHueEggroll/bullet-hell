const patternConfigs = {
    demo_nonspell1: {
        actionInterval: 24,
        actionsPerCycle: 3,
        cyclePauseFrames: 70,

        ringCount: 12,
        ringSpeed: 2.3,
        ringRotationStep: 12,

        spreadArc: 28,
        spreadCount: 3,
        spreadSpeed: 4.8,
    },

    demo_spell1: {
        driftDistance: 55,
        driftSpeed: 2.4,
        driftPauseMin: 120,
        driftPauseMax: 180,

        actionInterval: 26,
        actionsPerCycle: 3,
        cyclePauseFrames: 75,

        aimedSpreadArc: 42,
        aimedSpreadCount: 5,
        aimedSpreadSpeed: 4.2,

        ringCount: 10,
        ringSpeed: 2.1,
        ringRotationStep: 18,

        spreadAngle: 90,
        spreadArc: 65,
        spreadCount: 6,
        spreadSpeed: 2.8,
    },

    demo_nonspell2: {
        cycle: 180,
        fireWindow: 96,
        shotInterval: 4,
        arcWidthDeg: 110,
        sweepSpeed: 2.25,

        directionMode: "alternate",
        firstDirection: "rtl",
        directionRepeat: 1,

        anchorMode: "late",

        supportSpreadEvery: 72,
        supportSpreadArcDeg: 32,
        supportSpreadCount: 4,
        supportSpreadSpeed: 4.6,

        moveSpeed: 2.35,
        pauseMin: 85,
        pauseMax: 135,
        playerBias: 0.35,
        xJitter: 20,
        yJitter: 12,
    },

    demo_spell2: {
        pathSpeed: 2.6,
        defaultPause: 20,
        loopPath: true,

        pathPoints: [
            { xRatio: 0.25, y: 100, pause: 15, speed: 2.6 },
            { xRatio: 0.5, y: 75, pause: 15, speed: 2.6 },
            { xRatio: 0.75, y: 100, pause: 15, speed: 2.6 },
            { xRatio: 0.5, y: 90, pause: 48, speed: 1.8 },
        ],

        centerLingerIndex: 3,

        centerRingEvery: 26,
        centerRingCount: 10,
        centerRingSpeed: 2.9,

        centerSpreadEvery: 52,
        centerSpreadAngle: 90,
        centerSpreadArc: 70,
        centerSpreadCount: 7,
        centerSpreadSpeed: 3.0,

        moveSpreadEvery: 34,
        moveSpreadAngle: 90,
        moveSpreadArc: 90,
        moveSpreadCount: 7,
        moveSpreadSpeed: 3.3,

        burstEvery: 68,
        burstCount: 12,
        burstMinSpeed: 1.2,
        burstMaxSpeed: 2.3,

        transformStopTime: 40,
        transformSplitTime: 80,
        transformSplitCount: 4,
        transformSplitArc: 0.35,
        transformSplitSpeed: 3.5,
    },

    demo_spell3: {
        orbitSpeed: 0.04,
        orbitRadius: 60,
        orbitEnabled: false,

        spiralEvery: 4,
        spiralSpeed: 2.2,
        spiralStepDeg: 11,
        spiralReverseTime: 240,

        orbiterSpreadEvery: 10,
        orbiterSpreadArc: 22,
        orbiterSpreadCount: 3,
        orbiterSpreadSpeed: 2.8,

        actionInterval: 40,
        actionsPerCycle: 3,
        cyclePauseFrames: 95,

        ringCount: 8,
        ringSpeed: 2.1,

        fallbackRingCount: 12,
        fallbackRingSpeed: 2.0,

        heartSpreadArc: 42,
        heartSpreadCount: 5,
        heartSpreadSpeed: 2.4,
        heartStopTime: 65,
        heartSplitTime: 105,
        heartSplitCount: 8,
        heartSplitArc: 0.6,
        heartSplitSpeed: 3.2,

        randomBurstCount: 16,
        randomBurstMinSpeed: 1.0,
        randomBurstMaxSpeed: 2.1,
        burstStopTime: 35,
        burstSplitTime: 75,
        burstSplitCount: 6,
        burstSplitSpeed: 2.8,
    },

    finaldemo_nonspell1: {
        // Movement
        driftDistance: 80,
driftSpeed: 2.6,
driftPauseMin: 40,
driftPauseMax: 70,

        // Two simultaneous aimed rings
        ringEvery: 70,
        ringCount: 48,

        ringSpeed1: 3.0,
        ringSpeed2: 3.4,

        ringBulletData: {
            type: "heart",
            color: "pink",
        },
    },

    finaldemo_spell1: {
        cycle: 120,
        fireWindow: 72,
        shotInterval: 3,

        arcWidthDeg: 120,
        sweepSpeed: 2.8,

        directionMode: "alternate",
        firstDirection: 1,
        directionRepeat: 1,
        anchorMode: "center",

        supportSpreadEvery: 135,
        supportSpreadArcDeg: 64,
        supportSpreadCount: 9,
        supportInitialSpeed: 3.6,
        supportSlowTime: 14,
        supportSlowSpeed: 1.6,

        moveSpeed: 2.3,
        pauseMin: 90,
        pauseMax: 130,
        playerBias: 0.35,
        xJitter: 20,
        yJitter: 10,
    },

    finaldemo_nonspell2: {
        // Movement
        driftMoveDistance: 48,
        driftMoveSpeed: 2.2,
        driftPauseMin: 90,
        driftPauseMax: 135,

        // 9-wide aimed spread, 6 shots per cycle
        actionInterval: 20,
        actionsPerCycle: 6,
        cyclePauseFrames: 75,

        spreadArc: 70,
        spreadCount: 9,
        spreadSpeed: 2.9,

        spreadBulletData: {
            type: "bubble",
            color: "blue",
        },
    },

    finaldemo_spell2: {
        // Boss support rings
        supportRingCycle: 150,
        supportRingGap: 20,

        supportRingCount: 72,
        supportRingInitialSpeed: 5.5,
        supportRingSlowTime: 18,
        supportRingSlowSpeed1: 2.0,
        supportRingSlowSpeed2: 2.4,

        familiarCount: 8,
        familiarHp: 120,
        familiarSpawnInterval: 12,
        familiarOrbitRadius: 70,
        familiarOrbitSpeed: 0.05,
        familiarOrbitHoldTime: 45,
        familiarSpawnMoveSpeed: 4.2,

        familiarFormationY: 110,
        familiarFormationSpacing: 42,

        familiarFormationStartTime: 150,
        familiarFormationMoveSpeed: 3.2,

        familiarBackRowCount: 4,
        familiarBackRowY: 110,
        familiarBackRowSpacing: 150,

        familiarFrontRowCount: 4,
        familiarFrontRowY: 190,
        familiarFrontRowSpacing: 100,

        // Familiar attack 1
        familiarAttack1Every: 210,
        familiarAttack1Stagger: 30,

        familiarOuterSpreadArc: 60,
        familiarOuterSpreadCount: 3,

        familiarInnerSpreadArc: 5,
        familiarInnerSpreadCount: 3,

        familiarBulletInitialSpeed: 4.2,
        familiarBulletSlowTime: 16,
        familiarBulletSlowSpeed: 3.0,
    },

    finaldemo_spell3: {
        // Movement (player-biased drift)
        moveSpeed: 2.3,
        movePauseMin: 90,
        movePauseMax: 140,

        playerBias: 0.4,
        xJitter: 25,
        yJitter: 10,

        // Vertically-shooting walls (top and bottom edges)
        verticalTopStartX: GAME_LAYOUT.playfieldX + GAME_LAYOUT.playfieldW,
        verticalTopY: GAME_LAYOUT.playfieldY,

        verticalBottomStartX: GAME_LAYOUT.playfieldX,
        verticalBottomY: GAME_LAYOUT.playfieldY + GAME_LAYOUT.playfieldH,

        verticalTopTargetX: GAME_LAYOUT.playfieldX + GAME_LAYOUT.playfieldW - 140,
        verticalBottomTargetX: GAME_LAYOUT.playfieldX + 140,

        // Horizontally-shooting walls (left and right sides) start offscreen later
        horizontalLeftX: GAME_LAYOUT.playfieldX,
        horizontalLeftStartY: GAME_LAYOUT.playfieldY - 40,

        horizontalRightX: GAME_LAYOUT.playfieldX + GAME_LAYOUT.playfieldW,
        horizontalRightStartY: GAME_LAYOUT.playfieldY + GAME_LAYOUT.playfieldH + 40,

        horizontalLeftTargetY: GAME_LAYOUT.playfieldY + 260,
        horizontalRightTargetY: GAME_LAYOUT.playfieldY + 520,

        emitterDeploySpeed: 6.0,
        boundaryMoveSpeed: 0.35,

        boundaryStreamEvery: 6,
        boundaryBulletSpeed: 2.5,

        boundaryBulletData: {
            type: "medium",
            color: "blue",
        },

        // Boss heart intrusion
        heartVolleyEvery: 90,
        heartVolleyCount: 3,

        heartInitialSpeed: 6.2,
        heartSlowTime: 38,
        heartSlowSpeed: 1.0,

        heartBurstTime: 56,
        heartBurstDirections: 5,
        heartBurstCountPerDirection: 3,
        heartBurstArcPerDirection: 10,
        heartBurstSpeed: 2.5,

        heartBurstBulletData: {
            type: "small",
            color: "pink",
        },
    },
};