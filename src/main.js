const { InstanceBase, InstanceStatus, Regex, runEntrypoint } = require('@companion-module/base')
const { buildActions } = require('./actions')
const { buildFeedbacks } = require('./feedbacks')
const { buildPresets } = require('./presets')
const { ProTimerClient, stateVariables, timerPhase } = require('./protimer-client')
const { VARIABLE_DEFINITIONS } = require('./variables')
const UpgradeScripts = require('./upgrades')

const STATUS_MAP = {
	ok: InstanceStatus.Ok,
	connecting: InstanceStatus.Connecting,
	'bad-config': InstanceStatus.BadConfig,
	'authentication-failure': InstanceStatus.AuthenticationFailure,
	'connection-failure': InstanceStatus.ConnectionFailure,
}

class ProTimerInstance extends InstanceBase {
	async init(config) {
		this.config = config
		this.state = null
		this.connected = false
		this.client = new ProTimerClient({
			onState: (state) => this.onState(state),
			onStatus: (status, message) => this.onClientStatus(status, message),
			log: (level, message) => this.log(level, message),
		})

		this.setActionDefinitions(buildActions(this))
		this.setFeedbackDefinitions(buildFeedbacks(this))
		this.setVariableDefinitions(VARIABLE_DEFINITIONS)
		this.setPresetDefinitions(buildPresets())
		this.refreshVariables()
		this.client.start(config)
		this.tick = setInterval(() => {
			this.refreshVariables()
			this.checkFeedbacks('warning_yellow', 'warning_red', 'overtime')
		}, 1000)
	}

	async destroy() {
		if (this.tick) clearInterval(this.tick)
		if (this.client) this.client.stop()
		this.connected = false
	}

	async configUpdated(config) {
		this.config = config
		this.state = null
		this.connected = false
		this.refreshVariables()
		this.client.start(config)
	}

	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'ProTimer connection',
				value:
					'In ProTimer, open Network - OBS / Phone. Copy the host, port, and the value after t= from the API row. The token changes whenever ProTimer restarts.',
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'ProTimer host or IP',
				width: 8,
				regex: Regex.HOSTNAME,
				default: '127.0.0.1',
			},
			{ type: 'number', id: 'port', label: 'Port', width: 4, min: 1, max: 65535, default: 7878 },
			{ type: 'textinput', id: 'token', label: 'Session token (the value after t=)', width: 12, default: '' },
		]
	}

	async sendCommand(type, value) {
		return this.client.sendCommand(type, value)
	}

	onClientStatus(status, message) {
		this.connected = status === 'ok'
		this.updateStatus(STATUS_MAP[status] || InstanceStatus.ConnectionFailure, message)
		this.refreshVariables()
		this.checkFeedbacks('connected')
	}

	onState(state) {
		this.state = state
		this.refreshVariables()
		this.checkFeedbacks()
	}

	getPhase() {
		return timerPhase(this.state)
	}

	refreshVariables() {
		this.setVariableValues(stateVariables(this.state, this.connected))
	}
}

runEntrypoint(ProTimerInstance, UpgradeScripts)

module.exports = { ProTimerInstance }
