---
title: Onboarding Q&A
layout: default
parent: Onboarding
grand_parent: Pulse Ecosystem
nav_order: 4
---

# Onboarding Q&A
{: .no_toc }

Background and rationale for the onboarding steps. The cloud pages tell you *what to do*; this page explains *why*, so the step-by-step instructions stay short.

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
- TOC
{:toc}
</details>

---

## General

### Which onboarding method should I choose?

Use the **automated** path unless your organisation specifically requires custom naming, custom least-privilege roles, or a change-managed process for creating cloud credentials. The automated path is faster, avoids permission mistakes, and can enable the supporting services Pulse reads from (AWS Config and Security Hub, the Microsoft cloud security benchmark, Security Health Analytics) that you would otherwise configure yourself.

### Do the automated and manual paths grant Pulse different access?

No. Both grant the same read-only access. They differ in *how the credential is held*:

| | Automated | Manual |
| --- | --- | --- |
| AWS | Federated - Pulse assumes a cross-account role, no secret leaves your account | Long-lived Access Key ID + Secret Access Key |
| Azure | Federated - no client secret is created or uploaded | SPN and client secret you create and paste in, plus its expiration date |
| Google Cloud | Service Account created for you, JSON key uploaded automatically | Service Account JSON key you create and paste in |

Only Google Cloud requires a long-lived credential on the automated path; AWS and Azure are both federated.

### How long until my data appears in Pulse?

Resources, findings and costs can take **up to 24 hours** to load after onboarding completes.

On AWS specifically, cost data cannot appear until AWS delivers the first Cost and Usage Report to your S3 bucket, which AWS usually does within 24 hours.

### Can I onboard more than one credential or cloud?

Yes. Multiple credentials and multiple cost exports per cloud are supported.

### Can I re-run onboarding, or deploy the same setup twice?

Yes. Pulse does not track how many times you deploy or re-run. Its scanners simply use whatever credentials they hold at the time they run, provided those credentials are valid, and a **reonboarding job** checks on an ongoing basis for new or expired accounts, subscriptions and projects.

That means a failed or interrupted run is safe to repeat, and newly added accounts or subscriptions are picked up without you re-onboarding by hand.

---

## AWS

### Which manual onboarding scenarios are supported?

The manual flow uses one IAM user credential for an entire Organisation, plus a role of the same name in **every** account. The IAM user can live in any of these places:

- The Customer's **Management Account**
- A **Child Account** in the Customer's Organisation
- An account in the **Service Provider's Organisation**

Whichever you choose, Pulse must be able to assume the role in the **management account** - that is how it discovers the rest of the organisation. Without it, only the account holding the credentials is onboarded.

### Why does Pulse need each AWS permission?

The scanner role's permission set is identical in the automated and manual paths. Each block maps to a Pulse capability:

| Statement | Needed for |
| --- | --- |
| `AccountManagement`, `Organizations` | Account discovery - Pulse enumerates the organisation by assuming the role in the **management account**. Without it, only the account holding the credentials is onboarded. |
| `ResourceScanning` | Resource inventory, backup and patching data - depends on AWS Config being enabled |
| `SecurityHub` | Managed Cloud Compliance findings and control definitions |
| `IAM` | Compliance checks and Pulse's own "are my permissions correct" self-check |
| `TrustedAdvisor` | Trusted Advisor recommendations - requires a Business or Enterprise Support plan on the account |
| `GuardDuty` | Threat-detection findings |
| `Budgets`, `CloudWatch`, `CostExplorerAccess` | Managed Cloud Economics: budgets, utilisation metrics, and near-real-time cost data (Cost Explorer covers the gap while the S3 cost export catches up) |

### What is the External ID for?

In the federated flow, the scanner role's trust policy allows only Pulse's own AWS account to assume it, **and only when it presents the External ID** that Pulse generated for your organisation. It is enforced as the `sts:ExternalId` condition on the trust policy, and acts as a safeguard against confused-deputy access.

### Why must the stack be deployed from the management (payer) account?

Two reasons. The organisation-wide fan-out uses **service-managed CloudFormation StackSets**, which can only be created from the management account or a delegated administrator. And the Cost and Usage Report export can only be created in the payer account - an export created in a member account contains only that account's costs.

This also requires **AWS Organizations with all features enabled**. Service-managed StackSets and trusted access are unavailable in a consolidated-billing-only organisation.

### Why us-east-1?

