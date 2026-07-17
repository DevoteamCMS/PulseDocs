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

1. Access the cloud portal and authenticate
2. Establish an App registration (SPN) following Azure's standard procedures; preserve the AppID for later reference during PULSE setup
3. Generate a client secret for the newly created SPN, noting both the secret value and its expiration timeline for PULSE configuration
4. Grant 'Reader' and 'Billing Reader' roles across each subscription intended for onboarding (this may be assigned at Root or Management Group level for efficiency)
5. For CSP customers: Verify cost visibility is enabled within the Azure portal

## PULSE Configuration - Onboarding SPN

1. Authenticate into the PULSE platform
2. Navigate to Cloud Management via Administration (located in the lower left corner)
3. Input Azure Tenant SPN credentials:
   - Tenant ID (your Azure tenant identifier)
   - Tenant Name (the tenant's designated name)
   - Application ID (the SPN or App registration identifier)
   - Application Secret (the secret's actual value)
   - Application Secret Expiration (the expiration date)
4. Complete the process by saving your configuration
