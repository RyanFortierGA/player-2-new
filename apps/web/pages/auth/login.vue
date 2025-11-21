<script setup lang="ts">
  import { supabase } from "@/supabase";

  const { t } = useTranslations();
  const { reloadUser } = useUser({ initialUser: null });
  const router = useRouter();

  definePageMeta({
    layout: "saas-auth",
  });

  useSeoMeta({
    title: t("auth.login.title"),
  });

  const email = ref("");
  const password = ref("");
  const loading = ref(false);
  const errorMessage = ref("");

  const onSubmit = async () => {
    errorMessage.value = "";
    if (!email.value || !password.value) {
      errorMessage.value = t("auth.login.hints.invalidCredentials");
      return;
    }
    loading.value = true;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      });
      if (error) throw error;
      const accessToken = data.session?.access_token;
      if (accessToken) {
        await $fetch("/api/auth/login-with-supabase", {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      }
      await reloadUser();
      router.push("/app/team");
    } catch (e: any) {
      errorMessage.value = e?.message || t("auth.login.hints.invalidCredentials");
    } finally {
      loading.value = false;
    }
  };
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-4xl font-bold">{{ $t("auth.login.title") }}</h1>
      <p class="mb-6 mt-4 text-muted-foreground">
        {{ $t("auth.login.subtitle") }}
      </p>
    </div>

    <form @submit.prevent="onSubmit" class="flex flex-col gap-6">
      <Alert v-if="errorMessage" variant="error">
        <AlertTriangleIcon class="size-6" />
        <AlertDescription>{{ errorMessage }}</AlertDescription>
      </Alert>

      <div class="flex flex-col gap-2">
        <FormLabel for="email" required>{{ $t("auth.login.email") }}</FormLabel>
        <Input id="email" v-model="email" type="email" autocomplete="email" required />
      </div>

      <div class="flex flex-col gap-2">
        <FormLabel for="password" required>{{ $t("auth.login.password") }}</FormLabel>
        <SaasPasswordInput id="password" v-model="password" autocomplete="current-password" required />
        <div class="text-right">
          <NuxtLink to="/auth/forgot-password">{{ $t("auth.login.forgotPassword") }}</NuxtLink>
        </div>
      </div>

      <Button class="w-full" type="submit" variant="secondary" :loading="loading">
        {{ t("auth.login.submit") }}
      </Button>
    </form>
  </div>
</template>
