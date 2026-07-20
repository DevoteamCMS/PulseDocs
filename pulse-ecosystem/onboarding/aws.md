---
title: AWS
layout: default
parent: Onboarding
grand_parent: Pulse Ecosystem
nav_order: 3
---

# AWS Onboarding

## Table of Contents

- Automated Setup via Pulse (Recommended)
- Manual Setup
  - AWS Onbaording Overview
  - Customer Prerequisites - Creating IAM User and Roles
  - Customer Prerequisites - Creating Cost Export
  - PULSE Configuration - Onboarding SA
  - PULSE Configuration - Onboarding Cost Export

---

## Onboarding AWS Accounts

### Automated Setup via Pulse (Recommended)

The easiest way to onboard AWS is to use Pulse's guided CloudFormation setup:

1. In Pulse, go to Cloud Management → Onboarding → AWS
2. Enter your AWS Organization's Management (payer) Account ID and a Role Name
3. Pulse generates a CloudFormation quick-create stack URL — open it in the AWS Console (opens in a new tab), review the pre-filled stack parameters, and click Create Stack
4. Pulse automatically detects when the stack finishes deploying (typically around 3 minutes) and completes onboarding — no need to come back and paste anything manually

#### Prerequisites to run the automated setup

- Sign in to the AWS Organization's **management (payer) account**, with the console region set to **us-east-1 (N. Virginia)** — the Cost and Usage Report 2.0 Data Export resource (`AWS::BCMDataExports::Export`) is only available there, and the quick-create link pre-selects it.
- The deploying user/role needs permission to create **CloudFormation stacks, an IAM role, an S3 bucket, and a Data Export** — `AdministratorAccess` or an equivalent deployment role covers this. During stack creation, acknowledge the prompt that CloudFormation will create named IAM resources.
- An **AWS Business Support** plan (or Enterprise On-Ramp / Enterprise Support) is only needed for Trusted Advisor–based recommendations — without it, the rest of onboarding still works, Trusted Advisor checks simply return no data.

#### Stack parameters

The Pulse wizard asks you for your **Management Account ID** and a **Role Name**, then pre-fills the rest directly into the generated quick-create link — you don't need to look anything else up:

- **Pulse Account ID** — Pulse's own AWS account ID, filled in automatically by Pulse
- **External ID** — a unique ID Pulse generates for your organisation, used as the `sts:ExternalId` condition on the trust policy so only Pulse can assume the role
- **Role Name** — the IAM role Pulse will assume (defaults to `PulseCloudConnect`)
- Cost export bucket name and report name are auto-generated if left as default

#### What the stack creates

Unlike Manual Setup below (a long-lived IAM user Access Key/Secret), the automated stack creates a **cross-account IAM role with no long-lived AWS credentials** — Pulse assumes the role from its own AWS account via `sts:AssumeRole`, using the External ID as a safeguard against confused-deputy access. Specifically, the stack creates:

