# Contributing to the OTTAA Project

We would love your help in the OTTAA Project. We have compiled this useful guide to all the ways you can collaborate. Reading it carefully before you start is important to maintain consistency in the project quality and ensure a respectful and positive environment in our community.

## Table of contents

<div id="toc_container">
<p class="toc_title">Contents</p>
<ol class="toc_list">
  <li><a href="#Ways-of-contributing">Ways of contributing</a>
  <li><a href="#As-a-developer">As a developer</a></li>
    <ol>
      <li><a href="#Setting-up-your-IDE">Setting up your IDE</a></li>
      <li><a href="#setting-up-your-firebase-project">Setting up your Firebase Project</a></li>
      <li><a href="#Reporting-an-issue">Reporting an issue</a></li>
      <li><a href="#Submitting-a-pull-request">Submitting a pull request</a></li>
      <li><a href="#Code-conventions">Code conventions</a></li>
      <li><a href="#Analytics-implementation">Analytics implementation</a></li>
    </ol>
  </li>
  <li><a href="#As-a-translator">As a Translator</a>
    <ol>
      <li><a href="#Lexicon_rules">Lexicon Rules</a></li>
      <li><a href="#your_ideas">Your Ideas</a></li>
    </ol>
  </li>
  <li><a href="#As-a-manual-tester">As a manual tester</a></li>
  <li><a href="#As-an-automation-tester">As an automation tester</a></li>
  <li><a href="#On-our-code-of-conduct">Code of conduct</a></li>
  </ol>
</div>

## Ways of contributing

You may contribute to OTTAA

- as a developer; 
- as a translator; 
- as a manual tester;
- as an automation tester. 

## As a developer

### Required knowledge

In order to contribute as a developer, you will need to have a basic understanding of Javascript and NodeJS. We also strongly recommend you be familiar with Firebase and/or other providers of infrastructure, platform and database as a service (IaaS, PaaS, DbaaS).

### Setting up your app

