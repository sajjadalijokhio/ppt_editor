/**
 * Specifies commit message rules based on conventional commit format.
 * @see https://www.conventionalcommits.org/en/v1.0.0/
 * 
 * Types:
 *   build: Changes related to the build system, such as publishing a version or modifying dependencies.
 *   chore: Other changes that don't modify src or test files, such as changing build processes, or adding dependencies.
 *   docs: Documentation changes.
 *   feat: A new feature.
 *   fix: A bug fix.
 *   perf: A code change that improves performance.
 *   refactor: A code change that neither fixes a bug nor adds a feature.
 *   revert: Reverting to a previous commit.
 *   style: Changes that do not affect the meaning of the code (white-space, formatting, etc).
 *   test: Adding missing tests or correcting existing tests.
 */
/* eslint-env node */
module.exports = {
  extends: ['@commitlint/config-conventional'],
}
