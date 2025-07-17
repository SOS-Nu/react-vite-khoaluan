// src/redux/slice/jobSlide.ts

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { callFetchJob, callFindJobsByAI } from "@/config/api";
import { IJob } from "@/types/backend";

interface IState {
  isFetching: boolean;
  meta: {
    page: number;
    pageSize: number;
    pages: number;
    total: number;
  };
  result: IJob[];
  // NEW: Thêm cờ để biết đây có phải là kết quả AI không
  isAiSearch: boolean;
}

// Thunk 1: Fetch job thường
export const fetchJob = createAsyncThunk(
  "job/fetchJob",
  async ({ query }: { query: string }) => {
    const response = await callFetchJob(query);
    return response;
  }
);

// FIX: Cập nhật Thunk 2 để nhận page và size
export const findJobsByAI = createAsyncThunk(
  "job/findJobsByAI",
  async ({
    formData,
    page,
    size,
  }: {
    formData: FormData;
    page: number;
    size: number;
  }) => {
    // Truyền page và size vào API call
    const response = await callFindJobsByAI(formData, page, size);
    return response;
  }
);

const initialState: IState = {
  isFetching: false,
  meta: {
    page: 1,
    pageSize: 10,
    pages: 0,
    total: 0,
  },
  result: [],
  isAiSearch: false, // NEW: Giá trị khởi tạo
};

export const jobSlide = createSlice({
  name: "job",
  initialState,
  reducers: {
    clearJobs: (state) => {
      state.isFetching = false;
      state.result = [];
      state.meta = {
        page: 1,
        pageSize: 10,
        pages: 0,
        total: 0,
      };
      state.isAiSearch = false; // NEW: Reset cờ
    },
  },
  extraReducers: (builder) => {
    // Xử lý fetchJob (tìm kiếm thường)
    builder
      .addCase(fetchJob.pending, (state) => {
        state.isFetching = true;
        state.isAiSearch = false; // Đánh dấu đây là search thường
      })
      .addCase(fetchJob.rejected, (state) => {
        state.isFetching = false;
      })
      .addCase(fetchJob.fulfilled, (state, action) => {
        state.isFetching = false;
        if (action.payload && action.payload.data) {
          state.meta = action.payload.data.meta;
          state.result = action.payload.data.result;
        }
      });

    // Xử lý findJobsByAI
    builder
      .addCase(findJobsByAI.pending, (state) => {
        state.isFetching = true;
        state.isAiSearch = true; // NEW: Đánh dấu đây là search AI
      })
      .addCase(findJobsByAI.rejected, (state) => {
        state.isFetching = false;
      })
      .addCase(findJobsByAI.fulfilled, (state, action) => {
        state.isFetching = false;
        if (action.payload && action.payload.data) {
          // FIX: Lấy meta trực tiếp từ API trả về
          state.meta = action.payload.data.meta;

          const aiJobs = action.payload.data.jobs || [];
          state.result = aiJobs.map(
            (item: { score: number; job: IJob }) => item.job
          );
        }
      });
  },
});

export const { clearJobs } = jobSlide.actions;
export default jobSlide.reducer;
