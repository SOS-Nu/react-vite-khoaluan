import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  callFetchAccount,
  callUpdateOwnInfo,
  callUpdatePublicStatus,
} from "@/config/api";
import {
  ICompany,
  IOnlineResume,
  IUser,
  IWorkExperience,
} from "@/types/backend";

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
      // Trả về trạng thái đã gửi đi để cập nhật state trong reducer
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
    email: string;
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
    email: "",
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
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
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
      state.user.avatar = action.payload.avatar;
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
        email: "",
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
    // Add reducers for additional action types here, and handle loading state as needed
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
        state.user.company = action.payload.user?.company;
        state.user.role = action?.payload?.user?.role;
        if (!action?.payload?.user?.role) state.user.role = { permissions: [] };
        state.user.role.permissions =
          action?.payload?.user?.role?.permissions ?? [];
      }
    });

    builder.addCase(fetchAccount.rejected, (state, action) => {
      if (action.payload) {
        state.isAuthenticated = false;
        state.isLoading = false;
      }
    });
    // Add these cases to the builder to handle the new thunk
    builder.addCase(updateOwnInfo.pending, (state, action) => {
      // You can set a specific loading state for the update if needed
      state.isLoading = true;
    });

    builder.addCase(updateOwnInfo.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        // Merge the updated fields into the existing user state
        // The spread operator ensures we only overwrite the changed fields
        state.user = { ...state.user, ...action.payload };
      }
    });

    builder.addCase(updateOwnInfo.rejected, (state, action) => {
      state.isLoading = false;
      // You can handle errors here, for example by setting an error message in the state
    });
    // ADDED: Xử lý cho thunk updatePublicStatus
    builder.addCase(updatePublicStatus.fulfilled, (state, action) => {
      // Cập nhật trạng thái public của user với giá trị từ payload
      state.user.public = action.payload;
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
