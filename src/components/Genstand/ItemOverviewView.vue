<script>
import ItemCard from './ItemCard.vue'
import ItemDetail from './ItemDetailView.vue'
import ItemFilter from './ItemFilterTabs.vue'
import { getAllItems } from '@/services/itemservice.js'

export default {
    name: 'ItemOverviewView',
    components: {
        ItemCard,
        ItemDetail,
        ItemFilter
    },
    data() {
        return {
            selectedItem: null,
            activeFilter: 'Alle',
            items: [],
            loading: false,
            error: null,
            highlightedItemId: null,
            highlightTimer: null,
            // Tekst i bekræftelsesdialogen ved sletning
            sletBesked: '',
            // Styrer visningen af sletningsbekræftelsen
            visSletBesked: false,
        }
    },
    props: {
        reloadKey: {
            type: Number,
            default: 0
        },
        selectItemId: {
            type: [Number, String],
            default: null
        }
    },
    computed: {
        // Filtrerer genstande baseret på aktivt filter
        // Hvis Alle er valgt vises alle genstande
        filteredItems() {
            if (this.activeFilter === 'Alle') return this.items
            return this.items.filter(item =>
                item.status === this.activeFilter
            )
        }
    },
    methods: {
        resolveImageUrl(rawUrl) {
            if (!rawUrl) return 'https://placehold.co/64x64'
            if (rawUrl.startsWith('data:')) return rawUrl
            if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) return rawUrl
            return `http://localhost:8080/${rawUrl.replace(/^\/+/, '')}`
        },
        async fetchItems() {
            this.loading = true
            try {
                const data = await getAllItems()
                // Map API data til det format komponenterne forventer
                this.items = data.map(item => ({
                    id: item.ItemID,
                    title: item.ItemName,
                    category: item.Category?.CategoryName || item.category?.CategoryName || String(item.CategoryID),
                    brand: item.Brand,
                    status: item.IsActive ? 'Tilgængelig' : 'Inaktiv',
                    image: this.resolveImageUrl(item.images?.[0]?.ImageURL),
                    rawImage: item.images?.[0]?.ImageURL,
                    condition: item.Condition,
                    maxDays: item.MaxRentPeriodDays,
                    accessories: item.accessories?.map(a => a.AccessoryName).join(', ') || null,
                    totalLoans: 0,
                    activeLoans: 0,
                    rating: null
                }))
                // Hvis parent sender et nyt id, scroll til kortet i oversigten og flash kortet kortvarigt
                if (this.selectItemId) {
                    this.flashAndScrollToItem(this.selectItemId)
                }
            } catch (err) {
                this.error = 'Kunne ikke hente genstande. Prøv igen.'
                console.error('Fejl ved hentning af genstande:', err)
            } finally {
                this.loading = false
            }
        },
        flashAndScrollToItem(itemId) {
            this.highlightedItemId = String(itemId)

            this.$nextTick(() => {
                const element = document.getElementById(`item-${itemId}`)
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
            })

            clearTimeout(this.highlightTimer)
            this.highlightTimer = setTimeout(() => {
                this.highlightedItemId = null
            }, 2200)
        },
        visDetaljer(id) {
            this.selectedItem = this.items.find(item => item.id === id)
        },
        //Køres når GenstandDetail sender 'genstandSlettet' eventet op
        genstandBlevSlettet(titel) {
            // Fjern genstanden fra listen uden at hente data fra backend igen
            this.items = this.items.filter(item => item.id !== this.selectedItem.id)
            //gå tilbage til listevisning
            this.selectedItem =null
            // Vis bekræftelsesbesked med ganstandes navn
            this.sletBesked =`${titel} blev slettet`
            this.visSletBesked = true
            // Skjul beskeden efter 3 sekunder
            setTimeout(() => {
                this.visSletBesked = false
            }, 3000);

        },
    async opdaterGenstand() {
    await this.fetchItems()

    //fetcher item igen for at få de opdaterede data
    this.selectedItem = this.items.find(
        item => item.id === this.selectedItem.id
    )
},
    },
    mounted() {
        // Hent genstande når komponenten er klar
        this.fetchItems()
    },

    watch: {
        // Når parent ændrer reloadKey (f.eks. efter opret), hent listen igen
        reloadKey(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.fetchItems()
            }
        }
        ,
        selectItemId(newVal, oldVal) {
            if (!newVal) return
            if (newVal !== oldVal) {
                this.flashAndScrollToItem(newVal)
            }
        }
    },
    emits: [],
    beforeUnmount() {
        clearTimeout(this.highlightTimer)
    }
}
</script>

