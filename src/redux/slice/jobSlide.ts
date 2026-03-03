import { callFetchJob, callFetchJobsByCompany } from "@/config/api";
import { IJob, IJobWithScore, IUser } from "@/types/backend"; // Thêm IJobWithScore nếu cần
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface IState {
  isFetching: boolean;
  meta: {
    page: number;
    pageSize: number;
    pages: number;
    total: number;
    hasMore?: boolean;
  };
  result?: IJob[];
  isAiSearch?: boolean;
  aiResult?: IJobWithScore[];

  searchId: string | null;
}

// ===================================================================
// THUNK TÌM KIẾM THƯỜNG (KHÔNG THAY ĐỔI)
// ===================================================================
export const fetchJob = createAsyncThunk(
  "job/fetchJob",
  async ({ query, user }: { query: string; user: IUser | null }) => {
    if (user?.company?.id) {
      const response = await callFetchJobsByCompany(user.company.id, query);
      return response.data; // Trả về data để reducer xử lý
    } else {
      const response = await callFetchJob(query);
      return response.data; // Trả về data để reducer xử lý
    }
  },
);

// ===================================================================
// CÁC THUNK MỚI CHO TÌM KIẾM AI 2 BƯỚC
// ===================================================================

const initialState: IState = {
  isFetching: false,
  meta: { page: 1, pageSize: 10, pages: 0, total: 0 },
  result: [],
  isAiSearch: false,
  searchId: null, // << GIÁ TRỊ BAN ĐẦU
  aiResult: [], // <<< KHỞI TẠO GIÁ TRỊ BAN ĐẦU
};

export const jobSlide = createSlice({
  name: "job",
  initialState,
  reducers: {
    clearJobs: (state) => {
      state.isFetching = false;
      state.result = [];
      state.meta = { page: 1, pageSize: 10, pages: 0, total: 0 };
      state.isAiSearch = false;
      state.searchId = null; // << THÊM RESET searchId
    },
  },
  extraReducers: (builder) => {
    // ===================================================================
    // LOGIC REDUCER CHO TÌM KIẾM THƯỜNG (KHÔNG THAY ĐỔI)
    // ===================================================================
    builder
      .addCase(fetchJob.pending, (state) => {
        state.isFetching = true;
        state.isAiSearch = false;
      })
      .addCase(fetchJob.rejected, (state) => {
        state.isFetching = false;
      })
      .addCase(fetchJob.fulfilled, (state, action) => {
        state.isFetching = false;
        if (action.payload) {
          // action.payload giờ là data từ response
          state.meta = action.payload.meta;
          state.result = action.payload.result;
        }
      });
  },
});

export const { clearJobs } = jobSlide.actions;
export default jobSlide.reducer;
