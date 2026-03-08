# CHAPTER ONE: INTRODUCTION

## 1.1 Introduction

This chapter introduces the Knutsford University SRC Dashboard project. It presents the background to the study, the statement of the problem, the objectives, the significance and scope of the study, its limitations, the organisation of the report, and definition of terms where applicable.

## 1.2 Background to the Study

Universities require efficient systems to manage student permits, campus events, news, and day-to-day administrative tasks. Knutsford University, like many institutions, previously relied on manual or semi-manual processes for permit issuance, student records, event coordination, and communications. The Students' Representative Council (SRC) and university administrators needed a centralised platform to streamline permit creation and verification, student life management, content publishing, and payment collection. Advances in web technologies, cloud services, and payment gateways have made it feasible to build a single, secure, role-based dashboard that serves administrators, SRC executives, and security personnel. This project was undertaken to design and implement such a system for Knutsford University.

## 1.3 Statement of the Problem

The existing approach to permit management and student services at the university presented several difficulties:

- **Manual permit processing**: Permit issuance and renewal depended on manual paperwork, leading to delays, errors, and difficulty in tracking status and expiry.
- **No real-time verification**: Security and staff could not quickly verify whether a student had a valid permit, affecting campus access control.
- **Scattered student services**: Student data, events, news, documents, and communications were managed through multiple, uncoordinated channels.
- **Administrative overhead**: Staff spent considerable time on repetitive tasks that could be automated (e.g. permit creation, notifications, reporting).
- **Limited transparency**: Lack of a unified system made it difficult to generate timely reports and analytics for decision-making.

These problems motivated the development of an integrated, web-based SRC Dashboard.

## 1.4 Objectives (Purpose of the Study)

The study aimed to:

1. Design and implement a web-based permit management system with automated creation, unique identifiers (e.g. QR codes), and real-time verification.
2. Provide a centralised student management module for maintaining student profiles and linking them to permits and other services.
3. Integrate a secure payment mechanism (Paystack) for permit fees and related transactions.
4. Develop modules for event management, news and announcements, document management, and newsletter distribution.
5. Implement engagement features such as polls and student idea submission to support SRC and administrative decision-making.
6. Ensure role-based access control and audit trails for security and accountability.
7. Deliver a responsive, usable dashboard for administrators, SRC executives, and authorised staff.

## 1.5 Significance of the Study

The project is significant because it:

- **Reduces permit processing time** through automation and digital workflows, improving service to students and reducing staff workload.
- **Enables real-time permit verification** for security and gate staff, enhancing campus access control.
- **Centralises student-life management** (permits, events, news, documents, newsletters) in one system, improving consistency and accessibility.
- **Provides a foundation for data-driven decisions** via dashboards and reporting on permits, payments, and engagement.
- **Demonstrates the application** of modern web technologies (Next.js, TypeScript, Prisma, MySQL) and third-party services (Paystack, Cloudinary) in a real institutional context.

## 1.6 Scope of the Study

The scope of the study covers:

- The design and implementation of the Knutsford University SRC Dashboard as a web application.
- Core modules: user authentication and roles, permit management (creation, verification, expiry), student management, payment integration (Paystack), events, news, documents, newsletters, and polls.
- Target users: university administrators, SRC executives, and security or authorised staff who use the dashboard; students interact via permit verification, polls, and idea submission as defined in the system.
- Deployment and documentation sufficient to support installation, configuration, and basic use; integration with existing university ERP or student information systems is outside the immediate scope.

## 1.7 Limitations of the Study

Limitations include:

- The system was developed and tested within a specific environment (e.g. development and staging); long-term production load and scalability under peak usage would require further evaluation.
- Payment integration is limited to the Paystack gateway and the configured currency (e.g. GHS); other gateways or currencies would require additional development.
- Mobile delivery is currently through responsive web access; a dedicated native mobile application was not part of this project.
- Literature review and comparison with similar systems are limited to the sources and systems reviewed within the project timeline.

## 1.8 Organisation of the Study

The report is organised as follows:

- **Chapter Two** reviews related literature and similar systems.
- **Chapter Three** presents system analysis and design (existing system, proposed system, requirements, database design, logic design, user interface design, and test plan).
- **Chapter Four** describes system implementation (technologies, frameworks, coding evidence, testing results, and deployment).
- **Chapter Five** summarises the work, presents conclusions, and makes recommendations.
- **References** and **Appendices** follow the main body.

## 1.9 Definition of Terms

- **SRC**: Students' Representative Council.
- **Permit**: A digital authorisation (e.g. student permit) issued by the university/SRC, linked to a unique code (e.g. QR code) for verification.
- **Dashboard**: A web-based interface providing authenticated users with access to management functions and information.
- **Role-based access control (RBAC)**: A security model where system access is determined by the user’s role (e.g. admin, executive, staff).
- **Paystack**: A third-party payment gateway used for collecting permit fees and other payments.
