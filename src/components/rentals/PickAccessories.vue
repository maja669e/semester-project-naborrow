<script>
export default {
  name: "PickAccessories",

  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },

    accessories: {
      type: Array,
      default: () => [],
    },
  },

  emits: [
    "update:modelValue",
  ],

  methods: {
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