---
title: Azure
layout: default
parent: Onboarding
grand_parent: Pulse Ecosystem
nav_order: 1
---

# Azure Onboarding
{: .no_toc }

Connect a Microsoft Azure tenant to Pulse. The recommended path is **federated** - Pulse is granted access without a client secret, so there is nothing to rotate or expire.

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
| **Microsoft Entra ID** (tenant) | `Cloud Application Administrator` or `Global Administrator` (or an equivalent custom role) | Creating the service principal for the Pulse application in your tenant |
| **Azure RBAC**, at your chosen scope | `Owner` or `User Access Administrator` on the target root or management group | Assigning the `Reader` and `Billing Reader` roles, and the compliance policy initiative if enabled |

The script runs in **Azure Cloud Shell**, so there is nothing to install locally.

### Manual Setup
{: .no_toc }

| Where | Role required | Used for |
| --- | --- | --- |
| **Microsoft Entra ID** (tenant) | `Application Developer` or higher | Creating the App Registration and its client secret |
| **Azure RBAC**, at your chosen scope | `Owner` or `User Access Administrator` | Assigning `Reader` and `Billing Reader`, and assigning the compliance policy initiative |

No Microsoft Graph or Entra application permissions are used in either path, so the SPN cannot read directory data.

### Not a role, but required
{: .no_toc }

