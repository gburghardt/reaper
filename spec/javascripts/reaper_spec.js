describe("Reaper", function() {

	var reaper, element;

	beforeEach(function() {
		reaper = new Reaper();
		element = document.createElement("div");
	});

	it("extracts form field values in a flat key-value pair", function() {
		element.innerHTML = [
			'<input type="text" name="blog[post][title]" value="Testing">',
			'<textarea name="blog[post][body]">Just testing.</textarea>'
		].join("");

		var data = reaper.getData(element);

		expect(data).toEqual({
			"blog[post][title]": "Testing",
			"blog[post][body]": "Just testing."
		});
	});

	it("adds values to an existing object", function() {
		element.innerHTML = '<textarea name="blog[post][body]">Just testing.</textarea>';
		var data = {
			"blog[post][title]": "Testing"
		};

		reaper.getData(element, data);

		expect(data).toEqual({
			"blog[post][title]": "Testing",
			"blog[post][body]": "Just testing."
		});
	});

	it("extracts form field values in a deeply nested object", function() {
		element.innerHTML = [
			'<input type="text" name="blog[post][title]" value="Testing">',
			'<textarea name="blog[post][body]">Just testing.</textarea>'
		].join("");

		reaper.flat = false;

		var data = reaper.getData(element);

		expect(data).toEqual({
			blog: {
				post: {
					title: "Testing",
					body: "Just testing."
				}
			}
		});
	});

	it("adds values to a deeply nested object", function() {
		var data = {
			blog: {
				post: {
					title: "Testing"
				}
			}
		};

		element.innerHTML = '<textarea name="blog[post][body]">Just testing.</textarea>';

		reaper.flat = false;
		reaper.getData(element, data);

		expect(data).toEqual({
			blog: {
				post: {
					title: "Testing",
					body: "Just testing."
				}
			}
		});
	});

	it("omits empty form fields", function() {
		element.innerHTML = [
			'<input type="text" name="blog[post][title]" value="Testing">',
			'<textarea name="blog[post][body]"></textarea>'
		].join("");

		var data = reaper.getData(element);

		expect(data["blog[post][title]"]).toBe("Testing");
		expect(data.hasOwnProperty("blog[post][body]")).toBe(false);
	});

	it("omits disabled form fields", function() {
		element.innerHTML = [
			'<input type="text" name="blog[post][title]" value="Testing">',
			'<textarea name="blog[post][body]" disabled>Just testing.</textarea>'
		].join("");

		var data = reaper.getData(element);

		expect(data["blog[post][title]"]).toBe("Testing");
		expect(data.hasOwnProperty("blog[post][body]")).toBe(false);
	});

	describe("_extractValue", function() {

		describe("input[type=text]", function() {

			var textField;

			beforeEach(function() {
				textField = document.createElement("input");
				textField.value = "test";
			});

			it("returns the value for an enabled text field", function() {
				expect(reaper._extractValue(textField)).toBe("test");
			});

			it("returns null for a disabled text field", function() {
				textField.disabled = true;
				expect(reaper._extractValue(textField)).toBe(null);
			});

			it("returns null for an enabled text field with no value", function() {
				textField.value = "";
				expect(reaper._extractValue(textField)).toBe(null);
			});

		});

		describe("input[type=checkbox]", function() {

			var checkbox;

			beforeEach(function() {
				checkbox = document.createElement("input");
				checkbox.type = "checkbox";
				checkbox.value = "test";
			});

			it("returns the value for an enabled, checked check box", function() {
				checkbox.checked = true;
				expect(reaper._extractValue(checkbox)).toEqual("test");
			});

			it("returns null for an unchecked, enabled check box", function() {
				expect(reaper._extractValue(checkbox)).toBe(null);
			});

			it("returns null for an unchecked, disabled check box", function() {
				checkbox.disabled = true;
				expect(reaper._extractValue(checkbox)).toBe(null);
			});

		});

		describe("input[type=radio]", function() {

			beforeEach(function() {
				element.innerHTML = [
					'<input type="radio" name="test" value="1" checked>',
					'<input type="radio" name="test" value="2" disabled>',
					'<input type="radio" name="test" value="3">'
				].join("");
			});

			it("returns the value for an enabled, checked radio button", function() {
				expect(reaper._extractValue(element.childNodes[0])).toEqual("1");
			});

			it("returns null for a disabled check box", function() {
				expect(reaper._extractValue(element.childNodes[1])).toBe(null);
			});

			it("returns null for an unchecked check box", function() {
				expect(reaper._extractValue(element.childNodes[2])).toBe(null);
			});

		});

		describe("textarea", function() {

			var textarea;

			beforeEach(function() {
				textarea = document.createElement("textarea");
				textarea.value = "test";
			});

			it("returns the value for an enabled textarea", function() {
				expect(reaper._extractValue(textarea)).toEqual("test");
			});

			it("returns null for a disabled textarea", function() {
				textarea.disabled = true;
				expect(reaper._extractValue(textarea)).toBe(null);
			});

			it("returns null for an enabled textarea with no value", function() {
				textarea.value = "";
				expect(reaper._extractValue(textarea)).toBe(null);
			});

		});

		describe("select", function() {

			var select;

			beforeEach(function() {
				element.innerHTML = [
					'<select name="test">',
						'<option value="">Choose</option>',
						'<option value="1">1</option>',
						'<option value="2">2</option>',
						'<option value="3">3</option>',
					'</select>'
				].join("");

				select = element.firstChild;
			});

			it("returns the value of the selected option", function() {
				select.options[1].selected = true;
				select.options.selectedIndex = 1;
				expect(reaper._extractValue(select)).toEqual("1");
			});

			it("returns null when an option with no value is selected", function() {
				select.options[0].selected = true;
				select.options.selectedIndex = 0;
				expect(reaper._extractValue(select)).toBe(null);
			});

			it("returns null for a disabled select box", function() {
				select.disabled = true;
				expect(reaper._extractValue(select)).toBe(null);
			});

		});

		describe("select[multiple]", function() {

			var select;

			beforeEach(function() {
				element.innerHTML = [
					'<select name="test" multiple>',
						'<option value="">Choose</option>',
						'<option value="1">1</option>',
						'<option value="2">2</option>',
						'<option value="3">3</option>',
					'</select>'
				].join("");

				select = element.firstChild;
			});

			it("returns an array of selected values", function() {
				select.options[1].selected = true;
				select.options[2].selected = true;
				var values = reaper._extractValue(select);
				expect(values instanceof Array).toBe(true);
				expect(values.length).toEqual(2);
				expect(values[0]).toEqual("1");
				expect(values[1]).toEqual("2");
			});

			it("returns an empty array when nothing is selected", function() {
				var values = reaper._extractValue(select);
				expect(values instanceof Array).toBe(true);
				expect(values.length).toEqual(0);
			});

			it("returns null for a disabled select box", function() {
				select.options[1].selected = true;
				select.options[2].selected = true;
				select.disabled = true;
				var values = reaper._extractValue(select);
				expect(values).toBe(null);
			});

			it("does not return values for options with no value", function() {
				select.options[0].selected = true;
				select.options[1].selected = true;
				select.options[2].selected = true;
				var values = reaper._extractValue(select);

				expect(values instanceof Array).toBe(true);
				expect(values.length).toEqual(2);
				expect(values[0]).toEqual("1");
				expect(values[1]).toEqual("2");
			});

			it("returns empty array if the only option selected has no value", function() {
				select.options[0].selected = true;
				var values = reaper._extractValue(select);
				expect(values instanceof Array).toBe(true);
				expect(values.length).toEqual(0);
			});

		});

	});

	describe("_setNestedValue", function() {

		it("creates a simple object", function() {
			var keys = ["blog", "title"];
			var value = "Just Testing";
			var data = {};

			reaper._setNestedValue(data, keys, value);

			expect(data).toEqual({
				blog: {
					title: "Just Testing"
				}
			});
		});

		it("creates a deeply nested object", function() {
			var keys = ["universe", "galaxy", "solar_system", "planet", "name"];
			var value = "Earth";
			var data = {};

			reaper._setNestedValue(data, keys, value);

			expect(data).toEqual({
				universe: {
					galaxy: {
						solar_system: {
							planet: {
								name: "Earth"
							}
						}
					}
				}
			});
		});

		it("adds to an existing inner object key", function() {
			var keys = ["post", "title"];
			var value = "Just Testing";
			var data = {
				post: {
					body: "Foo"
				}
			};

			reaper._setNestedValue(data, keys, value);

			expect(data).toEqual({
				post: {
					title: "Just Testing",
					body: "Foo"
				}
			});
		});

		it("overwrites values", function() {
			var keys = ["post", "title"];
			var value = "Changed";
			var data = {
				post: {
					title: "Fail"
				}
			};

			reaper._setNestedValue(data, keys, value);

			expect(data).toEqual({
				post: {
					title: "Changed"
				}
			});
		});

	});

});
