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

The same **permissions**, yes - but the **coverage** can differ. They also differ in *how the credential is held*:

| | Automated | Manual |
| --- | --- | --- |
| AWS | Federated - Pulse assumes a cross-account role, no secret leaves your account | Long-lived Access Key ID + Secret Access Key |
| Azure | Federated - no client secret is created or uploaded | SPN and client secret you create and paste in, plus its expiration date |
| Google Cloud | Service Account created for you, JSON key uploaded automatically | Service Account JSON key you create and paste in |

Only Google Cloud requires a long-lived credential on the automated path; AWS and Azure are both federated.

Coverage differs because the automated path applies access more broadly than a hand-built setup usually does. On AWS the scanner role lands in every account, including ones created later, while the manual path covers only the accounts where you create the role yourself. On Google Cloud the script always binds at organisation level, while manual setup may be per project.

### How long until my data appears in Pulse?

Resources, findings and costs can take **up to 24 hours** to load after onboarding completes.

On AWS specifically, cost data cannot appear until AWS delivers the first Cost and Usage Report to your S3 bucket, which AWS usually does within 24 hours.

### Can I onboard more than one credential or cloud?

Yes. Multiple credentials and multiple cost exports per cloud are supported.

### Must accounts be onboarded before I add a cost export?

Yes, on both AWS and Google Cloud. Pulse holds a mapping per account (AWS) or per project (Google Cloud), and the cost export is resolved through that mapping - it is how Pulse knows which account's costs a given export belongs to.

Add a cost export for an account Pulse has not onboarded and there is no mapping to match, so Pulse attempts to reach the export using the wrong account and the access fails.

The onboarding scripts sequence this correctly on their own, so in practice this matters when you register a cost export **separately** from the main onboarding - reusing an existing AWS CUR with `Create CUR export` set to `false`, or adding a Google billing export after choosing *Skip billing export upload*. In those cases, complete the cloud onboarding first, then add the export.

Azure is unaffected - it has no separate cost export step.

### Can I re-run onboarding, or deploy the same setup twice?

Yes. Pulse does not track how many times you deploy or re-run. Its scanners simply use whatever credentials they hold at the time they run, provided those credentials are valid, and a **reonboarding job** checks on an ongoing basis for new or expired accounts, subscriptions and projects.

That means newly added accounts or subscriptions are picked up without you re-onboarding by hand. Whether repeating a *failed* run actually repairs it depends on the cloud:

