describe("Reaper", function() {

	beforeEach(function() {
		this.reaper = new Reaper();
		this.element = document.createElement("div");
	});

	it("extracts form field values in a flat key-value pair", function() {
		this.element.innerHTML = [
			'<input type="text" name="blog[post][title]" value="Testing">',
			'<textarea name="blog[post][body]">Just testing.</textarea>'
		].join("");

		var data = this.reaper.getData(this.element);

		expect(data).toEqual({
			"blog[post][title]": "Testing",
			"blog[post][body]": "Just testing."
		});
	});

	it("adds values to an existing object", function() {
		this.element.innerHTML = '<textarea name="blog[post][body]">Just testing.</textarea>';
		var data = {
			"blog[post][title]": "Testing"
		};

		this.reaper.getData(this.element, data);

		expect(data).toEqual({
			"blog[post][title]": "Testing",
			"blog[post][body]": "Just testing."
		});
	});

	it("extracts form field values in a deeply nested object", function() {
		this.element.innerHTML = [
			'<input type="text" name="blog[post][title]" value="Testing">',
			'<textarea name="blog[post][body]">Just testing.</textarea>'
		].join("");

		this.reaper.flat = false;

		var data = this.reaper.getData(this.element);

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

		this.element.innerHTML = '<textarea name="blog[post][body]">Just testing.</textarea>';

		this.reaper.flat = false;
		this.reaper.getData(this.element, data);

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
		this.element.innerHTML = [
			'<input type="text" name="blog[post][title]" value="Testing">',
			'<textarea name="blog[post][body]"></textarea>'
		].join("");

		var data = this.reaper.getData(this.element);

		expect(data["blog[post][title]"]).toBe("Testing");
		expect(data.hasOwnProperty("blog[post][body]")).toBe(false);
	});

	it("omits disabled form fields", function() {
		this.element.innerHTML = [
			'<input type="text" name="blog[post][title]" value="Testing">',
			'<textarea name="blog[post][body]" disabled>Just testing.</textarea>'
		].join("");

		var data = this.reaper.getData(this.element);

		expect(data["blog[post][title]"]).toBe("Testing");
		expect(data.hasOwnProperty("blog[post][body]")).toBe(false);
	});

	describe("_extractValue", function() {

		describe("input[type=text]", function() {

			beforeEach(function() {
				this.textField = document.createElement("input");
				this.textField.value = "test";
			});

			it("returns the value for an enabled text field", function() {
				expect(this.reaper._extractValue(this.textField)).toBe("test");
			});

			it("returns null for a disabled text field", function() {
				this.textField.disabled = true;
				expect(this.reaper._extractValue(this.textField)).toBe(null);
			});

			it("returns null for an enabled text field with no value", function() {
				this.textField.value = "";
				expect(this.reaper._extractValue(this.textField)).toBe(null);
			});

		});

		describe("input[type=checkbox]", function() {

			beforeEach(function() {
				this.checkbox = document.createElement("input");
				this.checkbox.type = "checkbox";
				this.checkbox.value = "test";
			});

			it("returns the value for an enabled, checked check box", function() {
				this.checkbox.checked = true;
				expect(this.reaper._extractValue(this.checkbox)).toEqual("test");
			});

			it("returns null for an unchecked, enabled check box", function() {
				expect(this.reaper._extractValue(this.checkbox)).toBe(null);
			});

			it("returns null for an unchecked, disabled check box", function() {
				this.checkbox.disabled = true;
				expect(this.reaper._extractValue(this.checkbox)).toBe(null);
			});

		});

		describe("input[type=radio]", function() {

			beforeEach(function() {
				this.element.innerHTML = [
					'<input type="radio" name="test" value="1" checked>',
					'<input type="radio" name="test" value="2" disabled>',
					'<input type="radio" name="test" value="3">'
				].join("");
			});

			it("returns the value for an enabled, checked radio button", function() {
				expect(this.reaper._extractValue(this.element.childNodes[0])).toEqual("1");
			});

			it("returns null for a disabled check box", function() {
				expect(this.reaper._extractValue(this.element.childNodes[1])).toBe(null);
			});

			it("returns null for an unchecked check box", function() {
				expect(this.reaper._extractValue(this.element.childNodes[2])).toBe(null);
			});

		});

		describe("textarea", function() {

			beforeEach(function() {
				this.textarea = document.createElement("textarea");
				this.textarea.value = "test";
			});

			it("returns the value for an enabled textarea", function() {
				expect(this.reaper._extractValue(this.textarea)).toEqual("test");
			});

			it("returns null for a disabled textarea", function() {
				this.textarea.disabled = true;
				expect(this.reaper._extractValue(this.textarea)).toBe(null);
			});

			it("returns null for an enabled textarea with no value", function() {
				this.textarea.value = "";
				expect(this.reaper._extractValue(this.textarea)).toBe(null);
			});

		});

		describe("select", function() {

			beforeEach(function() {
				this.element.innerHTML = [
					'<select name="test">',
						'<option value="">Choose</option>',
						'<option value="1">1</option>',
						'<option value="2">2</option>',
						'<option value="3">3</option>',
					'</select>'
				].join("");

				this.select = this.element.firstChild;
			});

			it("returns the value of the selected option", function() {
				this.select.options[1].selected = true;
				this.select.options.selectedIndex = 1;
				expect(this.reaper._extractValue(this.select)).toEqual("1");
			});

			it("returns null when an option with no value is selected", function() {
				this.select.options[0].selected = true;
				this.select.options.selectedIndex = 0;
				expect(this.reaper._extractValue(this.select)).toBe(null);
			});

			it("returns null for a disabled select box", function() {
				this.select.disabled = true;
				expect(this.reaper._extractValue(this.select)).toBe(null);
			});

		});

		describe("select[multiple]", function() {

			beforeEach(function() {
				this.element.innerHTML = [
					'<select name="test" multiple>',
						'<option value="">Choose</option>',
						'<option value="1">1</option>',
						'<option value="2">2</option>',
						'<option value="3">3</option>',
					'</select>'
				].join("");

				this.select = this.element.firstChild;
			});

			it("returns an array of selected values", function() {
				this.select.options[1].selected = true;
				this.select.options[2].selected = true;
				var values = this.reaper._extractValue(this.select);
				expect(values instanceof Array).toBe(true);
				expect(values.length).toEqual(2);
				expect(values[0]).toEqual("1");
				expect(values[1]).toEqual("2");
			});

			it("returns an empty array when nothing is selected", function() {
				var values = this.reaper._extractValue(this.select);
				expect(values instanceof Array).toBe(true);
				expect(values.length).toEqual(0);
			});

			it("returns null for a disabled select box", function() {
				this.select.options[1].selected = true;
				this.select.options[2].selected = true;
				this.select.disabled = true;
				var values = this.reaper._extractValue(this.select);
				expect(values).toBe(null);
			});

			it("does not return values for options with no value", function() {
				this.select.options[0].selected = true;
				this.select.options[1].selected = true;
				this.select.options[2].selected = true;
				var values = this.reaper._extractValue(this.select);

				expect(values instanceof Array).toBe(true);
				expect(values.length).toEqual(2);
				expect(values[0]).toEqual("1");
				expect(values[1]).toEqual("2");
			});

			it("returns empty array if the only option selected has no value", function() {
				this.select.options[0].selected = true;
				var values = this.reaper._extractValue(this.select);
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

			this.reaper._setNestedValue(data, keys, value);

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

			this.reaper._setNestedValue(data, keys, value);

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

			this.reaper._setNestedValue(data, keys, value);

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

			this.reaper._setNestedValue(data, keys, value);

			expect(data).toEqual({
				post: {
					title: "Changed"
				}
			});
		});

	});

});
