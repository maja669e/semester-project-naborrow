<script>
// Detaljeskærm for én genstand.
// Viser billede, metadata, tilbehør, ejerinfo og statistik.
// Understøtter to tilstande: visning (standard) og redigering (isEditing).
// Sletning sker via ConfirmDialog for at undgå utilsigtet sletning.
import { deleteItem, updateItem } from "@/services/items/itemservice.js";
import ToggleButton  from "@/components/ToggleButton.vue";
import ConfirmDialog from "@/components/feedback/ConfirmDialog.vue";
import StatusBadge   from "@/components/common/StatusBadge.vue";

export default {
  name: "ItemDetailView",
  components: { ToggleButton, ConfirmDialog, StatusBadge },

  props: {
    id:          { type: Number, required: true },
    title:       { type: String, required: true },
    category:    { type: String, required: true },
    // Mærke og stand er valgfrie – ikke alle genstande har dem
    brand:       { type: String, default: null },
    // Kanonisk status-slug ("tilgaengelig" | "udlaant" | "inaktiv")
    status:      { type: String, required: true },
    // Valgfri returdato til "udlaant"
    statusDate:  { type: String, default: "" },
    // Eksplicit aktiv-flag – en udlånt genstand er stadig aktiv, så
    // toggle-starttilstanden må ikke udledes af status-slug'en.
    isActive:    { type: Boolean, default: true },
    image:       { type: String, required: true },
    // imagePath er den rå server-sti (ikke base64) brugt ved opdatering
    imagePath:   { type: String, default: null },
    condition:   { type: String, default: null },
    maxDays:     { type: Number, default: null },
    accessories: { type: String, default: null },
    totalLoans:  { type: Number, default: 0 },
    activeLoans: { type: Number, default: 0 },
    rating:      { type: Number, default: null },
  },

  data() {
    return {
      showDeleteDialog: false,  // Styrer om ConfirmDialog er åben
      isDeleting:       false,  // Viser indlæsningsindikator mens sletning pågår
      isEditing:        false,  // Skifter mellem visnings- og redigeringstilstand
      editedItem:       {},     // Arbejdskopi af genstandsdata under redigering

      // Valideringsfejl vist under de respektive felter i redigeringstilstand
      errors: {
        image:       null,
        category:    null,
        title:       null,
        condition:   null,
        maxRentDays: null,
        accessories: null,
      },
    };
  },

  computed: {
    // Konvertér den kommaseparerede tilbehørsstreng til et array af tags
    accessoriesList() {
      if (!this.accessories) return [];
      return this.accessories.split(",").map((el) => el.trim());
    },
  },

  methods: {
    // Åbn sletbekræftelsesdialogen
    openDeleteDialog() {
      this.showDeleteDialog = true;
    },

    // Luk dialogen uden at slette
    cancelDeletion() {
      this.showDeleteDialog = false;
    },

    // Slet genstanden permanent via API'et og underret forælderen
    async deleteItem() {
      this.isDeleting = true;
      try {
        await deleteItem(this.id);
        this.showDeleteDialog = false;
        this.$emit("itemDeleted", this.title);
      } catch (err) {
        console.error("Fejl ved sletning af genstand:", err);
      } finally {
        this.isDeleting = false;
      }
    },

    // Opret en arbejdskopi af genstandsdata og skift til redigeringstilstand
    startEditing() {
      this.isEditing = true;
      this.editedItem = {
        title:        this.title,
        category:     this.category,
        brand:        this.brand,
        status:       this.status,
        condition:    this.condition,
        maxRentDays:  this.maxDays,
        accessories:  this.accessories || "",
        image:        this.image,
        rawImage:     this.imagePath,
        imageBase64:  null,   // Udfyldes kun hvis brugeren uploader et nyt billede
        imagePreview: null,
        // IsActive: 1 = aktiv, 0 = inaktiv. Tages fra det eksplicitte flag, ikke
        // fra status-slug'en (en udlånt genstand er stadig aktiv).
        isActive: this.isActive ? 1 : 0,
      };
    },

    // Gem ændringerne via API'et og underret forælderen om den opdaterede genstand
    async saveEditing() {
      if (!this.validate()) return;
      try {
        const payload = {
          ItemName:          this.editedItem.title,
          CategoryName:      this.editedItem.category,
          Brand:             this.editedItem.brand,
          Condition:         this.editedItem.condition,
          MaxRentPeriodDays: this.editedItem.maxRentDays,
          IsActive:          this.editedItem.isActive,
        };

        // Inkludér kun billedet i payload hvis det er ændret eller eksisterende
        if (this.editedItem.imageBase64 || this.editedItem.rawImage) {
          payload.images = [
            {
              ImageURL:  this.editedItem.imageBase64 || this.editedItem.rawImage,
              IsPrimary: true,
            },
          ];
        }

        // Konverter tilbehørstekst til array inden afsendelse til API'et
        if (this.editedItem.accessories !== undefined) {
          payload.accessories = (this.editedItem.accessories || "")
            .split(",")
            .map((el) => el.trim())
            .filter(Boolean);
        }

        await updateItem(this.id, payload);

        // Opdatér lokalt billede til base64 hvis et nyt blev uploadet
        if (this.editedItem.imageBase64) {
          this.editedItem.image = this.editedItem.imageBase64;
        }

        this.isEditing = false;

        this.$emit("itemUpdated", {
          ...this.editedItem,
          status: this.editedItem.isActive ? "Tilgængelig" : "Inaktiv",
          image:
            this.editedItem.imageBase64 ||
            this.editedItem.rawImage     ||
            this.image,
        });
      } catch (err) {
        console.error("Fejl ved opdatering:", err);
      }
    },

    // Konvertér uploadet billede til base64 og opdatér forhåndsvisning
    async handleImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result;
        this.editedItem.imageBase64  = base64;
        this.editedItem.imagePreview = base64;
        this.editedItem.rawImage     = null;
        this.editedItem.image        = base64;
      };
      reader.readAsDataURL(file);
    },

    // Valider redigerede felter og returnér true hvis alt er gyldigt
    validate() {
      let valid = true;

      if (this.editedItem.image.length === 0) {
        this.errors.image = "Tilføj mindst ét billede";
        valid = false;
      } else {
        this.errors.image = "";
      }

      if (!this.editedItem.category) {
        this.errors.category = "Udfyld kategori";
        valid = false;
      } else {
        this.errors.category = "";
      }

      if (!this.editedItem.title.trim()) {
        this.errors.title = "Indtast et navn på din genstand";
        valid = false;
      } else {
        this.errors.title = "";
      }

      if (!this.editedItem.condition || !this.editedItem.condition.trim()) {
        this.errors.condition = "Udfyld stand på din genstand";
        valid = false;
      } else {
        this.errors.condition = "";
      }

      if (!this.editedItem.maxRentDays || this.editedItem.maxRentDays <= 0) {
        this.errors.maxRentDays = "Indtast en gyldig låneperiode";
        valid = false;
      } else {
        this.errors.maxRentDays = "";
      }

      return valid;
    },
  },

  emits: [
    "goBack",      // Luk detaljeskærmen og gå tilbage til listen
    "itemDeleted", // Genstand slettet – sender titel til forælderen
    "itemUpdated", // Genstand opdateret – sender det opdaterede objekt
  ],
};
</script>

