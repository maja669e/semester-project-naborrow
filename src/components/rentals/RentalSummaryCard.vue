<script>
export default {
  name: "RentalSummaryCard",

  props: {
    rental: {
      type: Object,
      required: true,
    },
  },
};
</script>

<template>

  <v-card
    rounded="xl"
    variant="outlined"
    class="mt-6"
  >

    <v-card-text>

      <div class="summary-row">
        <span>Fra</span>
        <strong>{{ rental.startDate }}</strong>
      </div>

      <div class="summary-row">
        <span>Til</span>
        <strong>{{ rental.endDate }}</strong>
      </div>

      <div class="summary-row">
        <span>Afhentning</span>
        <strong>{{ rental.pickupTime }}</strong>
      </div>

      <div class="summary-row">
        <span>Tilbehør</span>

        <strong>
          {{
            rental.accessories.length
              ? rental.accessories.join(", ")
              : "Ingen valgt"
          }}
        </strong>
      </div>

    </v-card-text>

  </v-card>

</template>

<style scoped>

.summary-row {
  display: flex;
  justify-content: space-between;

  padding: 12px 0;

  border-bottom: 1px solid #e5e7eb;
}

.summary-row:last-child {
  border-bottom: none;
}

</style>