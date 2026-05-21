<script>
// Trin 1 i opret-genstand-flowet.
// Indsamler billeder, kategori, navn og mærke.
// Modtager initialData fra CreateItemView så formularen gendannes
// korrekt hvis brugeren trykker tilbage fra trin 2.
import MultiStepFormHeader from "@/components/layout/MultiStepFormHeader.vue";
import FormBottomBar       from "@/components/layout/FormBottomBar.vue";
import { getAllCategories } from "@/services/items/itemservice.js";

export default {
  name: "ItemBasicInfoStep",
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
      kategorier: [],

      // Gendannes fra initialData hvis brugeren er vendt tilbage fra trin 2.
      // selectedCategory er btn-toggle-værdien; kan være "Andet" eller et kategorinavn.
      valgtKategori:     this.initialData.selectedCategory || null,
      brugerdefKategori: this.initialData.selectedCategory === "Andet"
        ? (this.initialData.category || "")
        : "",
      uploadedeBilleder: this.initialData.images?.length
        ? [...this.initialData.images]
        : [],
      genstandNavn: this.initialData.name  || "",
      maerke:       this.initialData.brand || "",

      // Valideringsfejl – vises under de respektive felter
      fejl: {
        uploadedeBilleder: "",
        valgtKategori:     "",
        brugerdefKategori: "",
        genstandNavn:      "",
      },
    };
  },

  watch: {
    // Ryd det brugerdefinerede kategori-felt når en standardkategori vælges
    valgtKategori(nyVaerdi) {
      if (nyVaerdi !== "Andet") this.brugerdefKategori = "";
    },
  },

  methods: {
    // Hent tilgængelige kategorier fra API'et
    async hentKategorier() {
      try {
        this.kategorier = await getAllCategories();
      } catch (fejl) {
        console.error("Fejl ved hentning af kategorier:", fejl);
      }
    },

    // Åbn det skjulte fil-input via en ref
    aabneFilDialog() {
      this.$refs.filInput.click();
    },

    // Konverter uploadede filer til base64 og gem dem i uploadedeBilleder
    haandterFiler(event) {
      Array.from(event.target.files).forEach((fil) => {
        const laeseren = new FileReader();
        laeseren.onload = (e) => this.uploadedeBilleder.push(e.target.result);
        laeseren.readAsDataURL(fil);
      });
    },

    // Understøt drag-and-drop upload – ignorer ikke-billedfiler
    haandterSlip(event) {
      Array.from(event.dataTransfer.files).forEach((fil) => {
        if (!fil.type.startsWith("image/")) return;
        const laeseren = new FileReader();
        laeseren.onload = (e) => this.uploadedeBilleder.push(e.target.result);
        laeseren.readAsDataURL(fil);
      });
    },

    // Annuller oprettelsen og naviger tilbage til genstandsoversigten
    annuller() {
      this.$emit("go-to-items");
    },

    // Valider alle felter og returnér true hvis alt er udfyldt korrekt
    valider() {
      let gyldig = true;

      if (this.uploadedeBilleder.length === 0) {
        this.fejl.uploadedeBilleder = "Tilføj mindst ét billede*";
        gyldig = false;
      } else {
        this.fejl.uploadedeBilleder = "";
      }

      if (!this.valgtKategori) {
        this.fejl.valgtKategori = "Vælg en kategori*";
        gyldig = false;
      } else {
        this.fejl.valgtKategori = "";
      }

      if (this.valgtKategori === "Andet" && !this.brugerdefKategori.trim()) {
        this.fejl.brugerdefKategori = "Indtast en kategori*";
        gyldig = false;
      } else {
        this.fejl.brugerdefKategori = "";
      }

      if (!this.genstandNavn.trim()) {
        this.fejl.genstandNavn = "Indtast et navn på din genstand*";
        gyldig = false;
      } else {
        this.fejl.genstandNavn = "";
      }

      return gyldig;
    },

    // Valider og send data videre til trin 2.
    // selectedCategory gemmes adskilt fra category så CreateItemView
    // kan gendanne btn-toggle-valget hvis brugeren vender tilbage.
    naeste() {
      if (this.valider()) {
        const valgtKat = this.kategorier.find(
          (k) => k.CategoryName === this.valgtKategori
        );
        const data = {
          category:         this.valgtKategori === "Andet"
            ? this.brugerdefKategori
            : this.valgtKategori,
          selectedCategory: this.valgtKategori,
          categoryID:       valgtKat?.CategoryID || null,
          images:           this.uploadedeBilleder,
          name:             this.genstandNavn,
          brand:            this.maerke,
        };
        this.$emit("go-to-add-details", data);
      }
    },
  },

  mounted() {
    this.hentKategorier();
  },
};
</script>

