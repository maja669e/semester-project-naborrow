<script>
import Home from "@/components/Home.vue";
import MyItems from "@/components/MyItems.vue";
import AddDetails from "@/components/AddDetails.vue";
import PageOne from "@/components/PageOne.vue";
import ConfirmItemScreen from "./components/ConfirmItemScreen.vue";
import SuccessDialog from "./components/SuccessDialog.vue";
import ItemOverviewView from "./components/Genstand/ItemOverviewView.vue";
import Stepper from "@/components/Stepper.vue";


export default {
  components: {
    Home,
    MyItems,
    AddDetails,
    PageOne,
    ConfirmItemScreen,
    SuccessDialog,
    ItemOverviewView,
    Stepper,
  },
  data() {
    return {
      currentPage: "home",
      currentStep: 1,
      showSuccess: false,
      itemsReloadKey: 0,
      selectedItemId: null,
      itemDetails: {
  name: "",
  brand: "",
  category: "",
  images: [],
  condition: "",
  loanPeriod: "",
  extras: [],
  categoryID: null,

},
    };
  },
  methods: {
    goHome() {
      this.currentPage = "home";
    },
    goToItems() {
      this.currentPage = "itemOverview";
    },
    goToPageOne() {
      this.currentPage = "pageOne";
      this.currentStep = 1;
    },
goToAddDetails(data) {
  console.log("PageOne data:", data);

  this.itemDetails.name = data.name || "";
  this.itemDetails.category = data.category || "";
  this.itemDetails.images = data.images || [];
  this.itemDetails.brand = data.brand || "";
  this.itemDetails.categoryID = data.categoryID || 1


  this.currentPage = "addDetails";
  this.currentStep = 2;
},
handleSaveDetails(details) {
  this.itemDetails.condition = details.condition || "";
  this.itemDetails.loanPeriod = details.maxLoanPeriod || "";
  this.itemDetails.extras = details.extras || [];

  console.log("Saved:", this.itemDetails);
},
    goToConfirmItem() {
      this.currentPage = "confirmItem";
      this.currentStep = 3;
    },
    goToItemOverview() {
      this.currentPage = "itemOverview";
    },
    onItemCreated(newId) {
      // navigate to overview then show success dialog and request reload
      this.currentPage = 'itemOverview'
      // Pass the created id so the overview can scroll/highlight the new card.
      // It will not open the detail view anymore.
      this.selectedItemId = newId
      // increment key so ItemOverviewView can refetch
      this.itemsReloadKey += 1
      // show dialog overlay on overview
      this.showSuccess = true
    },
    handleSuccessBack() {
      this.showSuccess = false
      this.currentPage = 'itemOverview'
      // clear selected id after navigating
      this.selectedItemId = null
    }
  },
};
</script>

<template>
  <v-app>
    <v-main>
      <!-- Page navigation -->
      <Home v-if="currentPage === 'home'" @go-to-items="goToItems" />

      <MyItems
        v-if="currentPage === 'items'"
        @go-to-home="goHome"
        @go-to-page-one="goToPageOne"
      />

      <PageOne
        v-if="currentPage === 'pageOne'"
        :currentStep="currentStep"
        @go-to-add-details="goToAddDetails"
        @go-to-items="goToItems"
      />

      <AddDetails
        v-if="currentPage === 'addDetails'"
        :currentStep="currentStep"
        @go-to-home="goHome"
        @go-to-page-one="goToPageOne"
        @save-details="handleSaveDetails"
        @go-to-confirm-item="goToConfirmItem"
      />
      <ConfirmItemScreen
        v-if="currentPage === 'confirmItem'"
        :currentStep="currentStep"
        :item="itemDetails"
        @goBack="currentPage = 'addDetails'"
        @item-created="onItemCreated"
      />

      <SuccessDialog
        v-model="showSuccess"
        title="Oprettet!"
        message="Din genstand er nu oprettet og klar"
        @back-to-overview="handleSuccessBack"
      />

      <item-overview-view
        v-if="currentPage === 'itemOverview'"
        :reloadKey="itemsReloadKey"
        :selectItemId="selectedItemId"
        @go-to-page-one="goToPageOne"
      />
    </v-main>

    <v-btn
      class="ma-2"
      icon="mdi-home"
      location="top left"
      position="absolute"
      color="primary"
      @click="goHome"
    />

    <!-- <v-btn
      class="ma-2"
      icon="mdi-theme-light-dark"
      location="top right"
      position="absolute"
      @click="$vuetify.theme.cycle()" 
    />-->
  </v-app>
</template>
