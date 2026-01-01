<template>
  <v-card>
    <v-card-title class="text-h5">My Schedule</v-card-title>

    <v-card-text>
      <div v-if="loading" class="text-center py-4">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <v-list v-else>
        <template v-for="(slot, index) in fullSchedule" :key="index">
          <v-list-item class="mb-2">
            <template #prepend>
              <v-icon v-if="slot.eventType === 'Volleyball'" color="blue">
                mdi-volleyball
              </v-icon>
              <v-icon
                v-else-if="slot.eventType === 'Basketball'"
                color="orange"
              >
                mdi-basketball
              </v-icon>
              <v-icon v-else color="grey-lighten-1">
                mdi-calendar-blank
              </v-icon>
            </template>

            <v-list-item-title>{{ slot.timeSlot }}</v-list-item-title>
            <v-list-item-subtitle
              :class="slot.eventType === 'No event' ? 'text-grey' : ''"
            >
              {{ slot.eventType }}
            </v-list-item-subtitle>

            <template #append>
              <v-btn
                v-if="slot.eventType !== 'No event'"
                icon="mdi-delete"
                variant="text"
                color="error"
                size="small"
                @click="$emit('delete', slot.originalIndex)"
              />
            </template>
          </v-list-item>

          <v-divider v-if="index < fullSchedule.length - 1" />
        </template>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface ScheduleEvent {
  timeSlot: string;
  eventType: string;
  addedAt?: Date;
}

const props = defineProps<{
  schedule: ScheduleEvent[];
  loading: boolean;
}>();

defineEmits<{
  delete: [index: number];
}>();

// Generate all time slots from 8 AM to 5 PM with 30-minute increments
const allTimeSlots = computed(() => {
  const slots = [];
  for (let hour = 8; hour <= 17; hour++) {
    for (let minute of [0, 30]) {
      // Skip 5:30 PM
      if (hour === 17 && minute === 30) continue;

      const time = new Date();
      time.setHours(hour, minute, 0, 0);
      const timeString = time.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      slots.push(timeString);
    }
  }
  return slots;
});

const fullSchedule = computed(() => {
  // Create a set of time slots to skip (30 minutes after volleyball/basketball)
  const slotsToSkip = new Set<string>();

  props.schedule?.forEach((event) => {
    if (event.eventType === "Volleyball" || event.eventType === "Basketball") {
      // Parse the time and add 30 minutes
      const [time, period] = event.timeSlot.split(" ");
      let [hours, minutes] = time.split(":").map(Number);

      // Convert to 24-hour format
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;

      // Add 30 minutes
      minutes += 30;
      if (minutes >= 60) {
        hours += 1;
        minutes -= 60;
      }

      // Convert back to time string
      const nextSlotTime = new Date();
      nextSlotTime.setHours(hours, minutes, 0, 0);
      const nextSlotString = nextSlotTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      slotsToSkip.add(nextSlotString);
    }
  });

  // Filter out skipped slots and map to full schedule
  return allTimeSlots.value
    .filter((timeSlot) => !slotsToSkip.has(timeSlot))
    .map((timeSlot) => {
      // Find if user has an event for this time slot
      const eventIndex = props.schedule?.findIndex(
        (event) => event.timeSlot === timeSlot
      );

      if (eventIndex !== undefined && eventIndex !== -1) {
        return {
          timeSlot,
          eventType: props.schedule[eventIndex].eventType,
          originalIndex: eventIndex,
        };
      }

      return {
        timeSlot,
        eventType: "No event",
        originalIndex: -1,
      };
    });
});
</script>
