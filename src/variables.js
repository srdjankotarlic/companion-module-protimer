const VARIABLE_DEFINITIONS = {
	time: { name: 'Formatted time shown on screen' },
	remaining_seconds: { name: 'Remaining or elapsed seconds' },
	running: { name: 'Timer running (true/false)' },
	mode: { name: 'Timer mode' },
	phase: { name: 'Timer phase (normal/yellow/red/overtime)' },
	blackout: { name: 'Blackout active (true/false)' },
	connected: { name: 'ProTimer connected (true/false)' },
	current_cue: { name: 'Current cue number (1-based, 0 when none)' },
	total_cues: { name: 'Total rundown cues' },
	current_cue_name: { name: 'Current cue name' },
	next_cue_name: { name: 'Next cue name' },
	message: { name: 'Current speaker message' },
	on_screen_text: { name: 'Current on-screen text' },
}

module.exports = { VARIABLE_DEFINITIONS }
