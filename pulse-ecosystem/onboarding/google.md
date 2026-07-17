---
title: Google Cloud
layout: default
parent: Onboarding
grand_parent: Pulse Ecosystem
nav_order: 2
---

# Google Onboarding

## Automated Setup via Pulse (Recommended)

The easiest way to onboard Google Cloud is to use the automated onboarding script available directly in Pulse:

1. In Pulse, go to Cloud Management → Onboarding → Google Cloud
2. Follow the wizard to configure your options (host project, access model, billing export)
3. Download and run the generated PowerShell script — it performs all the Google Cloud steps and uploads credentials to Pulse automatically

The script requires the Google Cloud SDK (gcloud and bq) and PowerShell 5.1+. It can also be run from Google Cloud Shell.

## Manual Setup

### Customer Prerequisites - Creating SA

Customer must follow below requirements and prepare SA with required roles and permissions to proceed on onboarding to PULSE platform:

1. Login to Cloud portal
2. Create one Service Account in any existing project, then add Key, JSON type, download key for later use.
3. Assign built-in 'Viewer' role for created SA per organisation or specific projects for PULSE access scope

Or

a. Create a Role definition on organisation level. If the cloud doesn't have organisation, roles will have to be created per project. Alternatively, a combination of roles can be used, so long as result has all of the permissions listed below.

b. Add permissions (46) to created role:

- cloudasset.assets.searchAllResources
- cloudsecuritycompliance.frameworks.list
- monitoring.timeSeries.list
- recommender.bigqueryCapacityCommitmentsRecommendations.list
- recommender.bigqueryPartitionClusterRecommendations.list
- recommender.cloudDeprecationGeneralRecommendations.list
- recommender.cloudFunctionsPerformanceRecommendations.list
- recommender.cloudRecentChangeRecommendations.list
- recommender.cloudSecurityGeneralRecommendations.list
- recommender.cloudsqlIdleInstanceRecommendations.list
- recommender.cloudsqlInstanceOutOfDiskRecommendations.list
- recommender.cloudsqlInstancePerformanceRecommendations.list
- recommender.cloudsqlInstanceReliabilityRecommendations.list
- recommender.cloudsqlOverprovisionedInstanceRecommendations.list
- recommender.cloudsqlUnderProvisionedInstanceRecommendations.list
- recommender.computeAddressIdleResourceRecommendations.list
- recommender.computeDiskIdleResourceRecommendations.list
- recommender.computeImageIdleResourceRecommendations.list
- recommender.computeInstanceGroupManagerMachineTypeRecommendations.list
- recommender.computeInstanceIdleResourceRecommendations.list
- recommender.computeInstanceMachineTypeRecommendations.list
- recommender.containerDiagnosisRecommendations.list
- recommender.errorReportingRecommendations.list
- recommender.gmpProjectManagementRecommendations.list
- recommender.iamPolicyChangeRiskRecommendations.list
- recommender.iamPolicyRecommendations.list
- recommender.iamServiceAccountChangeRiskRecommendations.list
- recommender.loggingProductSuggestionContainerRecommendations.list
- recommender.resourcemanagerProjectChangeRiskRecommendations.list
- recommender.resourcemanagerProjectUtilizationRecommendations.list
- recommender.resourcemanagerServiceLimitRecommendations.list
- recommender.runServiceCostRecommendations.list
- recommender.runServiceIdentityRecommendations.list
- recommender.runServiceSecurityRecommendations.list
- recommender.usageCommitmentRecommendations.list
- resourcemanager.folders.get
- resourcemanager.hierarchyNodes.listEffectiveTags
- resourcemanager.organizations.get
- resourcemanager.projects.get
- resourcemanager.projects.list
- resourcemanager.tagKeys.get
- resourcemanager.tagValues.get
- securitycenter.findings.list
- securitycenter.sources.list
- securityposture.postures.get
- securityposture.postures.list

c. Assign a created role to organisation (if applicable) or all of the projects that you wish to onboard.

4. Ensure Services and APIs are enabled on the same project holding Service account created for onboarding purposes:

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

Important! API's must be enabled on the project where Service Account is created.

### Customer Prerequisites - Billing role assignment for Budgets View

Go to Billing in Google Cloud Console and select your Billing Account.

Open Account Management and click the Permissions panel on the right side. Click Add Principal, enter your Service Account email, and assign the role Billing Account Viewer. Click Save.

Your Service Account email is in the format name@your-project-id.iam.gserviceaccount.com — you can find it under IAM & Admin → Service Accounts in the host project where you created the Service Account.

### Customer Prerequisites - Enable Security Health Analytics

Go to Security → Security Command Center in Google Cloud Console.

Make sure you are viewing at organisation scope — check the project picker at the top shows your organisation name, not a project.

Open Settings → Services, find Security Health Analytics and set it to Enabled.

### Customer Prerequisites - Creating Cost Export

Customer must follow below requirements and prepare cost export to proceed on onboarding to PULSE platform. To start collecting your Cloud Billing data, you must enable Cloud Billing data export to BigQuery following guide steps you need to do:

- Login to Cloud portal
- Select to use to create billing export
- Verify that billing is enabled
- Enable the BigQuery Data Transfer Service API for the project
- Create a BigQuery dataset
- Enable Cloud Billing export to the BigQuery dataset [Detailed usage cost]
- Grand Service account permissions for the project used for cost export:
  - Open IAM and admin
  - Select Roles. Create custom role named like 'PULSE Cost Export Viewer' for this project and add this permission: "bigquery.tables.getData". Press Create Role.
  - Grant Access, there are 2 ways to do this:
    1. Through IAM - select 'grant access' for already created Service Account by adding new role 'PULSE Cost Export Viewer'. Press Save.
    2. BigQuery share feature - in BigQuery panel, find and click the billing export dataset. Click Sharing → Permissions → Add Principal, enter your Service Account email, assign the custom role PULSE Cost Export Viewer and click Save.
- Ensure APIs are enabled. Enable on the project where the BigQuery dataset lives:
  - BigQuery API

Note: General rule to wait 30 sec after any object or permission granted before proceeding.

### PULSE Configuration - Onboarding SA

1. Login to PULSE platform
2. Open Cloud Management under Administration (left bottom corner)
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

- Login to PULSE platform
- Open Cloud Management under Administration (left bottom corner)
- Add Billing Export Configuration
  - Project ID [Project where cost export data set is located or if sharing was used use Service account projectID]
  - Cost Export Table ID [projectname.datasetname.tablename], can be copied from: BigQuery->SQLWorkspace->Project->DataSet->Table->Details->TableID
- Save [done]
