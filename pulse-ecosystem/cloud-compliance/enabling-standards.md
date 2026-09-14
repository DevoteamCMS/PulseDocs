---
title: Enabling Standards in Your Cloud
layout: default
parent: Cloud Compliance
grand_parent: Pulse Ecosystem
nav_order: 6
permalink: /pulse-ecosystem/cloud-compliance/enabling-standards/
---

# Enabling Standards in Your Cloud
{: .no_toc }

Assigning a security framework in **Policy Manager** tells Pulse what to measure you against. It does not change anything in your cloud. This page covers the other half: enabling the matching standard in AWS, Azure or Google Cloud, so that there is compliance data for Pulse to report on.

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
- TOC
{:toc}
</details>

---

## What Assigning a Framework Does

Policy Manager lists the security frameworks available to your organisation and lets you assign or unassign them. Assigning one adds it to your organisation's active posture assessment in Pulse - the set of standards Pulse scores you against, reports on, and raises violations for.

**It applies within Pulse only. Your cloud environment is not modified.** No policy is created, no setting is changed, and nothing you deploy is blocked or altered as a result.

That matters because the two sides have to agree. Your cloud runs the evaluations and produces the findings; Pulse reads them, explains them, and turns them into violations you can plan work against. If a framework is assigned in Pulse but the matching standard is not enabled in your cloud, the framework appears in Pulse with nothing behind it.

When you assign a framework, Pulse asks you to confirm that it should apply across the entire scope of the service, and then tells you:

> Request will be implemented in the next business day.

Assigning a framework is also what unlocks the rest of Policy Manager. Until one is assigned, the per-policy settings - Exempt, Audit, Remediate and the prevention preferences - stay disabled.

---

## Before You Start

- **Cloud Compliance is a Pulse Premium feature.** See [Pulse Ecosystem](../README.md) for what each tier includes.
- **Assigning and unassigning frameworks requires the Manager company role.** Pulse describes this in Policy Manager as Compliance Manager permissions. With any other role the page is read-only.
- **The cloud-side steps below are performed in your cloud, by your own administrators**, and need privileged access there. The roles required differ per cloud and are listed in each section.

---

## What Onboarding Already Enabled

Cloud onboarding offers to enable a baseline standard for you. If you took that option, one standard is already running and the sections below apply only to **additional** standards you want on top of it.

| Cloud | Baseline offered during onboarding | Where it is described |
| --- | --- | --- |
| **Amazon Web Services** | Security Hub CSPM with AWS Foundational Security Best Practices v1.0.0 | [AWS Onboarding](../onboarding/aws.md) |
| **Microsoft Azure** | The Microsoft Cloud Security Benchmark policy initiative, assigned in `DoNotEnforce` mode | [Azure Onboarding](../onboarding/azure.md) |
| **Google Cloud** | Security Health Analytics | [Google Onboarding](../onboarding/google.md) |

If you skipped it, or onboarded before it was offered, start with the onboarding page for your cloud rather than with this one.

---

## Amazon Web Services

Compliance findings reach Pulse through **AWS Security Hub CSPM**. A standard has to be enabled there before its controls are evaluated and its findings exist.

### What you need
{: .no_toc }

- Security Hub CSPM enabled, with a delegated administrator designated for your organisation
- AWS Config recording in every account and region you want findings from - Security Hub evaluates from the Config configuration recorder
- Security Hub administration permission in your Security account

### Enabling a standard
{: .no_toc }

1. Sign in to your designated **Security account** - the Security Hub CSPM delegated administrator.
2. Go to **Security Hub CSPM → Security standards**.
3. Find the standard you want and enable it.
4. Go to **Settings → General** and turn **Consolidated control findings** on, so that controls shared between standards are grouped and deduplicated rather than reported once per standard.

Enabling a standard enables **all of the controls within it**. Scope follows your Security Hub setup: standards apply per account and per region, so a standard enabled in one region produces findings for that region only. With a delegated administrator and cross-region aggregation in place, you do this once in the Security account rather than account by account.

<details markdown="block" class="reference-box">
  <summary>Automatic enablement in new accounts</summary>

Under local configuration, Security Hub can switch default standards on automatically when an account joins your organisation, and enable all of their controls with them. If you would rather decide standard by standard, turn automatic enablement off before you start.

</details>

### Timing
{: .no_toc }

Allow up to 24 hours for the security score to be calculated in full after enabling a standard.

---

## Microsoft Azure

Compliance findings reach Pulse from **Microsoft Defender for Cloud**. Its regulatory standards and benchmarks are Azure Policy initiatives, so enabling a standard means assigning its initiative at the scope you want measured.

### What you need
{: .no_toc }

