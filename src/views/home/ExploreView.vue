<script>
// Udforsk-visning der viser genstande tilhørende alle andre brugere.
// Egne genstande filtreres fra så brugeren ikke kan låne af sig selv.
// Klik på et kort åbner detaljeskærmen med mulighed for at starte låneanmodning.
import { getAllItems } from '@/services/items/itemservice.js'
import ItemDetailCard from '@/components/items/ItemDetailCard.vue'
import { getItemStatus } from '@/utils/itemStatus.js'


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
    ItemDetailCard
    },

    inject: ['authStore', 'startRentalFlow'],

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

        // Hent alle genstande og filtrer brugerens egne fra
        async fetchItems() {

            this.error = null
            try {
                const data = await getAllItems()

                const myId = this.authStore.user.value.userID;
                this.items = data
                .filter(item => item.UserID !== myId)
                .map(item => ({
                    ...item,
                    image: this.resolveImageUrl(item.images?.[0]?.ImageURL)
                }))
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
    },

    mounted() {
    this.fetchItems()
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
            @click="selectedItem = null"
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

            <!-- role/tabindex + keydown gør kortet tastaturtilgængeligt (WCAG 2.1.1),
                 samme mønster som PickupTimeSelector.vue -->
            <v-card
                v-for="item in items"
                :key="item.ItemID"
                class="cursor-pointer"
                role="button"
                tabindex="0"
                :aria-label="`${item.ItemName}${item.Brand ? ', ' + item.Brand : ''}`"
                @click="openItem(item)"
                @keydown.enter.prevent="openItem(item)"
                @keydown.space.prevent="openItem(item)"
            >

                <v-img
                    :src="item.image"
                    :alt="item.ItemName"
                    height="220"
                    cover
                />

                <v-card-title>
                    {{ item.ItemName }}
                </v-card-title>

                <v-card-subtitle>
                    {{ item.Brand }}
                </v-card-subtitle>

                <v-card-text>
                    {{ item.Category?.CategoryName }}
                </v-card-text>

            </v-card>

        </div>

    </section>

</main>

</template>
<style scoped>

.page {
    padding: 24px;
}

.page-title {
    margin-bottom: 24px;
}

.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
}

/* Synlig fokusring ved tastaturnavigation (WCAG 2.4.7) */
.cursor-pointer:focus-visible {
    outline: 3px solid var(--color-neutral);
    outline-offset: 3px;
}



</style>