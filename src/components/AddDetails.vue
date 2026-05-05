<script>
import Stepper from "@/components/Stepper.vue";


export default {
  components: {
    Stepper,
  },
   props: {
    currentStep: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      hasExtra: null,
      extrasList: [],
      condition: null,
      extraName: "",
      maxLoanPeriod: null,
      customLoanPeriod: "",
      errors: {
        hasExtra: "", 
        extrasList: "",
        condition: "",
        maxLoanPeriod: "",
        customLoanPeriod: "",
      }
    };
  },
  methods: {
    /* Vælg om der er ekstra tilbehør eller ej */
    selectExtra(value) {
      this.hasExtra = value;
      this.errors.hasExtra = "";
    },
      /* Tilføj ekstra tilbehør til listen  */
    addExtra() {
  if (!this.extraName || this.extraName.trim() === "") return;

  this.extrasList.push(this.extraName.trim());
  this.extraName = "";
  this.errors.extrasList = "";
},
    /* Fjern ekstra tilbehør fra listen  */
    removeExtra(index) {
      this.extrasList.splice(index, 1);
    },
      /* Vælg stand på genstanden */
    selectCondition(value) {
      this.condition = value;
      this.errors.condition = "";
    },
      /* Vælg max låneperiode */
    selectMaxLoanPeriod(value) {
      this.maxLoanPeriod = value;
      this.errors.maxLoanPeriod = "";
      if (value !== "Andet") {
        this.customLoanPeriod = "";
        this.errors.customLoanPeriod = "";
      }
    },
    /* Validering af inputfelter før næste skridt */
     validate() {
      let valid = true;

      if (this.hasExtra === null) {
        this.errors.hasExtra = "Dette felt skal udfyldes";
        valid = false;
      } else {
        this.errors.hasExtra = "";
      }

      if (this.hasExtra && this.extrasList.length === 0) {
        this.errors.extrasList = "Indtast mindst ét tilbehør";
        valid = false;
      } else {
        this.errors.extrasList = "";
      }

      if (!this.condition) {
        this.errors.condition = "Dette felt skal udfyldes";
        valid = false;
      } else {
        this.errors.condition = "";
      }

      if (!this.maxLoanPeriod) {
        this.errors.maxLoanPeriod = "Dette felt skal udfyldes";
        valid = false;
      } else {
        this.errors.maxLoanPeriod = "";
      }

      if (this.maxLoanPeriod === "Andet" && this.customLoanPeriod.trim() === "") {
        this.errors.customLoanPeriod = "Indtast en låneperiode";
        valid = false;
      } else {
        this.errors.customLoanPeriod = "";
      }

      return valid;
    },
   /*  Gem detaljer og gå videre til næste skridt */
    next() {
      if (this.validate()) {
        const details = {
          hasExtra: this.hasExtra,
          extras: this.extrasList,
          condition: this.condition,
          maxLoanPeriod:
            this.maxLoanPeriod === "Andet" ? this.customLoanPeriod : this.maxLoanPeriod,
        };
        this.$emit("save-details", details,);
        this.$emit("go-to-confirm-item")
      }
    },
    back() {
      this.$emit("go-to-page-one");
    }
  },
};
</script>


