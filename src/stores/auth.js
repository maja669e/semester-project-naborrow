// Central auth-store for LÅKAL.
// Håndterer login-tilstand på tværs af hele applikationen.
// authStore eksponeres via provide() i App.vue så alle descendant-komponenter
// kan tilgå den aktive bruger og logge ind/ud uden at kende til forælderen.
import { reactive, computed } from "vue";
import { login as loginApi } from "@/services/authservice.js";

// Reaktiv tilstand – bruger er null når ingen er logget ind
const tilstand = reactive({
    bruger: null,
});

export const authStore = {
    // Computed properties afledt af tilstand
    erLoggetInd: computed(() => tilstand.bruger !== null),
    bruger:      computed(() => tilstand.bruger),

    // Kalder login-API og gemmer brugerdata i tilstand ved succes
    async logInd(email, adgangskode) {
        const bruger = await loginApi(email, adgangskode);
        tilstand.bruger = bruger;
    },

    // Nulstiller tilstand – bruges ved logout
    logUd() {
        tilstand.bruger = null;
    },
};
