import { defineStore } from 'pinia';

export const useAlertStore = defineStore({
    id: 'alert',
    state: () => ({
        alert: null
    }),
    actions: {
        success(message) {
            this.alert = { message, type: 'alertSuccess' };
        },
        error(message) {
            this.alert = { message, type: 'alertDanger' };
        },
        clear() {
            this.alert = null;
        }
    }
});