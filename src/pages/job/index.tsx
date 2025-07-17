import { useEffect, useState, useRef } from "react"; // Đã có sẵn useRef
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { IJob } from "@/types/backend";
import { callFetchJobById } from "@/config/api";
import { Pagination } from "antd";
import { LOCATION_LIST } from "@/config/utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ApplyModal from "@/components/client/modal/apply.modal";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchJob, findJobsByAI } from "@/redux/slice/jobSlide";
import JobCard from "@/components/client/card/job.card";
import SearchClient from "@/components/client/search.client";
import JobDetailPanel from "./JobDetailPanel";
import JobFilter from "./JobFilter";

dayjs.extend(relativeTime);

const ClientJobDetailPage = () => {
  const [jobDetail, setJobDetail] = useState<IJob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentSearchType, setCurrentSearchType] = useState<string>("job");

  // >> BƯỚC 1: TẠO REF
  const jobListRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    result: jobList,
    isFetching: isLoadingList,
    meta,
  } = useAppSelector((state) => state.job);

  const [searchParams, setSearchParams] = useSearchParams();
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
      const params = new URLSearchParams(searchParams);
      const searchType = params.get("search_type");

      if (searchType === "ai") {
        const prompt = params.get("prompt");
        const loc = params.get("location");
        const page = parseInt(params.get("page") || "1", 10);
        const size = parseInt(params.get("size") || "2", 10);

        if (prompt) {
          let fullPrompt = prompt;
          if (loc && loc !== "tatca") {
            const locObj = LOCATION_LIST.find((l) => l.value === loc);
            if (locObj) fullPrompt += ` ở ${locObj.label}`;
          }

          const formData = new FormData();
          formData.append("skillsDescription", fullPrompt);

          if (location.state?.file) {
            formData.append("file", location.state.file);
            navigate(location.pathname + location.search, {
              state: {},
              replace: true,
            });
          }
          dispatch(findJobsByAI({ formData, page, size }));
        }
      } else {
        const queryParams = new URLSearchParams(searchParams);
        queryParams.delete("id");
        queryParams.delete("search_type");

        if (!queryParams.has("filter") && !queryParams.toString()) {
          queryParams.set("sort", "updatedAt,desc");
          queryParams.set("size", "2");
        }
        dispatch(fetchJob({ query: queryParams.toString() }));
      }
    }

    if (currentId !== prevId.current) {
      if (currentId) {
        const fetchJobDetail = async () => {
          const res = await callFetchJobById(currentId);
          setJobDetail(res?.data ?? null);
        };
        fetchJobDetail();
      } else {
        setJobDetail(null);
      }
    }

    prevListQueryKey.current = currentListQueryKey;
    prevId.current = currentId;
  }, [searchParams, dispatch, location, navigate]);

  // >> BƯỚC 2: CẬP NHẬT HÀM CHUYỂN TRANG
  const handleOnchangePage = (page: number, pageSize: number) => {
    setSearchParams((prev) => {
      prev.set("page", page.toString());
      prev.set("size", pageSize.toString());
      return prev;
    });

    // Thêm hành động cuộn trang
    if (jobListRef.current) {
      const yOffset = -50; // Khoảng đệm 10px phía trên
      const elementPosition = jobListRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY + yOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const handleFilter = async ({
    levels,
    salary,
  }: {
    levels: string[];
    salary: { min: string; max: string };
  }) => {
    const currentFilter = searchParams.get("filter") || "";
    let newFilterParts: string[] = [];

    const baseNamePart = currentFilter.match(/name~'[^']*'/);
    if (baseNamePart) {
      newFilterParts.push(baseNamePart[0]);
    }

    const baseLocationPart = currentFilter.match(/location~'[^']*'/);
    if (baseLocationPart) {
      newFilterParts.push(baseLocationPart[0]);
    }

    if (salary.min) newFilterParts.push(`salary>=${salary.min}`);
    if (salary.max) newFilterParts.push(`salary<=${salary.max}`);
    if (levels.length > 0) {
      const levelConditions = levels.map((l) => `level='${l}'`).join(" or ");
      newFilterParts.push(
        levels.length > 1 ? `(${levelConditions})` : levelConditions
      );
    }

    setSearchParams((prev) => {
      if (newFilterParts.length > 0) {
        prev.set("filter", newFilterParts.join(" and "));
      } else {
        prev.delete("filter");
      }
      prev.set("page", "1");
      return prev;
    });
  };

  const shouldShowPagination =
    !isLoadingList &&
    jobList &&
    jobList.length > 0 &&
    meta.total > meta.pageSize;

  return (
    <div className="container job-detail-page-container">
      <SearchClient
        searchType={currentSearchType}
        onSearchTypeChange={setCurrentSearchType}
      />

      {(currentSearchType === "job" || currentSearchType === "company") &&
        searchParams.has("filter") && <JobFilter onFilter={handleFilter} />}

      {/* >> BƯỚC 3: GẮN REF VÀO ELEMENT MONG MUỐN */}
      <div className="row g-3" ref={jobListRef}>
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

      {shouldShowPagination && (
        <div className="bottom-pagination-container">
          <Pagination
            size="default"
            current={meta.page}
            total={meta.total}
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

export default ClientJobDetailPage;
