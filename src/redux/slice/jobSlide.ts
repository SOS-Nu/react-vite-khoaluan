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
}
// First, create the thunk
export const fetchJob = createAsyncThunk(
  "job/fetchJob",
  async ({ query }: { query: string }) => {
    const response = await callFetchJob(query);
    return response;
  }
);

// Thunk 2: Tìm job bằng AI (sử dụng FormData)
export const findJobsByAI = createAsyncThunk(
  "job/findJobsByAI",
  async ({ formData }: { formData: FormData }) => {
    const response = await callFindJobsByAI(formData);
    // Dữ liệu trả về có cấu trúc { jobs: { score: number, job: IJob }[], meta: {...} }
    return response;
  }
);

const initialState: IState = {
  isFetching: true,
  meta: {
    page: 1,
    pageSize: 10,
    pages: 0,
    total: 0,
  },
  result: [],
};

export const jobSlide = createSlice({
  name: "job",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    setActiveMenu: (state, action) => {
      // state.activeMenu = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(fetchJob.pending, (state, action) => {
      state.isFetching = true;
      // Xóa kết quả cũ khi bắt đầu một yêu cầu mới
      state.result = [];
    });

    builder.addCase(fetchJob.rejected, (state, action) => {
      state.isFetching = false;
      // Add user to the state array
      // state.courseOrder = action.payload;
    });

    builder.addCase(fetchJob.fulfilled, (state, action) => {
      if (action.payload && action.payload.data) {
        state.isFetching = false;
        state.meta = action.payload.data.meta;
        state.result = action.payload.data.result;
      }
      // Add user to the state array

      // state.courseOrder = action.payload;
    });
    // Xử lý cho findJobsByAI
    builder
      .addCase(findJobsByAI.pending, (state, action) => {
        state.isFetching = true;
        // Xóa kết quả cũ khi bắt đầu một yêu cầu mới
        state.result = [];
      })
      .addCase(findJobsByAI.rejected, (state, action) => {
        state.isFetching = false;
      })
      .addCase(findJobsByAI.fulfilled, (state, action) => {
        state.isFetching = false;
        if (action.payload && action.payload.data) {
          // Dữ liệu từ AI API có cấu trúc khác, cần biến đổi
          // state.meta = action.payload.data.meta; // Nếu API AI trả về meta

          // Dữ liệu job nằm trong mảng `jobs`, mỗi phần tử là { score: ..., job: ... }
          // Ta cần trích xuất `job` từ mỗi phần tử.
          const aiJobs = action.payload.data.jobs || [];
          state.result = aiJobs.map(
            (item: { score: number; job: IJob }) => item.job
          );

          // Giả lập meta pagination cho kết quả AI nếu API không trả về
          state.meta = {
            page: 1,
            pageSize: state.result.length,
            pages: 1,
            total: state.result.length,
          };
        }
      });
  },
});

export const { setActiveMenu } = jobSlide.actions;

export default jobSlide.reducer;
