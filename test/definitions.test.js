const assert = require('node:assert/strict')
const test = require('node:test')
const { buildActions } = require('../src/actions')
const { buildFeedbacks } = require('../src/feedbacks')
const { buildPresets } = require('../src/presets')
const { VARIABLE_DEFINITIONS } = require('../src/variables')

test('presets reference existing actions and feedbacks', () => {
	const instance = {
		sendCommand: async () => true,
		parseVariablesInString: async (value) => value,
		getPhase: () => 'normal',
		state: null,
		connected: false,
	}
	const actions = buildActions(instance)
	const feedbacks = buildFeedbacks(instance)
	const presets = buildPresets()
	assert.ok(Object.keys(actions).length >= 10)
	assert.ok(Object.keys(feedbacks).length >= 7)
	assert.ok(Object.keys(presets).length >= 12)
	for (const preset of Object.values(presets)) {
		assert.equal(preset.type, 'button')
		for (const step of preset.steps) {
			for (const action of step.down) assert.ok(actions[action.actionId], `missing action ${action.actionId}`)
		}
		for (const item of preset.feedbacks) assert.ok(feedbacks[item.feedbackId], `missing feedback ${item.feedbackId}`)
	}
})

test('variable ids are unique and cover live rundown state', () => {
	const ids = VARIABLE_DEFINITIONS.map((item) => item.variableId)
	assert.equal(new Set(ids).size, ids.length)
	for (const required of ['time', 'phase', 'connected', 'current_cue_name', 'next_cue_name', 'message']) {
		assert.ok(ids.includes(required), `missing variable ${required}`)
	}
})