- An **S3 bucket** for Cost and Usage Reports — versioned, SSE-S3 encrypted, fully blocked from public access, with a lifecycle rule expiring report objects after 365 days (and noncurrent/overwritten versions after 7 days)
- A **Cost and Usage Report 2.0 Data Export**, daily granularity, with resource IDs, split cost allocation data, and capacity reservation data included, delivered as gzip/CSV to that bucket
- An **IAM role** (default name `PulseCloudConnect`) with a single inline policy granting:
  - Account & organisation discovery — `sts:GetCallerIdentity`, `account:GetAccountInformation`, `account:ListRegions`, `organizations:DescribeOrganization`, `organizations:DescribeAccount`, `organizations:ListAccounts`
  - Resource scanning — `backup:ListBackupJobs`, `backup:ListProtectedResources`, `cloudformation:GetResource`, `cloudformation:ListResources`, `config:DescribeDeliveryChannels`, `config:DescribeConfigurationRecorderStatus`, `config:ListDiscoveredResources`, `config:SelectResourceConfig`, `inspector:ListFindings`, `inspector:DescribeFindings`, `inspector2:ListFindings`, `ssm:DescribeMaintenanceWindows`, `ssm:ListCommandInvocations`, `tag:GetResources`
  - Security Hub, for Managed Cloud Compliance — `securityhub:GetFindings`, `securityhub:DescribeStandards`, `securityhub:ListSecurityControlDefinitions`
  - IAM read access, for Managed Cloud Compliance and Pulse's own permission checks — `iam:GetAccountSummary`, `iam:SimulatePrincipalPolicy`
  - Trusted Advisor (requires a Business/Enterprise Support plan) — `trustedadvisor:List*`
  - GuardDuty — `guardduty:ListDetectors`, `guardduty:ListFindings`, `guardduty:GetFindings`
  - Budgets, for Managed Cloud Economics — `budgets:ViewBudget`
  - CloudWatch metrics, for Managed Cloud Economics — `cloudwatch:GetMetricData`
  - Cost Explorer, for real-time cost data without waiting on the S3 export — `ce:GetCostAndUsage`, `ce:GetCostAndUsageWithResources`, `ce:GetCostForecast`, `ce:GetDimensionValues`, `ce:GetTags`, `ce:GetRightsizingRecommendation`, `ce:GetReservationPurchaseRecommendation`, `ce:GetSavingsPlansPurchaseRecommendation`, `cur:DescribeReportDefinitions`
  - Read access to the Cost and Usage Report bucket created above — `s3:GetObject`, `s3:ListBucket`

Note: the S3 bucket is retained (not deleted) if the stack itself is ever deleted, so remember to remove it manually as part of offboarding.

If deployment takes longer than the 10-minute window shown in the wizard, Pulse keeps checking in the background — check back on Cloud Management after a couple of hours if it hasn't completed yet.

## Manual Setup

### AWS Onbaording Overview

AWS cloud onboarding using single credentials for Organisation with many Accounts.

Clients would require creating one IAM user credentials in any account and create roles for all Accounts (including management). To discover Accounts Pulse must assume role on Management Account.

Supported Scenarios:
- IAM user created in Management Account on Customer Organisation side
- IAM user created in Child Account on Customer Organisation side
- IAM user created in Account on Service Provider Organisation side

Required parameters:
- Access Key ID
- Secret Access Key
- Role Name
- Customer Management Account ID

### Customer Prerequisites - Creating IAM User and Roles

Customer must follow bellow requirements and prepare for onboarding as follows:

1. Login to AWS Cloud portal

   Note! IAM user can be created in Customers Management or any other Account, even in another organisation.

2. Create new IAM user (for example named: 'pulse') under any Account, follow documentation: [Creating an IAM user in your AWS account](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html)

   For programmatic access, a third-party Access key needs to be created, the Access key ID and Secret access key will be required to onboard organisation with accounts.

