<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useTeamStore } from '../../stores/teamStore';
import { useLeagueStore } from '../../stores/leagueStore';
import { format } from 'date-fns';

const route = useRoute();
const teamStore = useTeamStore();
const leagueStore = useLeagueStore();
const loading = ref(true);

const teamId = route.params.id as string;

onMounted(async () => {
  await leagueStore.fetchTeamMatches(teamId);
  loading.value = false;
});

const formatMatchDate = (date: string) => {
  return format(new Date(date), 'MMM d, yyyy');
};

const formatMatchTime = (time: string) => {
  return format(new Date(`2000-01-01T${time}`), 'h:mm a');
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled':
      return 'text-gray-400';
    case 'in_progress':
      return 'text-warning-400';
    case 'completed':
      return 'text-success-400';
    case 'cancelled':
      return 'text-error-400';
    default:
      return 'text-gray-400';
  }
};
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-display font-bold text-white mb-2">Team Schedule</h1>
      <p class="text-gray-400">View all matches for the current season</p>
    </div>
    
    <div v-if="loading" class="card p-8 text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-400 border-t-transparent mx-auto"></div>
      <p class="text-gray-400 mt-4">Loading schedule...</p>
    </div>
    
    <template v-else>
      <div v-if="leagueStore.teamMatches.length === 0" class="card p-8 text-center">
        <p class="text-gray-400">No matches scheduled</p>
      </div>
      
      <div v-else class="space-y-6">
        <div v-for="match in leagueStore.teamMatches" :key="match.id" class="card p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <span :class="[
                'badge mr-2',
                `badge-tier-${match.tier}`
              ]">
                Tier {{ match.tier }}
              </span>
              <span v-if="match.division" class="text-sm text-gray-400">
                {{ match.division }}
              </span>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-400">Week {{ match.week_number }}</div>
              <div class="text-sm" :class="getStatusColor(match.status)">
                {{ match.status.charAt(0).toUpperCase() + match.status.slice(1) }}
              </div>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <div class="flex-1 text-center">
              <div class="text-white font-medium">{{ match.home_team?.name }}</div>
              <div v-if="match.status === 'completed'" class="text-2xl font-display font-bold mt-2" :class="
                match.home_team_score > match.away_team_score ? 'text-success-400' : 
                match.home_team_score < match.away_team_score ? 'text-error-400' : 
                'text-gray-300'
              ">
                {{ match.home_team_score }}
              </div>
            </div>
            
            <div class="mx-8 text-center">
              <div class="text-lg font-display font-bold text-white mb-2">VS</div>
              <div class="text-sm text-gray-400">
                {{ formatMatchDate(match.match_date) }}<br>
                {{ formatMatchTime(match.match_time) }}
              </div>
            </div>
            
            <div class="flex-1 text-center">
              <div class="text-white font-medium">{{ match.away_team?.name }}</div>
              <div v-if="match.status === 'completed'" class="text-2xl font-display font-bold mt-2" :class="
                match.away_team_score > match.home_team_score ? 'text-success-400' : 
                match.away_team_score < match.home_team_score ? 'text-error-400' : 
                'text-gray-300'
              ">
                {{ match.away_team_score }}
              </div>
            </div>
          </div>
          
          <div v-if="match.map || match.mode" class="mt-4 text-center text-sm text-gray-400">
            {{ [match.mode, match.map].filter(Boolean).join(' - ') }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>