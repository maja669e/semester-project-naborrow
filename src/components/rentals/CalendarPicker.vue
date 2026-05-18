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

      if (val.length === 1) {
        this.error = "";
        this.$emit("update:startDate", start);
        this.$emit("update:endDate", null);
        return;
      }

      const s = new Date(start);
      s.setHours(0, 0, 0, 0);
      const e = new Date(end);
      e.setHours(0, 0, 0, 0);
      const diffTime = e - s;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (this.maxDays && diffDays > this.maxDays) {
        this.error = `Maksimal låneperiode er ${this.maxDays} dage`;
        this.range = [start];
        this.$emit("update:startDate", start);
        this.$emit("update:endDate", null);
        return;
      }

      this.error = "";
      this.$emit("update:startDate", start);
      this.$emit("update:endDate", end);
    },

    toIsoDate(date) {
      if (!date) return null;
      const d = new Date(date);
      return [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(d.getDate()).padStart(2, "0"),
      ].join("-");
    },

    dayRangeRole(isoDate) {
      if (this.range.length === 0) return null;
      const start = this.toIsoDate(this.range[0]);
      if (isoDate === start) return "start";
      if (this.range.length !== 2) return null;
      const end = this.toIsoDate(this.range[this.range.length - 1]);
      if (isoDate === end) return "end";
      if (isoDate > start && isoDate < end) return "middle";
      return null;
    },

    dayBtnProps(dayProps, isoDate) {
      if (this.dayRangeRole(isoDate) !== "middle") return dayProps;
      return { ...dayProps, variant: "text", color: "primary" };
    },
  },
};
</script>

<template>
  <section class="calendar-wrapper">
    <v-date-picker
      v-model="range"
      multiple="range"
      color="primary"
      rounded="xl"
      show-adjacent-months
      hide-header
      :allowed-dates="isAllowedDate"
      @update:model-value="handleRange"
    >
      <template #controls="{ prevMonth, nextMonth, monthYearText, disabled }">
        <v-btn
          icon="$prev"
          variant="text"
          density="comfortable"
          :disabled="disabled.includes('prev-month')"
          aria-label="Forrige måned"
          @click="prevMonth"
        />
        <h2 class="calendar-month-label">{{ monthYearText }}</h2>
        <v-btn
          icon="$next"
          variant="text"
          density="comfortable"
          :disabled="disabled.includes('next-month')"
          aria-label="Næste måned"
          @click="nextMonth"
        />
      </template>

      <template #day="{ props: dayProps, item }">
        <span
          v-if="dayRangeRole(item.isoDate)"
          class="range-bg"
          :class="`range-bg--${dayRangeRole(item.isoDate)}`"
          aria-hidden="true"
        />
        <v-btn v-bind="dayBtnProps(dayProps, item.isoDate)">
          {{ item.localized }}
        </v-btn>
      </template>
    </v-date-picker>
  </section>

  <p v-if="error" role="alert" class="error-text">
    {{ error }}
  </p>
</template>

<style scoped>
.calendar-wrapper {
  display: flex;
  justify-content: center;
}

.v-date-picker {
  max-width: 340px;
}

/* Custom < Month Year > header */
.calendar-wrapper :deep(.v-date-picker-controls) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.calendar-month-label {
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  flex: 1;
  margin: 0;
  color: inherit;
}

/* Remove default today indicator */
.calendar-wrapper :deep(.v-date-picker-month__day-btn[aria-current="date"]) {
  box-shadow: none !important;
  border: none !important;
  color: inherit !important;
}

.calendar-wrapper :deep(.v-date-picker-month__day-btn[aria-current="date"] .v-btn__overlay) {
  opacity: 0 !important;
}

.calendar-wrapper :deep(.v-date-picker-month__day-btn:hover) {
  background-color: rgba(84, 106, 65, 0.2) !important;
}

/* Position context for range background strips */
.calendar-wrapper :deep(.v-date-picker-month__day) {
  position: relative;
}

/* Decorative strip behind the day button for range visualization */
.calendar-wrapper :deep(.range-bg) {
  position: absolute;
  top: 0;
  bottom: 0;
  background-color: #e0ecd2;
  pointer-events: none;
  z-index: 0;
}

.calendar-wrapper :deep(.range-bg--start) {
  left: 50%;
  right: 0;
}

.calendar-wrapper :deep(.range-bg--end) {
  left: 0;
  right: 50%;
}

.calendar-wrapper :deep(.range-bg--middle) {
  left: 0;
  right: 0;
}

/* Day button sits above the range background */
.calendar-wrapper :deep(.v-date-picker-month__day-btn) {
  position: relative;
  z-index: 1;
}

/* Start and end dates: enforce the same solid dark circle */
.calendar-wrapper :deep(.range-bg--start ~ .v-date-picker-month__day-btn),
.calendar-wrapper :deep(.range-bg--end ~ .v-date-picker-month__day-btn) {
  background-color: #546a41 !important;
  color: white !important;
}

/* Middle-range days: no circle, plain number in primary color */
.calendar-wrapper :deep(.range-bg--middle ~ .v-date-picker-month__day-btn) {
  background: transparent !important;
  color: #546a41 !important;
  box-shadow: none !important;
}

.calendar-wrapper :deep(.range-bg--middle ~ .v-date-picker-month__day-btn .v-btn__overlay) {
  opacity: 0 !important;
}

/* In-range hover: subtle tint that keeps the number readable */
.calendar-wrapper :deep(.range-bg--middle ~ .v-date-picker-month__day-btn:hover) {
  background-color: rgba(84, 106, 65, 0.15) !important;
}

.calendar-wrapper :deep(.range-bg--middle ~ .v-date-picker-month__day-btn:hover .v-btn__overlay) {
  opacity: 0 !important;
}

.error-text {
  color: #b00020;
  font-size: 14px;
  margin-top: 8px;
}
</style>
