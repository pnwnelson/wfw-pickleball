<template>
  <v-dialog v-model="show" max-width="600">
    <v-card>
      <v-card-title class="text-h5">Add Schedule Event</v-card-title>

      <v-card-text>
        <v-form ref="formRef">
          <v-select
            v-model="eventForm.timeSlot"
            :items="timeSlots"
            label="Time Slot"
            prepend-inner-icon="mdi-clock-outline"
            variant="outlined"
            placeholder="Select a time slot"
            class="mb-4"
            :rules="[(v) => !!v || 'Time slot is required']"
          />

          <v-select
            v-model="eventForm.eventType"
            :items="eventTypes"
            label="Event Type"
            prepend-inner-icon="mdi-basketball"
            variant="outlined"
            placeholder="Select event type"
            :rules="[(v) => !!v || 'Event type is required']"
          />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="handleCancel">Cancel</v-btn>
        <v-btn
          color="primary"
          @click="handleSubmit"
          :disabled="!eventForm.timeSlot || !eventForm.eventType"
        >
          Add Event
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [data: { timeSlot: string; eventType: string }];
}>();

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const formRef = ref();
const eventForm = ref({
  timeSlot: "",
  eventType: "",
});

// Generate time slots from 8:00 AM to 5:00 PM
const timeSlots = computed(() => {
  const slots = [];
  for (let hour = 8; hour <= 17; hour++) {
    const time = new Date();
    time.setHours(hour, 0, 0, 0);
    const timeString = time.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    slots.push(timeString);
  }
  return slots;
});

const eventTypes = ["Volleyball", "Basketball"];

const handleCancel = () => {
  show.value = false;
  resetForm();
};

const handleSubmit = () => {
  if (!eventForm.value.timeSlot || !eventForm.value.eventType) {
    return;
  }

  emit("submit", {
    timeSlot: eventForm.value.timeSlot,
    eventType: eventForm.value.eventType,
  });

  show.value = false;
  resetForm();
};

const resetForm = () => {
  eventForm.value = {
    timeSlot: "",
    eventType: "",
  };
};

// Reset form when dialog is opened
watch(show, (newValue) => {
  if (newValue) {
    resetForm();
  }
});
</script>
