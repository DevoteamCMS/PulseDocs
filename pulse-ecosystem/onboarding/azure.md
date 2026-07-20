---
title: Azure
layout: default
parent: Onboarding
grand_parent: Pulse Ecosystem
nav_order: 1
---

# Azure Onboarding

## Customer Prerequisites - Creating SPN

Organizations must meet these requirements and prepare a Service Principal Name (SPN) with proper roles and permissions before onboarding to PULSE:

1. Login to Cloud portal
2. Create one App registration (called SPN) - [Azure - Register an Application](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app#register-an-application) with default settings copy AppID for later use when onboarding to PULSE
3. Add a client secret for newly created SPN - [Azure - Add a client secret](https://learn.microsoft.com/en-us/entra/identity-platform/how-to-add-credentials?tabs=client-secret) copy secret value and expiration date for later use when onboarding to PULSE
4. Assign 'Reader' and 'Billing Reader' roles on each Subscriptions you want to onboard - [Azure - Assign Azure roles](https://learn.microsoft.com/en-us/azure/role-based-access-control/role-assignments-portal) (this can be done on Root or Management Group level to save time)
5. Applicable for CSP customers: Ensure that you can see Cost via Azure portal - [Azure - How to enable cost view](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/get-started-partners#enable-the-policy-to-view-azure-usage-charges)

## PULSE Configuration - Onboarding SPN

1. Login to [PULSE](https://pulse.devoteam.com/platform/login) platform
2. Open [Cloud Management](https://pulse.devoteam.com/platform/cloud-management) under Administration (left bottom corner)
3. Add Azure Tenant SPN credentials:
   - Tenant ID (your Azure tenant identifier)
   - Tenant Name (the tenant's designated name)
   - Application ID (the SPN or App registration identifier)
   - Application Secret (the secret's actual value)
   - Application Secret Expiration (the expiration date)
4. Complete the process by saving your configuration