The Cost and Usage Report 2.0 Data Export resource (`AWS::BCMDataExports::Export`) is only available in us-east-1, and the Data Exports definition lives there. The S3 bucket itself can be in another region, but keep it in us-east-1 unless you have a reason not to - you will need the bucket's region for the Pulse cost export URL.

### Why does Pulse need AWS Config?

AWS Config is what gives Pulse your **resource inventory** - Pulse reads it with `config:ListDiscoveredResources` and `config:SelectResourceConfig`. In any account and region where Config is not recording, Pulse sees no resources. Security Hub controls also evaluate Config data, which is why Config must be enabled **before** Security Hub.

AWS Config is a **paid service**, billed per configuration item recorded plus S3 storage for the delivery channel. Enabling it in every region of every account has a real cost - if that matters, enable it only in the regions where you actually run resources.

### Why does Pulse need Security Hub?

Pulse's **Managed Cloud Compliance** findings come from AWS Security Hub CSPM (previously named simply "Security Hub"), reported against the **AWS Foundational Security Best Practices v1.0.0** standard. Without it, the compliance sections in Pulse stay empty; the rest of onboarding is unaffected.

Most Security Hub controls are Config-based and report `NO_DATA` without AWS Config recording in the same account and region. Security Hub is also a **paid service** and its controls consume AWS Config configuration items.

### Do I need a Business or Enterprise Support plan?

Only for Trusted Advisor-based recommendations. Without it, the rest of onboarding still works - Trusted Advisor checks simply return no data.

### AWS Config or Security Hub is already managed in my organisation - what should I do?

Turn the corresponding toggle **off** in the wizard, or skip that prerequisite in the manual flow. Pulse reads whatever is already recorded or already reported, through the scanner role.

Specifically: a second AWS Config recorder in the same account/region will conflict with an existing one (for example one deployed by AWS Control Tower). And if a delegated administrator other than the one you would enter is already designated for Security Hub, the stack deliberately fails rather than silently re-pointing it - either reconcile it manually or set the toggle to `false`.

### Can I reuse an existing Cost and Usage Report?

Yes, if it is a **CUR 2.0 export with resource IDs enabled**. Set `Create CUR export` to `false` in the wizard, grant the scanner role read access to your existing bucket, and register the export in Pulse using the *PULSE Configuration - Onboarding Cost Export* steps.

Do not point two exports at the same bucket **prefix** - overlapping report data will be read twice.

### What happens to my AWS resources when I delete the stack?

The CUR **S3 bucket is retained** (remove it manually as part of offboarding) and the Security Hub delegated administrator designation is left in place. Everything else - scanner roles, Security Hub central configuration, and the Quick Setup Config managers - is removed with the stack. Deleting the stack therefore turns Config recording back off, if the stack was what enabled it.

---

## Azure

### Why Reader and Billing Reader, and nothing else?

`Reader` covers resource inventory and configuration; `Billing Reader` covers cost and billing data. Together they are the complete set - onboarding requires nothing beyond them. In particular, **no Microsoft Graph or Entra application permissions are used**, so the SPN cannot read directory data.

### Why is there no separate cost export step for Azure?

Because the `Billing Reader` role alone is sufficient for Pulse to read cost and billing data. There is no export to create, no storage bucket, and no second configuration step in Pulse.

### What scope should I choose?

**Root Management Group** is the recommended choice: it covers all current *and future* subscriptions in your tenant, so newly created subscriptions are picked up without any further action. Choose specific Management Group(s) only if you deliberately want to limit what Pulse sees - you will then need to repeat the assignment when subscriptions are added outside that scope.

Assigning at the Root Management Group scope may require a Global Administrator to first elevate access, since root scope is not granted by default.

### What is the Microsoft cloud security benchmark for?

It is the built-in Azure Policy initiative that Pulse's **Compliance** recommendations are reported against. It must be assigned at the same scope as your `Reader`/`Billing Reader` roles. Many subscriptions already have it - Microsoft Defender for Cloud auto-assigns it - so check before creating a new assignment.

Without it, the compliance sections in Pulse stay empty; the rest of onboarding is unaffected.

### What is the Partner Admin Link (PAL) ID?

PAL attributes your Azure usage to a partner (Devoteam) for Microsoft's partner recognition programmes. The wizard pre-fills Devoteam's own ID by default. It **does not affect access, billing, or the operation of your subscription** and can be cleared if you do not want the attribution.

