'use server'
import prisma from '../prisma/client';
import { format } from "date-fns";
import { PDFDocument, StandardFonts } from "pdf-lib";

interface ReportData {
    url: string;
    filename: string;
}

interface ReportResponse {
    success: boolean;
    data?: ReportData;
    error?: string;
}

interface MonthlyRevenue {
    createdAt: Date;
    _sum: {
        amountPaid: number | null;
    };
}

export async function generate(reportType: string): Promise<ReportResponse> {
    try {
        switch (reportType) {
            case "permit-stats":
                return await generatePermitStats();
            case "revenue":
                return await generateRevenueReport();
            case "student-analytics":
                return await generateStudentAnalytics();
            default:
                return {
                    success: false,
                    error: "Invalid report type",
                };
        }
    } catch (error) {
        console.error("Error generating report:", error);
        return {
            success: false,
            error: "Failed to generate report",
        };
    }
}

export async function generatePermitStats(): Promise<ReportResponse> {
    try {
        const [activePermits, revokedPermits, expiringSoon] = await Promise.all([
            prisma.permit.count({
                where: { status: "active" },
            }),
            prisma.permit.count({
                where: { status: "revoked" },
            }),
            prisma.permit.count({
                where: {
                    status: "active",
                    expiryDate: {
                        lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                        gt: new Date(),
                    },
                },
            }),
        ]);

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const { height } = page.getSize();

        // Add title
        page.drawText("Permit Statistics Report", {
            x: 50,
            y: height - 50,
            size: 20,
            font,
        });

        // Add date
        page.drawText(`Generated on: ${format(new Date(), "PPP")}`, {
            x: 50,
            y: height - 80,
            size: 12,
            font,
        });

        // Add statistics
        const stats = [
            { label: "Active Permits", value: activePermits },
            { label: "Revoked Permits", value: revokedPermits },
            { label: "Expiring Soon", value: expiringSoon },
        ];

        stats.forEach((stat, index) => {
            page.drawText(`${stat.label}: ${stat.value}`, {
                x: 50,
                y: height - 120 - index * 30,
                size: 14,
                font,
            });
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        return {
            success: true,
            data: {
                url,
                filename: `permit-stats-${format(new Date(), "yyyy-MM-dd")}.pdf`,
            },
        };
    } catch (error) {
        console.error("Error generating permit stats:", error);
        return {
            success: false,
            error: "Failed to generate permit statistics report",
        };
    }
}

async function generateRevenueReport(): Promise<ReportResponse> {
    try {
        const [totalRevenue, monthlyRevenue] = await Promise.all([
            prisma.permit.aggregate({
                _sum: {
                    amountPaid: true,
                },
            }),
            prisma.permit.groupBy({
                by: ["createdAt"],
                _sum: {
                    amountPaid: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 12,
            }),
        ]);

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const { height } = page.getSize();

        // Add title
        page.drawText("Revenue Report", {
            x: 50,
            y: height - 50,
            size: 20,
            font,
        });

        // Add date
        page.drawText(`Generated on: ${format(new Date(), "PPP")}`, {
            x: 50,
            y: height - 80,
            size: 12,
            font,
        });

        // Add total revenue
        page.drawText(
            `Total Revenue: GHS ${totalRevenue._sum.amountPaid?.toFixed(2) || "0.00"}`,
            {
                x: 50,
                y: height - 120,
                size: 14,
                font,
            }
        );

        // Add monthly breakdown
        page.drawText("Monthly Revenue Breakdown:", {
            x: 50,
            y: height - 160,
            size: 14,
            font,
        });

        monthlyRevenue.forEach((month: MonthlyRevenue, index: number) => {
            page.drawText(
                `${format(month.createdAt, "MMM yyyy")}: GHS ${month._sum.amountPaid?.toFixed(2) || "0.00"
                }`,
                {
                    x: 50,
                    y: height - 190 - index * 30,
                    size: 12,
                    font,
                }
            );
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        return {
            success: true,
            data: {
                url,
                filename: `revenue-report-${format(new Date(), "yyyy-MM-dd")}.pdf`,
            },
        };
    } catch (error) {
        console.error("Error generating revenue report:", error);
        return {
            success: false,
            error: "Failed to generate revenue report",
        };
    }
}

async function generateStudentAnalytics(): Promise<ReportResponse> {
    try {
        const [totalStudents, studentsWithPermits, studentsWithoutPermits] =
            await Promise.all([
                prisma.student.count(),
                prisma.student.count({
                    where: {
                        permits: {
                            some: {
                                status: "active",
                            },
                        },
                    },
                }),
                prisma.student.count({
                    where: {
                        permits: {
                            none: {
                                status: "active",
                            },
                        },
                    },
                }),
            ]);

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const { height } = page.getSize();

        // Add title
        page.drawText("Student Analytics Report", {
            x: 50,
            y: height - 50,
            size: 20,
            font,
        });

        // Add date
        page.drawText(`Generated on: ${format(new Date(), "PPP")}`, {
            x: 50,
            y: height - 80,
            size: 12,
            font,
        });

        // Add statistics
        const stats = [
            { label: "Total Students", value: totalStudents },
            { label: "Students with Active Permits", value: studentsWithPermits },
            { label: "Students without Active Permits", value: studentsWithoutPermits },
        ];

        stats.forEach((stat, index) => {
            page.drawText(`${stat.label}: ${stat.value}`, {
                x: 50,
                y: height - 120 - index * 30,
                size: 14,
                font,
            });
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        return {
            success: true,
            data: {
                url,
                filename: `student-analytics-${format(new Date(), "yyyy-MM-dd")}.pdf`,
            },
        };
    } catch (error) {
        console.error("Error generating student analytics:", error);
        return {
            success: false,
            error: "Failed to generate student analytics report",
        };
    }
}
