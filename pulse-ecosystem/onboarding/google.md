---
title: Google Cloud
layout: default
parent: Onboarding
grand_parent: Pulse Ecosystem
nav_order: 2
---

# Google Cloud Onboarding
{: .no_toc }

Connect a Google Cloud organisation to Pulse. The recommended path is **federated** - Pulse impersonates a read-only service account in your project, so no Service Account key is created, uploaded or rotated.

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

| Where | Access required | Used for |
| --- | --- | --- |
| **Organisation** | Organisation Admin, or equivalent delegated IAM admin roles | Creating the custom read-only role at organisation level and binding it to the service account |
| **Host project** (where the service account lives) | Permission to enable APIs, create service accounts, and manage access to a service account | Enabling the APIs, creating the service account, and letting Pulse impersonate it |
| **Billing account** *(if you configure the billing role)* | Permission to grant roles on the billing account, such as Billing Account Administrator | Granting the service account `roles/billing.viewer` |
| **Cost export table** *(if you enter one)* | Permission to grant access on the BigQuery table | Granting the service account `roles/bigquery.dataViewer` on that table |

The script runs in **Google Cloud Shell**, so there is nothing to install locally.

### Manual Setup
{: .no_toc }

| Where | Access required | Used for |
| --- | --- | --- |
| **Organisation** | Organisation Admin, or equivalent delegated IAM admin roles | Creating IAM bindings at organisation level, and the custom role if you choose that access model |
| **Host project** (where the Service Account lives) | Project-level permission to create service accounts and keys, and to enable APIs | Creating the Service Account and its JSON key, enabling the required APIs |
| **Billing account** | Billing Account Costs Manager or Billing Account Administrator | Granting the Service Account `roles/billing.viewer`, and activating the detailed-usage cost export |
| **Cost export project or dataset** | Permission to grant dataset or table access | Letting the Service Account read the billing export table |
| **Organisation** | `securitycenter.managedServices.update` | Enabling Security Health Analytics |

The manual path is **key-based**: it produces a Service Account JSON key that Pulse holds. Store and rotate it in line with your own policy.

### Not a role, but required
{: .no_toc }

- **An organisation resource, for the automated path.** The automated flow needs your **Organization ID** and binds Pulse's role at organisation level. If your Google Cloud has no organisation resource, use the manual path, where roles must be created and assigned **per project** and repeated for every project you want Pulse to see. See [Onboarding Q&A](faq.md#my-organisation-does-not-have-a-google-cloud-organisation-resource---can-i-still-onboard).
- **An existing Cloud Billing export, for cost data.** Neither path creates the export to BigQuery - see *Cost export: the export must already exist* below.

---

## Choosing an Onboarding Method

Both methods give Pulse read-only access through a service account, but they differ in how Pulse authenticates.

| | **Automated - Federated (Recommended)** | **Manual - Service Account Key** |
| --- | --- | --- |
| Credential given to Pulse | None. Pulse impersonates the service account - no key is created or uploaded | Service Account JSON key you create and paste into Pulse |
| How it is done | One generated script, pasted into Google Cloud Shell | Console steps across IAM, Billing, Security Command Center and BigQuery |
| Resource access | A custom read-only role with 49 permissions, bound at organisation level | `roles/viewer` with `roles/browser`, or a custom role with 50 permissions, at organisation or project level |
| Billing and cost export access \* | Done for you | You configure it yourself |
| Credential rotation | Not applicable - there is no key to expire or rotate | Your responsibility |

\* **Access** to the cost export only. Neither path creates the export itself - a Cloud Billing export to BigQuery must already exist, or you must create it by hand. See *Cost export: the export must already exist*.

Use the **automated federated** flow unless your Google Cloud has no organisation resource, or your organisation requires a change-managed process for creating cloud credentials.

---

## Automated Setup - Federated (Recommended)

