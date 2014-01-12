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

	function StateMachine(initial, states) {
		this._states = states || initial;

		if (states === undefined) initial = 'none';

		this._history = [initial];
		this._index = 0;

		this._queue = [];

		this.transition = {
			canceled: false,
			done: true,
			from: null,
			to: null
		};
	}


	StateMachine.prototype.state = function state(toState) {
		var current = this._history[this._index];

		if (toState === undefined) return current;

		if (!this.transition.done) return false;

		if (this.cant(toState)) return false;

		this.transition.done = false;

		this.transition.from = current;
		this.transition.to = toState;

		// async stuff ...

		this.transition.done = true;

		this._index += 1;
		this._history.push(toState);

		for (var length = this._queue.length; length > 0; length -= 1) {
			var callback = this._queue.shift();

			if (typeof callback === 'function') callback();
			else this.state(callback);

			if (!this.transition.done) break;
		}

		return true;
	};

	StateMachine.prototype.previous = function previous() {
		if (this._index < 1) return null;
		return this._history[this._index - 1];
	};

	StateMachine.prototype.next = function next() {
		if (this._index > this._history.length - 2) return null;
		return this._history[this._index + 1];
	};

	StateMachine.prototype.back = function back() {};

	StateMachine.prototype.forward = function forward() {};

	StateMachine.prototype.is = function is(state) {
		return (this.state() === state);
	};

	StateMachine.prototype.isnt = function isnt(state) {
		return (this.state() !== state);
	};

	StateMachine.prototype.allowed = function allowed(state) {
		return this._states[states] || [];
	};

	StateMachine.prototype.can = function can(state) {
		var current = this.state();

		if (current === 'none' && !('none' in this._states)) {
			return true;
		}

		var toStates = this._states[current];

		if (toStates === undefined) return false;
		if (toStates.length === 0) return false;

		var i = toStates.length;
		while (i--) {
			if (toStates[i] === '*' || toStates[i] === state) {
				return true;
			}
		}

		return false;
	};

	StateMachine.prototype.cant = function cant(state) {
		return !this.can(state);
	};

	StateMachine.prototype.defer = function defer(callback) {
		if (this.transition.done) {
			if (typeof callback === 'function') {
				(root.setImmediate || root.setTimeout)(callback, 0);
			} else {
				this.state(callback);
			}
		} else {
			this._queue.push(callback);
		}

		return this;
	};


	StateMachine.create = function create(initial, states) {
		return new StateMachine(initial, states);
	};

	StateMachine.mixins = function mixins(dest, initial, states) {
		StateMachine.call(dest, initial, states);

		var prototype = StateMachine.prototype;
		for (var property in prototype) {
			dest[property] = prototype[property];
		}

		return dest;
	};


	return StateMachine;

}, this);
