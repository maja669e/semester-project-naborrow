<script>
// Visning af indkommende låneanmodninger for den loggede udlåner.
// Henter kun anmodninger med status "pending" for udlånerens egne genstande.
import { authStore } from "@/stores/auth.js";
import {
  getPendingRequestsByOwner,
  acceptRentalRequest,
  rejectRentalRequest
} from "@/services/rentalRequest/rentalRequestService";

export default {
  name: "RequestsView",

  data() {
    return {
      requests: [],
      loading: false,
    };
  },

  async mounted() {
    await this.loadRequests();
  },

  methods: {
    async loadRequests() {
      this.loading = true;

      try {
        const userId = authStore.user.value.userID;
        this.requests = await getPendingRequestsByOwner(userId);
      } finally {
        this.loading = false;
      }
    },

    async accept(id) {
      await acceptRentalRequest(id);
      await this.loadRequests();
    },

    async reject(id) {
      await rejectRentalRequest(id);
      await this.loadRequests();
    },

    // Oversætter backend-statuskoder til dansk.
    // 'approved' matcher SQL CHECK-constraint — ikke 'accepted'
    formatStatus(status) {
      if (status === "pending")  return "Afventer";
      if (status === "approved") return "Godkendt";
      if (status === "rejected") return "Afvist";
      return status;
    },

    // Returnerer Vuetify-farve baseret på status
    statusColor(status) {
      if (status === "pending")  return "orange";
      if (status === "approved") return "green";
      if (status === "rejected") return "red";
      return "grey";
    },

    // Parser JSON-tekst fra databasen til et array.
    // Returnerer tomt array hvis værdien er null eller ugyldig JSON.
    parseJson(value) {
      try {
        return JSON.parse(value) ?? [];
      } catch {
        return [];
      }
    },

    // Formaterer en ISO-dato (YYYY-MM-DD) til dansk kortform, fx "1. jun 2025"
    formatDate(dateStr) {
      if (!dateStr) return "–";
      const d = new Date(dateStr);
      const months = ["jan","feb","mar","apr","maj","jun","jul","aug","sep","okt","nov","dec"];
      return `${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`;
    },
  }
};
</script>

<template>
  <v-container class="py-6 requests-page">

    <v-row class="mb-4">
      <v-col cols="12">
        <h1 class="text-h5 font-weight-bold">
          Afventende anmodninger
        </h1>
      </v-col>
    </v-row>

    <!-- LOADING -->
    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" />
      </v-col>
    </v-row>

    <!-- Hvis tomt -->
    <v-row v-else-if="requests.length === 0">
      <v-col cols="12">
        <v-alert type="info" variant="tonal">
          Ingen anmodninger
        </v-alert>
      </v-col>
    </v-row>

    <!-- LIST -->
    <v-row v-else dense>
      <v-col
        v-for="req in requests"
        :key="req.RentalRequestID"
        cols="12"
      >
        <v-card
          class="request-card pa-4"
          rounded="xl"
          elevation="0"
        >

          <!-- HEADER: avatar + brugernavn + genstand + status -->
          <div class="d-flex align-start">

            <v-avatar size="52" color="#dfe8c8" class="mr-4">
              <span class="font-weight-bold text-black">
                {{ req.renter.Username?.charAt(0) }}
              </span>
            </v-avatar>

            <div class="flex-grow-1">
              <p class="renter-name">{{ req.renter.Username }}</p>
              <p class="item-name">{{ req.item.ItemName }}</p>
              <v-chip
                size="x-small"
                :color="statusColor(req.Status)"
                class="mt-2"
                variant="tonal"
              >
                {{ formatStatus(req.Status) }}
              </v-chip>
            </div>

          </div>

          <!-- DETALJER: periode, afhentning, tilbehør -->
          <dl class="details-section mt-4">

            <div class="detail-row">
              <dt class="detail-label">Periode</dt>
              <dd class="detail-value">
                {{ formatDate(req.StartDate) }} – {{ formatDate(req.EndDate) }}
              </dd>
            </div>

            <div class="detail-row" v-if="parseJson(req.PickupTimes).length">
              <dt class="detail-label">Afhentning</dt>
              <dd class="detail-value">{{ parseJson(req.PickupTimes).join(", ") }}</dd>
            </div>

            <div class="detail-row" v-if="parseJson(req.SelectedAccessories).length">
              <dt class="detail-label">Tilbehør</dt>
              <dd class="detail-value">{{ parseJson(req.SelectedAccessories).join(", ") }}</dd>
            </div>

          </dl>

          <!-- BESKRIVELSE: vises som fremhævet blok da det er løbende tekst -->
          <blockquote v-if="req.MessageToLender" class="description-block mt-3">
            <p class="description-label">Beskrivelse fra låner</p>
            <p class="description-text">{{ req.MessageToLender }}</p>
          </blockquote>

          <!-- HANDLINGER -->
          <div class="d-flex mt-4 button-actions">

            <v-btn
              color="error"
              variant="outlined"
              size="small"
              class="action-btn reject-btn mr-3"
              @click="reject(req.RentalRequestID)"
            >
              Afvis
            </v-btn>

            <v-btn
              color="success"
              variant="flat"
              size="small"
              class="action-btn approve-btn"
              @click="accept(req.RentalRequestID)"
            >
              ✓ Godkend
            </v-btn>

          </div>

        </v-card>
      </v-col>
    </v-row>

  </v-container>
</template>

<style scoped>
.requests-page {
  max-width: 700px;
  margin: 0 auto;
}

.request-card {
  border: 1px solid #d9d9d9;
  background-color: white;
  padding: 18px;
}

.text-body-2 {
  line-height: 1.4;
}

.action-btn {
  text-transform: none;
  font-weight: 700;
  border-radius: 10px;
  min-width: 105px;
  letter-spacing: 0;
}

.reject-btn {
  border: 1px solid #e3aaaa !important;
  color: #b23a3a !important;
  background: white !important;
}

.approve-btn {
  background-color: #445628 !important;
  color: white !important;
}

.v-chip {
  font-weight: 600;
}

.renter-name {
  font-size: 15px;
  font-weight: 600;
  color: #222;
  margin: 0;
}

.item-name {
  font-size: 13px;
  color: #666;
  margin: 2px 0 0;
}

.details-section {
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
  margin: 0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 0;
  font-size: 13px;
}

.detail-label {
  color: #888;
  flex-shrink: 0;
}

.detail-value {
  color: #333;
  text-align: right;
}

.description-block {
  background: #f7f9f4;
  border-left: 3px solid #445628;
  border-radius: 0 8px 8px 0;
  padding: 10px 14px;
  margin: 0;
}

.description-label {
  font-size: 11px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 4px;
}

.description-text {
  font-size: 13px;
  color: #333;
  margin: 0;
  line-height: 1.5;
}
</style>