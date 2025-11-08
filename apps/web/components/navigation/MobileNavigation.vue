<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';
import { useTeamStore } from '../../stores/teamStore';

defineProps<{
  isOpen: boolean
}>();

const emit = defineEmits(['close']);

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const teamStore = useTeamStore();

const isLoggedIn = computed(() => authStore.isLoggedIn);
const currentRoute = computed(() => route.path);
const username = computed(() => authStore.user?.username || 'User');

const navLinks = [
  { name: 'Home', path: '/', requiresAuth: false, hideIfLoggedIn: true },
  { name: 'Dashboard', path: '/dashboard', requiresAuth: true },
  { name: 'Leaderboard', path: '/leaderboard', requiresAuth: false },
  { name: 'Schedule', path: '/schedule', requiresAuth: false },
];

const isActive = (path: string) => {
  return currentRoute.value === path || currentRoute.value.startsWith(path);
};

const handleLogout = async () => {
  await authStore.logout();
  emit('close');
  router.push('/login');
};

const navigateTo = (path: string) => {
  router.push(path);
  emit('close');
};

// Close menu when route changes
watch(() => route.path, () => {
  emit('close');
});
</script>

<template>
  <div v-if="isOpen" class="md:hidden fixed inset-0 z-30 bg-black bg-opacity-50" @click="emit('close')"></div>
  
  <div 
    :class="[
      'fixed inset-y-0 right-0 transform transition-transform duration-300 ease-in-out z-40 md:hidden',
      isOpen ? 'translate-x-0' : 'translate-x-full'
    ]"
    class="w-64 bg-dark-200 overflow-y-auto"
  >
    <div class="pt-5 pb-6 px-5">
      <div class="flex items-center justify-between mb-6">
        <div>
          <span class="text-xl font-display font-bold text-primary-400">Player2</span>
          <span class="text-lg font-display font-medium text-white">Esports</span>
        </div>
        <button @click="emit('close')" class="text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div v-if="isLoggedIn" class="mb-6 pb-4 border-b border-gray-700">
        <div class="flex items-center">
          <div class="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center text-white font-medium">
            {{ username.charAt(0).toUpperCase() }}
          </div>
          <div class="ml-3">
            <p class="text-white font-medium">{{ username }}</p>
            <p class="text-gray-400 text-sm">Manage my account</p>
          </div>
        </div>
      </div>
      
      <nav>
        <ul class="space-y-2">
          <li v-for="link in navLinks" :key="link.name">
            <button 
              v-if="(!link.requiresAuth && !link.hideIfLoggedIn) || (link.requiresAuth && isLoggedIn && !link.hideIfLoggedIn)"
              @click="navigateTo(link.path)"
              :class="[
                'w-full text-left px-3 py-2 rounded-md text-base font-medium',
                isActive(link.path) ? 'bg-primary-900 text-white' : 'text-gray-300 hover:bg-dark-100 hover:text-white'
              ]"
            >
              {{ link.name }}
            </button>
          </li>
          
          <li v-if="isLoggedIn && teamStore.currentTeam">
            <button 
              @click="navigateTo(`/team/${teamStore.currentTeam.id}`)"
              :class="[
                'w-full text-left px-3 py-2 rounded-md text-base font-medium',
                isActive(`/team/${teamStore.currentTeam.id}`) ? 'bg-primary-900 text-white' : 'text-gray-300 hover:bg-dark-100 hover:text-white'
              ]"
            >
              My Team
            </button>
          </li>
          
          <li v-if="!isLoggedIn" class="pt-4">
            <button 
              @click="navigateTo('/login')"
              class="w-full px-3 py-2 rounded-md text-base font-medium bg-primary-600 hover:bg-primary-700 text-white"
            >
              Sign In
            </button>
          </li>
          
          <li v-if="!isLoggedIn">
            <button 
              @click="navigateTo('/register')"
              class="w-full px-3 py-2 rounded-md text-base font-medium border border-primary-600 text-primary-400 hover:bg-primary-900 hover:text-white"
            >
              Create Account
            </button>
          </li>
          
          <li v-if="isLoggedIn" class="pt-4">
            <button 
              @click="handleLogout"
              class="w-full px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-dark-100 hover:text-white"
            >
              Sign Out
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>