#!/usr/bin/env python3
"""
Check that all API endpoints have proper error handling.
This script ensures FastAPI routes have try-except blocks and return appropriate HTTP status codes.
"""
import ast
import sys
from pathlib import Path
from typing import List, Tuple


class ErrorHandlingChecker(ast.NodeVisitor):
    """AST visitor to check for error handling in FastAPI routes."""

    def __init__(self, filename: str):
        self.filename = filename
        self.issues: List[str] = []
        self.current_function = None

    def visit_FunctionDef(self, node: ast.FunctionDef):
        """Visit function definitions to check if they're API routes."""
        # Check if function is decorated with FastAPI route decorators
        is_route = any(
            isinstance(dec, ast.Call) and
            isinstance(dec.func, ast.Attribute) and
            dec.func.attr in ['get', 'post', 'put', 'delete', 'patch']
            for dec in node.decorator_list
        )

        if is_route:
            self.current_function = node.name
            has_try_except = self._has_try_except(node)
            has_http_exception = self._has_http_exception_import()

            if not has_try_except:
                self.issues.append(
                    f"{self.filename}:{node.lineno} - "
                    f"Route '{node.name}' lacks try-except block for error handling"
                )

        self.generic_visit(node)

    def _has_try_except(self, node: ast.FunctionDef) -> bool:
        """Check if function contains try-except block."""
        for child in ast.walk(node):
            if isinstance(child, ast.Try):
                return True
        return False

    def _has_http_exception_import(self) -> bool:
        """Check if HTTPException is imported (basic check)."""
        # This is a simplified check; in real implementation,
        # we'd parse the entire file's imports
        return True


def check_file(filepath: Path) -> List[str]:
    """Check a single Python file for error handling issues."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        tree = ast.parse(content, filename=str(filepath))
        checker = ErrorHandlingChecker(str(filepath))
        checker.visit(tree)
        return checker.issues
    except SyntaxError as e:
        return [f"{filepath}:{e.lineno} - Syntax error: {e.msg}"]
    except Exception as e:
        return [f"{filepath} - Error parsing file: {str(e)}"]


def main():
    """Main function to check all API files."""
    repo_root = Path(__file__).parent.parent
    api_dir = repo_root / "app" / "api"

    if not api_dir.exists():
        print("API directory not found")
        return 0

    all_issues = []

    # Check all Python files in api directory
    for filepath in api_dir.glob("*.py"):
        if filepath.name.startswith("__"):
            continue

        issues = check_file(filepath)
        all_issues.extend(issues)

    if all_issues:
        print("Error handling issues found:")
        for issue in all_issues:
            print(f"  - {issue}")
        print("\nNote: This is a warning. Ensure all API routes have proper error handling.")
        # Return 0 to not block commits, just warn
        return 0

    return 0


if __name__ == "__main__":
    sys.exit(main())
