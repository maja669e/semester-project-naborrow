<script>
// Kalder DELETE genstande API for at slette en genstand
import { deleteItem } from '@/services/itemservice.js'
import { updateItem } from '@/services/itemservice.js'
//Henter vores toggle komponent
import ToggleButton from '../ToggleButton.vue'
export default {
    name: 'ItemDetailView',
    components: {
        ToggleButton
    },
    data() {
        return {
            //Styrer om sletning dialog er åben
            visSletter: false,
            // Forhinder dobbeltklik på slet-knappen
            sletter: false,
            //Siden opdateres om du er i redigeringstilstand eller ej
            isEditing: false, 
            editedItem: {} 
        }
    },
    props: {
                // ID på genstanden - bruges til sletning
        id: {
            type: Number,
            required: true
        },
        // Alle oplysninger om den valgte genstand
        title: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        brand: {
            type: String,
            default: null
        },
        status: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        imagePath: {
            type: String,
            default: null
        },
        // Genstandens stand - viser hvor god stand genstanden er i
        condition: {
            type: String,
            default: null
        },
        // Maksimalt antal dage genstanden kan lånes
        maxDays: {
            type: Number,
            default: null
        },
        // Tilbehør til genstanden - kun vist hvis der er noget
        accessories: {
            type: String,
            default: null
        },
        // Statistik - kun synlig for ejeren
        totalLoans: {
            type: Number,
            default: 0
        },
        activeLoans: {
            type: Number,
            default: 0
        },
        rating: {
            type: Number,
            default: null
        },

    },
    computed: {
        // Returnerer den korrekte CSS-klasse baseret på status
        statusClass() {
            if (this.status === 'Tilgængelig') return 'status-tilgaengelig'
            if (this.status === 'Udlånt') return 'status-udlaant'
            if (this.status === 'Inaktiv') return 'status-inaktiv'
        },
        // Opdeler tilbehør string til en liste
        // fx "Extra batteri, bits sæt" bliver til ["Extra batteri", "bits sæt"]
        accessoriesList() {
            if (!this.accessories) return []
            return this.accessories.split(',').map(item => item.trim())
        }
    },
    methods: {
        // Åbner sletning dialogen
        åbenSletDialog() {
            this.visSletter = true
        },
        // Lukker bekræftelsedialog uden at slette
        annullerSlet() {
            this.visSletter = false
        },

        // Metode til at slette genstanden
        async sletGenstand() {
            this.sletter = true
            try {
                await deleteItem(this.id)
                this.visSletter = false
                // Sender navn til GenstandPage for at opdatere listen
                this.$emit('genstandSlettet', this.title )

                // Håndter succes - f.eks. ved at sende et event til forælderen
            } catch (error) {
                console.error('Fejl ved sletning af genstand:', error)
            } finally {
                this.sletter = false
            }
        },

        startEdit() {
    this.isEditing = true

    // Gør de nuværende værdier tilgængelige i editedItem, så de kan redigeres i en form
    this.editedItem = {
        title: this.title,
        category: this.category,
        brand: this.brand,
        status: this.status,
        condition: this.condition,
        maxDays: this.maxDays,
        accessories: this.accessories || '',
        image: this.image,
        rawImage: this.imagePath,
        imageBase64: null,
        imagePreview: null,
        isActive: this.status === 'Tilgængelig' ? 1 : 0,
    }
},
//Gemmer vores redigeringer og sender opdateret data til backend
async saveEdit() {
    try {
        const payload = {
            ItemName: this.editedItem.title,
            CategoryName: this.editedItem.category,
            Brand: this.editedItem.brand,
            Condition: this.editedItem.condition,
            MaxRentPeriodDays: this.editedItem.maxDays,
            IsActive: this.editedItem.isActive
        }

        if (this.editedItem.imageBase64 || this.editedItem.rawImage) {
            payload.images = [
                {
                    ImageURL: this.editedItem.imageBase64 || this.editedItem.rawImage,
                    IsPrimary: true
                }
            ];
        }

        if (this.editedItem.accessories !== undefined) {
            const accessoriesString = this.editedItem.accessories || '';
            payload.accessories = accessoriesString
                .split(',')
                .map(item => item.trim())
                .filter(Boolean);
        }

        await updateItem(this.id, payload)

        if (this.editedItem.imageBase64) {
            this.editedItem.image = this.editedItem.imageBase64
        }

        this.isEditing = false

        this.$emit('itemUpdated', {
            ...this.editedItem,
            status: this.editedItem.isActive ? 'Tilgængelig' : 'Inaktiv',
            image: this.editedItem.imageBase64 || this.editedItem.rawImage || this.image
        })

    } catch (error) {
        console.error('Fejl ved opdatering:', error)
    }
},
async handleImageUpload(event) {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()

   reader.onload = () => {
    const base64 = reader.result

    this.editedItem.imageBase64 = base64
    this.editedItem.imagePreview = base64
    this.editedItem.rawImage = null
    this.editedItem.image = base64
}

    reader.readAsDataURL(file)
}
    },
    watch: {
    },
    emits: ['gåTilbage', 'genstandSlettet', 'itemUpdated']
}
</script>

