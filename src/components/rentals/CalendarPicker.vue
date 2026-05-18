<script>
export default {
  name: "CalendarPicker",

  props: {
    startDate: String,
    endDate: String,
    maxDays: Number,
  },

  emits: ["update:startDate", "update:endDate"],

  data() {
    return {
      range: [],
      error: "",
    };
  },

  methods: {
    isAllowedDate(date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(date) >= today;
    },

    handleRange(val) {
      if (!val?.length) return;

      const start = val[0];
      const end = val[val.length - 1];

      // only first click
      if (val.length === 1) {
        this.error = "";
        this.$emit("update:startDate", start);
        this.$emit("update:endDate", null);
        return;
      }

      const diffTime =
        new Date(end) - new Date(start);

      const diffDays =
        Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      // ❌ TOO LONG → BLOCK + SHOW ERROR
      if (this.maxDays && diffDays > this.maxDays) {
        this.error = `Maksimal låneperiode er ${this.maxDays} dage`;

        // revert selection safely
        this.range = [start];

        this.$emit("update:startDate", start);
        this.$emit("update:endDate", null);

        return;
      }

      // ✅ valid
      this.error = "";

      this.$emit("update:startDate", start);
      this.$emit("update:endDate", end);
    },
  },
};
</script>

<template>
  <div class="calendar-wrapper">
    <v-date-picker
        v-model="range"
  multiple="range"
  color="primary"
  rounded="xl"
  show-adjacent-months
  hide-header
  :allowed-dates="isAllowedDate"
  @update:model-value="handleRange"
    />
  </div>

  <div v-if="error" class="error-text">
    {{ error }}
  </div>
</template>

<style scoped>
.calendar-wrapper {
  display: flex;
  justify-content: center;
}

.v-date-picker {
  max-width: 340px;
}

/* remove current-day styling */
.calendar-wrapper :deep(.v-date-picker-month__day-btn[aria-current="date"]) {
  box-shadow: none !important;
  border: none !important;
  color: inherit !important;
}

.calendar-wrapper :deep(.v-date-picker-month__day-btn[aria-current="date"] .v-btn__overlay) {
  opacity: 0 !important;
}
.calendar-wrapper :deep(.v-date-picker-month__day-btn:hover) {
  background-color: rgba(27, 94, 32, 0.2) !important; /* green tint */
}

.error-text {
  color: #b00020;
  font-size: 14px;
  margin-top: 8px;
}
</style>