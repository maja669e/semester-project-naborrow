<script>
// Til/fra-knap der styrer om en genstand er synlig for lejere.
// v-model bruger Number (1/0) da databasen gemmer feltet som tinyint.
export default {
  name: 'ToggleButton',
  props: {
    modelValue: {
      type: Number, // 1 = aktiv (synlig), 0 = inaktiv (skjult) — tinyint fra databasen
      required: true
    }
  },
  emits: ['update:modelValue'],
  computed: {
    isActive: {
      get() {
        return this.modelValue === 1
      },
      set(val) {
        this.$emit('update:modelValue', val ? 1 : 0)
      }
    }
  }
}
</script>

<template>
  <v-card class="pa-3 d-flex align-center justify-space-between" rounded="xl" elevation="0">
    
    <!-- Venstre side: ikon og hjælpetekst -->
    <div class="d-flex align-center ga-3">
      
      <!-- Øjeikon skifter om aktivt eller ej -->
      <div class="icon-circle">
        <v-icon :color="isActive ? 'green' : 'grey'">
          {{ isActive ? 'mdi-eye' : 'mdi-eye-off' }}
        </v-icon>
      </div>

      <!-- Hjælpetekst -->
      <div>
        <div class="font-weight-medium">Synlighed</div>
        <div class="text-caption text-medium-emphasis">
          {{ isActive ? 'Synlig for lejere' : 'Skjult for lejere' }}
        </div>
      </div>

    </div>

    <!-- Til/fra-knap (Vuetify v-switch) -->
    <v-switch
      v-model="isActive"
      inset
      hide-details
      density="compact"
      :color="isActive ? 'green' : 'grey'"
    />

  </v-card>
</template>

<style scoped>
.icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #eef3ea;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>