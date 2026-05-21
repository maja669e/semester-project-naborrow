<script>
// Detaljeskærm for én genstand.
// Viser billede, metadata, tilbehør, ejerinfo og statistik.
// Understøtter to tilstande: visning (standard) og redigering (isEditing).
// Sletning sker via ConfirmDialog for at undgå utilsigtet sletning.
import { deleteItem, updateItem } from "@/services/itemservice.js";
import ToggleButton  from "@/components/ToggleButton.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

export default {
  name: "ItemDetailView",
  components: { ToggleButton, ConfirmDialog },

  props: {
    id:          { type: Number, required: true },
    title:       { type: String, required: true },
    category:    { type: String, required: true },
    // Mærke og stand er valgfrie – ikke alle genstande har dem
    brand:       { type: String, default: null },
    status:      { type: String, required: true },
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
      visSletter: false,   // Styrer om ConfirmDialog er åben
      sletter:    false,   // Viser indlæsningsindikator mens sletning pågår
      redigerer:  false,   // Skifter mellem visnings- og redigeringstilstand
      redigertGenstand: {},// Arbejdskopi af genstandsdata under redigering

      // Valideringsfejl vist under de respektive felter i redigeringstilstand
      fejl: {
        billede:     null,
        kategori:    null,
        titel:       null,
        stand:       null,
        maksLaaneDage: null,
        tilbehoer:   null,
      },
    };
  },

  computed: {
    // Oversætter status-tekst til en CSS-modifikatorklasse for farvekodning
    statusKlasse() {
      if (this.status === "Tilgængelig") return "status-tilgaengelig";
      if (this.status === "Udlånt")      return "status-udlaant";
      if (this.status === "Inaktiv")     return "status-inaktiv";
      return "";
    },

    // Konvertér den kommaseparerede tilbehørsstreng til et array af tags
    tilbehoerListe() {
      if (!this.accessories) return [];
      return this.accessories.split(",").map((element) => element.trim());
    },
  },

  methods: {
    // Åbn sletbekræftelsesdialogen
    aabneSlettDialog() {
      this.visSletter = true;
    },

    // Luk dialogen uden at slette
    annullerSletning() {
      this.visSletter = false;
    },

    // Slet genstanden permanent via API'et og underret forælderen
    async sletGenstand() {
      this.sletter = true;
      try {
        await deleteItem(this.id);
        this.visSletter = false;
        this.$emit("genstandSlettet", this.title);
      } catch (fejl) {
        console.error("Fejl ved sletning af genstand:", fejl);
      } finally {
        this.sletter = false;
      }
    },

    // Opret en arbejdskopi af genstandsdata og skift til redigeringstilstand
    startRedigering() {
      this.redigerer = true;
      this.redigertGenstand = {
        titel:       this.title,
        kategori:    this.category,
        maerke:      this.brand,
        status:      this.status,
        stand:       this.condition,
        maksLaaneDage: this.maxDays,
        tilbehoer:   this.accessories || "",
        billede:     this.image,
        raaBillede:  this.imagePath,
        billedeBase64: null,   // Udfyldes kun hvis brugeren uploader et nyt billede
        billedeForhaandsvisning: null,
        // IsActive: 1 = tilgængelig, 0 = inaktiv
        erAktiv: this.status === "Tilgængelig" ? 1 : 0,
      };
    },

    // Gem ændringerne via API'et og underret forælderen om den opdaterede genstand
    async gemRedigering() {
      if (!this.valider()) return;
      try {
        const payload = {
          ItemName:          this.redigertGenstand.titel,
          CategoryName:      this.redigertGenstand.kategori,
          Brand:             this.redigertGenstand.maerke,
          Condition:         this.redigertGenstand.stand,
          MaxRentPeriodDays: this.redigertGenstand.maksLaaneDage,
          IsActive:          this.redigertGenstand.erAktiv,
        };

        // Inkludér kun billedet i payload hvis det er ændret eller eksisterende
        if (this.redigertGenstand.billedeBase64 || this.redigertGenstand.raaBillede) {
          payload.images = [
            {
              ImageURL:  this.redigertGenstand.billedeBase64 || this.redigertGenstand.raaBillede,
              IsPrimary: true,
            },
          ];
        }

        // Konverter tilbehørstekst til array inden afsendelse til API'et
        if (this.redigertGenstand.tilbehoer !== undefined) {
          payload.accessories = (this.redigertGenstand.tilbehoer || "")
            .split(",")
            .map((element) => element.trim())
            .filter(Boolean);
        }

        await updateItem(this.id, payload);

        // Opdatér lokalt billede til base64 hvis et nyt blev uploadet
        if (this.redigertGenstand.billedeBase64) {
          this.redigertGenstand.billede = this.redigertGenstand.billedeBase64;
        }

        this.redigerer = false;

        this.$emit("itemUpdated", {
          ...this.redigertGenstand,
          status: this.redigertGenstand.erAktiv ? "Tilgængelig" : "Inaktiv",
          image:
            this.redigertGenstand.billedeBase64 ||
            this.redigertGenstand.raaBillede     ||
            this.image,
        });
      } catch (fejl) {
        console.error("Fejl ved opdatering:", fejl);
      }
    },

    // Konvertér uploadet billede til base64 og opdatér forhåndsvisning
    async haandterBilledeUpload(event) {
      const fil = event.target.files[0];
      if (!fil) return;
      const laeseren = new FileReader();
      laeseren.onload = () => {
        const base64 = laeseren.result;
        this.redigertGenstand.billedeBase64            = base64;
        this.redigertGenstand.billedeForhaandsvisning  = base64;
        this.redigertGenstand.raaBillede               = null;
        this.redigertGenstand.billede                  = base64;
      };
      laeseren.readAsDataURL(fil);
    },

    // Valider redigerede felter og returnér true hvis alt er gyldigt
    valider() {
      let gyldig = true;

      if (this.redigertGenstand.billede.length === 0) {
        this.fejl.billede = "Tilføj mindst ét billede";
        gyldig = false;
      } else {
        this.fejl.billede = "";
      }

      if (!this.redigertGenstand.kategori) {
        this.fejl.kategori = "Udfyld kategori";
        gyldig = false;
      } else {
        this.fejl.kategori = "";
      }

      if (!this.redigertGenstand.titel.trim()) {
        this.fejl.titel = "Indtast et navn på din genstand";
        gyldig = false;
      } else {
        this.fejl.titel = "";
      }

      if (!this.redigertGenstand.stand.trim()) {
        this.fejl.stand = "Udfyld stand på din genstand";
        gyldig = false;
      } else {
        this.fejl.stand = "";
      }

      if (!this.redigertGenstand.maksLaaneDage || this.redigertGenstand.maksLaaneDage <= 0) {
        this.fejl.maksLaaneDage = "Indtast en gyldig låneperiode";
        gyldig = false;
      } else {
        this.fejl.maksLaaneDage = "";
      }

      return gyldig;
    },
  },

  emits: [
    "gåTilbage",      // Luk detaljeskærmen og gå tilbage til listen
    "genstandSlettet",// Genstand slettet – sender titel til forælderen
    "itemUpdated",    // Genstand opdateret – sender det opdaterede objekt
  ],
};
</script>

