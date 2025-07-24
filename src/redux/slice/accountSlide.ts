import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  callFetchAccount,
  callUpdateOwnInfo,
  callUpdatePublicStatus,
} from "@/config/api";
import { ICompany, IUser } from "@/types/backend";

// Thunks không thay đổi
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
  // ... thunk này không đổi
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

// GIỮ NGUYÊN interface IState của bạn
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
      permissions?: any[];
    };
  };
  activeMenu: string;
}

// GIỮ NGUYÊN initialState của bạn
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
  // Reducers không thay đổi nhiều
  reducers: {
    // ... các reducers khác giữ nguyên
    setActiveMenu: (state, action) => {
      state.activeMenu = action.payload;
    },
    setUserLoginInfo: (state, action) => {
      // ...
    },
    setLogoutAction: (state) => {
      // ...
    },
    setRefreshTokenAction: (state, action) => {
      // ...
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAccount.pending, (state, action) => {
      state.isAuthenticated = false;
      state.isLoading = true;
    });

    // ✅ THAY ĐỔI CÁCH 1: Xử lý dữ liệu trả về từ API
    builder.addCase(fetchAccount.fulfilled, (state, action) => {
      if (action.payload?.user) {
        const userFromApi = action.payload.user;
        state.isAuthenticated = true;
        state.isLoading = false;

        // "Làm sạch" dữ liệu trước khi gán vào state
        state.user.id = userFromApi.id ?? "";
        state.user.email = userFromApi.email ?? ""; // null -> ""
        state.user.name = userFromApi.name ?? ""; // null -> ""
        state.user.age = userFromApi.age;
        state.user.gender = userFromApi.gender;
        state.user.address = userFromApi.address ?? ""; // null -> ""
        state.user.avatar = userFromApi.avatar;
        state.user.public = userFromApi.public;
        state.user.vip = userFromApi.vip;
        state.user.vipExpiryDate = userFromApi.vipExpiryDate;
        state.user.company = userFromApi.company as ICompany;
        state.user.role = userFromApi.role as any; // Gán role, có thể cần ép kiểu nếu phức tạp
      }
    });

    builder.addCase(fetchAccount.rejected, (state, action) => {
      state.isAuthenticated = false;
      state.isLoading = false;
    });

    builder.addCase(updateOwnInfo.pending, (state) => {
      state.isLoading = true;
    });

    // ✅ THAY ĐỔI CÁCH 2: Xử lý payload cập nhật
    builder.addCase(updateOwnInfo.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        const updatedData = action.payload;
        // Gán từng trường một và kiểm tra null
        // Dùng toán tử ?? để nếu giá trị là null/undefined, nó sẽ lấy giá trị hiện tại
        state.user.name = updatedData.name ?? state.user.name;
        state.user.email = updatedData.email ?? state.user.email;
        state.user.address = updatedData.address ?? state.user.address;
        state.user.age = updatedData.age ?? state.user.age;
        state.user.gender = updatedData.gender ?? state.user.gender;
        // Các trường khác tương tự nếu cần
      }
    });

    builder.addCase(updateOwnInfo.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(updatePublicStatus.fulfilled, (state, action) => {
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
