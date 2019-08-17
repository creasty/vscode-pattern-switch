# vscode-pattern-switch

Switch the text under cursor to alternative patterns.

## Configuration

- `patternSwitch.replaceRules`
- `patternSwitch.toggleRules`

Please refer the contributions in `package.json` for more details.

## Command & keybinding

- Command: `patternSwitch.switchUnderCursor`

I recommend to use the following keybindings.

```json
{
  "key": "-",
  "command": "patternSwitch.switchUnderCursor",
  "when": "editorTextFocus && vim.active && vim.mode == 'Normal'"
},
{
  "key": "ctrl+l",
  "command": "patternSwitch.switchUnderCursor",
  "when": "editorTextFocus && vim.active && vim.mode == 'Insert'"
}
```

## Default rules

General:

| Pattern | Description |
|---|---|
| `_+_`, `+` | Add/remove spaces around operators <code>*/%&lt;&gt;&amp;+-|^=~?!$#@\:.,'`</code> |
| `true`, `false` | |
| `on`, `off` | |
| `yes`, `no` | |
| `TRUE`, `FALSE` | |
| `ON`, `OFF` | |
| `YES`, `NO` | |
| `public`, `protected`, `private` | |
| `import`, `export` | |
| `if`, `unless` | |
| `bottom`, `top` | |
| `down`, `up` | |
| `left`, `right` | |

Golang:

| Pattern | Description |
|---|---|
| `chan`, `<-chan`, `chan<-` | Channel: RW <> R <> W |

Ruby:

| Pattern | Description |
|---|---|
| `:foo`, `'foo'` | Symbol <> String |
| `foo: ...`, `'foo' => ...` | Symbol key <> Hash rocket syntax |

RSpec:

| Pattern | Description |
|---|---|
| `it`, `xit` | Mark/unmark as pending |
| `describe`, `xdescribe` | Mark/unmark as pending |
| `context`, `xcontext` | Mark/unmark as pending |
| `scenario`, `xscenario` | Mark/unmark as pending |
