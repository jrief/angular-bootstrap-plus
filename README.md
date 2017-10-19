# angular-bootstrap-plus


## Getting Started

Download [Angular-Bootstrap-Plus][bsplus].

[bsplus]: https://www.npmjs.com/package/angular-bootstrap-plus

In your web page:

```html
<link href="angular-bootstrap-plus/dist/bootstrap-plus.min.css" rel="stylesheet" />

<script src="angular.js" type="text/javascript"></script>
<script src="angular-sanizize.js" type="text/javascript"></script>
<script src="angular-bootstrap-plus/dist/bootstrap-plus.min.js" type="text/javascript"></script>
```

## What is Angular Bootstrap Plus?
This is a collection of Angular directives for Bootstrap, which neither made it into
[Angular Strap](http://mgcrea.github.io/angular-strap/), nor into 
[UI Bootstrap](http://angular-ui.github.io/bootstrap/).


### Currently there are four directives

These directives do not depend on each other and can be used independently
from each other.

* <code>&lt;bsp-select&gt;...&lt;/bsp-select&gt;</code>: Use it to build select elements 
  with active icons.
* <code>&lt;bsp-scrollpanel&gt;...&lt;/bsp-scrollpanel&gt;</code>: Use it to create panes
  which can be scrolled horizontally using large left- and right icons.
* <code>&lt;bsp-processbar&gt;...&lt;/bsp-processbar&gt;</code>: Use it to create a canvas
  with process steps which have to be accessed in consecutive order. Useful to create a
  set of forms, which interdepend on each other and thus have to be filled out one by one.
* <code>&lt;bsp-magnify&gt;...&lt;/bsp-magnify&gt;</code>: Use it to display details of an
  image, if the users moves the mouse over it.

Please check the README file in each of the directive folders.