<template>
    <main class="page">
        <!--- Bekræftelsesnotifikation efter sletning -->
        <output
        v-if="visSletBesked"
        class="slet-bekraeftelse"
        aria-live="polite"
        aria-atomic="true"
        >
            ✅ {{ sletBesked }}
        </output>

        <!-- Vis detaljesiden når en genstand er valgt -->
        <ItemDetail
            v-if="selectedItem"
            :id="selectedItem.id"
            :title="selectedItem.title"
            :category="selectedItem.category"
            :brand="selectedItem.brand"
            :status="selectedItem.status"
            :image="selectedItem.image"
            :imagePath="selectedItem.rawImage"
            :condition="selectedItem.condition"
            :maxDays="selectedItem.maxDays"
            :accessories="selectedItem.accessories"
            :totalLoans="selectedItem.totalLoans"
            :activeLoans="selectedItem.activeLoans"
            :rating="selectedItem.rating"
            @gåTilbage="selectedItem = null"
            @genstandSlettet="genstandBlevSlettet"
            @itemUpdated="opdaterGenstand"
        />

        <!-- Liste visning - skjules når en genstand er valgt -->
        <section v-else>

            <!-- Sidetitel -->
            <h1 class="page-title">Dine genstande</h1>

            <!-- Filter tabs - activeFilter opdateres når brugeren klikker -->
            <ItemFilter
                :activeFilter="activeFilter"
                @filterChanged="activeFilter = $event"
            />
            <!--- Loading state -->
            <p v-if="loading" class="loading-state" aria-live="polite">
                <v-progress-circular indeterminate color="primary" />
            </p>

            <!-- Error state -->
            <p v-else-if="error" class="error-text" role="alert">{{ error }}</p>

            <!-- Liste af filtrerede kort -->
            <ul v-else class="card-list">
                <li
                    v-for="item in filteredItems"
                    :key="item.id"
                    :id="`item-${item.id}`"
                    :class="{ 'card-list__item--flash': String(highlightedItemId) === String(item.id) }"
                >
                    <ItemCard
                        :id="item.id"
                        :title="item.title"
                        :category="item.category"
                        :brand="item.brand"
                        :status="item.status"
                        :image="item.image"
                        @cardClicked="visDetaljer"
                    />
                </li>
            </ul>

            <!-- Vises når ingen genstande matcher det valgte filter -->
            <p
                v-if="filteredItems.length === 0"
                class="ingen-resultater"
                role="status"
                aria-live="polite"
            >
                Ingen genstande matcher det valgte filter
            </p>

        </section>

        <footer  v-if="!selectedItem" class="opret-knap-wrapper">
            <v-btn
                color="primary"
                rounded="lg"
                class="opret-knap"
                @click="$emit('go-to-page-one')"
            >
                Opret ny genstand
            </v-btn>
        </footer> 

    </main>
</template>

<style scoped>

/* Sidebaggrund - varm off-white som fylder hele skærmen */
.page {
    background: var(--color-bg);
    min-height: 100vh;
    padding: var(--space-6) var(--space-4);
}

/* Sidetitel */
.page-title {
    font-family: var(--font-display);
    font-size: var(--text-h1);
    font-weight: 600;
    color: var(--color-neutral);
    margin-bottom: var(--space-4);
    text-align: center;
}

/* Kort stablet lodret med mellemrum imellem */
.card-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    list-style: none;
    padding: 0;
    margin: 0;
}

.card-list__item--flash {
    border-radius: var(--radius-lg);
    animation: item-flash 2.2s ease-out 1;
}

@keyframes item-flash {
    0% {
        filter: brightness(1);
        transform: scale(1);
    }
    20% {
        filter: brightness(1.08);
        transform: scale(1.01);
    }
    65% {
        filter: brightness(1.03);
        transform: scale(1);
    }
    100% {
        filter: brightness(1);
        transform: scale(1);
    }
}

.card-list__item--highlighted {
    border-radius: var(--radius-lg);
    box-shadow: 0 0 0 2px var(--color-primary);
    transition: box-shadow 0.25s ease;
}

/* Besked når ingen genstande matcher filteret */
.ingen-resultater {
    font-family: var(--font-body);
    font-size: var(--text-label);
    color: var(--color-secondary);
    text-align: center;
    margin-top: var(--space-8);
}
.opret-knap-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: white;
  border-top: 1px solid var(--color-border);
}

.opret-knap {
  width: 100%;
  height: 48px !important;
  text-transform: none;
}

.page {
  background: var(--color-bg);
  min-height: 100vh;
  padding: var(--space-6) var(--space-4);
  padding-bottom: 90px;
}
.loading-state {
    text-align: center;
    margin-top: var(--space-8);
}

.error-text {
    color: red;
    font-family: var(--font-body);
    font-size: var(--text-label);
    text-align: center;
    margin-top: var(--space-8);
}
/* Bekræftelsesnotifikation efter sletning */
/* position: fixed holder den synlig over alt andet indhold */
/* bottom: 90px placerer den over den faste "Opret ny genstand" knap i bunden */
.slet-bekraeftelse {
    position: fixed;
    bottom: 90px;
    left: var(--space-4);
    right: var(--space-4);
    background: var(--color-neutral);
    color: #ffffff;
    font-family: var(--font-body);
    font-size: var(--text-label);
    font-weight: 500;
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-lg);
    text-align: center;
    z-index: 200;
}
</style>