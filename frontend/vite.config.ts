import react from '@vitejs/plugin-react'
import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'

/**
 * While `npm run dev` runs, keeps the live data fresh the way the hourly GitHub Action does on
 * the site: fires and air sensors every hour, the GFS forecast every six hours. Needs Python with
 * numpy; if it is missing the site simply shows the last data it has.
 */
function liveData(): Plugin {
  const root = resolve(__dirname, '..')
  const script = resolve(root, 'data-pipeline', 'build_live.py')
  const manifest = resolve(__dirname, 'public', 'data', 'live', 'manifest.json')
  let running = false
  const age = (part: 'weather' | 'fires'): number => {
    try {
      const m = JSON.parse(readFileSync(manifest, 'utf8'))
      if (!m[part]) return Infinity
      return (Date.now() - Date.parse(m.built)) / 3600_000
    } catch {
      return Infinity
    }
  }
  const run = (log: (msg: string) => void) => {
    if (running) return
    const gfs = age('weather') >= 6
    if (age('fires') < 1 && !gfs) return
    running = true
    log(`live data: refreshing ${gfs ? 'forecast, fires and air' : 'fires and air'}…`)
    const child = spawn(process.platform === 'win32' ? 'python' : 'python3', [script, ...(gfs ? [] : ['--no-gfs'])], { cwd: root, stdio: 'ignore' })
    child.on('error', () => (running = false))
    child.on('exit', (code) => {
      running = false
      log(code === 0 ? 'live data: updated' : `live data: the script stopped (${code})`)
    })
  }
  return {
    name: 'esd-live-data',
    apply: 'serve',
    configureServer(server) {
      if (!existsSync(script)) return
      const log = (msg: string) => server.config.logger.info(msg, { timestamp: true })
      run(log)
      const id = setInterval(() => run(log), 10 * 60_000)
      server.httpServer?.on('close', () => clearInterval(id))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the site from /<repository>/; the deploy workflow sets VITE_BASE.
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), liveData()],
  server: {
    // Opens the browser at whatever port Vite ends up on (5173, or 5174 if 5173 is busy).
    open: true,
  },
})
