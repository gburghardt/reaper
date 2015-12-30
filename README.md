# Reaper

Reaper is an easy to use class allowing you to extract data from a
form or other element. It has no dependencies.

This is ideal for web applications that require data to be manipulated
in JavaScript before sending it off to a server side application for
further processing.

You can extract values as a simple key-value pair, or explode each
form field name into a deeply nested object.

## Getting Started

You need only to include reaper.js in your web page. Aside from that,
you only need form fields in your web page, regardless of whether or
not they exist in a `<form>` tag or not.

```html
<form id="blog-post-form">
    <input type="text" name="blog[post][title]" value="Reaper">
    <input type="hidden"name="blog[post][id]" value="32">
    <textarea name="blog[post][body]">Easy extraction of form field values</textarea>
</form>
```

### Extracting As Simple Key-Value Pairs

By default, Reaper returns a simple key-value pair object of form
field names and their values:

```javascript
var reaper = new Reaper();
var element = document.getElementById("blog-post-form");
var data = reaper.getData(element);
```

The `data` variable will have this structure:

```javascript
var data = {
    "blog[post][id]": 32,
    "blog[post][title]": "Reaper",
    "blog[post][body]": "Easy extraction of form field values"
};
```

### Extracting Values As A Deeply Nested Object

The `flat` property determines whether or not you get a deeply nested
object back:


```javascript
var reaper = new Reaper();

// Return a deeply nested object
reaper.flat = false;

var element = document.getElementById("blog-post-form");
var data = reaper.getData(element);
```

Now you'll get this data structure back:

```javascript
var data = {
    blog: {
        post: {
            id: 32,
            title: "Reaper",
            body: "Easy extraction of form field values"
        }
    }
};
```

## Configuring Reaper

By default, Reaper returns a flat key-value pair object, and it omits
empty form fields.

In the __Getting Started__ section we looked at how to get back a
deeply nested object. You can optionally get empty form fields
returned as well as null values using the `allowNulls` flag:

```html
<form id="blog-post-form">
    <input type="text" name="blog[post][title]" value="Reaper">
    <input type="hidden"name="blog[post][id]" value="32">
    <textarea name="blog[post][body]"></textarea>
</form>
```

Now a bit of JavaScript:

```javascript
var reaper = new Reaper();

reaper.allowNulls = true;

var element = document.getElementById("blog-post-form");
var data = reaper.getData(element);
```

The data structure you get back will be:

```javascript
var data = {
    "blog[post][title]": "Reaper",
    "blog[post][id]": 32,
    "blog[post][body]": null
};
```

The `allowNulls` option also works when the `flat` flag is set to
false.

## Downloading Reaper

There are three ways to download Reaper

1. Clone this repository: `git clone https://github.com/gburghardt/reaper.git`

2. [Download from GitHub](https://github.com/gburghardt/reaper/archive/master.zip)

3. Install the Bower package: `bower install reaper`
