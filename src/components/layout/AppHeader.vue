<script>
// Genanvendelig topheader til alle sider.
// Venstre side viser en tilbage-knap når showBack er true, ellers en usynlig spacer.
// Højre side viser en handlingsknap når actionIcon er angivet, ellers en matchende spacer,
// så titlen altid forbliver centreret.
export default {
  name: "AppHeader",

  props: {
    // Tekst vist i midten af headeren
    title: { type: String, default: "" },

    // Viser en tilbage-knap i venstre side når true
    showBack: { type: Boolean, default: false },

    // MDI-ikon til en valgfri handlingsknap i højre side (fx "mdi-pencil").
    // Når null vises en spacer i stedet.
    actionIcon: { type: String, default: null },

    // Tilgængeligt navn til handlingsknappen – skal udfyldes når actionIcon er angivet
    actionLabel: { type: String, default: "" },
  },

  emits: [
    "back",   // Udsendes når brugeren trykker på tilbage-knappen
    "action", // Udsendes når brugeren trykker på handlingsknappen
  ],
};
</script>

<template>
  <!-- Sidebanner-landmark – skærmlæsere annoncerer dette som "banner" -->
  <header class="app-header" role="banner">

    <!-- Venstre: tilbage-knap emitter "back" — forælderen beslutter navigation -->
    <button
      v-if="showBack"
      class="app-header__tilbage"
      aria-label="Gå tilbage"
      @click="$emit('back')"
    >
      <v-icon size="22">mdi-chevron-left</v-icon>
    </button>
    <div v-else class="app-header__spacer" aria-hidden="true"></div>

    <!-- Midten: sidens titel -->
    <span class="app-header__titel">{{ title }}</span>

    <!-- Højre: valgfri handlingsknap eller matchende spacer -->
    <button
      v-if="actionIcon"
      class="app-header__handling"
      :aria-label="actionLabel"
      @click="$emit('action')"
    >
      <v-icon size="22">{{ actionIcon }}</v-icon>
    </button>
    <div v-else class="app-header__spacer" aria-hidden="true"></div>

  </header>
</template>

<style scoped>
/* ─── Header-container ───────────────────────────────────── */
/* space-between placerer venstre slot, titlen og højre slot jævnt.
   De ensartede spacere holder titlen visuelt centreret.
   Højde på 64px giver 21px luft over og under 22px-titlen. */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 var(--space-4);
  background: transparent;
}

/* ─── Sidetitel ──────────────────────────────────────────── */
.app-header__titel {
  font-family: var(--font-display);
  font-size: var(--text-h2);
  font-weight: 600;
  color: var(--color-neutral);
}

/* ─── Tilbage-knap (venstre) ─────────────────────────────── */
/* 44×44 px trykflade opfylder WCAG 2.5.5 Success Criterion */
.app-header__tilbage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: transparent;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  color: var(--color-neutral);
}

.app-header__tilbage:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

/* ─── Handlingsknap (højre) ──────────────────────────────── */
/* Samme dimensioner som tilbage-knappen, så titlen forbliver centreret */
.app-header__handling {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: transparent;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  color: var(--color-neutral);
}

.app-header__handling:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

/* ─── Spacer ─────────────────────────────────────────────── */
/* Matcher knapbredden (44px) så titlen forbliver centreret,
   når der ikke vises en knap på den pågældende side */
.app-header__spacer {
  width: 44px;
}
</style>
