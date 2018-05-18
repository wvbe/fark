> A tool that you run from your command line to find certain properties about folders in your working dir, and execute other shell commands in that set.

```
# for example:
# - for every npm package in my projects directory
# - show the name and git status
/home/wvbe/projects> fark --filters is-npm --columns name status is-npm

  ╔════════════════════════════════════════════╤════════╤════════╗
  ║ name                                       │ status │ is-npm ║
  ╟────────────────────────────────────────────┼────────┼────────╢
  ║ 0x.ee                                      │ -      │ yes    ║
  ║ ask-nicely                                 │ -      │ yes    ║
  ║ fark                                       │ ADM    │ yes    ║
  ║ gatsby                                     │ -      │ yes    ║
  ║ george                                     │ A      │ yes    ║
  ║ get-rekt                                   │ -      │ yes    ║
  ║ gh-pages-bin                               │ -      │ yes    ║
  ║ hot-reload-all-the-things                  │ -      │ yes    ║
  ║ wvbe.github.io                             │ U      │ yes    ║
  ║ wyb.be                                     │ -      │ yes    ║
  ║ xml-renderer                               │ -      │ yes    ║
  ╟────────────────────────────────────────────┼────────┼────────╢
  ║ name                                       │ status │ is-npm ║
  ╚════════════════════════════════════════════╧════════╧════════╝
```

The columns and filters are designed to be easily pluggable, and use a dependency system in order to retrieve the
required bits of information in the right time and with the lowest effort.

```sh
# recommended installation method:
npm install fark -g
```

<!-- Start of autogenerated README -->

## Options

| short | long      | description                                                                                                                     | required |
|-------|-----------|---------------------------------------------------------------------------------------------------------------------------------|----------|
| -c    | --columns | Additional properties to show for each directory.                                                                               | no       |
| -f    | --filters | Show only results that match all given filters. Use "~" to invert the filter response, and ":" for additional filter arguments. | no       |
| -h    | --help    | Shows you this help page                                                                                                        | no       |
| -$    | --run     | Run this command in every result directory                                                                                      | no       |
| -s    | --sort    | Sort on this column. Use the negation character ("~") to inversely sort. Defaults to the first column.                          | no       |

## Columns

| name           | description                                                                                           |
|----------------|-------------------------------------------------------------------------------------------------------|
| accessed       | The last time this file was accessed                                                                  |
| changed        | The last time the file status was changed                                                             |
| is-git         | This is a git versioned repository                                                                    |
| is-link        | Symbolic link, or no                                                                                  |
| is-npm         | This is an npm package                                                                                |
| is-npm-private | Is this a private package                                                                             |
| modified       | The last time this file was modified                                                                  |
| name           | The directory name                                                                                    |
| npm-prop       | Property $1 of package.json                                                                           |
| path           | The full path to repo                                                                                 |
| status         | Clean status, or any combination of (U) unstaged, (A) additions, (M) modifications and (D) deletions. |

## Filters

| name             | description                                                                                      |
|------------------|--------------------------------------------------------------------------------------------------|
| has-addition     | Wether the repository has any, or a file $1 marked as addition                                   |
| has-deletion     | Wether the repository has any, or a file $1 marked as deletion                                   |
| has-file         | Assert wether file $1 exists                                                                     |
| has-modification | Wether the repository has any, or a file $1 marked as modification                               |
| has-npm-keyword  |                                                                                                  |
| has-unstaged     | Wether the repository has any, or a file $1 marked as unstaged                                   |
| is-git           | Only repositories versioned in git                                                               |
| is-git-ahead     | The repository has a commit that has not been pushed to remote.                                  |
| is-link          | Entry is a symbolic link                                                                         |
| is-npm           |                                                                                                  |
| is-npm-private   |                                                                                                  |
| name-starts-with | Only repositories whose directory starts with $1                                                 |
| path-contains    | Only repositories whose full path contains $1                                                    |
| status           | filter by clean, dirty, or any combination of U (unstaged), A (added), M (modded) or D (deleted) |

