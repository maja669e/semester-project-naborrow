<script>
// Udforsk-visning der viser genstande tilhørende alle andre brugere.
// Egne genstande filtreres fra så brugeren ikke kan låne af sig selv.
// Klik på et kort åbner detaljeskærmen med mulighed for at starte låneanmodning.
import { getAllItems } from '@/services/items/itemservice.js'
import ItemDetailCard from '@/components/items/ItemDetailCard.vue'
import { getItemStatus, statusLabel } from '@/utils/itemStatus.js'
import StatusBadge from '@/components/common/StatusBadge.vue'


export default {
    name: 'ExploreView',

    data() {
        return {
            items: [],
            error: null,
            selectedItem: null,  // Den genstand der vises i detaljeskærmen
        }
    },
    components: {
    ItemDetailCard,
    StatusBadge
    },

    inject: ['authStore', 'startRentalFlow', 'rental'],

    methods: {
        // Bygger en fuld billed-URL fra en rå server-sti eller base64-streng
        resolveImageUrl(rawUrl) {
            if (!rawUrl) {
                return 'https://placehold.co/400x300'
                }

                // BASE64-billeder returneres direkte
                if (rawUrl.startsWith('data:')) {
                    return rawUrl
                }

                // Allerede fuld URL
                if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
                    return rawUrl
                }

                // Lokale uploads samles med backend-baseurl
                return `http://localhost:8080/${rawUrl.replace(/^\/+/, '')}`
        },

        // Dansk label til aria-teksten (slug'en må ikke læses op). Wrapper den
        // importerede statusLabel, så templaten kan kalde den — importerede
        // funktioner er ikke automatisk tilgængelige i templaten i Options API.
        statusText(slug) {
            return statusLabel(slug)
        },

        // Hent alle genstande og filtrer brugerens egne fra
        async fetchItems() {

            this.error = null
            try {
                const data = await getAllItems()

                // Stop pænt hvis login-tilstanden mangler, så vi ikke kalder .userID på null
                const user = this.authStore.user.value
                if (!user) {
                    this.error = "Kunne ikke hente genstande"
                    return
                }
                const myId = user.userID
                this.items = data
                .filter(item => item.UserID !== myId)
                .map(item => {
                    // Udled status-badge (samme regler som detaljekortet).
                    // isOwner=false: "inaktiv" vises aldrig for andre, og findAll
                    // filtrerer allerede inaktive fra.
                    const badge = getItemStatus({
                        isActive: item.IsActive,
                        isCurrentlyRented: item.isCurrentlyRented,
                        endDate: item.currentRentalEndDate,
                        isOwner: false,
                    })
                    return {
                        ...item,
                        image: this.resolveImageUrl(item.images?.[0]?.ImageURL),
                        status: badge?.status ?? null,
                        statusDate: badge?.date ?? '',
                    }
                })
                } catch (err) {
                    console.error(err)
                    this.error = 'Kunne ikke hente genstande'
                }
        },

        // Map API-data til det format ItemDetailCard forventer og åbn detaljeskærmen
        openItem(item) {
            // isOwner=false: "inaktiv" må aldrig vises for andre brugere (og findAll
            // filtrerer dem helt fra). findAll leverer nu isCurrentlyRented +
            // currentRentalEndDate, så "Udlånt indtil ..." vises korrekt i Udforsk.
            const badge = getItemStatus({
                isActive: item.IsActive,
                isCurrentlyRented: item.isCurrentlyRented,
                endDate: item.currentRentalEndDate,
                isOwner: false,
            })
            this.selectedItem = {
                id: item.ItemID,
                title: item.ItemName,
                category: item.Category?.CategoryName,
                brand: item.Brand,
                status: badge?.status ?? null,
                statusDate: badge?.date ?? '',
                image: item.image,
                condition: item.Condition,
                maxDays: item.MaxRentPeriodDays,
                accessories: item.accessories?.map(
                accessory => accessory.AccessoryName
                ) || [],
            }
        },
        // Start låneanmodnings-flowet med den aktuelt valgte genstand
        openRentalFlow() {
            this.startRentalFlow(this.selectedItem)
        },

        // Luk detaljekortet og glem den gemte genstand, så et nyt besøg på
        // Udforsk starter på oversigten i stedet for at genåbne kortet.
        closeDetail() {
            this.selectedItem = null
            this.rental.item = null
        },
    },

    mounted() {
    this.fetchItems()
        // Kommer brugeren tilbage fra et annulleret låne-flow, genåbnes
        // detaljekortet for den genstand de var inde på (gemt i delt rental-state).
        // Ryd den straks efter (one-shot), så et gammelt item ikke bliver ved
        // med at skygge for oversigten ved senere besøg på Udforsk.
        if (this.rental.item) {
            this.selectedItem = this.rental.item
            this.rental.item = null
        }
    }
}
</script>
<template>

