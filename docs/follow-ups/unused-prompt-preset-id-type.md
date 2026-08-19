`PromptPresetId` in `lib/prompts.ts` is exported but never imported anywhere (`components/converter.tsx` keeps `promptChoice` as a plain `string`) — remove it or wire it into the state type.
