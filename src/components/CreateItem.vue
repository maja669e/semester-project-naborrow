<script>
import PageOne from "./PageOne.vue";
import AddDetails from "./AddDetails.vue";
import ConfirmItemScreen from "./ConfirmItemScreen.vue";

export default {
  components: {
    PageOne,
    AddDetails,
    ConfirmItemScreen,
  },

  data() {
    return {
      step: 1,

      itemData: {
        // Page 1
        name: "",
        category: "",
        brand: "",
        images: [],

        // Page 2
        condition: "",
        loanPeriod: "",
        extras: [],
      },
    };
  },

  methods: {
    //Page 1
    handlePageOne(data) {
      this.itemData.name = data.name;
      this.itemData.category = data.category;
      this.itemData.images = data.images;

      this.step = 2;
    },

    //Page 2
    handlePageTwo(details) {
      this.itemData.condition = details.condition;
      this.itemData.loanPeriod = details.maxLoanPeriod;
      this.itemData.extras = details.extras;
    },
  },
};
</script>

<template>
  <PageOne
    v-if="step === 1"
    :currentStep="1"
    @go-to-add-details="handlePageOne"
  />

  <AddDetails
    v-if="step === 2"
    :currentStep="2"
    @save-details="handlePageTwo"
    @go-to-confirm-item="step = 3"
    @go-to-page-one="step = 1"
  />
<ConfirmItemScreen
  v-if="step === 3 && itemData"
  :currentStep="3"
  :item="itemData"
  @goBack="step = 2"
/>
</template>