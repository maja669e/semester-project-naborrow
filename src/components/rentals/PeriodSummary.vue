<script>
export default {
  name: "PeriodSummary",

  props: {
    startDate: String,
    endDate: String,
  },
};
</script>

<template>

  <v-card class="mt-4">

    <v-card-text>

      <div>
        Fra: {{ startDate || "-" }}
      </div>

      <div>
        Til: {{ endDate || "-" }}
      </div>

    </v-card-text>

  </v-card>

</template>