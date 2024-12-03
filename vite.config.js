import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'
import dayjs from 'dayjs'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
// components auto import
import Components from 'unplugin-vue-components/vite'
// element-plus
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// unocss
import UnoCSS from 'unocss/vite'
// Directly use Vue Composition API and others without importing
import AutoImport from 'unplugin-auto-import/vite'
// 打包文件压缩
import viteCompression from 'vite-plugin-compression'
// icon引入
import Icons from 'unplugin-icons/vite'
// 用于处理自动化引入icon组件，即在页面中直接使用，不用从依赖包中再次引入
import IconsResolver from 'unplugin-icons/resolver'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
// 本地实现https
import mkcert from 'vite-plugin-mkcert'
// 处理commonjs，require方式引入文件模块
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'
// package info
// 支持@import写法
import postcssImport from 'postcss-import'
// 支持@url写法
import postcssUrl from 'postcss-url'
// 优化和压缩CSS，已包含autoprefixer插件
// 支持变量运算，集成了autoprefixer
import postcssPresetEnv from 'postcss-preset-env'
// 版权注释
import banner from 'vite-plugin-banner'
// 当你使用unplugin-vue-components来引入ui库的时候，message, notification，toast 等引入样式不生效。
// 安装vite-plugin-style-import，实现message, notification，toast 等引入样式自动引入
import { createStyleImportPlugin, ElementPlusResolve } from 'vite-plugin-style-import'
// 打包体积分析插件
import { visualizer } from 'rollup-plugin-visualizer'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import pkg from './package.json'

const { dependencies, devDependencies, name, version } = pkg
const APP_INFO = {
  pkg: { dependencies, devDependencies, name, version },
  lastBuildTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
}
const pathSrc = resolve(__dirname, 'src')

