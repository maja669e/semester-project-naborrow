<script>
// Trin 2 i opret-genstand-flowet.
// Indsamler tilbehør, stand og maksimal låneperiode.
// Modtager initialData fra CreateItemView så formularen gendannes
// korrekt hvis brugeren trykker tilbage fra trin 3.
import MultiStepFormHeader from "@/components/layout/MultiStepFormHeader.vue";
import FormBottomBar       from "@/components/layout/FormBottomBar.vue";

export default {
  name: "ItemDetailsStep",
  components: { MultiStepFormHeader, FormBottomBar },

  props: {
    // Det aktuelle trin sendt videre til MultiStepFormHeader
    currentStep: { type: Number, default: 1 },

    // Tidligere udfyldte data fra CreateItemView.
    // Bruges til at gendanne formens tilstand hvis brugeren går tilbage.
    initialData: { type: Object, default: () => ({}) },
  },

  data() {
    return {
      // Gendannes fra initialData hvis brugeren er vendt tilbage fra trin 3
      hasAccessories:  this.initialData.hasExtra   ?? null,
      accessoriesList: this.initialData.extras?.length
        ? [...this.initialData.extras]
        : [],
      condition:       this.initialData.condition  || null,
      maxLoanPeriod:   this.initialData.loanPeriod || null,

      accessoryName: "",   // Midlertidigt felt til tilføjelse af nyt tilbehør
      customPeriod:  "",   // Udfyldes kun når maxLoanPeriod === "Andet"

      // Valideringsfejl – vises under de respektive felter
      errors: {
        hasAccessories:  "",
        accessoriesList: "",
        condition:       "",
        maxLoanPeriod:   "",
        customPeriod:    "",
      },
    };
  },

  computed: {
    // Beregner om formen er gyldig uden at sætte fejlbeskeder.
    // Spejler validate()-logikken og låser næste-knappen via :nextDisabled.
    isFormValid() {
      const accessoriesOk =
        this.hasAccessories === false ||
        (this.hasAccessories === true && this.accessoriesList.length > 0);
      const periodOk =
        this.maxLoanPeriod !== null &&
        (this.maxLoanPeriod !== "Andet" || this.customPeriod.trim() !== "");
      return (
        this.hasAccessories !== null &&
        accessoriesOk &&
        this.condition !== null &&
        periodOk
      );
    },
  },

  methods: {
    // Gem om genstanden har tilbehør og ryd fejlbesked
    selectAccessories(value) {
      this.hasAccessories = value;
      this.errors.hasAccessories = "";
    },

    // Tilføj et nyt tilbehørsnavn til listen — ignorér dubletter
    addAccessory() {
      const name = this.accessoryName.trim();
      if (!name || this.accessoriesList.includes(name)) return;
      this.accessoriesList.push(name);
      this.accessoryName = "";
      this.errors.accessoriesList = "";
    },

    // Fjern et tilbehørselement fra listen via dets indeks
    removeAccessory(index) {
      this.accessoriesList.splice(index, 1);
    },

    // Gem standsvalg og ryd fejlbesked
    selectCondition(value) {
      this.condition = value;
      this.errors.condition = "";
    },

    // Gem maksimal låneperiode og nulstil det brugerdefinerede felt hvis relevant
    selectMaxLoanPeriod(value) {
      this.maxLoanPeriod = value;
      this.errors.maxLoanPeriod = "";
      if (value !== "Andet") {
        this.customPeriod = "";
        this.errors.customPeriod = "";
      }
    },

    // Valider alle felter og returnér true hvis alt er udfyldt korrekt
    validate() {
      let valid = true;

      if (this.hasAccessories === null) {
        this.errors.hasAccessories = "Dette felt skal udfyldes";
        valid = false;
      } else {
        this.errors.hasAccessories = "";
      }

      // Mindst ét tilbehør kræves hvis brugeren valgte "Ja"
      if (this.hasAccessories && this.accessoriesList.length === 0) {
        this.errors.accessoriesList = "Indtast mindst ét tilbehør";
        valid = false;
      } else {
        this.errors.accessoriesList = "";
      }

      if (!this.condition) {
        this.errors.condition = "Dette felt skal udfyldes";
        valid = false;
      } else {
        this.errors.condition = "";
      }

      if (!this.maxLoanPeriod) {
        this.errors.maxLoanPeriod = "Dette felt skal udfyldes";
        valid = false;
      } else {
        this.errors.maxLoanPeriod = "";
      }

      if (this.maxLoanPeriod === "Andet" && !this.customPeriod.trim()) {
        this.errors.customPeriod = "Indtast en låneperiode";
        valid = false;
      } else {
        this.errors.customPeriod = "";
      }

      return valid;
    },

    // Valider, udsend data og gå videre til bekræftelsesskærmen.
    // hasAccessories inkluderes så CreateItemView kan gendanne dette valg
    // hvis brugeren vender tilbage til trin 2 fra trin 3.
    next() {
      if (this.validate()) {
        const details = {
          hasAccessories: this.hasAccessories,
          extras:         this.accessoriesList,
          condition:      this.condition,
          // Brug det brugerdefinerede felt hvis "Andet" er valgt
          maxLoanPeriod:  this.maxLoanPeriod === "Andet"
            ? this.customPeriod
            : this.maxLoanPeriod,
        };
        this.$emit("save-details", details);
        this.$emit("go-to-confirm-item");
      }
    },

    // Gå tilbage til trin 1
    back() {
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
      <!-- h2: sammenhængende niveau efter sidens h1 (WCAG 1.3.1) -->
      <h2 id="tilbehoer-overskrift">
        Har genstanden ekstra tilbehør?<span aria-hidden="true"> *</span>
      </h2>

      <!-- Ja/Nej knapper som radiogruppe -->
      <div role="group" aria-labelledby="tilbehoer-overskrift" aria-required="true">
        <v-row>
          <v-col cols="12">
            <v-btn
              class="ma-2 tilbehoer-knap"
              size="large"
              :class="{ valgt: hasAccessories === true }"
              :aria-pressed="hasAccessories === true"
              @click="selectAccessories(true)"
            >
              Ja
            </v-btn>
            <v-btn
              class="ma-2 tilbehoer-knap"
              size="large"
              :class="{ valgt: hasAccessories === false }"
              :aria-pressed="hasAccessories === false"
              @click="selectAccessories(false)"
            >
              Nej
            </v-btn>
            <div v-if="errors.hasAccessories" class="fejltekst" role="alert">
              {{ errors.hasAccessories }}
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- Tilbehørsliste vises kun hvis brugeren valgte "Ja" -->
      <v-row v-if="hasAccessories === true">
        <v-col cols="12">

          <!-- Allerede tilføjet tilbehør vist som tags -->
          <div
            v-if="accessoriesList.length"
            class="tags-wrapper"
            role="list"
            aria-label="Tilføjet tilbehør"
          >
            <span
              v-for="(el, index) in accessoriesList"
              :key="el"
              class="tag"
              role="listitem"
            >
              {{ el }}
              <v-btn
                icon
                variant="text"
                size="x-small"
                :aria-label="`Fjern ${el}`"
                @click="removeAccessory(index)"
              >
                <v-icon size="14" icon="mdi-close" />
              </v-btn>
            </span>
          </div>

          <!-- Inputfelt til at tilføje nyt tilbehør -->
          <label for="tilbehoer-input" class="visuel-label">Tilbehørsnavn</label>
          <div class="input-wrapper">
            <!-- Ingen aria-label: den synlige <label for="tilbehoer-input"> giver
                 allerede det tilgængelige navn. Et aria-label ville overstyre den
                 synlige tekst og læse noget andet op (WCAG 2.5.3 / 4.1.2). -->
            <input
              id="tilbehoer-input"
              type="text"
              placeholder="F.eks. oplader, taske..."
              v-model="accessoryName"
              class="tekst-input"
              @keyup.enter="addAccessory"
            />
            <v-btn
              class="tilfoej-knap"
              icon
              aria-label="Tilføj tilbehør"
              @click="addAccessory"
            >
              +
            </v-btn>
          </div>

          <div v-if="errors.accessoriesList" class="fejltekst" role="alert">
            {{ errors.accessoriesList }}
          </div>
        </v-col>
      </v-row>
    </section>

    <!-- Stand -->
    <section aria-labelledby="stand-overskrift">
      <h2 id="stand-overskrift">Stand<span aria-hidden="true"> *</span></h2>
      <div role="group" aria-labelledby="stand-overskrift" aria-required="true">
        <v-row>
          <v-col cols="12">
            <v-btn class="ma-2 stand-knap" size="large" :class="{ valgt: condition === 'Ny' }"    :aria-pressed="condition === 'Ny'"    @click="selectCondition('Ny')">Ny</v-btn>
            <v-btn class="ma-2 stand-knap" size="large" :class="{ valgt: condition === 'God' }"   :aria-pressed="condition === 'God'"   @click="selectCondition('God')">God</v-btn>
            <v-btn class="ma-2 stand-knap" size="large" :class="{ valgt: condition === 'Brugt' }" :aria-pressed="condition === 'Brugt'" @click="selectCondition('Brugt')">Brugt</v-btn>
            <v-btn class="ma-2 stand-knap" size="large" :class="{ valgt: condition === 'Slidt' }" :aria-pressed="condition === 'Slidt'" @click="selectCondition('Slidt')">Slidt</v-btn>
            <div v-if="errors.condition" class="fejltekst" role="alert">
              {{ errors.condition }}
            </div>
          </v-col>
        </v-row>
      </div>
    </section>

    <!-- Max låneperiode -->
    <section aria-labelledby="laaneperiode-overskrift">
      <h2 id="laaneperiode-overskrift">
        Max låneperiode<span aria-hidden="true"> *</span>
      </h2>
      <div role="group" aria-labelledby="laaneperiode-overskrift" aria-required="true">
        <v-row>
          <v-col cols="12">
            <v-btn class="ma-2 stand-knap" size="large" :class="{ valgt: maxLoanPeriod === '1 dag' }"   :aria-pressed="maxLoanPeriod === '1 dag'"   @click="selectMaxLoanPeriod('1 dag')">1 dag</v-btn>
            <v-btn class="ma-2 stand-knap" size="large" :class="{ valgt: maxLoanPeriod === '3 dage' }"  :aria-pressed="maxLoanPeriod === '3 dage'"  @click="selectMaxLoanPeriod('3 dage')">3 dage</v-btn>
            <v-btn class="ma-2 stand-knap" size="large" :class="{ valgt: maxLoanPeriod === '1 uge' }"   :aria-pressed="maxLoanPeriod === '1 uge'"   @click="selectMaxLoanPeriod('1 uge')">1 uge</v-btn>
            <v-btn class="ma-2 stand-knap" size="large" :class="{ valgt: maxLoanPeriod === '2 uger' }"  :aria-pressed="maxLoanPeriod === '2 uger'"  @click="selectMaxLoanPeriod('2 uger')">2 uger</v-btn>
            <v-btn class="ma-2 stand-knap" size="large" :class="{ valgt: maxLoanPeriod === '1 måned' }" :aria-pressed="maxLoanPeriod === '1 måned'" @click="selectMaxLoanPeriod('1 måned')">1 måned</v-btn>
            <v-btn class="ma-2 stand-knap" size="large" :class="{ valgt: maxLoanPeriod === 'Andet' }"   :aria-pressed="maxLoanPeriod === 'Andet'"   @click="selectMaxLoanPeriod('Andet')">Andet</v-btn>
            <div v-if="errors.maxLoanPeriod" class="fejltekst" role="alert">
              {{ errors.maxLoanPeriod }}
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- Fritekstfelt vises kun når "Andet" er valgt -->
      <v-row v-if="maxLoanPeriod === 'Andet'">
        <v-col cols="12">
          <label for="periode-input" class="visuel-label">Antal dage</label>
          <div class="input-wrapper">
            <!-- Ingen aria-label: den synlige <label for="periode-input"> "Antal dage"
                 giver navnet. Et aria-label ville overstyre den (WCAG 2.5.3 / 4.1.2). -->
            <input
              id="periode-input"
              type="text"
              placeholder="F.eks. 10 dage, 3 måneder..."
              v-model="customPeriod"
              class="tekst-input"
              aria-required="true"
            />
          </div>
          <div v-if="errors.customPeriod" class="fejltekst" role="alert">
            {{ errors.customPeriod }}
          </div>
        </v-col>
      </v-row>
    </section>

    <!-- Bundnavigation: tilbage til trin 1, næste til bekræftelse -->
    <FormBottomBar :nextDisabled="!isFormValid" @back="back" @next="next" />

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
  color: var(--color-error);
  font-size: 14px;
  margin-top: 4px;
}

/* ─── Synlig label over rå input-felter ─────────────────── */
.visuel-label {
  display: block;
  font-family: var(--font-body);
  font-size: var(--text-label);
  color: var(--color-text-secondary);
  margin-top: var(--space-2);
  margin-bottom: var(--space-1);
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
  color: var(--color-surface);
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


/* ─── Aktiv/valgt knapstil ───────────────────────────────── */
.valgt {
  background-color: var(--color-primary) !important;
  color: var(--color-surface) !important;
}
</style>
