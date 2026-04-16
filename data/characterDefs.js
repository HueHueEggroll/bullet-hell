const characterDefs = {
  reimuB: {
    name: "Reimu B",

    fullSpeed: 5,
    slowSpeed: 2,

    hitboxRadius: 8,
    grazeRadius: 16,

    shotInterval: 6,
    focusShotInterval: 4,

    bombCapacity: 3,
    deathbombFrames: 15,

    spreadShot: {
      bullets: [
        { offsetX: -18, offsetY: 0, angleDeg: -14, speed: 10 },
        { offsetX: -7, offsetY: 0, angleDeg: 0, speed: 10 },
        { offsetX: 7, offsetY: 0, angleDeg: 0, speed: 10 },
        { offsetX: 18, offsetY: 0, angleDeg: 14, speed: 10 },
      ],
    },

    focusShot: {
      bullets: [
        { offsetX: -16, offsetY: 0, angleDeg: 0, speed: 11 },
        { offsetX: -6, offsetY: 0, angleDeg: 0, speed: 11 },
        { offsetX: 6, offsetY: 0, angleDeg: 0, speed: 11 },
        { offsetX: 16, offsetY: 0, angleDeg: 0, speed: 11 },
      ],
    },

    bombType: "evilSealingCircle",
  },
};