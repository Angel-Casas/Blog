<template>
  <transition name="notification">
    <div class="notificationWrapper" v-show="show" @mouseover="delayHideNotification" @mouseleave="resumeHideNotification">
      <svg v-if="type === 'success'" class="icon xxl" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256zM371.8 211.8C382.7 200.9 382.7 183.1 371.8 172.2C360.9 161.3 343.1 161.3 332.2 172.2L224 280.4L179.8 236.2C168.9 225.3 151.1 225.3 140.2 236.2C129.3 247.1 129.3 264.9 140.2 275.8L204.2 339.8C215.1 350.7 232.9 350.7 243.8 339.8L371.8 211.8z"/></svg>
      <svg v-if="type === 'warning'" class="icon xxl" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256s256-114.6 256-256S397.4 0 256 0zM232 152C232 138.8 242.8 128 256 128s24 10.75 24 24v128c0 13.25-10.75 24-24 24S232 293.3 232 280V152zM256 400c-17.36 0-31.44-14.08-31.44-31.44c0-17.36 14.07-31.44 31.44-31.44s31.44 14.08 31.44 31.44C287.4 385.9 273.4 400 256 400z"/></svg>
      <svg v-if="type === 'error'" class="icon xxl" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M352 96V99.56C352 115.3 339.3 128 323.6 128H188.4C172.7 128 159.1 115.3 159.1 99.56V96C159.1 42.98 202.1 0 255.1 0C309 0 352 42.98 352 96zM41.37 105.4C53.87 92.88 74.13 92.88 86.63 105.4L150.6 169.4C151.3 170 151.9 170.7 152.5 171.4C166.8 164.1 182.9 160 199.1 160H312C329.1 160 345.2 164.1 359.5 171.4C360.1 170.7 360.7 170 361.4 169.4L425.4 105.4C437.9 92.88 458.1 92.88 470.6 105.4C483.1 117.9 483.1 138.1 470.6 150.6L406.6 214.6C405.1 215.3 405.3 215.9 404.6 216.5C410.7 228.5 414.6 241.9 415.7 256H480C497.7 256 512 270.3 512 288C512 305.7 497.7 320 480 320H416C416 344.6 410.5 367.8 400.6 388.6C402.7 389.9 404.8 391.5 406.6 393.4L470.6 457.4C483.1 469.9 483.1 490.1 470.6 502.6C458.1 515.1 437.9 515.1 425.4 502.6L362.3 439.6C337.8 461.4 306.5 475.8 272 479.2V240C272 231.2 264.8 224 255.1 224C247.2 224 239.1 231.2 239.1 240V479.2C205.5 475.8 174.2 461.4 149.7 439.6L86.63 502.6C74.13 515.1 53.87 515.1 41.37 502.6C28.88 490.1 28.88 469.9 41.37 457.4L105.4 393.4C107.2 391.5 109.3 389.9 111.4 388.6C101.5 367.8 96 344.6 96 320H32C14.33 320 0 305.7 0 288C0 270.3 14.33 256 32 256H96.3C97.38 241.9 101.3 228.5 107.4 216.5C106.7 215.9 106 215.3 105.4 214.6L41.37 150.6C28.88 138.1 28.88 117.9 41.37 105.4H41.37z"/></svg>
      <div class="notificationTextWrapper">
        <span class="notificationTitle bigInfo" v-text="title"></span>
        <span class="notificationMessage" v-text="message"></span>
      </div>
      <button @click="closeNotification" class="button">
        Close
        <svg class="icon xl" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256zM175 208.1L222.1 255.1L175 303C165.7 312.4 165.7 327.6 175 336.1C184.4 346.3 199.6 346.3 208.1 336.1L255.1 289.9L303 336.1C312.4 346.3 327.6 346.3 336.1 336.1C346.3 327.6 346.3 312.4 336.1 303L289.9 255.1L336.1 208.1C346.3 199.6 346.3 184.4 336.1 175C327.6 165.7 312.4 165.7 303 175L255.1 222.1L208.1 175C199.6 165.7 184.4 165.7 175 175C165.7 184.4 165.7 199.6 175 208.1V208.1z"/></svg>
      </button>
      <span class="progressBar" :style="{ width: progress + '%' }"></span>
    </div>
  </transition>
</template>

<script setup>
/* IMPORTS */
import useEventsBus from "@/composables/eventBus"
import { ref, watch } from "vue"
import { convertRange } from "@/helpers"

/* DATA */

const show = ref(false),
      type = ref(""),
      title = ref(""),
      message = ref(""),
      action = ref(""),
      progress = ref(1),
      timeout = ref(5000),
      steps = ref(timeout.value/100)

let delayTimer, interval, currentStep, currentTimeout

const { EventBus } = useEventsBus()

const handleNotification = (data) => {
  resetNotificationStatus()
  type.value = data.type
  title.value = data.title
  message.value = data.message
  action.value = data.action
  show.value = true
  currentStep = 0
  currentTimeout = timeout.value

  interval = setInterval(() => {
    currentStep += convertRange(steps.value, { min: 0, max: timeout.value }, { min: 0, max: 100 })
    currentTimeout -= steps.value
    progress.value = currentStep
  }, steps.value)
  delayTimer = setTimeout(() => {
    clearNotification()
  }, timeout.value)
}

const clearNotification = () => {
  clearTimeout(delayTimer)
  clearInterval(interval)
  show.value = false
  type.value = ''
  title.value = ''
  message.value = ''
  action.value = ''
}

const closeNotification = () => {
  clearNotification()
}

const delayHideNotification = () => {
  clearTimeout(delayTimer)
  clearInterval(interval)
}

const resumeHideNotification = () => {
  interval = setInterval(() => {
    currentStep += convertRange(steps.value, { min: 0, max: timeout.value }, { min: 0, max: 100 })
    currentTimeout -= steps.value
    progress.value = currentStep
    if (currentStep === 100) {
      clearInterval(interval)
    }
  }, steps.value)
  delayTimer = setTimeout(() => {
    clearNotification()
  }, currentTimeout)
}

const resetNotificationStatus = () => {
  clearTimeout(delayTimer)
  clearInterval(interval)
  progress.value = 1
  timeout.value = 5000
  steps.value = timeout.value/100
  delayTimer = {}
  interval = {}
  currentStep = 0
  currentTimeout = 0
}

const runAction = () => {
  switch( this.action ){
      case "close":
          clearNotification();
        break
      case "retry":
        break
  }
}

/* WATCHER */
watch(() => EventBus.value.get('notify'), (val) => {
  handleNotification(val[0])
})

</script>
<style scoped>
.notification-enter-from {
  opacity: 0;
  transform: translateX(-300px);
}

.notification-enter-active {
  transition: 0.5s ease-in-out;
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(-300px);
}

.notification-leave-active {
  transition: 0.2s ease-in-out;
}
</style>