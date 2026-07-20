---
title: Asset Ownership
layout: default
parent: Pulse Ecosystem
nav_order: 2
---

# Asset Ownership

## About

Asset ownership pertains to the individual or business unit responsible for managing an asset, handling its security, and making lifecycle decisions. The fundamental problem is that inadequate ownership structures result in "no control, no accountability, higher risk, and higher cost," ultimately making cloud environments messy, insecure, and expensive.

## Terminology

**Asset** - An Insight Object containing metadata copies of cloud provider objects, cloud resources, containers, billing items (tenants, organizations, subscriptions, projects, accounts), configuration items, and similar elements. Examples include virtual machines, public IP addresses, and firewall rules.

**Asset Parent** - Every asset has a parent container. In AWS, accounts parent all assets deployed within them. Google Projects serve the same function. Azure assets require a Resource Group parent, with Resource Groups themselves parented by Subscriptions.

- Azure: Cloud Tenant - Subscription - Resource Group - Resource
- AWS: Cloud Organization - Account - Resource
- Google: Cloud Organization - Project - Resource

**Asset Groups (AG)** - Logically grouped and visible collections of allocated assets for delegated users.

**Delegation** - User assignment to an Asset Group.

**Allocation** - Asset assignment to an Asset Group.

## Main Features and Use Cases

### Ownership Management
Designate asset owners through Asset Group allocation mechanisms.

### Accountability
Supply resource ownership details for operational systems and internal automations.

### Security
Control user access and visibility of owned resources and associated recommendations.

### Economics
Generate cost views per Asset Group for owners and managers to track business expenses.

## Quick Start

### General Recommendations

- Use automatic Asset Group creation
- Use tag-based allocation and resolve issues in the cloud when feasible

### Asset Group Creation and Asset Allocation

The Ownership Menu appears under Administration, with Ownership Configuration available for the "Company - Ownership Manager" role.

**Automatic Setup (Recommended)**
- Enable automatic Asset Group creation using a company tag-key, which automatically assigns assets to groups using tag-key:value pairs

**Semi/Manual Setup (Alternative)**
- Create groups manually and allocate assets automatically through tag-key:value pairs

**Manual Error Fixing**
- Directly allocate assets to Asset Groups, overriding tag allocation

**Inheritance (Backend)**
- Automatic rules execute asset allocation based on parent allocation when assets lack other allocations

### User Delegation to Asset Group

After establishing Asset Groups, enable filtered views per group. To grant asset owners access:

1. Delegate users to Asset Groups
2. Ensure users possess at least "Company User" and relevant service-specific user roles

Users with Manager and Analyst roles maintain read-only visibility across all Asset Groups.

## Feature Description

### How Assets Are Allocated

Assets allocate to Asset Groups with the following priority order:

- **Direct** - Manual allocation modifications
- **Tag** - Automatic allocation using tag:value pairs mapped to Asset Groups (if no direct allocation exists)
- **Inheritance** - Assets inherit parent Asset Group allocation (if no tag or direct allocations exist)
- **Unassigned** - Default Asset Group for all company assets lacking other assignments

### Use Cases

**Scenario 1** - Most common when Asset Groups use tag values with backend rules managing the rest, leveraging existing deployment and tag strategies.

**Scenario 2** - Separates resources within larger containers (subscriptions, accounts, or projects) housing multiple applications, using direct allocation to correct deployment and tag strategy gaps.

**Scenario 3** - Azure-specific and best avoided; replaces subscription-level tag allocation with direct allocation when subscriptions are managed separately from resource groups and lower-level asset group delegations.

**Scenario 4** - Similar to Scenario 3, separating asset and parent delegation across different management levels.
