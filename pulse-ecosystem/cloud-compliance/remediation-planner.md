---
title: Remediation Planner
layout: default
parent: Cloud Compliance
grand_parent: Pulse Ecosystem
nav_order: 3
permalink: /pulse-ecosystem/cloud-compliance/remediation-planner/
---

# Remediation Planner
{: .no_toc }

Policy Manager decides what should happen when a policy is broken. Remediation Planner is where someone says what will happen to a **particular** broken resource, and by when.

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
- TOC
{:toc}
</details>

---

## What the Page Is For

Every violation is one asset failing one policy. The page lists them, explains each one, and asks you to commit to a course of action with a date attached.

It is written for the **Risk Owner** - the person who owns the application, service or subscription the asset belongs to - rather than for the compliance team. Compliance sets the policy; the owner decides how their own resource gets fixed.

As everywhere in Cloud Compliance, **setting an action changes nothing in your cloud**. It records a commitment: a note for your teams on Pulse Premium, or a task for Devoteam Operations where Managed Cloud Compliance is enabled. See [Policy Manager](policy-manager.md#nothing-here-changes-your-cloud).

---

## Choosing a Framework

Violations are always shown for one security framework at a time, chosen from the selector beside the page title. Switching framework changes which violations are listed, because a given asset may breach a policy in one framework and not appear in another.

![The framework selector open, listing the assigned security frameworks with the active one ticked](../../assets/images/cloud-compliance/framework-selector.png)

Only assigned frameworks appear here. If the one you expect is missing, it has not been assigned in [Policy Manager](policy-manager.md).

---

## The Violations List

![The Remediation Planner violations table, with violation ID, asset name, policy name, severity, detection date and remediation status](../../assets/images/cloud-compliance/remediation-planner.png)

Each row is one violation, identified by a **Violation ID** that stays stable, so it can be quoted in a ticket or an email and still mean the same thing later.

The columns answer the questions an owner asks first: which asset, which policy, how severe, when it was detected, and what has been decided so far - **Remediation Status**, which reads *Pending to Assess* until someone sets an action.

<details markdown="block" class="reference-box">
  <summary>Filtering the list</summary>

Filters are available for Asset Name, Policy Action, Policy Name, Prevention Possibility, Remediation Status, Severity and Subscription, alongside free-text search.

Subscription and Severity are the two that matter most in practice: they narrow a shared list down to the assets one team owns, and then to the ones worth doing first. The list exports to CSV in full, not only the page on screen.

</details>

---

## Understanding a Violation

Click the asset name to open the violation. This panel is where the page earns its place - it is the difference between being told a rule failed and being able to do something about it.

![The violation analysis panel, with violation information, policy review, change impact and remediation guides including manual steps, complexity, roll back steps and verification](../../assets/images/cloud-compliance/remediation-planner-violation-analysis.png)

The **Violation Analysis** tab is organised as sections you open as you need them:

| Section | What it gives you |
| --- | --- |
| **Violation Information** | The violation's own ID and identifying details |
| **Policy Review** | What the policy checks and why it exists |
| **Change Impact** | What changes if you remediate - the question owners ask before agreeing to anything |
| **Remediation Guides** | How to actually fix it, covered below |
| **More Info** | Supporting references |

**Remediation Guides** is the substantive part. It contains the manual steps to remediate written out in order, the **Remediation Complexity** rating, the **roll back steps** should the change need reversing, and a **verification** expression describing what a compliant resource looks like once the work is done.

Read the roll back steps before starting, not after. They are there so a change can be proposed to a change board with an exit route already written down.

The **History** tab records the actions previously set on this violation.

---

## Setting an Action

Tick one or more violations and choose **Set Action**. The button shows how many are selected, and the action applies to all of them - which is how a single decision covers thirty instances of the same finding.

![The Set Action panel with the action list open, showing the five available actions](../../assets/images/cloud-compliance/remediation-planner-set-action.png)

The panel explains its own purpose:

> Assign an action pathway to transition this violation out of 'Pending' and establish your operational commitment for this cloud asset.

| Action | When to choose it | What you must provide |
| --- | --- | --- |
| **Schedule Remediation** | You have an exact maintenance window and will deploy the fix in it | Term for Remediation Implementation, plus a comment - use it for the downtime window |
| **Plan to Remediate** | You commit to fixing it within a period, without a window fixed yet | Period for Remediation, optional comment |
| **Internal Investigation** | The right fix is not yet known and you need time to find it | Period for Investigation, optional comment |
| **Plan to Decommission** | The resource is going away rather than being fixed | Period to Decommission, optional comment |
| **Exempt Request** | The risk should be accepted rather than fixed - this asks a Compliance Manager to approve that | Justification, an expiry date, and optionally a risk number |

Every date must be today or later. Pulse confirms with *Action performed successfully!*

Setting an action on a violation that already has one replaces it, and Pulse warns you first: *Existing status will be overridden by new status.*

---

## Requesting an Exemption

**Exempt Request** is the one action that does not end with you. The other four are commitments you are making; this one is a request someone else decides on.

What you write in the justification is what the Compliance Manager reads when deciding. Business and technical constraints - why the fix is not feasible, or costs more than the risk - are what make a request approvable. "Not applicable" gives them nothing to approve.

Once submitted, the request appears on the [Exemptions](exemptions.md) page for review, and the violation's exemption status reads **Requested** until it is approved or rejected.

**An approved exemption is still not an implemented one.** Approval records a decision in Pulse; making the cloud stop reporting the violation is separate work - carried out by your own team on Pulse Premium, or by Devoteam Operations where Managed Cloud Compliance is enabled. [Exemptions](exemptions.md) explains how to tell the two apart.

---

## Q&A

### Nothing is listed, or far less than I expected
{: .no_toc }

Check the framework selector first - you are looking at one framework at a time. After that, check the filters: Subscription and Severity persist as you move around the page.

### What does Pending to Assess mean?
{: .no_toc }

Nobody has decided anything about this violation yet. It is the starting state for every violation, and setting any action moves it out.

### Can I set an action on many violations at once?
{: .no_toc }

Yes - that is what the checkboxes are for. Select as many as you like and set one action across all of them. The same dates and comment apply to every violation in the selection, so group them by what you actually intend to do.

### Can I change an action after setting it?
{: .no_toc }

Yes. Set a new one and it replaces the old, with a warning first. The History tab keeps the earlier decisions.

### Does Schedule Remediation mean Pulse will fix it?
{: .no_toc }

No. It records that you intend to fix it in that window. The change itself is made in your cloud - by your team, or by Devoteam Operations under Managed Cloud Compliance.

### Where did my violation go after I fixed it?
{: .no_toc }

Once your cloud re-evaluates the resource and finds it compliant, the violation stops being reported and leaves the list. That happens on your cloud provider's evaluation schedule, not immediately after the change.
