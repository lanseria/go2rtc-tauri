import { defineConfig, presetAttributify, presetIcons, presetWind3, transformerDirectives, transformerVariantGroup } from 'unocss'

export default defineConfig({
  shortcuts: [
    [
      'btn',
      'inline-flex items-center gap-1 px-4 py-2 rounded inline-block bg-blue-6 text-white cursor-pointer hover:bg-blue-7 disabled:cursor-default disabled:bg-gray-6 disabled:opacity-50',
    ],
    [
      'input',
      'px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ',
    ],
  ],
  presets: [
    presetWind3(),
    presetAttributify(),
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
