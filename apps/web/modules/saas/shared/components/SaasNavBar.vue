<script setup lang="ts">
  import {
    ChevronRightIcon,
    UsersIcon,
    TrophyIcon,
    CalendarIcon,
    BookTextIcon,
    SettingsIcon,
    UserCogIcon,
  } from "lucide-vue-next";

  const route = useRoute();
  const { t } = useTranslations();
  const { user } = useUser();

  const isAdmin = computed(() => user.value?.role === "ADMIN");

  type MenuItem = {
    label: string;
    to: string;
    icon: Component;
  };

  const menuItems = computed<MenuItem[]>(() => [
    { label: 'Team', icon: UsersIcon, to: '/app/team' },
    { label: 'Leaderboard', icon: TrophyIcon, to: '/league/leaderboard' },
    { label: 'Schedule', icon: CalendarIcon, to: '/league/schedule' },
    { label: 'Rules', icon: BookTextIcon, to: '/rules' },
    { label: 'Settings', icon: SettingsIcon, to: '/app/settings' },
    ...(isAdmin.value ? ([{ label: 'Admin', icon: UserCogIcon, to: '/app/admin' }] satisfies MenuItem[]) : []),
  ]);

  const isActiveMenuItem = (href: string | null) => {
    if (!href) return false;
    const p = route.path;
    return p === href || p.startsWith(href + "/");
  };
</script>

<template>
  <nav class="w-full border-b">
    <div class="container py-6 pt-[26px]">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-nowrap items-center gap-4">
          <NuxtLink to="/" class="block shrink-0">
            <Logo />
          </NuxtLink>

          <span class="hidden opacity-30 md:block">
            <ChevronRightIcon class="size-4" />
          </span>

          <SaasTeamSelect />
        </div>

        <div class="ml-auto mr-0 flex items-center justify-end gap-4">
          <UserMenu />
        </div>
      </div>

      <ul
        class="no-scrollbar -mx-8 -mb-4 mt-6 flex list-none items-center justify-start gap-6 overflow-x-auto px-8 text-sm lg:text-base"
      >
        <li v-for="menuItem of menuItems" :key="menuItem.to">
          <NuxtLink
            :to="menuItem.to"
            class="flex items-center gap-2 border-b-2 px-1 pb-3 text-sm text-foreground/80"
            :class="
              isActiveMenuItem(menuItem.to)
                ? 'border-primary font-bold text-primary'
                : 'border-transparent'
            "
          >
            <component
              :is="menuItem.icon"
              class="size-4 shrink-0"
              :class="isActiveMenuItem(menuItem.to) ? 'text-primary' : ''"
            />
            <span :class="isActiveMenuItem(menuItem.to) ? 'text-primary' : ''">{{ menuItem.label }}</span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </nav>
</template>
