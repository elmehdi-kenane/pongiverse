# File structure
* backend
	* will be make it soon...
* frontend
	* src
		* assets
			* landing_page
				* LandingPage.css         
				* AagouzouPicture.svg
				* EkenanePicture.svg
				* IdabligiPicture.svg
				* github-icon.svg
				* linkedin-icon.svg
				* two-rackets-drawing.svg
		* components (contains only .jsx files)
			* landing_page
				* CtaFooterSections.jsx
				* DescriptionCard.jsx
				* HomeSection.jsx
				* LandingPage.jsx
				* TeamCard.jsx
				* TeamSection.jsx
			* Authentication
				* sign_up
				* sign_in
		* App.css
		* App.js
		* App.test.js
		* index.css
		* index.js
		* reportWebVitals.js
		* setupTests.js
	* other files/dirs
- __PS: use (.jsx) extension instead of (.js)__

# git guidelines/conventions

* naming branches using underscore (landing_page, sign_up, ...).
* make your changes as small and “atomic” as possible.

	## Commit Message
	* format: __type__(__scope__): __subject__ __body__
		* example: git commit -m "feat(landing page): Add the login button"
	- type
		* __feat__: introduces a new feature to the codebase
		* __fix__: patches a bug in your codebase
		* __refactor__: rewrite/restructure your code, however does not change any behaviour
		* __style__: do not affect the meaning (white-space, formatting, missing semi-colons, etc)
		* __test__: add missing tests or correcting existing tests
		* __docs__: affect documentation only
		* __build__: affect build components like build tool, ci pipeline, dependencies, project version, …
		* __ops__: affect operational components like infrastructure, deployment, backup, recovery, …
		* __chore__: Miscellaneous commits e.g. modifying .gitignore
	- scope
		* The “scope” field should be a noun that represents the part of the codebase affected by the commit.
		For example, if the commit changes the login page, the scope could be “login”. If the commit affects multiple areas of the codebase, “global” or “all” could be used as the scope.
	- subject
		* The subject contains a succinct description of the change, a short summary of the things you have done in the commit.
		* Use the imperative, present tense: “change” not “changed” nor “changes”. Think of This commit will {subject}
		* Don’t capitalize the first letter
		* No dot (.) at the end (you have only 50 chars)
	- body (Is an optional part of the format)
		* Use a blank line between the subject and the body.
		* Includes motivation for the change and contrasts with previous behavior.
	
* [How to Write a Git Commit Message](https://cbea.ms/git-commit/)
* [atomic-commits](https://www.freshconsulting.com/insights/blog/atomic-commits/)
* [Mastering Git: The Power of Conventional Commit Messages](https://blog.stackademic.com/mastering-git-the-power-of-conventional-commit-messages-1bfbd1cae2c2)
* [Conventional Commits 1.0.0-beta.2](https://www.conventionalcommits.org/en/v1.0.0-beta.2/)
* [Understanding the Git Workflow](https://sandofsky.com/workflow/git-workflow/)

# React coding standards
- Only include one React component per file.
- Use PascalCase naming convention for filename as well as component name, e.g. GlobalHeader.js
- Follow these alignment styles for JSX syntax
```
// bad
<Foo superLongParam="bar"
     anotherSuperLongParam="baz" />

// good
<Foo
  superLongParam="bar"
  anotherSuperLongParam="baz"
/>

// if props fit in one line then keep it on the same line
<Foo bar="bar" />

// children get indented normally
<Foo
  superLongParam="bar"
  anotherSuperLongParam="baz"
>
    <Spazz />
</Foo>
```
- Always use double quotes (") for JSX attributes.
- Always use camelCase for prop names.

```
// bad
<Foo
    UserName="hello"
    phone_number={12345678}
/>

// good
<Foo
    userName="hello"
    phoneNumber={12345678}
/>
```
#### learn more
* [reactjs-guidelines](https://github.com/pillarstudio/standards/tree/master).

## Good practices
* Use meaningful component names
* Break down components
* Use destructuring
* Keep components small
* Use prop-types
* Use functional components
* Avoid using inline styles
* Use arrow functions
* Use stateless components
* Use the spread operator
* Clear and concise comments are essential for understanding code, but too many can clutter it. 

#### learn more about
* [writing-clean-react-code](https://www.turing.com/kb/writing-clean-react-code).