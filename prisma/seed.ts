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
    ];

    console.log('Creating permissions...');
    for (const permission of permissions) {
        await prisma.permission.upsert({
            where: {
                name: permission.name,
                description: permission.description,
            },
            update: {},
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

    // Get the executive role
    const executiveRole = await prisma.role.findUnique({
        where: { name: 'executive' },
    });

    if (!executiveRole) {
        throw new Error('Executive role not found');
    }

    // Create executive users
    const executives = [
        {
            name: "Naeem Latif Menard",
            position: "Public Relations Officer",
            positionDescription: "Leading communication and public engagement initiatives",
            biography: "Dedicated to enhancing student communication and fostering positive relationships between the student body and administration.",
            category: "main_executive",
            socialLinks: {
                linkedin: "https://linkedin.com/in/naeem-menard",
                twitter: "https://twitter.com/naeem_menard"
            }
        },
        {
            name: "Kwuatsenu Naana Divine",
            position: "Deputy Public Relations Officer",
            positionDescription: "Supporting PR initiatives and student engagement",
            biography: "Passionate about student welfare and effective communication strategies.",
            category: "other_executive",
            socialLinks: {
                linkedin: "https://linkedin.com/in/naana-divine"
            }
        },
        {
            name: "Jamal Mashood",
            position: "Deputy Organizer",
            positionDescription: "Coordinating student events and activities",
            biography: "Focused on creating memorable student experiences through well-organized events.",
            category: "other_executive",
            socialLinks: {
                linkedin: "https://linkedin.com/in/jamal-mashood"
            }
        },
        {
            name: "Osei Ampratwum Alberta",
            position: "General Secretary",
            positionDescription: "Managing administrative affairs and documentation",
            biography: "Ensuring smooth administrative operations and maintaining accurate records.",
            category: "main_executive",
            socialLinks: {
                linkedin: "https://linkedin.com/in/alberta-osei"
            }
        },
        {
            name: "Dzifa Aseye Abena Eduaful-Mills",
            position: "Deputy Secretary",
            positionDescription: "Supporting administrative functions and record-keeping",
            biography: "Committed to maintaining efficient administrative processes.",
            category: "other_executive",
            socialLinks: {
                linkedin: "https://linkedin.com/in/dzifa-eduaful-mills"
            }
        },
        {
            name: "Saeed Zakari",
            position: "Sports Coordinator",
            positionDescription: "Overseeing sports activities and athletic programs",
            biography: "Promoting sports excellence and healthy competition among students.",
            category: "other_executive",
            socialLinks: {
                linkedin: "https://linkedin.com/in/saeed-zakari"
            }
        },
        {
            name: "Ibe Daniel Albert",
            position: "Hall President",
            positionDescription: "Managing hall affairs and student welfare",
            biography: "Dedicated to creating a conducive living environment for students.",
            category: "main_executive",
            socialLinks: {
                linkedin: "https://linkedin.com/in/daniel-albert"
            }
        },
        {
            name: "Basily Ansah Yeboah",
            position: "Acting President",
            positionDescription: "Leading the student body and executive council",
            biography: "Committed to student welfare and institutional development.",
            category: "main_executive",
            socialLinks: {
                linkedin: "https://linkedin.com/in/basily-yeboah",
                twitter: "https://twitter.com/basily_yeboah"
            }
        },
        {
            name: "Kelvin Ofori Atta",
            position: "Hall President",
            positionDescription: "Managing hall operations and student welfare",
            biography: "Focused on creating a supportive and engaging hall environment.",
            category: "main_executive",
            socialLinks: {
                linkedin: "https://linkedin.com/in/kelvin-atta"
            }
        },
        {
            name: "Quartey Joshua Papafio",
            position: "Sports Coordinator",
            positionDescription: "Coordinating sports activities and athletic events",
            biography: "Passionate about sports development and student athletic achievement.",
            category: "other_executive",
            socialLinks: {
                linkedin: "https://linkedin.com/in/joshua-papafio"
            }
        },
        {
            name: "Rockson Appiah Mensah",
            position: "Organizer",
            positionDescription: "Planning and executing student events",
            biography: "Expert in event planning and student engagement activities.",
            category: "main_executive",
            socialLinks: {
                linkedin: "https://linkedin.com/in/rockson-mensah"
            }
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
                ...executive,
                username,
                password: hashedPassword,
                roleId: executiveRole.id,
            },
            create: {
                ...executive,
                username,
                email,
                password: hashedPassword,
                roleId: executiveRole.id,
            },
        });
        console.log(`Created user: ${executive.name} (${username}) with password 'exec123'`);
    }

    // Create admin user
    const adminRole = await prisma.role.findUnique({
        where: { name: 'admin' },
    });

    if (!adminRole) {
        throw new Error('Admin role not found');
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