3. IAM user need permission to assume roles, add customer inline configuration named as 'Assume_Pulse_Viewer_Role' with statement bellow:

   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Sid": "Statement1",
               "Effect": "Allow",
               "Action": [
                   "sts:AssumeRole"
               ],
               "Resource": "arn:aws:iam::*:role/Pulse_Viewer"
           }
       ]
   }
   ```

4. Roles must be created and used for all accounts including management account.

   - Name: Pulse_Viewer (or your naming standard, remember replace user permissions accordingly)
   - Role: `ReadOnlyAccess` (built in role, AWS managed - job function) and custom permission `"trustedadvisor:List*"`

   Or:

   Important! Take note that with new functionality we may require new permissions

   a. Create a Permissions Policy named 'Pulse_View_Resources_policy' in IAM on each Account. Alternatively, a combination of roles/policies can be used, so long as result has all of the permissions listed below.

   b. Add permissions either via services or edit JSON directly:

   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Sid": "VisualEditor0",
               "Effect": "Allow",
               "Action": [
                   "sts:GetCallerIdentity",
                   "organizations:DescribeOrganization",
                   "organizations:DescribeAccount",
                   "organizations:ListAccounts",
                   "account:ListRegions",
                   "backup:ListBackupJobs",
                   "backup:ListProtectedResources",
                   "cloudformation:GetResource",
                   "cloudformation:ListResources",
                   "config:DescribeDeliveryChannels",
                   "config:DescribeConfigurationRecorderStatus",
                   "config:ListDiscoveredResources",
                   "config:SelectResourceConfig",
                   "guardduty:GetFindings",
                   "guardduty:ListFindings",
                   "guardduty:ListDetectors",
                   "inspector:ListFindings",
                   "inspector:DescribeFindings",
                   "inspector2:ListFindings",
                   "ssm:DescribeMaintenanceWindows",
                   "ssm:ListCommandInvocations",
                   "tag:GetResources",
                   "trustedadvisor:List*"
               ],
               "Resource": "*"
           }
       ]
   }
   ```

   **Trust Relationships**

   add example bellow, by changing `<UserAccountID>` to Account ID where you created IAM user and IAM user name:

   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Sid": "Statement1",
               "Effect": "Allow",
               "Principal": {
                   "AWS": [
                       "arn:aws:iam::<UserAccountID>:user/pulse"
                   ]
               },
               "Action": "sts:AssumeRole",
               "Condition": {}
           }
       ]
   }
   ```

5. For getting Cloud resources enable Config service and do this for all (or relevant where resources deployed) regions: Change Region, Open AWS Config Service, select '1-click setup', select 'Confirm'. Change Account. Enable Config for all regions. Repeat for all Accounts and all Regions.

### Customer Prerequisites - Creating Cost Export

Customer must follow bellow requirements and prepare cost export to proceed on onboarding to PULSE platform. To start collecting your Cloud Billing data, you must create cost export following this guide steps you need to do:

1. Login to Cloud portal
2. Open Billing and Cost Management, Select menu: Data Exports
3. Press Create and select options:
   - Standard data export
   - Enter Export name: 'DailyExports'
   - Select 'Include resource IDs'
   - Select 'Split cost allocation data'
   - Select 'Daily'
   - Leave Selection 'Column selection (125/125)' as is
   - Select 'gzip - text/csv'
   - Select 'Overwrite existing data export file'
   - Configure S3, general purpose bucket, name it for example `<prefix#-costexports-s3bucket-no#>`, select your usually used region.
   - Enter S3 path prefix: 'Pulse'
   - Create!
4. You need to wait for data to come in before proceeding, usually AWS sends information twice over 24 hours.
5. Open S3 Service
6. Select S3 Bucket you just created
7. Open twice objects (folders) prefix and export names, until you see data and metadata objects
8. Copy browser URL for later use.

If you are using custom permission sets for access then update to include additional permissions to access this bucket, add additional set named 'Pulse_Costs_Viewer' (change `<bucketname>`).

### PULSE Configuration - Onboarding SA

1. Login to [PULSE](https://pulse.devoteam.com/platform/login) platform
2. Open [Cloud Management](https://pulse.devoteam.com/platform/cloud-management) under Administration (left bottom corner)
3. Add AWS credentials
   - Access Key ID
   - Secret Access Key
   - Role Name (optional, but preferred way)
   - Customer Management Account ID
4. Save [done]

### PULSE Configuration - Onboarding Cost Export

1. Login to [PULSE](https://pulse.devoteam.com/platform/login) platform
2. Open [Cloud Management](https://pulse.devoteam.com/platform/cloud-management) under Administration (left bottom corner)
3. Add Billing Export Configuration
   - Project Name [Account name where cost export data set is located]
   - Cost Export URL [Example: `https://us-east-1.console.aws.amazon.com/s3/buckets/costexportss3bucket?region=us-east-1&bucketType=general&prefix=Pulse/DailyExports/`]
4. Save [done]
