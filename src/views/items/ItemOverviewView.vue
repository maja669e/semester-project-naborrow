<script>
// Genstandsoversigt – viser alle brugerens genstande som en kortliste.
// Understøtter statusfiltrering via ItemFilterTabs og åbner ItemDetailView
// når brugeren klikker på et kort.
//
// Tidligere modtog denne komponent reloadKey og selectItemId som props fra App.vue.
// Nu injekterer den genstande-objektet og gaaTilOpret-metoden direkte fra App.vue
// via provide/inject – præcis som vist i "Løsningen: Provide & inject"-slidet.
import ItemCard       from "@/components/items/ItemCard.vue";
import ItemDetailView from "@/components/items/ItemDetailView.vue";
import ItemFilterTabs from "@/components/items/ItemFilterTabs.vue";
import { getAllItems } from "@/services/items/itemservice.js";

export default {
  name: "ItemOverviewView",
  components: { ItemCard, ItemDetailView, ItemFilterTabs },

  // Injekterer fra App.vue's provide():
  //   genstande  – reaktivt objekt med genindlaesNoegle og vistGenstandId
  //   gaaTilOpret – navigationsmetode til opret-genstand-ruten
  inject: ["genstande", "gaaTilOpret"],

  data() {
    return {
      valgtGenstand:      null,    // Den genstand der vises i detaljeskærmen
      aktivtFilter:       "Alle",
      genstande_liste:    [],      // Lokal kopi af hentet data (adskilt fra injekteret genstande-objekt)
      indlaeser:          false,
      fejl:               null,
      fremhaevetGenstandId: null,  // Id på den genstand der animeres efter oprettelse
      fremhaevetTimer:    null,    // Timeout-reference til at stoppe animationen
      sletBesked:         "",
      visSletBesked:      false,
    };
  },

  computed: {
    // Filtrer genstandslisten baseret på det valgte statusfilter
    filtreredeGenstande() {
      if (this.aktivtFilter === "Alle") return this.genstande_liste;
      return this.genstande_liste.filter((g) => g.status === this.aktivtFilter);
    },
  },

  methods: {
    // Byg en fuld billed-URL fra en rå server-sti eller base64-streng
    resolveImageUrl(raaUrl) {
      if (!raaUrl) return "https://placehold.co/64x64";
      if (raaUrl.startsWith("data:")) return raaUrl;
      if (raaUrl.startsWith("http://") || raaUrl.startsWith("https://")) return raaUrl;
      return `http://localhost:8080/${raaUrl.replace(/^\/+/, "")}`;
    },

    // Hent alle genstande fra API'et og map dem til det lokale dataformat
    async hentGenstande() {
      this.indlaeser = true;
      try {
        const data = await getAllItems();
        this.genstande_liste = data.map((genstand) => ({
          id:          genstand.ItemID,
          title:       genstand.ItemName,
          category:
            genstand.Category?.CategoryName ||
            genstand.category?.CategoryName ||
            String(genstand.CategoryID),
          brand:       genstand.Brand,
          status:      genstand.IsActive ? "Tilgængelig" : "Inaktiv",
          image:       this.resolveImageUrl(genstand.images?.[0]?.ImageURL),
          rawImage:    genstand.images?.[0]?.ImageURL,
          condition:   genstand.Condition,
          maxDays:     genstand.MaxRentPeriodDays,
          accessories:
            genstand.accessories?.map((a) => a.AccessoryName).join(", ") || null,
          totalLoans:  0,
          activeLoans: 0,
          rating:      null,
        }));

        // Scroll til og fremhæv en specifik genstand hvis angivet via inject
        if (this.genstande.vistGenstandId) {
          this.fremhaevOgScrollTilGenstand(this.genstande.vistGenstandId);
        }
      } catch (fejl) {
        this.fejl = "Kunne ikke hente genstande. Prøv igen.";
        console.error("Fejl ved hentning af genstande:", fejl);
      } finally {
        this.indlaeser = false;
      }
    },

    // Fremhæv et kort med en flash-animation og scroll det ind i visningen
    fremhaevOgScrollTilGenstand(genstandId) {
      this.fremhaevetGenstandId = String(genstandId);
      this.$nextTick(() => {
        const element = document.getElementById(`genstand-${genstandId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
      // Stop animationen efter 2,2 sekunder (matcher CSS-animationens varighed)
      clearTimeout(this.fremhaevetTimer);
      this.fremhaevetTimer = setTimeout(() => {
        this.fremhaevetGenstandId = null;
      }, 2200);
    },

    // Åbn detaljeskærmen for den valgte genstand
    visDetaljer(id) {
      this.valgtGenstand = this.genstande_liste.find((g) => g.id === id);
    },

    // Modtag besked fra ItemDetailView om at en genstand er slettet
    genstandBlevSlettet(titel) {
      this.genstande_liste = this.genstande_liste.filter(
        (g) => g.id !== this.valgtGenstand.id
      );
      this.valgtGenstand = null;
      this.sletBesked = `${titel} blev slettet`;
      this.visSletBesked = true;
      setTimeout(() => {
        this.visSletBesked = false;
      }, 3000);
    },

    // Opdater den viste genstand efter redigering uden at genhente hele listen
    async opdaterGenstand() {
      await this.hentGenstande();
      this.valgtGenstand = this.genstande_liste.find(
        (g) => g.id === this.valgtGenstand.id
      );
    },
  },

  mounted() {
    this.hentGenstande();
  },

  watch: {
    // Genhent listen når App.vue øger genstande.genindlaesNoegle (fx efter oprettelse).
    // Vi bruger string dot-notation da genindlaesNoegle er en property på det
    // injekterede genstande-objekt – Vue 3 understøtter dette i Options API.
    "genstande.genindlaesNoegle"(nyVaerdi, gammelVaerdi) {
      if (nyVaerdi !== gammelVaerdi) this.hentGenstande();
    },

    // Fremhæv en genstand når App.vue sætter et nyt id (fx efter oprettelse)
    "genstande.vistGenstandId"(nyVaerdi, gammelVaerdi) {
      if (!nyVaerdi) return;
      if (nyVaerdi !== gammelVaerdi) this.fremhaevOgScrollTilGenstand(nyVaerdi);
    },
  },

  beforeUnmount() {
    // Ryd timeren så der ikke sker opdateringer efter komponenten er fjernet
    clearTimeout(this.fremhaevetTimer);
  },
};
</script>

<template>
  <main class="side">

    <!-- Bekræftelsesbesked efter sletning -->
    <output
      v-if="visSletBesked"
      class="slet-bekraeftelse"
      aria-live="polite"
      aria-atomic="true"
    >
      ✅ {{ sletBesked }}
    </output>

    <!-- Detaljeskærm for valgt genstand -->
    <ItemDetailView
      v-if="valgtGenstand"
      :id="valgtGenstand.id"
      :title="valgtGenstand.title"
      :category="valgtGenstand.category"
      :brand="valgtGenstand.brand"
      :status="valgtGenstand.status"
      :image="valgtGenstand.image"
      :imagePath="valgtGenstand.rawImage"
      :condition="valgtGenstand.condition"
      :maxDays="valgtGenstand.maxDays"
      :accessories="valgtGenstand.accessories"
      :totalLoans="valgtGenstand.totalLoans"
      :activeLoans="valgtGenstand.activeLoans"
      :rating="valgtGenstand.rating"
      @gåTilbage="valgtGenstand = null"
      @genstandSlettet="genstandBlevSlettet"
      @itemUpdated="opdaterGenstand"
    />

    <!-- Listevisning med filter og kortliste -->
    <section v-else>
      <h1 class="side-titel">Dine genstande</h1>

      <!-- Statusfilter-faner -->
      <ItemFilterTabs
        :activeFilter="aktivtFilter"
        @filterChanged="aktivtFilter = $event"
      />

      <!-- Indlæsningsindikator -->
      <p v-if="indlaeser" class="indlaeser-tilstand" aria-live="polite">
        <v-progress-circular indeterminate color="primary" />
      </p>

      <!-- Fejlbesked -->
      <p v-else-if="fejl" class="fejltekst" role="alert">{{ fejl }}</p>

      <!-- Genstandsliste -->
      <ul v-else class="kortliste">
        <li
          v-for="genstand in filtreredeGenstande"
          :key="genstand.id"
          :id="`genstand-${genstand.id}`"
          :class="{
            'kortliste__element--flash':
              String(fremhaevetGenstandId) === String(genstand.id),
          }"
        >
          <ItemCard
            :id="genstand.id"
            :title="genstand.title"
            :category="genstand.category"
            :brand="genstand.brand"
            :status="genstand.status"
            :image="genstand.image"
            @cardClicked="visDetaljer"
          />
        </li>
      </ul>

      <!-- Tomt filter-resultat -->
      <p
        v-if="filtreredeGenstande.length === 0"
        class="ingen-resultater"
        role="status"
        aria-live="polite"
      >
        Ingen genstande matcher det valgte filter
      </p>
    </section>

    <!-- Fast bundknap til oprettelse af ny genstand – kalder injekteret metode -->
    <footer v-if="!valgtGenstand" class="opret-knap-wrapper">
      <v-btn
        color="primary"
        rounded="lg"
        class="opret-knap"
        @click="gaaTilOpret()"
      >
        Opret ny genstand
      </v-btn>
    </footer>

  </main>
</template>

<style scoped>
/* ─── Sidecontainer ──────────────────────────────────────── */
/* padding-bottom: 154px = 64px AppBottomNav + 80px opret-knap-wrapper
   så kortlisten ikke gemmes bag de to faste bjælker */
.side {
  background: var(--color-bg);
  min-height: 100vh;
  padding: var(--space-6) var(--space-4);
  padding-bottom: 154px;
}

/* ─── Sideoverskrift ─────────────────────────────────────── */
.side-titel {
  font-family: var(--font-display);
  font-size: var(--text-h1);
  font-weight: 600;
  color: var(--color-neutral);
  margin-bottom: var(--space-4);
  text-align: center;
}

/* ─── Kortliste ──────────────────────────────────────────── */
.kortliste {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  list-style: none;
  padding: 0;
  margin: 0;
}

/* ─── Flash-animation ved nyoprettet genstand ────────────── */
.kortliste__element--flash {
  border-radius: var(--radius-lg);
  animation: kort-flash 2.2s ease-out 1;
}

@keyframes kort-flash {
  0%   { filter: brightness(1);    transform: scale(1);    }
  20%  { filter: brightness(1.08); transform: scale(1.01); }
  65%  { filter: brightness(1.03); transform: scale(1);    }
  100% { filter: brightness(1);    transform: scale(1);    }
}

/* ─── Tomt filter-resultat ───────────────────────────────── */
.ingen-resultater {
  font-family: var(--font-body);
  font-size: var(--text-label);
  color: var(--color-secondary);
  text-align: center;
  margin-top: var(--space-8);
}

/* ─── Fast opret-knap i bunden ───────────────────────────── */
/* Placeret 64px over AppBottomNav */
.opret-knap-wrapper {
  position: fixed;
  bottom: 64px;
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

/* ─── Indlæsningstilstand ────────────────────────────────── */
.indlaeser-tilstand {
  text-align: center;
  margin-top: var(--space-8);
}

/* ─── Fejltekst ──────────────────────────────────────────── */
.fejltekst {
  color: red;
  font-family: var(--font-body);
  font-size: var(--text-label);
  text-align: center;
  margin-top: var(--space-8);
}

/* ─── Sletbekræftelsesbesked ─────────────────────────────── */
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
