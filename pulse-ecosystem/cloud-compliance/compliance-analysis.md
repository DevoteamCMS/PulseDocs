---
title: Compliance Analysis
layout: default
parent: Cloud Compliance
grand_parent: Pulse Ecosystem
nav_order: 5
permalink: /pulse-ecosystem/cloud-compliance/compliance-analysis/
---

# Compliance Analysis
{: .no_toc }

[Compliance State](compliance-state.md) tells you the estate is 74% compliant. Compliance Analysis tells you which policies are failing, on which assets, and what is already being done about them.

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

It is the investigative view: violations grouped by the policy that raised them, and each policy opened up to the individual resources breaching it.

That grouping is the difference from [Remediation Planner](remediation-planner.md), which lists violations as a flat worklist for the person who owns the assets. Here the question is not *what must I fix* but *what is wrong with us* - which controls we are failing, how badly, and how widely. It is the view to bring to a review meeting or an auditor.

![Compliance Analysis with the policy list above and the assets breaching the selected policy below](../../assets/images/cloud-compliance/compliance-analysis.png)

---

## Choosing a Framework

Everything on the page is scoped to one security framework, chosen from the selector beside the page title.

![The framework selector open, listing the assigned security frameworks with the active one ticked](../../assets/images/cloud-compliance/framework-selector.png)

Only assigned frameworks appear - assigning them is done in [Policy Manager](policy-manager.md). Changing the selection resets the filters on both tables, because a filter that made sense for one framework rarely means anything in another.

---

## Step 1 - Select Policy

The upper table lists every evaluated policy in the framework, with its status and how many violations it has raised.

| Column | What it tells you |
| --- | --- |
| **Policy Name** | The policy - click it to open the full analysis |
| **Compliance Status** | **Compliant** or **Non-Compliant** |
| **Violations** | How many assets are currently breaching it |
| **Severity** | The assessed risk of the policy |
| **Policy Category** | The control area it belongs to |
| **Policy Release Date** | When your cloud provider published the policy |
| **Policy Action** | What your organisation decided should happen - and a link through to it |

<details markdown="block" class="reference-box">
  <summary>Filtering, and columns not shown by default</summary>

Filters are available for Compliance Status, Policy Action, Policy Category, Policy Name and Severity, alongside free-text search. **Show Only Selected** collapses the list to the policy you have picked, which is useful once you have found it and want the screen for the assets below.

Remediation Complexity and Prevention Preference are available as columns but are not displayed by default - use the column control in the table toolbar to add them.

The table exports to CSV in full, not only the page on screen.

</details>

Filter by **Compliance Status** to see only what is failing, and by **Policy Category** to review one control area at a time. Sorting by Violations descending puts the widest failures first, which is usually not the same order as severity: a Low severity policy breached on two hundred assets may matter more than a High one breached on one.

### Opening a policy
{: .no_toc }

Click the policy name for the full analysis.

![The policy analysis panel with Policy Review expanded, showing description, purpose, benefits of remediation, affected resource types and possible risk](../../assets/images/cloud-compliance/compliance-analysis-policy.png)

| Section | What it holds |
| --- | --- |
| **General Information** | The policy's identifying detail - name, compliance status, severity, security standard and prevent status |
| **Policy Review** | What the policy requires and why: its description, its purpose, the benefits of remediating, the resource types and related services affected, and the risk of leaving it unaddressed |
| **Change Impact** | What changes if you remediate |
| **Remediation Guides** | How the fix is typically carried out |

**Policy Review** is the section to read before a review meeting. *Possible Risk* and *Benefits of Remediation* are written to be quoted directly to someone who has to approve the work, which saves translating a control description into an argument.

---

## Step 2 - Review Non-Compliant Assets

Selecting a policy fills the lower table with the individual resources breaching it.

![The Review Non-Compliant Assets table, listing each breaching resource with its category, subscription, detection date and remediation status](../../assets/images/cloud-compliance/compliance-analysis-assets.png)

| Column | What it tells you |
| --- | --- |
| **Asset Name** | The resource in breach |
| **Asset Category** | What kind of resource it is |
| **Subscription** | Where it lives |
| **Detection Date** | When the violation was first found |
| **Remediation Status** | What has been decided about it - and a link through to it |

Filters cover Asset Name, Asset Category, Detection Date, Remediation Status and Subscription. Subscription is the one that matters most in practice: it narrows a policy's breaches down to the assets one team owns, which is what turns a finding into an assignment.

When the selected policy has no violations the table says **No violations detected** - the answer you want, rather than an error.

---

## Where the Page Leads

Two columns are links rather than labels, and they are what make this page a starting point rather than a dead end.

| Link | Takes you to |
| --- | --- |
| **Policy Action**, in the policy table | [Policy Manager](policy-manager.md), opened in a new tab on that exact framework and policy, ready to change what should happen when it is broken |
| **Remediation Status**, in the assets table | [Remediation Planner](remediation-planner.md), to plan or review the work on that violation |

So the traversal through Cloud Compliance runs: a number on [Compliance State](compliance-state.md), the policies behind it here, and then either the decision in Policy Manager or the work in Remediation Planner.

The **Policy Action** column is not shown to the **User** role.

---

## Q&A

### Nothing is listed in the lower table
{: .no_toc }

Select a policy in the upper table first - the assets table shows the resources breaching whichever policy is selected. If one is selected and the table still says **No violations detected**, that policy is currently being met.

### How is this different from Remediation Planner?
{: .no_toc }

The grouping. Compliance Analysis organises violations by policy, to answer which controls are failing and how widely. [Remediation Planner](remediation-planner.md) lists them as individual pieces of work with an owner and a date. Analysis is for understanding; the Planner is for committing.

### The violation count here does not match Compliance State
{: .no_toc }

Check the framework selector on both pages. Each scores against one framework at a time, and an asset can breach a policy in one framework while passing in another.

### Can I change a policy's action from here?
{: .no_toc }

Not directly, but the **Policy Action** link opens [Policy Manager](policy-manager.md) in a new tab already filtered to that framework and policy. Changing it there requires the Manager role.
