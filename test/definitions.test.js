const assert = require('node:assert/strict')
const test = require('node:test')
const { buildActions } = require('../src/actions')
const { buildFeedbacks } = require('../src/feedbacks')
const { buildPresets, PRESET_STRUCTURE } = require('../src/presets')
const { VARIABLE_DEFINITIONS } = require('../src/variables')

test('presets reference existing actions and feedbacks', () => {
	const instance = {
		sendCommand: async () => true,
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
		assert.equal(preset.type, 'simple')
		for (const step of preset.steps) {
			for (const action of step.down) assert.ok(actions[action.actionId], `missing action ${action.actionId}`)
		}
		for (const item of preset.feedbacks) assert.ok(feedbacks[item.feedbackId], `missing feedback ${item.feedbackId}`)
	}
	const structuredIds = PRESET_STRUCTURE.flatMap((section) => section.definitions)
	assert.deepEqual(new Set(structuredIds), new Set(Object.keys(presets)))
})

test('variable ids are unique and cover live rundown state', () => {
	const ids = Object.keys(VARIABLE_DEFINITIONS)
	assert.equal(new Set(ids).size, ids.length)
	for (const required of ['time', 'phase', 'connected', 'current_cue_name', 'next_cue_name', 'message']) {
		assert.ok(ids.includes(required), `missing variable ${required}`)
	}
})

test('text actions send the resolved Companion value', async () => {
	const commands = []
	const actions = buildActions({
		sendCommand: async (type, value) => {
			commands.push({ type, value })
		},
	})

	await actions.speaker_message.callback({ options: { text: 'Two minutes' } })
	await actions.on_screen_text.callback({ options: { text: 'BREAK' } })
	assert.deepEqual(commands, [
		{ type: 'message', value: 'Two minutes' },
		{ type: 'text', value: 'BREAK' },
	])
})
