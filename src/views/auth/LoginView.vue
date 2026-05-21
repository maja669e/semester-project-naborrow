<script>
// Login-side for LÅKAL.
// Brugeren logger ind med email og adgangskode.
// authStore.logInd() kalder API'et og gemmer brugeren i den centrale auth-tilstand.
// Router-vagten i router/index.js sender ikke-loggede brugere hertil automatisk.
import { authStore } from "@/stores/auth.js";

export default {
  name: "LoginView",

  data() {
    return {
      email:          "",
      adgangskode:    "",
      visFejl:        "",      // Fejlbesked vist ved forkerte oplysninger
      indlaeser:      false,   // Deaktiverer knappen mens API-kaldet kører
      visAdgangskode: false,   // Skifter adgangskodefeltet mellem tekst og password

      // Valideringsregler – køres af Vuetify før formularen indsendes
      emailRegler: [
        v => !!v || "Email er påkrævet.",
        v => /.+@.+\..+/.test(v) || "Indtast en gyldig email-adresse.",
      ],
      adgangskodeRegler: [
        v => !!v || "Adgangskode er påkrævet.",
      ],
    };
  },

  methods: {
    // Kaldes ved formularindsendelse – validerer felter, logger ind og navigerer til forsiden
    async logInd() {
      const { valid } = await this.$refs.loginFormular.validate();
      if (!valid) return;

      this.visFejl = "";
      this.indlaeser = true;
      try {
        await authStore.logInd(this.email, this.adgangskode);
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

      <h1 class="login-titel mb-2">LÅKAL</h1>
      <p class="login-undertitel mb-8">Log ind for at fortsætte</p>

      <v-form ref="loginFormular" @submit.prevent="logInd" validate-on="submit">

        <v-text-field
          v-model="email"
          label="Email"
          variant="outlined"
          prepend-inner-icon="mdi-email-outline"
          autocomplete="email"
          type="email"
          class="mb-3"
          :rules="emailRegler"
          :disabled="indlaeser"
          required
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
          :rules="adgangskodeRegler"
          :disabled="indlaeser"
          required
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
          :disabled="!email || !adgangskode"
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
