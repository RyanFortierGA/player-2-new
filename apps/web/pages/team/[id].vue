<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useTeamStore } from '../../stores/teamStore';
import { useLeagueStore } from '../../stores/leagueStore';
import { useAuthStore } from '../../stores/authStore';
import { format } from 'date-fns';

const route = useRoute();
const teamStore = useTeamStore();
const leagueStore = useLeagueStore();
const authStore = useAuthStore();
const loading = ref(true);

const teamId = route.params.id as string;

onMounted(async () => {
  await Promise.all([
    teamStore.fetchUserTeams(authStore.user.id),
    teamStore.fetchTeamPlayers(teamId),
    leagueStore.fetchTeamMatches(teamId)
  ]);
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
    <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-400 border-t-transparent"></div>
    </div>
    
    <template v-else>
      <!-- Team Header -->
      <div class="card p-6 mb-8">
        <div class="flex items-center">
          <div class="w-20 h-20 bg-primary-900 rounded-lg flex items-center justify-center text-primary-300 text-3xl font-bold">
            {{ teamStore.currentTeam?.name.charAt(0) }}
          </div>
          <div class="ml-6">
            <h1 class="text-3xl font-display font-bold text-white mb-2">
              {{ teamStore.currentTeam?.name }}
            </h1>
            <div class="flex items-center space-x-4">
              <span :class="[
                'badge',
                `badge-tier-${teamStore.currentTeam?.tier}`
              ]">
                Tier {{ teamStore.currentTeam?.tier }}
              </span>
              <span v-if="teamStore.currentTeam?.division" class="text-gray-400">
                {{ teamStore.currentTeam.division }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-3 gap-6 mt-8">
          <div class="text-center">
            <div class="text-3xl font-display font-bold text-white">
              {{ teamStore.currentTeam?.wins }}
            </div>
            <div class="text-sm text-gray-400 mt-1">Wins</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-display font-bold text-white">
              {{ teamStore.currentTeam?.losses }}
            </div>
            <div class="text-sm text-gray-400 mt-1">Losses</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-display font-bold text-white">
              {{ teamStore.currentTeam?.ties }}
            </div>
            <div class="text-sm text-gray-400 mt-1">Ties</div>
          </div>
        </div>
      </div>
      
      <!-- Team Navigation -->
      <div class="flex space-x-4 mb-8">
        <router-link 
          :to="`/team/${teamId}`"
          class="btn-outline"
          :class="{ 'bg-dark-100': $route.name === 'TeamProfile' }"
        >
          Overview
        </router-link>
        <router-link 
          :to="`/team/${teamId}/roster`"
          class="btn-outline"
          :class="{ 'bg-dark-100': $route.name === 'TeamRoster' }"
        >
          Roster
        </router-link>
        <router-link 
          :to="`/team/${teamId}/schedule`"
          class="btn-outline"
          :class="{ 'bg-dark-100': $route.name === 'TeamSchedule' }"
        >
          Schedule
        </router-link>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Recent Matches -->
        <div class="lg:col-span-2 space-y-6">
          <h2 class="text-xl font-display font-bold text-white mb-4">Recent Matches</h2>
          
          <div v-if="leagueStore.teamMatches.length === 0" class="card p-6 text-center text-gray-400">
            No matches found
          </div>
          
          <div v-else v-for="match in leagueStore.teamMatches.slice(0, 3)" :key="match.id" class="card p-6">
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
          </div>
        </div>
        
        <!-- Team Roster -->
        <div>
          <h2 class="text-xl font-display font-bold text-white mb-4">Active Roster</h2>
          
          <div class="card divide-y divide-gray-800">
            <div v-for="player in teamStore.teamPlayers" :key="player.id" class="p-4">
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-primary-900 flex items-center justify-center text-primary-300">
                  {{ player.username.charAt(0).toUpperCase() }}
                </div>
                <div class="ml-3">
                  <div class="text-white font-medium">{{ player.username }}</div>
                  <div class="text-sm text-gray-400">{{ player.role }}</div>
                </div>
                <div v-if="player.is_captain" class="ml-auto">
                  <span class="badge bg-primary-900 text-primary-300 border border-primary-700">Captain</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="teamStore.currentTeam?.status === 'waitlist'">
        <p>Your team is currently on the waitlist. Position: {{ teamStore.currentTeam.waitlist_spot }}</p>
      </div>
    </template>
  </div>
</template>