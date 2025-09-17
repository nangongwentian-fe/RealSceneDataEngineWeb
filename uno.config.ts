import { defineConfig } from 'unocss'
import presetUno from '@unocss/preset-uno'
import presetAttributify from '@unocss/preset-attributify'

export default defineConfig({
    presets: [
        presetUno(),
        presetAttributify(),
    ],
    theme: {
        breakpoints: {
            'xs': '375px',
            'sm': '640px',
            'md': '768px',
            'lg': '1024px',
            'xl': '1280px',
            '2xl': '1536px',
        },
    },
    rules: [
        // 移动端安全区域
        ['pt-safe', { 'padding-top': 'env(safe-area-inset-top)' }],
        ['pb-safe', { 'padding-bottom': 'env(safe-area-inset-bottom)' }],
        ['pl-safe', { 'padding-left': 'env(safe-area-inset-left)' }],
        ['pr-safe', { 'padding-right': 'env(safe-area-inset-right)' }],
        // 移动端触摸优化
        ['touch-manipulation', { 'touch-action': 'manipulation' }],
        ['touch-none', { 'touch-action': 'none' }],
        // 移动端字体大小调整
        ['text-size-adjust-none', { '-webkit-text-size-adjust': 'none', 'text-size-adjust': 'none' }],
    ],
    shortcuts: {
        // 移动端容器
        'mobile-container': 'w-full px-4 mx-auto max-w-screen-xl',
        // 移动端卡片
        'mobile-card': 'bg-white rounded-lg shadow-sm border border-gray-200',
        // 移动端按钮
        'mobile-btn': 'touch-manipulation select-none',
        // 移动端输入框
        'mobile-input': 'touch-manipulation text-16px',
    },
})