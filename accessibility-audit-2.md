# Tilgængeligheds-audit 2 — LÅKAL

Vue 3 (Options API) + Vuetify 4. WCAG 2.2 AA / POUR.
Hvert fund er verificeret mod den faktiske kildekode (fil:linje). "Ikke fundet" = tjekket og rent.

---

## Del 1 — Regression af tidligere fund

| Fil:linje | Tidligere problem | Faktisk tilstand nu | Status |
|---|---|---|---|
| `PickupTimeSelector.vue:43-60` | Click-handler uden keyboard-handler/fokus | `role="button"`, `tabindex="0"`, `@keydown.enter/space.prevent`, `:aria-pressed`, `:aria-label`, og `:focus-visible`-ring (linje 87-90). Fuldt tastaturtilgængelig. | **Rettet** |
| `settings.scss:41` | `--color-error` kun i `.v-theme--dark` | Nu defineret i `:root` (`#861E1E`, linje 41) **og** i `.v-theme--dark` (`#E89898`, linje 116). Fejltekst er rød i begge temaer. | **Rettet** |

Bonus: `--color-input-border` er også rettet i dark (linje 113) til at bestå 3:1 (1.4.11).

---

## Del 2 — Samlet tabel (regression + nye fund)

| Fil:linje | Problem | WCAG | Alvor | Status |
|---|---|---|---|---|
| `PickupTimeSelector.vue:43-60` | Tastaturadgang til tidsblokke | 2.1.1 | — | **Rettet** |
| `settings.scss:41` | `--color-error` i light mode | 1.4.3 | — | **Rettet** |
| `ExploreView.vue:133-138` | Klikbar `v-card` (`@click="openItem"`) uden `role`/`tabindex`/`@keydown` — kort kan ikke nås eller aktiveres med tastatur | 2.1.1 | **Kritisk** | **Nyt** |
| `TermsDialog.vue:70, 168, 59` | Scroll-område (`<section @scroll>`) er ikke fokuserbart, så tastaturbrugere kan ikke scrolle → `canClose` bliver aldrig `true` → acceptknappen forbliver `disabled`, og dialogen er `persistent` (Esc lukker ikke) = keyboard-trap | 2.1.1, 2.1.2 | **Kritisk** | **Nyt** |
| `index.html:2` | `<html lang="en">` men hele appen er på dansk → skærmlæser udtaler alt med engelsk stemme | 3.1.1 | **Major** | **Nyt** |
| `App.vue:195-200` | Tema-`v-switch` har intet programmatisk navn; labelteksten ligger i en separat `<span>` uden binding | 4.1.2, 1.3.1 | **Major** | **Nyt** |
| `PickAccessories.vue:54-62` | Tilbehørsknappers valgt-tilstand vises **kun** via farve (`:color`), ingen `aria-pressed` | 1.4.1, 4.1.2 | **Major** | **Nyt** |
| `ConfirmDialog.vue:65`, `SuccessDialog.vue:80`, `TermsDialog.vue:55` | `v-dialog` mangler `aria-labelledby` → dialogen har intet tilgængeligt navn | 4.1.2 | Minor | **Nyt** |
| `TermsDialog.vue:66→78` | Overskrift springer fra `h1` direkte til `h3` (ingen `h2`) | 1.3.1 | Minor | **Nyt** |
| `MultiStepFormHeader.vue:28-30` | Sidetitel ("Opret ny genstand") er `v-toolbar-title` (div), ikke en overskrift → opret-flowet starter på `h2` uden `h1` | 1.3.1, 2.4.6 | Minor | **Nyt** |
| `SuccessDialog.vue:58-62` | Auto-lukker efter 5 s uden mulighed for at pause/forlænge | 2.2.1 | Minor | **Nyt** |
| `ItemDetailsStep.vue:259/277, 330/339` | Rå `<input>`-fejl (`role="alert"`) er ikke koblet til feltet via `aria-describedby` | 3.3.1 | Minor | **Nyt** |

### Tjek der var rene (ikke fundet)
- **Billed-alt:** Alle `<img>`/`<v-img>` har `alt` (eller er dekorative ikoner i `aria-hidden`-wrapper, fx `SuccessDialog.vue:89`). Ikke fundet.
- **`outline:none` uden erstatning:** Alle tre forekomster (`App.vue:247`, `LoginView.vue:189`, `ItemFilterTabs.vue:90`) er parret med `:focus-visible`-ring. Ikke fundet.
- **prefers-reduced-motion:** Global media query findes (`App.vue:250-257`). Ikke fundet.
- **div/span med @click uden tastatur:** Upload-kort (`ItemBasicInfoStep.vue:215`) og `ItemCard.vue:48` har korrekt `role`/`tabindex`/`@keydown`. Øvrige `@click` sidder på `v-btn`/`<button>`/`<a>`. Ud over ExploreView ikke fundet.
- **Form-labels:** Vuetify-felter har `label`/`aria-label`; rå inputs har `<label for>`. Ikke fundet (bortset fra describedby-koblingen ovenfor).

---

