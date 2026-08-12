---
title: Offboarding
layout: default
parent: Onboarding
grand_parent: Pulse Ecosystem
nav_order: 5
---

# Offboarding

This document describes what actions Customer can take to offboard to Devoteam Cloud Management Platform (PULSE).

## Offboarding for Cloud Essentials Customers:

1. Remove Cost exports from PULSE Cloud Management.
2. Remove Cloud Subscriptions from PULSE Cloud Management.
3. Remove Cloud Credentials from PULSE Cloud Management.
4. Remove Cloud Credentials from Customer Cloud infrastructure.
5. Remove Users from PULSE User Management.
6. Leave data expiration and deletion to our cleanup process.

## AWS - Removing the CloudFormation Setup

If you onboarded AWS with the automated stack, step 4 above means deleting that stack in the management (payer) account. Doing so removes the scanner roles, the Security Hub central configuration and the Quick Setup Config managers. Two things are deliberately left behind:

- The **CUR S3 bucket** - retained on purpose, so delete it by hand once you no longer need the reports.
- The **Security Hub delegated administrator** designation - left in place, since it is normally shared with your own tooling.

Deleting the stack also turns AWS Config recording back off, if the stack was what enabled it.

## Managed Customers Offboarding:

Triggered by contract end. Offboarding process will be carried out by Service Delivery Manager, here are some steps that will happen:

1. Offboarding Initiation joint project with customer.
2. Archiving of ITSM and documentation items (for audits and legal purposes) and after some period cleanup will be initiated.
3. Removal of credentials and connections that were established in all tooling and infrastructure.
4. Handover relevant and agreed information.

This is just example, real processes are maintained internally and/or contractually.
