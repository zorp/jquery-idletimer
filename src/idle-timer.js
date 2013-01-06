/*
 * Copyright (c) 2009 Nicholas C. Zakas
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

(function($){

$.idleTimer = function(newTimeout, elem, opts){

	// defaults that are to be stored as instance props on the elem

	opts = $.extend({
		startImmediately: true,   //starts a timeout as soon as the timer is set up
		idle: false,              //indicates if the user is idle
		enabled: true,            //indicates if the idle timer is enabled
		timeout: 30000,           //the amount of time (ms) before the user is considered idle
		events: "mousemove keydown DOMMouseScroll mousewheel mousedown touchstart touchmove" // activity is one of these events
	}, opts);


	elem = elem || document;

	/* (intentionally not documented)
	 * Toggles the idle state and fires an appropriate event.
	 * @return {void}
	 */
	var toggleIdleState = function(myelem){

		// curse you, mozilla setTimeout lateness bug!
		if (typeof myelem === "number"){
			myelem = undefined;
		}

		var obj = $.data(myelem || elem,"idleTimerObj");

		//toggle the state
		obj.idle = !obj.idle;

		// reset timeout
		var elapsed = (+new Date()) - obj.olddate;
		obj.olddate = +new Date();

		// handle Chrome always triggering idle after js alert or comfirm popup
		if (obj.idle && (elapsed < opts.timeout)) {
				obj.idle = false;
				clearTimeout($.idleTimer.tId);
				if (opts.enabled) {
					$.idleTimer.tId = setTimeout(toggleIdleState, opts.timeout);
				}
				return;
		}

		//fire appropriate event

		// create a custom event, but first, store the new state on the element
		// and then append that string to a namespace
		var event = jQuery.Event( $.data(elem,"idleTimer", obj.idle ? "idle" : "active" ) + ".idleTimer" );

		// we do want this to bubble, at least as a temporary fix for jQuery 1.7
		// event.stopPropagation();
		$(elem).trigger(event);
	},

	/**
	 * Stops the idle timer. This removes appropriate event handlers
	 * and cancels any pending timeouts.
	 * @return {void}
	 * @method stop
	 * @static
	 */
	stop = function(elem){

		var obj = $.data(elem,"idleTimerObj") || {};

		//set to disabled
		obj.enabled = false;

		//clear any pending timeouts
		clearTimeout(obj.tId);

		//detach the event handlers
		$(elem).off(".idleTimer");
	},

	/* (intentionally not documented)
	 * Handles a user event indicating that the user isn't idle.
	 * @param {Event} event A DOM2-normalized event object.
	 * @return {void}
	 */
	handleUserEvent = function(){

		var obj = $.data(this,"idleTimerObj");

		//clear any existing timeout
		clearTimeout(obj.tId);

		//if the idle timer is enabled
		if (obj.enabled){

			//if it's idle, that means the user is no longer idle
			if (obj.idle){
				toggleIdleState(this);
			}

			//set a new timeout
			obj.tId = setTimeout(toggleIdleState, obj.timeout);

		}
	};

	/**
	 * Starts the idle timer. This adds appropriate event handlers
	 * and starts the first timeout.
	 * @param {int} newTimeout (Optional) A new value for the timeout period in ms.
	 * @return {void}
	 * @method $.idleTimer
	 * @static
	 */
	var obj = $.data(elem,"idleTimerObj") || {};

	obj.olddate = obj.olddate || +new Date();

	//assign a new timeout if necessary
	if (typeof newTimeout === "number"){
		opts.timeout = newTimeout;
	} else if (newTimeout === "destroy") {
		stop(elem);
		return this;
	} else if (newTimeout === "getElapsedTime"){
		return (+new Date()) - obj.olddate;
	}

	//assign appropriate event handlers
	$(elem).on($.trim((opts.events+" ").split(" ").join(".idleTimer ")),handleUserEvent);

	obj.idle	= opts.idle;
	obj.enabled = opts.enabled;
	obj.timeout = opts.timeout;

	//set a timeout to toggle state. May wish to omit this in some situations
	if (opts.startImmediately) {
		obj.tId = setTimeout(toggleIdleState, obj.timeout);
	}

	// assume the user is active for the first x seconds.
	$.data(elem,"idleTimer","active");

	// store our instance on the object
	$.data(elem,"idleTimerObj",obj);

};

$.fn.idleTimer = function(newTimeout,opts){
	// Allow omission of opts for backward compatibility
	if (!opts) {
		opts = {};
	}

	if(this[0]){
		$.idleTimer(newTimeout,this[0],opts);
	}

	return this;
};

})(jQuery);
