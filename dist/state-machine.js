! function (factory, root) {
	if (typeof define === 'function' && define.amd) {
		define(function () { return factory(root); });
	} else if (typeof module === 'object' && module && module.exports) {
		module.exports = factory(root);
	} else if (typeof exports === 'object' && exports) {
		exports.StateMachine = factory(root);
	} else {
		root.StateMachine = factory(root);
	}
}(function (root) {
	'use strict';

	var StateMachine = function StateMachine(initial, states) {
		this._states = states || initial;

		if (states === undefined) {
			initial = 'none';
		}

		this._history = [initial];

		this._index = 0;

		this._queue = [];
	};


	StateMachine.prototype.transition = function transition(state) {
		if (this.cant(state)) return;

		if (this._index === this._history.length - 1) {
			this._history.push(state);
			this._index += 1;
		}
	};

	StateMachine.prototype.defer = function defer(state) {
		if (this._queue.length) {
			this._queue.push(state);
		} else {
			this.transition(state);
		}
	};

	StateMachine.prototype.is = function is(state) {
		return (this.current() === state);
	};

	StateMachine.prototype.isnt = function isnt(state) {
		return (this.current() !== state);
	};

	StateMachine.prototype.can = function can(state) {
		var current = this.current();

		if (current === 'none' && !('none' in this._states)) {
			return true;
		}

		var toStates = this._states[current],
			exclude = '!' + state,
			allowed = false;

		if (toStates === undefined) return allowed;
		if (toStates.length === 0) return allowed;

		var i = toStates.length;
		while (i--) {
			var other = toStates[i];
			if (other === '*' || other === state) {
				allowed = true;
			} else if (other === exclude) {
				return false;
			}
		}

		return allowed;
	};

	StateMachine.prototype.cant = function cant(state) {
		return !this.can(state);
	};

	StateMachine.prototype.current = function current() {
		return this.at(this._index);
	};

	StateMachine.prototype.previous = function previous(offset) {
		if (offset === undefined) offset = 1;
		return this.at(this._index - 1 * offset);
	};

	StateMachine.prototype.next = function next(offset) {
		if (offset === undefined) offset = 1;
		return this.at(this._index + 1 * offset);
	};

	StateMachine.prototype.at = function at(index) {
		if (index < 0 || index >= this._history.length) {
			return null;
		}

		return this._history[index];
	};

	StateMachine.prototype.back = function back() {
		this.goto(this._index - 1);
	};

	StateMachine.prototype.forward = function forward() {
		this.goto(this._index + 1);
	};

	StateMachine.prototype.goto = function goto(index) {
		var count = index - this._index,
			direction;

		if (count === 0) {
			return;
		} else if (count > 0) {
			direction = 1;
		} else {
			direction = -1;
			count *= -1;
		}

		while (count--) {
			var state = this.at(this._index + direction);

			if (this.cant(state)) continue;

			this._index += direction;
			this.transition(state);
		}
	};


	return StateMachine;

}, this);
