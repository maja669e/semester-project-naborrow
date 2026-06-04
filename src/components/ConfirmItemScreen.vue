<script>
import MultiStepFormHeader from "@/components/layout/MultiStepFormHeader.vue";
import FormBottomBar       from "@/components/layout/FormBottomBar.vue";
import { createItem, createAccessory } from "../services/items/itemservice.js";
import { authStore } from "@/stores/auth.js";

export default {
  name: "ConfirmItemScreen",
  emits: ["goBack", "item-created"],
  components: {
    MultiStepFormHeader,
    FormBottomBar,
  },
  props: {
    currentStep: {
      type: Number,
      default: 1,
    },
    item: {
      type: Object,
      default: () => ({
       /* images: [],*/
        extras: [],
        name: "",
        category: "",
        condition: "",
        loanPeriod: "",
      }),
    },
  },
  data() {
    return {
      loading: false,
      error: null,
    };
  },
  computed: {
    fields() {
      return [
        { label: "Navn", value: this.item?.name || "" },
        { label: "Kategori", value: this.item?.category || "" },
        { label: "Mærke", value: this.item?.brand || "" },
        { label: "Stand", value: this.item?.condition || "" },
        { label: "Max låneperiode", value: this.item?.loanPeriod || "" },
        {
          label: "Tilbehør",
          value: this.item?.extras?.length
            ? this.item.extras.join(", ")
            : "Intet tilbehør",
        },
      ];
    },
  },
  methods: {
    // Konverter låneperiode tekst til dage
    convertLoanPeriodToDays(period) {
      const map = {
        "1 dag": 1,
        "3 dage": 3,
        "1 uge": 7,
        "2 uger": 14,
        "1 måned": 30,
      };
      return map[period] || parseInt(period) || 7;
    },

    async handleCreate() {
      this.loading = true;
      this.error = null;
      const currentUserId = authStore.user.value.userID;

      try {
        // Byg item objekt til API
        const itemPayload = {
          ItemName: this.item.name,
          CategoryID: this.item.categoryID || 1,
          Brand: this.item.brand || null,
          Condition: this.item.condition,
          MaxRentPeriodDays: this.convertLoanPeriodToDays(this.item.loanPeriod),
          IsActive: true,
          UserID: currentUserId,
          images: this.item.images?.map((img, index) => ({
            ImageURL: img,
            IsPrimary: index === 0,
          })) || [],
        };

        // POST til API
        const newItem = await createItem(itemPayload);
        const newItemId = newItem.ItemID;

        // Opret tilbehør hvis der er nogle - fortsæt selvom et enkelt tilbehør fejler
        if (this.item.extras?.length > 0) {
          for (const extra of this.item.extras) {
            try {
              await createAccessory({
                ItemID: newItemId,
                AccessoryName: extra,
              });
            } catch (accErr) {
              // Tilbehørsoprettelse fejlede — fortsæt med de øvrige
            }
          }
        }

        // Succes – udløs event med det nye genstandsid til forælderen
        this.$emit("item-created", newItemId);

      } catch (err) {
        this.error = "Noget gik galt. Prøv igen.";
        console.error("Fejl ved oprettelse af genstand:", err);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<template>
  <v-container class="pa-4 bekraeft-container">

    <!-- Formularhoved med titel og trinindikator -->
    <MultiStepFormHeader
      title="Opret ny genstand"
      :currentStep="currentStep"
      :steps="['Grundinfo', 'Detaljer', 'Forhåndsvisning']"
    />

    <!-- Indhold: genstandsoplysninger til forhåndsvisning -->
    <v-card-text class="px-5 pt-2 pb-8 text">
      <h2 class="text-h6 font-weight-bold mb-1">Tjek og bekræft</h2>
      <p class="text-body-2 text-medium-emphasis mb-5 text-body">
        Se hvordan din genstand vil se ud for andre. Du kan redigere alle
        felter direkte.
      </p>

      <!-- Fejlbesked -->
      <div v-if="error" class="error-text mb-4">{{ error }}</div>

      <!-- Billeder -->
      <div class="section-title mb-3">Billeder</div>
      <div class="image-row mb-5">
        <div v-if="item?.images?.length">
          <div
            v-for="(img, index) in item.images"
            :key="index"
            class="image-preview"
          >
            <v-img :src="img" cover width="72" height="72" class="rounded-lg" />
          </div>
        </div>
        <div v-else class="text-grey">Ingen billeder valgt</div>
        <div class="add-image-box">
          <v-icon size="18" color="grey">mdi-camera-outline</v-icon>
          <span>Tilføj</span>
        </div>
      </div>

      <!-- Informationskort med genstandsfelter -->
      <div class="info-list">
        <v-card
          v-for="field in fields"
          :key="field.label"
          variant="outlined"
          rounded="xl"
          class="mb-4 info-card"
        >
          <v-card-text class="d-flex justify-space-between align-start">
            <div>
              <div class="field-label mb-2">{{ field.label }}</div>
              <div class="field-value">{{ field.value }}</div>
            </div>
            <v-btn icon variant="text" size="small">
              <v-icon size="16" color="grey-darken-1">mdi-pencil-outline</v-icon>
            </v-btn>
          </v-card-text>
        </v-card>
      </div>
    </v-card-text>

    <!-- Bundknapper: tilbage og opret -->
    <FormBottomBar
      next-label="Opret genstand"
      :next-loading="loading"
      :back-disabled="loading"
      @back="$emit('goBack')"
      @next="handleCreate"
    />

  </v-container>
</template>

<style scoped>
/* padding-bottom sikrer at indhold ikke skjules bag den faste FormBottomBar */
.bekraeft-container {
  padding-bottom: calc(96px + env(safe-area-inset-bottom));
}

.section-title {
  font-size: 14px;
  font-weight: 600;
}

.image-row {
  display: flex;
  gap: 12px;
}

.image-preview {
  position: relative;
  width: 72px;
  height: 72px;
}

.remove-btn {
  position: absolute;
  top: -8px;
  right: -8px;
}

.add-image-box {
  width: 72px;
  height: 72px;
  border: 1px dashed #c9c9c9;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #7a7a7a;
  font-size: 12px;
}

.info-card {
  border-color: #e5e7eb;
}

.field-label {
  font-size: 12px;
  color: #6b7280;
}

.field-value {
  font-size: 15px;
  color: #111827;
  font-weight: 500;
}

.text {
  font-family: "Roboto", sans-serif;
  color: #000000;
}
.text-body {
  font-family: "Roboto", sans-serif;
  color: grey;
}
</style>
