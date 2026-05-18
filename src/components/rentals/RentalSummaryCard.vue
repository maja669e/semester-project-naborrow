<script>
export default {
  name: "RentalSummaryCard",

props: {
  rental: {
    type: Object,
    required: true,
  },

  item: {
    type: Object,
    required: true,
  },
},

methods: {
  formatPeriod(start, end) {
    if (!start || !end) return "-"

    const startDate = new Date(start)
    const endDate = new Date(end)

    const months = [
      "januar",
      "februar",
      "marts",
      "april",
      "maj",
      "juni",
      "juli",
      "august",
      "september",
      "oktober",
      "november",
      "december",
    ]

    const startDay = startDate.getDate()
    const endDay = endDate.getDate()

    const startMonth =
      months[startDate.getMonth()]

    const endMonth =
      months[endDate.getMonth()]

    const year =
      endDate.getFullYear()

    // same month
    if (
      startDate.getMonth() ===
      endDate.getMonth()
    ) {
      return `${startDay}. ${startMonth} - ${endDay}. ${endMonth} ${year}`
    }

    return `${startDay}. ${startMonth} - ${endDay}. ${endMonth} ${year}`
  },

  getDuration(start, end) {
    if (!start || !end) return "-"

    const startDate = new Date(start)
    const endDate = new Date(end)

    const diffTime =
      endDate - startDate

    const diffDays =
      Math.ceil(
        diffTime /
          (1000 * 60 * 60 * 24)
      ) + 1

    return `${diffDays} dage`
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
      <!-- ITEM SUMMARY -->

<div class="item-summary">

  <img
    :src="item.image"
    :alt="item.title"
    class="item-image"
  />

  <div class="item-info">

    <h3>{{ item.title }}</h3>

    <p>
      {{ item.category }}

      <span v-if="item.brand">
        · {{ item.brand }}
      </span>
    </p>

  </div>

</div>

     <div class="summary-row">
  <span>Periode</span>

  <strong>
    {{ formatPeriod(rental.startDate, rental.endDate) }}
  </strong>
</div>

<div class="summary-row">
  <span>Varighed</span>

  <strong>
    {{ getDuration(rental.startDate, rental.endDate) }}
  </strong>
</div>

      <div class="summary-row">
        <span>Afhentning</span>
        <strong>{{ rental.pickupTime }}</strong>
      </div>

      <div class="summary-row">
        <span>Medfølger</span>

        <strong>
          {{
            rental.accessories.length
              ? rental.accessories.join(", ")
              : "Ingen valgt"
          }}
        </strong>
      </div>


<div class="summary-row">
  <span>Besked til udlåner</span>

  <strong>
    {{
      rental.messageToLender || "Ingen besked"
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
.item-summary {
  display: flex;
  align-items: center;
  gap: 16px;

  margin-bottom: 20px;
}

.item-image {
  width: 72px;
  height: 72px;

  object-fit: cover;

  border-radius: 16px;

  flex-shrink: 0;
}

.item-info h3 {
  margin: 0;
  font-size: 18px;
}

.item-info p {
  margin: 4px 0 0;
  color: #666;
}

</style>