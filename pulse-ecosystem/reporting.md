---
title: Reporting
layout: default
parent: Pulse Ecosystem
nav_order: 7
permalink: /pulse-ecosystem/reporting/
---

# Reporting
{: .no_toc }

Configure a report about your cloud estate in Pulse and download it as a PDF - a summary of costs, savings, security and reliability to share with people who do not use Pulse themselves, or to bring to a review.
{: .fs-6 .fw-300 }

{: .important }
Reporting is part of **Pulse Premium**. See [Pulse Ecosystem](README.md#pulse-premium) for what each tier includes.

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
- TOC
{:toc}
</details>

---

## What a Report Covers

A report draws on the same data as the rest of Pulse - costs, assets, recommendations and security findings across your connected clouds - and puts it into one document:

| Part | What it shows |
| --- | --- |
| **Headline figures** | Monthly cloud spend, the number of cloud assets, the number of optimisation findings and the estimated monthly savings |
| **Cloud estate overview** | A short summary of the estate and its main themes, each with a few suggested actions |
| **Cost and savings** | Spend and assets split by cloud provider, assets by infrastructure type (IaaS, PaaS, SaaS), the top services per provider, and savings from rightsizing and from commitments such as reservations and savings plans |
| **Security and compliance** | The main risk areas, with the number of resources at risk for each recommendation |
| **Reliability** | Improvements that remove single points of failure, protect data and modernise ageing infrastructure |

The cover and footer state the organisation, when the report was generated and until when it is valid; the figures name the usage month they come from.

---

## How a Report Is Made

**The figures come from your data; the summaries are written by AI.** A report is generated from live cloud data at the moment you create it. Spend, asset counts, savings and resources at risk are taken from Pulse as they are; the estate overview and the grouping of findings into themes are written by AI analysis of those figures.

**Savings are estimates.** As on the [Cost Savings](cloud-economics/cost-savings.md) and [Rate Optimisation](cloud-economics/rate-optimisation.md) pages, the savings in a report are indicative and should be validated before you act on them.

**A report is a snapshot.** Pulse keeps updating after you download it, so the report and the live pages drift apart. The **Valid until** date on the cover and in the footer says when to generate a fresh one rather than reuse it.

**Reports are confidential.** A report is marked confidential and is meant for use inside your organisation.

Generating a report reads your data only; it changes nothing in your cloud.

---

## Q&A

### Are the figures in a report the same as in Pulse?
{: .no_toc }

Yes, as of the moment the report was generated. They come from the same data as Cloud Inventory, Cloud Economics and the other pages. Later differences come from Pulse having moved on, not from a different calculation.

### Where do I act on what the report finds?
{: .no_toc }

In Pulse. The report summarises; the detail behind each finding, and the place to work through it, is on the matching page - [Cost Savings](cloud-economics/cost-savings.md) for resources to resize, stop or remove, and [Rate Optimisation](cloud-economics/rate-optimisation.md) for reservations and savings plans.
