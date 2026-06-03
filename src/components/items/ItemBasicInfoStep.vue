<script>
// Trin 1 i opret-genstand-flowet.
// Indsamler billeder, kategori, navn og mærke.
// Modtager initialData fra CreateItemView så formularen gendannes
// korrekt hvis brugeren trykker tilbage fra trin 2.
import MultiStepFormHeader from "@/components/layout/MultiStepFormHeader.vue";
import FormBottomBar       from "@/components/layout/FormBottomBar.vue";
import { getAllCategories } from "@/services/items/itemservice.js";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

export default {
  name: "ItemBasicInfoStep",
  components: { MultiStepFormHeader, FormBottomBar, ConfirmDialog },

  props: {
    // Det aktuelle trin sendt videre til MultiStepFormHeader
    currentStep: { type: Number, default: 1 },

    // Tidligere udfyldte data fra CreateItemView.
    // Bruges til at gendanne formens tilstand hvis brugeren går tilbage.
    initialData: { type: Object, default: () => ({}) },
  },

  data() {
    return {
      showCancelDialog: false,
      categories: [],

      // Gendannes fra initialData hvis brugeren er vendt tilbage fra trin 2.
      // selectedCategory er btn-toggle-værdien; kan være "Andet" eller et kategorinavn.
      selectedCategory: this.initialData.selectedCategory || null,
      customCategory:   this.initialData.selectedCategory === "Andet"
        ? (this.initialData.category || "")
        : "",
      uploadedImages: this.initialData.images?.length
        ? [...this.initialData.images]
        : [],
      itemName: this.initialData.name  || "",
      brand:    this.initialData.brand || "",

      // Valideringsfejl – vises under de respektive felter
      errors: {
        uploadedImages:   "",
        selectedCategory: "",
        customCategory:   "",
        itemName:         "",
      },
    };
  },

  watch: {
    // Ryd det brugerdefinerede kategori-felt når en standardkategori vælges
    selectedCategory(newValue) {
      if (newValue !== "Andet") this.customCategory = "";
    },
  },

  methods: {
    // Hent tilgængelige kategorier fra API'et
    async fetchCategories() {
      try {
        this.categories = await getAllCategories();
      } catch (err) {
        console.error("Fejl ved hentning af kategorier:", err);
      }
    },

    // Åbn det skjulte fil-input via en ref
    openFileDialog() {
      this.$refs.filInput.click();
    },

    // Konverter uploadede filer til base64 og gem dem i uploadedImages
    handleFiles(event) {
      Array.from(event.target.files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => this.uploadedImages.push(e.target.result);
        reader.readAsDataURL(file);
      });
    },

    // Understøt drag-and-drop upload – ignorer ikke-billedfiler
    handleDrop(event) {
      Array.from(event.dataTransfer.files).forEach((file) => {
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (e) => this.uploadedImages.push(e.target.result);
        reader.readAsDataURL(file);
      });
    },

    // Annuller oprettelse – vis bekræftelsesdialog hvis der er indtastet data, ellers gå tilbage med det samme
cancel() {
  if (this.hasEnteredData()) {
    this.showCancelDialog = true;
  } else {
    this.confirmCancel();
  }
},

confirmCancel() {
  this.$router.push({ name: "items" });
},
   
hasEnteredData() {
  return (
    this.uploadedImages.length > 0 ||
    this.selectedCategory !== null ||
    this.customCategory.trim() !== "" ||
    this.itemName.trim() !== "" ||
    this.brand.trim() !== ""
  );
},

    // Valider alle felter og returnér true hvis alt er udfyldt korrekt
    validate() {
      let valid = true;

      if (this.uploadedImages.length === 0) {
        this.errors.uploadedImages = "Tilføj mindst ét billede*";
        valid = false;
      } else {
        this.errors.uploadedImages = "";
      }

      if (!this.selectedCategory) {
        this.errors.selectedCategory = "Vælg en kategori*";
        valid = false;
      } else {
        this.errors.selectedCategory = "";
      }

      if (this.selectedCategory === "Andet" && !this.customCategory.trim()) {
        this.errors.customCategory = "Indtast en kategori*";
        valid = false;
      } else {
        this.errors.customCategory = "";
      }

      if (!this.itemName.trim()) {
        this.errors.itemName = "Indtast et navn på din genstand*";
        valid = false;
      } else {
        this.errors.itemName = "";
      }

      return valid;
    },

    // Valider og send data videre til trin 2.
    // selectedCategory gemmes adskilt fra category så CreateItemView
    // kan gendanne btn-toggle-valget hvis brugeren vender tilbage.
    next() {
      if (this.validate()) {
        const matchedCategory = this.categories.find(
          (k) => k.CategoryName === this.selectedCategory
        );
        const data = {
          category:         this.selectedCategory === "Andet"
            ? this.customCategory
            : this.selectedCategory,
          selectedCategory: this.selectedCategory,
          categoryID:       matchedCategory?.CategoryID || null,
          images:           this.uploadedImages,
          name:             this.itemName,
          brand:            this.brand,
        };
        this.$emit("go-to-add-details", data);
      }
    },
  },

  mounted() {
    this.fetchCategories();
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
        @click="openFileDialog"
        @keydown.enter.prevent="openFileDialog"
        @keydown.space.prevent="openFileDialog"
        @dragover.prevent
        @drop.prevent="handleDrop"
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
          @change="handleFiles"
        />
      </v-card>

      <!-- Forhåndsvisning af uploadede billeder -->
      <div class="uploadede-billeder mt-4" v-if="uploadedImages.length">
        <v-img
          v-for="(img, index) in uploadedImages"
          :key="index"
          :src="img"
          :alt="`Uploadet billede ${index + 1}`"
          max-width="150"
          class="mr-4 mb-4"
          rounded
        />
      </div>

      <div v-if="errors.uploadedImages" class="fejltekst" role="alert">
        {{ errors.uploadedImages }}
      </div>
    </section>

    <!-- Kategori -->
    <section aria-labelledby="kategori-overskrift">
      <h3 id="kategori-overskrift">Kategori*</h3>

      <div role="group" aria-labelledby="kategori-overskrift" aria-required="true">
        <v-btn-toggle
          v-model="selectedCategory"
          class="kategori-toggle d-flex flex-wrap ga-2"
          mandatory
        >
          <v-btn
            v-for="category in categories"
            :key="category.CategoryID"
            :value="category.CategoryName"
            rounded="xl"
            variant="#eeece8"
          >
            {{ category.CategoryName }}
          </v-btn>
        </v-btn-toggle>
      </div>

      <div v-if="errors.selectedCategory" class="fejltekst" role="alert">
        {{ errors.selectedCategory }}
      </div>

      <!-- Fritekstfelt vises kun når "Andet" er valgt -->
      <v-text-field
        v-if="selectedCategory === 'Andet'"
        v-model="customCategory"
        label="Skriv din kategori"
        class="mt-4"
        color="var(--color-primary)"
        variant="outlined"
        rounded="xl"
        clearable
        aria-required="true"
      />
      <div v-if="errors.customCategory" class="fejltekst" role="alert">
        {{ errors.customCategory }}
      </div>
    </section>

    <!-- Navn på genstand -->
    <section aria-labelledby="navn-overskrift">
      <h3 id="navn-overskrift">Navn på genstand*</h3>
      <v-text-field
        v-model="itemName"
        label="Hvad er det for en genstand?"
        class="mt-4"
        color="var(--color-primary)"
        variant="outlined"
        rounded="xl"
        aria-required="true"
        :error-messages="errors.itemName ? [errors.itemName] : []"
      />
    </section>

    <!-- Mærke (valgfrit) -->
    <section aria-labelledby="maerke-overskrift">
      <h3 id="maerke-overskrift">Mærke</h3>
      <v-text-field
        v-model="brand"
        label="F.eks. Bosch, Apple..."
        class="mt-4"
        color="var(--color-primary)"
        variant="outlined"
        rounded="xl"
      />
    </section>

    <!-- Bundnavigation: tilbage annullerer, næste validerer og går videre -->
    <FormBottomBar @back="cancel" @next="next" />


    <ConfirmDialog
  v-model="showCancelDialog"
  title="Annuller oprettelse?"
  message="Er du sikker på, at du vil annullere oprettelsen? Alle oplysninger du har indtastet vil gå tabt."
  confirm-label="Ja, annuller"
  @confirm="confirmCancel"
/>
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
