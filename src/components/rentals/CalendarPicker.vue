<script>
// Kalender-komponent til valg af låneperiode som et datointerval.
// Bruger Vuetify v-date-picker i "range"-tilstand og validerer
// at perioden ikke overskrider genstandens maksimale låneperiode.
export default {
  name: "CalendarPicker",

  props: {
    startDate: String,
    endDate: String,
    // Maksimal antal låndage fra genstandens data — bruges til validering
    maxDays: Number,
  },

  emits: ["update:startDate", "update:endDate"],

  data() {
    return {
      range: [],  // Vuetify-datepickerens interne intervalarray
      error: "",
    };
  },

  mounted() {
    // Gendanner det visuelle interval fra props når brugeren vender tilbage fra trin 2.
    // Uden dette ser v-date-picker kun range=[] og viser ingen markering.
    if (this.startDate && this.endDate) {
      this.range = [this.startDate, this.endDate];
    } else if (this.startDate) {
      this.range = [this.startDate];
    }
  },

  methods: {
    // Forhindrer valg af datoer i fortiden
    isAllowedDate(date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(date) >= today;
    },

    // Behandler valgt interval og validerer mod maksimal låneperiode
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

    // Konverterer en Date-værdi til ISO 8601-streng (YYYY-MM-DD)
    toIsoDate(date) {
      if (!date) return null;
      const d = new Date(date);
      return [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(d.getDate()).padStart(2, "0"),
      ].join("-");
    },

    // Returnerer perioderollen for en given dato: 'start', 'end', 'middle' eller null
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

    // Returnerer ændrede knap-props til dage i midten af perioden
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

/* Brugerdefineret < Måned År >-header */
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

/* Dags dato: tynd ring i primærfarven — vises kun når datoen ikke er valgt */
.calendar-wrapper :deep(.v-date-picker-month__day-btn[aria-current="date"]) {
  border: 2px solid var(--color-primary) !important;
  box-shadow: none !important;
}

/* Fjern ringen når today er start eller slut på den valgte periode */
.calendar-wrapper :deep(.range-bg--start ~ .v-date-picker-month__day-btn[aria-current="date"]),
.calendar-wrapper :deep(.range-bg--end ~ .v-date-picker-month__day-btn[aria-current="date"]) {
  border: none !important;
}

/* Fjern Vuetify's eget overlay-highlight for today */
.calendar-wrapper :deep(.v-date-picker-month__day-btn[aria-current="date"] .v-btn__overlay) {
  opacity: 0 !important;
}

.calendar-wrapper :deep(.v-date-picker-month__day-btn:hover) {
  background-color: rgba(84, 106, 65, 0.2) !important;
}

/* Positioneringskontekst for periodebaggrundsstriper */
.calendar-wrapper :deep(.v-date-picker-month__day) {
  position: relative;
}

/* Dekorativ baggrundsstribe der visualiserer den valgte periode */
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

/* Dagsknap placeres over baggrundsstriberne via z-index */
.calendar-wrapper :deep(.v-date-picker-month__day-btn) {
  position: relative;
  z-index: 1;
}

/* Start- og slutdato: ensartet fyldt mørk cirkel */
.calendar-wrapper :deep(.range-bg--start ~ .v-date-picker-month__day-btn),
.calendar-wrapper :deep(.range-bg--end ~ .v-date-picker-month__day-btn) {
  background-color: #546a41 !important;
  color: white !important;
}

/* Dage i perioden: ingen cirkel, kun tal i primærfarve */
.calendar-wrapper :deep(.range-bg--middle ~ .v-date-picker-month__day-btn) {
  background: transparent !important;
  color: #546a41 !important;
  box-shadow: none !important;
}

.calendar-wrapper :deep(.range-bg--middle ~ .v-date-picker-month__day-btn .v-btn__overlay) {
  opacity: 0 !important;
}

/* Hover på periodedag: svag toning der bevarer læselighed */
.calendar-wrapper :deep(.range-bg--middle ~ .v-date-picker-month__day-btn:hover) {
  background-color: rgba(84, 106, 65, 0.15) !important;
}

.calendar-wrapper :deep(.range-bg--middle ~ .v-date-picker-month__day-btn:hover .v-btn__overlay) {
  opacity: 0 !important;
}

.error-text {
  color: var(--color-error);
  font-size: 14px;
  margin-top: 8px;
}
</style>