<template>
  <!-- article er semantisk korrekt: skærmen repræsenterer én selvstændig genstand -->
  <article class="detalje-side">

    <!-- Sidehoved: tilbage-knap og rediger-knap -->
    <header class="detalje-header">
      <button class="tilbage-knap" @click="$emit('gåTilbage')">
        ← Tilbage
      </button>
      <nav class="header-knapper" aria-label="Rediger eller slet genstand">
        <button v-if="!redigerer" class="rediger-knap" @click="startRedigering">
          <v-icon start icon="mdi-pencil" />Rediger
        </button>
      </nav>
    </header>

    <!-- Aktiv/inaktiv-toggle vises kun i redigeringstilstand -->
    <ToggleButton v-if="redigerer" v-model="redigertGenstand.erAktiv" />

    <!-- Billede og statusmærke -->
    <figure class="detalje-billede-wrapper">

      <!-- Visningsitlstand: statisk billede -->
      <img
        v-if="!redigerer"
        :src="image"
        :alt="`Billede af ${title}`"
        class="detalje-billede"
      />

      <!-- Redigeringstilstand: billede med upload-mulighed -->
      <div v-else class="detalje-billede-rediger">
        <img
          v-if="redigertGenstand.billedeBase64 || image"
          :src="redigertGenstand.billedeBase64 || image"
          :alt="`Nuværende billede af ${redigertGenstand.titel}`"
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
          @change="haandterBilledeUpload"
        />
      </div>

      <!-- Statusmærke placeret over billedet -->
      <span class="detalje-status" :class="statusKlasse">
        <span class="detalje-status-prik" aria-hidden="true"></span>
        {{ status }}
      </span>

    </figure>

    <!-- Titel og metadata -->
    <section class="detalje-info">

      <!-- Visningsitlstand: statisk tekst -->
      <h1 v-if="!redigerer" class="detalje-titel">{{ title }}</h1>
      <v-text-field
        v-else
        class="detalje-input"
        v-model="redigertGenstand.titel"
        label="Navn på genstand"
        variant="outlined"
        rounded="xl"
        color="var(--color-primary)"
        hide-details="auto"
        :error-messages="fejl.titel ? [fejl.titel] : []"
      />

      <p v-if="!redigerer" class="detalje-meta">
        {{ category }}
        <span v-if="brand"> · {{ brand }}</span>
        <span v-if="condition"> · {{ condition }}</span>
      </p>

      <!-- Redigeringstilstand: inputfelter til kategori, mærke og stand -->
      <div v-else class="detalje-meta detalje-meta-rediger">
        <v-text-field class="detalje-input" v-model="redigertGenstand.kategori"  label="Kategori" variant="outlined" rounded="xl" color="var(--color-primary)" hide-details="auto" :error-messages="fejl.kategori ? [fejl.kategori] : []" />
        <v-text-field class="detalje-input" v-model="redigertGenstand.maerke"    label="Mærke"    variant="outlined" rounded="xl" color="var(--color-primary)" hide-details="auto" />
        <v-text-field class="detalje-input" v-model="redigertGenstand.stand"     label="Stand"    variant="outlined" rounded="xl" color="var(--color-primary)" hide-details="auto" :error-messages="fejl.stand ? [fejl.stand] : []" />
        <v-text-field class="detalje-input" v-model="redigertGenstand.tilbehoer" label="Tilbehør" placeholder="Eksempel: oplader, ekstra batteri" variant="outlined" rounded="xl" color="var(--color-primary)" hide-details="auto" />
      </div>

    </section>

    <!-- Maksimal låneperiode og tilbehørschips -->
    <section class="detalje-bokse" aria-label="Genstandsdetaljer">

      <!-- Låneperiode-boks -->
      <div class="detalje-boks">
        <span class="detalje-boks-label-top">Maks låne</span>
        <span v-if="!redigerer" class="detalje-boks-tal">{{ maxDays }}</span>
        <v-text-field
          v-else
          class="detalje-input"
          v-model="redigertGenstand.maksLaaneDage"
          type="number"
          min="1"
          label="Dage"
          variant="outlined"
          rounded="xl"
          color="var(--color-primary)"
          hide-details="auto"
          :error-messages="fejl.maksLaaneDage ? [fejl.maksLaaneDage] : []"
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
            v-for="element in tilbehoerListe"
            :key="element"
            class="detalje-chip"
          >
            {{ element }}
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
      v-model="visSletter"
      :title="'Slet ' + title + '?'"
      message="Denne handling kan ikke fortrydes og genstanden vil blive fjernet permanent."
      confirm-label="Slet genstand"
      :loading="sletter"
      @confirm="sletGenstand"
      @cancel="annullerSletning"
    />

    <!-- Handlingsknapper vist i bunden under redigering -->
    <section v-if="redigerer" class="rediger-handlinger">
      <button class="slet-knap" @click="aabneSlettDialog">
        <v-icon>mdi-trash-can</v-icon>Slet genstand
      </button>
      <button class="gem-knap" @click="gemRedigering">
        <v-icon>mdi-check</v-icon>Gem ændringer
      </button>
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

