const { COLORS } = require('./feedbacks')

function action(actionId, options = {}) {
	return { actionId, options }
}

function feedback(feedbackId, style = {}) {
	return { feedbackId, options: {}, style }
}

function button(name, text, actions = [], feedbacks = [], style = {}) {
	return {
		type: 'simple',
		name,
		style: {
			text,
			textExpression: text.includes('$('),
			size: 'auto',
			color: COLORS.white,
			bgcolor: COLORS.black,
			...style,
		},
		steps: [{ down: actions, up: [] }],
		feedbacks,
	}
}

const PRESET_STRUCTURE = [
	{ id: 'status', name: 'Status', definitions: ['time_display', 'cue_display'] },
	{ id: 'transport', name: 'Transport', definitions: ['start_pause', 'reset'] },
	{ id: 'rundown', name: 'Rundown', definitions: ['go'] },
	{
		id: 'timer-adjustment',
		name: 'Timer adjustment',
		definitions: ['add_minute', 'subtract_minute', 'add_ten_seconds', 'subtract_ten_seconds'],
	},
	{ id: 'output', name: 'Output', definitions: ['blackout', 'break_text', 'clear_text'] },
	{
		id: 'speaker-messages',
		name: 'Speaker messages',
		definitions: ['wrap_up', 'last_question', 'clear_message'],
	},
]

function buildPresets() {
	return {
		time_display: button(
			'Live timer display',
			'$(this:time)',
			[],
			[
				feedback('warning_yellow', { bgcolor: COLORS.yellow, color: COLORS.black }),
				feedback('warning_red', { bgcolor: COLORS.red, color: COLORS.white }),
				feedback('overtime', { bgcolor: COLORS.red, color: COLORS.white }),
			],
			{ size: '24' },
		),
		cue_display: button('Current and next cue', '$(this:current_cue_name)\nNEXT: $(this:next_cue_name)', [], [], {
			size: '14',
		}),
		start_pause: button(
			'Start / pause',
			'START',
			[action('start')],
			[feedback('running', { bgcolor: COLORS.green, color: COLORS.white, text: 'PAUSE' })],
		),
		reset: button('Reset', 'RESET', [action('reset')], [], { bgcolor: COLORS.mutedRed }),
		go: button('GO to next cue', 'GO\n$(this:next_cue_name)', [action('go')], [], {
			bgcolor: COLORS.blue,
		}),
		add_minute: button('Add one minute', '+1 MIN', [action('adjust', { seconds: 60 })], [], {
			color: COLORS.green,
		}),
		subtract_minute: button('Subtract one minute', '-1 MIN', [action('adjust', { seconds: -60 })], [], {
			color: COLORS.red,
		}),
		add_ten_seconds: button('Add ten seconds', '+10 SEC', [action('adjust', { seconds: 10 })], [], {
			color: COLORS.green,
		}),
		subtract_ten_seconds: button('Subtract ten seconds', '-10 SEC', [action('adjust', { seconds: -10 })], [], {
			color: COLORS.red,
		}),
		blackout: button(
			'Toggle blackout',
			'BLACKOUT',
			[action('blackout')],
			[feedback('blackout', { bgcolor: COLORS.red, color: COLORS.white, text: 'BLACKOUT\nON' })],
		),
		wrap_up: button(
			'Show WRAP UP',
			'WRAP UP',
			[action('speaker_message', { text: 'WRAP UP' })],
			[feedback('message_active', { bgcolor: COLORS.blue, color: COLORS.white })],
		),
		last_question: button(
			'Show LAST QUESTION',
			'LAST\nQUESTION',
			[action('speaker_message', { text: 'LAST QUESTION' })],
			[feedback('message_active', { bgcolor: COLORS.blue, color: COLORS.white })],
		),
		clear_message: button('Clear speaker message', 'CLEAR\nMESSAGE', [action('clear_speaker_message')]),
		break_text: button('Show BREAK text', 'BREAK', [action('on_screen_text', { text: 'BREAK' })], [], {
			bgcolor: COLORS.blue,
		}),
		clear_text: button('Clear on-screen text', 'CLEAR\nTEXT', [action('clear_on_screen_text')]),
	}
}

module.exports = { buildPresets, PRESET_STRUCTURE }