<main class="page">

    <!-- Detaljeside for den valgte genstand -->
    <section v-if="selectedItem">

        <v-btn
            class="mb-4"
            variant="text"
            @click="closeDetail"
        >
            ← Tilbage
        </v-btn>

        <ItemDetailCard :item="selectedItem"
        :showRentalButton="true"
        @requestLoan="openRentalFlow" />

    </section>

    <!-- Oversigtsside med kortgitter af genstande -->
    <section v-else>

        <h1 class="page-title">
            Udforsk
        </h1>

        <!-- Synlig fejltilstand når hentningen fejler, med mulighed for at prøve igen -->
        <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            role="alert"
            class="mb-4"
        >
            {{ error }}
            <template #append>
                <v-btn
                    size="small"
                    variant="text"
                    prepend-icon="mdi-refresh"
                    @click="fetchItems"
                >
                    Prøv igen
                </v-btn>
            </template>
        </v-alert>

        <div class="card-grid">

            <!-- role/tabindex + keydown gør kortet tastaturtilgængeligt (WCAG 2.1.1).
                 Statusmærket vises som overlay på billedet, så status ses både her
                 på oversigten og når man klikker ind (samme StatusBadge). -->
            <article
                v-for="item in items"
                :key="item.ItemID"
                class="udforsk-kort"
                role="button"
                tabindex="0"
                :aria-label="`${item.ItemName}${item.Brand ? ', ' + item.Brand : ''}${item.status ? ' — ' + statusText(item.status) : ''}`"
                @click="openItem(item)"
                @keydown.enter.prevent="openItem(item)"
                @keydown.space.prevent="openItem(item)"
            >

                <img
                    :src="item.image"
                    :alt="item.ItemName"
                    class="udforsk-kort__billede"
                />

                <div class="udforsk-kort__indhold">
                    <!-- Titelrække: titel til venstre, statusmærke til højre — som ItemCard -->
                    <div class="udforsk-kort__top">
                        <h2 class="udforsk-kort__titel">{{ item.ItemName }}</h2>
                        <StatusBadge
                            v-if="item.status"
                            :status="item.status"
                            :date="item.statusDate"
                        />
                    </div>
                    <p class="udforsk-kort__meta">
                        {{ item.Category?.CategoryName }}
                        <span v-if="item.Brand"> · {{ item.Brand }}</span>
                    </p>
                </div>

            </article>

        </div>

    </section>

</main>

</template>
<style scoped>

.page {
    padding: 24px;
    /* Ekstra bund-plads så det sidste kort ikke skjules bag den faste AppBottomNav (64px) */
    padding-bottom: calc(88px + env(safe-area-inset-bottom));
}

.page-title {
    margin-bottom: 24px;
}

.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
}

/* ─── Udforsk-kort (matcher design-systemet: surface, border, radius) ─── */
.udforsk-kort {
    display: flex;
    flex-direction: column;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    cursor: pointer;
    text-align: left;
}

/* Synlig fokusring ved tastaturnavigation (WCAG 2.4.7) */
.udforsk-kort:focus-visible {
    outline: 3px solid var(--color-neutral);
    outline-offset: 3px;
}

.udforsk-kort__billede {
    width: 100%;
    height: 200px;
    object-fit: cover;
    display: block;
}

/* Titelrække: titel til venstre, statusmærke til højre (som ItemCard) */
.udforsk-kort__top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: 4px;
}

.udforsk-kort__indhold {
    padding: var(--space-3);
}

.udforsk-kort__titel {
    font-family: var(--font-body);
    font-size: var(--text-body);
    font-weight: 600;
    color: var(--color-neutral);
    margin: 0 0 4px;
}

.udforsk-kort__meta {
    font-family: var(--font-body);
    font-size: var(--text-label);
    color: var(--color-text-secondary);
    margin: 0;
}



</style>