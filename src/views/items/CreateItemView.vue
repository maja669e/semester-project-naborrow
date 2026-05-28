<script>
// Orkestreringsvisning for oprettelse af en ny genstand.
// Styrer hvilket trin der vises og samler data fra begge formtrin
// i genstandData, så formularen gendannes korrekt hvis brugeren
// trykker tilbage og retter sine svar.
//
// genstandOprettet injekteres fra App.vue via provide/inject, så denne
// komponent ikke behøver at $emit op igennem router-view-slottet.
import ItemBasicInfoStep from "@/components/items/ItemBasicInfoStep.vue";
import ItemDetailsStep   from "@/components/items/ItemDetailsStep.vue";
import ConfirmItemScreen from "@/components/ConfirmItemScreen.vue";

export default {
  name: "CreateItemView",
  components: { ItemBasicInfoStep, ItemDetailsStep, ConfirmItemScreen },

  // Injekterer callback fra App.vue der håndterer navigation og
  // success-dialog efter vellykket oprettelse.
  inject: ["genstandOprettet"],

  data() {
    return {
      // Aktivt trin i formularen (1 = grundinfo, 2 = detaljer, 3 = bekræftelse)
      trin: 1,

      // Akkumuleret data fra begge formtrin.
      // selectedCategory gemmer btn-toggle-værdien ("Andet" eller kategorinavn)
      // adskilt fra category som er den endelige, løste kategori.
      genstandData: {
        name:             "",
        category:         "",   // Løst kategorinavn (inkl. brugerdefineret)
        selectedCategory: "",   // Btn-toggle-værdien – bruges til at gendanne formens valg
        brand:            "",
        images:           [],
        categoryID:       null,
        condition:        "",
        loanPeriod:       "",
        extras:           [],
        hasExtra:         null, // null = ubesvaret, true/false = brugerens valg
      },
    };
  },

  methods: {
    // Modtager data fra trin 1, gemmer det og går til trin 2
    haandterTrinEt(data) {
      this.genstandData.name             = data.name;
      this.genstandData.category         = data.category;
      this.genstandData.selectedCategory = data.selectedCategory;
      this.genstandData.brand            = data.brand;
      this.genstandData.images           = data.images;
      this.genstandData.categoryID       = data.categoryID;
      this.trin = 2;
    },

    // Modtager data fra trin 2 og gemmer det inden bekræftelse
    haandterTrinTo(detaljer) {
      this.genstandData.condition  = detaljer.condition;
      this.genstandData.loanPeriod = detaljer.maxLoanPeriod;
      this.genstandData.extras     = detaljer.extras;
      this.genstandData.hasExtra   = detaljer.harTilbehoer;
    },
  },
};
</script>

<template>

  <!-- Trin 1: Grundlæggende information (billeder, kategori, navn) -->
  <ItemBasicInfoStep
    v-if="trin === 1"
    :currentStep="1"
    :initialData="genstandData"
    @go-to-add-details="haandterTrinEt"
  />

  <!-- Trin 2: Detaljer (stand, låneperiode, tilbehør) -->
  <ItemDetailsStep
    v-if="trin === 2"
    :currentStep="2"
    :initialData="genstandData"
    @save-details="haandterTrinTo"
    @go-to-confirm-item="trin = 3"
    @go-to-page-one="trin = 1"
  />

  <!-- Trin 3: Forhåndsvisning og bekræftelse inden oprettelse.
       item-created håndteres af den injekterede genstandOprettet-metode
       fra App.vue i stedet for at boble op via $emit. -->
  <ConfirmItemScreen
    v-if="trin === 3 && genstandData"
    :currentStep="3"
    :item="genstandData"
    @goBack="trin = 2"
    @item-created="genstandOprettet($event)"
  />

 
</template>
