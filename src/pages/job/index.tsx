import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom"; // << THÊM useNavigate
import { IJob } from "@/types/backend";
import { callFetchJobById } from "@/config/api";
import { Pagination, notification } from "antd";
import { LOCATION_LIST } from "@/config/utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ApplyModal from "@/components/client/modal/apply.modal";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchJob } from "@/redux/slice/jobSlide";
import JobCard from "@/components/client/card/job.card";
import SearchClient from "@/components/client/search.client";
import JobDetailPanel from "./JobDetailPanel";
import JobFilter from "./JobFilter";

dayjs.extend(relativeTime);

const ClientJobDetailPage = () => {
  const [jobDetail, setJobDetail] = useState<IJob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const {
    result: jobList,
    isFetching: isLoadingList,
    meta,
  } = useAppSelector((state) => state.job);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate(); // << KHỞI TẠO NAVIGATE
  const id = searchParams.get("id");

  const listQueryRef = useRef<string>("");
  const isInitialLoad = useRef<boolean>(true); // << THÊM REF ĐỂ KIỂM TRA TẢI LẦN ĐẦU

  const shouldShowJobFilter =
    searchParams.has("filter") ||
    (searchParams.get("search_type") === "ai" && searchParams.get("prompt"));

  // =========================================================================
  // >>> useEffect ĐÃ ĐƯỢC SỬA LỖI HOÀN CHỈNH <<<
  // =========================================================================
  useEffect(() => {
    // SỬA LỖI 1: Xử lý khi F5 trang AI search
    const searchType = searchParams.get("search_type");
    if (searchType === "ai") {
      navigate("/job", { replace: true }); // Chuyển về trang /job mặc định
      return; // Dừng effect tại đây
    }

    // SỬA LỖI 2: Xử lý fetch data cho trang /job và các trang tìm kiếm thường
    const params = new URLSearchParams(searchParams);
    params.delete("id");
    const currentListQuery = params.toString();

    // Điều kiện fetch mới: Tải lần đầu HOẶC query thay đổi
    if (isInitialLoad.current || currentListQuery !== listQueryRef.current) {
      const queryParams = new URLSearchParams(searchParams);
      queryParams.delete("id");

      if (!queryParams.has("filter") && !queryParams.toString()) {
        queryParams.set("sort", "updatedAt,desc");
        queryParams.set("size", "6");
      }
      dispatch(fetchJob({ query: queryParams.toString() }));
      listQueryRef.current = currentListQuery;
      isInitialLoad.current = false; // Đánh dấu đã qua lần tải đầu
    }

    // Logic fetch job detail giữ nguyên
    const fetchJobDetail = async () => {
      if (id) {
        const res = await callFetchJobById(id);
        setJobDetail(res?.data ?? null);
      }
    };

    fetchJobDetail();
  }, [searchParams, dispatch, id, navigate]);

  const handleFilter = async ({
    levels,
    salary,
  }: {
    levels: string[];
    salary: { min: string; max: string };
  }) => {
    const currentFilter = searchParams.get("filter") || "";
    const baseNamePart = currentFilter.match(/(name~'[^']*'|company~'[^']*')/);
    const baseLocationPart = currentFilter.match(/location~'[^']*'/);
    let newFilterParts: string[] = [];
    if (baseNamePart) newFilterParts.push(baseNamePart[0]);
    if (baseLocationPart) newFilterParts.push(baseLocationPart[0]);

    if (salary.min) newFilterParts.push(`salary >= ${salary.min}`);
    if (salary.max) newFilterParts.push(`salary <= ${salary.max}`);
    if (levels.length > 0) {
      const levelConditions = levels.map((l) => `level = '${l}'`).join(" or ");
      newFilterParts.push(`(${levelConditions})`);
    }
    setSearchParams((prev) => {
      prev.set("filter", newFilterParts.join(" and "));
      prev.set("page", "1");
      return prev;
    });
  };

  const handleOnchangePage = (page: number, pageSize: number) => {
    setSearchParams((prev) => {
      prev.set("page", page.toString());
      prev.set("size", pageSize.toString());
      return prev;
    });
  };

  return (
    <div className="container job-detail-page-container">
      <SearchClient />

      {shouldShowJobFilter && <JobFilter onFilter={handleFilter} />}

      <div className="row g-3">
        <div className="col-12 col-lg-4">
          <div className="left-panel-container">
            <div className="left-panel-body">
              <JobCard
                jobs={jobList}
                isLoading={isLoadingList}
                isListPage={true}
                showButtonAllJob={true}
              />
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-8">
          <JobDetailPanel />
        </div>
      </div>
      {searchParams.get("search_type") !== "ai" &&
        !isLoadingList &&
        jobList &&
        jobList.length > 0 &&
        meta.total > meta.pageSize && (
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
      <ApplyModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        jobDetail={jobDetail}
      />
    </div>
  );
};

export default ClientJobDetailPage;
