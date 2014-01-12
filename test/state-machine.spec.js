describe('state-machine.js spec', function () {
	
	var fsm;

	beforeEach(function () {
		fsm = new StateMachine('idle', {
			'idle': ['*', '!run'],
			'walk': ['idle', 'run'],
			'run': ['walk']
		});
	});

	it('should have 4 states', function () {
		var keys = Object.keys(fsm._states);
		expect(keys.length).toBe(3);
	});

	it('should be allowed to go "idle", "walk" or "run"', function () {
		fsm.transition('none');
		expect(fsm.can('idle')).toBe(true);
		expect(fsm.can('walk')).toBe(true);
		expect(fsm.can('run')).toBe(true);
	});

	it('should be on "idle" state', function () {
		expect(fsm.current()).toBe('idle');
		expect(fsm.is('idle')).toBe(true);
	});

	it('should change the current state to "walk"', function () {
		expect(fsm.can('walk')).toBe(true);
		fsm.transition('walk');
		expect(fsm.current()).toBe('walk');
	});

	it('should stay "idle', function () {
		fsm.transition('run');
		expect(fsm.current()).toBe('idle');
	});

	it('should add entries in history', function () {
		expect(fsm._history.length).toBe(1);
		fsm.transition('walk');
		expect(fsm._history.length).toBe(2);
	});

	it('should return null', function () {
		expect(fsm.previous()).toBe(null);
		expect(fsm.next()).toBe(null);
	});

	it('should return the previous entrie in history', function () {
		fsm.transition('walk');
		expect(fsm._index).toBe(1);
		expect(fsm.current()).toBe('walk');
		expect(fsm.previous()).toBe('idle');
	});

	it('should return next entrie in history', function () {
		fsm.transition('walk');
		fsm.back();
		expect(fsm._index).toBe(0);
		expect(fsm.current()).toBe('idle');
		expect(fsm.next()).toBe('walk');
	});

	it('should go back to the first history entrie', function () {
		fsm.transition('walk');
		fsm.transition('run');
		expect(fsm._index).toBe(2);
		expect(fsm.current()).toBe('run');
		fsm.goto(0);
		expect(fsm._index).toBe(0);
		expect(fsm.current()).toBe('idle');
	});
 
});