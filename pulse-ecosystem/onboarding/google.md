---
title: Google Cloud
layout: default
parent: Onboarding
grand_parent: Pulse Ecosystem
nav_order: 2
---

# Google Cloud Onboarding
{: .no_toc }

Connect a Google Cloud organisation to Pulse using a Service Account.

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

Confirm you have these before you start. Both onboarding methods need the same access - the automated script performs exactly the steps you would otherwise do by hand, using your own `gcloud` session. Everything Pulse itself receives is read-only.

| Where | Access required | Used for |
| --- | --- | --- |
| **Organisation** | Organisation Admin, or equivalent delegated IAM admin roles | Creating IAM bindings at organisation level, and the custom role if you choose that access model |
| **Host project** (where the Service Account lives) | Project-level permission to create service accounts and keys, and to enable APIs | Creating the Service Account and its JSON key, enabling the required APIs |
| **Billing account** | Billing Account Costs Manager or Billing Account Administrator | Granting the Service Account `roles/billing.viewer`, and activating the detailed-usage cost export |
| **Cost export project or dataset** | Permission to grant dataset or table access | Letting the Service Account read the billing export table |
| **Organisation** *(optional)* | `securitycenter.managedServices.update` | Enabling Security Health Analytics. If missing, the script skips it and prints the command to run later - the rest of onboarding is unaffected. |

Google Cloud onboarding is **key-based**: both paths produce a Service Account JSON key that Pulse holds. Store and rotate it in line with your own policy.

