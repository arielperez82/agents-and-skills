# Terraform Native Testing — Findings for Skill/Agent/Command Updates

  1. mock_provider Requires Per-Module Init  
   
  Finding: mock_provider "aws" {} does NOT eliminate the need for terraform init. It mocks API calls, not the provider binary. The provider schema must still be downloaded.  
   
  Implication: Every module directory needs its own terraform init -backend=false before terraform test. Root-level init does NOT propagate to submodules.

  CI pattern:
  for dir in modules/collector modules/dynamodb modules/eventbridge bootstrap; do
 terraform -chdir=$dir init -backend=false
 terraform -chdir=$dir test
  done

  pnpm script pattern:
  "terraform:test": "cd infrastructure/terraform && for dir in modules/collector modules/dynamodb modules/eventbridge bootstrap; do terraform -chdir=$dir init -backend=false && terraform -chdir=$dir test || exit 1; done"

  ---
  2. command = plan vs command = apply — When to Use Each

  Finding: command = plan cannot evaluate expressions that depend on computed resource attributes (ARNs, IDs). These are (known after apply) and cause Unknown condition value errors when used in jsondecode() or comparisons.

  Rule of thumb:
  - Use command = plan when assertions only reference input variables, locals, or inline jsonencode() built from known values (e.g., bootstrap IAM policy built from local.region + local.account_id)
  - Use command = apply when assertions need computed attributes (e.g., aws_cloudwatch_log_group.x.arn referenced inside a policy JSON, or aws_iam_role.x.arn)

  With mock_provider, command = apply is safe — no real AWS resources are created.

  ---
  3. override_resource Must Use Valid ARN Format

  Finding: The AWS provider validates ARN structure even during mock apply. Mock-generated values like "role" (96lkg2v0) fail with invalid ARN: arn: invalid prefix.

  Fix: Use override_resource in mock_provider to supply realistic ARNs:
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

  ---
  4. override_data for Data Sources

  Finding: Data sources like data.aws_caller_identity.current need explicit mock values. Without override, computed fields like account_id resolve to empty strings, breaking ARN interpolation.

  mock_provider "aws" {
 override_data {
   target = data.aws_caller_identity.current
   values = {
  account_id = "123456789012"
   }
 }
  }

  ---
  5. expect_failures for Variable Validation Tests

  Finding: Variable validation rules (regex, range, allowed values) are testable with expect_failures. The test passes when the validation correctly rejects bad input.

  run "rejects_invalid_environment" {
 command = plan
 variables {
   environment = "local"
 }
 expect_failures = [
   var.environment,
 ]
  }

  These always use command = plan — validation happens before any resource planning.

  ---
  6. jsondecode + alltrue for IAM Policy Assertions

  Finding: IAM policies created via jsonencode() can be decoded back in test assertions. Combined with alltrue() + for, this enables sweep assertions across all policy statements.

  # Assert specific statement
  assert {
 condition  = jsondecode(aws_iam_policy.x.policy).Statement[0].Resource == "arn:aws:lambda:eu-central-1:123456789012:function:context-dev-*"
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
 condition  = jsondecode(aws_iam_policy.x.policy).Statement[5].Condition.StringEquals["iam:PassedToService"] == "lambda.amazonaws.com"
 error_message = "PassRole must have service condition"
  }

  ---
  7. nosemgrep DOES Work Inside jsonencode()

  Finding (corrects prior belief): HCL # comments are valid inside jsonencode() expressions. Semgrep recognizes nosemgrep comments regardless of HCL context — it's a text-level pattern match.

  Placement: Line immediately before the finding's match line (typically Action = [):

  policy = jsonencode({
 Statement = [
   {
  Sid = "AllowLambdaManagement"
  Effect = "Allow"
  # nosemgrep: terraform.lang.security.iam.no-iam-priv-esc-roles.no-iam-priv-esc-roles, terraform.lang.security.iam.no-iam-resource-exposure.no-iam-resource-exposure
  Action = [
 "lambda:CreateFunction",
 ...
  ]
   }
 ]
  })

  Result: 63 semgrep rules scanned, 0 findings (was 6 unsuppressed false positives).

  ---
  8. Test File Organization Convention

  ┌─────────────────────────────┬────────────────────────────────────────────────────┬────────────────────────┐
  │   File │ Purpose  │  Command   │
  ├─────────────────────────────┼────────────────────────────────────────────────────┼────────────────────────┤
  │ tests/<module>.tftest.hcl   │ Resource config assertions (naming, scoping, tags) │ plan or apply │
  ├─────────────────────────────┼────────────────────────────────────────────────────┼────────────────────────┤
  │ tests/validation.tftest.hcl │ Variable validation rejection tests │ plan + expect_failures │
  └─────────────────────────────┴────────────────────────────────────────────────────┴────────────────────────┘

  All files start with mock_provider "aws" {} and a variables {} block providing valid defaults. Validation tests override one variable at a time.

  ---
  9. Terraform Version Requirements

  ┌───────────────────────────────────┬─────────────────┐
  │  Feature  │ Minimum Version │
  ├───────────────────────────────────┼─────────────────┤
  │ terraform test  │ 1.6 │
  ├───────────────────────────────────┼─────────────────┤
  │ mock_provider   │ 1.7 │
  ├───────────────────────────────────┼─────────────────┤
  │ override_resource / override_data │ 1.7 │
  └───────────────────────────────────┴─────────────────┘

  We bumped required_version to >= 1.7 in all modules and CI to 1.10.5.

  ---
  10. lint-staged Integration

  Terraform tests should run on every .tf commit alongside fmt, lint, and validate:

  '**/*.tf': (stagedFiles) => [
 `terraform fmt -write ${stagedFiles.join(' ')}`,
 `cd ${terraformDir} && terraform init -backend=false -upgrade=false`,
 `pnpm terraform:lint:fix`,
 `cd ${terraformDir} && terraform validate`,
 `pnpm terraform:test`,  // ← runs init + test per module
  ]

  With mock_provider the full test suite runs in ~15 seconds locally.
  