<template>
    <article class="detalje-side">

        <!-- Topbar med tilbage-knap og rediger-knap -->
        <header class="detalje-header">
            <!-- Tilbage-knap - sender gåTilbage event op til forælderen -->
            <button class="tilbage-knap" @click="$emit('gåTilbage')">
                ← Tilbage
            </button>
          <nav class="header-knapper" aria-label="Rediger eller slet genstand">
    <!-- Rediger / Gem -->
    <button v-if="!isEditing" class="rediger-knap" @click="startEdit">
         <v-icon start icon="mdi-pencil" />Rediger
    </button>


    <!-- Annuller -->
<!--   <button v-if="isEditing" class="slet-knap" @click="isEditing = false">
        X
    </button>  -->

</nav>
        </header>

        <ToggleButton v-if="isEditing" v-model="editedItem.isActive" />

      <!-- Stort billede med status tag i hjørnet -->
<figure class="detalje-billede-wrapper">

    <!-- VIEW MODE -->
    <img
        v-if="!isEditing"
        :src="image"
        :alt="`Billede af ${title}`"
        class="detalje-billede"
    />

  <!-- EDIT MODE -->
<div v-else class="detalje-image-edit">
    <!-- preview -->
    <img
         v-if="editedItem.imageBase64 || image"
        :src="editedItem.imageBase64 || image"
        class="detalje-billede"
    />
    <br>
         <!-- file picker instead of URL -->
    <input
        type="file"
        accept="image/*"
        @change="handleImageUpload"
    />
    
</div>

    <!-- Status tag oven på billedet i nederste højre hjørne -->
    <span class="detalje-status" :class="statusClass">
        <span class="detalje-status-prik" aria-hidden="true"></span>
        {{ status }}
    </span>

</figure>


       <!-- Genstandens informationer -->
<section class="detalje-info">
    <!-- Titel på genstanden -->
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
    />

    <!-- Kategori, mærke og stand på samme linje -->
    <p v-if="!isEditing" class="detalje-meta">
        {{ category }}
        <span v-if="brand"> · {{ brand }}</span>
        <span v-if="condition"> · {{ condition }}</span>
    </p>

    <!-- Edit mode -->
    <div v-else class="detalje-meta detalje-meta-edit">
        <v-text-field
          class="detalje-input"
          v-model="editedItem.category"
          label="Kategori"
          variant="outlined"
          rounded="xl"
          color="var(--color-primary)"
          hide-details="auto"
        />
        <v-text-field
          class="detalje-input"
          v-model="editedItem.brand"
          label="Mærke"
          variant="outlined"
          rounded="xl"
          color="var(--color-primary)"
          hide-details="auto"
        />
        <v-text-field
          class="detalje-input"
          v-model="editedItem.condition"
          label="Stand"
          variant="outlined"
          rounded="xl"
          color="var(--color-primary)"
          hide-details="auto"
        />
        <v-text-field
          class="detalje-input"
          v-model="editedItem.accessories"
          label="Tilbehør"
          placeholder="Eksempel: oplader, ekstra batteri"
          variant="outlined"
          rounded="xl"
          color="var(--color-primary)"
          hide-details="auto"
        />
    </div>
