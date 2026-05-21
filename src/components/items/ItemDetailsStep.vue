<script>
// Trin 2 i opret-genstand-flowet.
// Indsamler tilbehør, stand og maksimal låneperiode.
// Validerer felterne inden data sendes videre til trin 3 via go-to-confirm-item.
import MultiStepFormHeader from "@/components/layout/MultiStepFormHeader.vue";
import FormBottomBar       from "@/components/layout/FormBottomBar.vue";

export default {
  name: "ItemDetailsStep",
  components: { MultiStepFormHeader, FormBottomBar },

  props: {
    // Det aktuelle trin sendt videre til MultiStepFormHeader
    currentStep: { type: Number, default: 1 },
  },

  data() {
    return {
      harTilbehoer:    null,   // null = ubesvaret, true/false = brugerens valg
      tilbehoerListe:  [],     // Liste over tilføjet tilbehør
      stand:           null,
      tilbehoerNavn:   "",     // Midlertidigt felt til tilføjelse af nyt tilbehør
      maksLaanePeriode: null,
      brugerdefPeriode: "",    // Udfyldes kun når maksLaanePeriode === "Andet"

      // Valideringsfejl – vises under de respektive felter
      fejl: {
        harTilbehoer:     "",
        tilbehoerListe:   "",
        stand:            "",
        maksLaanePeriode: "",
        brugerdefPeriode: "",
      },
    };
  },

  methods: {
    // Gem om genstanden har tilbehør og ryd fejlbesked
    vaelgTilbehoer(vaerdi) {
      this.harTilbehoer = vaerdi;
      this.fejl.harTilbehoer = "";
    },

    // Tilføj et nyt tilbehørsnavn til listen
    tilfoejTilbehoer() {
      if (!this.tilbehoerNavn || !this.tilbehoerNavn.trim()) return;
      this.tilbehoerListe.push(this.tilbehoerNavn.trim());
      this.tilbehoerNavn = "";
      this.fejl.tilbehoerListe = "";
    },

    // Fjern et tilbehørselement fra listen via dets indeks
    fjernTilbehoer(indeks) {
      this.tilbehoerListe.splice(indeks, 1);
    },

    // Gem standsvalg og ryd fejlbesked
    vaelgStand(vaerdi) {
      this.stand = vaerdi;
      this.fejl.stand = "";
    },

    // Gem maksimal låneperiode og nulstil det brugerdefinerede felt hvis relevant
    vaelgMaksLaanePeriode(vaerdi) {
      this.maksLaanePeriode = vaerdi;
      this.fejl.maksLaanePeriode = "";
      if (vaerdi !== "Andet") {
        this.brugerdefPeriode = "";
        this.fejl.brugerdefPeriode = "";
      }
    },

    // Valider alle felter og returnér true hvis alt er udfyldt korrekt
    valider() {
      let gyldig = true;

      if (this.harTilbehoer === null) {
        this.fejl.harTilbehoer = "Dette felt skal udfyldes";
        gyldig = false;
      } else {
        this.fejl.harTilbehoer = "";
      }

      // Mindst ét tilbehør kræves hvis brugeren valgte "Ja"
      if (this.harTilbehoer && this.tilbehoerListe.length === 0) {
        this.fejl.tilbehoerListe = "Indtast mindst ét tilbehør";
        gyldig = false;
      } else {
        this.fejl.tilbehoerListe = "";
      }

      if (!this.stand) {
        this.fejl.stand = "Dette felt skal udfyldes";
        gyldig = false;
      } else {
        this.fejl.stand = "";
      }

      if (!this.maksLaanePeriode) {
        this.fejl.maksLaanePeriode = "Dette felt skal udfyldes";
        gyldig = false;
      } else {
        this.fejl.maksLaanePeriode = "";
      }

      if (this.maksLaanePeriode === "Andet" && !this.brugerdefPeriode.trim()) {
        this.fejl.brugerdefPeriode = "Indtast en låneperiode";
        gyldig = false;
      } else {
        this.fejl.brugerdefPeriode = "";
      }

      return gyldig;
    },

    // Valider, udsend data og gå videre til bekræftelsesskærmen
    naeste() {
      if (this.valider()) {
        const detaljer = {
          harTilbehoer:   this.harTilbehoer,
          extras:         this.tilbehoerListe,
          condition:      this.stand,
          // Brug det brugerdefinerede felt hvis "Andet" er valgt
          maxLoanPeriod:  this.maksLaanePeriode === "Andet"
            ? this.brugerdefPeriode
            : this.maksLaanePeriode,
        };
        this.$emit("save-details", detaljer);
        this.$emit("go-to-confirm-item");
      }
    },

    // Gå tilbage til trin 1
    tilbage() {
      this.$emit("go-to-page-one");
    },
  },
};
</script>