| Cloud | Repeating a failed or partial run |
| --- | --- |
| AWS | Safe and effective - fix the cause, then deploy the stack again |
| Google Cloud | Safe and effective - the script reuses the existing service account and skips completed steps |
| Azure | Safe, but it will **not** repair a partial run. The first step fails once the service principal exists and the script stops there - see [How do I rotate the SPN, or recover from a broken deployment?](#how-do-i-rotate-the-spn-or-recover-from-a-broken-deployment) |

---

## AWS

### Which manual onboarding scenarios are supported?

The manual flow uses one IAM user credential for an entire Organisation, plus a role of the same name in **every** account. The IAM user can live in any of these places:

- The Customer's **Management Account**
- A **Child Account** in the Customer's Organisation
- An account in the **Service Provider's Organisation**

Whichever you choose, Pulse must be able to assume the role in the **management account** - that is how it discovers the rest of the organisation. Without it, only the account holding the credentials is onboarded.

### How do I create the role in many accounts without repeating the console steps?

Deploy the role and its policy as a CloudFormation **StackSet** from the management account, or use your existing IaC pipeline. Remember that the role must exist in the management account too - service-managed StackSets skip it, so add it there separately.

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

Two reasons. The organisation-wide fan-out uses **service-managed CloudFormation StackSets**, which the template creates as the account running the stack - so that account must be the management account. (AWS also allows a registered StackSets delegated administrator to create them, but the template is not set up to run that way.) And the Cost and Usage Report export can only be created in the payer account - an export created in a member account contains only that account's costs.

This also requires **AWS Organizations with all features enabled**. Service-managed StackSets and trusted access are unavailable in a consolidated-billing-only organisation.

### Why us-east-1?

The Cost and Usage Report 2.0 Data Export resource (`AWS::BCMDataExports::Export`) is only available in us-east-1, and the Data Exports definition lives there. The S3 bucket itself can be in another region, but keep it in us-east-1 unless you have a reason not to - you will need the bucket's region for the Pulse cost export URL.

### Why does Pulse need AWS Config?

AWS Config is what gives Pulse your **resource inventory** - Pulse reads it with `config:ListDiscoveredResources` and `config:SelectResourceConfig`. In any account and region where Config is not recording, Pulse sees no resources. Security Hub controls also evaluate Config data, which is why Config must be enabled **before** Security Hub.

AWS Config is a **paid service**, billed per configuration item recorded plus S3 storage for the delivery channel. Enabling it in every region of every account has a real cost - if that matters, enable it only in the regions where you actually run resources.

### Why does Pulse need Security Hub?

Pulse's **Managed Cloud Compliance** findings come from AWS Security Hub CSPM (previously named simply "Security Hub"), reported against the **AWS Foundational Security Best Practices v1.0.0** standard. Without it, the compliance sections in Pulse stay empty; the rest of onboarding is unaffected.

Most Security Hub controls are Config-based and report `NO_DATA` without AWS Config recording in the same account and region. Security Hub is also a **paid service** and its controls consume AWS Config configuration items.

### What permissions do I need to set up Security Hub myself?

These are for the administrator performing the setup, not for Pulse:

- In the **management account**: `securityhub:EnableOrganizationAdminAccount`, `securityhub:ListOrganizationAdminAccounts`, `organizations:EnableAWSServiceAccess`, `organizations:RegisterDelegatedAdministrator`
- In the **Security account**: `securityhub:EnableSecurityHub`, plus permission to manage organisation configuration, configuration policies and policy associations

Pulse's own Security Hub permissions are separate and already in the scanner role policy (`securityhub:GetFindings`, `DescribeStandards`, `ListSecurityControlDefinitions`, `BatchGetSecurityControls`, `GetEnabledStandards`). They must be present in every account whose findings you want.

### Can I enable Security Hub without central configuration?

Yes. Central configuration is the recommended route because it covers current and future accounts in one action, but you can instead enable Security Hub and the *AWS Foundational Security Best Practices v1.0.0* standard account by account and region by region. The end state Pulse needs is identical.

### Do I need a Business or Enterprise Support plan?

Only for Trusted Advisor-based recommendations. Without it, the rest of onboarding still works - Trusted Advisor checks simply return no data.

### AWS Config or Security Hub is already managed in my organisation - what should I do?

Turn the corresponding toggle **off** in the wizard, or skip that prerequisite in the manual flow. Pulse reads whatever is already recorded or already reported, through the scanner role.

Specifically: a second AWS Config recorder in the same account/region will conflict with an existing one (for example one deployed by AWS Control Tower). And if a delegated administrator other than the one you would enter is already designated for Security Hub, the stack deliberately fails rather than silently re-pointing it - either reconcile it manually or set the toggle to `false`.

### Can I reuse an existing Cost and Usage Report?

Yes, if it is a **CUR 2.0 export with resource IDs enabled**. Set `Create CUR export` to `false` in the wizard, grant the scanner role read access to your existing bucket, and register the export in Pulse using the *PULSE Configuration - Onboarding Cost Export* steps.

### Why won't Pulse accept my cost export link?

Almost always because a **bucket URI was pasted instead of the console browser URL**. This is the most common problem customers hit on this step.

Pulse needs the URL exactly as it appears in your browser's address bar when you are looking at the export folder in the S3 console:

```
https://us-east-1.console.aws.amazon.com/s3/buckets/my-cost-bucket?region=us-east-1&bucketType=general&prefix=Pulse/DailyExports/
```

These do **not** work:

| Not accepted | Why |
| --- | --- |
| `s3://my-cost-bucket/Pulse/DailyExports/` | S3 URI, not a URL - Pulse cannot derive the region or account from it |
| `https://my-cost-bucket.s3.amazonaws.com/…` | Bucket endpoint rather than the console link |
| `arn:aws:s3:::my-cost-bucket` | Bucket ARN |
| The console URL for the bucket **root** | Must point at the folder that holds the export, not the top of the bucket |

To get the right value: open **S3**, click into the bucket, then open the folders twice - the path prefix, then the export name - until you can see the `data` and `metadata` objects. Copy the address bar at that point. The region and prefix in the URL are what Pulse uses to locate the report.

### What else should I check on the cost export bucket?

Only relevant if you deviated from the documented steps:

- The bucket must **block all public access** and stay private - Pulse reads it with the role, never anonymously.
- If the bucket is encrypted with **SSE-KMS** rather than SSE-S3, also grant the `Pulse_Viewer` role `kms:Decrypt` on the key, and allow the Data Exports service principals to encrypt with it. SSE-S3 (AES256) avoids both.
- If you add a **lifecycle rule**, keep at least the last 13 months of reports so Pulse can show year-over-year trends.
- Do not point two exports at the same bucket **prefix** - overlapping report data will be read twice.

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

It is the built-in Azure Policy initiative that Pulse's **Compliance** recommendations are reported against. It must be assigned at the same scope as your `Reader`/`Billing Reader` roles.

Without it, the compliance sections in Pulse stay empty; the rest of onboarding is unaffected.

Many subscriptions already have it assigned - **Microsoft Defender for Cloud auto-assigns it** - so on the manual path, check whether an assignment already exists at or above your scope before creating a new one. A duplicate assignment is not harmful, but it is unnecessary. On the automated path the script skips it if it is already there.

### What is the Partner Admin Link (PAL) ID?

PAL attributes your Azure usage to a partner (Devoteam) for Microsoft's partner recognition programmes. The wizard pre-fills Devoteam's own ID by default. It **does not affect access, billing, or the operation of your subscription** and can be cleared if you do not want the attribution.

### What happens when the client secret expires?

This applies to the **manual path only** - the automated path is federated and has no secret.

When a manually supplied secret expires, authentication fails and Pulse can no longer collect data until a new secret is created and updated in Pulse. Pulse records the expiration date you enter, which is why it is a required field.

To rotate, create a new secret on the same App Registration and update it in Pulse. Alternatively, switch to the automated federated flow, which has no secret at all.

### I am a CSP customer - is there anything extra?

Yes. Ensure you can see cost in the Azure portal first - see [Azure: enable the policy to view Azure usage charges](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/get-started-partners#enable-the-policy-to-view-azure-usage-charges). If cost is not visible to you, `Billing Reader` will not make it visible to Pulse either.

### I ran the deployment twice and the second run failed with "already exists". Did something break?

No, that is correct behaviour. A tenant can only hold one service principal for the Pulse application. Once it exists there is nothing left to create, so the failure is Azure telling you the deployment is already done.

If your first run reached *All steps completed successfully*, you are finished - ignore the second run. If it stopped partway, see [How do I rotate the SPN, or recover from a broken deployment?](#how-do-i-rotate-the-spn-or-recover-from-a-broken-deployment) below, because simply running the script again will not repair it.

### Can I create a second service principal for Pulse in my tenant?

No. There is no state in which two service principal objects for the Pulse application coexist in one tenant. A different object ID is only possible by deleting the existing service principal and creating a new one, which **replaces** it - along with any role assignments tied to the old object ID.

### We deploy across several tenants. Do they share an object ID?

No. Each tenant gets its own independent service principal object with its own object ID. Many tenants, many object IDs - that is the expected shape, and one tenant's deployment has no bearing on another's.

### Onboarding a second company to an already-onboarded tenant fails. Why?

The tenant already has its service principal deployed, and Pulse binds that object ID to exactly one company. This is deliberate: it stops a tenant already onboarded by one organisation from being claimed by another. **One tenant, one deployed SPN, one owning company.**

### That tenant genuinely belongs to a different company now. How do we move it?

Clean up first, then redeploy. The existing Pulse connection has to be removed so the object ID binding is released; only then can the new company complete onboarding for that tenant.

This is not self-service by design - releasing a binding is an internal action, precisely because self-service release would reopen the gap the binding closes. Contact support to arrange it.

### How do I rotate the SPN, or recover from a broken deployment?

Delete the existing service principal, recreate it, and make sure Pulse re-verifies. The new service principal has a new object ID, so the old binding no longer matches. Redeploying **without** re-verifying in Pulse leaves a stale object ID on record and a connection that will not authenticate.

Note that re-running the script on its own does not repair a partial deployment. The first step fails once the service principal exists, and the script stops there - so the role, policy and PAL steps that failed the first time are skipped again. Deleting the service principal first is what lets the script run through cleanly.

### What does an object ID on its own prove?

Only that some tenant created a service principal for the Pulse application - not *which* tenant. Confirming it originated in the tenant you claim is what tenant-scoped verification does before the binding is written.

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

### Can the Service Account live in a different project or organisation?

Yes. The host project holding the Service Account does not need to belong to the same organisation as the resources being scanned.

This matters for managed service providers: the provider can create and hold the Service Account in its own project, then grant that Service Account access on the customer organisation or on selected customer projects. If you use an existing Service Account, Pulse derives the host project from its email address.

Remember that the required APIs are enabled on the **host project** - the one owning the Service Account - not on the projects holding the data.

### My organisation does not have a Google Cloud organisation resource - can I still onboard?

Yes, but roles must be created and assigned **per project** rather than once at organisation level, and you will need to repeat that for every project you want Pulse to see. The organisation-level path is strongly preferred where available, because new projects are then covered automatically.

### Why the 30-second wait between steps?

Google Cloud IAM changes take effect asynchronously, so a permission granted a moment ago may not yet be visible to the next call. The onboarding steps recommend waiting roughly 30 seconds after creating an object or granting a permission before continuing.
