<script>
// Login-side for LÅKAL.
// Brugeren logger ind med email og adgangskode.
// authStore injekteres fra App.vue via provide/inject.
// Efter vellykket login navigeres direkte via $router.push.
// Router-vagten i router/index.js sender ikke-loggede brugere hertil automatisk.
export default {
  name: "LoginView",

  inject: ["authStore"],

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
        this.$router.push({ name: "home" });
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
  <main class="login-background">
    <v-container class="login-container" max-width="400">

      <!-- Appens navn som primær overskrift -->
      <h1 class="login-title mb-2">LÅKAL</h1>

      <!-- Beskrivelse af sidens formål – tilknyttet formularen via aria-describedby -->
      <p id="login-beskrivelse" class="login-subtitle mb-8">
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
          placeholder="Email"
          aria-label="Email"
          variant="outlined"
          bg-color="login-field"
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
          placeholder="Adgangskode"
          variant="outlined"
          bg-color="login-field"
          prepend-inner-icon="mdi-lock-outline"
          :type="showPassword ? 'text' : 'password'"
          :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          aria-label="Adgangskode"
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
          variant="flat"
          class="login-btn"
          :style="{ background: 'var(--color-on-grad)', color: 'var(--color-brand)' }"
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
/* Baggrundsskærm med brand-gradient */
.login-background {
  min-height: 100vh;
  background: var(--brand-grad);
  display: flex;
  align-items: center;
}

.login-container {
  width: 100%;
}

/* Titel og undertitel er altid hvide — gradienten er altid mørk */
.login-title {
  font-family: var(--font-display);
  font-size: var(--text-h1);
  color: var(--color-on-grad);
  text-align: center;
}

.login-subtitle {
  font-family: var(--font-body);
  font-size: var(--text-body);
  color: var(--color-on-grad);
  text-align: center;
}

/* Fjern browserens native fokus-ring på input-elementet inde i feltet */
:deep(input:focus-visible) {
  outline: none;
}

/* Browsere overskriver baggrunden ved autofyld med deres egen farve.
   Box-shadow-tricket er den eneste pålidelige måde at neutralisere det på. */
:deep(input:-webkit-autofill),
:deep(input:-webkit-autofill:hover),
:deep(input:-webkit-autofill:focus) {
  -webkit-box-shadow: 0 0 0 1000px var(--color-on-grad) inset !important;
  box-shadow: 0 0 0 1000px var(--color-on-grad) inset !important;
}

/* Invers knap — baggrund og farve sættes via :style inline på v-btn.
   var(--color-brand) er fast #2C3B1E og skifter ikke med dark mode. */
.login-btn {
  font-family: var(--font-body);
  border-radius: var(--radius-md);
}
</style>