/* ─── Tilbage-knap ───────────────────────────────────────── */
/* min-height: 44px opfylder WCAG 2.5.5 trykfladekravet */
.tilbage-knap {
  background: transparent;
  color: var(--color-neutral);
  border: none;
  font-family: var(--font-body);
  font-size: var(--text-body);
  font-weight: 500;
  cursor: pointer;
  padding: var(--space-3) 0;
  min-height: 44px;
}

/* ─── Rediger-knap ───────────────────────────────────────── */
.rediger-knap {
  background: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: var(--text-body);
  font-weight: 500;
  cursor: pointer;
  padding: var(--space-3) var(--space-4);
  min-height: 44px;
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
.detalje-status {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  padding: 5px 11px;
  border-radius: var(--radius-full);
  min-height: 32px;
}

.detalje-status-prik {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ─── Statusfarver ───────────────────────────────────────── */
.status-tilgaengelig { background: var(--color-tilgaengelig-bg);  color: var(--color-tilgaengelig-text); }
.status-tilgaengelig .detalje-status-prik { background: var(--color-tilgaengelig-dot); }

.status-udlaant { background: var(--color-udlaant-bg);  color: var(--color-udlaant-text); }
.status-udlaant .detalje-status-prik { background: var(--color-udlaant-dot); }

.status-inaktiv { background: var(--color-inaktiv-bg);  color: var(--color-inaktiv-text); }
.status-inaktiv .detalje-status-prik { background: var(--color-inaktiv-dot); }

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
  color: var(--color-secondary);
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
  color: var(--color-secondary);
  margin: 0;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detalje-boks-label-top {
  font-family: var(--font-body);
  font-size: var(--text-meta);
  font-weight: 500;
  color: var(--color-secondary);
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
  color: var(--color-secondary);
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
  color: #ffffff;
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
  color: var(--color-secondary);
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
  color: var(--color-secondary);
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

.slet-knap {
  width: 100%;
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border: none;
  background: rgba(185, 28, 28, 0.1);
  color: #b91c1c;
  font-weight: 600;
  font-size: var(--text-body);
  cursor: pointer;
}

.gem-knap {
  width: 100%;
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border: none;
  background: var(--color-primary);
  color: white;
  font-weight: 600;
  font-size: var(--text-body);
  cursor: pointer;
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
