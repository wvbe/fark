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

