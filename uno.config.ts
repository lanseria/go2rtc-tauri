import { defineConfig, presetIcons, presetWind4, transformerDirectives, transformerVariantGroup } from 'unocss'

export default defineConfig({
  shortcuts: [
    [
      'btn',
      'inline-flex items-center justify-center gap-2 px-4 py-2 rounded transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
    ],
    ['btn-primary', 'btn bg-blue-600 text-white hover:bg-blue-700'],
    ['btn-danger', 'btn bg-red-500 text-white hover:bg-red-600'],
    ['btn-success', 'btn bg-green-600 text-white hover:bg-green-700'],
    ['btn-sky', 'btn bg-sky-600 text-white hover:bg-sky-700'],
    ['btn-secondary', 'btn bg-gray-500 text-white hover:bg-gray-600'],
    ['btn-ghost', 'btn bg-gray-200 text-gray-800 hover:bg-gray-300'],
    [
      'input',
      'px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400',
    ],
  ],
  presets: [
    presetWind4({
      reset: true,
    }),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
