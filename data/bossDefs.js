const bossDefs = {
  demoBoss: {
    name: "Demo Boss",
    drawWidth: 100,
    drawHeight: 120,
    contactRadius: 32,

    deathSlowmo: {
      enabled: true,
      duration: 90,
      scale: 0.35,
    },

    lives: [
      {
        nonspell: "demo_nonspell1",
        spell: "demo_spell1",
        nonspellHpMax: 180,
        spellHpMax: 420,
        nonspellTime: 45,
        spellTime: 60,
        nonspellY: 100,
        spellY: 100,
      },
      {
        nonspell: "demo_nonspell2",
        spell: "demo_spell2",
        nonspellHpMax: 180,
        spellHpMax: 420,
        nonspellTime: 40,
        spellTime: 75,
        nonspellY: 90,
        spellY: 100,
      },
      {
        nonspell: null,
        spell: "demo_spell3",
        nonspellHpMax: 0,
        spellHpMax: 520,
        nonspellTime: 0,
        spellTime: 90,
        nonspellY: 90,
        spellY: 100,
      },
    ],
  },

  finalDemoBoss: {
    name: "Final Demo Boss",
    drawHeight: 140,
    drawWidth: 89,
    contactRadius: 26,

    deathSlowmo: {
      enabled: true,
      duration: 90,
      scale: 0.35,
    },

    lives: [
      {
        nonspell: "finaldemo_nonspell1",
        spell: "finaldemo_spell1",
        nonspellHpMax: 480,
        spellHpMax: 720,
        nonspellTime: 30,
        spellTime: 90,
        nonspellY: 100,
        spellY: 100,
      },

      {
        nonspell: "finaldemo_nonspell2",
        spell: "finaldemo_spell2",
        nonspellHpMax: 480,
        spellHpMax: 720,
        nonspellTime: 30,
        spellTime: 90,
        nonspellY: 90,
        spellY: 100,
      },

      {
        nonspell: null,
        spell: "finaldemo_spell3",
        nonspellHpMax: 0,
        spellHpMax: 720,
        nonspellTime: 0,
        spellTime: 90,
        nonspellY: 90,
        spellY: 100,
      }
    ]
  },
};