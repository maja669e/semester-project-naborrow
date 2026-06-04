<script>
// Genanvendelig bekræftelsesdialog til destruktive handlinger (fx sletning).
// Styres via v-model (modelValue) og udsender 'confirm' eller 'cancel'.
export default {
    name: 'ConfirmDialog',
    data() {
        return {
            isOpen: false
        }
    },
    props: {
        // Styrer om dialogen er åben via v-model
        modelValue: {
            type: Boolean,
            default: false
        },
        // Overskrift vist i dialogen
        title: {
            type: String,
            required: true
        },
        // Forklarende tekst under overskriften
        message: {
            type: String,
            required: true
        },
        // Tekst på bekræftelsesknappen
        confirmLabel: {
            type: String,
            default: 'Bekræft'
        },
        // Viser indlæsningsindikator på bekræftelsesknappen under en asynkron handling
        loading: {
            type: Boolean,
            default: false
        }
    },
    watch: {
        // Synkroniser intern tilstand med modelValue-prop'en
        modelValue(newValue) {
            this.isOpen = newValue
        }
    },
    methods: {
        // Luk dialogen og opdater v-model
        close() {
            this.isOpen = false
            this.$emit('update:modelValue', false)
        },
        // Udsend 'confirm' — forælderen afgør hvad der skal ske
        handleConfirm() {
            this.$emit('confirm')
        },
        // Annuller og luk dialogen
        handleCancel() {
            this.$emit('cancel')
            this.close()
        }
    },
    emits: ['update:modelValue', 'confirm', 'cancel']
}
</script>

<template>
    <v-dialog
        :model-value="isOpen"
        @update:model-value="close"
        max-width="400"
        scrim="rgba(0,0,0,0.5)"
    >
        <v-card class="confirm-dialog" elevation="4">
            <article class="confirm-dialog-indhold">
                <h2 class="confirm-dialog-titel">
                    {{ title }}
                </h2>
                <p class="confirm-dialog-tekst">
                    {{ message }}
                </p>
                <footer class="confirm-dialog-knapper">
                    <v-btn
                        variant="text"
                        @click="handleCancel"
                        :disabled="loading"
                    >
                        Annuller
                    </v-btn>
                    <v-btn
                        color="error"
                        variant="tonal"
                        @click="handleConfirm"
                        :disabled="loading"
                        :loading="loading"
                    >
                        {{ confirmLabel }}
                    </v-btn>
                </footer>
            </article>
        </v-card>
    </v-dialog>
</template>

<style scoped>
.confirm-dialog {
    background: var(--color-surface);
    border-radius: var(--radius-lg) !important;
    overflow: hidden;
    border-top: 3px solid #b91c1c;
}

.confirm-dialog-indhold {
    padding: var(--space-6);
}

.confirm-dialog-titel {
    font-family: var(--font-body);
    font-size: var(--text-h3);
    font-weight: 500;
    color: var(--color-neutral);
    margin: 0 0 var(--space-4) 0;
}

.confirm-dialog-tekst {
    font-family: var(--font-body);
    font-size: var(--text-label);
    color: var(--color-secondary);
    margin: 0 0 var(--space-5) 0;
    line-height: 1.5;
}

.confirm-dialog-knapper {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: var(--space-2);
}
</style>
