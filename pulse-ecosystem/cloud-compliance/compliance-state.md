---
title: Compliance State
layout: default
parent: Cloud Compliance
grand_parent: Pulse Ecosystem
nav_order: 1
permalink: /pulse-ecosystem/cloud-compliance/compliance-state/
---

# Compliance State
{: .no_toc }

Compliance State answers the question everyone else asks you: *how compliant are we, and is it getting better?* It scores every subscription against a framework, and plots the same figures day by day so the answer is a trend rather than a snapshot.

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
- TOC
{:toc}
</details>

---

## The Page at a Glance

![Compliance State with the metrics table per subscription, the scorecards alongside it and the trend chart below](../../assets/images/cloud-compliance/compliance-state.png)

Three things work together:

- **Compliance Metrics per Subscription** scores each subscription and counts what is behind the score.
- **The cards alongside** give the same figures for whatever you have selected, and link onward to the detail.
- **Compliance Metrics Over Time** plots all four figures across a period you choose.

Everything is scoped to one framework, chosen from the selector beside the page title. Switching framework rescores the whole page - a subscription can be strong against one standard and weak against another, which is exactly what this page is for.

---

## The Compliance Score

The score is not a judgement. It is arithmetic on three counts:

```
(Compliances + Exemptions) / (Violations + Compliances + Exemptions) x 100%
```

| Count | What it is |
| --- | --- |
| **Violations** | A count of specific checks that failed |
| **Exemptions** | A count of failed checks with accepted risk |
| **Compliances** | A count of specific checks that passed |

**An exemption counts towards your score exactly as a pass does.** That is deliberate - an accepted risk is a decision your organisation made knowingly, not an outstanding failure. But it means the score alone cannot distinguish an estate that was fixed from one that was exempted, which is why the three counts are shown next to it and never on their own.

When you report this figure, report the exemption count with it.

---

## Reading a Subscription

Each row is one subscription, with its score, its three counts, its **State**, and **Last Discovery** - the date Pulse last collected compliance data for it, or *Never* if it has not yet been scanned.

Last Discovery is the first thing to check when a figure looks wrong. A score that has not moved may be a score that has not been recollected.

![One subscription selected, with the cards and the trend chart both narrowed to it](../../assets/images/cloud-compliance/compliance-state-subscription.png)

Selecting a row narrows both the cards and the chart to that subscription, and the badge on the chart changes from **Full Scope** to the subscription's name so you can always see which you are looking at. Select it again to return to Full Scope.

Work the table by score ascending: the weakest subscription is where remediation effort buys the most.

<details markdown="block" class="reference-box">
  <summary>Columns and export</summary>

Subscription, Provider, Compliance Score, Violations, Exemptions, Compliances, State and Last Discovery.

The table can be filtered by State and Subscription, searched, and exported to CSV in full - which is the usual way to get these figures into an audit pack or a board report.

</details>

---

## From a Number to the Detail

The **Violations** and **Exemptions** cards each carry a **View Details** link, and they are the fastest route out of this page:

| Card | Takes you to |
| --- | --- |
| **Violations** | **Compliance Analysis**, to see which policies are failing and on which assets |
| **Exemptions** | [Exemptions](exemptions.md), to see what has been accepted and when it expires |

That is the intended path through Cloud Compliance: notice a number here, follow it to the detail, act on it in [Remediation Planner](remediation-planner.md).

---

## The Trend

![The date range control open, with preset periods, a custom range and the option to add the current month](../../assets/images/cloud-compliance/compliance-state-date-range.png)

**Compliance Metrics Over Time** plots compliance score, violations, exemptions and compliances together, day by day. Plotting them together is the point - a score moving on its own tells you nothing about why.

Choose the period from the **Date** control: **Last 30 days**, **Last 3 months**, **Last 6 months** or **Last 12 months**, or set a start and end date yourself. The presets end with the last complete month, and **Add Current Month** extends the range to include the month in progress.

Three shapes are worth recognising:

- **Score rises, violations flat, exemptions rise** - risk is being accepted rather than removed. Legitimate, but it should be a decision someone made, not a surprise.
- **Score flat, violations flat, compliances rise** - the estate is growing and new resources are passing. Holding a score while growing is real progress.
- **Score drops sharply on one day** - usually a newly assigned framework or a newly onboarded subscription bringing its findings with it, rather than a sudden regression.

---

## Q&A

### Which framework am I looking at?
{: .no_toc }

The one named in the selector beside the page title. Only assigned frameworks appear there - assigning them is done in [Policy Manager](policy-manager.md).

### A subscription shows Never under Last Discovery
{: .no_toc }

Pulse has not yet collected compliance data for it. Newly onboarded subscriptions show this until the first collection completes.

### Our score went up but we have not fixed anything
{: .no_toc }

Check the exemptions count over the same period. Exemptions count towards the score as passes do, so approving them raises it without changing the estate.

### Why does the chart show a different figure from the table?
{: .no_toc }

The table shows the latest collection; the chart shows a series over the period you selected. They agree at the right-hand end of the chart, not across it.

### Can I get these figures out of Pulse?
{: .no_toc }

Yes - the metrics table exports to CSV in full, not only the page on screen.
