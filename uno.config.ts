import { defineConfig } from 'unocss'

export default defineConfig({
  shortcuts: {
    'input-base': 'w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500',
    'form-group': 'mb-4',
    'form-label': 'block text-gray-700 text-sm font-bold mb-2',
    'form-section': 'bg-gray-50 p-6 rounded-lg mb-6',
    'checkbox-wrapper': 'flex items-center gap-2',
    'card': 'bg-gray-50 p-2 rounded-lg shadow-sm',
    'card-title': 'text-sm font-semibold text-gray-700 mb-2',
    'input-mini': 'px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500',
    'select-mini': 'px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500',
    'btn-primary': 'px-4 py-1 rounded inline-block bg-blue-600 text-white cursor-pointer hover:bg-blue-700 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50',
    'rule-card': 'bg-white p-2 rounded border',
    'option': 'flex items-center gap-1 text-xs text-gray-600',
    'console-output': 'bg-gray-800 text-white text-sm p-2 rounded overflow-y-auto font-mono',
    'config-preview': 'bg-gray-800 text-white text-xs p-2 rounded  overflow-x-auto max-h-[150px] overflow-y-auto',

  },
})
