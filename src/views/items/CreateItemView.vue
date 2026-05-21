<script>
// Orkestreringsvisning for oprettelse af en ny genstand.
// Styrer hvilket trin der vises og sender data videre mellem trinene.
// Selve UI-logikken bor i de tre underkomponenter.
import ItemBasicInfoStep from "@/components/items/ItemBasicInfoStep.vue";
import ItemDetailsStep   from "@/components/items/ItemDetailsStep.vue";
import ConfirmItemScreen from "@/components/ConfirmItemScreen.vue";

export default {
  name: "CreateItemView",
  components: { ItemBasicInfoStep, ItemDetailsStep, ConfirmItemScreen },

  data() {
    return {
      // Aktivt trin i formularen (1 = grundinfo, 2 = detaljer, 3 = bekræftelse)
      trin: 1,

      // Akkumuleret data fra begge formtrin der sendes til bekræftelsesskærmen
      genstandData: {
        name:       "",
        category:   "",
        brand:      "",
        images:     [],
        condition:  "",
        loanPeriod: "",
        extras:     [],
      },
    };
  },

  methods: {
    // Modtager data fra trin 1 og går videre til trin 2
    haandterTrinEt(data) {
      this.genstandData.name     = data.name;
      this.genstandData.category = data.category;
      this.genstandData.images   = data.images;
      this.trin = 2;
    },

    // Modtager data fra trin 2 og gemmer det inden bekræftelse
    haandterTrinTo(detaljer) {
      this.genstandData.condition  = detaljer.condition;
      this.genstandData.loanPeriod = detaljer.maxLoanPeriod;
      this.genstandData.extras     = detaljer.extras;
    },
  },
};
</script>

<template>
  <!-- Trin 1: Grundlæggende information (billeder, kategori, navn) -->
  <ItemBasicInfoStep
    v-if="trin === 1"
    :currentStep="1"
    @go-to-add-details="haandterTrinEt"
  />

  <!-- Trin 2: Detaljer (stand, låneperiode, tilbehør) -->
  <ItemDetailsStep
    v-if="trin === 2"
    :currentStep="2"
    @save-details="haandterTrinTo"
    @go-to-confirm-item="trin = 3"
    @go-to-page-one="trin = 1"
  />

  <!-- Trin 3: Forhåndsvisning og bekræftelse inden oprettelse -->
  <ConfirmItemScreen
    v-if="trin === 3 && genstandData"
    :currentStep="3"
    :item="genstandData"
    @goBack="trin = 2"
  />
</template>