**If your Google Cloud has no organisation resource**, roles must be created and assigned **per project** instead of once at organisation level, and repeated for every project you want Pulse to see. See [Onboarding Q&A](faq.md#my-organisation-does-not-have-a-google-cloud-organisation-resource---can-i-still-onboard).

---

## Choosing an Onboarding Method

Both methods grant Pulse the same read-only access and produce the same result - a Service Account key held by Pulse.

| | **Automated - Pulse script** | **Manual** |
| --- | --- | --- |
| How it is done | One generated PowerShell or Bash script, run once | Console steps repeated across IAM, Billing, Security Command Center and BigQuery |
| Credential upload | Uploaded to Pulse automatically | You download the JSON key and paste it into Pulse |
| APIs, roles, billing binding | Done for you | You configure each one yourself |
| Cost export access \* | Done for you | You configure it yourself |
| Security Health Analytics | Enabled for you (best-effort) | You enable it yourself |

\* **Access** to the cost export only. Neither path creates the export itself - a Cloud Billing export to BigQuery must already exist, or you must create it by hand. See *Cost export: the export must already exist*.

Use the **automated** flow unless your organisation specifically requires custom naming, custom least-privilege roles, or a change-managed process for creating cloud credentials.

---

## Automated Setup via Pulse (Recommended)

The automated flow has four steps.

1. **1. Onboard** - in Pulse, go to **Cloud Management → Onboarding → Google Cloud** and choose **Automatic** (marked Recommended)
2. **2. Cloud Set Up (Automated)** - configure:
   - **Default Prefix** - naming standard for the service account and generated role titles (default `Devoteam Pulse`). Pulse shows the generated service account ID as you type.
   - **Credential Mode** - **Create New Service Account** (you supply a **Host Project ID**) or **Use Existing Service Account** (you supply its **email**, and the host project is derived from it)
   - **Organization ID** - optional; leave blank to auto-detect at runtime
   - **Organization Access Model** - **Built-in Resource Viewer Role** (`roles/viewer`, simplest) or **Create Custom Resource Roles** (least-privilege, organisation-level). Pulse shows the resulting role badges, always including `roles/billing.viewer`.
   - **Billing Account ID** - optional; leave blank to auto-detect at runtime
3. **3. Cost Export** - choose **Use or Autodetect Existing Export** or **Skip billing export upload**. See *Cost export: the export must already exist* below.
4. **4. Finalize** - choose **PowerShell** or **Cloud Shell**, then download and run the script. Both variants do the same thing, and both upload credentials to Pulse automatically.

The **Host Project ID** must be entered - the script does not detect it for you. It can be a project in [a different organisation](faq.md#can-the-service-account-live-in-a-different-project-or-organisation) from the resources being scanned.

### Cost export: the export must already exist

The script **cannot create or enable a Cloud Billing export** - it only grants the service account access to one. Three situations:

| Your situation | What to do |
| --- | --- |
| The export exists and you know its table | Choose **Use or Autodetect Existing Export** and enter the **Cost Export Table ID** |
| The export exists but you don't know the table | Choose **Use or Autodetect Existing Export** and leave the Table ID **blank** - the script lists accessible projects and export tables so you can pick at runtime |
| There is no export yet | Choose **Skip billing export upload**, then create the export by hand using *Customer Prerequisites - Creating Cost Export* below, and register it in Pulse afterwards |

Skipping still onboards the service account to Pulse; only the billing export configuration is left out.

You also set a **Cost Export Viewer Role Title** on this step - the name of the role carrying `bigquery.tables.getData`, equivalent to the `PULSE Cost Export Viewer` role in the manual steps below.

### Before you start

**Cloud Shell (no installation required)** - download the script, then in [Google Cloud Shell](https://shell.cloud.google.com) click **⋮ → Upload file** and select it. You are already authenticated with `gcloud`, and `bq`, `jq` and `curl` come pre-installed. Run it with:

```bash
bash ~/onboard-google.sh
```

**PowerShell** - requires PowerShell 5.1+ or 7+ with the Google Cloud SDK (`gcloud` and `bq`). On Windows the script attempts to install the SDK automatically with `winget` if it is missing.

Either way, sign in with an account holding the access listed under *Required Customer Roles* above, and confirm your active project and organisation before running.

### What the script grants

- **Resource access**: either the built-in `roles/viewer` role, or (Custom Resource Role) a new organisation-level custom role containing exactly the permissions listed under *Manual Setup* below - both bound at the organisation level.
- **Billing access**: always the built-in `roles/billing.viewer` role on the billing account, regardless of which access model you chose - Google Cloud billing accounts only accept predefined roles, so a custom role is never used here.
- **Cost export access**: a role granting `bigquery.tables.getData` - the only permission Pulse needs to read rows from the billing export table. When organisation scope is selected the script first tries to create the role at organisation level, falling back to the cost export project if that is unavailable. A built-in role that includes the permission, such as `roles/bigquery.dataViewer`, works equally well but grants more than Pulse uses.
- **Security Health Analytics**: enabled directly using your own `gcloud` session (not the service account). This is a one-time, best-effort step requiring `securitycenter.managedServices.update` on the organisation; if it fails the script prints the exact command to run manually.
- **APIs**: enables the 10 core APIs on the **host project** - Cloud Resource Manager, Cloud Billing, IAM, Compute Engine, BigQuery, Billing Budgets, Recommender, Cloud Asset, Organization Policy and Security Command Center - plus **BigQuery** and **BigQuery Data Transfer** on the cost export project.

### Verification and timing

| What | When |
| --- | --- |
| Script uploads the credentials, Pulse validates them and the Google organisation appears under Cloud Management | As soon as the script finishes |
| Resources, findings and costs load in Pulse | Up to 24 hours |

Detailed cost data additionally depends on your BigQuery billing export, which Google populates on its own schedule.

**If the script fails partway:** re-running a re-downloaded script is safe. It reuses the existing service account and skips any API, role, or policy step that is already done, so it can also be used to recover from an interrupted run.

If the Security Health Analytics step failed, the script prints the exact `gcloud` command to run manually - compliance findings will stay empty until that is done, but the rest of onboarding is unaffected.

---

## Manual Setup - Service Account Key

Manual onboarding has two stages:

1. **Customer prerequisites** - create and prepare everything Pulse needs inside Google Cloud. These are the *Customer Prerequisites* sections below.
2. **Add the information to Pulse** - the *PULSE Configuration* sections below, in this order: the **Service Account** first, then the **cost export**.

Choosing **Manual** in Pulse assumes the prerequisites are already done, so work through stage 1 before you start entering anything.

### Required parameters

These are the values you will paste into Pulse at the end:

- The Service Account **JSON key** file contents
- **Project ID** and **Cost Export Table ID** for the cost export (if you are configuring one)

### Order of work

The blocks below are not strictly dependent on each other, but working through them in this order saves time - it gives Google Cloud a chance to provision each item before the next step needs it.

1. **Service Account, roles and APIs** - so Pulse can authenticate and read your resources
2. **Billing role assignment** - so Pulse can see budgets and billing
3. **Security Health Analytics** - so Pulse can see compliance findings
4. **Cost export** - so Pulse can see detailed billing data

Note: general rule to wait 30 sec after any object or permission granted before proceeding. See [Onboarding Q&A: Why the 30-second wait?](faq.md#why-the-30-second-wait-between-steps)

### Customer Prerequisites - Creating SA

1. Login to Cloud portal
2. Create one Service Account in any existing project, then add Key, JSON type, download key for later use.
3. Grant the Service Account resource access - choose **one** of the two options below.

   **Option A - built-in Viewer role (simplest).** Assign the built-in `Viewer` role to the created SA per organisation, or on specific projects for the PULSE access scope.

   **Option B - custom least-privilege role.** Create a role definition on organisation level containing exactly the 46 permissions Pulse uses. If the cloud doesn't have an organisation, roles will have to be created per project. Alternatively, a combination of roles can be used, so long as the result has all of the permissions listed.

   Pick Option B if your organisation requires least-privilege role definitions, and note that new Pulse functionality may require new permissions to be added over time. See [Onboarding Q&A: Built-in Viewer or Custom Resource Role?](faq.md#built-in-viewer-role-or-custom-resource-role---which-should-i-pick)

   <details markdown="block" class="reference-box">
     <summary>Option B - all 46 permissions for the custom role</summary>

   Add these permissions to the created role, then assign the role to the organisation (if applicable) or to all of the projects you wish to onboard. For what each group covers, see [Onboarding Q&A: What do the 46 permissions cover?](faq.md#what-do-the-46-google-cloud-permissions-cover)

   ```text
   cloudasset.assets.searchAllResources
   cloudsecuritycompliance.frameworks.list
   monitoring.timeSeries.list
   recommender.bigqueryCapacityCommitmentsRecommendations.list
   recommender.bigqueryPartitionClusterRecommendations.list
   recommender.cloudDeprecationGeneralRecommendations.list
   recommender.cloudFunctionsPerformanceRecommendations.list
   recommender.cloudRecentChangeRecommendations.list
   recommender.cloudSecurityGeneralRecommendations.list
   recommender.cloudsqlIdleInstanceRecommendations.list
   recommender.cloudsqlInstanceOutOfDiskRecommendations.list
   recommender.cloudsqlInstancePerformanceRecommendations.list
   recommender.cloudsqlInstanceReliabilityRecommendations.list
   recommender.cloudsqlOverprovisionedInstanceRecommendations.list
   recommender.cloudsqlUnderProvisionedInstanceRecommendations.list
   recommender.computeAddressIdleResourceRecommendations.list
   recommender.computeDiskIdleResourceRecommendations.list
   recommender.computeImageIdleResourceRecommendations.list
   recommender.computeInstanceGroupManagerMachineTypeRecommendations.list
   recommender.computeInstanceIdleResourceRecommendations.list
   recommender.computeInstanceMachineTypeRecommendations.list
   recommender.containerDiagnosisRecommendations.list
   recommender.errorReportingRecommendations.list
   recommender.gmpProjectManagementRecommendations.list
   recommender.iamPolicyChangeRiskRecommendations.list
   recommender.iamPolicyRecommendations.list
   recommender.iamServiceAccountChangeRiskRecommendations.list
   recommender.loggingProductSuggestionContainerRecommendations.list
   recommender.resourcemanagerProjectChangeRiskRecommendations.list
   recommender.resourcemanagerProjectUtilizationRecommendations.list
   recommender.resourcemanagerServiceLimitRecommendations.list
   recommender.runServiceCostRecommendations.list
   recommender.runServiceIdentityRecommendations.list
   recommender.runServiceSecurityRecommendations.list
   recommender.usageCommitmentRecommendations.list
   resourcemanager.folders.get
   resourcemanager.hierarchyNodes.listEffectiveTags
   resourcemanager.organizations.get
   resourcemanager.projects.get
   resourcemanager.projects.list
   resourcemanager.tagKeys.get
   resourcemanager.tagValues.get
   securitycenter.findings.list
   securitycenter.sources.list
   securityposture.postures.get
   securityposture.postures.list
   ```

   </details>

4. **Enable the required APIs** on the same project that holds the Service Account:

   - BigQuery API
   - Billing Budget API
   - Cloud Recommender API
   - Cloud Asset API
   - Organization Policy API
   - Security Command Center API
   - Cloud Resource Manager API (Enabled by Default)
   - Cloud Billing API (Enabled by Default)
   - IAM API (Enabled by Default)
   - Compute Engine API (Enabled by Default if Compute enabled)

   Important! These go on the project where the Service Account was created, not the projects holding the data. See [Onboarding Q&A: Which project must the APIs be enabled on?](faq.md#which-project-must-the-apis-be-enabled-on)

### Customer Prerequisites - Billing role assignment for Budgets View

1. Go to **Billing** in Google Cloud Console and select your Billing Account.
2. Open **Account Management** and click the **Permissions** panel on the right side.
3. Click **Add Principal**, enter your Service Account email, and assign the role **Billing Account Viewer**. Click **Save**.

Your Service Account email is in the format `name@your-project-id.iam.gserviceaccount.com` - you can find it under **IAM & Admin → Service Accounts** in the host project where you created the Service Account.

### Customer Prerequisites - Enable Security Health Analytics

1. Go to **Security → Security Command Center** in Google Cloud Console.
2. Make sure you are viewing at **organisation scope** - check the project picker at the top shows your organisation name, not a project.
3. Open **Settings → Services**, find **Security Health Analytics** and set it to **Enabled**.

### Customer Prerequisites - Creating Cost Export

To start collecting your Cloud Billing data, you must enable Cloud Billing data export to BigQuery:

1. Login to Cloud portal
2. Select the project to use to create the billing export
3. Verify that billing is enabled
4. Enable the **BigQuery Data Transfer Service API** for the project
5. Create a **BigQuery dataset**
6. Enable Cloud Billing export to the BigQuery dataset - **Detailed usage cost**
7. Grant Service Account permissions for the project used for cost export:
   - Open **IAM and admin**
   - Select **Roles**. Create a custom role named like `PULSE Cost Export Viewer` for this project and add this permission: `bigquery.tables.getData` - it is the only one Pulse needs. Press **Create Role**.

     Alternatively, use a built-in role that already includes that permission, such as `roles/bigquery.dataViewer`. That works too, but grants more access than Pulse uses.
   - Grant access, choosing **one** of the two scopes below:

     **Project level** - through IAM, select *grant access* for the already created Service Account by adding the new role `PULSE Cost Export Viewer`. Press Save.

     **Table level** - through the BigQuery share feature: in the BigQuery panel, find and click the billing export dataset. Click **Sharing → Permissions → Add Principal**, enter your Service Account email, assign the custom role `PULSE Cost Export Viewer` and click Save.

     See [Onboarding Q&A: Project-level or table-level BigQuery access?](faq.md#project-level-or-table-level-bigquery-access-for-the-cost-export)
8. Ensure the **BigQuery API** and the **BigQuery Data Transfer Service API** are enabled on the project where the BigQuery dataset lives.

### PULSE Configuration - Onboarding SA

Stage 2, first part - do this once the prerequisites above are complete.

1. Login to the [PULSE](https://pulse.devoteam.com/platform/login) platform
2. Open [Cloud Management](https://pulse.devoteam.com/platform/cloud-management) under Administration (left bottom corner) - the same place as the onboarding wizard
3. Add Google Organisation using SA credentials, example:

   ```json
   {
        "type": "service_account",
        "project_id": "nice-text-id",
        "private_key_id": "long-key",
        "private_key": "long-text",
        "client_email": "email@nice-text-id.iam.gserviceaccount.com",
        "client_id": "685746216876518",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/.../email%40nice-text-id.iam.gserviceaccount.com"
   }
   ```

4. Save [done]

### PULSE Configuration - Onboarding Cost Export

Stage 2, second part - add this after the Service Account is onboarded.

**Onboard the organisation first.** Pulse maps cost data onto projects it already knows about, matched on the **Project ID** you enter below. If the project has not been onboarded yet, Pulse resolves the export against the wrong account and fails to access it. See [Onboarding Q&A: Must accounts be onboarded before adding a cost export?](faq.md#must-accounts-be-onboarded-before-i-add-a-cost-export)

1. Login to the [PULSE](https://pulse.devoteam.com/platform/login) platform
2. Open [Cloud Management](https://pulse.devoteam.com/platform/cloud-management) under Administration (left bottom corner)
3. Add Billing Export Configuration
   - **Project ID** - project where the cost export data set is located, or if table-level sharing was used, the Service Account's project ID
   - **Cost Export Table ID** - `projectname.datasetname.tablename`, can be copied from: BigQuery → SQL Workspace → Project → DataSet → Table → Details → Table ID
4. Save [done]

---

## Readiness Checklist

Use this to confirm onboarding is complete, whichever method you used:

| Item | Where | Required? |
| --- | --- | --- |
| Service Account exists with a valid JSON key held by Pulse | Host project | Required |
| Resource access bound - `roles/viewer` or the custom role | Organisation (or every project, if no organisation) | Required |
| All 10 APIs enabled | Host project (where the Service Account lives) | Required |
| `roles/billing.viewer` / Billing Account Viewer bound to the Service Account | Billing account | Required for cost and budget data |
| Security Health Analytics enabled at organisation scope | Security Command Center | Required for compliance findings |
| Cloud Billing export to BigQuery, Detailed usage cost | Cost export project | Required for detailed cost data |
| `bigquery.tables.getData` granted to the Service Account | Cost export project or dataset | Required for detailed cost data |
| BigQuery API enabled | Cost export project | Required for detailed cost data |
