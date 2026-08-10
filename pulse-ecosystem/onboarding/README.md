---
title: Onboarding
layout: default
parent: Pulse Ecosystem
has_children: true
nav_order: 3
permalink: /pulse-ecosystem/onboarding/
---

# Cloud Onboarding

This document describes what prerequisites, permissions Customer must have and actions Customer must take to onboard to Devoteam Cloud Management Platform (PULSE).

## High Level Steps

1. Register new Company
   (if you are here, you probably already completed this step)

2. Add Cloud Provider
   Authenticate PULSE with your cloud providers. Onboard your Cloud Resources, Compliance Findings and Costs.

3. Wait for resources, findings and costs to load
   Could take up to 24 hours.

## Onboarding Types

1. Cloud Onboarding - Customer is responsible for creating credentials and assigning required permissions for full product functionality.

2. Cost Exports - currently for AWS and Google Clouds only - required to get cost information, you need to grant additional permissions for credentials.

**Order matters: Cost Exports depend on Cloud Onboarding.** Pulse maps cost data onto the accounts and projects it already knows about, so the AWS accounts or Google projects must be onboarded **before** you add a cost export. If they are not, Pulse resolves the export against the wrong account and fails to access it.

The automated scripts sequence this for you, so it matters mainly when you add a cost export separately - for example when reusing an existing AWS CUR, or after skipping the billing export step in the Google wizard.

Cloud specific Cloud Credentials naming's:
   1. Google - SA (Service Account), with a JSON key in both setups
   2. Azure - SPN (Service Principal Name) also known as 'App registration' - federated access with no client secret (automated setup), or an SPN client secret you supply (manual setup)
   3. AWS - a federated cross-account IAM role assumed by Pulse (automated setup), or IAM user credentials for programmatic access (manual setup)

On AWS and Azure the automated path is **federated**: Pulse holds no long-lived secret for your cloud. Google Cloud still uses a Service Account key in both paths.

## Automated vs Manual Setup

For each cloud provider, Pulse offers two ways to complete Cloud Onboarding:

- **Automated Setup (Recommended)** - Pulse generates a script (Azure, Google) or a guided cloud-native deployment (AWS CloudFormation) that creates the required credentials and permissions for you, and uploads them to Pulse automatically. This is the fastest path and avoids manual permission mistakes.
- **Manual Setup** - You create the credentials and grant the required permissions yourself in your cloud provider's console, then paste the resulting credentials into Pulse. Use this if your organisation requires custom naming, custom roles, or a change-managed process for creating cloud credentials.

Both paths grant Pulse the same read-only permissions - see each cloud's page for the exact roles/permissions required. The automated paths can also enable the supporting services Pulse reads from (AWS Config and Security Hub on AWS, the Microsoft cloud security benchmark on Azure, Security Health Analytics on Google Cloud), which you would otherwise enable yourself.

## Next Steps

Select the page for your cloud provider and follow the instructions. Each cloud page opens with the **customer roles required** to complete onboarding, then covers both the automated and manual paths, and ends with a readiness checklist. Multiple credentials and Cost exports per cloud are supported.

- [Azure Onboarding](azure.md)
- [Google Onboarding](google.md)
- [AWS Onboarding](aws.md)

Background, rationale and "why does Pulse need this?" questions are collected separately, so the step-by-step pages stay short:

- [Onboarding Q&A](faq.md)

When the time comes to disconnect a cloud or leave the platform:

- [Offboarding](../offboarding.md)
