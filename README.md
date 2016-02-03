## Publishing

1. add new tests
1. do changes
1. run tests
1. update README.md
1. update version in package.json
1. commit code
1. build documentation
1. commit documentation
1. npm publish
1. check CI tools reports
1. check online documentation

## Building documentation

If documentation is in ***qpp-web*** folder that is sibling with code folder ***qpp***, then the corrrect way to compile is:

```bash
cdd qpp
jsdoc -c ../qpp-web/jsdoc/config.js 
```
