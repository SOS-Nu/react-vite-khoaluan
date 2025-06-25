// src/pages/job/index.tsx

import { useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchJob } from "@/redux/slice/jobSlide";

import SearchClient from "@/components/client/search.client";
import JobListPanel from "./JobListPanel";
import JobDetailPanel from "./JobDetailPanel";
import { Pagination } from "antd";

const ClientJobPage = () => {
  const dispatch = useAppDispatch();
  const {
    result: jobList,
    isFetching: isLoadingList,
    meta,
  } = useAppSelector((state) => state.job);

  const [searchParams, setSearchParams] = useSearchParams();

  // Fetch danh sách job dựa trên URL (trừ param 'id')

  // Lấy ra các giá trị query liên quan đến danh sách.
  // Gán giá trị mặc định để đảm bảo chúng luôn là string và ổn định.
  const filter = searchParams.get("filter") || "";
  const page = searchParams.get("page") || "1";
  const size = searchParams.get("size") || "10";
  // Bạn có thể thêm các param khác như sort, skills,... nếu có

  useEffect(() => {
    // Chỉ xây dựng query từ các biến đã được trích xuất ở trên
    const params = new URLSearchParams();
    if (filter) {
      params.set("filter", filter);
    }
    params.set("page", page);
    params.set("size", size);

    // Ví dụ nếu bạn có sort
    // const sort = searchParams.get('sort') || "updatedAt,desc";
    // params.set('sort', sort);

    dispatch(fetchJob({ query: params.toString() }));

    // Dependency array giờ đây là các giá trị nguyên thủy.
    // useEffect này sẽ KHÔNG chạy lại khi 'id' trên URL thay đổi.
  }, [filter, page, size, dispatch]);

  // Dùng useCallback để ổn định tham chiếu của hàm onPageChange
  const handleOnchangePage = useCallback(
    (newPage: number, newPageSize: number) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev.toString());
        newParams.set("page", newPage.toString());
        newParams.set("size", newPageSize.toString());
        return newParams;
      });
    },
    [setSearchParams]
  );

  return (
    <div className="container job-detail-page-container">
      <SearchClient />
      <div className="row g-4">
        {/* Cột trái */}
        <div className="col-12 col-lg-4">
          <JobListPanel
            isLoading={isLoadingList}
            jobList={jobList}
            meta={meta}
            onPageChange={handleOnchangePage}
          />
        </div>

        {/* Cột phải */}
        <div className="col-12 col-lg-8">
          <JobDetailPanel />
        </div>
      </div>
      {!isLoadingList && meta.total > 0 && (
        <div className="left-panel-pagination">
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
