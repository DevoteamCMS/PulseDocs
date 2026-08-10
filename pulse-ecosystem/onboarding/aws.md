---
title: AWS
layout: default
parent: Onboarding
grand_parent: Pulse Ecosystem
nav_order: 3
---

# AWS Onboarding
{: .no_toc }

Connect an AWS Organization to Pulse. The recommended path is **federated** - Pulse assumes a cross-account IAM role and no AWS secret ever leaves your account.

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
- TOC
{:toc}
</details>

---

## Required Customer Roles

Confirm you have these before you start. This is the only part of onboarding that needs privileged access - everything Pulse itself receives is read-only.

### Automated Setup (Recommended)
{: .no_toc }

| Where | Role required | Used for |
| --- | --- | --- |
| AWS Organization **management (payer) account** | `AdministratorAccess`, or an equivalent deployment role | Creating the CloudFormation stack and StackSet, IAM roles, the S3 bucket, the Data Export, the stack's Lambda-backed custom resources, Systems Manager Quick Setup configuration managers, and Security Hub delegated administration |

One role, in one account. The stack fans everything else out organisation-wide by itself - you do not need access to member accounts, and you do not need to pre-enable trusted access between CloudFormation StackSets and AWS Organizations.

### Manual Setup
{: .no_toc }

| Where | Role required | Used for |
| --- | --- | --- |
| **Every account**, including the management account | IAM administrator (create roles and policies) | Creating the `Pulse_Viewer` role and its permission policy |
| **One account** of your choice | IAM administrator (create users and access keys) | Creating the `pulse` IAM user and its access key |
| **Management (payer) account** | Billing/Cost Management access to Data Exports (`bcm-data-exports:*`, `cur:*`) plus S3 bucket and bucket-policy creation | Creating the Cost and Usage Report export |
| **Every account and region** with resources | Permission to enable AWS Config and Security Hub | Resource inventory and compliance findings |

If the payer account is under an organisation SCP that blocks billing actions, that must be cleared before the cost export can be created.

### Not a role, but required
{: .no_toc }

- **AWS Organizations with all features enabled** (not consolidated-billing-only) - required for the automated path.
- An **AWS Business Support** plan (or Enterprise On-Ramp / Enterprise Support) is needed **only** for Trusted Advisor recommendations. Without it, the rest of onboarding works normally.

---

## Choosing an Onboarding Method

Both methods grant Pulse the same read-only permissions, but they use different credential models:

| | **Automated - Federated Role** | **Manual - IAM User and Access Key** |
| --- | --- | --- |
| Credential given to Pulse | None. Pulse assumes a cross-account IAM role from its own AWS account using `sts:AssumeRole` plus an External ID | Long-lived Access Key ID + Secret Access Key |
| How it is deployed | One CloudFormation stack in the management (payer) account, which fans itself out organisation-wide | Console/CLI work repeated per account |
| Account coverage | Every existing member account, the management account, and automatically any account created later | Only the accounts where you create the role by hand |
| AWS Config, Security Hub, Cost Export | Optionally configured for you by the stack | You configure each one yourself |
| Credential rotation | Not applicable - nothing to expire or rotate | Your responsibility |

Use the **automated federated** flow unless your organisation specifically requires custom naming, custom least-privilege policies, or a change-managed process for creating cloud credentials - in which case use the manual flow.

---

## Automated Setup - Federated Role (Recommended)

1. In Pulse, go to **Cloud Management → Onboarding → AWS**
2. Follow the wizard to configure your options:
   - Your AWS Organization's **Management (payer) Account ID** and **Organization root ID**
   - The **scanner role name** Pulse will create and assume (default `PulseCloudConnect`)
   - Whether to **create the Cost and Usage Report export**, and optionally its S3 bucket and report names
   - Whether to **configure Security Hub CSPM** and, if so, the **Security (delegated admin) account ID**
   - Whether to **enable AWS Config** organisation-wide
3. Pulse generates a CloudFormation quick-create stack URL - open it in the AWS Console (opens in a new tab), review the pre-filled stack parameters, and click **Create Stack**
4. Pulse automatically detects when the stack finishes deploying and completes onboarding - no need to come back and paste anything manually

This flow is **federated**: no AWS secret ever leaves your account. The stack creates an IAM role whose trust policy allows only Pulse's own AWS account to assume it, and only when it presents the External ID that Pulse generated for your organisation. See [Onboarding Q&A: What is the External ID for?](faq.md#what-is-the-external-id-for)

