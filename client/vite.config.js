import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  return {
    plugins: [react()],
    envDir: '../',
    //base: command === 'build' ? '/Board-Management/' : '/',
    base: '/',
  }
})