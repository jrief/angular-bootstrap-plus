The alert reader might note, that a similar directive exists in <strong>Angular Strap</strong>, but
here one must pass a list of configuration options to this directive. Since I had the need to style
the internals of the drop down menu using pure HTML, this directive didn't fit.

In <strong>UI Bootstrap</strong> no such directive exists and after
<a href="https://github.com/angular-ui/bootstrap/issues/2607">proposing this module</a> to the
maintainers, it wasn't accepted. Apparently the UI Bootstrap team wants to follow the same path as
the Angular Strap team. My intention however is to use as much declarative HTML instead of
configuration objects.
