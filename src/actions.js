function textOption(id, label, defaultValue) {
	return { type: 'textinput', id, label, default: defaultValue, useVariables: true }
}

function buildActions(instance) {
	const send = (type) => async () => instance.sendCommand(type)
	const variableText = async (value) => instance.parseVariablesInString(String(value || ''))
	return {
		start: { name: 'Transport: Start / pause', options: [], callback: send('start') },
		reset: { name: 'Transport: Reset', options: [], callback: send('reset') },
		go: { name: 'Rundown: GO to next cue', options: [], callback: send('go') },
		blackout: { name: 'Output: Toggle blackout', options: [], callback: send('blackout') },
		adjust: {
			name: 'Timer: Adjust time',
			options: [
				{ type: 'number', id: 'seconds', label: 'Seconds (positive or negative)', default: 60, min: -3600, max: 3600 },
			],
			callback: async (event) => instance.sendCommand('adjust', event.options.seconds),
		},
		set_duration: {
			name: 'Timer: Set duration',
			options: [{ type: 'number', id: 'minutes', label: 'Minutes', default: 10, min: 0.1, max: 600, step: 0.1 }],
			callback: async (event) => instance.sendCommand('setDuration', Math.round(Number(event.options.minutes) * 60000)),
		},
		set_mode: {
			name: 'Timer: Set mode',
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
			callback: async (event) => instance.sendCommand('mode', event.options.mode),
		},
		speaker_message: {
			name: 'Speaker: Show message',
			options: [textOption('text', 'Message', 'WRAP UP')],
			callback: async (event) => instance.sendCommand('message', await variableText(event.options.text)),
		},
		clear_speaker_message: { name: 'Speaker: Clear message', options: [], callback: send('clearMessage') },
		on_screen_text: {
			name: 'Output: Show text',
			options: [textOption('text', 'Text', 'BREAK')],
			callback: async (event) => instance.sendCommand('text', await variableText(event.options.text)),
		},
		clear_on_screen_text: { name: 'Output: Clear text', options: [], callback: send('clearText') },
	}
}

module.exports = { buildActions }
