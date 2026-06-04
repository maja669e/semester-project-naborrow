<script>
// Tilbehørsvælger til låneanmodnings-flowet.
// Viser genstandens tilbehør som klikbare knapper og toggler valget via v-model.
export default {
  name: "PickAccessories",

  props: {
    // Array af allerede valgte tilbehørsnavn — styres via v-model
    modelValue: {
      type: Array,
      default: () => [],
    },
    // Alle tilgængelige tilbehørsmuligheder for den valgte genstand
    accessories: {
      type: Array,
      default: () => [],
    },
  },

  emits: [
    "update:modelValue",
  ],

  methods: {
    // Tilføj eller fjern tilbehør fra det valgte array
    toggleAccessory(accessory) {
      const updated = [...this.modelValue];

      const index = updated.indexOf(accessory);

      if (index > -1) {
        updated.splice(index, 1);
      } else {
        updated.push(accessory);
      }

      this.$emit("update:modelValue", updated);
    },

    // Returnerer om et bestemt tilbehør er valgt
    isSelected(accessory) {
      return this.modelValue.includes(accessory);
    },
  },
};
</script>

<template>

  <div class="mt-8">

    <div class="d-flex flex-wrap ga-2 mt-3">

      <v-btn
        v-for="accessory in accessories"
        :key="accessory"
        rounded="xl"
        :color="isSelected(accessory) ? 'primary' : ''"
        @click="toggleAccessory(accessory)"
      >
       {{ accessory }}
      </v-btn>

    </div>

  </div>

</template>