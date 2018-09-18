# fark

**A (command line) tool to work with the mess of git repositories that is your projects folder.**

You would `fark` by typing in your terminal (any of the following):

```sh
# Lists all your projects
/home/wvbe/projects> fark

# Lists all projects that have uncommitted changes
/home/wvbe/projects> fark -f status:dirty

# Pull-rebase all projects that have a clean git state
/home/wvbe/projects> fark -f status:clean -$ git pull -r

# Create an npm package out of every project that isn't already
/home/wvbe/projects> fark -f ~has-file:package.json -$ npm init --yes
```

You wield your power with precision using zero, one or many `--filters`, `--columns` and the `--run` option and some
other stuff. For the comfort of your awesome fingertips, each of those also has an abbreviated form (`-f`, `-c`, etc.)

- Filters narrow down the scope of projects that are logged back to you, or used for `--run`.
- Columns simply log more stuff in an invention called "table".
- Run a command to gain additional skill points in crafting unicorn blockchain hacks. Use responsibly.

Output of `fark` could be something like:

```sh
/home/wvbe/projects> fark --filters is-npm --columns name npm-prop:version is-git status is-git-ahead
╔══════════════╤═════════════╤════════╤════════╤══════════════╗
║ name         │ npm-prop    │ is-git │ status │ is-git-ahead ║
╟──────────────┼─────────────┼────────┼────────┼──────────────╢
║ ask-nicely   │ 3.0.1       │ yes    │        │ no           ║
║ fark         │ 1.0.2       │ yes    │ M      │ no           ║
║ luggage      │ 1.0.0       │ yes    │        │ no           ║
║ oxee         │ 4.0.0-alpha │ yes    │ UDM    │ no           ║
║ poseidon     │ 0.1.0       │ yes    │        │ no           ║
║ react-world  │ 0.1.0       │ yes    │ UDM    │ no           ║
║ wyb.be       │ 0.1.0       │ yes    │ UDM    │ no           ║
║ xml-renderer │ 1.2.0       │ yes    │ UADM   │ no           ║
╟──────────────┼─────────────┼────────┼────────┼──────────────╢
║ name         │ npm-prop    │ is-git │ status │ is-git-ahead ║
╚══════════════╧═════════════╧════════╧════════╧══════════════╝

Directories:  8
Filters:      is-npm
Props:        name, npm-prop, is-git, status, is-git-ahead
Time:         217ms

# If you use --run, the execution results for each project listed above are shown here
```

## Install

```sh
npm install fark -g
```

<!-- Start of autogenerated README -->

## Options

| short | long      | description                                                                                                                     | required |
|-------|-----------|---------------------------------------------------------------------------------------------------------------------------------|----------|
| -c    | --columns | Additional properties to show for each directory.                                                                               | no       |
| -f    | --filters | Show only results that match all given filters. Use "~" to invert the filter response, and ":" for additional filter arguments. | no       |
| -g    | --glob    | Globbing pattern(s) for finding your projects. Defaults to "*".                                                                 | no       |
| -h    | --help    | Shows you this help page                                                                                                        | no       |
| -$    | --run     | Run this command in every result directory                                                                                      | no       |
| -s    | --sort    | Sort on this column. Use the negation character ("~") to inversely sort. Defaults to the first column.                          | no       |

## Columns

| name              | description                                                                                           |
|-------------------|-------------------------------------------------------------------------------------------------------|
| accessed          | The last time this file was accessed                                                                  |
| changed           | The last time the file status was changed                                                             |
| git-branch        | The branch name that is currently checked out                                                         |
| has-addition      | Wether the repository has any, or a file $1 marked as addition                                        |
| has-branch        | Assert wether $1 is a branch on the local machine or any of the remotes                               |
| has-deletion      | Wether the repository has any, or a file $1 marked as deletion                                        |
| has-file          | Assert wether file $1 exists                                                                          |
| has-local-branch  | Assert wether $1 is a branch on the local machine                                                     |
| has-modification  | Wether the repository has any, or a file $1 marked as modification                                    |
| has-npm-keyword   | The package has been labelled with keyword $1                                                         |
| has-npm-script    | The package has an npm script called $1                                                               |
| has-remote-branch | Assert wether $1 is a branch on any of the remotes, or on remote $2 if the second argument is used.   |
| has-unstaged      | Wether the repository has any, or a file $1 marked as unstaged                                        |
| is-git            | This is a git versioned repository                                                                    |
| is-git-ahead      | The repository has a commit that has not been pushed to remote.                                       |
| is-git-behind     | The remote has a commit that has not been pulled.                                                     |
| is-link           | Symbolic link, or no                                                                                  |
| is-npm            | This is an npm package                                                                                |
| is-npm-private    | Is this a private package                                                                             |
| modified          | The last time this file was modified                                                                  |
| name              | The directory name                                                                                    |
| name-starts-with  | Only repositories whose directory starts with $1                                                      |
| npm-prop          | Property $1 of package.json                                                                           |
| path              | The full path to repo                                                                                 |
| path-contains     | Only repositories whose full path contains $1                                                         |
| remote-status     | The number of commits ahead and behind on the tracked remote branch                                   |
| status            | Clean status, or any combination of (U) unstaged, (A) additions, (M) modifications and (D) deletions. |

## Filters

| name              | description                                                                                         |
|-------------------|-----------------------------------------------------------------------------------------------------|
| has-addition      | Wether the repository has any, or a file $1 marked as addition                                      |
| has-branch        | Assert wether $1 is a branch on the local machine or any of the remotes                             |
| has-deletion      | Wether the repository has any, or a file $1 marked as deletion                                      |
| has-file          | Assert wether file $1 exists                                                                        |
| has-local-branch  | Assert wether $1 is a branch on the local machine                                                   |
| has-modification  | Wether the repository has any, or a file $1 marked as modification                                  |
| has-npm-keyword   | The package has been labelled with keyword $1                                                       |
| has-npm-script    | The package has an npm script called $1                                                             |
| has-remote-branch | Assert wether $1 is a branch on any of the remotes, or on remote $2 if the second argument is used. |
| has-unstaged      | Wether the repository has any, or a file $1 marked as unstaged                                      |
| is-git            | This is a git versioned repository                                                                  |
| is-git-ahead      | The repository has a commit that has not been pushed to remote.                                     |
| is-git-behind     | The remote has a commit that has not been pulled.                                                   |
| is-link           | Symbolic link, or no                                                                                |
| is-npm            | This is an npm package                                                                              |
| is-npm-private    | Is this a private package                                                                           |
| name-starts-with  | Only repositories whose directory starts with $1                                                    |
| path-contains     | Only repositories whose full path contains $1                                                       |
| status            | filter by clean, dirty, or any combination of U (unstaged), A (added), M (modded) or D (deleted)    |