</section>

        <!-- To informationsbokse - max låneperiode og tilbehør -->
        <section class="detalje-bokse" aria-label="Genstandsdetaljer">

            <!-- Max låneperiode boks - label øverst, stort tal i midten, enhed nederst -->
            <div class="detalje-boks">
                <span class="detalje-boks-label-top">Maks låne</span>
               <!-- VIEW MODE -->
                <span v-if="!isEditing" class="detalje-boks-tal">{{ maxDays }}</span>

                <!-- EDIT MODE -->
                <v-text-field
                  v-else
                  class="detalje-input"
                  v-model="editedItem.maxDays"
                  type="number"
                  min="1"
                  label="Dage"
                  variant="outlined"
                  rounded="xl"
                  color="var(--color-primary)"
                  hide-details="auto"
                />

                <span class="detalje-boks-enhed">dage</span>
            </div>

            <!-- Tilbehør boks - vises kun hvis der er tilbehør -->
            <div v-if="accessories" class="detalje-boks detalje-boks-tilbehoer">
                <!-- Ikon og overskrift side om side øverst i boksen -->
                <div class="detalje-boks-top">
                    <span class="detalje-boks-ikon" aria-hidden="true">📦</span>
                    <h3 class="detalje-boks-overskrift">Tilbehør</h3>
                </div>
                <!-- Hvert tilbehør vises som en chip -->
                <div class="detalje-chips">
                    <span
                        v-for="item in accessoriesList"
                        :key="item"
                        class="detalje-chip"
                    >
                        {{ item }}
                    </span>
                </div>
            </div>

        </section>

        <!-- Ejer sektion - viser hvem der ejer genstanden -->
        <section class="detalje-ejer" aria-label="Ejeroplysninger">
            <!-- Avatar cirkel med initialer - erstattes med rigtigt billede når login tilføjes -->
            <div class="detalje-ejer-avatar" aria-hidden="true">DG</div>
            <div class="detalje-ejer-info">
                <p class="detalje-ejer-navn">Din genstand</p>
                <p class="detalje-ejer-dato">Oprettet 12. marts 2026</p>
            </div>
            <!-- Status tag ved siden af ejer info 
            <span class="detalje-ejer-status" :class="statusClass">
                <span class="detalje-status-prik" aria-hidden="true"></span>
                {{ status }}
            </span>
            -->
        </section>

        <!-- Statistik sektion - kun synlig for ejeren -->
        <section class="detalje-stats" aria-label="Statistik for din genstand">
            <!-- Lån i alt -->
            <div class="detalje-stat-boks">
                <span class="detalje-stat-tal">{{ totalLoans }}</span>
                <span class="detalje-stat-label">Lån i alt</span>
            </div>
            <!-- Aktive lån -->
            <div class="detalje-stat-boks">
                <span class="detalje-stat-tal">{{ activeLoans }}</span>
                <span class="detalje-stat-label">Aktive lån</span>
            </div>
            <!-- Vurdering med stjerne -->
            <div class="detalje-stat-boks">
                <span class="detalje-stat-tal">{{ rating }} ⭐</span>
                <span class="detalje-stat-label">Vurdering</span>
            </div>
        </section>
        <!-- Sletning bekræftelse dialog - vises når visSletter er true -->
        <transition name="slet-fade">
            <aside
                v-if="visSletter"
                class="slet-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="slet-dialog-titel"
            >
            <article class="slet-dialog-indhold">
                <!--- Titel med genstandens navn -->
                <h2 id="slet-dialog-titel" class="slet-dialog-titel">
                    Slet {{ title }}?
                </h2>
                <!--- Bekræftelse besked -->
                <p class="slet-dialog-tekst">
                    Denne handling kan ikke fortrydes og genstanden vil blive fjernet permanent.
                </p>
                <!--- knapper der annullere eller sletter-->
                <footer class="slet-dialog-knapper">
                    <v-btn
                        variant="text"
                        @click="annullerSlet"
                        :disabled="sletter"
                    >
                        Annuller
                    </v-btn>
                    <!-- Slet - Vuetify error farve (rød), og bruger vores styling -->
                    <!-- :loading="sletter" viser automatisk en spinner mens backend svarer -->
                    <v-btn
                        color="error"
                        variant="tonal"
                        @click="sletGenstand"
                        :disabled="sletter"
                        :loading="sletter"
                    >
                        Slet genstand
                    </v-btn>
                </footer>

            </article>
            </aside>
        </transition>
        
                <!-- EDIT MODE ACTIONS (bottom) -->
