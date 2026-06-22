// itemStatus.js
// Én kilde til sandhed for hvordan en genstands status udledes fra databasen.
//
// Item har INTET status-felt i databasen. Status udledes af:
//   - IsActive            (boolean)  – ejeren har slået genstanden fra  → "inaktiv"
//   - isCurrentlyRented   (boolean)  – godkendt anmodning med aktivt lån → "udlaant"
//   - ellers                                                            → "tilgaengelig"
// (isCurrentlyRented + returdato beregnes server-side i item.controller findByUser.)
//
// Tidligere lå denne udledning hardcoded i både ItemOverviewView og ExploreView.
// Nu kalder begge denne helper, så reglerne kun findes ét sted.

// Slug → dansk visningslabel. Bruges af StatusBadge, filterfaner og aria-tekst,
// så labels ikke duplikeres rundt i komponenterne.
export const STATUS_LABELS = {
  tilgaengelig: "Tilgængelig",
  udlaant: "Udlånt",
  inaktiv: "Inaktiv",
};

// Slå den danske label op for en slug. Ukendt slug → tom streng.
export function statusLabel(slug) {
  return STATUS_LABELS[slug] || "";
}

// Formatér en returdato (DATEONLY-streng "2026-06-15" eller Date) til dansk,
// fx "15. juni". Returnerer "" hvis datoen mangler eller er ugyldig.
export function formatReturnDate(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("da-DK", { day: "numeric", month: "long" }).format(d);
}

// Udled badge-status fra rå datafelter.
// Returnerer { status: slug, date } – eller null når der IKKE skal vises et badge
// (en inaktiv genstand set af en ANDEN bruger end ejeren – jf. WCAG-kravet om at
// "inaktiv" kun er relevant for ejeren i "Mine ting").
//
// Rækkefølgen bevarer den eksisterende adfærd: inaktiv før udlånt før tilgængelig.
export function getItemStatus({
  isActive,
  isCurrentlyRented = false,
  endDate = null,
  isOwner = false,
} = {}) {
  if (!isActive) {
    // Kun ejeren ser "inaktiv". For andre skjules badget helt.
    return isOwner ? { status: "inaktiv", date: "" } : null;
  }

  if (isCurrentlyRented) {
    return { status: "udlaant", date: formatReturnDate(endDate) };
  }

  return { status: "tilgaengelig", date: "" };
}
