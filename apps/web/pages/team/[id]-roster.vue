<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useTeamStore } from '../../stores/teamStore';
import { useAuthStore } from '../../stores/authStore';

const route = useRoute();
const teamStore = useTeamStore();
const authStore = useAuthStore();
const loading = ref(true);

const teamId = route.params.id as string;
const showAddPlayerForm = ref(false);
const maxPlayers = 4;

const newPlayer = ref({
  username: '',
  gamer_tag: '',
  platform: '',
  role: ''
});

onMounted(async () => {
  await teamStore.fetchTeamPlayers(teamId);
  loading.value = false;
});

const isTeamCaptain = computed(() => {
  return teamStore.teamPlayers.some(player => 
    player.user_id === authStore.user?.id && player.is_captain
  );
});

const canAddPlayer = computed(() => {
  return teamStore.teamPlayers.length < maxPlayers;
});

const addPlayer = async () => {
  if (!authStore.user) return;
  
  if (!canAddPlayer.value) {
    alert('This team already has the maximum number of players.');
    return;
  }
  
  const result = await teamStore.addPlayer({
    ...newPlayer.value,
    user_id: null,
    team_id: teamId
  });
  
  if (result.success) {
    showAddPlayerForm.value = false;
    newPlayer.value = {
      username: '',
      gamer_tag: '',
      platform: '',
      role: ''
    };
  }
};

const removePlayer = async (playerId: string) => {
  await teamStore.removePlayer(playerId, teamId);
};

const changeStatus = async (playerId: string, newStatus: boolean) => {
  await teamStore.changePlayerStatus(playerId, teamId, newStatus);
  await teamStore.fetchTeamPlayers(teamId);
};
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-display font-bold text-white mb-2">Team Roster</h1>
        <p class="text-gray-400">Manage your team's active players</p>
      </div>
      
      <div v-if="isTeamCaptain">
        <button @click="showAddPlayerForm = true" v-if="canAddPlayer" class="btn-primary">
          Add Player
        </button>
        <p v-else class="text-red-500">Maximum number of players reached.</p>
      </div>
    </div>
    
    <div v-if="loading" class="card p-8 text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-400 border-t-transparent mx-auto"></div>
      <p class="text-gray-400 mt-4">Loading roster...</p>
    </div>
    
    <template v-else>
      <!-- Add Player Form -->
      <div v-if="showAddPlayerForm" class="card p-6 mb-8">
        <h2 class="text-xl font-display font-bold text-white mb-4">Add New Player</h2>
        
        <form @submit.prevent="addPlayer" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="label">Player Name</label>
            <input 
              v-model="newPlayer.username"
              type="text"
              required
              class="input w-full"
            />
          </div>
          
          <div>
            <label class="label">Gamer Tag</label>
            <input 
              v-model="newPlayer.gamer_tag"
              type="text"
              required
              class="input w-full"
            />
          </div>
          
          <div>
            <label class="label">Platform</label>
            <select 
              v-model="newPlayer.platform"
              required
              class="input w-full"
            >
              <option value="">Select Platform</option>
              <option value="PC">PC</option>
              <option value="PlayStation">PlayStation</option>
              <option value="Xbox">Xbox</option>
            </select>
          </div>
          
          <div>
            <label class="label">Role</label>
            <input 
              v-model="newPlayer.role"
              type="text"
              placeholder="e.g., Entry Fragger, Support"
              class="input w-full"
            />
          </div>
          
          <div class="md:col-span-2 flex justify-end space-x-4">
            <button 
              type="button"
              @click="showAddPlayerForm = false"
              class="btn-outline"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="btn-primary"
            >
              Add Player
            </button>
          </div>
        </form>
      </div>
      
      <!-- Roster List -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-dark-100">
                <th class="text-left p-4 text-gray-400 font-medium">Player</th>
                <th class="text-left p-4 text-gray-400 font-medium">Gamer Tag</th>
                <th class="text-center p-4 text-gray-400 font-medium">Platform</th>
                <th class="text-left p-4 text-gray-400 font-medium">Role</th>
                <th class="text-center p-4 text-gray-400 font-medium">Status</th>
                <th v-if="isTeamCaptain" class="text-right p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800">
              <tr v-if="teamStore.teamPlayers.length === 0">
                <td colspan="6" class="p-8 text-center text-gray-400">
                  No players found
                </td>
              </tr>
              <tr 
                v-for="player in teamStore.teamPlayers" 
                :key="player.id"
                class="hover:bg-dark-100"
              >
                <td class="p-4">
                  <div class="flex items-center">
                    <div class="w-10 h-10 rounded-full bg-primary-900 flex items-center justify-center text-primary-300">
                      {{ player.username.charAt(0).toUpperCase() }}
                    </div>
                    <div class="ml-3">
                      <div class="text-white font-medium">{{ player.username }}</div>
                      <div v-if="player.is_captain" class="text-sm text-primary-400">Team Captain</div>
                    </div>
                  </div>
                </td>
                <td class="p-4 text-gray-300">{{ player.gamer_tag }}</td>
                <td class="p-4 text-center">
                  <span class="badge bg-dark-100 text-gray-300">{{ player.platform }}</span>
                </td>
                <td class="p-4 text-gray-300">{{ player.role }}</td>
                <td class="p-4 text-center">
                  <span :class="[
                    'badge',
                    player.is_active ? 'bg-success-900 text-success-300 border-success-700' : 'bg-error-900 text-error-300 border-error-700'
                  ]">
                    {{ player.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td v-if="isTeamCaptain" class="p-4 text-right flex gap-2 justify-end">
                  <button 
                    v-if="!player.is_captain"
                    @click="removePlayer(player.id)"
                    class="text-error-400 hover:text-error-300"
                  >
                    Remove
                  </button>
                  <button 
                    v-if="!player.is_captain"
                    @click="changeStatus(player.id, player.is_active)"
                    class="text-error-400 hover:text-error-300"
                  >
                    Change Status
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>