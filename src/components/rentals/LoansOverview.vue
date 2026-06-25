<script>
// Viser aktive og tidligere lån i to sektioner.
// sections-computed samler begge sektioner i ét array — undgår dobbelt template-kode.
// showRenter: viser lånerens navn, slåes til i udlåner-perspektiv (owner-tab).
import { completeRental, hideRental } from "@/services/rental/rentalservice.js";
import ConfirmDialog from "@/components/feedback/ConfirmDialog.vue";

export default {
  name: "LoansOverview",

  components: { ConfirmDialog },

  emits: ["loan-completed", "loan-removed"],

  data() {
    return {
      showCompleteDialog: false,  // Bekræftelsesdialog inden et lån afsluttes
      completingLoan: null,       // Lånet der afventer bekræftelse
      isCompleting: false,        // Indlæsningstilstand mens afslutningen kører

      showDeleteDialog: false,    // Bekræftelsesdialog inden et lån fjernes fra historik
      deletingLoan: null,         // Lånet der afventer bekræftelse på fjernelse
      isDeleting: false,          // Indlæsningstilstand mens fjernelsen kører

      actionError: "",            // Fejlbesked hvis afslut eller fjern fejler
    };
  },

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
    // Perspektivet bestemmer hvilket flag backend skal sætte ved fjernelse:
    // udlåner-fanen sender showRenter=true, ellers er det låner-perspektivet.
    perspective() {
      return this.showRenter ? "owner" : "renter";
    },

    // Samler begge sektioner i ét array så templaten ikke gentages.
    // canComplete styrer afslut-knappen (aktive lån); canDelete styrer
    // fjern-knappen (kun tidligere lån).
    sections() {
      return [
        {
          label:       "Aktive lån",
          emptyText:   "Ingen aktive lån",
          loans:       this.activeLoans,
          canComplete: true,
          canDelete:   false,
        },
        {
          label:       "Tidligere lån",
          emptyText:   "Ingen tidligere lån",
          loans:       this.completedLoans,
          canComplete: false,
          canDelete:   true,
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
      if (status === "completed") return "var(--color-text-secondary)";
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

    // Åbn bekræftelsesdialog i stedet for at afslutte med det samme,
    // så et fejltryk ikke utilsigtet afslutter lånet
    askComplete(loan) {
      this.actionError = "";
      this.completingLoan = loan;
      this.showCompleteDialog = true;
    },

    // Gennemfør afslutningen efter brugeren har bekræftet
    async confirmComplete() {
      if (!this.completingLoan) return;
      this.isCompleting = true;
      try {
        await this.completeLoan(this.completingLoan.RentalID);
        this.showCompleteDialog = false;
        this.completingLoan = null;
      } catch (err) {
        // Hvis kaldet fejler, lukkes dialogen og brugeren får en besked
        this.actionError = "Kunne ikke afslutte lånet. Prøv igen.";
        this.showCompleteDialog = false;
      } finally {
        this.isCompleting = false;
      }
    },

    // Luk dialogen uden at afslutte
    cancelComplete() {
      this.showCompleteDialog = false;
      this.completingLoan = null;
    },

    // Åbn bekræftelsesdialog inden et lån fjernes fra historikken
    askDelete(loan) {
      this.actionError = "";
      this.deletingLoan = loan;
      this.showDeleteDialog = true;
    },

    // Fjern lånet fra DENNE brugers historik (soft delete) og genindlæs listen.
    // Den anden part beholder lånet i sin historik.
    async confirmDelete() {
      if (!this.deletingLoan) return;
      this.isDeleting = true;
      try {
        await hideRental(this.deletingLoan.RentalID, this.perspective);
        this.showDeleteDialog = false;
        this.deletingLoan = null;
        this.$emit("loan-removed");
      } catch (err) {
        // Hvis kaldet fejler, lukkes dialogen og brugeren får en besked
        this.actionError = "Kunne ikke fjerne lånet. Prøv igen.";
        this.showDeleteDialog = false;
      } finally {
        this.isDeleting = false;
      }
    },

    // Luk dialogen uden at fjerne
    cancelDelete() {
      this.showDeleteDialog = false;
      this.deletingLoan = null;
    },
  },
};
</script>

<template>
  <div class="laan-oversigt">

    <!-- Fejlbesked hvis en handling (afslut eller fjern) fejler.
         Stylet med vores egne tokens, så den matcher resten af appen. -->
    <p v-if="actionError" class="handling-fejl" role="alert">
      <v-icon size="18" icon="mdi-alert-circle" aria-hidden="true" />
      {{ actionError }}
    </p>

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
            <v-icon size="13" class="mr-1" icon="mdi-account-outline" />
            {{ loan.rentalRequest?.renter?.Username }}
          </div>

          <div class="laankort__meta">
            <v-icon size="13" class="mr-1" icon="mdi-calendar-outline" />
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

          <!-- Afslut ét enkelt aktivt lån manuelt — bekræftes i dialog først -->
          <button
            v-if="section.canComplete"
            class="laankort__afslut"
            :aria-label="`Afslut lån: ${loan.rentalRequest?.item?.ItemName}`"
            @click="askComplete(loan)"
          >
            Afslut
          </button>

          <!-- Fjern ét tidligere lån fra egen historik (soft delete) -->
          <button
            v-if="section.canDelete"
            class="laankort__slet"
            :aria-label="`Fjern lån fra historik: ${loan.rentalRequest?.item?.ItemName}`"
            @click="askDelete(loan)"
          >
            Fjern
          </button>

        </div>

      </div>
      </template>

    </div>

    <!-- Bekræftelse inden et aktivt lån afsluttes -->
    <ConfirmDialog
      v-model="showCompleteDialog"
      title="Afslut lån?"
      :message="completingLoan
        ? `Vil du afslutte lånet af ${completingLoan.rentalRequest?.item?.ItemName}? Det kan ikke fortrydes.`
        : 'Vil du afslutte dette lån? Det kan ikke fortrydes.'"
      confirm-label="Afslut lån"
      :loading="isCompleting"
      @confirm="confirmComplete"
      @cancel="cancelComplete"
    />

    <!-- Bekræftelse inden et tidligere lån fjernes fra egen historik -->
    <ConfirmDialog
      v-model="showDeleteDialog"
      title="Fjern lån fra din historik?"
      :message="deletingLoan
        ? `Vil du fjerne lånet af ${deletingLoan.rentalRequest?.item?.ItemName} fra din historik? Det fjernes kun for dig, og den anden part beholder det i sin historik.`
        : 'Vil du fjerne dette lån fra din historik?'"
      confirm-label="Fjern"
      :loading="isDeleting"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />

  </div>
</template>

<style scoped>
.laan-oversigt {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Fejlbesked ved fejlet handling (matcher fejl-farven i appen) */
.handling-fejl {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-body);
  font-size: var(--text-label);
  font-weight: 600;
  color: var(--color-error);
  background: var(--color-surface);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md);
  padding: 12px 16px;
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
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.laan-sektion__antal {
  font-family: var(--font-body);
  font-size: var(--text-meta);
  font-weight: 700;
  background: var(--color-image-bg);
  color: var(--color-text-secondary);
  border-radius: var(--radius-full);
  padding: 1px 8px;
}

.laan-sektion__tom {
  font-family: var(--font-body);
  font-size: var(--text-label);
  color: var(--color-text-secondary);
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
  color: var(--color-text-secondary);
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

/* Afslut-knap på aktive lån */
.laankort__afslut {
  font-family: var(--font-body);
  font-size: var(--text-meta);
  font-weight: 600;
  color: var(--color-text-secondary);
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 2px 8px;
  cursor: pointer;
  white-space: nowrap;
}

/* Fjern-knap på tidligere lån (soft delete fra egen historik) */
.laankort__slet {
  font-family: var(--font-body);
  font-size: var(--text-meta);
  font-weight: 600;
  color: var(--color-error);
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 2px 8px;
  cursor: pointer;
  white-space: nowrap;
}
</style>
