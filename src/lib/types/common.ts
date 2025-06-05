import { Permission, Permit, Role, Student, User } from "@prisma/client"

export interface ServiceResponse<T = unknown> {
    success: boolean
    data?: T
    error?: string
}

export interface PaginatedData<T> {
    data: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

export type PaginatedResponse<T> = ServiceResponse<PaginatedData<T>>


export type SessionUser = {
    id: number;
    username: string;
    email: string;
    role: {
        id: number;
        name: string;
    };
}

export type AuthorizedUser = User & {
    role: Role & {
        permissions: {
            permission: Permission;
        }[];
    };
};



export type StudentPermit = Permit & {
    student: Student
    issuedBy: {
        username: string
    } | null
}

export type StudentDetails = Student & {
    permits: (Permit & {
        issuedBy: {
            username: string;
        } | null;
    })[];
};


export interface RoleWithPermissions extends Role {
    id: number;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    permissions: {
        permission: Permission;
    }[];
}
