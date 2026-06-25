<script>
// Detaljekort for en enkelt genstand i Udforsk-visningen.
// Viser billede, titel, stand, maks låneperiode og tilbehør.
// showRentalButton styrer om "Anmod om lån"-knappen er synlig
// (true i ExploreView, false i egne genstande).
import StatusBadge from "@/components/common/StatusBadge.vue";

export default {
    name: 'ItemDetailCard',

  components: { StatusBadge },

  props: {
    // Genstandsobjektet med alle felter (title, image, status m.fl.)
    item: {
        type: Object,
        required: true
    },
    // Viser "Anmod om lån"-knappen når true
    showRentalButton: {
        type: Boolean,
        default: false
    }
},
emits: ['requestLoan'],

    computed: {
        // Returnerer tilbehørslisten eller et tomt array
        accessoriesList() {
        return this.item.accessories || []
        }
    }
}
</script>

<template>

<article class="detail-card">

    <!-- Billede og statusmærke -->
    <figure class="image-wrapper">

        <img
            :src="item.image"
            :alt="item.title"
            class="detail-image"
        />

    </figure>

    <!-- Statusmærke i mellemrummet mellem billedet og titlen, højrestillet -->
    <div v-if="item.status" class="detail-status-row">
        <StatusBadge
            :status="item.status"
            :date="item.statusDate"
        />
    </div>

    <!-- Titel og metadata -->
    <section class="detail-content">

        <h1 class="detail-title">
            {{ item.title }}
        </h1>

        <p class="detail-meta">
            {{ item.category }}

            <span v-if="item.brand">
                · {{ item.brand }}
            </span>

        
        </p>

    </section>
<!-- Infobokse: maks låneperiode og stand -->
<section class="detail-boxes">

    <!-- Maks låneperiode -->
    <div class="detail-box">

        <span class="detail-box-label">
            Maks låne
        </span>

        <span class="detail-box-number">
            {{ item.maxDays || '-' }}
        </span>

        <span class="detail-box-unit">
            dage
        </span>

    </div>

    <!-- Stand -->
    <div
        v-if="item.condition"
        class="detail-box"
    >

        <span class="detail-box-label">
            Stand
        </span>

        <span class="detail-box-text">
            {{ item.condition }}
        </span>

    </div>

</section>

<!-- Tilbehørsliste (vises kun hvis genstanden har tilbehør) -->
<section
    v-if="accessoriesList.length"
    class="detail-accessories"
>

    <h3 class="detail-box-heading">
        Tilbehør
    </h3>

    <div class="detail-chips">

        <span
            v-for="accessory in accessoriesList"
            :key="accessory"
            class="detail-chip"
        >
            {{ accessory }}
        </span>

    </div>

</section>

</article>

<!-- Låneanmodningsknap (vises kun i Udforsk-visningen) -->
<section
    v-if="showRentalButton"
    class="rental-action"
>

    <v-btn
        block
        size="large"
        color="primary"
        rounded="xl"
        @click="$emit('requestLoan')"
    >
        Anmod om lån
    </v-btn>

</section>

</template>

<style scoped>

.detail-card {
    background: var(--color-bg);
    min-height: 100vh;
    padding: 16px;
    padding: 16px;
}

.image-wrapper {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 20px;
}

.detail-image {
    width: 100%;
    height: 260px;
    object-fit: cover;
    display: block;
}

/* Statusmærke i mellemrummet mellem billede og titel, skubbet til højre */
.detail-status-row {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 12px;
}

.detail-title {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 8px;
}

.detail-meta {
    color: var(--color-text-secondary);
    margin-bottom: 24px;
}

.detail-boxes {
    display: flex;
    gap: 12px;
}

.detail-box {
    flex: 1;

    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 18px;

    padding: 20px;

    display: flex;
    flex-direction: column;
    align-items: center;
}

.detail-accessories {
    margin-top: 12px;

    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 18px;

    padding: 20px;
}

.detail-box-label {
    color: var(--color-text-secondary);
    margin-bottom: 8px;
}

.detail-box-number {
    font-size: 32px;
    font-weight: 700;
}

.detail-box-unit {
    color: var(--color-text-secondary);
}

.detail-box-heading {
    margin-bottom: 12px;
}

.detail-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.detail-chip {
    background: var(--color-image-bg);
    padding: 6px 12px;
    border-radius: var(--radius-full);
}
.rental-action {
    margin-top: 24px;
    margin-bottom: 64px;
}
</style>