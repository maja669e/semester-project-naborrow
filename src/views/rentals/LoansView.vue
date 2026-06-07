<script>
import LoansOverview from "@/components/rentals/LoansOverview.vue";
import AppbottomNav from "@/components/layout/AppBottomNav.vue";
import { getRentalsByUser } from "@/services/rental/rentalservice.js";
import { getAllRentals } from "@/services/rental/rentalservice.js";
import { authStore } from "@/stores/auth.js";


export default {
  name: "LoansView",

  components: {
    LoansOverview,
    AppbottomNav
  },

  data() {
    return {
      activeLoans: [],
      completedLoans: []
    };
  },
async mounted() {

  console.log("AuthStore:", authStore);

  const userId =
    authStore.user?.value?.UserID ||
    authStore.user?.UserID;

  console.log("UserId:", userId);

  const rentals = await getRentalsByUser(userId);

  console.log("Rentals:", rentals);

  this.activeLoans = rentals.filter(
    r => r.Status === "active"
  );

  this.completedLoans = rentals.filter(
    r => r.Status === "completed"
  );
}
};
</script>

<template>
  <main>
    <h1>Mine lån</h1>

    <LoansOverview
      :active-loans="activeLoans"
      :completed-loans="completedLoans"
    />

    <AppbottomNav />
  </main>
</template>