## Del 3 — Konkrete rettelser (kun åbne/nye fund)

### 1. `ExploreView.vue:133-138` — Klikbart kort uden tastatur (Kritisk)
Genbrug samme mønster som `ItemCard.vue`:
```html
<v-card
    v-for="item in items"
    :key="item.ItemID"
    class="cursor-pointer"
    role="button"
    tabindex="0"
    :aria-label="`${item.ItemName}${item.Brand ? ', ' + item.Brand : ''}`"
    @click="openItem(item)"
    @keydown.enter.prevent="openItem(item)"
    @keydown.space.prevent="openItem(item)"
>
```
```css
.cursor-pointer:focus-visible {
  outline: 3px solid var(--color-neutral);
  outline-offset: 3px;
}
```

### 2. `TermsDialog.vue` — Keyboard-trap i scroll-til-bund (Kritisk)
Gør scroll-området fokuserbart, så tastaturbrugere kan scrolle, og tilføj en
fallback så knappen ikke kan låse brugeren ude hvis indholdet ikke kan scrolles
(fx kort skærm/zoom hvor `scrollHeight` ≈ `clientHeight`):
```html
<section
  class="content"
  tabindex="0"
  role="region"
  aria-label="Vilkår for lån"
  @scroll="handleScroll"
>
```
```js
// I handleScroll: aktivér også når indholdet ikke kan scrolles
handleScroll(e) {
  const el = e.target;
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) this.canClose = true;
},
mounted() {
  // Hvis vilkårene allerede er fuldt synlige (intet at scrolle), lås ikke knappen
  this.$nextTick(() => {
    const el = this.$el?.querySelector(".content");
    if (el && el.scrollHeight <= el.clientHeight + 10) this.canClose = true;
  });
}
```
*Alternativt:* behold ikke knappen `disabled`, men valider scroll ved klik og vis
en besked — en disabled-knap fjerner den eneste fokuserbare udvej i en `persistent` dialog.

### 3. `index.html:2` — Forkert sprog (Major)
```html
<html lang="da">
```

### 4. `App.vue:195-200` — Tema-switch uden navn (Major)
```html
<v-switch
  v-model="isDark"
  color="primary"
  hide-details
  density="compact"
  :aria-label="isDark ? 'Skift til lys tilstand' : 'Skift til mørk tilstand'"
/>
```

### 5. `PickAccessories.vue:54-62` — Valgt-tilstand kun via farve (Major)
```html
<v-btn
  v-for="accessory in accessories"
  :key="accessory"
  rounded="xl"
  :color="isSelected(accessory) ? 'primary' : ''"
  :aria-pressed="isSelected(accessory)"
  @click="toggleAccessory(accessory)"
>
  {{ accessory }}
</v-btn>
```

### 6. Dialoger uden tilgængeligt navn (Minor)
Bind dialogens titel. For Vuetify kan man give titlen et id og pege på det:
```html
<!-- ConfirmDialog.vue -->
<v-dialog :model-value="isOpen" @update:model-value="close"
          max-width="400" aria-labelledby="confirm-dialog-title">
  ...
  <h2 id="confirm-dialog-title" class="confirm-dialog-titel">{{ title }}</h2>
```
Samme mønster i `SuccessDialog.vue` (`success-title`) og `TermsDialog.vue` (`.title`).

### 7. `TermsDialog.vue:78+` — Overskrifts-spring h1→h3 (Minor)
Gør sektionsoverskrifterne til `h2` (de er direkte underordnet dialogens `h1`):
```html
<h2>1. Aftalens parter og omfang</h2>
```
…og opdatér `.content h3`-stilen (linje 223) til `.content h2`.

### 8. `MultiStepFormHeader.vue:28` — Sidetitel er ikke en overskrift (Minor)
Lad toolbar-titlen være den primære overskrift på formularsiderne:
```html
<v-toolbar-title tag="h1" class="text-center font-weight-bold">
  {{ title }}
</v-toolbar-title>
```
Juster derefter de efterfølgende trin-overskrifter ned ét niveau hvis nødvendigt.

### 9. `SuccessDialog.vue:58-62` — Auto-luk uden kontrol (Minor)
Enten dropp auto-luk (lad brugeren lukke selv), eller hæv standardtiden markant og
stop timeren ved fokus/hover, så timing kan justeres (2.2.1). Mindst:
```js
autoCloseDuration: { type: Number, default: 10000 }
```

### 10. `ItemDetailsStep.vue:259/330` — Fejl ikke koblet til feltet (Minor)
```html
<input
  id="tilbehoer-input"
  ...
  :aria-describedby="errors.accessoriesList ? 'tilbehoer-fejl' : undefined"
  :aria-invalid="!!errors.accessoriesList"
/>
...
<div v-if="errors.accessoriesList" id="tilbehoer-fejl" class="fejltekst" role="alert">
  {{ errors.accessoriesList }}
</div>
```
Samme for `periode-input` / `errors.customPeriod`.

---

**Bemærk:** Intet er ændret i koden. Dette er kun rapporten — vælg hvilke fund der skal lappes.
