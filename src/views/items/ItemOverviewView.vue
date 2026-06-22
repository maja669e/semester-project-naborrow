<script>
// Genstandsoversigt – viser alle brugerens genstande som en kortliste.
// Understøtter statusfiltrering via ItemFilterTabs og åbner ItemDetailView
// når brugeren klikker på et kort.
// Injekterer items-objektet og authStore fra App.vue via provide/inject.
// Navigation til opret og anmodninger sker via RouterLink (:to).
import ItemCard       from "@/components/items/ItemCard.vue";
import ItemDetailView from "@/components/items/ItemDetailView.vue";
import ItemFilterTabs from "@/components/items/ItemFilterTabs.vue";
import { getItemsByUser } from "@/services/items/itemservice.js";
import { getPendingCountByOwner } from "@/services/rentalrequest/rentalrequestservice.js";
import { getRentalsByOwner }     from "@/services/rental/rentalservice.js";
import { getItemStatus, statusLabel } from "@/utils/itemStatus.js";


export default {
  name: "ItemOverviewView",
  components: { ItemCard, ItemDetailView, ItemFilterTabs },

  // Injekterer fra App.vue's provide():
  //   items     – reaktivt objekt med reloadKey og shownItemId
  //   authStore – den loggede brugers data og login-status
  inject: ["items", "authStore"],

  data() {
    return {
      selectedItem:      null,    // Den genstand der vises i detaljeskærmen
      activeFilter:      "Alle",
      itemsList:         [],      // Lokal kopi af hentet data (adskilt fra injekteret items-objekt)
      isLoading:         false,
      error:             null,
      highlightedItemId: null,    // Id på den genstand der animeres efter oprettelse
      highlightTimer:    null,    // Timeout-reference til at stoppe animationen
      deleteMessage:     "",
      showDeleteMessage: false,
      pendingRequests: 0,
      activeRentals: 0,
    };
  },

  computed: {
    // Filtrer genstandslisten baseret på det valgte statusfilter
    filteredItems() {
      if (this.activeFilter === "Alle") return this.itemsList;
      return this.itemsList.filter((g) => g.status === this.activeFilter);
    },
  },

  methods: {
    // Byg en fuld billed-URL fra en rå server-sti eller base64-streng
    resolveImageUrl(rawUrl) {
      if (!rawUrl) return "https://placehold.co/64x64";
      if (rawUrl.startsWith("data:")) return rawUrl;
      if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) return rawUrl;
      return `http://localhost:8080/${rawUrl.replace(/^\/+/, "")}`;
    },

    // Hent alle genstande fra API'et og map dem til det lokale dataformat
    async fetchItems() {
      this.isLoading = true;
      try {
        const userId = this.authStore.user.value.userID;
        const data = await getItemsByUser(userId);
        this.itemsList = data.map((item) => {
          // Central udledning af badge-status (slug + returdato). isOwner=true,
          // da dette er "Mine ting" – derfor må "inaktiv" gerne vises.
          const badge = getItemStatus({
            isActive:          item.IsActive,
            isCurrentlyRented: item.isCurrentlyRented,
            endDate:           item.currentRentalEndDate,
            isOwner:           true,
          });
          return {
          id:          item.ItemID,
          title:       item.ItemName,
          category:
            item.Category?.CategoryName ||
            item.category?.CategoryName ||
            String(item.CategoryID),
          brand:       item.Brand,
          isActive:    item.IsActive,
          // statusKey/statusDate driver StatusBadge; status (dansk label) driver filterfanerne
          statusKey:   badge.status,
          statusDate:  badge.date,
          status:      statusLabel(badge.status),
          image:       this.resolveImageUrl(item.images?.[0]?.ImageURL),
          rawImage:    item.images?.[0]?.ImageURL,
          condition:   item.Condition,
          maxDays:     item.MaxRentPeriodDays,
          accessories:
            item.accessories?.map((a) => a.AccessoryName).join(", ") || null,
          totalLoans:  0,
          activeLoans: 0,
          rating:      null,
          };
        });

        // Scroll til og fremhæv en specifik genstand hvis angivet via inject
        if (this.items.shownItemId) {
          this.highlightAndScrollToItem(this.items.shownItemId);
        }
      } catch (err) {
        this.error = "Kunne ikke hente genstande. Prøv igen.";
        console.error("Fejl ved hentning af genstande:", err);
      } finally {
        this.isLoading = false;
      }
    },

    // Fremhæv et kort med en flash-animation og scroll det ind i visningen
    highlightAndScrollToItem(itemId) {
      this.highlightedItemId = String(itemId);
      this.$nextTick(() => {
        const element = document.getElementById(`genstand-${itemId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
      // Stop animationen efter 2,2 sekunder (matcher CSS-animationens varighed)
      clearTimeout(this.highlightTimer);
      this.highlightTimer = setTimeout(() => {
        this.highlightedItemId = null;
      }, 2200);
    },

    // Åbn detaljeskærmen for den valgte genstand
    showDetails(id) {
      this.selectedItem = this.itemsList.find((g) => g.id === id);
    },

    // Modtag besked fra ItemDetailView om at en genstand er slettet
    itemWasDeleted(title) {
      this.itemsList = this.itemsList.filter(
        (g) => g.id !== this.selectedItem.id
      );
      this.selectedItem = null;
      this.deleteMessage = `${title} blev slettet`;
      this.showDeleteMessage = true;
      setTimeout(() => {
        this.showDeleteMessage = false;
      }, 3000);
    },

    // Opdater den viste genstand efter redigering uden at genhente hele listen
    async updateItem() {
      await this.fetchItems();
      this.selectedItem = this.itemsList.find(
        (g) => g.id === this.selectedItem.id
      );
    },

    async loadDashboardCounts() {
      try {
        const userId = this.authStore.user.value.userID;

        // Henter begge tællere parallelt for hurtigere indlæsning
        const [pending, lentRentals] = await Promise.all([
          getPendingCountByOwner(userId),
          getRentalsByOwner(userId),
        ]);

        this.pendingRequests = pending.count;
        this.activeRentals   = lentRentals.filter(r => r.Status === "active").length;
      } catch (err) {
        console.error(err);
      }
    },

  },

  mounted() {
    this.fetchItems();
    this.loadDashboardCounts();
  },

  watch: {
    // Genhent listen når App.vue øger items.reloadKey (fx efter oprettelse).
    // Vi bruger string dot-notation da reloadKey er en property på det
    // injekterede items-objekt – Vue 3 understøtter dette i Options API.
    "items.reloadKey"(newVal, oldVal) {
      if (newVal !== oldVal) this.fetchItems();
    },

    // Fremhæv en genstand når App.vue sætter et nyt id (fx efter oprettelse)
    "items.shownItemId"(newVal, oldVal) {
      if (!newVal) return;
      if (newVal !== oldVal) this.highlightAndScrollToItem(newVal);
    },
  },

  beforeUnmount() {
    // Ryd timeren så der ikke sker opdateringer efter komponenten er fjernet
    clearTimeout(this.highlightTimer);
  },
};
</script>

<template>
  <main class="side">

    <!-- Bekræftelsesbesked efter sletning -->
    <output
      v-if="showDeleteMessage"
      class="slet-bekraeftelse"
      aria-live="polite"
      aria-atomic="true"
    >
      ✅ {{ deleteMessage }}
    </output>

    <!-- Detaljeskærm for valgt genstand -->
    <ItemDetailView
      v-if="selectedItem"
      :id="selectedItem.id"
      :title="selectedItem.title"
      :category="selectedItem.category"
      :brand="selectedItem.brand"
      :status="selectedItem.statusKey"
      :statusDate="selectedItem.statusDate"
      :isActive="selectedItem.isActive"
      :image="selectedItem.image"
      :imagePath="selectedItem.rawImage"
      :condition="selectedItem.condition"
      :maxDays="selectedItem.maxDays"
      :accessories="selectedItem.accessories"
      :totalLoans="selectedItem.totalLoans"
      :activeLoans="selectedItem.activeLoans"
      :rating="selectedItem.rating"
      @goBack="selectedItem = null"
      @itemDeleted="itemWasDeleted"
      @itemUpdated="updateItem"
    />


    <!-- Listevisning med filter og kortliste -->
    <section v-else>
      <h1 class="side-titel">Mine ting</h1>
      <v-row class="status-row">
  <v-col cols="6">
    <v-card class="status-card" :to="{ name: 'requests' }">
      <div class="status-number">
        {{ pendingRequests }}
      </div>

      <div class="status-label">
        Afventer godkendelse
      </div>
    </v-card>
  </v-col>

  <v-col cols="6">
    <v-card class="status-card" :to="{ name: 'loans' }">
      <div class="status-number">
        {{ activeRentals }}
      </div>

      <div class="status-label">
        Aktive lån
      </div>
    </v-card>
  </v-col>
</v-row>

      <!-- Statusfilter-faner -->
      <ItemFilterTabs
        :activeFilter="activeFilter"
        @filterChanged="activeFilter = $event"
      />

      <!-- Indlæsningsindikator -->
      <p v-if="isLoading" class="indlaeser-tilstand" aria-live="polite">
        <v-progress-circular indeterminate color="primary" />
      </p>

      <!-- Fejlbesked -->
      <p v-else-if="error" class="fejltekst" role="alert">{{ error }}</p>

      <!-- Genstandsliste -->
      <ul v-else class="kortliste">
        <li
          v-for="item in filteredItems"
          :key="item.id"
          :id="`genstand-${item.id}`"
          :class="{
            'kortliste__element--flash':
              String(highlightedItemId) === String(item.id),
          }"
        >
          <ItemCard
            :id="item.id"
            :title="item.title"
            :category="item.category"
            :brand="item.brand"
            :status="item.statusKey"
            :statusDate="item.statusDate"
            :image="item.image"
            @cardClicked="showDetails"
          />
        </li>
      </ul>

      <!-- Tomt filter-resultat -->
      <p
        v-if="filteredItems.length === 0"
        class="ingen-resultater"
        role="status"
        aria-live="polite"
      >
        Ingen genstande matcher det valgte filter
      </p>
    </section>

    <!-- Fast bundknap til oprettelse af ny genstand -->
    <footer v-if="!selectedItem" class="opret-knap-wrapper">
      <v-btn
        color="primary"
        rounded="lg"
        class="opret-knap"
        :to="{ name: 'create-item' }"
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
  color: var(--color-text-secondary);
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
  background: var(--color-surface);
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
  color: var(--color-surface);
  font-family: var(--font-body);
  font-size: var(--text-label);
  font-weight: 500;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  text-align: center;
  z-index: 200;
}
.status-row {
  margin-bottom: 16px;
}

.status-card {
  padding: 16px;
  text-align: center;
  border-radius: var(--radius-lg);
}

.status-number {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-primary);
}

.status-label {
  font-size: 13px;
  color: var(--color-text-secondary);
}
</style>
