<script>
// Flervalgs-tidsvælger til afhentning.
// Bruger v-model med et array — klik på en tidsblok tilføjer eller fjerner den fra valget.
export default {
  name: "PickupTimeSelector",

  props: {
    // Arrayet af valgte tidsblokke, styret af forælderen via v-model
    modelValue: Array,
  },

  emits: ["update:modelValue"],

  data() {
    return {
      options: [
        { label: "Morgen",      time: "Kl. 6:00–9:00"   },
        { label: "Formiddag",   time: "Kl. 9:00–12:00"  },
        { label: "Eftermiddag", time: "Kl. 12:00–17:00" },
        { label: "Aften",       time: "Kl. 17:00–21:00" },
      ],
    };
  },

  methods: {
    // Tilføjer eller fjerner tidsblokken fra arrayet — toggler valget
    select(option) {
      const current = this.modelValue ?? [];
      const updated = current.includes(option.label)
        ? current.filter((l) => l !== option.label)
        : [...current, option.label];
      this.$emit("update:modelValue", updated);
    },
  },
};
</script>

<template>
  <div class="pickup-grid">

    <!-- role/tabindex + keydown gør tidsblokken tastaturtilgængelig (WCAG 2.1.1);
         aria-pressed melder valgt-tilstand til skærmlæsere. -->
    <v-card
      v-for="option in options"
      :key="option.label"
      class="pickup-card"
      :class="{ active: modelValue?.includes(option.label) }"
      role="button"
      tabindex="0"
      :aria-pressed="modelValue?.includes(option.label)"
      :aria-label="`${option.label}, ${option.time}`"
      @click="select(option)"
      @keydown.enter.prevent="select(option)"
      @keydown.space.prevent="select(option)"
      rounded="xl"
      elevation="1"
    >
      <p class="title">{{ option.label }}</p>
      <p class="subtitle">{{ option.time }}</p>
    </v-card>

  </div>
</template>

<style scoped>
.pickup-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
}

.pickup-card {
  padding: 16px;
  cursor: pointer;
  text-align: left;
  transition: 0.2s;
  border: 1px solid transparent;
}

.pickup-card.active {
  background-color: var(--color-primary);
  color: var(--color-surface);
}

/* Synlig fokusring ved tastaturnavigation (WCAG 2.4.7) */
.pickup-card:focus-visible {
  outline: 3px solid var(--color-neutral);
  outline-offset: 3px;
}

.title {
  font-weight: 600;
  font-size: 16px;
}

.subtitle {
  font-size: 13px;
  opacity: 0.8;
  margin-top: 4px;
}
</style>