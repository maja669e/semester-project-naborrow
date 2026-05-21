import { reactive, computed } from "vue";
import { login as loginApi } from "@/services/authservice.js";

const tilstand = reactive({
    bruger: null,
});

export const authStore = {
    erLoggetInd: computed(() => tilstand.bruger !== null),
    bruger:      computed(() => tilstand.bruger),

    async logInd(brugernavn, adgangskode) {
        const bruger = await loginApi(brugernavn, adgangskode);
        tilstand.bruger = bruger;
    },

    logUd() {
        tilstand.bruger = null;
    },
};
