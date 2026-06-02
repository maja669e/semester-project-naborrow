<script>
// Login-side for LÅKAL.
// Brugeren logger ind med email og adgangskode.
// authStore og goToHome injekteres fra App.vue via provide/inject –
// præcis som goToItems i HomeView og goToCreate i ItemOverviewView.
// Router-vagten i router/index.js sender ikke-loggede brugere hertil automatisk.
export default {
  name: "LoginView",

  inject: ["authStore", "goToHome"],

  data() {
    return {
      email:          "",
      password:       "",
      showError:      "",     // Fejlbesked vist ved forkerte loginoplysninger
      isLoading:      false,  // Deaktiverer knappen mens API-kaldet kører
      showPassword:   false,  // Skifter adgangskodefeltet mellem tekst og password
      formAttempted:  false,  // Skifter adgangskodevalidering til "input" efter første indsendelse
      emailError:     "",     // Emailfejl vises kun ved indsendelse, ryddes når brugeren skriver

      // Adgangskoderegler – køres af Vuetify via form.validate() ved indsendelse
      passwordRules: [
        v => !!v || "Adgangskode er påkrævet.",
      ],
    };
  },

  computed: {
    // Adgangskode: ingen fejl mens brugeren skriver første gang.
    // Efter første indsendelse vises fejl løbende mens brugeren retter.
    passwordValidationEvent() {
      return this.formAttempted ? "input" : "submit";
    },
  },

  methods: {
    // Returnerer en fejlbesked hvis email er ugyldig, ellers tom streng
    checkEmail() {
      if (!this.email) return "Email er påkrævet.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) return "Indtast en gyldig email-adresse.";
      return "";
    },

    // Kaldes ved formularindsendelse – validerer alle felter og logger brugeren ind
    async login() {
      this.formAttempted = true;

      // Validér email manuelt så vi har fuld kontrol over hvornår fejlen vises
      this.emailError = this.checkEmail();

      // Validér adgangskode via Vuetify
      const { valid } = await this.$refs.loginForm.validate();

      if (this.emailError || !valid) return;

      this.showError = "";
      this.isLoading = true;
      try {
        await this.authStore.login(this.email, this.password);
        this.goToHome();
      } catch (err) {
        this.showError = err.message;
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<template>
  <!-- Sidens primære indhold – <main> sikrer korrekt landmark for skærmlæsere -->
  <main class="login-baggrund">
    <v-container class="login-container" max-width="400">

      <!-- Appens navn som primær overskrift -->
      <h1 class="login-titel mb-2">LÅKAL</h1>

      <!-- Beskrivelse af sidens formål – tilknyttet formularen via aria-describedby -->
      <p id="login-beskrivelse" class="login-undertitel mb-8">
        Log ind for at fortsætte
      </p>

      <v-form
        ref="loginForm"
        aria-labelledby="login-beskrivelse"
        novalidate
        @submit.prevent="login"
      >

        <!-- Email styres manuelt – blur-validering har 200ms forsinkelse for at
             undgå falsk fejl under Face ID / biometrisk autofyld -->
        <v-text-field
          v-model="email"
          label="Email"
          variant="outlined"
          prepend-inner-icon="mdi-email-outline"
          autocomplete="email"
          type="email"
          class="mb-3"
          :error-messages="emailError"
          :disabled="isLoading"
          required
          @update:model-value="emailError = ''; showError = ''"
        />

        <v-text-field
          v-model="password"
          label="Adgangskode"
          variant="outlined"
          prepend-inner-icon="mdi-lock-outline"
          :type="showPassword ? 'text' : 'password'"
          :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          :aria-label="showPassword ? 'Adgangskode synlig' : 'Adgangskode skjult'"
          autocomplete="current-password"
          class="mb-2"
          :rules="passwordRules"
          :validate-on="passwordValidationEvent"
          :disabled="isLoading"
          required
          @update:model-value="showError = ''"
          @click:append-inner="showPassword = !showPassword"
        />

        <!-- Fejlbesked fra server – annonceres til skærmlæsere via role="alert" -->
        <v-alert
          v-if="showError"
          type="error"
          variant="tonal"
          class="mb-4"
          density="compact"
          role="alert"
        >
          {{ showError }}
        </v-alert>

        <v-btn
          type="submit"
          block
          size="large"
          class="login-knap"
          :loading="isLoading"
          :aria-busy="isLoading"
        >
          Log ind
        </v-btn>

      </v-form>
    </v-container>
  </main>
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
