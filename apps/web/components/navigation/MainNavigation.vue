<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';
import { useTeamStore } from '../../stores/teamStore';
import UserDropdown from './UserDropdown.vue';

const route = useRoute();
const authStore = useAuthStore();

const isLoggedIn = computed(() => authStore.isLoggedIn);
const currentRoute = computed(() => route.path);

const navLinks = [
  { name: 'Dashboard', path: '/dashboard', requiresAuth: true },
  { name: 'Leaderboard', path: '/leaderboard', requiresAuth: false },
  { name: 'Schedule', path: '/schedule', requiresAuth: false },
];

const isActive = (path: string) => {
  return currentRoute.value.startsWith(path);
};
</script>

<template>
  <nav>
    <ul class="flex items-center space-x-6">
      <li v-for="link in navLinks" :key="link.name">
        <router-link
          v-if="!link.requiresAuth || (link.requiresAuth && isLoggedIn)"
          :to="link.path"
          :class="[
            'py-2 font-medium text-sm transition-colors',
            isActive(link.path) ? 'text-primary-400 border-b-2 border-primary-400' : 'text-gray-300 hover:text-white'
          ]"
        >
          {{ link.name }}
        </router-link>
      </li>
      
      <li v-if="isLoggedIn">
        <UserDropdown />
      </li>
      
      <li v-else>
        <router-link 
          to="/login"
          class="btn-primary text-sm py-1.5"
        >
          Sign In
        </router-link>
      </li>
    </ul>
  </nav>
</template>