- **Choosing a scope.** The automated path assigns at **Root Management Group** or **Management Group(s)**. Root is recommended - it covers all current *and future* subscriptions in your tenant. Assigning at root scope may require a Global Administrator to [elevate access](https://learn.microsoft.com/en-us/azure/role-based-access-control/elevate-access-global-admin) first, since root scope is not granted by default. On the manual path you can scope however you like, including individual **subscriptions**. See [Onboarding Q&A: What scope should I choose?](faq.md#what-scope-should-i-choose)
- **CSP customers** must confirm cost is visible in the Azure portal - [Azure: enable the policy to view Azure usage charges](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/get-started-partners#enable-the-policy-to-view-azure-usage-charges). If cost is not visible to you, `Billing Reader` will not make it visible to Pulse either.

---

## Choosing an Onboarding Method

Both methods grant Pulse the same read-only access - `Reader` and `Billing Reader` on an SPN - but they differ in how Pulse authenticates.

| | **Automated - Federated (Recommended)** | **Manual - SPN and Client Secret** |
| --- | --- | --- |
| Credential given to Pulse | None. Access is federated - no client secret is created or uploaded | Client secret you create, plus its expiration date |
| How it is done | One generated PowerShell script, pasted into Azure Cloud Shell | Console steps across Entra ID, RBAC and Azure Policy |
| Scope coverage | Root Management Group or Management Group(s), applied in one pass | Whichever subscriptions or groups you assign by hand |
| Microsoft cloud security benchmark | Optionally assigned for you | You assign it yourself |
| Credential rotation | Not applicable - nothing to expire or rotate | Your responsibility - Pulse loses access when the secret expires |

Use the **automated federated** flow unless your organisation specifically requires custom naming, custom roles, or a change-managed process for creating cloud credentials.

Note: Azure onboarding has **no separate cost-export step** - the `Billing Reader` role alone is sufficient for Pulse to read cost and billing data.

---

## Automated Setup - Federated (Recommended)

1. In Pulse, go to **Cloud Management → Onboarding → Azure**
2. On step **1. Onboard**, choose **Automatic** (marked Recommended) and click Next
3. On step **2. Set Up (Automated)**, configure:
   - **Tenant Name** and **Azure Tenant ID** (both required)
   - **Permission Scope & Roles** - **Root Management Group** (covers all subscriptions in your tenant automatically, including any deployed in future) or **Management Group**, which reveals a **Management Group ID** field
   - **Azure Roles to Assign** - fixed at `Reader` and `Billing Reader`, shown for information
   - **Compliance Policy** - the **Microsoft Cloud Security Benchmark** initiative, assigned at the same scope. Required if you want Compliance recommendations in Pulse.
   - **Partner Admin Link (PAL)** - pre-filled with Devoteam's ID. Does not affect access, billing, or operation of your subscription, and can be cleared.
4. On step **3. Finalize**, review the *Before running* prerequisites, then click **Copy Script and Open Cloud Shell**
5. Paste the script into the Cloud Shell terminal and press Enter
6. Pulse detects completion automatically and confirms with **Onboarding completed successfully**

This flow is **federated**: no client secret is created and none is uploaded to Pulse, so there is nothing to rotate and nothing that expires.

### Before you start

The script **must be run in [Azure Cloud Shell](https://shell.azure.com) (PowerShell)**. Everything it needs is pre-installed there and you are already authenticated, so there is nothing to install locally.

**Check you are in the right directory first.** The script verifies that your active Cloud Shell session is signed in to the tenant you entered in the wizard, and stops immediately if it is not:

> STOP: Wrong tenant. In the Azure portal switch directory ⚙ (top-right) to `<tenant id>`, reopen Cloud Shell with PowerShell, and run this again.

If you see that, switch directory using the settings icon in the top-right of the portal, reopen Cloud Shell, and paste the script again. Nothing is changed in the wrong tenant.

Have your **Tenant Name** and **Azure Tenant ID** to hand, plus your **Management Group ID(s)** if you are not using Root scope. You can copy the IDs from **Management Groups** in the portal.

### What the script does

It reports each step as it goes, so you can see exactly where it got to:

| Step | Action |
| --- | --- |
| 1 | Creates the **service principal** for the Pulse application in your tenant |
| 2 | Resolves that service principal's **object ID** |
| 3 | Assigns the built-in **`Reader`** role at your chosen management group scope |
| 4 | Assigns the built-in **`Billing Reader`** role at the same scope |
| 5 | Assigns the **Microsoft Cloud Security Benchmark** policy initiative at the same scope |
| 6 | Links the **Partner Admin Link (PAL)** ID at tenant level |

Two things worth knowing:

- **No client secret is created**, and nothing is uploaded to Pulse - access is federated.
- The compliance initiative is assigned in **`DoNotEnforce`** mode. It evaluates your resources and reports compliance, but it does not block or change anything you deploy.

The script stops at the first failed step: if one fails, the remaining steps are skipped and it finishes with *Onboarding incomplete - see FAILED step above* rather than *All steps completed successfully*.

### Verification and timing

| What | When |
| --- | --- |
| Script completes and Pulse detects it, showing **Onboarding completed successfully** | Usually while the Finalize step is still open; otherwise the backend picks it up later |
| Resources, findings and costs load in Pulse | Up to 24 hours |

Compliance recommendations additionally depend on Azure Policy evaluating the newly assigned initiative, which happens on Azure's own schedule.

**If the Finalize countdown lapses,** nothing is lost. The roughly 10-minute timer only reflects that Pulse has not detected a deployment *yet*, so you can still run the script afterwards. Pulse shows *Deployment is taking longer than expected*, keeps checking in the background, and completes onboarding automatically once it detects the deployment - return to **Cloud Management** after about 2 hours to confirm. If the deployment genuinely failed, contact support.

**If a step reports FAILED,** the steps after it are skipped and the setup is incomplete. The usual causes are being signed in to the wrong tenant, an incorrect Management Group ID, or lacking `Owner` / `User Access Administrator` at the target scope. See [Onboarding Q&A: recovering from a broken deployment](faq.md#how-do-i-rotate-the-spn-or-recover-from-a-broken-deployment).

---

## Manual Setup - SPN and Client Secret

### Required parameters

These are the five values you will enter in Pulse at the end. All are required.

| Field | Notes |
| --- | --- |
| Tenant ID | Must be a valid GUID |
| Tenant Name | |
| Application ID | Must be a valid GUID |
| Application Secret | The secret's value, shown only once at creation |
| Expiration Date | The date the client secret expires - see [Onboarding Q&A](faq.md#what-happens-when-the-client-secret-expires) |

### Order of work

1. **Create the SPN and assign roles** - so Pulse can authenticate and read your tenant
2. **Enable compliance** - so Pulse can see compliance recommendations
3. **Onboard the SPN in Pulse**

### Customer Prerequisites - Creating SPN

1. Login to Cloud portal
2. Create one App registration (called SPN) - [Azure - Register an Application](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app#register-an-application) with default settings. Copy the **AppID** for later use when onboarding to PULSE.
3. Add a client secret for the newly created SPN - [Azure - Add a client secret](https://learn.microsoft.com/en-us/entra/identity-platform/how-to-add-credentials?tabs=client-secret). Copy the **secret value** and **expiration date** for later use when onboarding to PULSE.

   The secret value is displayed only once. The expiration date is required when you onboard - after it passes, Pulse can no longer authenticate until you create a new secret and update it.

4. Assign the **`Reader`** and **`Billing Reader`** roles on each Subscription you want to onboard - [Azure - Assign Azure roles](https://learn.microsoft.com/en-us/azure/role-based-access-control/role-assignments-portal). This can be done at Root or Management Group level to save time.

   These are the same two roles the automated script assigns, and onboarding requires nothing beyond them. See [Onboarding Q&A: Why Reader and Billing Reader?](faq.md#why-reader-and-billing-reader-and-nothing-else)

5. Applicable for CSP customers: ensure that you can see Cost via the Azure portal - [Azure - How to enable cost view](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/get-started-partners#enable-the-policy-to-view-azure-usage-charges)

### Customer Prerequisites - Enabling Compliance

For Pulse's Compliance recommendations to work, the built-in **Microsoft cloud security benchmark** policy initiative must be assigned at the same scope as your `Reader`/`Billing Reader` roles above. Check whether it is already assigned before creating a new one - [it often is](faq.md#what-is-the-microsoft-cloud-security-benchmark-for).

1. Go to **Azure Policy → Definitions** and search for **"Microsoft cloud security benchmark"** - then check **Policy → Compliance**, filtered to that initiative, to see if it is already assigned at or above your scope
2. If it isn't assigned yet, click **Assign**, set the Scope to the same Management Group(s)/Subscription(s) you used for the `Reader`/`Billing Reader` roles, and complete the assignment (**Review + create**)

This uses the same `Owner` or `User Access Administrator` role already required for the RBAC assignments above - no additional permission is needed.

Azure registers the `Microsoft.PolicyInsights` resource provider for you, so there is nothing to do there. If compliance data never appears, you can confirm it under **Subscriptions → your subscription → Resource providers**.

### PULSE Configuration - Onboarding SPN

1. Login to the [PULSE](https://pulse.devoteam.com/platform/login) platform
2. Open [Cloud Management](https://pulse.devoteam.com/platform/cloud-management) under Administration (left bottom corner) - the same place as the onboarding wizard
3. Go to **Onboarding → Azure**, choose **Manual**, then enter the five values listed under *Required parameters* above
4. Save - Pulse confirms with **Onboarding completed successfully**

---

## Readiness Checklist

Use this to confirm onboarding is complete, whichever method you used:

| Item | Where | Required? |
| --- | --- | --- |
| The SP object exists in the tenant, bound to your company | Microsoft Entra ID | Required |
| `Reader` role assigned to the SPN | Every subscription in scope (or inherited from Root / Management Group) | Required |
| `Billing Reader` role assigned to the SPN | Every subscription in scope (or inherited) | Required for cost and billing data |
| `Microsoft.PolicyInsights` resource provider registered | Every subscription in scope | Registered by Azure automatically - check only if compliance data is missing |
| Microsoft cloud security benchmark initiative assigned at the same scope | Management Group or Subscription | Required for compliance recommendations |
| Cost view enabled - CSP customers only | Billing / partner settings | Required for cost data |
| Client secret and its expiration date recorded in Pulse | Pulse Cloud Management | **Manual path only** - the federated path has no secret |
