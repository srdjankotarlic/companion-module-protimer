const { InstanceBase, InstanceStatus, runEntrypoint, Regex, combineRgb } = require('@companion-module/base')
const http = require('http')

class ProTimerInstance extends InstanceBase {
	async init(config) {
		this.config = config
		this.state = null
		this.sseReq = null
		this.tick = null

		this.setActionDefinitions(this.buildActions())
		this.setFeedbackDefinitions(this.buildFeedbacks())
		this.setVariableDefinitions([
			{ variableId: 'time', name: 'Time on screen (remaining / elapsed / clock)' },
			{ variableId: 'running', name: 'Timer running (true/false)' },
			{ variableId: 'mode', name: 'Timer mode (countdown/countup/clock)' },
			{ variableId: 'blackout', name: 'Blackout active (true/false)' },
		])

		this.connectSSE()
		// osveži $(protimer:time) svake sekunde dok tajmer radi
		this.tick = setInterval(() => this.updateTimeVariable(), 1000)
	}

	async destroy() {
		if (this.tick) clearInterval(this.tick)
		if (this.sseReq) this.sseReq.destroy()
	}

	async configUpdated(config) {
		this.config = config
		if (this.sseReq) this.sseReq.destroy()
		this.connectSSE()
	}

	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'ProTimer',
				value:
					'ProTimer must be running on a computer on the same network. ' +
					'Copy the host, port and token from ProTimer’s network panel (the API row shows the token as t=…).',
			},
			{ type: 'textinput', id: 'host', label: 'Host (IP of the ProTimer computer)', width: 8, regex: Regex.HOSTNAME, default: '127.0.0.1' },
			{ type: 'number', id: 'port', label: 'Port', width: 4, min: 1, max: 65535, default: 7878 },
			{ type: 'textinput', id: 'token', label: 'Token (t=… from the API link in ProTimer)', width: 12, default: '' },
		]
	}

	// ---------------- HTTP komanda ----------------
	sendCmd(type, value) {
		const q = new URLSearchParams({ type, t: this.config.token || '' })
		if (value !== undefined && value !== null && value !== '') q.set('value', String(value))
		const url = `http://${this.config.host}:${this.config.port}/cmd?${q}`
		http
			.get(url, (res) => {
				res.resume()
				if (res.statusCode === 403) this.updateStatus(InstanceStatus.AuthenticationFailure, 'Bad token')
				else if (res.statusCode !== 200) this.log('warn', `ProTimer replied ${res.statusCode} for ${type}`)
			})
			.on('error', (err) => {
				this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
			})
	}

	// ---------------- SSE (živo stanje → feedbacks + varijable) ----------------
	connectSSE() {
		if (!this.config || !this.config.host) {
			this.updateStatus(InstanceStatus.BadConfig, 'Missing host')
			return
		}
		this.updateStatus(InstanceStatus.Connecting)
		let buf = ''
		this.sseReq = http
			.get(`http://${this.config.host}:${this.config.port}/events`, (res) => {
				this.updateStatus(InstanceStatus.Ok)
				res.setEncoding('utf8')
				res.on('data', (chunk) => {
					buf += chunk
					let idx
					while ((idx = buf.indexOf('\n\n')) >= 0) {
						const frame = buf.slice(0, idx)
						buf = buf.slice(idx + 2)
						const m = frame.match(/^data: (.*)$/m)
						if (m) {
							try {
								this.state = JSON.parse(m[1])
								this.onState()
							} catch (e) {}
						}
					}
				})
				res.on('end', () => this.scheduleReconnect())
			})
			.on('error', (err) => {
				this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
				this.scheduleReconnect()
			})
	}

	scheduleReconnect() {
		if (this.reconnT) return
		this.reconnT = setTimeout(() => {
			this.reconnT = null
			this.connectSSE()
		}, 3000)
	}

	onState() {
		const s = this.state
		this.setVariableValues({
			running: s.running ? 'true' : 'false',
			mode: s.mode || 'countdown',
			blackout: s.blackout ? 'true' : 'false',
		})
		this.updateTimeVariable()
		this.checkFeedbacks('running', 'blackout')
	}

	updateTimeVariable() {
		const s = this.state
		if (!s) return
		let text = '--:--'
		const pad = (n) => String(n).padStart(2, '0')
		const fmt = (sec, neg) => {
			const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), x = sec % 60
			return (neg ? '-' : '') + (h > 0 ? `${h}:${pad(m)}:${pad(x)}` : `${m}:${pad(x)}`)
		}
		const now = Date.now()
		if (s.mode === 'clock') {
			const d = new Date()
			text = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
		} else if (s.mode === 'countup') {
			const el = s.running ? (s.elapsedMs || 0) + (now - (s.startAt || now)) : s.elapsedMs || 0
			text = fmt(Math.floor(el / 1000), false)
		} else {
			const rem = s.running ? (s.endAt || 0) - now : s.remMs || 0
			text = rem >= 0 ? fmt(Math.ceil(rem / 1000), false) : fmt(Math.floor(-rem / 1000), true)
		}
		this.setVariableValues({ time: text })
	}

	// ---------------- Akcije ----------------
	buildActions() {
		const send = (type) => (event) => this.sendCmd(type)
		return {
			start: { name: 'Start / Pause', options: [], callback: send('start') },
			reset: { name: 'Reset', options: [], callback: send('reset') },
			go: { name: 'GO (next cue)', options: [], callback: send('go') },
			blackout: { name: 'Blackout (toggle)', options: [], callback: send('blackout') },
			adjust: {
				name: 'Adjust time (± seconds)',
				options: [{ type: 'number', id: 'sec', label: 'Seconds (e.g. 60 or -60)', default: 60, min: -3600, max: 3600 }],
				callback: (event) => this.sendCmd('adjust', event.options.sec),
			},
			setDuration: {
				name: 'Set duration (minutes)',
				options: [{ type: 'number', id: 'min', label: 'Minutes', default: 10, min: 0.1, max: 600 }],
				callback: (event) => this.sendCmd('setDuration', Math.round(event.options.min * 60000)),
			},
			message: {
				name: 'Message to speaker',
				options: [{ type: 'textinput', id: 'text', label: 'Message', default: 'WRAP UP' }],
				callback: (event) => this.sendCmd('message', event.options.text),
			},
			clearMessage: { name: 'Clear speaker message', options: [], callback: send('clearMessage') },
			text: {
				name: 'Text on screen',
				options: [{ type: 'textinput', id: 'text', label: 'Text', default: 'BREAK' }],
				callback: (event) => this.sendCmd('text', event.options.text),
			},
			clearText: { name: 'Clear on-screen text', options: [], callback: send('clearText') },
			mode: {
				name: 'Set mode',
				options: [
					{
						type: 'dropdown',
						id: 'mode',
						label: 'Mode',
						default: 'countdown',
						choices: [
							{ id: 'countdown', label: 'Countdown' },
							{ id: 'countup', label: 'Stopwatch' },
							{ id: 'clock', label: 'Clock' },
						],
					},
				],
				callback: (event) => this.sendCmd('mode', event.options.mode),
			},
		}
	}

	// ---------------- Feedbacks ----------------
	buildFeedbacks() {
		return {
			running: {
				type: 'boolean',
				name: 'Timer is running',
				defaultStyle: { bgcolor: combineRgb(0, 153, 51), color: combineRgb(255, 255, 255) },
				options: [],
				callback: () => !!(this.state && this.state.running),
			},
			blackout: {
				type: 'boolean',
				name: 'Blackout is active',
				defaultStyle: { bgcolor: combineRgb(204, 0, 0), color: combineRgb(255, 255, 255) },
				options: [],
				callback: () => !!(this.state && this.state.blackout),
			},
		}
	}
}

runEntrypoint(ProTimerInstance, [])