- `Resource Policy Contributor` at the scope you are assigning to
- These resource providers registered on the target subscriptions: `Microsoft.ResourceGraph`, `Microsoft.PolicyInsights`, `Microsoft.Authorization`

<details markdown="block" class="reference-box">
  <summary>Checking resource providers</summary>

In the Azure portal, go to **Subscriptions → [your subscription] → Settings → Resource providers**, search for each of the three, and register any that are not already **Registered**. They are usually registered by default.

</details>

### Choosing a scope
{: .no_toc }

An initiative can be assigned at a **management group**, a **subscription** or a **resource group**. A management group is the usual choice: it covers the subscriptions beneath it, including ones added later.

### Enabling a standard
{: .no_toc }

1. In the Azure portal, go to **Policy → Definitions**.
2. Find the initiative for the standard you want. Both built-in and custom initiatives can be used.
3. Click **Assign**.
4. Set the **Scope** to your target management group or subscription.
5. Click **Review + Create**.

### Timing
{: .no_toc }

Compliance data depends on Azure Policy evaluating the newly assigned initiative, which happens on Azure's own schedule.

---

## Google Cloud

Compliance findings reach Pulse from **Security Command Center**. Two services are involved: Security Health Analytics detects the misconfigurations, and Compliance Manager maps those findings to regulatory frameworks.

### Enabling the services
{: .no_toc }

1. In the Google Cloud console, go to **Security → Overview** to open Security Command Center.
2. In the left-hand menu, click **Settings**, then open the **Services** tab.
3. Confirm **Security Health Analytics** is **Enabled**.
4. Go to **Security → Compliance**. If a welcome banner appears, click **Enable compliance**.

You can verify the second step from **Settings → Services** as well, where **Compliance Manager** should be **ON**.

### Adding a specific standard
{: .no_toc }

A specific standard is deployed as a **security posture** - a policy set, built-in or custom, applied to a scope. Policy sets can be scoped to an **organisation**, a **folder** or a **project**, and support muting findings and adding or removing individual policies, which is what makes a customised evaluation possible.

Once the services above are on, a number of compliance standards are already evaluated and visible for review. Deploying a posture is what lets you choose which standards apply to which part of your hierarchy, rather than reading whatever is on by default.

---

## After You Enable a Standard

1. **Assign the matching framework in Policy Manager**, if you have not already. The cloud produces the findings; the assignment is what puts them in scope for Pulse.
2. **Allow time for the data to arrive.** Findings appear in Pulse after your cloud has evaluated the new standard and Pulse has collected the results - allow up to 24 hours for data to load into Pulse, on top of your cloud's own evaluation schedule.
3. **Check Compliance State.** The framework should start reporting metrics rather than sitting empty.

---

## Having Devoteam Do This For You

Every step on this page is a change inside your own cloud, which is why it is yours to make. If you would rather not make it yourself, that is what the **Managed Cloud Compliance** service is for.

With Managed Cloud Compliance enabled, Devoteam implements the cloud-side work on your behalf - enabling and maintaining standards, implementing approved exemptions, carrying out remediation, and deploying preventive controls - as an operated service rather than a set of instructions.

This depends on the permissions you grant. Which scopes Devoteam may act in, and what may be changed there, is agreed with you during onboarding and nothing is done outside it.

Read more: [Cloud Managed Services](https://www.devoteam.com/services/cloud-managed-services).

---

## Q&A

### I assigned a framework in Pulse. Why is it empty?
{: .no_toc }

Most likely the matching standard is not enabled in your cloud, so there are no findings for Pulse to read. Work through the section above for your cloud. If the standard is enabled, give it time - your cloud evaluates on its own schedule, and Pulse collects the results afterwards.

### Does assigning a framework block anything we deploy?
{: .no_toc }

No. Assigning a framework in Pulse changes nothing in your cloud, so it cannot block or alter a deployment. Preventive controls are a separate decision, configured per policy, and they take effect through your cloud rather than through the assignment.

### Can I unassign a framework?
{: .no_toc }

Yes, from the same place in Policy Manager - with one exception. Your active default framework cannot be unassigned while it is the default; select a different default from the framework list first.

Unassigning removes the framework from the service scope in Pulse. It does not disable the standard in your cloud, which continues to evaluate and produce findings until you disable it there as well.

### We already have a standard enabled that Pulse does not show
{: .no_toc }

A standard your cloud evaluates is only reported by Pulse once the matching framework is assigned in Policy Manager. Assigning it is the step that brings existing findings into scope.

### Who can assign frameworks?
{: .no_toc }

Users with the **Manager** company role. Other roles see Policy Manager as read-only, and the per-policy settings stay disabled for them.
