const http = require('http')

function normalizeConfig(config = {}) {
	return {
		host: String(config.host || '')
			.trim()
			.replace(/^https?:\/\//i, '')
			.replace(/\/.*$/, ''),
		port: Number(config.port) || 7878,
		token: String(config.token || '').trim(),
	}
}

function remainingMs(state, now = Date.now()) {
	if (!state) return 0
	if (state.mode === 'countup') {
		return state.running
			? (Number(state.elapsedMs) || 0) + (now - (Number(state.startAt) || now))
			: Number(state.elapsedMs) || 0
	}
	if (state.mode === 'clock') return 0
	const value = state.running ? (Number(state.endAt) || now) - now : Number(state.remMs) || 0
	return state.overtime === false ? Math.max(0, value) : value
}

function formatSeconds(seconds, negative = false) {
	const value = Math.max(0, Math.floor(seconds))
	const hours = Math.floor(value / 3600)
	const minutes = Math.floor((value % 3600) / 60)
	const secs = value % 60
	const pad = (number) => String(number).padStart(2, '0')
	return `${negative ? '-' : ''}${hours > 0 ? `${hours}:${pad(minutes)}:${pad(secs)}` : `${minutes}:${pad(secs)}`}`
}

function formatTime(state, now = Date.now()) {
	if (!state) return '--:--'
	if (state.mode === 'clock') {
		const date = new Date(now)
		return [date.getHours(), date.getMinutes(), date.getSeconds()]
			.map((value) => String(value).padStart(2, '0'))
			.join(':')
	}
	const milliseconds = remainingMs(state, now)
	if (state.mode === 'countup') return formatSeconds(milliseconds / 1000)
	return milliseconds >= 0
		? formatSeconds(Math.ceil(milliseconds / 1000))
		: formatSeconds(Math.floor(-milliseconds / 1000), true)
}

function timerPhase(state, now = Date.now()) {
	if (!state || state.mode !== 'countdown') return 'normal'
	const milliseconds = remainingMs(state, now)
	if (milliseconds < 0) return 'overtime'
	if (!state.useWarnColors) return 'normal'
	if (milliseconds <= (Number(state.redSec) || 0) * 1000) return 'red'
	if (milliseconds <= (Number(state.yellowSec) || 0) * 1000) return 'yellow'
	return 'normal'
}

function stateVariables(state, connected, now = Date.now()) {
	const cueIndex = Number.isInteger(state && state.currentCue) ? state.currentCue : -1
	const cues = Array.isArray(state && state.cues) ? state.cues : []
	const current = cueIndex >= 0 ? cues[cueIndex] : null
	const next = cueIndex >= -1 ? cues[cueIndex + 1] : null
	const milliseconds = remainingMs(state, now)
	return {
		time: formatTime(state, now),
		remaining_seconds:
			state && state.mode === 'countdown' ? Math.ceil(milliseconds / 1000) : Math.floor(milliseconds / 1000),
		running: state && state.running ? 'true' : 'false',
		mode: (state && state.mode) || 'countdown',
		phase: timerPhase(state, now),
		blackout: state && state.blackout ? 'true' : 'false',
		connected: connected ? 'true' : 'false',
		current_cue: current ? cueIndex + 1 : 0,
		total_cues: cues.length,
		current_cue_name: (current && current.name) || '',
		next_cue_name: (next && next.name) || '',
		message: (state && state.message && state.message.text) || '',
		on_screen_text: (state && state.text) || '',
	}
}

function parseSseFrame(frame) {
	const data = frame
		.split(/\r?\n/)
		.filter((line) => line.startsWith('data:'))
		.map((line) => line.slice(5).trimStart())
		.join('\n')
	if (!data) return null
	return JSON.parse(data)
}

class ProTimerClient {
	constructor(options = {}) {
		this.onState = options.onState || (() => {})
		this.onStatus = options.onStatus || (() => {})
		this.log = options.log || (() => {})
		this.reconnectMs = options.reconnectMs || 3000
		this.timeoutMs = options.timeoutMs || 3000
		this.http = options.http || http
		this.config = normalizeConfig()
		this.request = null
		this.response = null
		this.reconnectTimer = null
		this.generation = 0
		this.stopped = true
		this.authFailed = false
	}

	start(config) {
		this.stop()
		this.config = normalizeConfig(config)
		this.stopped = false
		this.authFailed = false
		this.generation += 1
		if (!this.config.host || !this.config.token) {
			this.onStatus('bad-config', 'Enter the ProTimer host and session token')
			return
		}
		this.connect(this.generation)
	}

	stop() {
		this.stopped = true
		this.generation += 1
		if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
		this.reconnectTimer = null
		if (this.response) this.response.destroy()
		if (this.request) this.request.destroy()
		this.response = null
		this.request = null
	}

	connect(generation) {
		if (this.stopped || generation !== this.generation) return
		this.onStatus('connecting')
		let buffer = ''
		const request = this.http.get(
			{ host: this.config.host, port: this.config.port, path: '/events', timeout: this.timeoutMs },
			(response) => {
				if (this.stopped || generation !== this.generation) {
					response.destroy()
					return
				}
				this.response = response
				if (response.statusCode !== 200) {
					response.resume()
					this.onStatus('connection-failure', `ProTimer events returned HTTP ${response.statusCode}`)
					this.scheduleReconnect(generation)
					return
				}
				if (!this.authFailed) this.onStatus('ok')
				response.setEncoding('utf8')
				response.on('data', (chunk) => {
					buffer += chunk
					let boundary = buffer.search(/\r?\n\r?\n/)
					while (boundary >= 0) {
						const frame = buffer.slice(0, boundary)
						const separator = buffer.slice(boundary).match(/^\r?\n\r?\n/)[0]
						buffer = buffer.slice(boundary + separator.length)
						try {
							const state = parseSseFrame(frame)
							if (state) this.onState(state)
						} catch (error) {
							this.log('warn', `Ignored invalid ProTimer state: ${error.message}`)
						}
						boundary = buffer.search(/\r?\n\r?\n/)
					}
				})
				response.on('end', () => this.scheduleReconnect(generation))
				response.on('error', () => this.scheduleReconnect(generation))
			},
		)
		this.request = request
		request.on('timeout', () => request.destroy(new Error('Connection timed out')))
		request.on('error', (error) => {
			if (this.stopped || generation !== this.generation) return
			this.onStatus('connection-failure', error.message)
			this.scheduleReconnect(generation)
		})
	}

	scheduleReconnect(generation) {
		if (this.stopped || generation !== this.generation || this.reconnectTimer) return
		this.response = null
		this.request = null
		this.onStatus('connection-failure', 'ProTimer connection closed; retrying')
		this.reconnectTimer = setTimeout(() => {
			this.reconnectTimer = null
			this.connect(generation)
		}, this.reconnectMs)
	}

	sendCommand(type, value) {
		return new Promise((resolve) => {
			if (!this.config.host || !this.config.token) {
				this.onStatus('bad-config', 'Enter the ProTimer host and session token')
				resolve(false)
				return
			}
			const query = new URLSearchParams({ type, t: this.config.token })
			if (value !== undefined && value !== null && value !== '') query.set('value', String(value))
			const request = this.http.get(
				{ host: this.config.host, port: this.config.port, path: `/cmd?${query}`, timeout: this.timeoutMs },
				(response) => {
					response.resume()
					if (response.statusCode === 200) {
						this.authFailed = false
						this.onStatus('ok')
						resolve(true)
					} else if (response.statusCode === 403) {
						this.authFailed = true
						this.onStatus('authentication-failure', 'The ProTimer session token is no longer valid')
						resolve(false)
					} else {
						this.onStatus('connection-failure', `ProTimer returned HTTP ${response.statusCode} for ${type}`)
						resolve(false)
					}
				},
			)
			request.on('timeout', () => request.destroy(new Error('Command timed out')))
			request.on('error', (error) => {
				this.onStatus('connection-failure', error.message)
				resolve(false)
			})
		})
	}
}

module.exports = {
	ProTimerClient,
	formatTime,
	normalizeConfig,
	parseSseFrame,
	remainingMs,
	stateVariables,
	timerPhase,
}
