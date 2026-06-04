<script>
// Succesdialog der vises efter en vellykket handling (fx oprettelse af genstand).
// Lukkes automatisk efter autoCloseDuration ms, eller manuelt via knappen.
export default {
    name: 'SuccessDialog',
    data() {
        return {
            isOpen: this.modelValue,
            autoCloseTimer: null  // Reference til auto-luk-timeren så den kan aflyses
        }
    },
    props: {
        // Styrer om dialogen er åben via v-model
        modelValue: {
            type: Boolean,
            default: false
        },
        // Primær overskrift i dialogen
        title: {
            type: String,
            required: true
        },
        // Supplerende besked under overskriften
        message: {
            type: String,
            required: true
        },
        // Millisekunder før dialogen lukkes automatisk
        autoCloseDuration: {
            type: Number,
            default: 5000
        }
    },
    watch: {
        // Start eller stop auto-luk-timeren når dialogen åbnes/lukkes
        modelValue(newValue) {
            this.isOpen = newValue
            if (newValue) {
                this.startAutoClose()
            } else {
                this.clearAutoClose()
            }
        }
    },
    methods: {
        // Luk dialogen og opdater v-model
        close() {
            this.isOpen = false
            this.$emit('update:modelValue', false)
            this.clearAutoClose()
        },
        // Udløst af "Tilbage til oversigt"-knappen
        handleBackClick() {
            this.$emit('back-to-overview')
            this.close()
        },
        // Start auto-luk-timer
        startAutoClose() {
            this.autoCloseTimer = setTimeout(() => {
                this.close()
            }, this.autoCloseDuration)
        },
        // Afbryd auto-luk-timeren
        clearAutoClose() {
            if (this.autoCloseTimer) {
                clearTimeout(this.autoCloseTimer)
                this.autoCloseTimer = null
            }
        }
    },
    // Ryd timeren så der ikke udløses opdateringer efter komponenten er fjernet
    beforeUnmount() {
        this.clearAutoClose()
    },
    emits: ['update:modelValue', 'back-to-overview']
}
</script>

<template>
    <v-dialog
        :model-value="isOpen"
        @update:model-value="close"
        max-width="320"
        scrim="rgba(0,0,0,0.82)"
    >
        <v-card class="success-dialog" elevation="4">

            <section class="success-content" role="status" aria-live="polite">
                <figure class="icon-wrapper" aria-hidden="true">
                    <v-icon
                        icon="mdi-check-circle"
                        color="var(--color-tilgaengelig-dot)"
                        size="64"
                    />
                </figure>

                <h1 class="success-title">{{ title }}</h1>
                <p class="success-message">{{ message }}</p>
            </section>

            <footer class="action-footer">
                <v-btn
                    color="primary"
                    variant="flat"
                    rounded="lg"
                    block
                    size="large"
                    @click="handleBackClick"
                    class="back-btn"
                >
                    Tilbage til oversigt
                </v-btn>
            </footer>
        </v-card>
    </v-dialog>
</template>

<style scoped>
.success-dialog {
    background: var(--color-surface, #ffffff);
    width: min(92vw, 320px);
    border-radius: var(--radius-lg, 12px);
    overflow: hidden;
    border: 1px solid rgba(61, 107, 39, 0.18);
    box-shadow: 0 10px 28px rgba(61, 107, 39, 0.18), 0 2px 8px rgba(0, 0, 0, 0.14);
}

.success-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-4, 16px) var(--space-4, 16px) var(--space-3, 12px);
    text-align: center;
}

.icon-wrapper {
    margin-bottom: var(--space-3, 12px);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: var(--color-tilgaengelig-bg, #e8f0e3);
}

.success-title {
    font-family: var(--font-display, 'Segoe UI', sans-serif);
    font-size: var(--text-h3, 18px);
    font-weight: 600;
    color: var(--color-neutral, #1a1a1a);
    margin: 0 0 var(--space-2, 8px);
}

.success-message {
    font-family: var(--font-body, 'Segoe UI', sans-serif);
    font-size: var(--text-label, 14px);
    color: var(--color-secondary, #666666);
    margin: 0;
    line-height: 1.5;
}

.action-footer {
    padding: 0 var(--space-3, 12px) var(--space-4, 16px);
}

.back-btn {
    text-transform: none;
    font-weight: 500;
    letter-spacing: 0;
    min-height: 44px;
}
</style>

