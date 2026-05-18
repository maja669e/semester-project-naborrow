<script>
export default {
  name: "CalendarPicker",

  props: {
    startDate: String,
    endDate: String,
  },

  emits: ["update:startDate", "update:endDate"],

  data() {
    return {
      range: [],
    };
  },

  watch: {
    range(val) {
      console.log("RAW RANGE:", val);

      const start = val?.[0] || null;
      const end = val?.[1] || null;

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
    />
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
.calendar-wrapper :deep(.v-date-picker-month__day-btn[aria-current="date"]) {
  box-shadow: none !important;
  border: none !important;
   color: inherit !important;
}
.calendar-wrapper :deep(.v-date-picker-month__day-btn[aria-current="date"] .v-btn__overlay) {
  opacity: 0 !important;
}



</style>