### Before you start

Have these values to hand:

- Your **management (payer) account ID** (12 digits)
- Your **organisation root ID** (`r-xxxx`) - find it with `aws organizations list-roots`, or in the AWS Organizations console under Root
- Your **Security account ID**, if you want the stack to configure Security Hub CSPM

Then sign in to the AWS Organization's **management (payer) account** with the console region set to **us-east-1 (N. Virginia)** - the quick-create link pre-selects it. During stack creation, acknowledge the prompt that CloudFormation will create named IAM resources.

### Stack parameters

Everything you answered in the wizard is pre-filled into the quick-create link, so the CloudFormation page is a **review step** - you should not need to type anything there.

If a value does look wrong, correct it in Pulse and regenerate the link rather than editing it on the CloudFormation page. Pulse matches the stack it is waiting for against what it generated, so an edited parameter can leave onboarding stuck.

<details markdown="block" class="reference-box">
  <summary>Reference: the five parameter groups</summary>

**1. Pulse connection** - filled in automatically by Pulse:

- **Pulse hub AWS account ID** - Pulse's own AWS account ID, the only principal allowed to assume the scanner role
- **External ID** - a unique UUID Pulse generates for your organisation, enforced as the `sts:ExternalId` condition on the trust policy
- **Scanner IAM role name** - the IAM role Pulse will assume, created in every account (defaults to `PulseCloudConnect`)

**2. Organization**:

- **Organization root ID** (`r-xxxx`) - used both to fan the scanner role out to every account and to scope Security Hub and AWS Config organisation-wide

**3. Cost & Usage Report (CUR)** - management account:

- **Create CUR export?** (`true`/`false`) - set to `false` if you already have a suitable CUR 2.0 export you want to reuse
- **CUR S3 bucket name** - auto-generated as `pulse-cur-<account-id>-<region>` if you left it blank in the wizard
- **CUR report name** - the Data Export definition name

**4. Security Hub CSPM** - Security account:

- **Configure Security Hub CSPM?** (`true`/`false`)
- **Security (delegated admin) account ID** - the 12-digit ID of your dedicated Security account. Required when the toggle is `true`.

**5. AWS Config** - organisation-wide:

- **Enable AWS Config everywhere?** (`true`/`false`)

</details>

### What the stack creates

Unlike the manual setup, the automated stack creates **no long-lived AWS credentials at all**.

- **Scanner role, in every account** - created directly in the management account, and in every member account through an embedded organisation-wide StackSet targeted at your organisation root. Auto-deployment is enabled, so accounts created later get the role automatically.
- **Cost and Usage Report, in the management account** - a private, versioned, SSE-S3 encrypted S3 bucket with a 365-day lifecycle rule, plus a daily CUR 2.0 Data Export delivered to it as gzip/CSV.
- **Security Hub CSPM** (only when the toggle is `true`) - designates your Security account as delegated administrator, switches the organisation to central configuration, and associates a policy enabling AWS Foundational Security Best Practices v1.0.0 with the organisation root.
- **AWS Config** (only when the toggle is `true`) - enables recording of all resource types through Systems Manager Quick Setup, organisation-wide plus the management account itself.

<details markdown="block" class="reference-box">
  <summary>Full detail: scanner role permissions and resource configuration</summary>

**Scanner role**

