import { useEffect, useState, useRef } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { IJob, IUser } from "@/types/backend";
import { callFetchJobById } from "@/config/api";
import { Pagination } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ApplyModal from "@/components/client/modal/apply.modal";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchJob,
  initiateAiSearch,
  fetchMoreAiResults,
} from "@/redux/slice/jobSlide";
import JobCard from "@/components/client/card/job.card";
import SearchClient from "@/components/client/search.client";
import JobDetailPanel from "./JobDetailPanel";
import JobFilter from "./JobFilter";

dayjs.extend(relativeTime);

const ClientJobPage = () => {
  const [jobDetail, setJobDetail] = useState<IJob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentSearchType, setCurrentSearchType] = useState<string>("job");

  const jobListRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    result: regularJobList,
    aiResult: aiJobList,
    isFetching: isLoadingList,
    meta,
    searchId,
    isAiSearch,
  } = useAppSelector((state) => state.job);

  const user = useAppSelector((state) => state.account.user) as IUser;

  const prevListQueryKey = useRef<string>();
  const prevId = useRef<string | null>();

  useEffect(() => {
    const listQuery = new URLSearchParams(searchParams);
    listQuery.delete("id");
    const currentListQueryKey = listQuery.toString();
    const currentId = searchParams.get("id");

    const searchTypeFromUrl = searchParams.get("search_type");
    if (searchTypeFromUrl === "ai") {
      setCurrentSearchType("ai");
    } else {
      if (location.pathname.startsWith("/company")) {
        setCurrentSearchType("company");
      } else {
        setCurrentSearchType("job");
      }
    }

    if (currentListQueryKey !== prevListQueryKey.current) {
      const page = parseInt(searchParams.get("page") || "1", 10);
      const size = parseInt(searchParams.get("size") || "10", 10);

      if (searchTypeFromUrl === "ai") {
        const prompt = searchParams.get("prompt");
        const isNewSearch = location.state?.file || (page === 1 && !searchId);

        if (isNewSearch && (prompt || location.state?.file)) {
          const formData = new FormData();
          formData.append("skillsDescription", prompt || "Phù hợp với CV");
          if (location.state?.file) {
            formData.append("file", location.state.file);
            navigate(location.pathname + location.search, {
              replace: true,
              state: {},
            });
          }
          dispatch(initiateAiSearch({ formData, page, size }));
        } else if (searchId) {
          dispatch(fetchMoreAiResults({ searchId, page, size }));
        }
      } else {
        const queryParams = new URLSearchParams(searchParams);
        queryParams.delete("id");
        queryParams.delete("search_type");
        dispatch(fetchJob({ query: queryParams.toString(), user }));
      }
    }

    if (currentId !== prevId.current) {
      if (currentId) {
        callFetchJobById(currentId).then((res) =>
          setJobDetail(res?.data?.data ?? null)
        );
      } else {
        setJobDetail(null);
      }
    }

    prevListQueryKey.current = currentListQueryKey;
    prevId.current = currentId;
  }, [searchParams, dispatch, location, navigate, searchId, user]);

  const handleOnchangePage = (page: number, pageSize: number) => {
    setSearchParams((prev) => {
      prev.set("page", page.toString());
      prev.set("size", pageSize.toString());
      return prev;
    });
    if (jobListRef.current) {
      const yOffset = -50;
      const elementPosition = jobListRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY + yOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  // ===================================================================
  // >>> SỬA LỖI TẠI ĐÂY: KHÔI PHỤC LẠI LOGIC CHO handleFilter <<<
  // ===================================================================
  const handleFilter = async ({
    levels,
    salary,
    sortSalary,
    sortTime, // Thêm tham số sortTime
  }: {
    levels: string[];
    salary: { min: string; max: string };
    sortSalary: string;
    sortTime: string;
  }) => {
    const currentFilter = searchParams.get("filter") || "";
    let newFilterParts: string[] = [];

    // Giữ lại các filter cơ bản (name, location) không đổi
    const baseNamePart = currentFilter.match(/name\s*~\s*'[^']*'/);
    if (baseNamePart) {
      newFilterParts.push(baseNamePart[0]);
    }
    const baseLocationPart = currentFilter.match(/location\s*~\s*'[^']*'/);
    if (baseLocationPart) {
      newFilterParts.push(baseLocationPart[0]);
    }

    // Thêm filter lương và level không đổi
    if (salary.min) newFilterParts.push(`salary >= ${salary.min}`);
    if (salary.max) newFilterParts.push(`salary <= ${salary.max}`);

    if (levels.length > 0) {
      const levelConditions = levels.map((l) => `level = '${l}'`).join(" or ");
      newFilterParts.push(
        levels.length === 1 ? levelConditions : `(${levelConditions})`
      );
    }

    setSearchParams((prev) => {
      if (newFilterParts.length > 0) {
        prev.set("filter", newFilterParts.join(" and "));
      } else {
        prev.delete("filter");
      }

      // >>> LOGIC MỚI: Ưu tiên sort lương, nếu không thì dùng sort thời gian <<<
      if (sortSalary) {
        // Nếu có chọn sắp xếp lương
        prev.set("sort", sortSalary === "asc" ? "salary" : "salary,desc");
      } else {
        // Nếu không, dùng sắp xếp thời gian (mặc định là mới nhất)
        prev.set(
          "sort",
          sortTime === "oldest" ? "updatedAt,asc" : "updatedAt,desc"
        );
      }

      prev.set("page", "1"); // Reset về trang 1
      return prev;
    });
  };

  const finalJobList = isAiSearch
    ? (aiJobList || []).map((item) => ({ ...item.job, _score: item.score }))
    : regularJobList || [];

  const paginationTotal = () => {
    // @ts-ignore
    if (isAiSearch && meta.hasMore) return meta.total + meta.pageSize;
    return meta.total;
  };

  const shouldShowPagination =
    !isLoadingList && finalJobList.length > 0 && meta.total > 0;

  return (
    <div className="container job-detail-page-container">
      <SearchClient
        searchType={currentSearchType}
        onSearchTypeChange={setCurrentSearchType}
      />

      {/* Điều kiện này đã được sửa lại cho đúng ở các bước trước */}
      {(currentSearchType === "job" || currentSearchType === "company") &&
        searchParams.has("filter") && <JobFilter onFilter={handleFilter} />}

      <div className="row g-3" ref={jobListRef}>
        <div className="col-12 col-lg-4">
          <div className="left-panel-container">
            <div className="left-panel-body">
              <JobCard
                jobs={finalJobList}
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

      {shouldShowPagination && (
        <div className="bottom-pagination-container">
          <Pagination
            size="default"
            current={meta.page}
            total={paginationTotal()}
            pageSize={meta.pageSize}
            onChange={handleOnchangePage}
            responsive
            showSizeChanger
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

export default ClientJobPage;
