<script>
export default {
    name: 'GenstandCard',
    components: {
    },
    data() {
        return {
        }
    },
    props: {
        id: {
            type: Number,
            required: true
        },
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
    },
    computed: {
    // Returnerer den korrekte CSS-klasse baseret på status-prop
    statusClass() {
        if (this.status === 'Tilgængelig') return 'status-tilgaengelig'
        if (this.status === 'Udlånt') return 'status-udlaant'
        if (this.status === 'Inaktiv') return 'status-inaktiv'
    }
},
    methods: {
        // Når kortet klikkes, send genstands-id op til forældresiden
        handleClick() {
            this.$emit('cardClicked', this.id)
        }
    },
    watch: {
    },
    emits: ['cardClicked']
}
</script>

<template>
    <article class="card" @click="handleClick">

    <!--- Billedsektion -->
    <img
        :src="image" 
        :alt="`Billede af ${title}`"
        class="card-image"
    />

    <!-- Tekstindholdssektion -->
    <div class="card-content">

    <!-- Titel og status på samme linje -->
        <div class="card-top">
            <!-- Genstandens titel -->
            <h2 class="card-title">{{ title }}</h2>

            <!-- Statustag - viser Tilgængelig, Udlånt eller Inaktiv -->
            <span class="card-status" :class="statusClass">{{ status }}</span>
        </div>

        <!-- Kategori vises altid, mærke vises kun hvis det har en værdi -->
        <p class="card-meta">
            {{ category }}
            <span v-if="brand"> · {{ brand }}</span>
        </p>

    </div>

    </article>
</template>

<style scoped>

/* Hele kortet - billede og tekst side om side */
.card {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--space-3);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-3);
    width: 100%;
    cursor: pointer;
}

/* Billedets størrelse og form */
.card-image {
    width: 64px;
    height: 64px;
    border-radius: var(--radius-md);
    object-fit: cover;
    flex-shrink: 0;
}

/* Teksten sidder ved siden af billedet og fylder den resterende plads */
.card-content {
    flex: 1;
}

/* Titel og status sidder på samme linje */
.card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
}

/* Genstandens titel */
.card-title {
    font-family: var(--font-body);
    font-size: var(--text-body);
    font-weight: 600;
    color: var(--color-neutral);
    margin: 0;
}

/* Kategori og mærke tekst under titlen */
.card-meta {
    font-family: var(--font-body);
    font-size: var(--text-label);
    color: var(--color-secondary);
    margin: 0;
}

/* Statustag - pilleform */
.card-status {
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 600;
    padding: 5px 11px;
    border-radius: var(--radius-full);
    min-height: 32px;
    display: flex;
    align-items: center;
}

/* Tilgængelig - grøn */
.status-tilgaengelig {
    background: #e8f0e3;
    color: #2d4a1e;
}

/* Udlånt - orange */
.status-udlaant {
    background: #f7e8d8;
    color: #7a3810;
}

/* Inaktiv - grå */
.status-inaktiv {
    background: #eceae8;
    color: #3a3836;
}

</style>