<template>
  <v-container class="detaljer-container">

    <!-- Formularhoved med titel og trinindikator -->
    <MultiStepFormHeader
      title="Opret ny genstand"
      :currentStep="currentStep"
      :steps="['Grundinfo', 'Detaljer', 'Forhåndsvisning']"
    />

    <h1 class="mt-2 mb-2">Tilbehør og detaljer</h1>
    <p>
      Angiv stand, låneperiode og eventuelt tilbehør, der følger med genstanden.
    </p>

    <!-- Ekstra tilbehør -->
    <section aria-labelledby="tilbehoer-overskrift">
      <h4 id="tilbehoer-overskrift">
        Har genstanden ekstra tilbehør?<span aria-hidden="true"> *</span>
      </h4>

      <!-- Ja/Nej knapper som radiogruppe -->
      <div role="group" aria-labelledby="tilbehoer-overskrift" aria-required="true">
        <v-row>
          <v-col cols="12">
            <v-btn
              class="ma-2 tilbehoer-knap"
              size="large"
              :class="{ valgt: harTilbehoer === true }"
              :aria-pressed="harTilbehoer === true"
              @click="vaelgTilbehoer(true)"
            >
              Ja
            </v-btn>
            <v-btn
              class="ma-2 tilbehoer-knap"
              size="large"
              :class="{ valgt: harTilbehoer === false }"
              :aria-pressed="harTilbehoer === false"
              @click="vaelgTilbehoer(false)"
            >
              Nej
            </v-btn>
            <div v-if="fejl.harTilbehoer" class="fejltekst" role="alert">
              {{ fejl.harTilbehoer }}
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- Tilbehørsliste vises kun hvis brugeren valgte "Ja" -->
      <v-row v-if="harTilbehoer === true">
        <v-col cols="12">

          <!-- Allerede tilføjet tilbehør vist som tags -->
          <div
            v-if="tilbehoerListe.length"
            class="tags-wrapper"
            role="list"
            aria-label="Tilføjet tilbehør"
          >
            <span
              v-for="(element, indeks) in tilbehoerListe"
              :key="indeks"
              class="tag"
              role="listitem"
            >
              {{ element }}
              <button
                class="fjern-tag"
                :aria-label="`Fjern ${element}`"
                @click="fjernTilbehoer(indeks)"
              >
                ×
              </button>
            </span>
          </div>

          <!-- Inputfelt til at tilføje nyt tilbehør -->
          <div class="input-wrapper">
            <input
              type="text"
              placeholder="F.eks. oplader, taske..."
              v-model="tilbehoerNavn"
              class="tekst-input"
              aria-label="Navn på tilbehør"
              @keyup.enter="tilfoejTilbehoer"
            />
            <v-btn
              class="tilfoej-knap"
              icon
              aria-label="Tilføj tilbehør"
              @click="tilfoejTilbehoer"
            >
              +
            </v-btn>
          </div>

          <div v-if="fejl.tilbehoerListe" class="fejltekst" role="alert">
            {{ fejl.tilbehoerListe }}
          </div>
        </v-col>
      </v-row>
    </section>

    <!-- Stand -->
    <section aria-labelledby="stand-overskrift">
      <h4 id="stand-overskrift">Stand<span aria-hidden="true"> *</span></h4>
      <div role="group" aria-labelledby="stand-overskrift" aria-required="true">
        <v-row>
          <v-col cols="12">
            <v-btn class="ma-2 stand-knap" size="large" :class="{ valgt: stand === 'Ny' }"    :aria-pressed="stand === 'Ny'"    @click="vaelgStand('Ny')">Ny</v-btn>
            <v-btn class="ma-2 stand-knap" size="large" :class="{ valgt: stand === 'God' }"   :aria-pressed="stand === 'God'"   @click="vaelgStand('God')">God</v-btn>
            <v-btn class="ma-2 stand-knap" size="large" :class="{ valgt: stand === 'Brugt' }" :aria-pressed="stand === 'Brugt'" @click="vaelgStand('Brugt')">Brugt</v-btn>
            <v-btn class="ma-2 stand-knap" size="large" :class="{ valgt: stand === 'Slidt' }" :aria-pressed="stand === 'Slidt'" @click="vaelgStand('Slidt')">Slidt</v-btn>
            <div v-if="fejl.stand" class="fejltekst" role="alert">
              {{ fejl.stand }}
            </div>
          </v-col>
        </v-row>
      </div>
    </section>

    <!-- Max låneperiode -->
    <section aria-labelledby="laaneperiode-overskrift">
      <h4 id="laaneperiode-overskrift">
        Max låneperiode<span aria-hidden="true"> *</span>
      </h4>
      <div role="group" aria-labelledby="laaneperiode-overskrift" aria-required="true">
        <v-row>
          <v-col cols="12">
            <v-btn class="ma-2 stand-knap" size="large" :class="{ valgt: maksLaanePeriode === '1 dag' }"    :aria-pressed="maksLaanePeriode === '1 dag'"    @click="vaelgMaksLaanePeriode('1 dag')">1 dag</v-btn>
            <v-btn class="ma-2 stand-knap" size="large" :class="{ valgt: maksLaanePeriode === '3 dage' }"   :aria-pressed="maksLaanePeriode === '3 dage'"   @click="vaelgMaksLaanePeriode('3 dage')">3 dage</v-btn>
            <v-btn class="ma-2 stand-knap" size="large" :class="{ valgt: maksLaanePeriode === '1 uge' }"    :aria-pressed="maksLaanePeriode === '1 uge'"    @click="vaelgMaksLaanePeriode('1 uge')">1 uge</v-btn>
            <v-btn class="ma-2 stand-knap" size="large" :class="{ valgt: maksLaanePeriode === '2 uger' }"   :aria-pressed="maksLaanePeriode === '2 uger'"   @click="vaelgMaksLaanePeriode('2 uger')">2 uger</v-btn>
            <v-btn class="ma-2 stand-knap" size="large" :class="{ valgt: maksLaanePeriode === '1 måned' }"  :aria-pressed="maksLaanePeriode === '1 måned'"  @click="vaelgMaksLaanePeriode('1 måned')">1 måned</v-btn>
            <v-btn class="ma-2 stand-knap" size="large" :class="{ valgt: maksLaanePeriode === 'Andet' }"    :aria-pressed="maksLaanePeriode === 'Andet'"    @click="vaelgMaksLaanePeriode('Andet')">Andet</v-btn>
            <div v-if="fejl.maksLaanePeriode" class="fejltekst" role="alert">
              {{ fejl.maksLaanePeriode }}
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- Fritekstfelt vises kun når "Andet" er valgt -->
      <v-row v-if="maksLaanePeriode === 'Andet'">
        <v-col cols="12">
          <div class="input-wrapper">
            <input
              type="text"
              placeholder="F.eks. 10 dage, 3 måneder..."
              v-model="brugerdefPeriode"
              class="tekst-input"
              aria-label="Angiv din låneperiode"
              aria-required="true"
            />
          </div>
          <div v-if="fejl.brugerdefPeriode" class="fejltekst" role="alert">
            {{ fejl.brugerdefPeriode }}
          </div>
        </v-col>
      </v-row>
    </section>

    <!-- Bundnavigation: tilbage til trin 1, næste til bekræftelse -->
    <FormBottomBar @back="tilbage" @next="naeste" />

  </v-container>
