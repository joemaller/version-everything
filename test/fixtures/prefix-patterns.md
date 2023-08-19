# Multiple Prefixes Test Fixture

These can all be updated by matching this pattern: `/namespace-\d+\/img:/`

- namespace-11/img:1.2.3
- namespace-22/img:2.3.4
- namespace-33/img:5.6.7
- namespace-4567/img:11.222.333

These should not be matched:

- namespace/img:0.0.1
- namespace-55b/img:36.78.123
