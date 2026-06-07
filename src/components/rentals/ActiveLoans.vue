<script>
export default {
  props: {
    activeLoans: Array,
    completedLoans: Array
  }
};
</script>

<template>
  <v-expansion-panels multiple>

    <v-expansion-panel>
      <v-expansion-panel-title>
        Aktive lån
      </v-expansion-panel-title>

      <v-expansion-panel-text>
        <div
          v-for="loan in activeLoans"
          :key="loan.RentalID"
        >
          {{ loan.ItemName }}
        </div>
      </v-expansion-panel-text>
    </v-expansion-panel>

    <v-expansion-panel>
      <v-expansion-panel-title>
        Afsluttede lån
      </v-expansion-panel-title>

      <v-expansion-panel-text>
        <div
          v-for="loan in completedLoans"
          :key="loan.RentalID"
        >
          {{ loan.ItemName }}
        </div>
      </v-expansion-panel-text>
    </v-expansion-panel>

  </v-expansion-panels>
</template>