<template>
  <v-container class="pa-4 grundinfo-container" max-width="600">

    <!-- Formularhoved med titel og trinindikator -->
    <MultiStepFormHeader
      title="Opret ny genstand"
      :currentStep="currentStep"
      :steps="['Grundinfo', 'Detaljer', 'Forhåndsvisning']"
    />

    <h2>Beskriv din genstand</h2>
    <p>
      Tilføj billeder, vælg kategori og giv din genstand et navn, så andre kan
      finde den.
    </p>

    <!-- Billeder -->
    <section aria-labelledby="billeder-overskrift">
      <h3 id="billeder-overskrift">Billeder*</h3>

      <!-- Upload-område: understøtter klik, tastatur og drag-and-drop -->
      <v-card
        class="upload-kort d-flex flex-column align-center justify-center text-center"
        role="button"
        tabindex="0"
        aria-label="Upload billeder af din genstand. Tryk Enter eller Space for at åbne filvalg"
        @click="aabneFilDialog"
        @keydown.enter.prevent="aabneFilDialog"
        @keydown.space.prevent="aabneFilDialog"
        @dragover.prevent
        @drop.prevent="haandterSlip"
        flat
      >
        <div class="ikon-wrapper mb-4">
          <v-icon size="32" color="var(--color-primary)">mdi-camera</v-icon>
        </div>
        <div class="text-h6 font-weight-bold mb-2">Tilføj mindst ét billede</div>
        <div class="text-body-2 text-medium-emphasis">
          Tryk for at uploade fotos af din genstand
        </div>
        <!-- Skjult fil-input aktiveret via ref -->
        <input
          type="file"
          ref="filInput"
          multiple
          accept="image/*"
          style="display: none"
          aria-hidden="true"
          tabindex="-1"
          @change="haandterFiler"
        />
      </v-card>

      <!-- Forhåndsvisning af uploadede billeder -->
      <div class="uploadede-billeder mt-4" v-if="uploadedeBilleder.length">
        <v-img
          v-for="(billede, indeks) in uploadedeBilleder"
          :key="indeks"
          :src="billede"
          :alt="`Uploadet billede ${indeks + 1}`"
          max-width="150"
          class="mr-4 mb-4"
          rounded
        />
      </div>

      <div v-if="fejl.uploadedeBilleder" class="fejltekst" role="alert">
        {{ fejl.uploadedeBilleder }}
      </div>
    </section>

    <!-- Kategori -->
    <section aria-labelledby="kategori-overskrift">
      <h3 id="kategori-overskrift">Kategori*</h3>

      <div role="group" aria-labelledby="kategori-overskrift" aria-required="true">
        <v-btn-toggle
          v-model="valgtKategori"
          class="kategori-toggle d-flex flex-wrap ga-2"
          mandatory
        >
          <v-btn
            v-for="kategori in kategorier"
            :key="kategori.CategoryID"
            :value="kategori.CategoryName"
            rounded="xl"
            variant="#eeece8"
          >
            {{ kategori.CategoryName }}
          </v-btn>
        </v-btn-toggle>
      </div>

      <div v-if="fejl.valgtKategori" class="fejltekst" role="alert">
        {{ fejl.valgtKategori }}
      </div>

      <!-- Fritekstfelt vises kun når "Andet" er valgt -->
      <v-text-field
        v-if="valgtKategori === 'Andet'"
        v-model="brugerdefKategori"
        label="Skriv din kategori"
        class="mt-4"
        color="var(--color-primary)"
        variant="outlined"
        rounded="xl"
        clearable
        aria-required="true"
      />
      <div v-if="fejl.brugerdefKategori" class="fejltekst" role="alert">
        {{ fejl.brugerdefKategori }}
      </div>
    </section>

    <!-- Navn på genstand -->
    <section aria-labelledby="navn-overskrift">
      <h3 id="navn-overskrift">Navn på genstand*</h3>
      <v-text-field
        v-model="genstandNavn"
        label="Hvad er det for en genstand?"
        class="mt-4"
        color="var(--color-primary)"
        variant="outlined"
        rounded="xl"
        aria-required="true"
        :error-messages="fejl.genstandNavn ? [fejl.genstandNavn] : []"
      />
    </section>

    <!-- Mærke (valgfrit) -->
    <section aria-labelledby="maerke-overskrift">
      <h3 id="maerke-overskrift">Mærke</h3>
      <v-text-field
        v-model="maerke"
        label="F.eks. Bosch, Apple..."
        class="mt-4"
        color="var(--color-primary)"
        variant="outlined"
        rounded="xl"
      />
    </section>

    <!-- Bundnavigation: tilbage annullerer, næste validerer og går videre -->
    <FormBottomBar @back="annuller" @next="naeste" />

  </v-container>
</template>

<style scoped>
/* ─── Sidecontainer ──────────────────────────────────────── */
/* padding-bottom sikrer at indhold ikke skjules bag den faste FormBottomBar */
.grundinfo-container {
  padding-bottom: calc(96px + env(safe-area-inset-bottom));
}

/* ─── Aktiv kategoriknap ─────────────────────────────────── */
.kategori-toggle .v-btn--active {
  background-color: var(--color-primary) !important;
  color: white !important;
}

/* ─── Kategoriknapper ────────────────────────────────────── */
/* height og padding tilsidesættes da Vuetify's standard er for stor her */
.kategori-toggle .v-btn {
  height: 36px !important;
  min-width: unset !important;
  padding: 0 12px !important;
}

.kategori-toggle {
  flex-wrap: wrap !important;
  height: auto !important;
}

/* ─── Billedforhåndsvisning ──────────────────────────────── */
.uploadede-billeder {
  display: flex;
  flex-wrap: wrap;
}

/* ─── Vuetify felt-border ────────────────────────────────── */
:deep(.v-field) {
  --v-field-border-width: 3px;
}

/* ─── Upload-kort ────────────────────────────────────────── */
.upload-kort {
  height: 240px;
  border: 2px dashed var(--color-primary);
  border-radius: var(--radius-lg);
  background-color: var(--color-image-bg);
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-kort:hover {
  background-color: #e8f0e3;
  border-color: var(--color-primary-dark);
}

/* ─── Kamera-ikon-wrapper ────────────────────────────────── */
.ikon-wrapper {
  background-color: #e8f0e3;
  border-radius: 20px;
  padding: 16px;
}

/* ─── Valideringsfejl ────────────────────────────────────── */
.fejltekst {
  color: #b00020;
  font-size: 14px;
  margin-top: 4px;
}
</style>
