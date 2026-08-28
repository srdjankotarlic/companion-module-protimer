const { COLORS } = require('./feedbacks')

function action(actionId, options = {}) {
	return { actionId, options }
}

function feedback(feedbackId, style = {}) {
	return { feedbackId, options: {}, style }
}

function button(category, name, text, actions = [], feedbacks = [], style = {}) {
	return {
		type: 'button',
		category,
		name,
		style: { text, size: 'auto', color: COLORS.white, bgcolor: COLORS.black, ...style },
		steps: [{ down: actions, up: [] }],
		feedbacks,
	}
}

function buildPresets() {
	return {
		time_display: button(
			'Status',
			'Live timer display',
			'$(protimer:time)',
			[],
			[
				feedback('warning_yellow', { bgcolor: COLORS.yellow, color: COLORS.black }),
				feedback('warning_red', { bgcolor: COLORS.red, color: COLORS.white }),
				feedback('overtime', { bgcolor: COLORS.red, color: COLORS.white }),
			],
			{ size: '24' },
		),
		cue_display: button(
			'Status',
			'Current and next cue',
			'$(protimer:current_cue_name)\nNEXT: $(protimer:next_cue_name)',
			[],
			[],
			{ size: '14' },
		),
		start_pause: button(
			'Transport',
			'Start / pause',
			'START',
			[action('start')],
			[feedback('running', { bgcolor: COLORS.green, color: COLORS.white, text: 'PAUSE' })],
		),
		reset: button('Transport', 'Reset', 'RESET', [action('reset')], [], { bgcolor: COLORS.mutedRed }),
		go: button('Rundown', 'GO to next cue', 'GO\n$(protimer:next_cue_name)', [action('go')], [], {
			bgcolor: COLORS.blue,
		}),
		add_minute: button('Timer adjustment', 'Add one minute', '+1 MIN', [action('adjust', { seconds: 60 })], [], {
			color: COLORS.green,
		}),
		subtract_minute: button(
			'Timer adjustment',
			'Subtract one minute',
			'-1 MIN',
			[action('adjust', { seconds: -60 })],
			[],
			{ color: COLORS.red },
		),
		add_ten_seconds: button('Timer adjustment', 'Add ten seconds', '+10 SEC', [action('adjust', { seconds: 10 })], [], {
			color: COLORS.green,
		}),
		subtract_ten_seconds: button(
			'Timer adjustment',
			'Subtract ten seconds',
			'-10 SEC',
			[action('adjust', { seconds: -10 })],
			[],
			{ color: COLORS.red },
		),
		blackout: button(
			'Output',
			'Toggle blackout',
			'BLACKOUT',
			[action('blackout')],
			[feedback('blackout', { bgcolor: COLORS.red, color: COLORS.white, text: 'BLACKOUT\nON' })],
		),
		wrap_up: button(
			'Speaker messages',
			'Show WRAP UP',
			'WRAP UP',
			[action('speaker_message', { text: 'WRAP UP' })],
			[feedback('message_active', { bgcolor: COLORS.blue, color: COLORS.white })],
		),
		last_question: button(
			'Speaker messages',
			'Show LAST QUESTION',
			'LAST\nQUESTION',
			[action('speaker_message', { text: 'LAST QUESTION' })],
			[feedback('message_active', { bgcolor: COLORS.blue, color: COLORS.white })],
		),
		clear_message: button('Speaker messages', 'Clear speaker message', 'CLEAR\nMESSAGE', [
			action('clear_speaker_message'),
		]),
		break_text: button('Output', 'Show BREAK text', 'BREAK', [action('on_screen_text', { text: 'BREAK' })], [], {
			bgcolor: COLORS.blue,
		}),
		clear_text: button('Output', 'Clear on-screen text', 'CLEAR\nTEXT', [action('clear_on_screen_text')]),
	}
}

module.exports = { buildPresets }