The role is created directly in the management account, and in every member account through an embedded organisation-wide StackSet. (Service-managed StackSets cannot target the management account, which is why the management account's copy is created directly by the stack.)

It carries a single inline policy granting:

- Account & organisation discovery - `sts:GetCallerIdentity`, `account:GetAccountInformation`, `account:ListRegions`, `organizations:DescribeOrganization`, `organizations:DescribeAccount`, `organizations:ListAccounts`
- Resource scanning - `backup:ListBackupJobs`, `backup:ListProtectedResources`, `cloudformation:GetResource`, `cloudformation:ListResources`, `config:DescribeDeliveryChannels`, `config:DescribeConfigurationRecorderStatus`, `config:DescribeConfigRules`, `config:ListDiscoveredResources`, `config:SelectResourceConfig`, `inspector:ListFindings`, `inspector:DescribeFindings`, `inspector2:ListFindings`, `ssm:DescribeMaintenanceWindows`, `ssm:ListCommandInvocations`, `tag:GetResources`
- Security Hub, for Managed Cloud Compliance - `securityhub:GetFindings`, `securityhub:DescribeStandards`, `securityhub:ListSecurityControlDefinitions`, `securityhub:BatchGetSecurityControls`, `securityhub:GetEnabledStandards`
- IAM read access, for Managed Cloud Compliance and Pulse's own permission checks - `iam:GetAccountSummary`, `iam:SimulatePrincipalPolicy`
- Trusted Advisor (requires a Business/Enterprise Support plan) - `trustedadvisor:List*`
- GuardDuty - `guardduty:ListDetectors`, `guardduty:ListFindings`, `guardduty:GetFindings`
- Budgets, for Managed Cloud Economics - `budgets:ViewBudget`
- CloudWatch metrics, for Managed Cloud Economics - `cloudwatch:GetMetricData`
- Cost Explorer, for real-time cost data without waiting on the S3 export - `ce:GetCostAndUsage`, `ce:GetCostAndUsageWithResources`, `ce:GetCostForecast`, `ce:GetDimensionValues`, `ce:GetTags`, `ce:GetRightsizingRecommendation`, `ce:GetReservationPurchaseRecommendation`, `ce:GetSavingsPlansPurchaseRecommendation`, `cur:DescribeReportDefinitions`
- In the management account only, read access to the Cost and Usage Report bucket - `s3:GetObject`, `s3:ListBucket`

**Cost and Usage Report**

- An **S3 bucket** - versioned, SSE-S3 encrypted, fully blocked from public access, with a lifecycle rule expiring report objects after 365 days (and noncurrent/overwritten versions after 7 days), plus the bucket policy that lets the AWS Data Exports service write to it
- A **Cost and Usage Report 2.0 Data Export**, daily granularity, all standard columns, with resource IDs, split cost allocation data, and capacity reservation data included, delivered as gzip/CSV to that bucket

**Security Hub CSPM**

- Designates your **Security account as the Security Hub CSPM delegated administrator** for the organisation, enabling Security Hub trusted access in Organizations first
- Then, in that Security account: enables Security Hub, switches the organisation to **central configuration**, creates a configuration policy (`PulseSecurityHubBaseline`) enabling the **AWS Foundational Security Best Practices v1.0.0** standard, and associates that policy with the organisation root so all current and future accounts inherit it

**AWS Config**

- Enables **AWS Config recording of all resource types** through AWS Systems Manager Quick Setup: one organisation-wide configuration manager covering all member accounts, plus a second, single-account manager covering the management account itself (again, because organisation-wide deployments skip the management account)
- Target regions are resolved automatically to every region that is enabled by default in AWS - opt-in regions and regions Quick Setup cannot target are excluded. Quick Setup manages its own Config delivery bucket, so there is nothing else to configure.

</details>

<details markdown="block" class="reference-box">
  <summary>When to turn the optional toggles off</summary>

- **Set `Enable AWS Config everywhere` to `false`** if your organisation already manages AWS Config - for example through AWS Control Tower, or with existing recorders deployed by your own tooling. A second recorder in the same account/region will conflict. Pulse still reads whatever Config already records, through the scanner role.
- **Set `Configure Security Hub CSPM` to `false`** if Security Hub is already managed in your organisation, or if a delegated administrator other than the account you would enter is already designated. Pulse still reads existing Security Hub findings through the scanner role. (If a *different* delegated administrator is already set, the stack deliberately fails rather than silently re-pointing it - either reconcile it manually or set the toggle to `false`.)
- **Set `Create CUR export` to `false`** if you already have a CUR 2.0 export with resource IDs enabled. In that case grant the scanner role read access to your existing bucket, and register the export in Pulse using the steps under *PULSE Configuration - Onboarding Cost Export*.

</details>

### Verification, timing and offboarding

| What | When |
| --- | --- |
| Stack completes, Pulse detects it automatically | ~3 minutes |
| StackSet fan-out to member accounts, Quick Setup enabling Config across regions | Considerably longer in a large organisation - watch **CloudFormation → StackSets** and **Systems Manager → Quick Setup** |
| Resources, findings and costs load in Pulse | Up to 24 hours |
| Cost data - needs the first CUR delivery, which AWS usually makes within 24 hours | Up to 24 hours |

If deployment takes longer than the 10-minute window shown in the wizard, Pulse keeps checking in the background - check back on Cloud Management after a couple of hours if it has not completed.

**If the stack fails:** fix the underlying cause - most often a pre-existing AWS Config recorder or Security Hub delegated administrator, see the toggle guidance above - and deploy again.

Deploying or redeploying as many times as you need is safe. Pulse's scanners simply use whatever valid credentials exist when they run, and a reonboarding job checks for new or expired accounts on an ongoing basis. If a parameter was wrong, correct it in Pulse and regenerate the link rather than editing it on the CloudFormation page.

**On stack deletion:** the CUR S3 bucket is retained (remove it manually) and the Security Hub delegated administrator designation is left in place. Everything else is removed with the stack. See [Offboarding](../offboarding.md).

---

## Manual Setup - IAM User and Access Key

AWS cloud onboarding using a single set of credentials for an Organisation with many Accounts. You create one IAM user credential in any account, and a role of the same name in **all** accounts including the management account.

This path uses a **long-lived access key**. Store it securely, rotate it in line with your own policy, and re-upload the new key to Pulse when you rotate it. If you would rather not manage a long-lived secret, use the automated federated flow above.

See [Onboarding Q&A: Which manual onboarding scenarios are supported?](faq.md#which-manual-onboarding-scenarios-are-supported)

### Required parameters

These are the four values you will paste into Pulse at the end:

- Access Key ID
- Secret Access Key
- Role Name
- Customer Management Account ID

### Order of work

Complete the four prerequisite blocks in this order:

1. **IAM user and roles** - so Pulse can authenticate and read your accounts
2. **AWS Config** - so Pulse can see your resource inventory
3. **Security Hub** - so Pulse can see compliance findings (Security Hub depends on Config, so do Config first)
4. **Cost export** - so Pulse can see detailed billing data

### Customer Prerequisites - Creating IAM User and Roles

1. Login to AWS Cloud portal

   Note! The IAM user can be created in the Customer's Management Account or any other Account, even in another organisation.

2. Create a new IAM user (for example named `pulse`) under any Account, following the documentation: [Creating an IAM user in your AWS account](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html)

   For programmatic access, a third-party Access key needs to be created; the Access key ID and Secret access key will be required to onboard the organisation with its accounts. The user needs **no console access and no permissions other than the assume-role policy below**.

3. The IAM user needs permission to assume roles - add a customer inline policy named `Assume_Pulse_Viewer_Role` with the statement below:

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

   If you use a different role name, change the role name in the `Resource` ARN to match.

4. Create the role in **all accounts, including the management account**, using the **same role name everywhere** - Pulse is configured with one role name.

   - Name: `Pulse_Viewer` (or your naming standard - remember to change the IAM user policy above accordingly)
   - Permissions: choose **one** of the two options below

   **Option A - built-in role (simplest).** Attach the AWS managed job-function policy `ReadOnlyAccess`, plus the custom permission `"trustedadvisor:List*"`. This is broader than Pulse needs but requires no policy maintenance.

   **Option B - custom least-privilege policy.** Create a permissions policy named `Pulse_View_Resources_policy` in IAM on each Account, containing exactly the permissions Pulse uses. This is the same permission set the automated CloudFormation stack grants. Alternatively, a combination of roles/policies can be used, so long as the result has all of the permissions listed.

   Pick Option B if your organisation requires least-privilege role definitions. Important! Take note that with new functionality we may require new permissions, so this policy needs maintaining over time. The full policy JSON is in the expandable section at the end of this section.

<details markdown="block" class="reference-box">
  <summary>Option B - full <code>Pulse_View_Resources_policy</code> JSON</summary>

Add permissions either via services or by editing the JSON directly. For what each block is needed for, see [Onboarding Q&A: Why does Pulse need each AWS permission?](faq.md#why-does-pulse-need-each-aws-permission)

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AccountManagement",
            "Effect": "Allow",
            "Action": [
                "sts:GetCallerIdentity",
                "account:GetAccountInformation",
                "account:ListRegions"
            ],
            "Resource": "*"
        },
        {
            "Sid": "Organizations",
            "Effect": "Allow",
            "Action": [
                "organizations:DescribeOrganization",
                "organizations:DescribeAccount",
                "organizations:ListAccounts"
            ],
            "Resource": "*"
        },
        {
            "Sid": "ResourceScanning",
            "Effect": "Allow",
            "Action": [
                "backup:ListBackupJobs",
                "backup:ListProtectedResources",
                "cloudformation:GetResource",
                "cloudformation:ListResources",
                "config:DescribeDeliveryChannels",
                "config:DescribeConfigurationRecorderStatus",
                "config:DescribeConfigRules",
                "config:ListDiscoveredResources",
                "config:SelectResourceConfig",
                "inspector:ListFindings",
                "inspector:DescribeFindings",
                "inspector2:ListFindings",
                "ssm:DescribeMaintenanceWindows",
                "ssm:ListCommandInvocations",
                "tag:GetResources"
            ],
            "Resource": "*"
        },
        {
            "Sid": "SecurityHub",
            "Effect": "Allow",
            "Action": [
                "securityhub:GetFindings",
                "securityhub:DescribeStandards",
                "securityhub:ListSecurityControlDefinitions",
                "securityhub:BatchGetSecurityControls",
                "securityhub:GetEnabledStandards"
            ],
            "Resource": "*"
        },
        {
            "Sid": "IAM",
            "Effect": "Allow",
            "Action": [
                "iam:GetAccountSummary",
                "iam:SimulatePrincipalPolicy"
            ],
            "Resource": "*"
        },
        {
            "Sid": "TrustedAdvisor",
            "Effect": "Allow",
            "Action": [
                "trustedadvisor:List*"
            ],
            "Resource": "*"
        },
        {
            "Sid": "GuardDuty",
            "Effect": "Allow",
            "Action": [
                "guardduty:ListDetectors",
                "guardduty:ListFindings",
                "guardduty:GetFindings"
            ],
            "Resource": "*"
        },
        {
            "Sid": "Budgets",
            "Effect": "Allow",
            "Action": [
                "budgets:ViewBudget"
            ],
            "Resource": "*"
        },
        {
            "Sid": "CloudWatch",
            "Effect": "Allow",
            "Action": [
                "cloudwatch:GetMetricData"
            ],
            "Resource": "*"
        },
        {
            "Sid": "CostExplorerAccess",
            "Effect": "Allow",
            "Action": [
                "ce:GetCostAndUsage",
                "ce:GetCostAndUsageWithResources",
                "ce:GetCostForecast",
                "ce:GetDimensionValues",
                "ce:GetTags",
                "ce:GetRightsizingRecommendation",
                "ce:GetReservationPurchaseRecommendation",
                "ce:GetSavingsPlansPurchaseRecommendation",
                "cur:DescribeReportDefinitions"
            ],
            "Resource": "*"
        }
    ]
}
```

</details>

#### Trust relationship

Finally, add the trust relationship to the role in every account, changing `<UserAccountID>` to the Account ID where you created the IAM user, and the user name if you did not use `pulse`:

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
            "Action": "sts:AssumeRole"
        }
    ]
}
```

