export interface IBackendRes<T> {
  error?: string | string[];
  message: string;
  statusCode: number | string;
  data?: T;
}

export interface IModelPaginate<T> {
  meta: {
    page: number;
    pageSize: number;
    pages: number;
    total: number;
  };
  result: T[];
}

export interface IAccount {
  access_token: string;
  user: {
    id: string | number;
    email: string;
    name: string;
    role: {
      id: string | number;
      name: string;
      description?: string;
      active: boolean;
      createdAt?: string;
      updatedAt?: string | null;
      createdBy?: string;
      updatedBy?: string | null;
      permissions: {
        id: string | number;
        name: string;
        apiPath: string;
        method: string;
        module: string;
        createdAt?: string;
        updatedAt?: string | null;
        createdBy?: string;
        updatedBy?: string | null;
      }[];
    };
    company: {
      id?: string | number;
      name?: string;
      logo?: string;
    } | null;
    vip: boolean;
  };
}

export interface IGetAccount extends Omit<IAccount, "access_token"> {}

export interface ICompany {
  id?: string;
  name?: string;
  address?: string;
  logo: string;
  description?: string;
  createdBy?: string;
  isDeleted?: boolean;
  deletedAt?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISkill {
  id?: string;
  name?: string;
  createdBy?: string;
  isDeleted?: boolean;
  deletedAt?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IUser {
  id?: string;
  name: string;
  email: string;
  password?: string;
  age: number;
  gender: string;
  address: string;
  role?: {
    id: string;
    name: string;
  };

  company?: {
    id: string;
    name: string;
  };
  createdBy?: string;
  isDeleted?: boolean;
  deletedAt?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

interface IResponseImport {
  total: number;
  success: number;
  failed: number;
  failedEmails?: any;
}

export interface IJob {
  id?: string;
  name: string;
  skills: ISkill[];
  company?: {
    id: string;
    name: string;
    logo?: string;
  };
  location: string;
  salary: number;
  quantity: number;
  level: string;
  description: string;
  startDate: Date;
  endDate: Date;
  active: boolean;

  createdBy?: string;
  isDeleted?: boolean;
  deletedAt?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IResume {
  id?: string;
  email: string;
  userId: string;
  url: string;
  status: string;
  companyId:
    | string
    | {
        id: string;
        name: string;
        logo: string;
      };
  jobId:
    | string
    | {
        id: string;
        name: string;
      };
  history?: {
    status: string;
    updatedAt: Date;
    updatedBy: { id: string; email: string };
  }[];
  createdBy?: string;
  isDeleted?: boolean;
  deletedAt?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPermission {
  id?: string;
  name?: string;
  apiPath?: string;
  method?: string;
  module?: string;

  createdBy?: string;
  isDeleted?: boolean;
  deletedAt?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IRole {
  id?: string;
  name: string;
  description: string;
  active: boolean;
  permissions: IPermission[] | string[];

  createdBy?: string;
  isDeleted?: boolean;
  deletedAt?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISubscribers {
  id?: string;
  name?: string;
  email?: string;
  skills: string[];
  createdBy?: string;
  isDeleted?: boolean;
  deletedAt?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IDashboardData {
  totalUsers: number;
  totalCompanies: number;
  totalJobs: number;
  totalResumesApproved: number; // Thêm key mới
}
