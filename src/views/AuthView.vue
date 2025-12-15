<script setup>
import Logo from '@/components/Logo.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <main class="min-h-dvh h-dvh flex">
    <div
      class="hidden md:flex flex-1 relative bg-black overflow-hidden"
      :style="{
        backgroundImage: 'url(/saver.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
      }"
    >
     <div class="absolute inset-0 bg-black/40"></div>
      <img
        src="/saver.jpg"
        alt="Pharmacist"
        class="absolute inset-0 w-full h-full object-cover opacity-0"
      />

      <div class="relative z-10 flex flex-col justify-center px-10 text-white h-full">
        <h2 class="text-2xl font-semibold leading-snug max-w-md">
          Monitor and control your inventory from a unified dashboard.
        </h2>
        <p class="mt-4 text-sm leading-relaxed max-w-md">
          Analyze trends, track product performance, and make data-driven decisions to boost your
          business efficiency.
        </p>
      </div>
    </div>

    <div class="flex-1 flex flex-col items-center justify-center bg-white min-h-full">
      <Logo class="mb-4 w-40" />
      <RouterView />
    </div>
  </main>
</template>
