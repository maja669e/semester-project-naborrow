<script>
export default {
  name: "LoansOverview",

  props: {
    activeLoans: {
      type: Array,
      default: () => []
    },
    completedLoans: {
      type: Array,
      default: () => []
    }
  }
};
</script>

<template>
  <v-expansion-panels>

    <v-expansion-panel>
      <v-expansion-panel-title>
        Aktive lån ({{ activeLoans.length }})
      </v-expansion-panel-title>

      <v-expansion-panel-text>

        <v-list v-if="activeLoans.length">
          <v-list-item
            v-for="loan in activeLoans"
            :key="loan.RentalID"
          >
            {{ loan.rentalRequest?.item?.ItemName}}
          </v-list-item>
        </v-list>

        <p v-else>Ingen aktive lån.</p>

      </v-expansion-panel-text>
    </v-expansion-panel>

    <v-expansion-panel>
      <v-expansion-panel-title>
        Afsluttede lån ({{ completedLoans.length }})
      </v-expansion-panel-title>

      <v-expansion-panel-text>

        <v-list v-if="completedLoans.length">
          <v-list-item
            v-for="loan in completedLoans"
            :key="loan.RentalID"
          >
            {{ loan.rentalRequest?.item?.ItemName }}
          </v-list-item>
        </v-list>

        <p v-else>Ingen afsluttede lån.</p>

      </v-expansion-panel-text>
    </v-expansion-panel>

  </v-expansion-panels>
</template>