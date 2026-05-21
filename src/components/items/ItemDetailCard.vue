<script>
export default {
    name: 'ItemDetailCard',

  props: {
    item: {
        type: Object,
        required: true
    },

    showRentalButton: {
        type: Boolean,
        default: false
    }
},
emits: ['requestLoan'],

    computed: {
        statusClass() {
            if (this.item.status === 'Tilgængelig') return 'status-tilgaengelig'
            if (this.item.status === 'Udlånt') return 'status-udlaant'
            if (this.item.status === 'Inaktiv') return 'status-inaktiv'

            return ''
        },

     accessoriesList() {
        return this.item.accessories || []
        }
    }
}
</script>

<template>

<article class="detail-card">

    <!-- IMAGE -->
    <figure class="image-wrapper">

        <img
            :src="item.image"
            :alt="item.title"
            class="detail-image"
        />

        <span class="detail-status" :class="statusClass">
            {{ item.status }}
        </span>

    </figure>

    <!-- CONTENT -->
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
<!-- TOP INFO BOXES -->
<section class="detail-boxes">

    <!-- MAX DAYS -->
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

    <!-- CONDITION -->
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

<!-- ACCESSORIES -->
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

<!-- RENTAL BUTTON -->
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

.detail-status {
    position: absolute;
    bottom: 12px;
    right: 12px;

    padding: 6px 12px;
    border-radius: 999px;

    font-size: 14px;
    font-weight: 600;
}

.status-tilgaengelig {
    background: #e8f0e3;
    color: #2d4a1e;
}

.status-udlaant {
    background: #f7e8d8;
    color: #7a3810;
}

.status-inaktiv {
    background: #eceae8;
    color: #3a3836;
}

.detail-title {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 8px;
}

.detail-meta {
    color: #666;
    margin-bottom: 24px;
}

.detail-boxes {
    display: flex;
    gap: 12px;
}

.detail-box {
    flex: 1;

    background: white;
    border: 1px solid #ddd;
    border-radius: 18px;

    padding: 20px;

    display: flex;
    flex-direction: column;
    align-items: center;
}

.detail-accessories {
    margin-top: 12px;

    background: white;
    border: 1px solid #ddd;
    border-radius: 18px;

    padding: 20px;
}

.detail-box-label {
    color: #777;
    margin-bottom: 8px;
}

.detail-box-number {
    font-size: 32px;
    font-weight: 700;
}

.detail-box-unit {
    color: #777;
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
    background: #f3f3f3;
    padding: 6px 12px;
    border-radius: 999px;
}
.rental-action {
    margin-top: 24px;
    margin-bottom: 64px;
}
</style>