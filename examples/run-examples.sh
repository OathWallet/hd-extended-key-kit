#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Node API example"
node "$ROOT/examples/node/example.mjs"

echo "==> CLI example"
sh "$ROOT/examples/cli/run.sh"

echo "All examples passed"
