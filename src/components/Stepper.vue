<script>
export default {
  name: "Stepper",
  props: {
    currentStep: {
      type: Number,
      default: 1,
    },
    steps: {
      type: Array,
      default: () => ["Grundinfo", "Detaljer", "Forhåndsvisning"],
    },
  },
};
</script>

<template>
  <div class="stepper-wrapper">
    <template v-for="(step, index) in steps" :key="index">
      <div
        class="step-item"
        :class="{
          done: index + 1 < currentStep,
          active: index + 1 === currentStep,
        }"
      >
        <div class="step-circle">
          <v-icon v-if="index + 1 < currentStep" size="16">mdi-check</v-icon>
          <span v-else>{{ index + 1 }}</span>
        </div>
        <span>{{ step }}</span>
      </div>

      <div
        v-if="index < steps.length - 1"
        class="step-line"
        :class="{ done: index + 1 < currentStep }"
      ></div>
    </template>
  </div>
</template>

<style scoped>
.stepper-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 16px 20px 8px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}

.step-circle {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.step-item.done .step-circle,
.step-item.active .step-circle {
  background: var(--color-primary);
  color: white;
}

.step-item.active span {
  color: var(--color-neutral);
  font-weight: 600;
}

.step-line {
  flex: 1;
  height: 2px;
  min-width: 16px;
  background: var(--color-border);
}

.step-line.done {
  background: var(--color-primary);
}
</style>
