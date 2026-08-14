---
title: Security & Data Protection Q&A
layout: default
parent: Legal
nav_order: 5
---

# Security & Data Protection Q&A
{: .no_toc }

Frequently asked questions from customer security and due-diligence reviews of the Pulse Cloud Management Platform.

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
- TOC
{:toc}
</details>

---

## Access & Permissions

### What access does Pulse need to my cloud environment?

A customer-controlled, read-only identity that you create and can revoke at any time — an Azure Service Principal (SPN), an AWS IAM role, or a Google Cloud service account. Granting it is the only part of onboarding that needs privileged access in your own environment; Pulse never receives that privileged access itself.

The exact roles per cloud, and the permissions you need in order to grant them, are answered per cloud in the Onboarding Q&A: [AWS](../pulse-ecosystem/onboarding/faq.md#what-access-does-pulse-need-in-my-aws-accounts), [Azure](../pulse-ecosystem/onboarding/faq.md#what-access-does-pulse-need-in-my-azure-tenant), [Google Cloud](../pulse-ecosystem/onboarding/faq.md#what-access-does-pulse-need-in-my-google-cloud-organisation).

### Can Pulse read the contents of my disks, databases, or applications?

No. Pulse operates exclusively against the cloud **control plane** and **billing plane**. It has no **data plane** access — it cannot read the contents of disks, databases, storage accounts, virtual-machine files, or applications, other than the cost export bucket you designate.

### Is access subscription-level or tenant-wide?

That is your choice: roles can be assigned per subscription or at Management Group level. Only subscriptions within the scope you grant are visible to Pulse — everything outside that hierarchy is not included.

### How does Pulse authenticate, and how is the credential rotated?

That depends on the path you choose at onboarding.

On the recommended **automated** path, Azure and AWS are **federated**: no client secret or access key is created, and none is uploaded to Pulse, so there is nothing to rotate and nothing that expires. Google Cloud is the exception — a service account key is created and uploaded for you.

On the **manual** path, you create the credential yourself and register it in Pulse: an Azure client secret plus its expiration date (recommended validity up to 2 years — the date is registered at onboarding and you are notified well before expiry), an AWS access key you rotate under your own policy, or a Google Cloud service account key.

On either path you can revoke the credential, or remove the role assignment, at any time to terminate access immediately.

## Data Collection

### What data does Pulse collect?

Cloud infrastructure **metadata** only:

- Asset inventory (list of cloud resources)
- Asset metadata (tags, labels, names, relations with other resources)
- Billing data (cloud spend, usage costs, and budgets)
- Security information (e.g. Microsoft Defender for Cloud alerts)
- Recommendations (e.g. Azure Advisor)
- Compliance states
- Usage and metric data

Pulse does not collect, store, or process your application content, business records, or end-customer data. See [Cloud Inventory](https://docs.pulse.devoteam.com/pulse-ecosystem/cloud-inventory).

### Which Azure APIs does Pulse call?

All calls are read-only and fully covered by the Reader and Billing Reader roles:

- Azure Resource Manager / Azure Resource Graph API (asset inventory and metadata)
- Cost Management REST API
- Azure Billing REST API
- Azure Advisor REST API (recommendations)
- Microsoft Defender for Cloud REST API (security alerts)

### Does Pulse collect Log Analytics data?

No. Pulse is not a SIEM or operational monitoring tool. Security findings shown in Pulse are consumed from Microsoft Defender for Cloud via its API, not from log data.

### Does Pulse use Artificial Intelligence?

Yes, in two ways. Internally, AI supports data assessment, documentation, and categorization of specific cloud resource types — this processing uses generalized data without customer markers. In the product, AI-assisted insights are visible in the dashboard, helping you assess general information about your cloud infrastructure metadata and cloud spend overview. Customer data is never used to train AI models.

## Network Security

### Do I need to allow-list Pulse IP addresses?

No. Pulse only calls public cloud management APIs and makes no inbound or peer-to-peer connection to your network. If your organization requires source-IP filtering, Pulse platform IP details are classified as confidential and can be shared once a contract is in place.

### Does Pulse support Private Link, VPN, or ExpressRoute?

These are not applicable to the data-collection path: Pulse never connects into your network — collection is API-only, outbound from the Pulse platform to cloud provider public endpoints over TLS. User access to the Pulse portal is via HTTPS/TLS. Private Link, VPN, and ExpressRoute are not currently supported.

## Data Protection

### Where is my data stored?

All Pulse infrastructure and collected data reside in Microsoft Azure data-centre locations within the European Union (North Europe / West Europe).

Google Cloud billing data is the one thing Pulse does not copy in order to read. Rather than exporting your billing table, a Pulse scanner runs a BigQuery job that reads the export where it already lives, in your own Google Cloud project, and returns only the result. Nothing is stored in BigQuery — which is why the access Pulse asks for on that table is read-only and nothing more.

The job runs in the **same region as your own dataset**, so your billing data is not moved between regions to be read. Only the result of the query is returned to Pulse, into the EU regions above.

### How long is data retained?

Raw collected data is retained for 3 months and aggregated data for 1 year, in accordance with our documented retention policy. You can also request deletion at any time — see [What happens to my data when I stop using Pulse?](#what-happens-to-my-data-when-i-stop-using-pulse).

### Is data encrypted in transit?

Yes. All communication is encrypted with TLS: data collection calls from the Pulse platform to cloud provider APIs, and user access to the Pulse portal (HTTPS). Combined with AES-256 encryption at rest, data is encrypted end-to-end.

### How is my data separated from other customers' data?

Each customer has a dedicated Pulse space, and collected data is logically segregated per customer. Access is scoped so that users of one organization can never see another organization's data.

### How is data encrypted at rest?

All data at rest is encrypted with AES-256 using Azure platform-managed encryption, applied transparently at the storage layer with keys managed and rotated by Microsoft. This covers Azure Database for PostgreSQL Flexible Server (including backups) and all Storage Accounts. Encryption cannot be disabled.

### Are customer-managed keys (CMK/BYOK) supported?

No. Data at rest is encrypted with platform-managed keys. As Pulse stores only cloud infrastructure metadata — no application content or business data — platform-managed encryption is proportionate to the data classification.

### What is the backup policy?

All databases are backed up via Azure Backup Vaults under a single uniform policy: daily backups retained 7 days, weekly retained 1 month, monthly retained 12 months. Backups are geo-redundant across two Azure regions (North Europe and West Europe), so a regional outage does not result in backup loss. The database service additionally performs its own automated daily backups (7-day retention).

### What happens to my data when I stop using Pulse?

You can continue on **Cloud Essentials** at no cost, or ask us to delete your Pulse space. Requesting deletion expedites offboarding — the cloud connection is removed and your space is deleted, rather than leaving it to the standard cleanup process. See [Offboarding](https://docs.pulse.devoteam.com/pulse-ecosystem/offboarding).

## Third Parties, Subcontractors & Subprocessors

### What is Devoteam's relationship with my cloud providers?

None on your behalf. Amazon Web Services, Microsoft Azure and Google Cloud are **third-party providers you contract with directly**. Devoteam has no contract with them covering your accounts, and no control over their services, their pricing or their availability.

Pulse only reads from those accounts, using the read-only credential you grant and can revoke. What Pulse shows therefore depends on the data your providers return — as the [Terms of Use](terms-of-use.md) puts it, the results shown rely on receiving accurate, up-to-date data from your third-party cloud service provider accounts.

### Does Devoteam use subcontractors to deliver Pulse?

No. The Pulse platform and associated services are delivered by authorised personnel within the Devoteam group (UAB Devoteam Lithuania, an affiliate of Devoteam SAS). No third party is granted access to customer data or customer systems, other than the hosting provider below.

### Who hosts Pulse, and which subprocessors are involved?

The Pulse platform runs in Microsoft Azure data centres in the European Union, under Devoteam's own agreement with Microsoft. In that hosting role Microsoft **is** a subprocessor of the cloud metadata Pulse stores. Microsoft personnel are not provided access to that data in normal operation, and any exceptional access is subject to Microsoft's contractual, technical, and organisational controls. Microsoft maintains its own extensive compliance portfolio (including ISO 27001 and SOC 2 Type II), available via the Microsoft Trust Center.

Google Cloud is used as a **processing service**, not a storage one, and only for customers with a Google Cloud billing export: Pulse initiates a BigQuery job that reads the export in your own Google Cloud project and returns the result. No customer data is stored there.

Both are separate from Microsoft Azure or Google Cloud as *your* cloud providers, where Devoteam is not a party to your agreement.

## Compliance & Certifications

### What certifications does Devoteam hold?

Pulse is operated by Devoteam Cloud Managed Services within a certified management system covering **ISO/IEC 27001** (information security), **ISO 9001** (quality), **ISO 14001** (environmental), and **ISO 22301** (business continuity). Certificates are available upon request. See the [Information Security Policy](information-security-policy.md).

### Do you hold a SOC 2 Type II attestation?

Not applicable — we do not undergo SOC 2 audits. Our security posture is independently certified under ISO/IEC 27001, which covers equivalent controls.

### Do you perform penetration testing and security audits?

Yes. Penetration testing is performed periodically by an independent third party; an executive summary of the most recent report can be shared with customers upon request. In addition, annual internal compliance audits verify adherence to ISO/IEC 27001, and identified non-compliance is addressed within 90 days.

### Does Pulse have business continuity and disaster recovery arrangements?

Yes. Devoteam Cloud Managed Services is certified under ISO 22301 (business continuity). Platform backups are geo-redundant across two Azure regions (North Europe and West Europe), and disaster recovery procedures are tested annually.

### How is user access to customer data governed internally?

Access is restricted to authorised personnel with a legitimate business need, controlled through role-based access control, least-privilege principles, and multi-factor authentication. User access rights are reviewed at least quarterly as part of the ISO/IEC 27001-certified Information Security Management System.

## Contact

For security or privacy questions not covered here: **devoteam.cms.privacy@devoteam.com**
