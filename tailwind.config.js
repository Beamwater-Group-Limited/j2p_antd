/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{html,js,jsx,ts,tsx}'
    ],
    theme: {
        extend: {
            animation: {
                'breathe': 'breathe 2s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.3, 0, 0.7, 1) infinite',
            },
            keyframes: {
                breathe: {
                    '0%, 100%': {
                        boxShadow: '0 0 5px rgba(239,68,68,0.6), 0 0 10px rgba(239,68,68,0.4), 0 0 0 2px rgba(239,68,68,0.7)'
                    },
                    '50%': {
                        boxShadow: '0 0 15px rgba(239,68,68,0.9), 0 0 30px rgba(239,68,68,0.7), 0 0 0 2px rgba(239,68,68,1)'
                    }
                }
            }

        },
    },
    plugins: [],
    safelist: [
        // ===================== 尺寸类 =====================
        'h-2', 'h-3', 'h-4', 'h-5', 'h-6', 'h-7', 'h-8', 'h-9', 'h-10', 'h-12', 'h-14', 'h-16', 'h-20', 'h-24', 'h-32', 'h-36', 'h-40', 'h-48', 'h-56', 'h-60', 'h-72', 'h-80', 'h-96', 'h-auto', 'h-full', 'h-screen', 'h-1/2', 'h-1/3', 'h-2/3', 'h-3/5', 'h-4/5', 'h-[712px]', 'h-[500px]', 'h-[300px]', 'h-[200px]',
        'w-2', 'w-3', 'w-4', 'w-5', 'w-6', 'w-7', 'w-8', 'w-9', 'w-10', 'w-12', 'w-14', 'w-16', 'w-20', 'w-24', 'w-32', 'w-48', 'w-64', 'w-72', 'w-80', 'w-96', 'w-60', 'w-75', 'w-auto', 'w-full', 'w-screen', 'w-1/2', 'w-1/3', 'w-2/3', 'w-3/4', 'w-3/5', 'w-4/5', 'w-[500px]', 'w-[400px]', 'w-[300px]', 'w-[200px]',
        'min-h-0', 'min-h-full', 'min-h-screen', '!min-h-screen',
        'min-w-0', 'min-w-full', 'min-w-[200px]',
        'max-h-full', 'max-h-screen', 'max-h-[500px]',
        'max-w-full', 'max-w-screen', 'max-w-[800px]', 'max-w-md', 'max-w-lg', 'max-w-xl',

        // ===================== 背景类 =====================
        'bg-cover', 'bg-contain', 'bg-center', 'bg-top', 'bg-bottom', 'bg-left', 'bg-right', 'contents',
        // 修复 URL 引号：用单引号包裹，避免嵌套双引号
        'bg-[url(\'https://tse1-mm.cn.bing.net/th/id/OIP-C.XS6EtBzAmWWa31cfFvcx6QHaHa?w=177&h=180&c=7&r=0&o=7&pid=1.7&rm=3\')]',
        // 基础色
        'bg-white', 'bg-black', 'bg-gray-50', 'bg-gray-100', 'bg-gray-200', 'bg-gray-300', 'bg-gray-400', 'bg-gray-500', 'bg-gray-600', 'bg-gray-700', 'bg-gray-800', 'bg-gray-900', 'bg-gray-950',
        // 蓝色系
        'bg-blue-50', 'bg-blue-100', 'bg-blue-200', 'bg-blue-300', 'bg-blue-400', 'bg-blue-500', 'bg-blue-600', 'bg-blue-700', 'bg-blue-800', 'bg-blue-900', 'bg-blue-950',
        // 红色系
        'bg-red-50', 'bg-red-100', 'bg-red-200', 'bg-red-300', 'bg-red-400', 'bg-red-500', 'bg-red-600', 'bg-red-700', 'bg-red-800', 'bg-red-900', 'bg-red-950',
        // 绿色系
        'bg-green-50', 'bg-green-100', 'bg-green-200', 'bg-green-300', 'bg-green-400', 'bg-green-500', 'bg-green-600', 'bg-green-700', 'bg-green-800', 'bg-green-900', 'bg-green-950',
        // 橙色系
        'bg-orange-50', 'bg-orange-100', 'bg-orange-200', 'bg-orange-300', 'bg-orange-400', 'bg-orange-500', 'bg-orange-600', 'bg-orange-700', 'bg-orange-800', 'bg-orange-900', 'bg-orange-950',
        // 黄色系
        'bg-yellow-50', 'bg-yellow-100', 'bg-yellow-200', 'bg-yellow-300', 'bg-yellow-400', 'bg-yellow-500', 'bg-yellow-600', 'bg-yellow-700', 'bg-yellow-800', 'bg-yellow-900', 'bg-yellow-950',
        // 紫色系
        'bg-purple-50', 'bg-purple-100', 'bg-purple-200', 'bg-purple-300', 'bg-purple-400', 'bg-purple-500', 'bg-purple-600', 'bg-purple-700', 'bg-purple-800', 'bg-purple-900', 'bg-purple-950',
        // 粉色系
        'bg-pink-50', 'bg-pink-100', 'bg-pink-200', 'bg-pink-300', 'bg-pink-400', 'bg-pink-500', 'bg-pink-600', 'bg-pink-700', 'bg-pink-800', 'bg-pink-900', 'bg-pink-950',
        // 青色系
        'bg-cyan-50', 'bg-cyan-100', 'bg-cyan-200', 'bg-cyan-300', 'bg-cyan-400', 'bg-cyan-500', 'bg-cyan-600', 'bg-cyan-700', 'bg-cyan-800', 'bg-cyan-900', 'bg-cyan-950',
        // 半透明背景
        'bg-black/50', 'bg-black/20', 'bg-white/80', 'bg-white/50', 'bg-red-500/80', 'bg-blue-600/80', 'bg-gray-700/80', 'bg-gray-500/30',

        // ===================== 文字类 =====================
        // 文字颜色
        'text-white', 'text-black',
        'text-gray-300', 'text-gray-400', 'text-gray-500', 'text-gray-600', 'text-gray-700', 'text-gray-800', 'text-gray-900',
        'text-blue-400', 'text-blue-500', 'text-blue-600', 'text-blue-700', 'text-blue-800',
        'text-red-200', 'text-red-400', 'text-red-500', 'text-red-600', 'text-red-700',
        'text-green-400', 'text-green-500', 'text-green-600', 'text-green-700',
        'text-orange-400', 'text-orange-500', 'text-orange-600',
        'text-yellow-400', 'text-yellow-500', 'text-yellow-600',
        'text-purple-400', 'text-purple-500', 'text-purple-600',
        'text-pink-400', 'text-pink-500', 'text-pink-600',
        'text-cyan-400', 'text-cyan-500', 'text-cyan-600',
        // 文字 hover 颜色
        'hover:text-white', 'hover:text-black', 'hover:text-blue-500', 'hover:text-blue-600', 'hover:text-red-500', 'hover:text-green-500', 'hover:text-gray-700',
        // 文字大小
        'text-9xl', 'text-8xl', 'text-7xl', 'text-6xl', 'text-5xl', 'text-4xl', 'text-3xl', 'text-2xl', 'text-xl', 'text-lg', 'text-md', 'text-sm', 'text-xs', 'text-[10px]', 'text-[12px]', 'text-[14px]', 'text-[16px]', 'text-[18px]',
        // 文字排版
        'text-center', 'text-left', 'text-right', 'text-justify',
        'font-bold', 'font-medium', 'font-normal', 'font-light', 'font-thin', 'font-semibold',
        'leading-none', 'leading-tight', 'leading-snug', 'leading-normal', 'leading-relaxed', 'leading-loose',
        'tracking-tighter', 'tracking-tight', 'tracking-normal', 'tracking-wide', 'tracking-wider', 'tracking-widest',
        'uppercase', 'lowercase', 'capitalize', 'normal-case',
        'italic', 'not-italic',
        'underline', 'line-through', 'no-underline',

        // ===================== 缩进类 =====================
        'indent-0', 'indent-2', 'indent-4', 'indent-6', 'indent-8', 'indent-10', 'indent-12',

        // ===================== 边框类 =====================
        // 边框颜色
        'border-white', 'border-black',
        'border-gray-100', 'border-gray-200', 'border-gray-300', 'border-gray-400', 'border-gray-500', 'border-gray-600',
        'border-blue-300', 'border-blue-400', 'border-blue-500', 'border-blue-800', 'border-blue-900', 'border-blue-950',
        'border-red-300', 'border-red-400', 'border-red-500', 'border-red-600',
        'border-green-400', 'border-green-500', 'border-green-600', 'border-green-800', 'border-green-900',
        'border-orange-300', 'border-orange-400', 'border-orange-500',
        'border-yellow-300', 'border-yellow-400', 'border-yellow-500',
        'border-purple-300', 'border-purple-400', 'border-purple-500',
        'border-pink-300', 'border-pink-400', 'border-pink-500',
        // 边框样式
        'border', 'border-dashed', 'border-dotted', 'border-double', 'border-none',
        'border-t', 'border-r', 'border-b', 'border-l', 'border-x', 'border-y',
        'border-l-2', 'border-l-4', 'border-r-2', 'border-r-4', 'border-t-2', 'border-b-2',
        'border-0', 'border-2', 'border-3', 'border-4', 'border-8', // 移除非法的 border-1
        // 边框状态
        'hover:border-blue-500', 'focus:border-blue-500', 'active:border-gray-400',

        // ===================== 布局类 =====================
        'inline-block', 'block', 'inline', 'hidden', 'flex', 'inline-flex', 'flex-col', 'flex-row', 'flex-row-reverse', 'flex-col-reverse',
        'flex-1', 'flex-auto', 'flex-initial', 'flex-none',
        'items-start', 'items-center', 'items-end', 'items-baseline', 'items-stretch',
        'justify-start', 'justify-center', 'justify-end', 'justify-between', 'justify-around', 'justify-evenly', 'justify-items-center',
        'content-start', 'content-center', 'content-end', 'content-between', 'content-around',
        'self-auto', 'self-start', 'self-center', 'self-end', 'self-stretch',
        'grid', 'inline-grid', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5', 'grid-cols-6', 'grid-cols-12',
        'grid-rows-1', 'grid-rows-2', 'grid-rows-3', 'grid-rows-4',
        'col-span-1', 'col-span-2', 'col-span-3', 'col-span-4', 'col-span-6', 'col-span-12',
        'row-span-1', 'row-span-2', 'row-span-3',
        'gap-0', 'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-5', 'gap-6', 'gap-8', 'gap-10', 'gap-12',
        'gap-x-0', 'gap-x-2', 'gap-x-4', 'gap-y-0', 'gap-y-2', 'gap-y-4',
        'relative', 'absolute', 'fixed', 'sticky',
        'aspect-auto', 'aspect-square', 'aspect-video', 'aspect-[4/3]', 'aspect-[16/9]',

        // ===================== 内外边距类 =====================
        // 通用边距
        'm-0', 'm-1', 'm-2', 'm-3', 'm-4', 'm-5', 'm-6', 'm-8', 'm-10', 'm-12', 'm-16', 'm-20', 'm-24', 'm-auto',
        'mx-0', 'mx-1', 'mx-2', 'mx-3', 'mx-4', 'mx-5', 'mx-6', 'mx-8', 'mx-auto',
        'my-0', 'my-1', 'my-2', 'my-3', 'my-4', 'my-5', 'my-6', 'my-8', 'my-auto',
        'mt-0', 'mt-1', 'mt-2', 'mt-3', 'mt-4', 'mt-5', 'mt-6', 'mt-8', 'mt-10', 'mt-12',
        'mr-0', 'mr-1', 'mr-2', 'mr-3', 'mr-4', 'mr-5', 'mr-6', 'mr-8', 'mr-10', 'mr-12',
        'mb-0', 'mb-1', 'mb-2', 'mb-3', 'mb-4', 'mb-5', 'mb-6', 'mb-8', 'mb-10', 'mb-12',
        'ml-0', 'ml-1', 'ml-2', 'ml-3', 'ml-4', 'ml-5', 'ml-6', 'ml-8', 'ml-10', 'ml-12',
        // 通用内边距
        'p-0', 'p-px', 'p-0.5', 'p-1', 'p-2', 'p-3', 'p-4', 'p-5', 'p-6', 'p-8', 'p-10', 'p-12',
        'px-0', 'px-1', 'px-1.5', 'px-2', 'px-3', 'px-4', 'px-5', 'px-6', 'px-8', 'px-10',
        'py-0', 'py-0.5', 'py-1', 'py-2', 'py-3', 'py-4', 'py-5', 'py-6', 'py-8',
        'pt-0', 'pt-1', 'pt-2', 'pt-3', 'pt-4', 'pt-6',
        'pr-0', 'pr-1', 'pr-2', 'pr-3', 'pr-4', 'pr-6',
        'pb-0', 'pb-1', 'pb-2', 'pb-3', 'pb-4', 'pb-6',
        'pl-0', 'pl-1', 'pl-2', 'pl-3', 'pl-4', 'pl-6',

        // ===================== 阴影/圆角类 =====================
        // 阴影
        'shadow-none', 'shadow-sm', 'shadow', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl', 'shadow-inner', 'shadow-outline',
        'shadow-[0_0_3px_rgba(59,130,246,0.7), 0_0_6px_rgba(59,130,246,0.5)]', 'shadow-[0_2px_4px_rgba(0,0,0,0.1)]',
        'hover:shadow-md', 'hover:shadow-lg', 'focus:shadow-outline',
        // 圆角
        'rounded-none', 'rounded-sm', 'rounded', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-3xl', 'rounded-full',
        'rounded-t', 'rounded-r', 'rounded-b', 'rounded-l', 'rounded-tl', 'rounded-tr', 'rounded-bl', 'rounded-br',
        '!rounded-button', 'rounded-button',
        'hover:rounded-lg', 'focus:rounded-md',

        // ===================== 文本排版类 =====================
        'whitespace-normal', 'whitespace-nowrap', 'whitespace-pre', 'whitespace-pre-line', 'whitespace-pre-wrap',
        'no-header-color',
        'break-normal', 'break-words', 'break-all',
        'space-x-0', 'space-x-1', 'space-x-2', 'space-x-3', 'space-x-4', 'space-x-6', 'space-x-8',
        'space-y-0', 'space-y-1', 'space-y-2', 'space-y-3', 'space-y-4', 'space-y-6', 'space-y-8',
        'overflow-ellipsis', 'text-ellipsis',

        // ===================== 溢出/对象适配类 =====================
        'overflow-visible', 'overflow-hidden', 'overflow-auto', 'overflow-scroll',
        'overflow-x-visible', 'overflow-x-hidden', 'overflow-x-auto', 'overflow-x-scroll',
        'overflow-y-visible', 'overflow-y-hidden', 'overflow-y-auto', 'overflow-y-scroll',
        'object-contain', 'object-cover', 'object-fill', 'object-fit', 'object-none', 'object-scale-down',
        'align-baseline', 'align-top', 'align-middle', 'align-bottom', 'align-text-top', 'align-text-bottom',

        // ===================== 定位类 =====================
        'top-0', 'top-1', 'top-2', 'top-4', 'top-6', 'top-8', 'top-10', 'top-1/2', 'top-full', 'top-[-200px]',
        'right-0', 'right-1', 'right-2', 'right-4', 'right-6', 'right-8', 'right-10', 'right-1/2', 'right-full',
        'bottom-0', 'bottom-1', 'bottom-2', 'bottom-4', 'bottom-6', 'bottom-8', 'bottom-10', 'bottom-1/2', 'bottom-full',
        'left-0', 'left-1', 'left-2', 'left-4', 'left-6', 'left-8', 'left-10', 'left-1/2', 'left-full',
        'inset-0', 'inset-x-0', 'inset-x-2', 'inset-y-0', 'inset-y-2',
        'z-0', 'z-10', 'z-20', 'z-30', 'z-40', 'z-50', 'z-90', 'z-95', 'z-100', 'z-auto',
        'translate-x-0', 'translate-x-1/2', 'translate-y-0', 'translate-y-1/2',
        'transform', 'scale-90', 'scale-100', 'scale-105', 'scale-110',
        'hover:translate-y-[-2px]', 'active:translate-y-0',

        // ===================== 透明度类 =====================
        'opacity-0', 'opacity-5', 'opacity-10', 'opacity-20', 'opacity-25', 'opacity-30', 'opacity-40', 'opacity-50', 'opacity-60', 'opacity-70', 'opacity-75', 'opacity-80', 'opacity-90', 'opacity-100',
        'hover:opacity-80', 'hover:opacity-90', 'hover:opacity-100', 'active:opacity-90',

        // ===================== 动画/过渡/交互类 =====================
        // 动画
        'animate-none', 'animate-spin', 'animate-pulse', 'animate-bounce', 'animate-breath', 'animate-fade-in', 'animate-slide-in',
        // 过渡
        'transition-none', 'transition-all', 'transition-colors', 'transition-bg', 'transition-border', 'transition-shadow', 'transition-transform',
        'duration-75', 'duration-100', 'duration-150', 'duration-200', 'duration-300', 'duration-500', 'duration-700', 'duration-1000',
        'ease-linear', 'ease-in', 'ease-out', 'ease-in-out',
        // 光标
        'cursor-auto', 'cursor-default', 'cursor-pointer', 'cursor-move', 'cursor-wait', 'cursor-text', 'cursor-not-allowed',
        // 交互状态
        'hover:bg-blue-50', 'hover:bg-gray-50', 'hover:bg-red-50', 'hover:bg-green-50',
        'hover:bg-red-500', 'hover:bg-gray-700', 'hover:bg-blue-600', 'hover:bg-white', 'hover:bg-black',
        'focus:outline-none', 'focus:ring-1', 'focus:ring-2', 'focus:ring-blue-500', 'focus:ring-red-500',
        'active:bg-gray-100', 'active:bg-blue-100',
        'disabled:opacity-50', 'disabled:cursor-not-allowed',
        // 显示隐藏
        'visible', 'invisible',
        'opacity-0', 'hover:opacity-100',
        // 旋转
        'rotate-0', 'rotate-90', 'rotate-180', 'rotate-270', 'rotate-[-90deg]',
        'hover:rotate-12', 'hover:rotate-[-12deg]' // 最后一项去掉多余逗号
    ]
}
//
// {
//   pattern: /^text-(red|yellow|blue|green)-(100|200|300|500|600)$/,
//       variants: ['hover', 'focus'],
// },
// {
//   pattern: /^bg-(gray|blue)-(100|200|300|400)$/,
// }
// {
//   pattern: /./,
// },
