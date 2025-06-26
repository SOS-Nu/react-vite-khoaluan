// src/pages/job/index.tsx

import { useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchJob } from "@/redux/slice/jobSlide";

import SearchClient from "@/components/client/search.client";

import { Pagination } from "antd";
import JobListPanel from "./JobListPanel";
import JobDetailPanel from "./JobDetailPanel";

const ClientJobPage = () => {
  const dispatch = useAppDispatch();
  const {
    result: jobList,
    isFetching: isLoadingList,
    meta,
  } = useAppSelector((state) => state.job);

  const [searchParams, setSearchParams] = useSearchParams();

  const filter = searchParams.get("filter") || "";
  const page = searchParams.get("page") || "1";
  const size = searchParams.get("size") || "10";

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter) {
      params.set("filter", filter);
    }
    params.set("page", page);
    params.set("size", size);
    dispatch(fetchJob({ query: params.toString() }));
  }, [filter, page, size, dispatch]);

  const handleOnchangePage = useCallback(
    (newPage: number, newPageSize: number) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev.toString());
        newParams.set("page", newPage.toString());
        newParams.set("size", newPageSize.toString());
        window.scrollTo({ top: 0, behavior: "smooth" });
        return newParams;
      });
    },
    [setSearchParams]
  );

  return (
    <div className="container job-detail-page-container">
      <SearchClient />

      {/* Cấu trúc 2 cột bình thường */}
      <div className="row g-4">
        {/* CỘT TRÁI: Sẽ cuộn theo trang */}
        <div className="col-12 col-lg-8">
          <JobListPanel isLoading={isLoadingList} jobList={jobList} />
        </div>

        {/* CỘT PHẢI: Sẽ có header cố định bên trong */}
        <div className="col-12 col-lg-4">
          <JobDetailPanel />
        </div>
      </div>

      {/* PAGINATION: Nằm ở cuối cùng, sau khi cuộn hết 2 cột */}
      {!isLoadingList && meta.total > 0 && (
        <div className="bottom-pagination-container">
          <Pagination
            size="default"
            current={meta.page}
            total={meta.total}
            pageSize={meta.pageSize}
            onChange={handleOnchangePage}
            responsive
          />
        </div>
      )}
    </div>
  );
};

export default ClientJobPage;
