<script>
// Viser aktive og tidligere lån i to sektioner.
// sections-computed samler begge sektioner i ét array — undgår dobbelt template-kode.
// showRenter: viser lånerens navn, slåes til i udlåner-perspektiv (owner-tab).
import { completeRental } from "@/services/rental/rentalservice.js";

export default {
  name: "LoansOverview",

  emits: ["loan-completed"],

  props: {
    activeLoans: {
      type: Array,
      default: () => []
    },
    completedLoans: {
      type: Array,
      default: () => []
    },
    // Viser lånerens navn på hvert kort — bruges kun i udlåner-perspektiv
    showRenter: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    // Samler begge sektioner i ét array så templaten ikke gentages.
    // canComplete styrer om afslut-knappen vises på kortene i sektionen.
    sections() {
      return [
        {
          label:       "Aktive lån",
          emptyText:   "Ingen aktive lån",
          loans:       this.activeLoans,
          canComplete: true,
        },
        {
          label:       "Tidligere lån",
          emptyText:   "Ingen tidligere lån",
          loans:       this.completedLoans,
          canComplete: false,
        },
      ];
    },
  },

  methods: {
    // Oversætter Rental-statuskoder til dansk
    formatStatus(status) {
      if (status === "active")    return "Aktiv";
      if (status === "completed") return "Afsluttet";
      if (status === "cancelled") return "Annulleret";
      return status;
    },

    // Returnerer CSS-farve baseret på Rental-status
    statusColor(status) {
      if (status === "active")    return "var(--color-primary)";
      if (status === "completed") return "var(--color-secondary)";
      if (status === "cancelled") return "var(--color-accent)";
      return "var(--color-border)";
    },

    // Formaterer ISO-dato (YYYY-MM-DD) til dansk læsevenligt format (DD/MM/YYYY)
    formatDate(dateStr) {
      if (!dateStr) return "–";
      const [year, month, day] = dateStr.split("-");
      return `${day}/${month}/${year}`;
    },

    // Afslutter ét lån manuelt og beder forælderen genindlæse listen
    async completeLoan(rentalId) {
      await completeRental(rentalId);
      this.$emit("loan-completed");
    },
  },
};
</script>

<template>
  <div class="laan-oversigt">

    <div
      v-for="section in sections"
      :key="section.label"
      class="laan-sektion"
    >

      <!-- Sektionsoverskrift med antal -->
      <div class="laan-sektion__header">
        <span class="laan-sektion__titel">{{ section.label }}</span>
        <span class="laan-sektion__antal">{{ section.loans.length }}</span>
      </div>

      <!-- Tom tilstand -->
      <p v-if="!section.loans.length" class="laan-sektion__tom">
        {{ section.emptyText }}
      </p>

      <!-- Lån-kort: template-wrapper skiller v-else fra v-for så hensigten er klar -->
      <template v-else>
      <div
        v-for="loan in section.loans"
        :key="loan.RentalID"
        class="laankort"
      >

        <!-- Farvet venstre-kant baseret på status -->
        <div
          class="laankort__kant"
          :style="{ background: statusColor(loan.Status) }"
        />

        <div class="laankort__indhold">

          <div class="laankort__genstand">
            {{ loan.rentalRequest?.item?.ItemName }}
          </div>

          <!-- Vises kun i udlåner-perspektiv: hvem der låner genstanden -->
          <div v-if="showRenter" class="laankort__meta">
            <v-icon size="13" class="mr-1">mdi-account-outline</v-icon>
            {{ loan.rentalRequest?.renter?.Username }}
          </div>

          <div class="laankort__meta">
            <v-icon size="13" class="mr-1">mdi-calendar-outline</v-icon>
            {{ formatDate(loan.rentalRequest?.StartDate) }} –
            {{ formatDate(loan.rentalRequest?.EndDate) }}
          </div>

        </div>

        <div class="laankort__hoejre">

          <!-- Status-chip -->
          <span
            class="laankort__status"
            :style="{ color: statusColor(loan.Status) }"
          >
            {{ formatStatus(loan.Status) }}
          </span>

          <!-- KUN TIL TEST: afslut ét enkelt aktivt lån manuelt -->
          <button
            v-if="section.canComplete"
            class="laankort__afslut"
            :aria-label="`Afslut lån: ${loan.rentalRequest?.item?.ItemName}`"
            @click="completeLoan(loan.RentalID)"
          >
            Afslut
          </button>

        </div>

      </div>
      </template>

    </div>

  </div>
</template>

<style scoped>
.laan-oversigt {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* ── Sektion ──────────────────────────────────────────────────── */
.laan-sektion__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.laan-sektion__titel {
  font-family: var(--font-body);
  font-size: var(--text-label);
  font-weight: 700;
  color: var(--color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.laan-sektion__antal {
  font-family: var(--font-body);
  font-size: var(--text-meta);
  font-weight: 700;
  background: var(--color-image-bg);
  color: var(--color-secondary);
  border-radius: var(--radius-full);
  padding: 1px 8px;
}

.laan-sektion__tom {
  font-family: var(--font-body);
  font-size: var(--text-label);
  color: var(--color-secondary);
  padding: 16px 0;
}

/* ── Lån-kort ──────────────────────────────────────────────────── */
.laankort {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  margin-bottom: 8px;
  overflow: hidden;
}

.laankort__kant {
  width: 4px;
  min-height: 40px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.laankort__indhold {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.laankort__genstand {
  font-family: var(--font-body);
  font-size: var(--text-body);
  font-weight: 600;
  color: var(--color-neutral);
}

.laankort__meta {
  display: flex;
  align-items: center;
  font-family: var(--font-body);
  font-size: var(--text-meta);
  color: var(--color-secondary);
}

.laankort__hoejre {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}

.laankort__status {
  font-family: var(--font-body);
  font-size: var(--text-meta);
  font-weight: 700;
  white-space: nowrap;
}

/* KUN TIL TEST */
.laankort__afslut {
  font-family: var(--font-body);
  font-size: var(--text-meta);
  font-weight: 600;
  color: var(--color-secondary);
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 2px 8px;
  cursor: pointer;
  white-space: nowrap;
}
</style>
