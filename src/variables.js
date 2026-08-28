const VARIABLE_DEFINITIONS = [
	{ variableId: 'time', name: 'Formatted time shown on screen' },
	{ variableId: 'remaining_seconds', name: 'Remaining or elapsed seconds' },
	{ variableId: 'running', name: 'Timer running (true/false)' },
	{ variableId: 'mode', name: 'Timer mode' },
	{ variableId: 'phase', name: 'Timer phase (normal/yellow/red/overtime)' },
	{ variableId: 'blackout', name: 'Blackout active (true/false)' },
	{ variableId: 'connected', name: 'ProTimer connected (true/false)' },
	{ variableId: 'current_cue', name: 'Current cue number (1-based, 0 when none)' },
	{ variableId: 'total_cues', name: 'Total rundown cues' },
	{ variableId: 'current_cue_name', name: 'Current cue name' },
	{ variableId: 'next_cue_name', name: 'Next cue name' },
	{ variableId: 'message', name: 'Current speaker message' },
	{ variableId: 'on_screen_text', name: 'Current on-screen text' },
]

module.exports = { VARIABLE_DEFINITIONS }
