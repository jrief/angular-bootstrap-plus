# Changelog

### 0.6.4

#### Processbar

* The scope of the Angular directive ``bspProcessStep > form`` is computed while linking instead
  of compiling. This cuased problem, if combined with other wrapping directives, which also created
  an isolated scope for their form children. Currently a new isolated scope is created for each
  wrapped from.
