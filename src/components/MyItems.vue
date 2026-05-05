<template>
  <v-container class="text-center">
    <h1 class="mt-15 mb-2">Dine genstande</h1>

    <v-row>
      <v-col cols="12">
        <v-btn
          class="ma-2 new_item_button"
          size="large"
          @click="$emit('go-to-page-one')"
        >
          + Opret genstand
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.new_item_button {
  background-color: var(--color-primary);
  color: white;
  font-weight: normal;
  min-width: 200px;
  border-radius: var(--radius-md);
}
</style>