<section v-if="isEditing" class="edit-actions">

    <!-- Delete button -->
    <button class="edit-delete" @click="åbenSletDialog">
         <v-icon>mdi-trash-can</v-icon>Slet genstand
    </button>

    <!-- Save button -->
    <button class="edit-save" @click="saveEdit">
         <v-icon>mdi-check</v-icon>Gem ændringer
    </button>

</section>
    </article>
</template>

<style scoped>

/* Hele detaljesiden - varm baggrund som fylder hele skærmen */
.detalje-side {
    background: var(--color-bg);
    min-height: 100vh;
    padding: var(--space-4);
    box-sizing: border-box;
}

/* Topbar - tilbage og rediger knapper side om side */
.detalje-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-4);
}

/* Tilbage-knap - gennemsigtig baggrund */
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

/* Rediger-knap - grøn baggrund med hvid tekst */
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

/* Billedwrapper - position relative så status tag kan placeres i hjørnet */
.detalje-billede-wrapper {
    position: relative;
    margin: 0 0 20px 0;
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--color-image-bg);
}

/* Billedet fylder hele bredden */
.detalje-billede {
    width: 100%;
    height: 220px;
    object-fit: cover;
    display: block;
}

/* Status tag placeret i nederste højre hjørne af billedet */
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

/* Lille farvet prik ved siden af status teksten */
.detalje-status-prik {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
}

/* Tilgængelig - grøn */
.status-tilgaengelig {
    background: var(--color-tilgaengelig-bg);
    color: var(--color-tilgaengelig-text);
}
.status-tilgaengelig .detalje-status-prik {
    background: var(--color-tilgaengelig-dot);
}

/* Udlånt - orange */
.status-udlaant {
    background: var(--color-udlaant-bg);
    color: var(--color-udlaant-text);
}
.status-udlaant .detalje-status-prik {
    background: var(--color-udlaant-dot);
}

/* Inaktiv - grå */
.status-inaktiv {
    background: var(--color-inaktiv-bg);
    color: var(--color-inaktiv-text);
}
.status-inaktiv .detalje-status-prik {
    background: var(--color-inaktiv-dot);
}

/* Genstandens titel */
.detalje-titel {
    font-family: var(--font-display);
    font-size: var(--text-h1);
    font-weight: 600;
    color: var(--color-neutral);
    margin: 0 0 6px 0;
}

:deep(.v-field) {
    --v-field-border-width: 3px;
}

.detalje-input {
    width: 100%;
}

.detalje-info > .detalje-input {
    margin-bottom: var(--space-3);
}

.detalje-meta {
    font-family: var(--font-body);
    font-size: var(--text-label);
    color: var(--color-secondary);
    margin: 0 0 20px 0;
}

.detalje-meta.detalje-meta-edit {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
}

.detalje-meta.detalje-meta-edit > .detalje-input {
    flex: 1 1 220px;
    min-width: 160px;
}

.detalje-boks .detalje-input {
    width: 100%;
}

/* To bokse side om side */
.detalje-bokse {
    display: flex;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
    align-items: stretch;
}

/* Basis boks styling - centreret indhold */
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

/* Tilbehør boksen er dobbelt så bred og venstrestillet */
.detalje-boks-tilbehoer {
    flex: 2;
    align-items: flex-start;
    text-align: left;
    justify-content: flex-start;
}

/* Ikon og overskrift side om side øverst i boksen */
.detalje-boks-top {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
}

/* Ikon i boksen */
.detalje-boks-ikon {
    font-size: 18px;
    flex-shrink: 0;
}

/* Overskrift ved siden af ikonet */
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

/* Lille grå label øverst i max lån boksen */
.detalje-boks-label-top {
    font-family: var(--font-body);
    font-size: var(--text-meta);
    font-weight: 500;
    color: var(--color-secondary);
}

