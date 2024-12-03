// uno.config.ts
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss'
import { presetScrollbar } from 'unocss-preset-scrollbar'

export default defineConfig({
  shortcuts: {
    'flex-center': 'flex justify-center items-center',
    'flex-x-center': 'flex justify-center',
    'flex-y-center': 'flex items-center',
    'wh-full': 'w-full h-full',
    'flex-x-between': 'flex items-center justify-between',
    'flex-x-end': 'flex items-center justify-end',
    'absolute-lt': 'absolute left-0 top-0',
    'absolute-rt': 'absolute right-0 top-0 ',
    'fixed-lt': 'fixed left-0 top-0'
  },
  theme: {
    colors: {
      primary: 'var(--el-color-primary)',
      primary_dark: 'var(--el-color-primary-light-5)'
    }
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
    presetTypography(),
    presetWebFonts({
      fonts: {
        // ...
      }
    }),
    presetScrollbar({
      scrollbarTrackColor: '#f5f5f500',
      scrollbarThumbColor: '#ddd',
      numberToUnit: value => `${value}px` // default options, scrollbar-w-4 will generate --scrollbar-width: 1rem, will generate --scrollbar-width: 4px
    })
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()]
})
