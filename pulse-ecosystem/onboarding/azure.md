---
title: Azure
layout: default
parent: Onboarding
grand_parent: Pulse Ecosystem
nav_order: 1
---

# Azure Onboarding

## Table of Contents

- Automated Setup via Pulse (Recommended)
- Manual Setup
  - Customer Prerequisites - Creating SPN
  - PULSE Configuration - Onboarding SPN

---

## Onboarding Microsoft Azure using Service Principal Name (SPN)

### Automated Setup via Pulse (Recommended)

The easiest way to onboard Azure is to use the automated onboarding script available directly in Pulse:

1. In Pulse, go to Cloud Management → Onboarding → Azure
2. Follow the wizard to configure your options:
   - SPN / App Registration name (default `pulse_by_devoteam_readonly`) and client secret expiration (12 or 24 months)
   - Permission Scope: **Root Management Group** (covers all current and future subscriptions in your tenant), **specific Management Group(s)**, or **specific Subscription(s)**
   - Optional: enable the **Microsoft Cloud Security Benchmark** policy initiative at the same scope — required if you want Compliance recommendations in Pulse
   - Optional: a Partner Admin Link (PAL) ID for partner attribution (pre-filled with Devoteam's own ID by default; this does not affect access, billing, or operation of your subscription and can be cleared)
3. Download and run the generated PowerShell script — it creates the App Registration (SPN), assigns the required Azure roles at your chosen scope, and uploads the credentials to Pulse automatically

The script requires PowerShell 5.1+ or PowerShell 7+ with the `Az.Accounts` and `Az.Resources` modules (installed automatically if missing). It can also be run directly from [Azure Cloud Shell](https://shell.azure.com), which has everything pre-configured.

#### Prerequisites to run the script

- **Microsoft Entra ID**: ability to create App Registrations. Requires the `Application Developer` or `Global Administrator` role (or an equivalent custom role) in your Microsoft Entra ID tenant.
- **Azure RBAC**: ability to assign roles (and the compliance policy, if enabled) at the chosen scope. Requires `Owner` or `User Access Administrator` on the target Management Group(s) or Subscription(s).

#### What the script does

- Creates (or reuses, if one with the same name already exists) an App Registration / Service Principal and a new client secret with your chosen expiration
- Assigns the built-in Azure roles **`Reader`** and **`Billing Reader`** to the SPN at your chosen scope
- If enabled, assigns the Microsoft Cloud Security Benchmark policy initiative at the same scope, registering the `Microsoft.PolicyInsights` resource provider on target subscriptions if needed
- If a Partner Admin Link ID is set, links it on each target subscription
- Uploads the resulting SPN credentials to Pulse automatically

Re-running a re-downloaded script is safe — it reuses the existing App Registration and skips any role or policy assignments that already exist, so it can also be used to recover from an interrupted run.

## Manual Setup

### Customer Prerequisites - Creating SPN

Organizations must meet these requirements and prepare a Service Principal Name (SPN) with proper roles and permissions before onboarding to PULSE:

1. Login to Cloud portal
2. Create one App registration (called SPN) - [Azure - Register an Application](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app#register-an-application) with default settings copy AppID for later use when onboarding to PULSE
3. Add a client secret for newly created SPN - [Azure - Add a client secret](https://learn.microsoft.com/en-us/entra/identity-platform/how-to-add-credentials?tabs=client-secret) copy secret value and expiration date for later use when onboarding to PULSE
4. Assign **'Reader'** and **'Billing Reader'** roles on each Subscriptions you want to onboard - [Azure - Assign Azure roles](https://learn.microsoft.com/en-us/azure/role-based-access-control/role-assignments-portal) (this can be done on Root or Management Group level to save time) — these are the same two roles the automated script assigns; onboarding requires nothing beyond them (no Microsoft Graph / Entra application permissions are used)
5. Applicable for CSP customers: Ensure that you can see Cost via Azure portal - [Azure - How to enable cost view](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/get-started-partners#enable-the-policy-to-view-azure-usage-charges)

Note: unlike AWS and Google Cloud, Azure onboarding has no separate cost-export step — the `Billing Reader` role alone is sufficient for Pulse to read cost and billing data.

### PULSE Configuration - Onboarding SPN

1. Login to [PULSE](https://pulse.devoteam.com/platform/login) platform
2. Open [Cloud Management](https://pulse.devoteam.com/platform/cloud-management) under Administration (left bottom corner)
3. Add Azure Tenant SPN credentials:
   - Tenant ID (your Azure tenant identifier)
   - Tenant Name (the tenant's designated name)
   - Application ID (the SPN or App registration identifier)
   - Application Secret (the secret's actual value)
   - Application Secret Expiration (the expiration date)
4. Complete the process by saving your configuration