After you forked and/or cloned/downloaded the projects repository, follow this steps for basic configuration:
- Download and install [npm](https://www.npmjs.com) for your Operating System (other NodeJS package manager might be functional too, still we recomend using npm)
- Run `npm install` on the console inside the *functions* folder of the repository, to install all dependencies (that are already listed on the *package.json* file)
- Since we use the services of Firebase, create and setup your own Firebase Project, create a Service Account and change the *.env* file with your data (be careful not to push any changes to the *.env* file), this is detailed on [Setting up your Firebase Project](#setting-up-your-firebase-project).
- Run `npm run build` to deploy the app on a local server.

### Setting up your Firebase Project

To be able to use your own version of our app, you need your own Firebase Project:
- You will need a Firebase Account. Since Firebase is associated with Google Cloud, having a Google account will work on Firebase.
- Enter [Firebase](https://firebase.google.com/) and go to the console.
- Create a new project (or select an existing one), [here](https://docs.kii.com/en/samples/push-notifications/push-notifications-android-fcm/create-project/) you have a more detailed guide on it.
- Once your project is setup, activate the *Realtime Database* functionality inside *Build*, create a database and load your own version of the lexicon (you can use the provided template). Copy the URL of the lexicon database and paste it in the *.env* file, under the **DATABASE_URL** variable.
- Finally, setup a Service Account, inside Project Setup, this will allow you to use [**firebase-admin**](https://firebase.google.com/docs/admin/setup) functionalities. Save the JSON file inside the functions folder and add the path to the *.env* file, under the **SERVICE_ACCOUNT** variable. There's no need to copy the code snippet provided on the Service Account creation, since it's already added and uses the data on the *.env* file.

### Reporting an issue

Any bug or hotfix that results from manual testing should be reported via an [issue](https://github.com/OTTAA-Project/ottaa_project_flutter/issues) in our GitHub repository using the **[template](https://github.com/OTTAA-Project/ottaa_project_flutter/issues/new?assignees=&labels=&template=bug_report.md&title=)** for bug reporting and **providing as much information as possible** about the bug, including: used **version of OTTAA** and/or **version of web navigator** and clear instructions on how to **reproduce** the bug.

### Submitting a pull request

Please bear the following in mind when creating a PR:

* Avoid file conflicts with the source code.
* Make a detailed description about the features it applies to.
* Make the PR in the corresponding branch.
* Avoid your PR containing unrelated commits, keep it focused on its scope.
* Avoid pushing any changes on the *.env* file, if you have already done so, revert it to the ones in the master brunch.

#### Commits

We use the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for our commit messages. Under this convention the commit message should be structured like this:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Bear in mind:

1) Type *fix:*: patches a bug in your codebase.
2) Type *feat:*: introduces a new feature to the codebase (this correlates with MINOR in Semantic Versioning).
3) Types other than *fix:*: and *feat:*: are allowed, for example *build:*, *chore:*, *ci:*, *docs:*, *style:*, *refactor:*, *perf:*, *test:*.
4) Footer BREAKING CHANGE or *!* after type/scope: introduces a breaking API change (correlating with MAJOR in Semantic Versioning). 
5) A BREAKING CHANGE can be part of commits of any type.
6) Footers other than *BREAKING CHANGE* may be provided and follow a convention similar to [git trailer format](https://git-scm.com/docs/git-interpret-trailers).

##### Examples

Commit message with description and BREAKING CHANGE footer:

*feat: allow provided config object to extend other configs*
*BREAKING CHANGE: `extends` key in config file is now used for extending other config files*

Commit message with scope and ! to draw attention to breaking change

*feat(api)!: send an email to the customer when a product is shipped

Commit message with both ! and BREAKING CHANGE footer

*chore!: drop support for Node 6
*BREAKING CHANGE: use JavaScript features not available in Node 6.

#### Branch naming 

To name and describe our branches we use the type of change it will contain and a short description, following Git [branching models](https://git-scm.com/book/en/v2/Git-Branching-Branching-Workflows).

Examples:

|Instance|Branch|Description, Instructions, Notes|
|---|---|---|
|Stable|	main	|Accepts merges from Working and Hotfixes|
|Development|	dev|Accepts merges from Features/Issues, Fixes and Hotfixes|
|Features/Issues|	feat/*	|Always branch off HEAD of Working|
|Fixes|	fix/*	|Always branch off HEAD of Working|
|Hotfix|	hotfix/*	|Always branch off Stable

### Code conventions

Not defined yet.

## As a linguist/translator

Realiser currently only supports Spanish, but we expect to include other languages too.
As a linguist or translator you can contribute creating lexicons for new languages, improving the rules of already created lexicon or create new rules.
In both cases, you should consider [following](#lexicon_directives) this directives:

### Lexicon directives

- the main keys of the lexicon are the different language, that contain the rules for that language:
```
lexicon
|__es
|  |__LEXICON_RULES_IN_SPANISH
|__en
|  |__LEXICON_RULES_IN_ENGLISH
...
```
- rules categories and wordtypes, that are general for every language and will be *hardcoded* on the app scripts, are capitalized, and rules specific for each language, toghether with the specific data are lowercased. For example, the **VERB** category is capitalized, but **times** and **persons** for each verb conjugation are lowercased because they can differ throughout each language (some languages have formal and informal SECOND PERSON, some have neutral aside from feminine and masculine THIRD PERSON):
```
lexicon
|__es
|  |__VERBS
|  |  |__INFINITIVES
|  |  |   ...
|  |  |__CONJUGATIONS
|  |  |   |__caminar
|  |  |   |   |__presente
|  |  |   |   |   |__yo: camino
|  |  |   |   |   |__vos: caminás
|  |  |   |   |   |__tú: caminas
|  |  |   |   |   ...
|  |  |   ...
|  ...
|__en
|  |__VERBS
|  |  |__INFINITIVES
|  |  |   ...
|  |  |__CONJUGATIONS
|  |  |   |__walk
|  |  |   |   |__present
|  |  |   |   |   |__i: walk
|  |  |   |   |   |__you: walk
|  |  |   |   |   ...
|  |  |   ...
|  ...
...
```
- exceptions can be added with a special **EXCEPTION** key:
```
VERBS
|__SEQUENCES
|   |__word
|   |   |__DEFAULT: next-word
|   |   |__EXCEPTION
|   |   |   |__case1: next-word-case1
|   |   |   |__case2: next-word-case2
|   |   ...
...
```
- clarifications can be added inside the data itself with a *:* separator:
```
HEADS
|__head_wordtype
|   |__child_wordtype: SING
|   |__child_wordtype: MULT:LEFT
|   |__child_wordtype: MULT:UNID
|   ...
...
```
- sequences inside the data are refered with a *,* separator or the array structure, depending on the case
```
language
|__VERBS
|   |__SEQUENCES
|   |   |__word
|   |   |   |__DEFAULT: next-word1,next-word2
|   ...
|__PERSONS
|   |__GENDERS: [[masc_sing, masc_plural], [fem_sing, fem_plural]]
|   ...
...
```

### Your ideas

But still remember this is a work in progress, so don't restrain to contribute only with data but bring your ideas for datastructures and algorithm logic on board too! Propose them on an issue or pull request.

### Lexicon Template

You can find a lexicon templates on (COMPLETE WHEN UPLOADED)

## As a manual tester

We are currently setting everything up for you to be able to test the Realiser API, for now you can do so by cloning our repo and deploying the app on your device locally using `npm run build`

## As an automation tester 

According to common practices in API development, we implemented two types of tests:

- Unit Testing: using [mocha](https://mochajs.org/), [chai](https://www.chaijs.com/) and [istambul](https://istanbul.js.org/) we've tested 80-90% of the app scripts. You can run them using `npm run unitest`. The rest results will be saved in *functions/tests/results/methods* and the test coverage at *functions/coverage*.
- HTTP Testing: using [mocha](https://mochajs.org/), [chai](https://www.chaijs.com/) and [supertest](https://www.npmjs.com/package/supertest) we've tested all possible endpoints. You can run them using `npm run clientest`. The rest results will be saved in *functions/tests/results/requests*.

You can run both test sequentially using `npm test` or `npm run test`.

Keep in mind that some of the test still use lexicon data from Firebase, so if your Firebase Project and Database are not completely [setup](#setting-up-your-firebase-project), the tests might fail or you might get a different result.

## On our code of conduct

Please read through our [code of conduct](CODE_OF_CONDUCT.md) before contributing.

