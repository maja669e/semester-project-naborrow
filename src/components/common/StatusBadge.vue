<script>
// Genbrugeligt statusmærke for genstande.
// Samler det mønster der tidligere var dupleret i ItemCard, ItemDetailCard
// og ItemDetailView: farve + ikon + tekstlabel ud fra én status-prop.
// Bruger den globale .status-badge fra settings.scss, så looket er ét sted.
//
// Komponenten tager en KANONISK slug ("tilgaengelig" | "udlaant" | "inaktiv"),
// ikke en visningstekst. Udledningen fra databasen sker i src/utils/itemStatus.js,
// og den danske label slås op her, så mapping og labels kun findes ét sted.
//
// Hver status har BÅDE ikon og tekst (WCAG 1.4.1 – status må ikke kun
// signaleres med farve).
import { STATUS_LABELS } from "@/utils/itemStatus.js";

export default {
  name: "StatusBadge",

  props: {
    // Kanonisk status-slug. Matcher modifier-klasserne i settings.scss.
    status: {
      type: String,
      required: true,
      validator: (value) => ["tilgaengelig", "udlaant", "inaktiv"].includes(value),
    },
    // Valgfri returdato (allerede formateret, fx "15. juni").
    // Vises kun for "udlaant", så låneren ved hvornår genstanden er fri igen.
    date: {
      type: String,
      default: "",
    },
  },

  computed: {
    // Mapper slug → modifier-klasse + ikon. Ukendt status → kun tekst.
    config() {
      const map = {
        tilgaengelig: { modifier: "status-badge--tilgaengelig", icon: "mdi-check-circle" },
        udlaant:      { modifier: "status-badge--udlaant",      icon: "mdi-clock-outline" },
        inaktiv:      { modifier: "status-badge--inaktiv",      icon: "mdi-eye-off-outline" },
      };
      return map[this.status] || { modifier: "", icon: "" };
    },

    // Synlig tekst. "Udlånt" viser returdatoen hvis den er givet.
    label() {
      const base = STATUS_LABELS[this.status] || this.status;
      if (this.status === "udlaant" && this.date) {
        return `Udlånt indtil ${this.date}`;
      }
      return base;
    },
  },
};
</script>

<template>
  <span class="status-badge" :class="config.modifier">
    <v-icon v-if="config.icon" :icon="config.icon" aria-hidden="true" />
    {{ label }}
  </span>
</template>
