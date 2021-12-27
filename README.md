# Find Dead Classes 😵

Simple tool that compares a directory's `.scss` and `.tsx` files, and reports the "dead" code, meaning a class declaration like `.CoolText {}` that is never called in a component, or a class call like `className={styles.AwesomeText}` that is not declared in any style file.

## To Use

In your terminal, navigate to the directory that contains the existing project you want to check:

`cd code/MySweetProject`

Run the script:

`npx @benhammondmusic/find-dead-classes`


The results will be logged to the console; showing each `.scss` file grouped with any related `.tsx` files

> Example



https://user-images.githubusercontent.com/41567007/147434328-a1d543e9-b580-4e6a-b21a-d60da2aca15f.mov



## TODO
- [ ] make script return `{deadClasses: [...], deadDeclarations: [...]}`
- [ ] add tests to ensure expected passes/failures for `/test-project`
- [ ] add more scss/tsx test files to `/test-project`
- [ ] allow config options (.css, .scss, .ts, .js, .jsx)
- [ ] use in Health Equity Tracker as an automated test


https://benhammond.tech