Rolling this out to many accounts at once? See [Onboarding Q&A: creating the role in many accounts](faq.md#how-do-i-create-the-role-in-many-accounts-without-repeating-the-console-steps).

### Customer Prerequisites - Enabling AWS Config

AWS Config gives Pulse your resource inventory. In any account and region where Config is not recording, Pulse sees no resources. Enable Config **before** Security Hub - see [Onboarding Q&A: Why does Pulse need AWS Config?](faq.md#why-does-pulse-need-aws-config)

Required end state, in every account (including the management account) and every region where you have resources:

- A **configuration recorder** that records **all resource types**, including global resources
- A **delivery channel** pointing at an S3 bucket
- Recorder status **recording / enabled**

Per-account, per-region console steps:

1. Change to the target Region, open the **AWS Config** service
2. Select **1-click setup** (or *Get started* → record all resource types)
3. Select **Confirm**
4. Repeat for every Region where you have resources, then change Account and repeat

Faster alternative for an organisation (what the automated stack uses): from the management account, open **Systems Manager → Quick Setup → Config recording** and create a configuration manager targeting your organisation root and the regions you care about. Note two things:

- An organisation-wide deployment covers **member accounts only** - create a second, single-account Quick Setup configuration manager (or use the 1-click setup above) for the **management account** itself.
- Quick Setup can only target regions that are **enabled by default**; opt-in regions must be configured separately.

Notes:

- **Do not create a second recorder** where one already exists - if Control Tower or your own tooling already manages Config, leave it alone. See [Onboarding Q&A](faq.md#aws-config-or-security-hub-is-already-managed-in-my-organisation---what-should-i-do).
- Verify with: `aws configservice describe-configuration-recorder-status --region <region>` in each account.

### Customer Prerequisites - Enabling Security Hub

Pulse's Managed Cloud Compliance findings come from AWS Security Hub CSPM. Without it, the compliance sections in Pulse stay empty; the rest of onboarding is unaffected. See [Onboarding Q&A: Why does Pulse need Security Hub?](faq.md#why-does-pulse-need-security-hub)

Required end state:

- Security Hub CSPM **enabled** in each account and region you want findings from
- The **AWS Foundational Security Best Practices v1.0.0** standard enabled - this is the baseline Pulse reports against
- AWS Config already recording in the same accounts/regions (previous section)

The recommended way to achieve this across an organisation, mirroring what the automated stack does:

1. In the **management account**, open Security Hub → Settings → General and **designate your dedicated Security account as the delegated administrator**. This also enables Security Hub trusted access in AWS Organizations.
2. Sign in to that **Security account** and enable Security Hub if it is not already enabled.
3. Still in the Security account, switch the organisation to **central configuration** (Settings → Configuration → Central configuration).
4. Create a **configuration policy** that enables Security Hub with the *AWS Foundational Security Best Practices v1.0.0* standard, and **associate it with the organisation root** so every current and future account inherits it.
5. Confirm your **aggregation (home) region** and linked regions, so findings from all regions are visible in one place.

Notes:

- If a delegated administrator is **already designated** for Security Hub, keep it - do not re-point it just for Pulse. See [Onboarding Q&A](faq.md#aws-config-or-security-hub-is-already-managed-in-my-organisation---what-should-i-do).
- Prefer to do this without central configuration, or need the exact admin permissions? See [Onboarding Q&A: setting up Security Hub yourself](faq.md#what-permissions-do-i-need-to-set-up-security-hub-myself).

### Customer Prerequisites - Creating Cost Export

Before you start:

- Create the export in the **management (payer) account**. An export created in a member account only contains that account's costs, not the organisation's.
- Use **us-east-1 (N. Virginia)**. The S3 bucket can be in another region, but keep it in us-east-1 unless you have a reason not to; you will need the bucket's region for the Pulse configuration URL.

Steps:

1. Login to the Cloud portal
2. Open **Billing and Cost Management**, select the menu: **Data Exports**
3. Press **Create** and select options:
   - Standard data export
   - Enter Export name: `DailyExports`
   - Select **Include resource IDs** (required - Pulse maps costs to individual resources)
   - Select **Split cost allocation data** (required for container/ECS/EKS cost splitting)
   - Select **Daily** time granularity (required - monthly granularity is not sufficient)
   - Leave the selection **Column selection (125/125)** as is - Pulse expects the full column set
   - Select **gzip - text/csv**
   - Select **Overwrite existing data export file**
   - Configure S3, general purpose bucket, name it for example `<prefix#-costexports-s3bucket-no#>`, and select your usually used region
   - Enter S3 path prefix: `Pulse`
   - Create!
4. You need to wait for data to arrive before proceeding - AWS usually sends information twice over 24 hours.
5. Open the **S3** service
6. Select the S3 Bucket you just created
7. Open the objects (folders) twice - the prefix and the export name - until you see `data` and `metadata` objects
8. Copy the **browser URL** from the address bar for later use - Pulse needs the S3 console link, not an `s3://` URI or bucket endpoint. See [Onboarding Q&A](faq.md#why-wont-pulse-accept-my-cost-export-link).

<details markdown="block" class="reference-box">
  <summary>Required: bucket policy for the Data Exports service</summary>

If you let the Data Exports console create the bucket, it adds this policy for you - confirm it is there. If you brought your own bucket, add it manually, replacing `<bucketname>` and `<PayerAccountID>`:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowDataExportsAcl",
            "Effect": "Allow",
            "Principal": {
                "Service": [
                    "bcm-data-exports.amazonaws.com",
                    "billingreports.amazonaws.com"
                ]
            },
            "Action": [
                "s3:GetBucketAcl",
                "s3:GetBucketPolicy"
            ],
            "Resource": "arn:aws:s3:::<bucketname>",
            "Condition": {
                "StringEquals": {
                    "aws:SourceAccount": "<PayerAccountID>"
                },
                "ArnLike": {
                    "aws:SourceArn": [
                        "arn:aws:cur:us-east-1:<PayerAccountID>:definition/*",
                        "arn:aws:bcm-data-exports:us-east-1:<PayerAccountID>:export/*"
                    ]
                }
            }
        },
        {
            "Sid": "AllowDataExportsWrite",
            "Effect": "Allow",
            "Principal": {
                "Service": [
                    "bcm-data-exports.amazonaws.com",
                    "billingreports.amazonaws.com"
                ]
            },
            "Action": "s3:PutObject",
            "Resource": "arn:aws:s3:::<bucketname>/*",
            "Condition": {
                "StringEquals": {
                    "aws:SourceAccount": "<PayerAccountID>"
                },
                "ArnLike": {
                    "aws:SourceArn": [
                        "arn:aws:cur:us-east-1:<PayerAccountID>:definition/*",
                        "arn:aws:bcm-data-exports:us-east-1:<PayerAccountID>:export/*"
                    ]
                }
            }
        }
    ]
}
```

</details>

<details markdown="block" class="reference-box">
  <summary>Required: bucket read access for Pulse</summary>

If you are using custom permission sets for access, update them to include additional permissions to access this bucket. Add an additional policy named `Pulse_Costs_Viewer` **to the `Pulse_Viewer` role in the account that owns the export bucket** (normally the management account), changing `<bucketname>`:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "CURBucketRead",
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::<bucketname>",
                "arn:aws:s3:::<bucketname>/*"
            ]
        }
    ]
}
```

</details>

If you brought your own bucket rather than letting the Data Exports console create one, check the [additional bucket requirements](faq.md#what-else-should-i-check-on-the-cost-export-bucket) - encryption, lifecycle rules and public access.

### PULSE Configuration - Onboarding SA

1. Login to the [PULSE](https://pulse.devoteam.com/platform/login) platform
2. Open [Cloud Management](https://pulse.devoteam.com/platform/cloud-management) under Administration (left bottom corner) - the same place as the onboarding wizard
3. Add AWS credentials
   - Access Key ID
   - Secret Access Key
   - Role Name (optional, but the preferred way)
   - Customer Management Account ID
4. Save [done]

### PULSE Configuration - Onboarding Cost Export

**Onboard the AWS accounts first.** Pulse maps cost data onto accounts it already knows about, matched on the **Project Name** you enter below. If the account has not been onboarded yet, Pulse resolves the export against the wrong account and fails to access it. See [Onboarding Q&A: Must accounts be onboarded before adding a cost export?](faq.md#must-accounts-be-onboarded-before-i-add-a-cost-export)

1. Login to the [PULSE](https://pulse.devoteam.com/platform/login) platform
2. Open [Cloud Management](https://pulse.devoteam.com/platform/cloud-management) under Administration (left bottom corner)
3. Add Billing Export Configuration
   - Project Name [Account name where the cost export data set is located]
   - Cost Export URL [Example: `https://us-east-1.console.aws.amazon.com/s3/buckets/costexportss3bucket?region=us-east-1&bucketType=general&prefix=Pulse/DailyExports/`]
4. Save [done]

---

## Per-Account Readiness Checklist

Use this to confirm an account is fully onboarded, whichever method you used:

| Item | Management (payer) account | Every other account |
| --- | --- | --- |
| Scanner role (`PulseCloudConnect` / `Pulse_Viewer`) exists, with the full permission set | Required | Required |
| Role trust policy allows Pulse (automated) or the IAM user (manual) | Required | Required |
| IAM user with `sts:AssumeRole` on the role name - manual flow only | In one account only | - |
| AWS Config recording all resource types, in every region with resources | Required | Required |
| Security Hub CSPM enabled with AWS Foundational Security Best Practices v1.0.0 | Recommended | Recommended - needed for compliance findings from that account |
| CUR 2.0 Data Export with resource IDs, split cost allocation data, daily, gzip/CSV | Required | Not applicable |
| `Pulse_Costs_Viewer` bucket read policy on the role | Required (bucket owner account) | Only if the bucket lives there |
| Business/Enterprise Support plan | Only for Trusted Advisor data | Only for Trusted Advisor data |