<template>
  <v-container class="add-details-container">
     <v-toolbar flat color="white" class="top-toolbar">
        <!-- <v-btn icon variant="text" @click="$emit('goBack')">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn> -->

        <v-toolbar-title class="text-center font-weight-bold">
          Opret ny genstand
        </v-toolbar-title>

        <div style="width: 40px"></div>
      </v-toolbar>

      <v-divider />
    <Stepper :currentStep="currentStep" />

    <h1 class="mt-2 mb-2">Tilbehør og detaljer</h1>
    <p>
      Angiv stand, låneperiode og eventuelt tilbehør, der følger med genstanden.
    </p>

    <!-- Har genstanden ekstra tilbehør?  -->

    <h4>Har genstanden ekstra tilbehør?<span> *</span></h4>
    <v-row>
      <v-col cols="12">
        <v-btn
          class="ma-2 extra_button"
          size="large"
          :class="{ selected: hasExtra === true }"
          @click="selectExtra(true)"
        >
          Ja
        </v-btn>
        <v-btn
          class="ma-2 extra_button"
          size="large"
          :class="{ selected: hasExtra === false }"
          @click="selectExtra(false)"
        >
          Nej
        </v-btn>
        <div v-if="errors.hasExtra" class="error-text">{{ errors.hasExtra }}</div>
      </v-col>
    </v-row>

    <v-row v-if="hasExtra === true">
      <v-col cols="12">
        <div class="tags_wrapper" v-if="extrasList.length">
          <span class="tag" v-for="(extra, index) in extrasList" :key="index">
            {{  extra  }}
            <button class="remove_tag" @click="removeExtra(index)">×</button>
          </span>

        </div>

        <div class="input_wrapper">
          <input
          type= "text"
            placeholder="F.eks. oplader, taske..."
            v-model="extraName"
            class="custom_input"
            @keyup.enter="addExtra"
          />

          <v-btn class="add_button" icon @click="addExtra"> + </v-btn>
        </div>
        <div v-if="errors.extrasList" class="error-text">{{ errors.extrasList }}</div>
      </v-col>
    </v-row>

    <!-- Vælg stand -->

    <h4>Stand<span> *</span></h4>
    <v-row>
      <v-col cols="12">
        <v-btn
          class="ma-2 condition_button"
          size="large"
          :class="{ selected: condition === 'Ny' }"
          @click="selectCondition('Ny')"
        >
          Ny
        </v-btn>
        <v-btn
          class="ma-2 condition_button"
          size="large"
          :class="{ selected: condition === 'God' }"
          @click="selectCondition('God')"
        >
          God
        </v-btn>
        <v-btn
          class="ma-2 condition_button"
          size="large"
          :class="{ selected: condition === 'Brugt' }"
          @click="selectCondition('Brugt')"
        >
          Brugt
        </v-btn>
        <v-btn
          class="ma-2 condition_button"
          size="large"
          :class="{ selected: condition === 'Slidt' }"
          @click="selectCondition('Slidt')"
        >
          Slidt
        </v-btn>
        <div v-if="errors.condition" class="error-text">{{ errors.condition }}</div>
      </v-col>
    </v-row>

    <!-- Vælg max låneperiode -->

    <h4>Max låneperiode<span> *</span></h4>
    <v-row>
      <v-col cols="12">
        <v-btn
          class="ma-2 condition_button"
          size="large"
          :class="{ selected: maxLoanPeriod === '1 dag' }"
          @click="selectMaxLoanPeriod('1 dag')"
        >
          1 dag
        </v-btn>
        <v-btn
          class="ma-2 condition_button"
          size="large"
          :class="{ selected: maxLoanPeriod === '3 dage' }"
          @click="selectMaxLoanPeriod('3 dage')"
        >
          3 dage
        </v-btn>
        <v-btn
          class="ma-2 condition_button"
          size="large"
          :class="{ selected: maxLoanPeriod === '1 uge' }"
          @click="selectMaxLoanPeriod('1 uge')"
        >
          1 uge
        </v-btn>
        <v-btn
          class="ma-2 condition_button"
          size="large"
          :class="{ selected: maxLoanPeriod === '2 uger' }"
          @click="selectMaxLoanPeriod('2 uger')"
        >
          2 uger
        </v-btn>
        <v-btn
          class="ma-2 condition_button"
          size="large"
          :class="{ selected: maxLoanPeriod === '1 måned' }"
          @click="selectMaxLoanPeriod('1 måned')"
        >
          1 måned
        </v-btn>
        <v-btn
          class="ma-2 condition_button"
          size="large"
          :class="{ selected: maxLoanPeriod === 'Andet' }"
          @click="selectMaxLoanPeriod('Andet')"
        >
          Andet
        </v-btn>
        <div v-if="errors.maxLoanPeriod" class="error-text">{{ errors.maxLoanPeriod }}</div>
      </v-col>
    </v-row>

    <!-- Inputfelt for brugerdefineret låneperiode, vises kun hvis "Andet" er valgt -->

    <v-row v-if="maxLoanPeriod === 'Andet'">
      <v-col cols="12">
        <div class="input_wrapper">
          <input
            type="text"
            placeholder="F.eks. 10 dage, 3 måneder..."
            v-model="customLoanPeriod"
            class="custom_input"
          />
        </div>
        <div v-if="errors.customLoanPeriod" class="error-text">{{ errors.customLoanPeriod }}</div>
      </v-col>
    </v-row>

   <!--  Tilbage og næste knapper -->
      
    <div class="bottom-bar">
        <v-btn
          variant="tonal"
          rounded="lg"
          color="grey-darken-2"
          class="back-button"
          @click="back"
        >
          <v-icon start size="18">mdi-chevron-left</v-icon>
          Tilbage
        </v-btn>

        <v-btn
          color="primary"
          rounded="lg"
          class="create-button"
          @click="next"
        >
          Næste
        </v-btn>
      </div>

  </v-container>
</template>

<style scoped>

.add-details-container {
  padding-bottom: calc(96px + env(safe-area-inset-bottom));
}

.error-text {
  color: red;
  font-size: 14px;
  margin-top: 4px;
}

.extra_button {
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  color: var(--color-neutral);
  font-weight: 500;
  min-width: 100px;
  border-radius: var(--radius-md);
  box-shadow: none;
}

.input_wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}


.custom_input {
  flex: 1;
  margin: 0;
}

.custom_input{
  border-radius: var(--radius-md);
  border: 2px solid var(--color-input-border);  
  min-height: 44px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  font-family: var(--font-body);
  font-size: var(--text-body);
}

.add_button {
  background-color: var(--color-primary);
  color: white;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  min-width: 0; /* IMPORTANT */
  font-size: 24px;
  padding: 0;
}

.tags_wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.tag {
  background-color: var(--color-bg);
  color: var(--color-neutral);
  padding: 4px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  font-family: var(--font-body);
  font-size: var(--text-meta);
  font-weight: 500;
}

.remove_tag {
  background: transparent;
  border: none;
  color: black;
  font-weight: bold;
  margin-left: 6px;
  cursor: pointer;
}

.condition_button {
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  color: var(--color-neutral);
  font-weight: 500;
  min-width: 100px;
  border-radius: var(--radius-md);
  box-shadow: none;
}


.selected {
  background-color: var(--color-primary) !important;
  color: white !important;
  
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 16px;
  display: flex;
  gap: 12px;
}

.back-button {
  flex: 1;
  text-transform: none;
  height: 48px !important;
}

.create-button {
  flex: 3;
  text-transform: none;
  height: 48px !important;
}


</style>
