---
name: terraform-native-testing
description: Use when writing Terraform native tests (terraform test), mocking providers, or integrating Terraform validation into pre-commit and CI pipelines.
allowed-tools: []
---

# Terraform Native Testing

Testing Terraform modules using the built-in `terraform test` framework with `mock_provider`.

## Version Requirements

| Feature | Minimum Version |
|---|---|
| `terraform test` | 1.6 |
| `mock_provider` | 1.7 |
| `override_resource` / `override_data` | 1.7 |

Set `required_version = ">= 1.7"` in all modules when using mock features.

## Per-Module Init Requirement

`mock_provider` mocks API calls, not the provider binary. The provider schema must still be downloaded. Every module directory needs its own `terraform init -backend=false` before `terraform test`. Root-level init does NOT propagate to submodules.

```bash
for dir in modules/collector modules/dynamodb modules/eventbridge bootstrap; do
  terraform -chdir=$dir init -backend=false
  terraform -chdir=$dir test
done
```

## command = plan vs command = apply

`command = plan` cannot evaluate expressions that depend on computed resource attributes (ARNs, IDs). These are `(known after apply)` and cause `Unknown condition value` errors.

| Use `command = plan` | Use `command = apply` |
|---|---|
| Assertions reference input variables, locals, or inline `jsonencode()` built from known values | Assertions need computed attributes (`aws_cloudwatch_log_group.x.arn`, `aws_iam_role.x.arn`) |

With `mock_provider`, `command = apply` is safe — no real cloud resources are created.

## override_resource with Valid ARN Format

The AWS provider validates ARN structure even during mock apply. Mock-generated values fail with `invalid ARN: arn: invalid prefix`. Supply realistic ARNs via `override_resource`:

```hcl
mock_provider "aws" {
  override_resource {
    target = aws_iam_role.lambda_role
    values = {
      arn = "arn:aws:iam::123456789012:role/my-role"
    }
  }
  override_resource {
    target = aws_cloudwatch_log_group.lambda_logs
    values = {
      arn = "arn:aws:logs:eu-central-1:123456789012:log-group:/aws/lambda/my-function"
    }
  }
}
```

## override_data for Data Sources

Data sources like `data.aws_caller_identity.current` need explicit mock values. Without override, computed fields resolve to empty strings, breaking ARN interpolation.

```hcl
mock_provider "aws" {
  override_data {
    target = data.aws_caller_identity.current
    values = {
      account_id = "123456789012"
    }
  }
}
```

## expect_failures for Variable Validation Tests

Variable validation rules (regex, range, allowed values) are testable with `expect_failures`. The test passes when the validation correctly rejects bad input. Always uses `command = plan` — validation happens before any resource planning.

```hcl
run "rejects_invalid_environment" {
  command = plan
  variables {
    environment = "local"
  }
  expect_failures = [
    var.environment,
  ]
}
```

## jsondecode + alltrue for IAM Policy Assertions

IAM policies created via `jsonencode()` can be decoded back in test assertions. Combined with `alltrue()` + `for`, this enables sweep assertions across all policy statements.

```hcl
# Assert specific statement
assert {
  condition     = jsondecode(aws_iam_policy.x.policy).Statement[0].Resource == "arn:aws:lambda:eu-central-1:123456789012:function:context-dev-*"
  error_message = "Lambda must be scoped to context-dev-* functions"
}

# Sweep: no statement except index 9 uses wildcard
assert {
  condition = alltrue([
    for i, stmt in jsondecode(aws_iam_policy.x.policy).Statement :
    stmt.Resource != "*" if i != 9
  ])
  error_message = "Only DescribeLogGroups should have Resource = *"
}

# Condition key assertion
assert {
  condition     = jsondecode(aws_iam_policy.x.policy).Statement[5].Condition.StringEquals["iam:PassedToService"] == "lambda.amazonaws.com"
  error_message = "PassRole must have service condition"
}
```

## nosemgrep Placement Inside jsonencode()

HCL `#` comments are valid inside `jsonencode()` expressions. Semgrep recognizes `nosemgrep` comments regardless of HCL context — it is a text-level pattern match. Place the comment on the line immediately before the finding's match line:

```hcl
policy = jsonencode({
  Statement = [
    {
      Sid    = "AllowLambdaManagement"
      Effect = "Allow"
      # nosemgrep: terraform.lang.security.iam.no-iam-priv-esc-roles.no-iam-priv-esc-roles
      Action = [
        "lambda:CreateFunction",
      ]
    }
  ]
})
```

## Test File Organization

| File | Purpose | Command |
|---|---|---|
| `tests/<module>.tftest.hcl` | Resource config assertions (naming, scoping, tags) | `plan` or `apply` |
| `tests/validation.tftest.hcl` | Variable validation rejection tests | `plan` + `expect_failures` |

All files start with `mock_provider "aws" {}` and a `variables {}` block providing valid defaults. Validation tests override one variable at a time.

## lint-staged Integration

Run Terraform tests on every `.tf` commit alongside fmt, lint, and validate:

```typescript
'**/*.tf': (stagedFiles) => [
  `terraform fmt -write ${stagedFiles.join(' ')}`,
  `cd ${terraformDir} && terraform init -backend=false -upgrade=false`,
  `pnpm terraform:lint:fix`,
  `cd ${terraformDir} && terraform validate`,
  `pnpm terraform:test`,  // runs init + test per module
]
```

With `mock_provider` the full test suite runs in ~15 seconds locally.

## CI Pattern

```bash
# pnpm script
"terraform:test": "cd infrastructure/terraform && for dir in modules/collector modules/dynamodb modules/eventbridge bootstrap; do terraform -chdir=$dir init -backend=false && terraform -chdir=$dir test || exit 1; done"
```
