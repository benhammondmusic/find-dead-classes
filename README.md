# Find Dead Classes 😵

## Simple tool that compares a directory's `.scss` and `.tsx` files, and reports the "dead" code.

> "Dead" meaning a class declaration like `.CoolText {}` that is never called in a component, or a class call like `className={styles.AwesomeText}` that is not declared in any style file.

## To Use

In your terminal, navigate to the directory that contains your project:

`cd code/MySweetProject`

Run the script:

`npx @benhammondmusic/find-dead-classes`


## TODO
- [ ] add tests
- [ ] write a real readme
- [ ] make it run as a node module
- [ ] allow config options (.css, .scss, .ts, .js, .jsx)
- [ ] publish
- [ ] use in Health Equity Tracker as an automated test



https://benhammond.tech
