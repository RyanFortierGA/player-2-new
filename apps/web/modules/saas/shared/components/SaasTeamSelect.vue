<script setup lang="ts">
  import { ChevronsUpDownIcon, PlusIcon } from "lucide-vue-next";

  const { teamMemberships, currentTeam } = useUser();
  const { switchTeam } = useSwitchTeam();
  const { createTeamDialogOpen } = useDashboardState();
  const runtimeConfig = useRuntimeConfig();

  const activeTeamIdModel = computed({
    get: () => currentTeam.value?.id,
    set: async (newValue) => {
      if (newValue) {
        switchTeam(newValue);
        await navigateTo(runtimeConfig.public.auth.redirectPath);
      }
    },
  });
</script>

<template>
  <DropdownMenu v-if="currentTeam">
    <DropdownMenuTrigger
      class="focus-visible:border-primary focus-visible:ring-ring -ml-2 flex w-full items-center justify-between rounded-md p-2 text-left outline-none focus-visible:ring-1"
    >
      <div class="flex items-center justify-start gap-2 text-sm text-foreground">
        <span class="hidden lg:block">
          <TeamAvatar
            class="size-8"
            :name="currentTeam.name"
            :avatar-url="currentTeam.avatarUrl"
          />
        </span>
        <span class="block flex-1 truncate text-foreground">{{ currentTeam.name }}</span>
        <ChevronsUpDownIcon class="block size-4 opacity-60 text-foreground" />
      </div>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-full bg-background text-foreground">
      <DropdownMenuRadioGroup v-model="activeTeamIdModel">
        <DropdownMenuRadioItem
          v-for="teamMembership of teamMemberships"
          :key="teamMembership.team.id"
          :value="teamMembership.team.id"
        >
          <div class="flex flex-1 items-center justify-start gap-2 text-foreground">
            <TeamAvatar
              class="size-6"
              :name="teamMembership.team.name"
              :avatar-url="teamMembership.team.avatarUrl"
            />
            <div>
              <div class="leading-tight">{{ teamMembership.team.name }}</div>
              <div v-if="teamMembership.team.division" class="text-xs text-muted-foreground">
                Div {{ teamMembership.team.division.level }} · {{ teamMembership.team.region }}
              </div>
            </div>
          </div>
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>

      <DropdownMenuSeparator v-if="(teamMemberships?.length ?? 0) === 0" />

      <DropdownMenuGroup v-if="(teamMemberships?.length ?? 0) === 0">
        <DropdownMenuItem @click="() => (createTeamDialogOpen = true)">
          <PlusIcon class="mr-2 size-4" />
          {{ $t("dashboard.sidebar.createTeam") }}
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>

  <SaasCreateTeamDialog v-if="(teamMemberships?.length ?? 0) === 0" @success="(newTeamId) => switchTeam(newTeamId)" />
</template>