// https://vitejs.dev/config/
export default ({ command, mode }) => {
  const env = loadEnv(mode, process.cwd())
  // command 开发环境下值为serve，生产环境下值为build
  // mode 指.env环境下，例如.env.test其值为test
  console.log('🚀 & file: vite.config.ts & line 20 & mode', mode)
  console.log('🚀 & file: vite.config.ts & line 20 & command', command)
  // .env中的设置获取
  // 根据当前工作目录中的 `mode` 加载 .env 文件
  // 设置第三个参数为 '' 来加载所有环境变量，而不管是否有 `VITE_` 前缀。
  // https://cn.vitejs.dev/guide/env-and-mode.html#env-files
  const { VITE_APP_PORT, VITE_APP_API_URL, VITE_APP_BASE_API } = loadEnv(mode, process.cwd(), '')
  return defineConfig({
    // 要用到的插件数组
    plugins: [
      vue(),
      visualizer({
        open: false, // 如果存在本地服务端口，将在打包后自动展示
        gzipSize: true,
        brotliSize: true
      }),
      // mkcert(),
      viteCommonjs(),
      viteCompression({
        verbose: true, // Whether to output the compressed result in the console
        threshold: 1025, // It will be compressed if the volume is larger than threshold, the unit is b
        algorithm: 'gzip', // Compression algorithm, optional ['gzip','brotliCompress' ,'deflate','deflateRaw']
        ext: '.gz' // Suffix of the generated compressed package
      }),
      // https://github.com/antfu/unplugin-auto-import
      AutoImport({
        // Auto import functions from Element Plus, e.g. ElMessage, ElMessageBox... (with style)
        // 自动导入 Element Plus 相关函数，如：ElMessage, ElMessageBox... (带样式)
        resolvers: [
          ElementPlusResolver({
            importStyle: 'sass'
          }),
          // Auto import icon components
          // 自动导入图标组件
          IconsResolver({
            prefix: 'Icon'
          })
        ],
        // Auto import functions from Vue, e.g. ref, reactive, toRef...
        // 自动导入 Vue 相关函数，如：ref, reactive, toRef 等
        imports: ['vue', 'pinia', 'vue-router', '@vueuse/head', '@vueuse/core'],
        dts: false
        // dts: 'src/auto-imports.d.ts' // 启动后会自动生成，在此文件中可查看不需要引入的API
      }),
      // https://github.com/antfu/unplugin-vue-components
      /**
       * 使用@iconify/json进行全部引入
       * 图标查询官方地址：https://icon-sets.iconify.design/
       * 按照集合引入，例如carbon，引入 @iconify-json/carbon
       */
      Components({
        // dirs: [
        //   resolve(pathSrc, 'components'),
        //   resolve(pathSrc, 'components/AppLink/index.vue'),
        //   resolve(pathSrc, 'components/Breadcrumb/index.vue'),
        //   resolve(pathSrc, 'components/Hamburger/index.vue'),
        //   resolve(pathSrc, 'components/Pagination/index.vue'),
        //   resolve(pathSrc, 'components/SvgIcon/index.vue')
        // ],
        // allow auto load markdown components under `./src/components/`
        extensions: ['vue', 'md'],
        // allow auto import and register components used in markdown
        include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
        exclude: [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/],
        dts: false,
        // dts: 'src/components.d.ts', // 启动后会自动生成
        resolvers: [
          // Auto register icon components
          // 自动注册图标组件
          IconsResolver({
            // prefix: 'i', // 针对所有图标标签前缀,默认是：i
            // enabledCollections: ['ep'],
            customCollections: ['maas'] // 是用于配合自定义图标集合名
          }),
          // Auto register Element Plus components
          // 自动导入 Element Plus 组件
          ElementPlusResolver({
            importStyle: 'sass'
          })
        ]
      }),
      createStyleImportPlugin({
        resolves: [ElementPlusResolve()]
        // libs: [
        //   {
        //     libraryName: 'element-plus',
        //     esModule: true,
        //     resolveStyle: (name: string) => {
        //       return `element-plus/theme-chalk/${name}.css`
        //     }
        //   }
        // ]
      }),
      // https://github.com/antfu/unocss
      // see unocss.config.ts for config
      // 官网readme：https://github.com/unocss/unocss#readme
      // 官网类名查询：https://uno.antfu.me/
      UnoCSS({
        hmrTopLevelAwait: false
      }),
      /**
       * 问题描述：打包报错 Cannot find module '~icons/xxx' or its corresponding type declarations.
       * 解决方案：tsconfig.json中配置"unplugin-icons/types/vue"
       *  "types": [
       *    "unplugin-icons/types/vue"
       * ]
       */
      Icons({
        autoInstall: true,
        /**
         * {prefix}-{collection}-{icon}
         * {前缀（默认i）}-{图标集名称（aminer）}-{图标名称（iconname）}
         */
        compiler: 'vue3',
        customCollections: {
          // 这里是存放svg图标的文件地址，custom是自定义图标库的名称
          // key as the collection name
          aminer: FileSystemIconLoader('./src/assets/images/svg', svg =>
            svg.replace(/^<svg /, '<svg fill="currentColor" ')
          )
        },
        iconCustomizer(collection, icon, props) {
          // 对自定义集合中的icon进行默认属性赋值
          // customize all icons in this collection
          if (collection === 'aminer') {
            props.width = '1em'
            props.height = '1em'
            props.fill = 'currentColor'
            props['vertical-align'] = 'middle'
          }
          // customize this icon in this collection
          if (collection === 'my-icons' && icon === 'account') {
            props.width = '6em'
            props.height = '6em'
          }
          // customize this @iconify icon in this collection
          if (collection === 'mdi' && icon === 'account') {
            props.width = '2em'
            props.height = '2em'
          }
        }
      }),
      createSvgIconsPlugin({
        // 指定需要缓存的图标文件夹
        iconDirs: [resolve(pathSrc, 'assets/icons')],
        // 指定symbolId格式
        symbolId: 'icon-[dir]-[name]'
      }),
      /**
       * 版权注释
       * @see https://github.com/chengpeiquan/vite-plugin-banner#advanced-usage
       */
      banner(
        `/**\n * name: ${pkg.name}\n * version: v${pkg.version}\n * description: ${pkg.description}\n * author: ${pkg.author}\n * lastBuildTime: ${APP_INFO.lastBuildTime}\n */`
      )
    ],
    // 开发或生产环境服务的公共基础路径,此选项也可以通过命令行参数指定（例：vite build --base=/my/public/path/）
    // base: env.NODE_ENV === 'production' ? '/maas/' : '/',
    base: '/',
    // 静态资源服务的文件夹, 默认"public"
    publicDir: 'public',
    resolve: {
      /**
       * 引入别名，同时在tsconfig.json中配置path
       * "paths": {
       *  "@/*": ["src/*"]
       * }
       */
      /**
       * 问题：引入path 和使用__dirname出现ts语法问题提示
       * 解决：tsconfig.node.json中配置"allowSyntheticDefaultImports": true
       * {
       *   "compilerOptions": {
       *     "allowSyntheticDefaultImports": true
       *   }
       * }
       */
      // 别名，在ts中需要在tsconfig.json的paths中也需要配置一下
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    // 预加载项目必需的组件
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        'axios',
        '@vueuse/core',
        'path-to-regexp',
        '@wangeditor/editor',
        '@wangeditor/editor-for-vue',
        'path-browserify',
        'element-plus/es/components/form/style/css',
        'element-plus/es/components/form-item/style/css',
        'element-plus/es/components/button/style/css',
        'element-plus/es/components/input/style/css',
        'element-plus/es/components/input-number/style/css',
        'element-plus/es/components/switch/style/css',
        'element-plus/es/components/upload/style/css',
        'element-plus/es/components/menu/style/css',
        'element-plus/es/components/col/style/css',
        'element-plus/es/components/icon/style/css',
        'element-plus/es/components/row/style/css',
        'element-plus/es/components/tag/style/css',
        'element-plus/es/components/dialog/style/css',
        'element-plus/es/components/loading/style/css',
        'element-plus/es/components/radio/style/css',
        'element-plus/es/components/radio-group/style/css',
        'element-plus/es/components/popover/style/css',
        'element-plus/es/components/scrollbar/style/css',
        'element-plus/es/components/tooltip/style/css',
        'element-plus/es/components/dropdown/style/css',
        'element-plus/es/components/dropdown-menu/style/css',
        'element-plus/es/components/dropdown-item/style/css',
        'element-plus/es/components/sub-menu/style/css',
        'element-plus/es/components/menu-item/style/css',
        'element-plus/es/components/divider/style/css',
        'element-plus/es/components/card/style/css',
        'element-plus/es/components/link/style/css',
        'element-plus/es/components/breadcrumb/style/css',
        'element-plus/es/components/breadcrumb-item/style/css',
        'element-plus/es/components/table/style/css',
        'element-plus/es/components/tree-select/style/css',
        'element-plus/es/components/table-column/style/css',
        'element-plus/es/components/select/style/css',
        'element-plus/es/components/option/style/css',
        'element-plus/es/components/pagination/style/css',
        'element-plus/es/components/tree/style/css',
        'element-plus/es/components/alert/style/css',
        'element-plus/es/components/radio-button/style/css',
        'element-plus/es/components/checkbox-group/style/css',
        'element-plus/es/components/checkbox/style/css',
        'element-plus/es/components/tabs/style/css',
        'element-plus/es/components/tab-pane/style/css',
        'element-plus/es/components/rate/style/css',
        'element-plus/es/components/date-picker/style/css',
        'element-plus/es/components/notification/style/css',
        'element-plus/es/components/image/style/css',
        'element-plus/es/components/statistic/style/css',
        'element-plus/es/components/watermark/style/css',
        'element-plus/es/components/config-provider/style/css',
        'element-plus/es/components/text/style/css',
        'element-plus/es/components/drawer/style/css',
        'element-plus/es/components/color-picker/style/css',
        'element-plus/es/components/backtop/style/css'
      ]
    },
    css: {
      postcss: {
        plugins: [
          postcssImport(),
          postcssUrl(),
          /**
           * 官方文档：https://github.com/csstools/postcss-plugins/tree/main/plugin-packs/postcss-preset-env#readme
           */
          postcssPresetEnv({
            autoprefixer: true,
            browsers: ['Android 4.1', 'iOS 7.1', 'Chrome > 31', 'ff > 31', 'ie >= 8']
          }),
          // 用于解决：warnings when minifying css:[WARNING] "@charset" must be the first rule in the file
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: atRule => {
                if (atRule.name === 'charset') atRule.remove()
              }
            }
          }
        ]
      },
      preprocessorOptions: {
        scss: {
          javascriptEnabled: true,
          additionalData: `
            @use "@/assets/styles/elementui/index.scss" as *;
          `
        }
      }
    },
    server: {
      // 允许IP访问
      host: '0.0.0.0',
      // 应用端口 (默认:3000)
      port: Number(VITE_APP_PORT),
      // 开启本地https
      https: false,
      // 运行是否自动打开浏览器
      open: true,
      hotOnly: false, // 热更新（webpack已实现了，这里false即可）
      headers: {
        // 允许开发环境跨域
        'Access-Control-Allow-Origin': '*'
      },
      proxy: {
        /** 代理前缀为 /dev-api 的请求  */
        [VITE_APP_BASE_API]: {
          changeOrigin: true,
          // 接口地址
          target: VITE_APP_API_URL,
          rewrite: path => path.replace(new RegExp(`^${VITE_APP_BASE_API}`), '')
        }
      }
    },
    build: {
      // 指定输出路径，默认'dist'
      outDir: 'dist',
      // 指定生成静态资源的存放路径(相对于build.outDir)
      assetsDir: 'assets',
      // 小于此阈值的导入或引用资源将内联为base64编码，设置为0可禁用此项。默认4096（4kb）
      assetsInlineLimit: 1024,
      // 启用/禁用CSS代码拆分，如果禁用，整个项目的所有CSS将被提取到一个CSS文件中,默认true
      cssCodeSplit: true,
      // 构建后是否生成source map文件，默认false
      sourcemap: false,
      // 为true时，会生成manifest.json文件，用于后端集成
      manifest: false,
      // chunk大小限制
      chunkSizeWarningLimit: 1500,
      // 打包构建压缩
      minify: 'terser',
      // 构建后是否关闭console/debugger
      terserOptions: {
        compress: {
          keep_infinity: true, // 防止 Infinity 被压缩成 1/0，这可能会导致 Chrome 上的性能问题
          // drop_console: command !== 'serve' || mode === 'production', // true 为关闭
          drop_debugger: command !== 'serve' || mode === 'production'
        },
        format: {
          comments: false // 删除注释
        }
      },
      // rollup的拆包配置
      rollupOptions: {
        output: {
          // 用于从入口点创建的块的打包输出格式[name]表示文件名,[hash]表示该文件内容hash值
          entryFileNames: 'js/[name].[hash].js',
          // 用于命名代码拆分时创建的共享块的输出命名
          chunkFileNames: 'js/[name].[hash].js',
          // 用于输出静态资源的命名，[ext]表示文件扩展名
          assetFileNames: assetInfo => {
            const info = assetInfo.name.split('.')
            let extType = info[info.length - 1]
            // console.log('文件信息', assetInfo.name)
            if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
              extType = 'media'
            } else if (/\.(png|jpe?g|gif|svg)(\?.*)?$/.test(assetInfo.name)) {
              extType = 'img'
            } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
              extType = 'fonts'
            }
            return `${extType}/[name].[hash].[ext]`
          }
        }
      }
    },
    define: {
      // 定义全局变量
      __INTLIFY_PROD_DEVTOOLS__: JSON.stringify(false),
      __APP_INFO__: JSON.stringify(APP_INFO)
    }
  })
}