1. In Pulse, go to **Cloud Management → Onboarding → Google Cloud**
2. On step **1. Onboard**, choose **Automatic** (marked Recommended) and click Next
3. On step **2. Cloud Set Up (Automated)**, configure:
   - **Service Account Prefix** - names the service account the script creates (default `pulse-reader`; up to 12 lowercase letters, numbers and hyphens). Pulse adds a generated suffix, so the account looks like `pulse-reader-<suffix>@<host-project-id>.iam.gserviceaccount.com`.
   - **Custom Resource Role** - display name of the read-only role the script creates at organisation level (default `Pulse Reader Role`). The role ID is the title in camel case without spaces, for example `pulseReaderRole`.
   - **Host Project ID** - the project where the service account is created. It can be any project you control and does not need to contain the resources Pulse monitors.
   - **Organization ID** - the numeric ID of your organisation. Find it in **IAM & Admin → Settings**, or run `gcloud organizations list`.
   - **Configure Billing role for budget discovery** - **Yes** asks for your **Billing Account ID** (format `XXXXXX-XXXXXX-XXXXXX`) and grants the service account `roles/billing.viewer` on it. **No** skips this, and Pulse does not discover your budgets.
4. On step **3. Cost Export**, choose **Use Existing Export** and enter the **Cost Export Table ID**, or choose **Skip billing export upload**. See *Cost export: the export must already exist* below.
5. On step **4. Finalize**, review the *Before running* prerequisites, then click **Copy Script and Open Cloud Shell**
6. Paste the script into the Cloud Shell terminal and press Enter
7. Pulse detects completion automatically and confirms with **Onboarding completed successfully**

This flow is **federated**: no Service Account key is created and nothing is uploaded to Pulse, so there is nothing to rotate and nothing that expires.

### Cost export: the export must already exist

The script **cannot create or enable a Cloud Billing export** - it only grants the service account read access to one.

| Your situation | What to do |
| --- | --- |
| The export exists | Choose **Use Existing Export** and enter the full **Cost Export Table ID**, in the format `project.dataset.table`. Find it in Google Cloud console under **Billing → Billing export → Detailed usage cost**. |
| There is no export yet | Choose **Skip billing export upload**, then create the export by hand using *Customer Prerequisites - Creating Cost Export* below, and register it in Pulse afterwards |

Skipping still onboards the service account to Pulse; only the billing export configuration is left out.

The script grants `roles/bigquery.dataViewer` on the **export table only** - not on the dataset or the project that holds it.

### Before you start

