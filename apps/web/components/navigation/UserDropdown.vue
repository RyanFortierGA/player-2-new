<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';
import { useTeamStore } from '../../stores/teamStore';
import { supabase } from '../../supabase';

const router = useRouter();
const authStore = useAuthStore();
const teamStore = useTeamStore();

const isOpen = ref(false);
const dropdownRef = ref<HTMLDivElement | null>(null);
const username = ref('');
const userTeams = computed(() => teamStore.userTeams);
const currentTeam = computed(() => teamStore.currentTeam);

const error = ref('');

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const closeDropdown = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

const handleLogout = async () => {
  await authStore.logout();
  isOpen.value = false;
  router.push('/login');
};

const navigateTo = (path: string) => {
  router.push(path);
  isOpen.value = false;
};

const switchTeam = (team: any) => {
  teamStore.setCurrentTeam(team);
  isOpen.value = false;
};

onMounted(async () => {
  await fetchUsers(authStore.user?.id);
  document.addEventListener('mousedown', closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', closeDropdown);
});

async function fetchUsers(userId: string) {
  try {
    const { data, error: fetchError } = await supabase
      .from('users')
      .select('id, username')
      .eq('id', userId);
    
    if (fetchError) throw fetchError;
    username.value = data[0].username;
  } catch (err) {
    console.error('Error fetching users:', err);
    error.value = 'Failed to fetch users';
  }
}
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <button 
      @click="toggleDropdown"
      class="flex items-center space-x-2 text-gray-300 hover:text-white focus:outline-none"
    >
      <div class="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-white font-medium">
        {{ username.charAt(0).toUpperCase() }}
      </div>
      <span class="hidden lg:block text-sm font-medium">{{ username }}</span>
      <svg 
        :class="isOpen ? 'transform rotate-180' : ''"
        xmlns="http://www.w3.org/2000/svg" 
        class="h-4 w-4 transition-transform duration-200" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>
    
    <div 
      v-if="isOpen" 
      class="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-dark-200 border border-gray-700 ring-1 ring-black ring-opacity-5"
    >
      <div class="py-1">
        <div class="px-4 py-2 border-b border-gray-700">
          <p class="text-sm text-white">Signed in as {{ username }}</p>
          <p class="text-sm font-medium text-primary-400">{{ username }}</p>
        </div>
        
        <template v-if="userTeams.length > 0">
          <div class="px-4 py-2 border-b border-gray-700">
            <p class="text-xs text-gray-400 uppercase tracking-wider">My Teams</p>
            <div class="mt-1 space-y-1">
              <button 
                v-for="team in userTeams" 
                :key="team.id"
                @click="switchTeam(team)"
                class="w-full text-left px-2 py-1 text-sm rounded-md"
                :class="currentTeam && currentTeam.id === team.id ? 'bg-primary-900 text-white' : 'text-gray-300 hover:bg-dark-100 hover:text-white'"
              >
                {{ team.name }}
              </button>
            </div>
          </div>
        </template>
        
        <button 
          @click="navigateTo('/dashboard')" 
          class="w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-dark-100 hover:text-white"
        >
          Dashboard
        </button>
        
        <button 
          v-if="currentTeam"
          @click="navigateTo(`/team/${currentTeam.id}`)" 
          class="w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-dark-100 hover:text-white"
        >
          Team Profile
        </button>
        
        <button 
          @click="navigateTo('/team/create')" 
          class="w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-dark-100 hover:text-white"
        >
          Create New Team
        </button>
        
        <div class="border-t border-gray-700"></div>
        
        <button 
          @click="handleLogout" 
          class="w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-dark-100 hover:text-white"
        >
          Sign Out
        </button>
      </div>
    </div>
  </div>
</template>