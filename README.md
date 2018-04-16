A tool to find certain properties about each in a list of directories, such as the current git branch, npm version or
modification date. You can also filter out a set that matches specific criteria.

__In the future:__ execute shell commands in each of the results.

```sh
$ npm install fark -g
$ fark -c path status is-npm -f is-git
```

Could yield:

```
  ╔═════════════════════════════════════════════════╤════════╤════════╗
  ║ path                                            │ status │ is-npm ║
  ╟─────────────────────────────────────────────────┼────────┼────────╢
  ║ /git/0x.ee                                      │ clean  │ yes    ║
  ║ /git/ask-nicely                                 │ dirty  │ yes    ║
  ║ /git/fark                                       │ dirty  │ yes    ║
  ║ /git/gatsby                                     │ clean  │ yes    ║
  ║ /git/george                                     │ dirty  │ yes    ║
  ║ /git/get-rekt                                   │ dirty  │ yes    ║
  ║ /git/gh-pages-bin                               │ dirty  │ yes    ║
  ║ /git/hot-reload-all-the-things                  │ dirty  │ yes    ║
  ║ /git/wvbe.github.io                             │ dirty  │ no     ║
  ║ /git/wyb.be                                     │ clean  │ yes    ║
  ║ /git/xml-renderer                               │ clean  │ yes    ║
  ╟─────────────────────────────────────────────────┼────────┼────────╢
  ║ path                                            │ status │ is-npm ║
  ╚═════════════════════════════════════════════════╧════════╧════════╝
```

The columns and filters are designed to be easily pluggable, and use a dependency system in order to retrieve the
required bits of information in the right time and with the lowest effort.

# Options

__-c --columns__
Additional properties to show for each directory.

__-f --filters__
Show only results that match all given filters. Use "~" to invert the filter response, and ":" for additional filter
arguments.

__-h --help__
Shows you this help page

__-s --sort__
Sort on this column. Use the negation character ("~") to inversely sort. Defaults to the first column.


# Columns

| Name              | Description                                      |
|-------------------|--------------------------------------------------|
| accessed          | The last time this file was accessed             |
| changed           | The last time the file status was changed        |
| is-git            | This is a git versioned repository               |
| is-link           | Symbolic link, or no                             |
| is-npm            | The directory name                               |
| modified          | The last time this file was modified             |
| name              | The directory name                               |
| npm:description   | The description in package.json                  |
| npm:homepage      | The homepage in package.json                     |
| npm:is-private    | Is this a private package                        |
| npm:license       | The license in package.json                      |
| npm:name          | The name in package.json                         |
| npm:version       | The version in package.json                      |
| path              | The full path to repo                            |
| status            | A clean or dirty status                          |

# Filters

| Name              | Description                                      |
|-------------------|--------------------------------------------------|
| is-git            | <no description>                                 |
| is-git-controlled | <no description>                                 |
| is-link           | Entry is a symbolic link                         |
| is-npm            | <no description>                                 |
| is-npm-private    | <no description>                                 |
| name-starts-with  | Only repositories whose directory starts with $1 |
| path-contains     | Only repositories whose full path contains $1    |
| status            | <no description>                                 |

