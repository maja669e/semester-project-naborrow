<script>
// Filterfanebjælke til genstandsoversigten.
// Udsender filterChanged når brugeren vælger et andet statusfilter,
// så forælderen kan filtrere listen uden at denne komponent kender til dataene.
export default {
  name: "ItemFilterTabs",

  props: {
    // Den aktuelt valgte filter-label (fx "Alle" eller "Tilgængelig")
    activeFilter: { type: String, required: true },
  },

  emits: ["filterChanged"],

  data() {
    return {
      // Tilgængelige filtervalg – matcher de mulige statusværdier på genstande
      filters: ["Alle", "Tilgængelig", "Udlånt", "Inaktiv"],
    };
  },

  methods: {
    // Udsender det valgte filter til forælderen
    selectFilter(filter) {
      this.$emit("filterChanged", filter);
    },
  },
};
</script>

<template>
  <!-- nav-landmark giver skærmlæsere mulighed for at hoppe direkte til filteret -->
  <nav class="filterbjaelke" aria-label="Filtrer genstande efter status">

    <!-- Én knap per filter; aria-pressed angiver hvilken der er valgt -->
    <button
      v-for="filter in filters"
      :key="filter"
      class="filterfane"
      :class="{ 'filterfane--aktiv': activeFilter === filter }"
      :aria-pressed="activeFilter === filter"
      :aria-label="`Vis ${filter === 'Alle' ? 'alle genstande' : filter}`"
      @click="selectFilter(filter)"
    >
      {{ filter }}
    </button>

  </nav>
</template>

<style scoped>
/* ─── Filterbars container ───────────────────────────────── */
.filterbjaelke {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
  width: 100%;
  padding: 2px 0;
}

/* ─── Enkelt filterfane ──────────────────────────────────── */
/* min-height: 44px opfylder WCAG 2.5.5 trykfladekravet */
.filterfane {
  font-family: var(--font-body);
  font-size: var(--text-label);
  font-weight: 600;
  color: var(--color-secondary);
  background: transparent;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-full);
  padding: var(--space-2) var(--space-4);
  min-height: 44px;
  cursor: pointer;
  white-space: nowrap;
  flex: 1;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

/* ─── Hover-tilstand ─────────────────────────────────────── */
.filterfane:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* ─── Fokus-tilstand ─────────────────────────────────────── */
/* :not(:focus-visible) fjerner fokusringen ved museklik */
.filterfane:focus:not(:focus-visible) {
  outline: none;
}

.filterfane:focus-visible {
  outline: 3px solid var(--color-neutral);
  outline-offset: 3px;
}

/* ─── Aktiv/valgt fane ───────────────────────────────────── */
.filterfane--aktiv {
  background: var(--color-primary) !important;
  color: #ffffff !important;
  border-color: var(--color-primary) !important;
  padding: var(--space-2) var(--space-4) !important;
}
</style>
