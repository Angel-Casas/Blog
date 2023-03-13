import { ref } from "vue";
const EventBus = ref(new Map());

export default function useEventsBus(){

    function emitBus(event, ...args) {
        EventBus.value.set(event, args);
    }

    return {
        emitBus,
        EventBus
    }
}