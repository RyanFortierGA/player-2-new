<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTeamStore } from '../../stores/teamStore';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../supabase'; // Assuming you have a supabase client setup

const router = useRouter();
const route = useRoute();
const teamStore = useTeamStore();
const authStore = useAuthStore();

const teamData = ref({
  name: '',
  logo_url: ''
});

const captainInfo = ref({
  gamer_tag: '',
  platform: ''
});

const isLoading = ref(false);
const error = ref('');
const currentTeam = ref(null);
const username = ref('');
const paymentLink = 'https://buy.stripe.com/test_5kQ00j8PdgrI9mtbr2cEw00'; // Replace with your actual payment link

onMounted(async () => {
  if (!authStore.user) {
    router.push('/login');
    return;
  } else {
    await Promise.all([
      teamStore.fetchUserTeams(authStore.user.id),
      fetchUserData(authStore.user.id)
    ]);
  }
  const userTeams = await teamStore.currentTeam;
  currentTeam.value = userTeams;

  // Check for payment success query parameter
  const paymentSuccess = route.query.paymentSuccess === 'true';
  const teamId = currentTeam?.value?.id;
  setTimeout( async () => {
    if (paymentSuccess) {
      await handlePaymentSuccess(teamId);
    }
  }, 200);
});

async function fetchUserData(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('id', userId)
      .single();

    if (error) throw error;
    username.value = data.username;
  } catch (err) {
    console.error('Error fetching user data:', err);
    error.value = 'Failed to fetch user data';
  }
}

async function handleSubmit() {
  try {
    isLoading.value = true;
    error.value = '';

    if (!authStore.user) {
      throw new Error('You must be logged in to create a team');
    }

    if (currentTeam.value) {
      throw new Error('You are already part of a team and cannot create another one.');
    }

    const hasSpace = await teamStore.checkAvailableSpace();

    if (hasSpace) {
      // Redirect to the payment link
      const result = await teamStore.createTeam(
        {
          ...teamData.value,
          tier: 3, // All new teams start in Tier 3
          status: 'inactive',
          created_by: authStore.user.id
        },
        {
          user_id: authStore.user.id,
          username: username.value, // Use the fetched username
          gamer_tag: captainInfo.value.gamer_tag,
          platform: captainInfo.value.platform, 
          role: 'Captain',
          avatar_url: authStore.user.avatar_url || null,
          is_captain: true,
          is_active: true
        }
      );
      if (result.success) {
        window.location.href = paymentLink;
      } else {
        throw new Error(result.error);
      }
    } else {
      // Add to waitlist
      const result = await teamStore.createTeam(
        {
          ...teamData.value,
          tier: 3, // All new teams start in Tier 3
          created_by: authStore.user.id
        },
        {
          user_id: authStore.user.id,
          username: username.value, // Use the fetched username
          gamer_tag: captainInfo.value.gamer_tag,
          platform: captainInfo.value.platform, 
          role: 'Captain',
          avatar_url: authStore.user.avatar_url || null,
          is_captain: true,
          is_active: true
        }
      );

      if (result.success) {
        await teamStore.addToWaitlist(result.team.id);
      } else {
        throw new Error(result.error);
      }
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to create team';
  } finally {
    isLoading.value = false;
  }
}


async function handlePaymentSuccess(teamId: string) {
  try {
    isLoading.value = true;
    error.value = '';
    teamStore.activateTeam(teamId);
    router.push(`/team/${teamId}`);
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to create team';
  } finally {
    isLoading.value = false;
  }
}

</script>

<template>
  <div v-if="isLoading" class="flex justify-center items-center min-h-[400px]">
    <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-400 border-t-transparent"></div>
  </div>

  <div v-else>
    <div v-if="currentTeam" class="text-center">
      <h2 class="text-xl font-display font-bold text-white mb-4 mt-10">Team Creation Restricted</h2>
      <p class="text-gray-300 mb-4">
        You are already part of a team and cannot create another one.
      </p>
      <p class="text-gray-300 mb-4">
        You can manage your current team <a :href="`/team/${currentTeam.id}`" class="text-primary-400 hover:text-primary-300">here</a>.
      </p>
    </div>
    <div v-else>
      <div class="container mx-auto px-4 py-8">
        <div class="max-w-2xl mx-auto">
          <div class="mb-8">
            <h1 class="text-3xl font-display font-bold text-white mb-2">Create Your Team</h1>
            <p class="text-gray-400">All new teams start in Tier 3. Compete and win matches to advance to higher tiers!</p>
          </div>

          <form @submit.prevent="handleSubmit" class="card p-6 space-y-6">
            <div>
              <label for="name" class="label">Team Name</label>
              <input
                id="name"
                v-model="teamData.name"
                type="text"
                required
                class="input w-full"
                :disabled="isLoading"
                placeholder="Enter your team name"
              />
            </div>

            <div>
              <label for="logo" class="label">Team Logo URL <span class="text-gray-400">(optional)</span></label>
              <input
                id="logo"
                v-model="teamData.logo_url"
                type="url"
                class="input w-full"
                :disabled="isLoading"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <label for="gamer_tag" class="label">Captain's Gamer Tag</label>
              <input
                id="gamer_tag"
                v-model="captainInfo.gamer_tag"
                type="text"
                required
                class="input w-full"
                :disabled="isLoading"
                placeholder="Enter your gamer tag"
              />
            </div>

            <div>
              <label for="platform" class="label">Captain's Platform</label>
              <select id="platform" v-model="captainInfo.platform" class="input w-full" :disabled="isLoading">
                <option value="" disabled>Select Platform</option>
                <option value="PC">PC</option>
                <option value="Xbox">Xbox</option>
                <option value="PlayStation">PlayStation</option>
              </select>
            </div>

            <div class="bg-dark-100 rounded-lg p-4 border border-gray-700">
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-primary-900 flex items-center justify-center text-primary-300 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-white font-medium">Starting in Tier 3</h3>
                  <p class="text-sm text-gray-400">Win matches to advance to higher tiers in future seasons</p>
                </div>
              </div>
            </div>

            <div v-if="error" class="bg-error-900 border border-error-800 text-error-200 p-4 rounded-md text-sm">
              {{ error }}
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                class="btn-primary"
                :disabled="isLoading"
              >
                <template v-if="isLoading">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Team...
                </template>
                <template v-else>
                  Create Team
                </template>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>