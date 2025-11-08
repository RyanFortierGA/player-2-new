<script setup lang="ts">
  import { ArrowLeftIcon, ArrowRightIcon } from "lucide-vue-next";
  import { z } from "zod";

  const emit = defineEmits<{
    complete: [];
    back: [];
  }>();

  const { apiCaller } = useApiCaller();
  const { t } = useTranslations();
  const { user } = useUser();

  const createTeamMutation = apiCaller.team.create.useMutation();

  const formSchema = toTypedSchema(
    z.object({
      teamName: z.string().min(1, "Name is required"),
      teamSize: z.enum(["2","4"]).default("4"),
      region: z.enum(["US_EAST","US_WEST","EUROPE","ASIA","AU_NZ","SOUTH_AMERICA","AFRICA"]).default("US_EAST"),
      averagePeakRank: z.string().optional(),
    }),
  );

  const serverError = ref<null | string>(null);

  const { isSubmitting, handleSubmit } = useForm({
    validationSchema: formSchema,
    initialValues: {
      teamName: "",
      teamSize: "4",
      region: "US_EAST",
      averagePeakRank: "",
    },
  });

  const onSubmit = handleSubmit(async ({ teamName, teamSize, region, averagePeakRank }) => {
    serverError.value = null;

    try {
      await createTeamMutation.mutate({ name: teamName, teamSize, region, averagePeakRank });
      emit("complete");
    } catch (e) {
      serverError.value = t("onboarding.notifications.teamSetupFailed");
    }
  });
</script>

<template>
  <template v-if="user?.teamMemberships?.length">
    <div class="flex flex-col items-stretch gap-4">
      <h3 class="text-xl font-bold">
        {{ t("onboarding.team.joinTeam") }}
      </h3>
      <p class="text-muted-foreground">
        {{
          $t("onboarding.team.joinTeamDescription", {
            teamName: user.teamMemberships[0].team.name,
          })
        }}
      </p>
      <Button @click="emit('complete')">
        <CheckIcon class="mr-2 size-4" />
        {{ t("onboarding.complete") }}
      </Button>
    </div>
  </template>
  <template v-else>
    <h3 class="mb-4 text-xl font-bold">
      {{ t("onboarding.team.title") }}
    </h3>
    <form @submit="onSubmit" class="flex flex-col items-stretch gap-8">
      <FormField v-slot="{ componentField }" name="teamName">
        <FormItem>
          <FormLabel for="teamName" required>
            {{ $t("onboarding.team.name") }}
          </FormLabel>
          <FormControl>
            <Input v-bind="componentField" autocomplete="company" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField v-slot="{ componentField }" name="teamSize">
          <FormItem>
            <FormLabel required>Format</FormLabel>
            <FormControl>
              <Select v-bind="componentField">
                <SelectTrigger><SelectValue placeholder="Select format" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2v2</SelectItem>
                  <SelectItem value="4">4v4</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="region">
          <FormItem>
            <FormLabel required>Region</FormLabel>
            <FormControl>
              <Select v-bind="componentField">
                <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="US_EAST">US East</SelectItem>
                  <SelectItem value="US_WEST">US West</SelectItem>
                  <SelectItem value="EUROPE">Europe</SelectItem>
                  <SelectItem value="ASIA">Asia</SelectItem>
                  <SelectItem value="AU_NZ">Australia/NZ</SelectItem>
                  <SelectItem value="SOUTH_AMERICA">South America</SelectItem>
                  <SelectItem value="AFRICA">Africa</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="averagePeakRank">
          <FormItem>
            <FormLabel>
              Average team peak rank
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" class="ml-1 h-5 w-5 p-0 text-muted-foreground">?</Button>
                </TooltipTrigger>
                <TooltipContent class="max-w-xs text-sm">
                  This is your team's overall average of each member's highest rank.
                  For example, two Diamond 3s and two Crimson 2s ≈ Crimson 1.
                  Please don't sandbag — this is meant to be fun but competitive.
                </TooltipContent>
              </Tooltip>
            </FormLabel>
            <FormControl>
              <Select v-bind="componentField">
                <SelectTrigger><SelectValue placeholder="Select rank" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GOLD">Gold</SelectItem>
                  <SelectItem value="PLATINUM">Platinum</SelectItem>
                  <SelectItem value="DIAMOND_1">Diamond 1</SelectItem>
                  <SelectItem value="DIAMOND_2">Diamond 2</SelectItem>
                  <SelectItem value="DIAMOND_3">Diamond 3</SelectItem>
                  <SelectItem value="CRIMSON_1">Crimson 1</SelectItem>
                  <SelectItem value="CRIMSON_2">Crimson 2</SelectItem>
                  <SelectItem value="CRIMSON_3">Crimson 3</SelectItem>
                  <SelectItem value="IRIDESCENT">Iridescent</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <div class="flex gap-2">
        <Button
          type="button"
          variant="outline"
          @click="$emit('back')"
          class="flex-1"
        >
          <ArrowLeftIcon class="mr-2 size-4" />
          {{ $t("onboarding.back") }}
        </Button>

        <Button type="submit" :loading="isSubmitting" class="flex-1">
          {{ $t("onboarding.continue") }}
          <ArrowRightIcon class="ml-2 size-4" />
        </Button>
      </div>
    </form>
  </template>
</template>
