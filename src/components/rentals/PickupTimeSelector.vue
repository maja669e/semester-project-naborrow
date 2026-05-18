<script>
export default {
  name: "PickupTimeSelector",

  props: {
    modelValue: String,
  },

  emits: ["update:modelValue"],

  data() {
    return {
      options: [
        { label: "Morgen", time: "Kl. 6:00–9:00" },
        { label: "Formiddag", time: "Kl. 9:00–12:00" },
        { label: "Eftermiddag", time: "Kl. 12:00–17:00" },
        { label: "Aften", time: "Kl. 17:00–21:00" },
      ],
    };
  },

  methods: {
    select(option) {
      this.$emit("update:modelValue", option.label);
    },
  },
};
</script>

<template>
  <div class="pickup-grid">

    <v-card
      v-for="option in options"
      :key="option.label"
      class="pickup-card"
      :class="{ active: modelValue === option.label }"
      @click="select(option)"
      rounded="xl"
      elevation="1"
    >
      <div class="title">{{ option.label }}</div>
      <div class="subtitle">{{ option.time }}</div>
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
  background-color: #2c3b1e;
  color: white;
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