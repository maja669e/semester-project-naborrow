<script>
export default {
  name: "CalendarPicker",

  props: {
    startDate: String,
    endDate: String,
  },

  emits: [
    "update:startDate",
    "update:endDate",
  ],
};
</script>

<template>

  <div>

    <v-text-field
      label="Startdato"
      type="date"
      :model-value="startDate"
      @update:model-value="$emit('update:startDate', $event)"
    />

    <v-text-field
      label="Slutdato"
      type="date"
      :model-value="endDate"
      @update:model-value="$emit('update:endDate', $event)"
    />

  </div>

</template>