<template>
  <!-- article er semantisk korrekt: skærmen repræsenterer én selvstændig genstand -->
  <article class="detalje-side">

    <!-- Sidehoved: tilbage-knap og rediger-knap -->
    <header class="detalje-header">
      <v-btn
        variant="text"
        prepend-icon="mdi-chevron-left"
        @click="$emit('goBack')"
      >
        Tilbage
      </v-btn>
      <nav class="header-knapper" aria-label="Rediger eller slet genstand">
        <v-btn
          v-if="!isEditing"
          color="primary"
          variant="tonal"
          prepend-icon="mdi-pencil"
          @click="startEditing"
        >
          Rediger
        </v-btn>
      </nav>
    </header>

    <!-- Aktiv/inaktiv-toggle vises kun i redigeringstilstand -->
    <ToggleButton v-if="isEditing" v-model="editedItem.isActive" />

    <!-- Billede og statusmærke -->
    <figure class="detalje-billede-wrapper">

      <!-- Visningstilstand: statisk billede -->
      <img
        v-if="!isEditing"
        :src="image"
        :alt="`Billede af ${title}`"
        class="detalje-billede"
      />

      <!-- Redigeringstilstand: billede med upload-mulighed -->
      <div v-else class="detalje-billede-rediger">
        <img
          v-if="editedItem.imageBase64 || image"
          :src="editedItem.imageBase64 || image"
          :alt="`Nuværende billede af ${editedItem.title}`"
          class="detalje-billede"
        />
        <br />
        <!-- Skjult label og synligt input til billedupload -->
        <label for="billede-upload" class="sr-only">Skift billede</label>
        <input
          id="billede-upload"
          type="file"
          accept="image/*"
          aria-label="Skift billede af genstand"
          @change="handleImageUpload"
        />
      </div>

      <!-- Statusmærke placeret over billedet -->
      <StatusBadge :status="status" :date="statusDate" class="detalje-status-pos" />

    </figure>

    <!-- Titel og metadata -->
    <section class="detalje-info">

      <!-- Visningstilstand: statisk tekst -->
      <h1 v-if="!isEditing" class="detalje-titel">{{ title }}</h1>
      <v-text-field
        v-else
        class="detalje-input"
        v-model="editedItem.title"
        label="Navn på genstand"
        variant="outlined"
        rounded="xl"
        color="var(--color-primary)"
        hide-details="auto"
        :error-messages="errors.title ? [errors.title] : []"
      />

      <p v-if="!isEditing" class="detalje-meta">
        {{ category }}
        <span v-if="brand"> · {{ brand }}</span>
        <span v-if="condition"> · {{ condition }}</span>
      </p>

      <!-- Redigeringstilstand: inputfelter til kategori, mærke og stand -->
      <div v-else class="detalje-meta detalje-meta-rediger">
        <v-text-field class="detalje-input" v-model="editedItem.category"   label="Kategori" variant="outlined" rounded="xl" color="var(--color-primary)" hide-details="auto" :error-messages="errors.category ? [errors.category] : []" />
        <v-text-field class="detalje-input" v-model="editedItem.brand"      label="Mærke"    variant="outlined" rounded="xl" color="var(--color-primary)" hide-details="auto" />
        <v-text-field class="detalje-input" v-model="editedItem.condition"  label="Stand"    variant="outlined" rounded="xl" color="var(--color-primary)" hide-details="auto" :error-messages="errors.condition ? [errors.condition] : []" />
        <v-text-field class="detalje-input" v-model="editedItem.accessories" label="Tilbehør" placeholder="Eksempel: oplader, ekstra batteri" variant="outlined" rounded="xl" color="var(--color-primary)" hide-details="auto" />
      </div>

    </section>

    <!-- Maksimal låneperiode og tilbehørschips -->
    <section class="detalje-bokse" aria-label="Genstandsdetaljer">

      <!-- Låneperiode-boks -->
      <div class="detalje-boks">
        <span class="detalje-boks-label-top">Maks låne</span>
        <span v-if="!isEditing" class="detalje-boks-tal">{{ maxDays }}</span>
        <v-text-field
          v-else
          class="detalje-input"
          v-model="editedItem.maxRentDays"
          type="number"
          min="1"
          label="Dage"
          variant="outlined"
          rounded="xl"
          color="var(--color-primary)"
          hide-details="auto"
          :error-messages="errors.maxRentDays ? [errors.maxRentDays] : []"
        />
        <span class="detalje-boks-enhed">dage</span>
      </div>

      <!-- Tilbehørsboks vises kun hvis genstanden har tilbehør -->
      <div v-if="accessories" class="detalje-boks detalje-boks-tilbehoer">
        <div class="detalje-boks-top">
          <span class="detalje-boks-ikon" aria-hidden="true">📦</span>
          <h3 class="detalje-boks-overskrift">Tilbehør</h3>
        </div>
        <div class="detalje-chips">
          <span
            v-for="el in accessoriesList"
            :key="el"
            class="detalje-chip"
          >
            {{ el }}
          </span>
        </div>
      </div>

    </section>

    <!-- Ejerinformation -->
    <section class="detalje-ejer" aria-label="Ejeroplysninger">
      <div class="detalje-ejer-avatar" aria-hidden="true">DG</div>
      <div class="detalje-ejer-info">
        <p class="detalje-ejer-navn">Din genstand</p>
        <p class="detalje-ejer-dato">Oprettet 12. marts 2026</p>
      </div>
    </section>

    <!-- Udlånsstatistik -->
    <section class="detalje-statistik" aria-label="Statistik for din genstand">
      <div class="detalje-stat-boks">
        <span class="detalje-stat-tal">{{ totalLoans }}</span>
        <span class="detalje-stat-label">Lån i alt</span>
      </div>
      <div class="detalje-stat-boks">
        <span class="detalje-stat-tal">{{ activeLoans }}</span>
        <span class="detalje-stat-label">Aktive lån</span>
      </div>
      <div class="detalje-stat-boks">
        <span class="detalje-stat-tal">
          {{ rating }}
          <span aria-label="stjerner">⭐</span>
        </span>
        <span class="detalje-stat-label">Vurdering</span>
      </div>
    </section>

    <!-- Bekræftelsesdialog til sletning – åbnes kun via sletknappen -->
    <ConfirmDialog
      v-model="showDeleteDialog"
      :title="'Slet ' + title + '?'"
      message="Denne handling kan ikke fortrydes og genstanden vil blive fjernet permanent."
      confirm-label="Slet genstand"
      :loading="isDeleting"
      @confirm="deleteItem"
      @cancel="cancelDeletion"
    />

    <!-- Handlingsknapper vist i bunden under redigering -->
    <section v-if="isEditing" class="rediger-handlinger">
      <v-btn
        block
        variant="tonal"
        color="error"
        prepend-icon="mdi-trash-can"
        @click="openDeleteDialog"
      >
        Slet genstand
      </v-btn>
      <v-btn
        block
        color="primary"
        prepend-icon="mdi-check"
        @click="saveEditing"
      >
        Gem ændringer
      </v-btn>
    </section>

  </article>
