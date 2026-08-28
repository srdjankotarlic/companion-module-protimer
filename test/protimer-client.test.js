const assert = require('node:assert/strict')
const http = require('node:http')
const test = require('node:test')
const {
	ProTimerClient,
	formatTime,
	normalizeConfig,
	parseSseFrame,
	stateVariables,
	timerPhase,
} = require('../src/protimer-client')

test('normalizes a pasted host and default port', () => {
	assert.deepEqual(normalizeConfig({ host: 'http://192.168.1.20/path', token: ' abc ' }), {
		host: '192.168.1.20',
		port: 7878,
		token: 'abc',
	})
})

test('formats countdown, overtime, countup, and clock states', () => {
	const now = new Date(2026, 0, 1, 12, 30, 15).getTime()
	assert.equal(formatTime({ mode: 'countdown', running: false, remMs: 90500, overtime: true }, now), '1:31')
	assert.equal(formatTime({ mode: 'countdown', running: true, endAt: now - 4100, overtime: true }, now), '-0:04')
	assert.equal(formatTime({ mode: 'countup', running: false, elapsedMs: 3661000 }, now), '1:01:01')
	assert.equal(formatTime({ mode: 'clock' }, now), '12:30:15')
})

test('derives timer phases and rundown variables', () => {
	const now = 100000
	const state = {
		mode: 'countdown',
		running: true,
		endAt: now + 45000,
		overtime: true,
		useWarnColors: true,
		yellowSec: 120,
		redSec: 60,
		blackout: false,
		currentCue: 0,
		cues: [{ name: 'Opening' }, { name: 'Keynote' }],
		message: { text: 'WRAP UP' },
	}
	assert.equal(timerPhase(state, now), 'red')
	assert.deepEqual(stateVariables(state, true, now), {
		time: '0:45',
		remaining_seconds: 45,
		running: 'true',
		mode: 'countdown',
		phase: 'red',
		blackout: 'false',
		connected: 'true',
		current_cue: 1,
		total_cues: 2,
		current_cue_name: 'Opening',
		next_cue_name: 'Keynote',
		message: 'WRAP UP',
		on_screen_text: '',
	})
})

test('parses standard and CRLF SSE frames', () => {
	assert.deepEqual(parseSseFrame('data: {"running":true}\n'), { running: true })
	assert.deepEqual(parseSseFrame('event: state\r\ndata: {"mode":"clock"}\r\n'), { mode: 'clock' })
})

test('connects to ProTimer SSE and sends authenticated commands', async (t) => {
	let command = null
	let eventResponse = null
	const server = http.createServer((request, response) => {
		const url = new URL(request.url, 'http://127.0.0.1')
		if (url.pathname === '/events') {
			eventResponse = response
			response.writeHead(200, { 'Content-Type': 'text/event-stream' })
			response.write('data: {"mode":"countdown","running":false,"remMs":60000}\r\n\r\n')
			return
		}
		if (url.pathname === '/cmd') {
			command = Object.fromEntries(url.searchParams)
			response.writeHead(url.searchParams.get('t') === 'secret' ? 200 : 403)
			response.end()
			return
		}
		response.writeHead(404).end()
	})
	await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
	t.after(() => new Promise((resolve) => server.close(resolve)))

	const states = []
	const statuses = []
	const client = new ProTimerClient({
		onState: (state) => states.push(state),
		onStatus: (status) => statuses.push(status),
		reconnectMs: 25,
		timeoutMs: 500,
	})
	t.after(() => client.stop())
	client.start({ host: '127.0.0.1', port: server.address().port, token: 'secret' })
	await waitFor(() => states.length === 1)
	assert.equal(states[0].remMs, 60000)
	assert.ok(statuses.includes('ok'))
	assert.equal(await client.sendCommand('adjust', -60), true)
	assert.deepEqual(command, { type: 'adjust', t: 'secret', value: '-60' })

	client.config.token = 'wrong'
	assert.equal(await client.sendCommand('reset'), false)
	assert.equal(statuses.at(-1), 'authentication-failure')
	if (eventResponse) eventResponse.end()
})

test('reconnects once after an SSE connection closes', async (t) => {
	let connections = 0
	const server = http.createServer((request, response) => {
		if (request.url === '/events') {
			connections += 1
			response.writeHead(200, { 'Content-Type': 'text/event-stream' })
			response.write(`data: {"connection":${connections}}\n\n`)
			if (connections === 1) response.end()
			return
		}
		response.writeHead(404).end()
	})
	await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
	const client = new ProTimerClient({ reconnectMs: 20, timeoutMs: 500 })
	client.start({ host: '127.0.0.1', port: server.address().port, token: 'secret' })
	await waitFor(() => connections === 2)
	await new Promise((resolve) => setTimeout(resolve, 60))
	assert.equal(connections, 2)
	client.stop()
	await new Promise((resolve) => server.close(resolve))
	t.after(() => client.stop())
})

async function waitFor(predicate, timeoutMs = 1000) {
	const deadline = Date.now() + timeoutMs
	while (!predicate()) {
		if (Date.now() > deadline) throw new Error('Timed out waiting for condition')
		await new Promise((resolve) => setTimeout(resolve, 10))
	}
}
