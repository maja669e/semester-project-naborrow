<script>
export default {
    name: 'GenstandFilter',
    props: {
        // Det aktive filter - sendes ind fra forælderen
        activeFilter: {
            type: String,
            required: true
        }
    },
    emits: ['filterChanged'],
    data() {
        return {
            // De fire mulige filtre - Alle viser alle genstande
            filters: ['Alle', 'Tilgængelig', 'Udlånt', 'Inaktiv']
        }
    },
    methods: {
        // Kaldes når en tab klikkes - sender det valgte filter op til forælderen
        vælgFilter(filter) {
            this.$emit('filterChanged', filter)
        }
    }
}
</script>

<template>
    <!-- Filter navigation - viser fire tabs øverst på listen -->
    <nav class="filter-bar" aria-label="Filtrer genstande efter status">

        <!-- Loop gennem filtre og vis en tab for hver -->
        <button
            v-for="filter in filters"
            :key="filter"
            class="filter-tab"
            :class="{ 'filter-tab-aktiv': activeFilter === filter }"
            @click="vælgFilter(filter)"
            :aria-pressed="activeFilter === filter"
            :aria-label="`Vis ${filter === 'Alle' ? 'alle genstande' : filter}`"
        >
            {{ filter }}
        </button>

    </nav>
</template>

<style scoped>

/* Filter bar - fylder hele bredden og fordeler tabs jævnt */
.filter-bar {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: var(--space-2);
    margin-bottom: var(--space-6);
    width: 100%;
    padding: 2px 0;
}

/* Basis tab - alle tabs har samme størrelse og vægt altid */
.filter-tab {
    font-family: var(--font-body);
    font-size: var(--text-label);
    font-weight: 600;
    color: var(--color-secondary);
    background: transparent;
    border: 1.5px solid var(--color-border);
    border-radius: var(--radius-full);
    padding: var(--space-2) var(--space-4);
    min-height: 44px;
    cursor: pointer;
    white-space: nowrap;
    flex: 1;
    transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

/* Hover - subtilt grønt */
.filter-tab:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
}

/* Fjerner fokus ring ved museklik - aktiv styling giver nok feedback */
.filter-tab:focus:not(:focus-visible) {
    outline: none;
}

/* Fokus ring kun ved keyboard navigation */
.filter-tab:focus-visible {
    outline: 3px solid var(--color-neutral);
    outline-offset: 3px;
}

/* Aktiv tab - fyldt grøn med samme padding som inaktive tabs */
.filter-tab-aktiv {
    background: var(--color-primary) !important;
    color: #ffffff !important;
    border-color: var(--color-primary) !important;
    padding: var(--space-2) var(--space-4) !important;
}

</style>