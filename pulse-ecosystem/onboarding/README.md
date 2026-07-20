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

Cloud specific Cloud Credentials naming's:
   1. Google - SA (Service Account)
   2. Azure - SPN (Service Principal Name) also known as 'App registration'
   3. AWS - IAM user credentials for programmatic access

## Automated vs Manual Setup

For each cloud provider, Pulse offers two ways to complete Cloud Onboarding:

- **Automated Setup (Recommended)** - Pulse generates a script (Azure, Google) or a guided cloud-native deployment (AWS CloudFormation) that creates the required credentials and permissions for you, and uploads them to Pulse automatically. This is the fastest path and avoids manual permission mistakes.
- **Manual Setup** - You create the credentials and grant the required permissions yourself in your cloud provider's console, then paste the resulting credentials into Pulse. Use this if your organisation requires custom naming, custom roles, or a change-managed process for creating cloud credentials.

Both paths grant Pulse the same read-only permissions - see each cloud's page for the exact roles/permissions required.

## Next Steps

Select pages for your cloud provider and follow instructions. One page per cloud will have all information required for onboarding that particular cloud. Multiple credentials and Cost exports per cloud are supported.

- [Azure Onboarding](azure.md)
- [Google Onboarding](google.md)
- [AWS Onboarding](aws.md)