The script **must be run in [Google Cloud Shell](https://shell.cloud.google.com)**. You are already authenticated with `gcloud` there, and `bq` comes pre-installed, so there is nothing to install locally.

Sign in with an account holding the access listed under *Required Customer Roles - Automated Setup* above. If the script does not copy, click **Download Script**, open the file and paste its contents into Cloud Shell instead.

### What the script does

**Before it changes anything,** the script checks whether a role with your chosen role ID already exists in the organisation and was not created by Pulse. If so, it shows the role's current title and asks:

> Replace role "`<role id>`"? (yes/no)

Answer `yes` to let Pulse replace that role's title and permissions. Any other answer stops the script with nothing changed - start the onboarding again in Pulse with a different **Custom Resource Role** title.

It then reports each step as it goes, so you can see exactly where it got to:

| Step | Action |
| --- | --- |
| 1 | Enables the required **APIs** on the host project |
| 2 | Creates the **service account** in the host project, or reuses it if it already exists |
| 3 | Creates the **custom read-only role** at organisation level, or updates it if it already exists |
| 4 | Grants that role to the service account on the **organisation** |
| 5 | Lets Pulse **impersonate** the service account |
| 6 | Grants `roles/billing.viewer` on the **billing account** - only if you chose to configure the billing role |
| 7 | Grants `roles/bigquery.dataViewer` on the **cost export table** - only if you entered one |

Steps 6 and 7 are numbered only when they run, so if you skipped the billing role, the cost export step is reported as step 6.

<details markdown="block" class="reference-box">
  <summary>Step 1 - the 11 APIs enabled on the host project</summary>

- Billing Budget API
- Cloud Asset API
- Cloud Billing API
- Cloud Resource Manager API
- Cloud Security Compliance API
- IAM API
- Cloud Monitoring API
- OS Config API
- Cloud Recommender API
- Security Command Center API
- Security Posture API

</details>

<details markdown="block" class="reference-box">
  <summary>Step 3 - the 49 permissions in the custom role</summary>

These are the same permissions as the manual path's custom role, except `resourcemanager.projects.get`, which the automated path does not use.

```text
cloudasset.assets.searchAllResources
cloudsecuritycompliance.cloudControls.list
cloudsecuritycompliance.controlComplianceSummaries.list
cloudsecuritycompliance.frameworkComplianceSummaries.list
cloudsecuritycompliance.frameworks.list
compute.commitments.list
compute.machineImages.list
monitoring.timeSeries.list
osconfig.patchDeployments.list
osconfig.patchJobs.get
osconfig.patchJobs.list
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
recommender.locations.list
recommender.loggingProductSuggestionContainerRecommendations.list
recommender.resourcemanagerProjectChangeRiskRecommendations.list
recommender.resourcemanagerProjectUtilizationRecommendations.list
recommender.resourcemanagerServiceLimitRecommendations.list
recommender.runServiceCostRecommendations.list
recommender.runServiceIdentityRecommendations.list
recommender.runServiceSecurityRecommendations.list
recommender.usageCommitmentRecommendations.list
resourcemanager.hierarchyNodes.listEffectiveTags
resourcemanager.organizations.get
securitycenter.findings.list
securityposture.postures.list
serviceusage.services.list
```

</details>

Things worth knowing:

- **No key is created**, and nothing is uploaded to Pulse. In step 5, Pulse's own service account, `pulse-gateway-prod`, is granted `roles/iam.serviceAccountTokenCreator` on your service account only. That lets Pulse act as the service account, with exactly the read-only access the other steps grant it. See [Onboarding Q&A: How does Pulse use my service account without a key?](faq.md#how-does-pulse-use-my-service-account-without-a-key)
- The script does **not** enable Security Health Analytics.

The script stops at the first failed step: it prints *FAILED Step N*, lists what is already in place in your organisation, and finishes with *Onboarding incomplete - see FAILED step above* rather than *All steps completed successfully*.

### Verification and timing

| What | When |
| --- | --- |
| Script completes and Pulse detects it, showing **Onboarding completed successfully** | Usually while the Finalize step is still open - the script itself ends with *Pulse picks it up within a few minutes* |
| Resources, findings and costs load in Pulse | Up to 24 hours |

Detailed cost data additionally depends on your BigQuery billing export, which Google populates on its own schedule.

**If the Finalize countdown lapses,** nothing is lost. The roughly 10-minute timer only reflects that Pulse has not detected the onboarding *yet*. Pulse shows *Deployment is taking longer than expected*, keeps checking in the background, and completes onboarding automatically once it detects it - return to **Cloud Management** after about 2 hours to confirm. If the deployment genuinely failed, contact support.

**If a step reports FAILED,** fix the cause and run the same script again. A second run reuses the service account and the role it finds instead of failing on them, and applies the remaining steps. Click **Download Script** on the Finalize step to keep a copy for this.

---

## Manual Setup - Service Account Key

Manual onboarding has two stages:

1. **Customer prerequisites** - create and prepare everything Pulse needs inside Google Cloud. These are the *Customer Prerequisites* sections below.
2. **Add the information to Pulse** - the *PULSE Configuration* sections below, in this order: the **Service Account** first, then the **cost export**.

Choosing **Manual** in Pulse assumes the prerequisites are already done, so work through stage 1 before you start entering anything.

### Required parameters

These are the values you will paste into Pulse at the end:

- The Service Account **JSON key** file contents
- **Cost Export Table ID** for the cost export (if you are configuring one)

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

   **Option A - built-in Viewer role (simplest).** Assign the built-in `Viewer` and `Browser` roles to the created SA per organisation, or on specific projects for the PULSE access scope.

   **Option B - custom least-privilege role.** Create a role definition on organisation level containing exactly the 50 permissions Pulse uses. If the cloud doesn't have an organisation, roles will have to be created per project. Alternatively, a combination of roles can be used, so long as the result has all of the permissions listed.

   Pick Option B if your organisation requires least-privilege role definitions, and note that new Pulse functionality may require new permissions to be added over time. See [Onboarding Q&A: Built-in Viewer or Custom Resource Role?](faq.md#built-in-viewer-role-or-custom-resource-role---which-should-i-pick)

   <details markdown="block" class="reference-box">
     <summary>Option B - all 50 permissions for the custom role</summary>

   Add these permissions to the created role, then assign the role to the organisation (if applicable) or to all of the projects you wish to onboard. For what each group covers, see [Onboarding Q&A: What do the 50 permissions cover?](faq.md#what-do-the-50-google-cloud-permissions-cover)

   ```text
   cloudasset.assets.searchAllResources
   cloudsecuritycompliance.cloudControls.list
   cloudsecuritycompliance.controlComplianceSummaries.list
   cloudsecuritycompliance.frameworkComplianceSummaries.list
   cloudsecuritycompliance.frameworks.list
   compute.commitments.list
   compute.machineImages.list
   monitoring.timeSeries.list
   osconfig.patchDeployments.list
   osconfig.patchJobs.get
   osconfig.patchJobs.list
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
   recommender.locations.list
   recommender.loggingProductSuggestionContainerRecommendations.list
   recommender.resourcemanagerProjectChangeRiskRecommendations.list
   recommender.resourcemanagerProjectUtilizationRecommendations.list
   recommender.resourcemanagerServiceLimitRecommendations.list
   recommender.runServiceCostRecommendations.list
   recommender.runServiceIdentityRecommendations.list
   recommender.runServiceSecurityRecommendations.list
   recommender.usageCommitmentRecommendations.list
   resourcemanager.hierarchyNodes.listEffectiveTags
   resourcemanager.organizations.get
   resourcemanager.projects.get
   securitycenter.findings.list
   securityposture.postures.list
   serviceusage.services.list
   ```

   </details>

4. **Enable the required APIs** on the same project that holds the Service Account:

   - Billing Budget API
   - Cloud Recommender API
   - Cloud Asset API
   - Cloud Monitoring API
   - OS Config API
   - Cloud Security Compliance API
   - Security Command Center API
   - Security Posture API
   - Cloud Resource Manager API (Enabled by Default)
   - Cloud Billing API (Enabled by Default)
   - IAM API (Enabled by Default)

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

**Onboard the organisation first.** Pulse maps cost data onto projects it already knows about, matched on the project in the **Cost Export Table ID** you enter below. If the project has not been onboarded yet, Pulse resolves the export against the wrong account and fails to access it. See [Onboarding Q&A: Must accounts be onboarded before adding a cost export?](faq.md#must-accounts-be-onboarded-before-i-add-a-cost-export)

1. Login to the [PULSE](https://pulse.devoteam.com/platform/login) platform
2. Open [Cloud Management](https://pulse.devoteam.com/platform/cloud-management) under Administration (left bottom corner)
3. Add Billing Export Configuration
   - **Cost Export Table ID** - `projectname.datasetname.tablename`, can be copied from: BigQuery → SQL Workspace → Project → DataSet → Table → Details → Table ID
4. Save [done]

---

## Readiness Checklist

Use this to confirm onboarding is complete, whichever method you used:

| Item | Where | Required? |
| --- | --- | --- |
| Service Account exists | Host project | Required |
| Pulse can impersonate the Service Account - `pulse-gateway-prod` holds `roles/iam.serviceAccountTokenCreator` on it | Service Account | **Automated path only** |
| A valid JSON key for the Service Account held by Pulse | Pulse Cloud Management | **Manual path only** - the federated path has no key |
| Resource access bound - the custom role, or on the manual path `roles/viewer` with `roles/browser` | Organisation (or every project, if no organisation - manual path only) | Required |
| The 11 required APIs enabled | Host project (where the Service Account lives) | Required |
| `roles/billing.viewer` / Billing Account Viewer bound to the Service Account | Billing account | Required for cost and budget data |
| Security Health Analytics enabled at organisation scope | Security Command Center | Required for compliance findings |
| Cloud Billing export to BigQuery, Detailed usage cost | Cost export project | Required for detailed cost data |
| Read access to the export table granted to the Service Account - `roles/bigquery.dataViewer` on the table (automated), or a role with `bigquery.tables.getData` (manual) | Cost export table, dataset or project | Required for detailed cost data |
| BigQuery API and BigQuery Data Transfer Service API enabled | Cost export project | Required for detailed cost data |
