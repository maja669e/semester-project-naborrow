<script>
// Opsummeringsboks der viser den valgte låneperiode med start-, slutdato og varighed.
// Vises direkte under CalendarPicker på trin 1 i låneanmodnings-flowet.
export default {
  name: "PeriodSummary",

  props: {
    startDate: String,
    endDate: String,
  },

 computed: {
  // Formaterer startdatoen til en læsbar streng
  formattedStart() {
    if (!this.startDate) return null;
    return new Date(this.startDate).toLocaleDateString("en-US");
  },

  // Formaterer slutdatoen til en læsbar streng
  formattedEnd() {
    if (!this.endDate) return null;
    return new Date(this.endDate).toLocaleDateString("en-US");
  },

  // Beregner antal dage inkl. start- og slutdag
  diffDays() {
  if (!this.startDate || !this.endDate) return 0;

  const start = new Date(this.startDate);
  const end = new Date(this.endDate);

  // Nulstil tidspunkt til midnat for at undgå tidszoneforskydninger
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffTime = end - start;

  return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
},

}
};
</script>

<template>
  <v-card class="mt-4">
   <v-card-text>
  <v-icon icon="mdi-calendar-month" /> Valgt periode: {{ formattedStart }} <v-icon icon="mdi-arrow-right" size="small" /> {{ formattedEnd }} ({{ diffDays }} dage)
</v-card-text>
  </v-card>
  
</template>

<style scoped>
.error-text {
  color: var(--color-error);
  margin-top: 8px;
  font-size: 14px;
}

  </style>