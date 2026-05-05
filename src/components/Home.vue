<script>
export default {
  name: "",
  components: {},
  data() {
    return {};
  },
  computed: {},
  methods: {},
  watch: {},
};
</script>

<template>
  <div class="page-bg">
    <v-container class="text-center">
      <h1 class="mt-15 mb-15">Velkommen til dit lokale fællesskab</h1>
      <v-img
        src="@/assets/images/community.jpg"
        alt="Velkomstbillede"
        class="welcome-image mb-4"
        max-width="500"
        contain
      />

      <div class="flex-grow-1"></div>

      <v-row>
        <v-col cols="12">
          <v-btn
            class="items_button mt-15"
            size="large"
            @click="$emit('go-to-items')"
          >
            Dine genstande
          </v-btn>
        </v-col>

        <v-col cols="12">
          <v-btn class="loans_button" size="large"> Dine lån </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.items_button,
.loans_button {
  background-color: var(--color-primary);
  color: white;
  font-weight: normal;
  min-width: 200px;
  border-radius: var(--radius-md);
}

.welcome-image {
  margin: 0 auto;
}

.page-bg {
  background-color: var(--color-bg);
  min-height: 100vh;
}
</style>
