<script>
// Klikbar kort-komponent der viser et resumé af én genstand.
// Bruges i ItemOverviewView til at liste alle genstande.
// Udsender cardClicked med genstandens id når brugeren klikker eller
// trykker Enter/Mellemrum, så tastaturbrugere har fuld adgang.
export default {
  name: "ItemCard",

  props: {
    id:       { type: Number, required: true },
    title:    { type: String, required: true },
    category: { type: String, required: true },
    // Mærke er valgfrit – vises kun hvis det er angivet
    brand:    { type: String, default: null },
    status:   { type: String, required: true },
    image:    { type: String, required: true },
  },

  computed: {
    // Oversætter status-tekst til en CSS-modifikatorklasse for farvekodning
    statusClass() {
      if (this.status === "Tilgængelig") return "status-tilgaengelig";
      if (this.status === "Udlånt")      return "status-udlaant";
      if (this.status === "Inaktiv")     return "status-inaktiv";
      return "";
    },
  },

  methods: {
    // Sender klik-hændelsen op til forælderen med genstandens id
    handleClick() {
      this.$emit("cardClicked", this.id);
    },
  },

  emits: ["cardClicked"],
};
</script>

<template>
  <!-- article er semantisk korrekt: kortet repræsenterer en selvstændig indholdspost.
       role="button" + tabindex gør det tilgængeligt for tastaturbrugere. -->
  <article
    class="kort"
    role="button"
    tabindex="0"
    :aria-label="`${title} — ${status}`"
    @click="handleClick"
    @keydown.enter.prevent="handleClick"
    @keydown.space.prevent="handleClick"
  >

    <!-- Miniaturebillede af genstanden -->
    <img :src="image" :alt="`Billede af ${title}`" class="kort__billede" />

    <!-- Tekstindhold: titel, statusmærke og metadata -->
    <div class="kort__indhold">

      <!-- Øverste række: titel til venstre, status til højre -->
      <div class="kort__top">
        <h2 class="kort__titel">{{ title }}</h2>
        <span class="kort__status" :class="statusClass">{{ status }}</span>
      </div>

      <!-- Metadata: kategori og eventuelt mærke -->
      <p class="kort__meta">
        {{ category }}
        <span v-if="brand"> · {{ brand }}</span>
      </p>

    </div>
  </article>
</template>

<style scoped>
/* ─── Kortcontainer ──────────────────────────────────────── */
.kort {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
  width: 100%;
  cursor: pointer;
}

/* Fokusring – vises kun ved tastaturnavigation */
.kort:focus-visible {
  outline: 3px solid var(--color-neutral);
  outline-offset: 3px;
}

/* ─── Miniaturebillede ───────────────────────────────────── */
/* flex-shrink: 0 forhindrer billedet i at krympe ved lang titel */
.kort__billede {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-md);
  object-fit: cover;
  flex-shrink: 0;
}

/* ─── Tekstområde ────────────────────────────────────────── */
.kort__indhold {
  flex: 1;
}

/* ─── Titelrække ─────────────────────────────────────────── */
.kort__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.kort__titel {
  font-family: var(--font-body);
  font-size: var(--text-body);
  font-weight: 600;
  color: var(--color-neutral);
  margin: 0;
}

/* ─── Metadata-tekst ─────────────────────────────────────── */
.kort__meta {
  font-family: var(--font-body);
  font-size: var(--text-label);
  color: var(--color-secondary);
  margin: 0;
}

/* ─── Statusmærke ────────────────────────────────────────── */
.kort__status {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  padding: 5px 11px;
  border-radius: var(--radius-full);
  min-height: 32px;
  display: flex;
  align-items: center;
}

/* ─── Statusfarver ───────────────────────────────────────── */
.status-tilgaengelig {
  background: var(--color-tilgaengelig-bg);
  color: var(--color-tilgaengelig-text);
}

.status-udlaant {
  background: var(--color-udlaant-bg);
  color: var(--color-udlaant-text);
}

.status-inaktiv {
  background: var(--color-inaktiv-bg);
  color: var(--color-inaktiv-text);
}
</style>
