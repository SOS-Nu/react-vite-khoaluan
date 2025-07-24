import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  callFetchAccount,
  callUpdateOwnInfo,
  callUpdatePublicStatus,
} from "@/config/api";
import { ICompany, IUser } from "@/types/backend";

// First, create the thunk
export const fetchAccount = createAsyncThunk(
  "account/fetchAccount",
  async () => {
    const response = await callFetchAccount();
    return response.data;
  }
);

export const updateOwnInfo = createAsyncThunk(
  "account/updateOwnInfo",
  async (payload: Partial<IUser>) => {
    const response = await callUpdateOwnInfo(payload);
    return response.data;
  }
);

export const updatePublicStatus = createAsyncThunk(
  "account/updatePublicStatus",
  async (payload: { public: boolean }, { rejectWithValue }) => {
    try {
      await callUpdatePublicStatus(payload.public);
      return payload.public;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

interface IState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isRefreshToken: boolean;
  errorRefreshToken: string;
  user: {
    id: number | string;
    email: string | null; // Đã sửa: cho phép null
    name: string;
    age: number | undefined;
    gender: string | undefined;
    address: string | null | undefined;
    avatar?: string | null;
    public: boolean | undefined;
    vip?: boolean | null;
    vipExpiryDate: string | null;
    company?: ICompany | null;
    role?: {
      id?: string | number;
      name?: string;
      description?: string | undefined;
      active?: boolean;
      createdAt?: string | undefined;
      updatedAt?: string | null | undefined;
      createdBy?: string | undefined;
      updatedBy?: string | null | undefined;
      permissions?:
        | {
            id?: string | number;
            name?: string;
            apiPath?: string;
            method?: string;
            module?: string;
            createdAt?: string | undefined;
            updatedAt?: string | null | undefined;
            createdBy?: string | undefined;
            updatedBy?: string | null | undefined;
          }[]
        | [];
    };
  };
  activeMenu: string;
}

const initialState: IState = {
  isAuthenticated: false,
  isLoading: true,
  isRefreshToken: false,
  errorRefreshToken: "",
  user: {
    id: "",
    email: null, // Đã sửa: giá trị khởi tạo là null
    name: "",
    age: 0,
    gender: "",
    address: "",
    avatar: null,
    public: false,
    vip: false,
    vipExpiryDate: null,
    company: null,
    role: {
      id: "",
      name: "",
      permissions: [],
    },
  },
  activeMenu: "home",
};

export const accountSlide = createSlice({
  name: "account",
  initialState,
  reducers: {
    setActiveMenu: (state, action) => {
      state.activeMenu = action.payload;
    },
    setUserLoginInfo: (state, action) => {
      state.isAuthenticated = true;
      state.isLoading = false;
      state.user.id = action?.payload?.id;
      state.user.email = action.payload.email;
      state.user.name = action.payload.name;
      state.user.age = action.payload.age;
      state.user.gender = action.payload.gender;
      state.user.avatar = action.payload.avatar;
      state.user.address = action.payload.address;
      state.user.public = action.payload.public;
      state.user.vip = action.payload.vip;
      state.user.company = action.payload.company;
      state.user.role = action?.payload?.role;
      if (!action?.payload?.role) state.user.role = { permissions: [] };
      if (state.user.role != null) {
        state.user.role.permissions = action?.payload?.role?.permissions ?? [];
      }
    },
    setLogoutAction: (state) => {
      localStorage.removeItem("access_token");
      state.isAuthenticated = false;
      state.user = {
        id: "",
        email: null, // Đã sửa: reset về null
        name: "",
        age: 0,
        gender: "",
        address: null,
        avatar: null,
        public: false,
        vip: false,
        vipExpiryDate: null,
        company: null,
        role: {
          id: "",
          name: "",
          permissions: [],
        },
      };
    },
    setRefreshTokenAction: (state, action) => {
      state.isRefreshToken = action.payload?.status ?? false;
      state.errorRefreshToken = action.payload?.message ?? "";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAccount.pending, (state, action) => {
      if (action.payload) {
        state.isAuthenticated = false;
        state.isLoading = true;
      }
    });

    builder.addCase(fetchAccount.fulfilled, (state, action) => {
      if (action.payload) {
        state.isAuthenticated = true;
        state.isLoading = false;
        state.user.id = action?.payload?.user?.id;
        state.user.email = action.payload.user?.email;
        state.user.name = action.payload.user?.name;
        state.user.age = action.payload.user?.age;
        state.user.gender = action.payload.user?.gender;
        state.user.address = action.payload.user?.address;
        state.user.avatar = action.payload.user?.avatar;
        state.user.public = action.payload.user?.public;
        state.user.vip = action.payload.user?.vip;
        state.user.vipExpiryDate = action.payload.user?.vipExpiryDate;
        state.user.company = action.payload.user?.company as ICompany;
        state.user.role = action?.payload?.user?.role;
        if (!action?.payload?.user?.role) state.user.role = { permissions: [] };
        if (state.user.role) {
          state.user.role.permissions =
            action?.payload?.user?.role?.permissions ?? [];
        }
      }
    });

    builder.addCase(fetchAccount.rejected, (state, action) => {
      if (action.payload) {
        state.isAuthenticated = false;
        state.isLoading = false;
      }
    });

    builder.addCase(updateOwnInfo.pending, (state, action) => {
      state.isLoading = true;
    });

    // SỬA LỖI Ở ĐÂY
    builder.addCase(updateOwnInfo.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        // Tách `role` và `company` ra khỏi payload để xử lý riêng
        const { role, company, ...rest } = action.payload;

        // Hợp nhất các thuộc tính tương thích (string, number, boolean...)
        Object.assign(state.user, rest);

        // Hợp nhất thông tin `company` nếu có
        if (company) {
          if (!state.user.company) {
            state.user.company = { logo: null }; // Khởi tạo nếu chưa có
          }
          Object.assign(state.user.company, company);
        }

        // Bỏ qua việc cập nhật `role` từ payload này vì nó thiếu chi tiết (permissions)
        // và sẽ gây lỗi kiểu dữ liệu.
      }
    });

    builder.addCase(updateOwnInfo.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(updatePublicStatus.fulfilled, (state, action) => {
      if (state.user) {
        state.user.public = action.payload;
      }
    });
  },
});

export const {
  setActiveMenu,
  setUserLoginInfo,
  setLogoutAction,
  setRefreshTokenAction,
} = accountSlide.actions;

export default accountSlide.reducer;
