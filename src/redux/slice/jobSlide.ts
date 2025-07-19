// src/redux/slice/jobSlide.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  callFetchJob,
  callFetchJobsByCompany,
  callFindJobsByAI,
} from "@/config/api";
import { IJob, IUser } from "@/types/backend";

interface IState {
  isFetching: boolean;
  meta: {
    page: number;
    pageSize: number;
    pages: number;
    total: number;
  };
  result: IJob[];
  isAiSearch: boolean;
}

// Thunk 1: Fetch job with role-based logic
export const fetchJob = createAsyncThunk(
  "job/fetchJob",
  async ({ query, user }: { query: string; user: IUser }) => {
    if (user.company?.id) {
      const response = await callFetchJobsByCompany(user.company.id, query);
      return response;
    } else {
      const response = await callFetchJob(query);
      return response;
    }
  }
);

// Thunk 2: Find jobs by AI
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
  isAiSearch: false,
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
      state.isAiSearch = false;
    },
  },
  extraReducers: (builder) => {
    // Handling fetchJob
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
        if (action.payload && action.payload.data) {
          state.meta = action.payload.data.meta;
          state.result = action.payload.data.result;
        }
      });

    // Handling findJobsByAI
    builder
      .addCase(findJobsByAI.pending, (state) => {
        state.isFetching = true;
        state.isAiSearch = true;
      })
      .addCase(findJobsByAI.rejected, (state) => {
        state.isFetching = false;
      })
      .addCase(findJobsByAI.fulfilled, (state, action) => {
        state.isFetching = false;
        if (action.payload && action.payload.data) {
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
