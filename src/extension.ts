// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const cachedConfig: {
    rules?: Rule[];
  } = {};

  function getRules(): Rule[] {
    if (!cachedConfig.rules) {
      const config = vscode.workspace.getConfiguration("patternSwitch");
      cachedConfig.rules = computeRules(config);
    }
    return cachedConfig.rules;
  }

  context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
    if (e.affectsConfiguration("patternSwitch.replaceRules") || e.affectsConfiguration("patternSwitch.toggleRules")) {
      cachedConfig.rules = undefined;
    }
  }));

  context.subscriptions.push(vscode.commands.registerTextEditorCommand(
    "patternSwitch.switchUnderCursor",
    textEditor => {
      const rules = getRules();
      switchUnderCursor(textEditor, rules);
    }
  ));
}

// this method is called when your extension is deactivated
export function deactivate() {}

interface Config {
  replaceRules: {
    from: string;
    to: string;
    caseSensitive?: boolean;
  }[];
  toggleRules: string[][];
}

interface Rule {
  from: RegExp;
  to: string;
}

function computeRules(config: vscode.WorkspaceConfiguration): Rule[] {
  const replaceRules: Config["replaceRules"] = config.get("replaceRules") || [];
  const toggleRules: Config["toggleRules"] = config.get("toggleRules") || [];

  const rules: Rule[] = [];

  for (const rule of replaceRules) {
    rules.push({
      from: new RegExp(rule.from, rule.caseSensitive === true ? "" : "i"),
      to: rule.to,
    });
  }

  for (const toggle of toggleRules) {
    const len = toggle.length;
    for (let i = 0; i < len; i++) {
      const current = toggle[i];
      const next = toggle[(i + 1) % len];
      rules.push({
        from: new RegExp(`\\b${escapeRegexp(current)}\\b`, ""),
        to: escapeSubstitution(next),
      });
    }
  }

  return rules;
}

interface Match {
  line: number;
  start: number;
  end: number;
  substitution: string;
}

function substitute(textEditor: vscode.TextEditor, match: Match) {
  textEditor.edit(builder => {
    const range = new vscode.Range(
      match.line,
      match.start,
      match.line,
      match.end,
    );
    builder.replace(range, match.substitution);
  }, { undoStopBefore: true, undoStopAfter: true });
}

function switchUnderCursor(textEditor: vscode.TextEditor, rules: Rule[]) {
  if (textEditor.selections.length !== 1) {
    return;
  }

  const selection = textEditor.selection;
  if (!selection.isEmpty) {
    return;
  }

  const line = selection.anchor.line;
  const lineText = textEditor.document.lineAt(line).text;

  let finalMatch: Match | undefined;
  for (const rule of rules) {
    const match = lineText.match(rule.from);
    if (!match) {
      continue;
    }

    const start = match.index || 0;
    const end = start + match[0].length;
    if (start > selection.anchor.character || selection.anchor.character > end) {
      continue;
    }
    if (finalMatch && (end - start) > (finalMatch.end - finalMatch.start)) {
      continue;
    }

    finalMatch = {
      line,
      start,
      end,
      substitution: replacePlaceholders(rule.to, match),
    };
  }

  if (!finalMatch) {
    return;
  }
  substitute(textEditor, finalMatch);
}

function escapeRegexp(str: string): string {
	return str.replace(/[|\\{}()[\]^$+*?.-]/g, '\\$&');
}

function escapeSubstitution(str: string): string {
  return str.replace(/(?<!\$)\$(\d+)/g, '$$$$$1');
}

function replacePlaceholders(str: string, placeholders: string[]) {
  return str
    .replace(/(?<!\$)\$(\d+)/g, (_0, _1) => placeholders[+_1] || _0)
    .replace(/\$(\$\d+)/g, '$1');
}
