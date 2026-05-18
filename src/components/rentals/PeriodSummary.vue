<script>
export default {
  name: "PeriodSummary",

  props: {
    startDate: String,
    endDate: String,
  },

 computed: {
  formattedStart() {
    if (!this.startDate) return null;
    return new Date(this.startDate).toLocaleDateString("en-US");
  },

  formattedEnd() {
    if (!this.endDate) return null;
    return new Date(this.endDate).toLocaleDateString("en-US");
  },

  diffDays() {
  if (!this.startDate || !this.endDate) return 0;

  const start = new Date(this.startDate);
  const end = new Date(this.endDate);

  // normalize to midnight (VERY important)
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
  <v-icon>mdi-calendar-month</v-icon>Valgt periode: {{ formattedStart }} <v-icon size="small">mdi-arrow-right</v-icon> {{ formattedEnd }} ({{ diffDays }} dage)
</v-card-text>
  </v-card>
  
</template>

<style scoped>
.error-text {
  color: #B00020;
  margin-top: 8px;
  font-size: 14px;
}

  </style>