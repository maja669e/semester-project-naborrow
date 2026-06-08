<script>
// Visning af indkommende låneanmodninger for den loggede udlåner.
// Henter kun anmodninger med status "pending" for udlånerens egne genstande.
import AppHeader from "@/components/layout/AppHeader.vue";
import {
  getPendingRequestsByOwner,
  acceptRentalRequest,
  rejectRentalRequest
} from "@/services/rentalrequest/rentalrequestservice.js";

export default {
  name: "RequestsView",

  components: { AppHeader },

  inject: ["authStore"],

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
        const userId = this.authStore.user.value.userID;
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

  }
};
</script>

<template>
  <div>

    <AppHeader
      title="Afventende anmodninger"
      :show-back="true"
      @back="$router.back()"
    />

  <v-container class="py-6 requests-page">

    <!-- Indlæsningsindikator -->
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

    <!-- Liste af anmodninger -->
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

          <!-- Avatar, brugernavn, genstand og status -->
          <div class="d-flex align-start">

            <v-avatar size="52" color="#dfe8c8" class="mr-4">
              <span class="font-weight-bold text-black">
                {{ req.renter.Username?.charAt(0) }}
              </span>
            </v-avatar>

            <div class="flex-grow-1">

              <div class="text-subtitle-1 font-weight-bold text-grey-darken-4">
                {{ req.renter.Username }}
              </div>

              <div class="text-body-2 text-grey-darken-1">
                {{ req.item.ItemName }}
              </div>

              <!-- Beskrivelse fra låneren — vises kun hvis udfyldt -->
              <p v-if="req.MessageToLender" class="description-text mt-1">
                "{{ req.MessageToLender }}"
              </p>

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

          <!-- Godkend / Afvis -->
          <div class="d-flex mt-5 button-actions">

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

  </div>
</template>

<style scoped>
.requests-page {
  max-width: 700px;
  margin: 0 auto;
}

.request-card {
  border: 1px solid #d9d9d9;
  background-color: var(--color-surface);
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
  background: var(--color-surface) !important;
}

.approve-btn {
  background-color: #445628 !important;
  color: white !important;
}

.v-chip {
  font-weight: 600;
}

.description-text {
  font-size: 13px;
  color: var(--color-secondary);
  font-style: italic;
  margin: 0;
}
</style>