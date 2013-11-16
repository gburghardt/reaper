function Reaper() {
}

Reaper.prototype = {

	allowNulls: false,

	flat: true,

	nestedKeysRegex: /[.\[\]]+/g,

	constructor: Reaper,

	_extractFieldValues: function _extractFieldValues(fields, data) {
		var value, name, i = 0, length = fields.length;

		for (i; i < length; i++) {
			value = this._extractValue(fields[i]);
			name = fields[i].name;
			this._setValue(data, name, value);
		}
	},

	_extractValue: function _extractValue(field) {
		var nodeName = field.nodeName.toLowerCase(),
		    value = null, i, length;

		if (!field.disabled) {
			if (nodeName === "input") {
				if (field.type === "checkbox" || field.type === "radio") {
					if (field.checked) {
						value = field.value;
					}
				}
				else {
					value = field.value;
				}
			}
			else if (nodeName === "select") {
				if (field.multiple) {
					value = [];

					for (i = 0, length = field.options.length; i < length; ++i) {
						if (!field.options[i].disabled && field.options[i].selected && field.options[i].value) {
							value.push(field.options[i].value);
						}
					}
				}
				else {
					value = field.value;
				}
			}
			else {
				value = field.value;
			}
		}

		field = null;

		return (value === "") ? null : value;
	},

	getData: function getData(element, data) {
		if (!element) {
			throw new Error("Missing required argument: element");
		}

		data = data || {};

		var inputs = element.getElementsByTagName("input"),
		    selects = element.getElementsByTagName("select"),
		    textareas = element.getElementsByTagName("textarea");

		this._extractFieldValues(inputs, data);
		this._extractFieldValues(selects, data);
		this._extractFieldValues(textareas, data);

		element = inputs = selects = textareas = null;

		return data;
	},

	_setNestedValue: function _setNestedValue(data, keys, value) {
		var currData = data,
		    key, i = 0,
		    length = keys.length - 1,
		    lastKey = keys[ length ];

		// Find the object we want to set the value on
		for (i; i < length; i++) {
			key = keys[i];

			if (!currData.hasOwnProperty(key)) {
				currData[key] = {};
			}

			currData = currData[key];
		}

		currData[lastKey] = value;

		currData = keys = null;
	},

	_setValue: function _setValue(data, name, value) {
		if (this.flat) {
			if (value !== null || this.allowNulls) {
				data[name] = value;
			}
		}
		else if (value !== null || this.allowNulls) {
			var keys = name
				.replace(/\]$/, "")
				.split(this.nestedKeysRegex);

			this._setNestedValue(data, keys, value);
		}
	}

};
