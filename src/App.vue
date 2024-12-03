<template>
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>

<script setup>
// element-plus 中文
import zhCn from 'element-plus/es/locale/lang/zh-cn'
</script>
