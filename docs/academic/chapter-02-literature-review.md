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

### 2.4.1 System One: [Name a similar system]

*(Describe at least one similar system—e.g. another university permit/student portal or a commercial campus management product. Include: purpose, main features, technology if known, and strengths/weaknesses. This section should be filled with your own research and citations.)*

### 2.4.2 System Two: [Name a second similar system]

*(Describe a second similar system. Again, cover purpose, features, technology, and strengths/weaknesses, with appropriate references.)*

## 2.5 Summary of Major Findings and Linkage to This Study

The literature and review of related systems indicate that:

- Centralised, web-based dashboards can significantly improve efficiency in permit processing and student services when designed with clear roles and workflows.
- Use of established technologies (React/Next.js, relational databases, payment gateways, cloud storage) supports maintainability and integration.
- Role-based access control and audit trails are expected in administrative systems for security and accountability.
- Real-time verification (e.g. via QR codes or unique identifiers) is a common requirement for digital permits and credentials.

The Knutsford University SRC Dashboard aligns with these findings: it provides a single dashboard for permit management, student life, and engagement; uses Next.js, Prisma, MySQL, Paystack, and Cloudinary; implements RBAC and audit logging; and supports permit verification through unique codes. The design and implementation choices are consistent with the state of the art identified in this chapter.

---

*You should replace the placeholders in Section 2.4 with actual reviews of two or more similar systems and add proper in-text citations and references in APA style.*
