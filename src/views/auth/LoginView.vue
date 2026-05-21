<script>
import { authStore } from "@/stores/auth.js";

export default {
  name: "LoginView",

  data() {
    return {
      brugernavn:   "",
      adgangskode:  "",
      visFejl:      "",
      indlaeser:    false,
      visAdgangskode: false,
    };
  },

  methods: {
    async logInd() {
      this.visFejl = "";
      this.indlaeser = true;
      try {
        await authStore.logInd(this.brugernavn, this.adgangskode);
        this.$router.push({ name: "home" });
      } catch (err) {
        this.visFejl = err.message;
      } finally {
        this.indlaeser = false;
      }
    },
  },
};
</script>

<template>
  <div class="login-baggrund">
    <v-container class="login-container" max-width="400">

      <h1 class="login-titel mb-2">Naborrow</h1>
      <p class="login-undertitel mb-8">Log ind for at fortsætte</p>

      <v-form @submit.prevent="logInd">

        <v-text-field
          v-model="brugernavn"
          label="Brugernavn"
          variant="outlined"
          prepend-inner-icon="mdi-account-outline"
          autocomplete="username"
          class="mb-3"
          :disabled="indlaeser"
        />

        <v-text-field
          v-model="adgangskode"
          label="Adgangskode"
          variant="outlined"
          prepend-inner-icon="mdi-lock-outline"
          :type="visAdgangskode ? 'text' : 'password'"
          :append-inner-icon="visAdgangskode ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          autocomplete="current-password"
          class="mb-2"
          :disabled="indlaeser"
          @click:append-inner="visAdgangskode = !visAdgangskode"
        />

        <v-alert
          v-if="visFejl"
          type="error"
          variant="tonal"
          class="mb-4"
          density="compact"
        >
          {{ visFejl }}
        </v-alert>

        <v-btn
          type="submit"
          block
          size="large"
          class="login-knap"
          :loading="indlaeser"
          :disabled="!brugernavn || !adgangskode"
        >
          Log ind
        </v-btn>

      </v-form>
    </v-container>
  </div>
</template>

<style scoped>
.login-baggrund {
  min-height: 100vh;
  background-color: var(--color-bg);
  display: flex;
  align-items: center;
}

.login-container {
  width: 100%;
}

.login-titel {
  font-family: var(--font-display);
  font-size: var(--text-h1);
  color: var(--color-neutral);
  text-align: center;
}

.login-undertitel {
  font-family: var(--font-body);
  font-size: var(--text-body);
  color: var(--color-secondary);
  text-align: center;
}

.login-knap {
  background-color: var(--color-primary);
  color: white;
  font-family: var(--font-body);
  border-radius: var(--radius-md);
}
</style>
