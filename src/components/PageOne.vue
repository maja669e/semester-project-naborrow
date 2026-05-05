<script>
import Stepper from "@/components/Stepper.vue";
import { getAllCategories } from '@/services/itemservice.js'

export default {
  name: "PageOne",
  components: {
    Stepper,
  },
  props: {
    currentStep: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
     categories: [],
    selectedCategory: null,
    customCategory: "",
    uploadedImages: [],
    itemName: "",
    brand: "",

    errors: {
      uploadedImages: "",
      selectedCategory: "",
      customCategory: "",
      itemName: "",
      }
    };
  },
  watch: {
    selectedCategory(newVal) {
      if (newVal !== "Andet") {
        this.customCategory = "";
      }
    },
  },
  methods: {
    async fetchCategories() {
    try {
        const data = await getAllCategories()
        this.categories = data
    } catch (err) {
        console.error('Fejl ved hentning af kategorier:', err)
    }
},
    openFileDialog() {
      this.$refs.fileInput.click();
    },
    handleFiles(event) {
      const files = Array.from(event.target.files);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.uploadedImages.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    },
    handleDrop(event) {
      const files = Array.from(event.dataTransfer.files);
      files.forEach((file) => {
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.uploadedImages.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    },
 
    cancel() {
      this.$emit("go-to-items");
    },

     validate() {
  let valid = true;

  // Images
  if (this.uploadedImages.length === 0) {
    this.errors.uploadedImages = "Tilføj mindst ét billede";
    valid = false;
  } else {
    this.errors.uploadedImages = "";
  }

  // Category
  if (!this.selectedCategory) {
    this.errors.selectedCategory = "Vælg en kategori";
    valid = false;
  } else {
    this.errors.selectedCategory = "";
  }

  // Custom category
  if (this.selectedCategory === "Andet" && this.customCategory.trim() === "") {
    this.errors.customCategory = "Indtast en kategori";
    valid = false;
  } else {
    this.errors.customCategory = "";
  }

  // Item name
  if (!this.itemName.trim()) {
    this.errors.itemName = "Indtast et navn på din genstand";
    valid = false;
  } else {
    this.errors.itemName = "";
  }

  return valid;
},
      /*  Gem detaljer og gå videre til næste skridt */
   next() {
  if (this.validate()) {

    const selectedCat = this.categories.find(
      c => c.CategoryName === this.selectedCategory
    );

    const data = {
      category:
        this.selectedCategory === "Andet"
          ? this.customCategory
          : this.selectedCategory,

      categoryID: selectedCat?.CategoryID || null, // ✅ FIXED

      images: this.uploadedImages,
      name: this.itemName,
      brand: this.brand
    };

    console.log("Sending data:", data); // DEBUG

    this.$emit("go-to-add-details", data);
  }
}
  },
  mounted() {
    this.fetchCategories()
  },
};
</script>

<template>
  <v-container class="pa-4" max-width="600">
    <v-toolbar flat color="white" class="top-toolbar">
      <!-- <v-btn icon variant="text" @click="$emit('goBack')">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn> -->

      <v-toolbar-title class="text-center font-weight-bold">
        Opret ny genstand
      </v-toolbar-title>

      <div style="width: 40px"></div>
    </v-toolbar>

    <v-divider />
    <!-- Stepper -->
    <Stepper :currentStep="currentStep" />

    <h2>Beskriv din genstand</h2>
    <p>
      Tilføj billeder, vælg kategori og giv din genstand et navn, så andre kan
      finde den.
    </p>

    <div class="addPhoto">
      <h3>Billeder*</h3>
   
      <!-- Upload photo https://medium.com/swlh/drop-and-click-file-upload-with-vuetifyjs-f2c2a8357377 -->
      <v-card
        class="upload-card d-flex flex-column align-center justify-center text-center"
        @click="openFileDialog"
        @dragover.prevent
        @drop.prevent="handleDrop"
        flat
      >
        <div class="icon-wrapper mb-4">
          <v-icon size="32" color="var(--color-primary)">mdi-camera</v-icon>
        </div>

        <div class="text-h6 font-weight-bold mb-2">
          Tilføj mindst ét billede
        </div>

        <div class="text-body-2 text-medium-emphasis">
          Tryk for at uploade fotos af din genstand
        </div>

        <input
          type="file"
          ref="fileInput"
          multiple
          accept="image/*"
          style="display: none"
          @change="handleFiles"
        />
      </v-card>
<div v-if="errors.uploadedImages" class="error-text">
  {{ errors.uploadedImages }}
</div>
      <!-- Preview uploaded images -->
      <div class="uploaded-images mt-4" v-if="uploadedImages.length">
        <v-img
          v-for="(img, index) in uploadedImages"
          :key="index"
          :src="img"
          max-width="150"
          class="mr-4 mb-4"
          rounded
        />
      </div>
    </div>

    <!-- Category selection -->
    <div>
      <h3>Kategori*</h3>
       <div v-if="errors.selectedCategory" class="error-text">
         {{ errors.selectedCategory }}
        </div>
        <v-btn-toggle v-model="selectedCategory"
  class="category-toggle d-flex flex-wrap ga-2"
  mandatory>
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

      <!--
      <v-btn-toggle
        v-model="selectedCategory"
        class="category-toggle d-flex flex-wrap ga-2"
        mandatory
      >
        <v-btn value="Elektronik" rounded="xl" variant="#eeece8"
          >Elektronik</v-btn
        >
        <v-btn value="Værktøj" rounded="xl" variant="#eeece8">Værktøj</v-btn>
        <v-btn value="Sport" rounded="xl" variant="#eeece8">Sport</v-btn>
        <v-btn value="Køkken" rounded="xl" variant="#eeece8">Køkken</v-btn>
        <v-btn value="Haveredskaber" rounded="xl" variant="#eeece8"
          >Haveredskaber</v-btn
        >
        <v-btn value="Andet" rounded="xl" variant="#eeece8">Andet</v-btn>
      </v-btn-toggle>-->
      
   
      <v-text-field
        v-if="selectedCategory === 'Andet'"
        v-model="customCategory"
        label="Skriv din kategori"
        class="mt-4"
        color="var(--color-primary)"
        variant="outlined"
        rounded="xl"
        clearable
      />
      <div v-if="errors.customCategory" class="error-text">
  {{ errors.customCategory }}
</div>
     

      <h3>Navn på genstand*</h3>
      <div v-if="errors.itemName" class="error-text">
  {{ errors.itemName }}
</div>
      <v-text-field
        v-model="itemName"
        label="Hvad er det for en genstand?"
        class="mt-4"
        color="var(--color-primary)"
        variant="outlined"
        rounded="xl"
      />

      <h3>Mærke</h3>
      <v-text-field
      v-model="brand"
        label="F.eks. Bosch, Apple..."
        class="mt-4"
        color="var(--color-primary)"
        variant="outlined"
        rounded="xl"
      />
    </div>

    <!--  Tilbage og næste knapper -->

    <div class="bottom-bar">
      <v-btn
        variant="tonal"
        rounded="lg"
        color="grey-darken-2"
        class="back-button"
        @click="cancel"
      >
        <v-icon start size="18">mdi-chevron-left</v-icon>
        Tilbage
      </v-btn>

      <v-btn color="primary" rounded="lg" class="create-button" @click="next">
        Næste
      </v-btn>
    </div>
  </v-container>
</template>

<style scoped>
.category-toggle .v-btn--active {
  background-color: var(--color-primary) !important;
  color: white !important;
}

.category-toggle .v-btn {
  height: 36px !important;
  min-width: unset !important;
  padding: 0 12px !important;
}
.category-toggle {
  flex-wrap: wrap !important;
  height: auto !important;
}

.uploaded-images {
  display: flex;
  flex-wrap: wrap;
}
:deep(.v-field) {
  --v-field-border-width: 3px;
}

.upload-card {
  height: 240px;
  border: 2px dashed var(--color-primary);
  border-radius: var(--radius-lg);
  background-color: var(--color-image-bg);
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-card:hover {
  background-color: #E8F0E3;
  border-color: var(--color-primary-dark);
}

/* Icon background */
.icon-wrapper {
  background-color: #E8F0E3;
  border-radius: 20px;
  padding: 16px;
}

.fixed-bottom-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 2px;
}

.bottom-bar {
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 16px;
  display: flex;
  gap: 12px;
}

.back-button {
  flex: 1;
  text-transform: none;
  height: 48px !important;
}

.create-button {
  flex: 3;
  text-transform: none;
  height: 48px !important;
}

.error-text {
  color: red;
  font-size: 14px;
  margin-top: 4px;
}
</style>
