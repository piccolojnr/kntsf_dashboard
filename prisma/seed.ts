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
                description: permission.description
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
            name: 'staff',
            description: 'Staff member with limited access',
            permissions: [
                'create_permits',
                'view_permits',
                'view_students',
                'manage_settings',
                'view_reports',
            ],
        },
        {
            name: 'viewer',
            description: 'View-only access',
            permissions: [
                'view_permits',
                'manage_settings',
                'view_students',
                'view_reports',
            ],
        },
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