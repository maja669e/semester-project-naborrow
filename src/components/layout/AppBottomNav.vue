<script>
// Fast bundnavigation der bruges på alle hovedsider (Hjem, Udforsk, Mine ting).
// items-prop'en gør det muligt for enhver visning at angive sine egne faner
// uden at ændre denne komponent. Standardværdien matcher de fire app-faner.
export default {
  name: "AppBottomNav",

  props: {
    // Nøglen (key) på den fane der skal fremstå som valgt
    activePage: { type: String, default: "" },

    // Array af faneobjekter. Hvert objekt skal indeholde:
    //   key        {String}  – sideidentifikator der udsendes ved klik
    //   label      {String}  – synlig tekstlabel under ikonet
    //   icon       {String}  – MDI-ikon vist når fanen er inaktiv
    //   activeIcon {String}  – MDI-ikon vist når fanen er aktiv
    //   disabled   {Boolean} – valgfrit, forhindrer klik og dæmper fanen
    items: {
      type: Array,
      default: () => [
        { key: "home",         label: "Hjem",      icon: "mdi-home-outline",             activeIcon: "mdi-home" },
        { key: "homepage",     label: "Udforsk",   icon: "mdi-compass-outline",          activeIcon: "mdi-compass" },
        { key: "itemOverview", label: "Mine ting", icon: "mdi-tag-outline",              activeIcon: "mdi-tag" },
        // "Beskeder" er endnu ikke implementeret – deaktiveret indtil chatflowet er færdigt
        { key: "beskeder",     label: "Beskeder",  icon: "mdi-chat-outline",             activeIcon: "mdi-chat", disabled: true },
        { key: "profil",       label: "Profil",    icon: "mdi-account-circle-outline",   activeIcon: "mdi-account-circle" },
      ],
    },
  },

  emits: ["navigate"],
};
</script>

<template>
  <!-- Primær navigationslandmark – skærmlæsere annoncerer dette som navigation -->
  <nav class="bundnav" aria-label="Primær navigation">

    <!-- Én knap per fane; deaktiverede faner kan fokuseres men er ikke-interaktive -->
    <button
      v-for="item in items"
      :key="item.key"
      class="bundnav__element"
      :class="{
        'bundnav__element--aktiv':      activePage === item.key,
        'bundnav__element--deaktiveret': item.disabled,
      }"
      :disabled="item.disabled || false"
      :aria-current="activePage === item.key ? 'page' : undefined"
      @click="!item.disabled && $emit('navigate', item.key)"
    >
      <!-- Skift mellem fyldt og omrids-ikon baseret på aktiv tilstand -->
      <v-icon size="24" :icon="activePage === item.key ? item.activeIcon : item.icon" />
      <span class="bundnav__label">{{ item.label }}</span>
    </button>

  </nav>
</template>

<style scoped>
/* ─── Navbaren ───────────────────────────────────────────── */
/* Fast placeret i bunden så den overlapper sideindholdet.
   z-index 100 holder den over normalt indhold men under modaler (z > 100). */
.bundnav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: stretch;
  z-index: 100;
  /* Respekter iPhone-hjemindikatoren så knapper ikke skjules */
  padding-bottom: env(safe-area-inset-bottom);
}

/* ─── Enkelt faneknap ────────────────────────────────────── */
/* min-height: 44px opfylder WCAG 2.5.5 trykfladekravet */
.bundnav__element {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-secondary);
  min-height: 44px;
}

.bundnav__element:hover:not(:disabled) {
  background: rgba(44, 59, 30, 0.06);
}
.bundnav__element:active:not(:disabled) {
  background: rgba(44, 59, 30, 0.12);
}

/* Fokusring – vises kun ved tastaturnavigation, ikke ved mus */
.bundnav__element:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: -3px;
  border-radius: var(--radius-md);
}

/* ─── Labeltekst ─────────────────────────────────────────── */
.bundnav__label {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 500;
}

/* ─── Aktiv tilstand ─────────────────────────────────────── */
.bundnav__element--aktiv {
  color: var(--color-primary);
}

.bundnav__element--aktiv .bundnav__label {
  font-weight: 700;
}

/* ─── Deaktiveret tilstand ───────────────────────────────── */
/* Reduceret gennemsigtighed signalerer at fanen ikke er tilgængelig endnu */
.bundnav__element--deaktiveret {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>
