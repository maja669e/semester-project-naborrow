<script>
import { getAllItems } from '@/services/itemservice.js'

export default {
    name: 'Homepage',

    data() {
        return {
            items: [],
            error: null,
        }
    },

    methods: {
      resolveImageUrl(rawUrl) {
    if (!rawUrl) {
        return 'https://placehold.co/400x300'
    }

    // BASE64 billeder
    if (rawUrl.startsWith('data:')) {
        return rawUrl
    }

    // Allerede fuld URL
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
        return rawUrl
    }

    // Lokale uploads
    return `http://localhost:8080/${rawUrl.replace(/^\/+/, '')}`
},

        async fetchItems() {

            try {
                const data = await getAllItems()
                console.log(data)

                this.items = data.map(item => ({
    ...item,
    image: this.resolveImageUrl(item.images?.[0]?.ImageURL)
}))
            } catch (err) {
                console.error(err)
                this.error = 'Kunne ikke hente items'
            } 
        }
    },

    mounted() {
        this.fetchItems()
    }
}
</script>
<template>
    <main class="page">

        <h1 class="page-title">
            Forside
        </h1>

      

        <div class="card-grid">

            <v-card
                v-for="item in items"
                :key="item.ItemID"
            >
               <v-img
    :src="item.image"
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



</style>