---
title: Connector Management
layout: default
parent: Onboarding
grand_parent: Pulse Ecosystem
nav_order: 4
---

# Connector Management
{: .no_toc }

**Connector Management** lists every set of cloud credentials you have onboarded to Pulse, called a connector, and shows whether each one is working. Open it from **Administration → Connector Management**. It is also where you start onboarding a new cloud.

1. TOC
{:toc}

## The Connectors Table

Each row is one connector:

- **Onboarding Status** - **Connected**, **Disconnected** or **Pending**. A connected connector with problems shows the number of issues, for example *Connected (2 Issues)*.
- **Credentials Name** and **Tenants** - which credentials these are and the tenants they cover.
- **Subscription Count** - how many subscriptions the connector reaches.
- **Cost Data** - **Connected** or **Disconnected**, with the number of issues if there are any.
- **Last Credentials Check** - when Pulse last checked the credentials.

Expand a row to see its subscriptions, each with a status of **Connected**, **Disconnected** or **Unchecked**. Select **View Details** on a subscription to open its **Readiness Checks** in a new tab: the individual checks Pulse runs, grouped, with the status of each.

## Credentials & Cost Exports

Select **Credentials & Cost Exports** on a row to open the connector's details. Everyone can view them; only Owners and Managers can change anything.

- **Credentials** - the identifiers Pulse uses for this connector, and its readiness checks. Credentials entered by hand, such as an Azure client secret or a Google Cloud service account key, can be updated here. You can also delete the connector.
- **Cost Exports** - AWS and Google Cloud only. The cost exports Pulse reads billing data from. You can add or delete them here.

## Adding a Cloud

Owners and Managers see two buttons above the table:

- **Start Onboarding** - opens the onboarding wizard. See [Azure](azure.md), [Google Cloud](google.md) or [AWS](aws.md).
- **Delegate Onboarding** - invites a team member to do the onboarding. They automatically get the Manager role, which onboarding requires.

Until a cloud is onboarded, the page shows *No cloud providers onboarded.* with the same two buttons.
