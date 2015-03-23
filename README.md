# angular-bootstrap-plus


## Getting Started

Download [Angular-Bootstrap-Plus][bsplus].

[bsplus]: http://jrief.github.io/angular-bootstrap-plus/angular-bootstrap-plus-0.0.1.zip

In your web page:

```html
<script src="angular.js"></script>
<script src="dist/angular-bootstrap-plus.min.js"></script>
```

## What is Angular Bootstrap Plus?
This is a collection of Angular directives for Bootstrap, which neither made it into
<a href="http://mgcrea.github.io/angular-strap/" target="_new">Angular Strap</a>,
nor into <a href="http://angular-ui.github.io/bootstrap/"  target="_new">UI Bootstrap.

Currently there is only one directive <code>&lt;bsp-select&gt;...&lt;/bsp-select&gt;</code>, but a
compatible slider plugin has already been prepared.

The alert reader might note, that a similar directive exists in <strong>Angular Strap</strong>, but
here one must pass a list of configuration options to this directive. Since I had the need to style
the internals of the drop down menu using pure HTML, this directive didn't fit.

In <strong>UI Bootstrap</strong> no such directive exists and after
<a href="https://github.com/angular-ui/bootstrap/issues/2607">offering this module</a> to the
maintainers, it wasn't accepted. Apparently the UI Bootstrap team wants to follow the same path as
the Angular Strap team. My intention however is to use as much declarative HTML instead of
configuration objects.