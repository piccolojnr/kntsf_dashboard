import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // Create permissions
    const permissions = [
        { name: 'manage_users', description: 'Can manage users' },
        { name: 'manage_roles', description: 'Can manage roles' },
        { name: 'manage_permissions', description: 'Can manage permissions' },
        { name: 'manage_permits', description: 'Can manage permits' },
        { name: 'view_reports', description: 'Can view reports' },
        { name: 'manage_settings', description: 'Can manage settings' },
        { name: 'create_permits', description: 'Can create permits' },
        { name: 'revoke_permits', description: 'Can revoke permits' },
        { name: 'view_permits', description: 'Can view permits' },
        { name: 'manage_students', description: 'Can manage students' },
        { name: 'view_students', description: 'Can view students' },
        { name: 'export_data', description: 'Can export data' },
        // 
        {
            name: "news:create",
            description: "Create news articles",
        },
        {
            name: "news:read",
            description: "Read news articles",
        },
        {
            name: "news:update",
            description: "Update news articles",
        },
        {
            name: "news:delete",
            description: "Delete news articles",
        },
    ];

    console.log('Creating permissions...');
    for (const permission of permissions) {
        await prisma.permission.upsert({
            where: {
                name: permission.name,
            },
            update: {
                name: permission.name,
                description: permission.description,
            },
            create: permission,
        });
    }

    // Create roles
    const roles = [
        {
            name: 'admin',
            description: 'Administrator with full access',
            permissions: [
                'manage_users',
                'manage_roles',
                'manage_permissions',
                'manage_permits',
                'view_reports',
                'manage_settings',
                'create_permits',
                'revoke_permits',
                'view_permits',
                'manage_students',
                'view_students',
                'export_data',
                'news:create',
                'news:read',
                'news:update',
                'news:delete',
            ],
        },
        {
            name: 'pro',
            description: "Public Relations Officer",
            permissions: [
                'create_permits',
                'view_permits',
                'view_students',
                'manage_settings',
                'view_reports',
                'news:create',
                'news:read',
                'news:update',
                'news:delete',
            ],
        },
        {
            name: 'executive',
            description: 'Executive member with limited access',
            permissions: [
                'create_permits',
                'view_permits',
                'view_students',
                'manage_settings',
                'view_reports',
            ],
        }
    ];

    console.log('Creating roles...');
    for (const role of roles) {
        const { permissions: rolePermissions, ...roleData } = role;
        const createdRole = await prisma.role.upsert({
            where: { name: roleData.name },
            update: {},
            create: roleData,
        });

        // Get all permissions for this role
        const permissions = await prisma.permission.findMany({
            where: {
                name: {
                    in: rolePermissions,
                },
            },
        });

        // Create role-permission relationships
        for (const permission of permissions) {
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: createdRole.id,
                        permissionId: permission.id,
                    },
                },
                update: {},
                create: {
                    roleId: createdRole.id,
                    permissionId: permission.id,
                },
            });
        }
    }

    // Create admin user
    const adminRole = await prisma.role.findUnique({
        where: { name: 'admin' },
    });

    if (!adminRole) {
        throw new Error('Admin role not found');
    }

    const proRole = await prisma.role.findUnique({
        where: { name: 'pro' },
    });

    if (!proRole) {
        throw new Error('Pro role not found');
    }




    // Get the executive role
    const executiveRole = await prisma.role.findUnique({
        where: { name: 'executive' },
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
        roleId: number;
    }[] = [
            {
                "name": "Basily Ansah Yeboah",
                "position": "Acting President",
                "positionDescription": "Leading the student body and executive council",
                "biography": "Committed to student welfare and institutional development.",
                "category": "main_executive",
                "roleId": adminRole.id
            },
            {
                "name": "Abdulai Abdulai",
                "position": "Vice President",
                "positionDescription": "Assisting the President in leadership duties",
                "biography": "Focused on enhancing student engagement and academic excellence.",
                "category": "main_executive",
                "roleId": executiveRole.id
            },
            {
                "name": "Osei Ampratwum Alberta",
                "position": "General Secretary",
                "positionDescription": "Managing administrative affairs and documentation",
                "biography": "Ensuring smooth administrative operations and maintaining accurate records.",
                "category": "main_executive",
                "roleId": executiveRole.id
            },
            {
                "name": "Josephine Agyemang",
                "position": "Women's Commissioner",
                "positionDescription": "Advocating for women's rights and gender equality",
                "biography": "Dedicated to promoting gender equality and empowering women within the student body.",
                "category": "main_executive",
                "roleId": executiveRole.id
            },
            {
                "name": "Naeem Latif Menard",
                "position": "Public Relations Officer",
                "positionDescription": "Leading communication and public engagement initiatives",
                "biography": "Dedicated to enhancing student communication and fostering positive relationships between the student body and administration.",
                "category": "main_executive",
                "roleId": proRole.id
            },
            {
                "name": "Rockson Appiah Mensah",
                "position": "Organizer",
                "positionDescription": "Planning and executing student events",
                "biography": "Expert in event planning and student engagement activities.",
                "category": "main_executive",
                "roleId": executiveRole.id
            },
            {
                "name": "Other Executive External",
                "position": "External Affairs",
                "positionDescription": "Managing external relations and partnerships",
                "biography": "Focused on building connections beyond the institution for mutual benefit.",
                "category": "other_executive",
                "roleId": executiveRole.id
            },
            {
                "name": "Other Executive Internal",
                "position": "Internal Affairs",
                "positionDescription": "Managing internal coordination and member relations",
                "biography": "Ensures cohesion within the organization through effective internal communication.",
                "category": "other_executive",
                "roleId": executiveRole.id
            },
            {
                "name": "Dzifa Aseye Abena Eduaful-Mills",
                "position": "Deputy Secretary",
                "positionDescription": "Supporting administrative functions and record-keeping",
                "biography": "Committed to maintaining efficient administrative processes.",
                "category": "other_executive",
                "roleId": executiveRole.id
            },
            {
                "name": "Kwuatsenu Naana Divine",
                "position": "Deputy Public Relations Officer",
                "positionDescription": "Supporting PR initiatives and student engagement",
                "biography": "Passionate about student welfare and effective communication strategies.",
                "category": "other_executive",
                "roleId": proRole.id
            },
            {
                "name": "Jamal Mashood",
                "position": "Deputy Organizer",
                "positionDescription": "Coordinating student events and activities",
                "biography": "Focused on creating memorable student experiences through well-organized events.",
                "category": "other_executive",
                "roleId": executiveRole.id
            },
            {
                "name": "Saeed Zakari",
                "position": "Sports Coordinator",
                "positionDescription": "Overseeing sports activities and athletic programs",
                "biography": "Promoting sports excellence and healthy competition among students.",
                "category": "other_executive",
                "roleId": executiveRole.id
            },
            {
                "name": "Quartey Joshua Papafio",
                "position": "Sports Coordinator",
                "positionDescription": "Coordinating sports activities and athletic events",
                "biography": "Passionate about sports development and student athletic achievement.",
                "category": "other_executive",
                "roleId": executiveRole.id
            },
            {
                "name": "Ibe Daniel Albert",
                "position": "Hall President",
                "positionDescription": "Managing hall affairs and student welfare",
                "biography": "Dedicated to creating a conducive living environment for students.",
                "category": "hall_presidents",
                "roleId": executiveRole.id
            },
            {
                "name": "Kelvin Ofori Atta",
                "position": "Hall President",
                "positionDescription": "Managing hall operations and student welfare",
                "biography": "Focused on creating a supportive and engaging hall environment.",
                "category": "hall_presidents",
                "roleId": executiveRole.id
            },
            {
                "name": "KNUTSFORD VP",
                "position": "Hall Vice President",
                "positionDescription": "Supporting the Hall President in administrative and student welfare duties",
                "biography": "Assists in managing KNUTSFORD Hall’s internal operations.",
                "category": "hall_presidents",
                "roleId": executiveRole.id
            },
            {
                "name": "White VP",
                "position": "Hall Vice President",
                "positionDescription": "Supporting the Hall President in leadership responsibilities",
                "biography": "Committed to enhancing the student experience in White Hall.",
                "category": "hall_presidents",
                "roleId": executiveRole.id
            },
            {
                "name": "Asantewaa VP",
                "position": "Hall Vice President",
                "positionDescription": "Supporting the Hall President in managing student affairs",
                "biography": "Plays a key role in representing student interests in Asantewaa Hall.",
                "category": "hall_presidents",
                "roleId": executiveRole.id
            },
            {
                "name": "KNUTSFORD Secretary",
                "position": "Hall Secretary",
                "positionDescription": "Documenting meetings and hall administrative activities",
                "biography": "Responsible for effective record-keeping and communication in KNUTSFORD Hall.",
                "category": "hall_presidents",
                "roleId": executiveRole.id
            },
            {
                "name": "White Secretary",
                "position": "Hall Secretary",
                "positionDescription": "Maintaining records and documentation for hall activities",
                "biography": "Ensures effective communication and organization in White Hall.",
                "category": "hall_presidents",
                "roleId": executiveRole.id
            },
            {
                "name": "Asantewaa Secretary",
                "position": "Hall Secretary",
                "positionDescription": "Responsible for administrative support and records",
                "biography": "Ensures Asantewaa Hall's operations are well-documented and coordinated.",
                "category": "hall_presidents",
                "roleId": executiveRole.id
            },
            {
                "name": "KNUTSFORD Organizer",
                "position": "Hall Organizer",
                "positionDescription": "Planning and organizing hall events and student programs",
                "biography": "Dedicated to organizing impactful events for KNUTSFORD Hall residents.",
                "category": "hall_presidents",
                "roleId": executiveRole.id
            },
            {
                "name": "White Organizer",
                "position": "Hall Organizer",
                "positionDescription": "Managing events and community programs for White Hall",
                "biography": "Brings students together through well-planned activities.",
                "category": "hall_presidents",
                "roleId": executiveRole.id
            },
            {
                "name": "Asantewaa Organizer",
                "position": "Hall Organizer",
                "positionDescription": "Organizing hall-based programs and student initiatives",
                "biography": "Driven to improve hall culture through engaging events.",
                "category": "hall_presidents",
                "roleId": executiveRole.id
            }
        ];


    console.log('Creating executive users...');
    for (const executive of executives) {
        const username = executive.name.toLowerCase().replace(/\s+/g, '.');
        const email = `${username}@example.com`;
        const hashedPassword = await bcrypt.hash('exec123', 10);

        await prisma.user.upsert({
            where: { email },
            update: {
                name: executive.name,
                position: executive.position,
                positionDescription: executive.positionDescription,
                biography: executive.biography,
                roleId: executive.roleId,
                category: executive.category,
            },
            create: {
                ...executive,
                username,
                email,
                password: hashedPassword,
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
        },
        create: {
            username: 'admin',
            email: 'admin@example.com',
            password: hashedPassword,
            roleId: adminRole.id,
        },
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