/* Stort tal i midten af max lån boksen */
.detalje-boks-tal {
    font-family: var(--font-body);
    font-size: 32px;
    font-weight: 700;
    color: var(--color-neutral);
    line-height: 1;
}

/* Lille enhed under tallet - fx "dage" */
.detalje-boks-enhed {
    font-family: var(--font-body);
    font-size: var(--text-meta);
    font-weight: 500;
    color: var(--color-secondary);
}

/* Chips wrapper - viser chips på samme linje */
.detalje-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

/* Hver chip - lille afrundet tag */
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

/* Ejer sektion - hvid boks med avatar */
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

/* Ejer avatar - grøn cirkel med initialer */
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

/* Ejer navn og dato fylder den resterende plads */
.detalje-ejer-info {
    flex: 1;
    min-width: 0;
}

/* Ejer navn */
.detalje-ejer-navn {
    font-family: var(--font-body);
    font-size: var(--text-label);
    font-weight: 600;
    color: var(--color-neutral);
    margin: 0 0 2px 0;
}

/* Oprettelsesdato */
.detalje-ejer-dato {
    font-family: var(--font-body);
    font-size: var(--text-meta);
    color: var(--color-secondary);
    margin: 0;
    white-space: nowrap;
}

/* Status tag i ejer sektionen - sidder i rækken ikke over billedet */
.detalje-ejer-status {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 600;
    padding: 5px 11px;
    border-radius: var(--radius-full);
    min-height: 32px;
    flex-shrink: 0;
}

/* Statistik sektion - tre bokse side om side */
.detalje-stats {
    display: flex;
    gap: var(--space-3);
    margin-bottom: var(--space-6);
}

/* Hver statistik boks */
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

/* Stort tal i statistik boksen */
.detalje-stat-tal {
    font-family: var(--font-body);
    font-size: 22px;
    font-weight: 600;
    color: var(--color-neutral);
}

/* Label under tallet */
.detalje-stat-label {
    font-family: var(--font-body);
    font-size: var(--text-meta);
    color: var(--color-secondary);
}
/* Knap-gruppe i headeren - rediger og slet side om side */
.header-knapper {
    display: flex;
    gap: var(--space-2);
    align-items: center;
}

/* Slet-knap i header */
.slet-knap {
    background: transparent;
    color: #b91c1c;
    border: 1.5px solid #b91c1c;
    border-radius: var(--radius-md);
    font-family: var(--font-body);
    font-size: var(--text-body);
    font-weight: 500;
    cursor: pointer;
    padding: var(--space-3) var(--space-4);
    min-height: 44px;
    box-sizing: border-box;
    transition: background 0.15s ease;
}

.slet-knap:hover {
    background: rgba(185, 28, 28, 0.08);
}

/* Dialog overlay - mørkt halvgennemsigtigt lag over hele skærmen */
.slet-dialog {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    border: none;
    padding: var(--space-4);
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    box-sizing: border-box;
}

/* Dialog indhold - hvid boks der glider op fra bunden */
.slet-dialog-indhold {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    width: 100%;
    max-width: 400px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
    border-top: 3px solid #b91c1c;
}

/* Dialog title */
.slet-dialog-titel {
    font-family: var(--font-body);
    font-size: var(--text-h3);
    font-weight: 500;
    color: var(--color-neutral);
    margin: 0 0 var(--space-4) 0;
}

/* Bekræftelsestekst */
.slet-dialog-tekst {
    font-family: var(--font-body);
    font-size: var(--text-label);
    color: var(--color-secondary);
    margin: 0 0 var(--space-5) 0;
    line-height: 1.5;
}

/* Dialog knapper */
.slet-dialog-knapper {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: var(--space-2);
}
/* Fade overgang når dialogen åbner og lukker */
.slet-fade-enter-active,
.slet-fade-leave-active {
    transition: opacity 0.2s ease;
}
.slet-fade-enter-from,
.slet-fade-leave-to {
    opacity: 0;
}

/* Bottom edit actions container */
.edit-actions {
    
    bottom: 0;
    background: var(--color-bg);
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    border-top: 1px solid var(--color-border);
}

/* Delete button (soft red background like screenshot) */
.edit-delete {
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

/* Save button (green bottom button) */
.edit-save {
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

</style>