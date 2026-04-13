# CHAPTER TWO: LITERATURE AND REVIEW OF RELATED SYSTEMS

## 2.1 Introduction

This chapter provides support for the study by reviewing relevant literature and similar systems. It covers theoretical and technological foundations, compares at least two related systems, and summarises the state of the art and its linkage to this project.

## 2.2 Theoretical Framework

University administrative systems are often studied from the perspectives of information systems success, usability, and adoption. Key considerations include: alignment of the system with institutional processes; ease of use for staff and students; security and privacy; and the ability to integrate with existing infrastructure (e.g. student records, finance). Role-based access control (RBAC) is widely used to restrict access to sensitive functions and data. Digital permit or credential systems draw on concepts of identity verification, auditability, and non-repudiation. The adoption of web-based dashboards in higher education is supported by literature on digital transformation and centralised service delivery.

## 2.3 Technological Base

Modern web applications for institutional management typically use:

- **Full-stack JavaScript/TypeScript**: React-based frameworks (e.g. Next.js) for server-side rendering, API routes, and single-page application behaviour, improving performance and developer experience.
- **Relational databases**: MySQL or PostgreSQL for structured data (users, permits, students, payments, content), with an ORM (e.g. Prisma) for type-safe access and migrations.
- **Authentication and authorisation**: Standards such as OAuth 2.0, JWT, and session-based auth; role-based permissions for different user types.
- **Payment gateways**: Third-party APIs (e.g. Paystack, Stripe) for collecting fees with compliance and reconciliation support.
- **Cloud storage and CDN**: Services such as Cloudinary for images and documents, improving availability and performance.

These technologies form the basis for the SRC Dashboard’s architecture and implementation.

## 2.4 Review of Similar Systems

### 2.4.1 System One: University of Ghana Student Portal and Online Registration (MIS Web)

The University of Ghana provides an example of a large-scale student and administrative portal used in the Ghanaian higher education context. The institution operates a Management Information System (MIS) accessible through its student portal, where continuing students complete academic and residential registration online after paying required fees (University of Ghana, n.d.). The system supports registration workflows that tie fee payment to eligibility for registration, and international students use related procedures for residence permits through the International Programmes Office (IPO, n.d.). The portal centralises student-facing services (registration, permits, fees) and reduces reliance on purely manual, in-person processes.

**Purpose and main features**: The system supports academic and residential registration, fee payment, and (for international students) residence permit procedures. Students access a single web interface to complete steps that were historically paper-based or office-bound.

**Technology**: The implementation is a web-based MIS; specific stack details are not fully documented in public sources. The design follows a centralised portal pattern common in university administration.

**Strengths**: Aligns registration with fee payment; provides a single point of access for students; scales to a large student body; supports compliance with immigration and institutional requirements.

**Weaknesses**: Public documentation does not emphasise real-time permit or credential verification (e.g. at gates or checkpoints); integration with third-party payment gateways and modern front-end frameworks is not detailed. The focus is on registration and permit procedures rather than a unified SRC or campus-life dashboard.

*Add an APA reference for University of Ghana / IPO in the References section.*

### 2.4.2 System Two: UCSB ePermits (Digital Parking Permit Verification)

The University of California, Santa Barbara (UCSB) operates an electronic permit system (ePermits) for parking and transportation (Transportation & Parking Services, n.d.). The system is an example of digital permit management and verification in a university setting. Students and staff register vehicle and permit information through an online portal; the permit is virtual and linked to the vehicle (e.g. license plate) rather than a physical hangtag or decal. Enforcement and verification can be done by checking the license plate against the permit database, and in some implementations license plate recognition (LPR) is used for automated checks.

**Purpose and main features**: ePermits allow users to purchase and manage parking permits online, register vehicles, receive renewal reminders, and in some cases cancel or request refunds. Verification is digital and can be real-time via plate lookup or LPR.

**Technology**: Typical ePermit systems use web portals for purchase and management, and backend databases linked to enforcement tools. UCSB’s system is part of a broader trend toward virtual permits in North American universities (e.g. Cornell, UCLA), reducing physical distribution and enabling instant verification.

**Strengths**: Eliminates physical permit distribution; supports instant verification; reduces paper and plastic; streamlines operations and improves convenience for users.

**Weaknesses**: The domain is parking/transport rather than general student-life or SRC permits; the credential is vehicle-based (license plate) rather than person-based (e.g. QR code on a student permit). Nevertheless, the pattern—digital permit, online purchase, and real-time verification—is directly relevant to student permit systems.

*Add an APA reference for UCSB Transportation & Parking Services (or equivalent source) in the References section.*

## 2.5 Summary of Major Findings and Linkage to This Study

The literature and review of related systems indicate that:

- Centralised, web-based dashboards can significantly improve efficiency in permit processing and student services when designed with clear roles and workflows.
- Use of established technologies (React/Next.js, relational databases, payment gateways, cloud storage) supports maintainability and integration.
- Role-based access control and audit trails are expected in administrative systems for security and accountability.
- Real-time verification (e.g. via QR codes, unique codes, or license-plate lookup) is a common requirement for digital permits and credentials.
- Existing systems in Ghana (e.g. University of Ghana’s portal) show demand for online registration and permit-related workflows; systems such as UCSB ePermits demonstrate the benefits of digital permit verification in a university context.

The Knutsford University SRC Dashboard aligns with these findings: it provides a single dashboard for permit management, student life, and engagement; uses Next.js, Prisma, MySQL, Paystack, and Cloudinary; implements RBAC and audit logging; and supports permit verification through unique codes (and QR codes). The design and implementation choices are consistent with the state of the art identified in this chapter.
