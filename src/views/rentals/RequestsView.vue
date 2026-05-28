<script>
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
        const userId = authStore.bruger.value.userID;
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

    // Ændrer backend statuskoder til dansk på hjemmesiden
    formatStatus(status) {
      if (status === "pending") return "Afventer";
      if (status === "accepted") return "Godkendt";
      if (status === "rejected") return "Afvist";
      return status;
    },

    // Ændrer farve baseret på dens status
    statusColor(status) {
      if (status === "pending") return "orange";
      if (status === "accepted") return "green";
      if (status === "rejected") return "red";
      return "grey";
    }
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
        :key="req.RequestID"
        cols="12"
      >
        <v-card
          class="request-card pa-4"
          rounded="xl"
          elevation="0"
        >

          <!-- TOP CONTENT -->
<div class="d-flex align-start">

  <!-- LEFT AVATAR -->
  <v-avatar
    size="52"
    color="#dfe8c8"
    class="mr-4"
  >
    <span class="font-weight-bold text-black">
      {{ req.renter.firstName?.charAt(0) }}
    </span>
  </v-avatar>

  <!-- INFO -->
  <div class="flex-grow-1">

    <div class="text-subtitle-1 font-weight-bold text-grey-darken-4">
      Bob Test
    </div>

  
    <div class="text-body-2 text-grey-darken-1">
      {{ req.item.ItemName }}
    </div>

    <!-- STATUS CHIP -->
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

<!-- BUTTONS UNDER CONTENT -->
<div class="d-flex mt-5 button-actions">

  <v-btn
    color="error"
    variant="outlined"
    size="small"
    class="action-btn reject-btn mr-3"
    @click="reject(req.RequestID)"
  >
    Afvis
  </v-btn>

  <v-btn
    color="success"
    variant="flat"
    size="small"
    class="action-btn approve-btn"
    @click="accept(req.RequestID)"
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

.button-row {
  gap: 10px;
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
</style>