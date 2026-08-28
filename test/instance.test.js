const assert = require('node:assert/strict')
const test = require('node:test')
const ProTimerInstance = require('../src/main')

test('initializes against the Companion API 2 instance contract', async () => {
	const registered = {}
	const context = {
		_isInstanceContext: true,
		id: 'protimer-test',
		label: 'ProTimer test',
		upgradeScripts: [],
		saveConfig: () => {},
		updateStatus: (status) => {
			registered.status = status
		},
		oscSend: () => {},
		recordAction: () => {},
		setActionDefinitions: (definitions) => {
			registered.actions = definitions
		},
		subscribeActions: () => {},
		unsubscribeActions: () => {},
		setFeedbackDefinitions: (definitions) => {
			registered.feedbacks = definitions
		},
		unsubscribeFeedbacks: () => {},
		checkFeedbacks: () => {},
		checkAllFeedbacks: () => {},
		checkFeedbacksById: () => {},
		setPresetDefinitions: (structure, definitions) => {
			registered.presetStructure = structure
			registered.presets = definitions
		},
		setCompositeElementDefinitions: () => {},
		setVariableDefinitions: (definitions) => {
			registered.variables = definitions
		},
		setVariableValues: (values) => {
			registered.values = values
		},
		getVariableValue: () => undefined,
	}

	const instance = new ProTimerInstance(context)
	await instance.init({ host: '', port: 7878, token: '' })

	assert.equal(typeof ProTimerInstance, 'function')
	assert.equal(Object.keys(registered.actions).length, 11)
	assert.equal(Object.keys(registered.feedbacks).length, 7)
	assert.equal(Object.keys(registered.variables).length, 13)
	assert.equal(Object.keys(registered.presets).length, 15)
	assert.equal(registered.presetStructure.length, 6)
	assert.equal(registered.status, 'bad_config')
	assert.equal(registered.values.connected, 'false')

	await instance.destroy()
})
