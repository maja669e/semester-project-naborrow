<script>
// Lånebetingelsesdialog der kræver at brugeren scroller til bunden
// inden acceptknappen aktiveres — sikrer at vilkårene er blevet læst.
export default {
  name: "TermsDialog",

  props: {
    // Styrer om dialogen er åben via v-model
    modelValue: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["update:modelValue"],

  data() {
    return {
      canClose: false,  // Aktiveres når brugeren har scrollet til bunden
    };
  },

  watch: {
    modelValue(val) {
      // Nulstil rul-tilstand hver gang dialogen åbnes
      if (val) {
        this.$nextTick(() => {
          this.canClose = false;
        });
      }
    },
  },

  methods: {
    handleScroll(e) {
      const el = e.target;

      const reachedBottom =
        el.scrollTop + el.clientHeight >= el.scrollHeight - 10;

      if (reachedBottom) {
        this.canClose = true;
      }
    },

    close() {
      if (!this.canClose) return;
      this.$emit("update:modelValue", false);
    },
  },
};
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="520"
    persistent
  >
    <v-card class="terms-dialog">


        <!-- Dialogoverskrift -->
      <header class="header">
        <h1 class="title">Vilkår for lån</h1>
        <p class="subtitle">Sidst opdateret: 18. maj 2026</p>
      </header>
   <!-- Rulleindhold med vilkårene — acceptknap aktiveres ved bunden -->
      <section class="content" @scroll="handleScroll">

        <p>
          Ved at sende en låneanmodning indgår du en aftale med udlåneren om et gratis lån af den valgte genstand.
          LÅKAL er udelukkende den platform, der formidler kontakten — selve låneaftalen er mellem dig og udlåneren.
          Læs venligst vilkårene grundigt, før du accepterer.
        </p>

        <h3>1. Aftalens parter og omfang</h3>
        <p>
          Låneaftalen indgås mellem dig (låntager) og den person, der ejer genstanden (udlåner).
          Begge parter skal være registrerede brugere i samme community på LÅKAL og være fyldt 18 år.
          Aftalen omfatter den specifikke genstand, det aftalte tilbehør og den valgte låneperiode.
        </p>

        <p>
          Lån via LÅKAL er altid gratis. Det er ikke tilladt at aftale betaling, depositum eller andre former for vederlag.
        </p>

        <h3>2. Godkendelse og bindende aftale</h3>
        <p>
          Din anmodning er ikke bindende, før udlåneren har godkendt den. Udlåneren har op til 24 timer til at svare.
          Aftalen træder først i kraft, når godkendelsen er bekræftet i appen.
        </p>

        <p>
          Udlåneren kan til enhver tid før afhentning afvise eller annullere anmodningen uden begrundelse.
        </p>

        <h3>3. Afhentning og aflevering</h3>
        <p>
          Du er forpligtet til at møde op til aftalt tid, inspicere genstanden ved afhentning og aflevere rettidigt.
        </p>

        <h3>4. Dit ansvar som låntager</h3>
        <p>
          Du skal behandle genstanden forsvarligt, anvende den korrekt og ikke overdrage den til tredjemand.
        </p>

        <h3>5. Skader, tab og tyveri</h3>
        <p>
          Du hæfter for genstanden i hele låneperioden. Skader og tab skal erstattes.
        </p>

        <h3>6. Tilladt brug</h3>
        <p>
          Genstanden må kun bruges til privat, ikke-kommercielt brug.
        </p>

        <h3>7. Aflysning fra din side</h3>
        <p>
          Du kan aflyse indtil 12 timer før afhentning.
        </p>

        <h3>8. Kommunikation</h3>
        <p>
          Al kommunikation skal foregå via LÅKALs chat.
        </p>

        <h3>9. Uenigheder</h3>
        <p>
          Uenigheder skal først forsøges løst mellem parterne eller via community-administrator.
        </p>

        <h3>10. LÅKALs rolle og ansvar</h3>
        <p>
          LÅKAL er kun en formidlingsplatform og påtager sig intet ansvar for genstande eller skader.
        </p>

        <h3>11. Persondata</h3>
        <p>
          Dine oplysninger deles med udlåneren i henhold til GDPR.
        </p>

        <h3>12. Misbrug</h3>
        <p>
          Overtrædelser kan føre til udelukkelse fra platformen.
        </p>

        <h3>13. Accept</h3>
        <p>
          Ved at acceptere bekræfter du, at du er fyldt 18 år og har læst vilkårene.
        </p>

        <p class="footer">
          Spørgsmål? Kontakt support@laakal.dk
        </p>

      </section>

        <!-- Acceptknap — deaktiveret indtil brugeren har scrollet til bunden -->
         <footer class="footer-actions">
       <v-btn
         color="primary"
          variant="flat"
          rounded="lg"
          block
          size="large"
          :disabled="!canClose"
          @click="close"
          class="action-btn"
      >
        {{ canClose ? "Luk og accepter" : "Scroll til bunden for at fortsætte" }}
      </v-btn>
</footer>
    </v-card>
  </v-dialog>
</template>

<style scoped>
/* Kortcontainer — matcher SuccessDialog's skygge og afrunding */
.terms-dialog {
  background: #ffffff;
  border-radius: 12px;
  width: min(92vw, 520px);

  border: 1px solid rgba(61, 107, 39, 0.18);
  box-shadow: 0 10px 28px rgba(61, 107, 39, 0.18),
              0 2px 8px rgba(0, 0, 0, 0.14);

  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Overskriftssektion */
.header {
  text-align: center;
  padding: 20px 20px 10px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #1a1a1a;
}

.subtitle {
  font-size: 13px;
  color: #666;
  margin: 6px 0 0;
}

/* Rulleområde med vilkårenes tekst */
.content {
  padding: 0 20px;
  max-height: 55vh;
  overflow-y: auto;
  line-height: 1.6;
  color: #333;
}

.content h3 {
  margin-top: 16px;
  font-size: 14px;
  font-weight: 600;
}

/* Bundtekst med kontaktoplysninger */
.footer {
  margin-top: 20px;
  font-size: 13px;
  color: #666;
}

/* Knapområde i bunden af dialogen */
.footer-actions {
  padding: 16px 20px 20px;
}

.action-btn {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0;
  min-height: 44px;
}
</style>