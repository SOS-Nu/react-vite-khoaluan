import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  callFetchJob,
  callFetchJobsByCompany,
  // Giả sử bạn đã có 2 hàm gọi API mới này
  callInitiateSearchByAI,
  callGetAiSearchResults,
} from "@/config/api";
import { IJob, IUser, IJobWithScore } from "@/types/backend"; // Thêm IJobWithScore nếu cần

interface IState {
  isFetching: boolean;
  meta: {
    page: number;
    pageSize: number;
    pages: number;
    total: number;
    // Thêm các trường từ backend nếu có, ví dụ:
    hasMore?: boolean;
  };
  result: IJob[];
  isAiSearch: boolean;
  searchId: string | null; // << THÊM STATE MỚI CHO AI SEARCH
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
  }
);

// ===================================================================
// CÁC THUNK MỚI CHO TÌM KIẾM AI 2 BƯỚC
// ===================================================================

// Thunk Bước 1: Khởi tạo tìm kiếm
export const initiateAiSearch = createAsyncThunk(
  "job/initiateAiSearch",
  async ({
    formData,
    page,
    size,
  }: {
    formData: FormData;
    page: number;
    size: number;
  }) => {
    const response = await callInitiateSearchByAI(formData, page, size);
    return response.data; // Trả về { jobs, meta, searchId }
  }
);

// Thunk Bước 2: Lấy các trang tiếp theo
export const fetchMoreAiResults = createAsyncThunk(
  "job/fetchMoreAiResults",
  async ({
    searchId,
    page,
    size,
  }: {
    searchId: string;
    page: number;
    size: number;
  }) => {
    const response = await callGetAiSearchResults(searchId, page, size);
    return response.data; // Trả về { jobs, meta }
  }
);

const initialState: IState = {
  isFetching: false,
  meta: { page: 1, pageSize: 10, pages: 0, total: 0 },
  result: [],
  isAiSearch: false,
  searchId: null, // << GIÁ TRỊ BAN ĐẦU
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

    // ===================================================================
    // LOGIC REDUCER MỚI CHỈ DÀNH CHO TÌM KIẾM AI
    // ===================================================================
    builder
      .addCase(initiateAiSearch.pending, (state) => {
        state.isFetching = true;
        state.isAiSearch = true;
      })
      .addCase(initiateAiSearch.rejected, (state) => {
        state.isFetching = false;
        state.searchId = null;
      })
      .addCase(initiateAiSearch.fulfilled, (state, action) => {
        state.isFetching = false;
        if (action.payload) {
          state.meta = action.payload.meta;
          state.searchId = action.payload.searchId;
          // Tuân thủ logic gốc: chỉ lưu IJob vào state.result
          const aiJobs = action.payload.jobs || [];
          state.result = aiJobs.map(
            (item: { score: number; job: IJob }) => item.job
          );
        }
      });

    builder
      .addCase(fetchMoreAiResults.pending, (state) => {
        state.isFetching = true;
        state.isAiSearch = true;
      })
      .addCase(fetchMoreAiResults.rejected, (state) => {
        state.isFetching = false;
      })
      .addCase(fetchMoreAiResults.fulfilled, (state, action) => {
        state.isFetching = false;
        if (action.payload) {
          state.meta = action.payload.meta;
          // Tương tự, chỉ lưu IJob vào state.result
          const aiJobs = action.payload.jobs || [];
          state.result = aiJobs.map(
            (item: { score: number; job: IJob }) => item.job
          );
        }
      });
  },
});

export const { clearJobs } = jobSlide.actions;
export default jobSlide.reducer;
