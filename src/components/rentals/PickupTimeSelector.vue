<script>
export default {
  name: "PickupTimeSelector",

  props: {
    modelValue: String,
  },

  emits: [
    "update:modelValue",
  ],

  data() {
    return {
      options: [
        "Morgen",
        "Formiddag",
        "Eftermiddag",
        "Aften",
      ],
    };
  },
};
</script>

<template>

  <div class="mt-6">

    <h3>Afhentningstidspunkt*</h3>

    <v-btn-toggle
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      class="d-flex flex-wrap ga-2 mt-3"
      mandatory
    >

      <v-btn
        v-for="option in options"
        :key="option"
        :value="option"
        rounded="xl"
      >
        {{ option }}
      </v-btn>

    </v-btn-toggle>

  </div>

</template>

<style scoped>

.v-btn-toggle .v-btn--active {
  background-color: var(--color-primary) !important;
  color: white !important;
}

</style>