</template>

<style scoped>
/* ─── Artikelcontainer ───────────────────────────────────── */
.detalje-side {
  background: var(--color-bg);
  min-height: 100vh;
  padding: var(--space-4);
  box-sizing: border-box;
}

/* ─── Sidehoved ──────────────────────────────────────────── */
.detalje-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}


/* ─── Billedcontainer ────────────────────────────────────── */
.detalje-billede-wrapper {
  position: relative;
  margin: 0 0 20px 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-image-bg);
}

.detalje-billede {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}

/* ─── Statusmærke (overlay på billedet) ──────────────────── */
.detalje-status-pos {
  position: absolute;
  bottom: 12px;
  right: 12px;
}

/* ─── Titel og metadata ──────────────────────────────────── */
.detalje-titel {
  font-family: var(--font-display);
  font-size: var(--text-h1);
  font-weight: 600;
  color: var(--color-neutral);
  margin: 0 0 6px 0;
}

.detalje-meta {
  font-family: var(--font-body);
  font-size: var(--text-label);
  color: var(--color-text-secondary);
  margin: 0 0 20px 0;
}

/* ─── Vuetify feltborder ─────────────────────────────────── */
:deep(.v-field) {
  --v-field-border-width: 3px;
}

.detalje-input {
  width: 100%;
}