### What happens when the client secret expires?

This applies to the **manual path only** - the automated path is federated and has no secret.

When a manually supplied secret expires, authentication fails and Pulse can no longer collect data until a new secret is created and updated in Pulse. Pulse records the expiration date you enter, which is why it is a required field.

To rotate, create a new secret on the same App Registration and update it in Pulse. Alternatively, switch to the automated federated flow, which has no secret at all.

### I am a CSP customer - is there anything extra?

Yes. Ensure you can see cost in the Azure portal first - see [Azure: enable the policy to view Azure usage charges](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/get-started-partners#enable-the-policy-to-view-azure-usage-charges). If cost is not visible to you, `Billing Reader` will not make it visible to Pulse either.

---

## Google Cloud

### Built-in Viewer role or Custom Resource Role - which should I pick?

Both give Pulse the same functionality.

- **Built-in `roles/viewer`** is the simplest option and the default. It is a broad read-only role covering far more than Pulse actually reads.
- **Custom Resource Role** creates an organisation-level custom role containing only the 46 permissions Pulse needs. Pick this if your organisation requires least-privilege role definitions, and be aware that new Pulse functionality may require new permissions to be added to it over time.

Note that this choice applies to *resource* access only. Billing access always uses the built-in `roles/billing.viewer` role, because Google Cloud billing accounts only accept predefined roles - a custom role is never used there.

### What do the 46 Google Cloud permissions cover?

They are all read-only (`list`, `get`, `searchAll`) and group by API:

| Permission group | Count | What it reads |
| --- | --- | --- |
| `resourcemanager.*` | 7 | Organisations, folders, projects and effective tags - your resource hierarchy |
| `cloudasset.assets.searchAllResources` | 1 | Resource inventory |
| `recommender.*` | 32 | Google Cloud Recommender output: idle and overprovisioned resources, machine-type sizing, commitments, IAM policy and change-risk recommendations |
| `securitycenter.*`, `securityposture.*`, `cloudsecuritycompliance.frameworks.list` | 5 | Security Command Center findings, sources, postures and compliance frameworks |
| `monitoring.timeSeries.list` | 1 | Cloud Monitoring metrics |

The full list is on the [Google Cloud onboarding page](google.md) under *Manual Setup*. Choosing the built-in `roles/viewer` instead grants all of this and considerably more.

### Which project must the APIs be enabled on?

The 10 core APIs go on the project where the **Service Account was created** - not the projects holding the data being read. This catches people out, because the APIs need enabling somewhere that may contain no resources at all.

Two more go on the project where the cost export dataset lives: **BigQuery** and **BigQuery Data Transfer**.

### Does Pulse create the Cloud Billing export for me?

No. Neither the script nor the manual steps can create or enable a Cloud Billing export to BigQuery - they only grant the service account permission to read one.

If no export exists yet, create it first (*Customer Prerequisites - Creating Cost Export* on the Google Cloud page), or choose **Skip billing export upload** in the wizard and add it later. If an export exists but you don't know its table, leave the Cost Export Table ID blank and the script will list the accessible projects and tables at runtime.

### Why does Pulse need Security Health Analytics?

Security Health Analytics is the Security Command Center service that produces the compliance findings Pulse reads via `securitycenter.findings.list`. It must be enabled at **organisation scope** - check that the project picker shows your organisation name, not a project. Without it, the compliance sections in Pulse stay empty.

### Project-level or table-level BigQuery access for the cost export?

Both work; pick based on what else lives in the export project.

- **Project level** grants access to every dataset and table in the project. Simplest option if the project is dedicated to billing data, or you are otherwise comfortable granting project-wide access.
- **Table level** scopes access to just the billing export dataset, leaving the rest of the project untouched. Use this if the export lives in a project alongside other data you do not want to expose.

If you use table-level sharing, register the cost export in Pulse using the **Service Account's** project ID, not the export project's.

### My organisation does not have a Google Cloud organisation resource - can I still onboard?

Yes, but roles must be created and assigned **per project** rather than once at organisation level, and you will need to repeat that for every project you want Pulse to see. The organisation-level path is strongly preferred where available, because new projects are then covered automatically.

### Why the 30-second wait between steps?

Google Cloud IAM changes take effect asynchronously, so a permission granted a moment ago may not yet be visible to the next call. The onboarding steps recommend waiting roughly 30 seconds after creating an object or granting a permission before continuing.
