const { combineRgb } = require('@companion-module/base')

const COLORS = {
	black: combineRgb(0, 0, 0),
	white: combineRgb(255, 255, 255),
	green: combineRgb(22, 163, 74),
	yellow: combineRgb(234, 179, 8),
	red: combineRgb(220, 38, 38),
	blue: combineRgb(37, 99, 235),
	mutedRed: combineRgb(127, 29, 29),
}

function buildFeedbacks(instance) {
	const phaseIs = (phase) => () => instance.getPhase() === phase
	return {
		connected: {
			type: 'boolean',
			name: 'Connection: ProTimer is connected',
			options: [],
			defaultStyle: { bgcolor: COLORS.green, color: COLORS.white },
			callback: () => instance.connected,
		},
		running: {
			type: 'boolean',
			name: 'Timer: Running',
			options: [],
			defaultStyle: { bgcolor: COLORS.green, color: COLORS.white, text: 'PAUSE' },
			callback: () => !!(instance.state && instance.state.running),
		},
		blackout: {
			type: 'boolean',
			name: 'Output: Blackout is active',
			options: [],
			defaultStyle: { bgcolor: COLORS.red, color: COLORS.white },
			callback: () => !!(instance.state && instance.state.blackout),
		},
		warning_yellow: {
			type: 'boolean',
			name: 'Timer: Yellow warning',
			options: [],
			defaultStyle: { bgcolor: COLORS.yellow, color: COLORS.black },
			callback: phaseIs('yellow'),
		},
		warning_red: {
			type: 'boolean',
			name: 'Timer: Red warning',
			options: [],
			defaultStyle: { bgcolor: COLORS.red, color: COLORS.white },
			callback: phaseIs('red'),
		},
		overtime: {
			type: 'boolean',
			name: 'Timer: Overtime',
			options: [],
			defaultStyle: { bgcolor: COLORS.red, color: COLORS.white },
			callback: phaseIs('overtime'),
		},
		message_active: {
			type: 'boolean',
			name: 'Speaker: Message is visible',
			options: [],
			defaultStyle: { bgcolor: COLORS.blue, color: COLORS.white },
			callback: () => !!(instance.state && instance.state.message && instance.state.message.text),
		},
	}
}

module.exports = { buildFeedbacks, COLORS }
