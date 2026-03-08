# CHAPTER FIVE: SUMMARY, CONCLUSION AND RECOMMENDATION

## 5.1 Summary

This study set out to design and implement a web-based SRC Dashboard for Knutsford University to address manual permit processing, scattered student services, and the lack of real-time permit verification. The project followed a structured approach: problem analysis, literature and review of related systems, system analysis and design, and implementation using modern web technologies.

**Overview of the research and methodology**: The existing system was characterised by manual permit handling, disconnected student data and communications, and limited auditability. Requirements were gathered for an integrated dashboard with role-based access, permit management with payment integration, and modules for events, news, documents, newsletters, and engagement (polls, student ideas). The system was designed with a relational database (MySQL), a clear entity-relationship structure, and a web front-end and API built with Next.js, TypeScript, Prisma, and supporting libraries. Implementation included authentication (NextAuth.js), Paystack integration for permit fees, Cloudinary for media, and responsive UI components. Testing was carried out through manual and user acceptance testing of main flows; deployment and documentation were prepared to support production use.

**Summary of key findings**: The implemented system meets the stated objectives: it provides automated permit creation with unique codes and real-time verification, centralised student management, integrated payment processing, and modules for events, news, documents, newsletters, and polls. Role-based access control and audit logging are in place. The technology choices (Next.js, Prisma, MySQL, Paystack, Cloudinary) proved suitable for the scope and can support future extensions.

## 5.2 Conclusions

The conclusions are based on the results and findings of the project and their alignment with the project objectives:

- **Permit management**: The system allows authorised users to create permits linked to students and payments, with unique codes (e.g. QR) and status/expiry tracking. Verification can be performed in real time. This confirms the objective of reducing manual processing and enabling instant verification.
- **Student and payment integration**: Student profiles are maintained in one place and linked to permits and payments. Paystack integration allows collection of permit fees and recording of transaction status, meeting the objectives for centralised student data and secure payments.
- **Content and engagement**: Events, news, documents, and newsletters are manageable through the dashboard; polls and student idea submission support engagement. These outcomes align with the objectives for supporting SRC and administrative communication and decision-making.
- **Security and accountability**: Role-based access and audit logs are implemented, supporting the objective of secure, accountable use.
- **Usability and deployment**: The dashboard is responsive and documented; deployment and configuration are described in project documentation, supporting the objective of delivering a usable, deployable system.

Overall, the findings confirm that the project objectives have been met within the defined scope. The system provides a practical solution for permit and student-life management at Knutsford University and a base for future enhancements.

## 5.3 Recommendations

**What is new**: The project delivers a single, integrated SRC Dashboard for Knutsford University that did not previously exist in this form, combining permit management, payments, student data, and content/engagement in one application with real-time verification and role-based access.

**What the study has brought to the fore**: It has demonstrated that a university can adopt a modern, web-based dashboard to streamline permit issuance and verification, centralise student-related services, and improve transparency and reporting. The use of TypeScript, Next.js, Prisma, and third-party services (Paystack, Cloudinary) offers a maintainable and extensible foundation.

**General feeling concerning the results and findings**: The system is fit for its intended purpose and has been implemented and tested for the main workflows. The following recommendations are made for the university and future work:

1. **Roll-out and training**: Plan a phased roll-out to SRC and administrative users, with training and user documentation (building on existing docs) to ensure adoption and correct use.
2. **Monitoring and support**: Monitor usage, performance, and errors in production; establish a simple support process for reporting issues and requests.
3. **Mobile experience**: Consider a dedicated mobile application or progressive web app (PWA) enhancements for staff and students who primarily use phones.
4. **Integration**: Explore integration with existing university systems (e.g. student information system, finance) for automatic sync of student data and payment reconciliation where appropriate.
5. **Security and compliance**: Keep dependencies and environment configuration up to date; conduct periodic review of access rights and audit logs; ensure compliance with institutional and national data protection requirements.
6. **Further testing**: As usage grows, consider automated regression and load testing to safeguard reliability and performance.

These recommendations aim to maximise the benefit of the SRC Dashboard and prepare the ground for its long-term use and evolution.
