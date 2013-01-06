(function($) {
/*
		======== A Handy Little QUnit Reference ========
		http://docs.jquery.com/QUnit

		Test methods:
			expect(numAssertions)
			stop(increment)
			start(decrement)
		Test assertions:
			ok(value, [message])
			equal(actual, expected, [message])
			notEqual(actual, expected, [message])
			deepEqual(actual, expected, [message])
			notDeepEqual(actual, expected, [message])
			strictEqual(actual, expected, [message])
			notStrictEqual(actual, expected, [message])
			raises(block, [expected], [message])
*/

	module( "jQuery#idle-timer", {
		// This will run before each test in this module.
		setup: function() {
			this.elems = $("#qunit-fixture").children();
		}
	});

	test( "needs tests", function() {
		expect( 1 );
		ok( true, "Untested Code is Broken Code." );
	});

}(jQuery));