.detalje-info > .detalje-input {
  margin-bottom: var(--space-3);
}

/* ─── Redigeringsmetadata (flex-wrap til responsivt layout) ─ */
.detalje-meta.detalje-meta-rediger {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.detalje-meta.detalje-meta-rediger > .detalje-input {
  flex: 1 1 220px;
  min-width: 160px;
}

.detalje-boks .detalje-input {
  width: 100%;
}

/* ─── Detalje-bokse (låneperiode + tilbehør) ─────────────── */
.detalje-bokse {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
  align-items: stretch;
}

.detalje-boks {
  flex: 1;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  text-align: center;
}

/* Tilbehørsboksen er bredere og venstrejusteret */
.detalje-boks-tilbehoer {
  flex: 2;
  align-items: flex-start;
  text-align: left;
  justify-content: flex-start;
}

.detalje-boks-top {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.detalje-boks-ikon {
  font-size: 18px;
  flex-shrink: 0;
}

.detalje-boks-overskrift {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin: 0;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detalje-boks-label-top {
  font-family: var(--font-body);
  font-size: var(--text-meta);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.detalje-boks-tal {
  font-family: var(--font-body);
  font-size: 32px;
  font-weight: 700;
  color: var(--color-neutral);
  line-height: 1;
}

.detalje-boks-enhed {
  font-family: var(--font-body);
  font-size: var(--text-meta);
  font-weight: 500;
  color: var(--color-text-secondary);
}

/* ─── Tilbehørschips ─────────────────────────────────────── */
.detalje-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.detalje-chip {
  font-family: var(--font-body);
  font-size: var(--text-meta);
  font-weight: 500;
  color: var(--color-neutral);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  padding: 4px 10px;
}

/* ─── Ejerinformation ────────────────────────────────────── */
.detalje-ejer {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
  margin-top: 4px;
}

.detalje-ejer-avatar {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: var(--color-surface);
  font-family: var(--font-body);
  font-size: var(--text-label);
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.detalje-ejer-info {
  flex: 1;
  min-width: 0;
}

.detalje-ejer-navn {
  font-family: var(--font-body);
  font-size: var(--text-label);
  font-weight: 600;
  color: var(--color-neutral);
  margin: 0 0 2px 0;
}

.detalje-ejer-dato {
  font-family: var(--font-body);
  font-size: var(--text-meta);
  color: var(--color-text-secondary);
  margin: 0;
  white-space: nowrap;
}

/* ─── Statistik ──────────────────────────────────────────── */
.detalje-statistik {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}

.detalje-stat-boks {
  flex: 1;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4) var(--space-3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}

.detalje-stat-tal {
  font-family: var(--font-body);
  font-size: 22px;
  font-weight: 600;
  color: var(--color-neutral);
}

.detalje-stat-label {
  font-family: var(--font-body);
  font-size: var(--text-meta);
  color: var(--color-text-secondary);
}

/* ─── Knapnavigation i sidehovedet ───────────────────────── */
.header-knapper {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

/* ─── Rediger-handlinger i bunden ────────────────────────── */
.rediger-handlinger {
  background: var(--color-bg);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  border-top: 1px solid var(--color-border);
}


/* ─── Hjælpeklasse til skjult tekst for skærmlæsere ─────── */
/* Følger det anerkendte sr-only-mønster – elementet er usynligt
   men stadig tilgængeligt for skærmlæsere */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
