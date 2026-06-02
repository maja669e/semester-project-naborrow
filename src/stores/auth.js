// Central auth-store for LÅKAL.
// Håndterer login-tilstand på tværs af hele applikationen.
// authStore eksponeres via provide() i App.vue så alle descendant-komponenter
// kan tilgå den aktive bruger og logge ind/ud uden at kende til forælderen.
import { reactive, computed } from "vue";
import { login as loginApi } from "@/services/authservice.js";

// Reaktiv tilstand – gendannes fra localStorage så login overlever sideopdatering
const state = reactive({
    user: JSON.parse(localStorage.getItem("laakl_bruger")) || null,
});

export const authStore = {
    // Computed properties afledt af tilstand
    isLoggedIn: computed(() => state.user !== null),
    user:       computed(() => state.user),

    // Kalder login-API og gemmer brugerdata i tilstand og localStorage ved succes
    async login(email, password) {
        const userData = await loginApi(email, password);
        state.user = userData;
        localStorage.setItem("laakl_bruger", JSON.stringify(userData));
    },

    // Nulstiller tilstand og fjerner bruger fra localStorage – bruges ved logout
    logout() {
        state.user = null;
        localStorage.removeItem("laakl_bruger");
    },
};
