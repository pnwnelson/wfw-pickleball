<template>
  <v-card>
    <v-card-title class="text-h5">My Schedule</v-card-title>

    <v-card-text>
      <div v-if="loading" class="text-center py-4">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <div
        v-else-if="!schedule || schedule.length === 0"
        class="text-center py-4"
      >
        <v-icon size="64" color="grey-lighten-1">mdi-calendar-blank</v-icon>
        <p class="text-grey mt-2">No schedule events yet</p>
      </div>

      <v-list v-else>
        <template v-for="(event, index) in sortedSchedule" :key="index">
          <v-list-item class="mb-2">
            <template #prepend>
              <v-icon
                :color="event.eventType === 'Volleyball' ? 'blue' : 'orange'"
              >
                {{
                  event.eventType === "Volleyball"
                    ? "mdi-volleyball"
                    : "mdi-basketball"
                }}
              </v-icon>
            </template>

            <v-list-item-title>{{ event.timeSlot }}</v-list-item-title>
            <v-list-item-subtitle>{{ event.eventType }}</v-list-item-subtitle>

            <template #append>
              <v-btn
                icon="mdi-delete"
                variant="text"
                color="error"
                size="small"
                @click="$emit('delete', index)"
              />
            </template>
          </v-list-item>

          <v-divider v-if="index < sortedSchedule.length - 1" />
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

const sortedSchedule = computed(() => {
  if (!props.schedule) return [];

  return [...props.schedule].sort((a, b) => {
    // Convert time strings to Date objects for comparison
    const parseTime = (timeStr: string) => {
      const [time, period] = timeStr.split(" ");
      let [hours, minutes] = time.split(":").map(Number);

      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;

      return hours * 60 + minutes;
    };

    return parseTime(a.timeSlot) - parseTime(b.timeSlot);
  });
});
</script>
