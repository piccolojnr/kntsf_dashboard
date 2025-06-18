import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed...');
    // Create admin user
    const adminRole = await prisma.role.upsert({
        where: { name: 'admin' },
        update: {
            description: 'Administrator with full access',
        },
        create: {
            name: 'admin',
            description: 'Administrator with full access',
        },
    });

    if (!adminRole) {
        throw new Error('Admin role not found');
    }

    const proRole = await prisma.role.upsert({
        where: { name: 'pro' },
        update: {
            description: "Public Relations Officer",
        },
        create: {
            name: 'pro',
            description: "Public Relations Officer",
        },
    });

    if (!proRole) {
        throw new Error('Pro role not found');
    }

    const executiveRole = await prisma.role.upsert({
        where: { name: 'executive' },
        update: {
            description: 'Executive member with limited access',
        },
        create: {
            name: 'executive',
            description: 'Executive member with limited access',
        },
    });

    if (!executiveRole) {
        throw new Error('Executive role not found');
    }





    // Create executive users
    const executives: {
        name: string;
        position: string;
        positionDescription: string;
        biography: string;
        category: 'main_executive' | 'other_executive' | 'hall_presidents';
        published: boolean;
        roleId: number;
    }[] = [
            {
                "name": "Basily Ansah Yeboah",
                "position": "Acting President",
                "positionDescription": "Leading the student body and executive council",
                "biography": "Committed to student welfare and institutional development.",
                "category": "main_executive",
                "roleId": adminRole.id,
                "published": true
            },
            {
                "name": "Abdulai Abdulai",
                "position": "Vice President",
                "positionDescription": "Assisting the President in leadership duties",
                "biography": "Focused on enhancing student engagement and academic excellence.",
                "category": "main_executive",
                "roleId": executiveRole.id,
                "published": true
            },
            {
                "name": "Osei Ampratwum Alberta",
                "position": "General Secretary",
                "positionDescription": "Managing administrative affairs and documentation",
                "biography": "Ensuring smooth administrative operations and maintaining accurate records.",
                "category": "main_executive",
                "roleId": executiveRole.id,
                "published": true
            },
            {
                "name": "Josephine Agyemang",
                "position": "Women's Commissioner",
                "positionDescription": "Advocating for women's rights and gender equality",
                "biography": "Dedicated to promoting gender equality and empowering women within the student body.",
                "category": "main_executive",
                "roleId": executiveRole.id,
                "published": true
            },
            {
                "name": "Naeem Latif Menard",
                "position": "Public Relations Officer",
                "positionDescription": "Leading communication and public engagement initiatives",
                "biography": "Dedicated to enhancing student communication and fostering positive relationships between the student body and administration.",
                "category": "main_executive",
                "roleId": proRole.id,
                "published": true
            },
            {
                "name": "Rockson Appiah Mensah",
                "position": "Organizer",
                "positionDescription": "Planning and executing student events",
                "biography": "Expert in event planning and student engagement activities.",
                "category": "main_executive",
                "roleId": executiveRole.id,
                "published": true
            },

            {
                "name": "Dzifa Aseye Abena Eduaful-Mills",
                "position": "Deputy Secretary",
                "positionDescription": "Supporting administrative functions and record-keeping",
                "biography": "Committed to maintaining efficient administrative processes.",
                "category": "other_executive",
                "roleId": executiveRole.id,
                "published": true
            },
            {
                "name": "Kwuatsenu Naana Divine",
                "position": "Deputy Public Relations Officer",
                "positionDescription": "Supporting PR initiatives and student engagement",
                "biography": "Passionate about student welfare and effective communication strategies.",
                "category": "other_executive",
                "roleId": proRole.id,
                "published": true
            },
            {
                "name": "Jamal Mashood",
                "position": "Deputy Organizer",
                "positionDescription": "Coordinating student events and activities",
                "biography": "Focused on creating memorable student experiences through well-organized events.",
                "category": "other_executive",
                "roleId": executiveRole.id,
                "published": true
            },
            {
                "name": "Saeed Zakari",
                "position": "Sports Coordinator",
                "positionDescription": "Overseeing sports activities and athletic programs",
                "biography": "Promoting sports excellence and healthy competition among students.",
                "category": "other_executive",
                "roleId": executiveRole.id,
                "published": true
            },
            {
                "name": "Quartey Joshua Papafio",
                "position": "Sports Coordinator",
                "positionDescription": "Coordinating sports activities and athletic events",
                "biography": "Passionate about sports development and student athletic achievement.",
                "category": "other_executive",
                "roleId": executiveRole.id,
                "published": true
            },
            {
                "name": "Ibe Daniel Albert",
                "position": "Hall President",
                "positionDescription": "Managing hall affairs and student welfare",
                "biography": "Dedicated to creating a conducive living environment for students.",
                "category": "hall_presidents",
                "roleId": executiveRole.id,
                "published": true
            },
            {
                "name": "Kelvin Ofori Atta",
                "position": "Hall President",
                "positionDescription": "Managing hall operations and student welfare",
                "biography": "Focused on creating a supportive and engaging hall environment.",
                "category": "hall_presidents",
                "roleId": executiveRole.id,
                "published": true
            },
            {
                "name": "KNUTSFORD VP",
                "position": "Hall Vice President",
                "positionDescription": "Supporting the Hall President in administrative and student welfare duties",
                "biography": "Assists in managing KNUTSFORD Hall's internal operations.",
                "category": "hall_presidents",
                "roleId": executiveRole.id,
                "published": false
            },
            {
                "name": "White VP",
                "position": "Hall Vice President",
                "positionDescription": "Supporting the Hall President in leadership responsibilities",
                "biography": "Committed to enhancing the student experience in White Hall.",
                "category": "hall_presidents",
                "roleId": executiveRole.id,
                "published": false
            },
            {
                "name": "Other Executive External",
                "position": "External Affairs",
                "positionDescription": "Managing external relations and partnerships",
                "biography": "Focused on building connections beyond the institution for mutual benefit.",
                "category": "other_executive",
                "roleId": executiveRole.id,
                "published": false
            },
            {
                "name": "Other Executive Internal",
                "position": "Internal Affairs",
                "positionDescription": "Managing internal coordination and member relations",
                "biography": "Ensures cohesion within the organization through effective internal communication.",
                "category": "other_executive",
                "roleId": executiveRole.id,
                "published": false
            },
            {
                "name": "Asantewaa VP",
                "position": "Hall Vice President",
                "positionDescription": "Supporting the Hall President in managing student affairs",
                "biography": "Plays a key role in representing student interests in Asantewaa Hall.",
                "category": "hall_presidents",
                "roleId": executiveRole.id,
                "published": false
            },
            {
                "name": "KNUTSFORD Secretary",
                "position": "Hall Secretary",
                "positionDescription": "Documenting meetings and hall administrative activities",
                "biography": "Responsible for effective record-keeping and communication in KNUTSFORD Hall.",
                "category": "hall_presidents",
                "roleId": executiveRole.id,
                "published": false
            },
            {
                "name": "White Secretary",
                "position": "Hall Secretary",
                "positionDescription": "Maintaining records and documentation for hall activities",
                "biography": "Ensures effective communication and organization in White Hall.",
                "category": "hall_presidents",
                "roleId": executiveRole.id,
                "published": false
            },
            {
                "name": "Asantewaa Secretary",
                "position": "Hall Secretary",
                "positionDescription": "Responsible for administrative support and records",
                "biography": "Ensures Asantewaa Hall's operations are well-documented and coordinated.",
                "category": "hall_presidents",
                "roleId": executiveRole.id,
                "published": false
            },
            {
                "name": "KNUTSFORD Organizer",
                "position": "Hall Organizer",
                "positionDescription": "Planning and organizing hall events and student programs",
                "biography": "Dedicated to organizing impactful events for KNUTSFORD Hall residents.",
                "category": "hall_presidents",
                "roleId": executiveRole.id,
                "published": false
            },
            {
                "name": "White Organizer",
                "position": "Hall Organizer",
                "positionDescription": "Managing events and community programs for White Hall",
                "biography": "Brings students together through well-planned activities.",
                "category": "hall_presidents",
                "roleId": executiveRole.id,
                "published": false
            },
            {
                "name": "Asantewaa Organizer",
                "position": "Hall Organizer",
                "positionDescription": "Organizing hall-based programs and student initiatives",
                "biography": "Driven to improve hall culture through engaging events.",
                "category": "hall_presidents",
                "roleId": executiveRole.id,
                "published": false
            }
        ];

    console.log('Creating executive users...');
    let index = 0;
    for (const executive of executives) {
        const username = executive.name.toLowerCase().replace(/\s+/g, '.');
        const email = `${username}@example.com`;
        const hashedPassword = await bcrypt.hash('exec123', 10);
        const cIndex = index++;

        await prisma.user.upsert({
            where: { email },
            update: {
                name: executive.name,
                position: executive.position,
                positionDescription: executive.positionDescription,
                biography: executive.biography,
                roleId: executive.roleId,
                category: executive.category,
                published: executive.published,
                index: cIndex,
            },
            create: {
                ...executive,
                username,
                email,
                password: hashedPassword,
                index: cIndex,
                published: executive.published,
            },
        });
        console.log(`Created user: ${executive.name} (${username}) with password 'exec123'`);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    console.log('Creating admin user...');
    await prisma.user.upsert({
        where: { username: 'admin' },
        update: {
            email: 'admin@example.com',
            username: 'admin',
            password: hashedPassword,
            roleId: adminRole.id,
            published: false
        },
        create: {
            username: 'admin',
            email: 'admin@example.com',
            password: hashedPassword,
            roleId: adminRole.id,
            published: false
        },
    });

    // Create initial configuration
    console.log('Creating initial configuration...');
    await prisma.config.upsert({
        where: { id: 1 },
        update: {},
        create: {
            appName: "KNUST SRC Permit System",
            appDescription: "Official permit management system for KNUST SRC",
            appLogo: "https://res.cloudinary.com/your-cloud-name/image/upload/v1/knust-src/logo.png",
            appFavicon: "https://res.cloudinary.com/your-cloud-name/image/upload/v1/knust-src/favicon.ico",
            socialLinks: {
                facebook: "https://facebook.com/knustsrc",
                twitter: "https://twitter.com/knustsrc",
                instagram: "https://instagram.com/knustsrc"
            },
            contactInfo: {
                create: {
                    email: "src@knust.edu.gh",
                    phone: "+233 XX XXX XXXX",
                    address: "KNUST Main Campus, Kumasi, Ghana",
                    website: "https://knust.edu.gh/src"
                }
            },
            semesterConfig: {
                create: {
                    currentSemester: "Second Semester",
                    academicYear: "2023/2024",
                    startDate: new Date("2024-01-15"),
                    endDate: new Date("2024-05-15"),
                    isActive: true
                }
            },
            permitConfig: {
                create: {
                    expirationDate: new Date("2024-05-15"),
                    defaultAmount: 50.00,
                    currency: "GHS"
                }
            }
        }
    });

    console.log('Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('Error during seed:', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 