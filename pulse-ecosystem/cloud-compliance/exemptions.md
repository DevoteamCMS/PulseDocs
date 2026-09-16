---
title: Exemptions
layout: default
parent: Cloud Compliance
grand_parent: Pulse Ecosystem
nav_order: 4
permalink: /pulse-ecosystem/cloud-compliance/exemptions/
---

# Exemptions
{: .no_toc }

Sometimes a violation will not be fixed, and that is the right answer - the fix would break a system, cost more than the risk, or apply to a resource on its way out. Exemptions is where those decisions are asked for, granted or refused, and kept on record.

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
- TOC
{:toc}
</details>

---

## Two Tabs, Two Different Things

The distinction between them is the single most important thing on this page.

| Tab | What it holds |
| --- | --- |
| **Exemption Requests** | The decision workflow inside Pulse - who asked for an exemption, and what a Compliance Manager decided |
| **Exempted Violations** | Exemptions that actually exist **in your cloud**, found by scanning it |

A request that has been approved appears in the first tab as **Approved**. It does not appear in the second until the exemption has been put in place in the cloud itself.

That gap is deliberate, and it is where most of the confusion about this page comes from. **Approving a request does not implement it.** Approval is a decision recorded in Pulse; making the cloud stop reporting the violation is separate work - done by your own team on Pulse Premium, or by Devoteam Operations where Managed Cloud Compliance is enabled.

So the two tabs answer two different questions. *What have we agreed to accept?* is the first. *What is actually exempted right now?* is the second.

---

## The Request Lifecycle

A request passes through three states, and only three:

| Status | Meaning |
| --- | --- |
| **Requested** | Submitted by a Risk Owner, awaiting a decision |
| **Approved** | A Compliance Manager accepted the risk, with an expiry date |
| **Rejected** | A Compliance Manager refused it; the violation returns to the owner to be remediated |

Requests are raised from [Remediation Planner](remediation-planner.md#requesting-an-exemption) by choosing **Exempt Request** on a violation. They are never created from this page - this page is where they are reviewed.

---

## Reviewing a Request

Open a request by clicking the asset name. The panel has two tabs, **Request Details** and **History**, and Request Details is organised into three sections.

**Review** is the requester's case: the exemption reason they wrote, the policy, the framework, the resource and its subscription. This is what you are deciding on.

**Violation Information** is the surrounding fact: the full asset path, the policy, the framework, the current Policy Action and when the violation was first detected.

**Exemption Status** is the decision itself, and carries the request's current status as a badge.

### Approving or rejecting
{: .no_toc }

Only the **Manager** company role can decide a request. Everyone else sees *Read-Only View: Only Compliance Managers can approve or reject exemption requests.*

Pulse states the consequence of each choice:

> **Approve** to pause policy enforcement until expiry, or **Reject** to return the violation to the asset owner for remediation.

**Approving** requires an **Exemption Expiry** date, which must be at least tomorrow - an exemption cannot be granted that expires the same day, and it cannot be granted forever. An **Approval Reason** is required: your reasoning matters as much as the requester's, because it is what an auditor reads. A **Risk Number** is optional, and maps the exemption to an entry in your own risk register.

**Rejecting** requires a **Rejection Reason** and nothing else. That reason is what the Risk Owner sees, so it should say what would make the request acceptable, or why it never could be.

### Changing a decision
{: .no_toc }

A decision is not final. Opening an already-approved or already-rejected request lets you decide again, with a warning first: *Existing data will be overwritten.* The **History** tab preserves what was decided before, so revisiting a decision does not erase the trail.

This matters when an exemption was granted on assumptions that have since changed - a resource that was about to be decommissioned and now is not, for instance.

---

## The Same Violation, More Than Once

A violation can be the subject of several exemption requests over time, and each is a separate record with its own request date, justification and decision.

That is normal rather than a fault. A request rejected in March can be raised again in September with a better justification, or because the circumstances genuinely changed. An exemption that expired can be requested again to extend it. Each request is decided on its own merits, and the request list keeps all of them.

When reviewing, check the **Request Date** and **Last Updated** columns: several rows for the same asset and policy mean there is a history here, and the History tab is worth opening before deciding.

---

## Exemptions Detected in the Cloud

The **Exempted Violations** tab lists what your cloud reports as exempted, regardless of whether the exemption was ever requested through Pulse. An exemption someone created directly in the cloud console appears here too.

Each carries a type - **Temporary**, **Permanent** or **Expired** - along with the asset, the policy, the framework and the period it covers.

Use it as the check on the first tab. An approved request that never shows up here has been agreed but not carried out.

---

## Q&A

### We approved an exemption but the violation is still being reported
{: .no_toc }

Approval is a decision in Pulse, not a change in your cloud. Until the exemption is implemented cloud-side, the violation continues to be found and reported. Check the **Exempted Violations** tab - if it is not there, the work has not been done yet.

Implementation is your team's on Pulse Premium, or Devoteam's under Managed Cloud Compliance.

### Who can approve a request?
{: .no_toc }

Only users with the **Manager** company role. Risk Owners raise requests; they cannot decide their own.

### A request is no longer needed - can it be withdrawn?
{: .no_toc }

There is no withdraw action in Pulse. If the risk is now going to be fixed instead, set a different action on the violation in [Remediation Planner](remediation-planner.md#setting-an-action), and tell your Compliance Manager, so the request is not decided on out-of-date information.

### Why does the same asset appear several times?
{: .no_toc }

Either it breaches more than one policy, or it has been the subject of more than one exemption request over time. The Violation ID and the Request Date tell them apart.

### What happens when an exemption expires?
{: .no_toc }

The violation becomes reportable again. In [Policy Manager](policy-manager.md), policies with an exemption approaching or past its expiry show as **Exemption Due Soon** or **Exempt Expired**, which is the cue to renew the exemption or remediate.

### Can an exemption be granted permanently?
{: .no_toc }

Not through a request - approval requires an expiry date. **Permanent** appears as a type under Exempted Violations because an exemption created directly in the cloud can be open-ended.