</template>

<style scoped>
/* ─── Sidecontainer ──────────────────────────────────────── */
/* padding-bottom sikrer at indhold ikke skjules bag den faste FormBottomBar */
.detaljer-container {
  padding-bottom: calc(96px + env(safe-area-inset-bottom));
}

/* ─── Valideringsfejl ────────────────────────────────────── */
.fejltekst {
  color: #b00020;
  font-size: 14px;
  margin-top: 4px;
}

/* ─── Tilbehørs- og standknapper ─────────────────────────── */
.tilbehoer-knap,
.stand-knap {
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  color: var(--color-neutral);
  font-weight: 500;
  min-width: 100px;
  border-radius: var(--radius-md);
  box-shadow: none;
}

/* ─── Inputfelt-wrapper ──────────────────────────────────── */
.input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

/* ─── Tekst-input ────────────────────────────────────────── */
/* min-height: 44px opfylder WCAG 2.5.5 trykfladekravet */
.tekst-input {
  flex: 1;
  margin: 0;
  border-radius: var(--radius-md);
  border: 2px solid var(--color-input-border);
  min-height: 44px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  font-family: var(--font-body);
  font-size: var(--text-body);
}

/* ─── Tilføj-knap ────────────────────────────────────────── */
.tilfoej-knap {
  background-color: var(--color-primary);
  color: white;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  min-width: 0;
  font-size: 24px;
  padding: 0;
}

/* ─── Tags-wrapper ───────────────────────────────────────── */
.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

/* ─── Enkelt tag ─────────────────────────────────────────── */
.tag {
  background-color: var(--color-bg);
  color: var(--color-neutral);
  padding: 4px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  font-family: var(--font-body);
  font-size: var(--text-meta);
  font-weight: 500;
}

/* ─── Fjern-tag-knap ─────────────────────────────────────── */
.fjern-tag {
  background: transparent;
  border: none;
  color: black;
  font-weight: bold;
  margin-left: 6px;
  cursor: pointer;
}

/* ─── Aktiv/valgt knapstil ───────────────────────────────── */
.valgt {
  background-color: var(--color-primary) !important;
  color: white !important;
}
</style>
