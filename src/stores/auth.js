// Central auth-store for LÅKAL.
// Håndterer login-tilstand på tværs af hele applikationen.
// authStore eksponeres via provide() i App.vue så alle descendant-komponenter
// kan tilgå den aktive bruger og logge ind/ud uden at kende til forælderen.
import { reactive, computed } from "vue";
import { login as loginApi } from "@/services/authservice.js";

// Reaktiv tilstand – gendannes fra localStorage så login overlever sideopdatering
const tilstand = reactive({
    bruger: JSON.parse(localStorage.getItem("laakl_bruger")) || null,
});

export const authStore = {
    // Computed properties afledt af tilstand
    erLoggetInd: computed(() => tilstand.bruger !== null),
    bruger:      computed(() => tilstand.bruger),

    // Kalder login-API og gemmer brugerdata i tilstand og localStorage ved succes
    async logInd(email, adgangskode) {
        const bruger = await loginApi(email, adgangskode);
        tilstand.bruger = bruger;
        localStorage.setItem("laakl_bruger", JSON.stringify(bruger));
    },

    // Nulstiller tilstand og fjerner bruger fra localStorage – bruges ved logout
    logUd() {
        tilstand.bruger = null;
        localStorage.removeItem("laakl_bruger");
    },
};
