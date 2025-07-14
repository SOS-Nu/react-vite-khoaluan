import { useEffect, useState, useRef } from "react"; // << THÊM IMPORT useRef
import { useSearchParams } from "react-router-dom";
import { IJob } from "@/types/backend";
import { callFetchJobById, callFetchJob } from "@/config/api";
import parse from "html-react-parser";
import { Divider, Skeleton, Tag, Pagination, Empty, notification } from "antd";
import {
  DollarOutlined,
  EnvironmentOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { getLocationName, LOCATION_LIST } from "@/config/utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ApplyModal from "@/components/client/modal/apply.modal";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { findJobsByAI, fetchJob } from "@/redux/slice/jobSlide";
import JobCard from "@/components/client/card/job.card";
import SearchClient from "@/components/client/search.client";
import JobDetailPanel from "./JobDetailPanel";
import JobFilter from "./JobFilter";

dayjs.extend(relativeTime);

const ClientJobDetailPage = () => {
  const [jobDetail, setJobDetail] = useState<IJob | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const {
    result: jobList,
    isFetching: isLoadingList,
    meta,
  } = useAppSelector((state) => state.job);

  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get("id");
  const listQueryRef = useRef<string>(""); // << THÊM REF ĐỂ LƯU QUERY

  const shouldShowJobFilter =
    searchParams.has("filter") ||
    (searchParams.get("search_type") === "ai" && searchParams.get("prompt"));

  // =========================================================================
  // >>> LOGIC useEffect ĐÃ ĐƯỢC SỬA LẠI HOÀN TOÀN <<<
  // =========================================================================
  useEffect(() => {
    const searchType = searchParams.get("search_type");

    // Chỉ fetch danh sách job cho tìm kiếm thường
    if (searchType !== "ai") {
      const params = new URLSearchParams(searchParams);
      params.delete("id"); // Xóa id để không ảnh hưởng đến query của list
      const currentListQuery = params.toString();

      // Chỉ fetch lại danh sách nếu query thay đổi (lọc, phân trang,...)
      // Sẽ không fetch lại khi chỉ click xem chi tiết job khác
      if (currentListQuery !== listQueryRef.current) {
        const queryParams = new URLSearchParams(searchParams);
        queryParams.delete("id");

        if (!queryParams.has("filter")) {
          queryParams.set("sort", "updatedAt,desc");
          queryParams.set("size", "6");
        }
        dispatch(fetchJob({ query: queryParams.toString() }));
        listQueryRef.current = currentListQuery; // Cập nhật query đã dùng
      }
    }

    // Luôn fetch chi tiết job khi có id
    const fetchJobDetail = async () => {
      if (id) {
        setIsLoadingDetail(true);
        const res = await callFetchJobById(id);
        setJobDetail(res?.data ?? null);
        setIsLoadingDetail(false);
      }
    };

    fetchJobDetail();
  }, [searchParams, dispatch, id]);

  const handleFilter = async ({
    levels,
    salary,
  }: {
    levels: string[];
    salary: { min: string; max: string };
  }) => {
    const searchType = searchParams.get("search_type");

    if (searchType === "ai") {
      const originalPrompt = searchParams.get("prompt") || "";
      const locationValue = searchParams.get("location");

      let locationText = "";
      if (locationValue) {
        const locationObject = LOCATION_LIST.find(
          (loc) => loc.value === locationValue
        );
        if (locationObject) locationText = ` ở ${locationObject.label}`;
      }
      let levelText = levels.length > 0 ? ` level: ${levels.join(", ")}` : "";
      let salaryText = "";
      if (salary.min || salary.max) {
        let salaryParts = [];
        if (salary.min) salaryParts.push(`từ ${formatSalary(salary.min)}`);
        if (salary.max) salaryParts.push(`đến ${formatSalary(salary.max)}`);
        salaryText = ` mức lương ${salaryParts.join(" ")}`;
      }
      const promptForAPI = `${originalPrompt}${locationText}${levelText}${salaryText}`;

      const formData = new FormData();
      formData.append("skillsDescription", promptForAPI);
      try {
        await dispatch(findJobsByAI({ formData })).unwrap();
        setSearchParams((prev) => {
          prev.set("search_type", "ai");
          prev.set("prompt", originalPrompt);
          if (locationValue) {
            prev.set("location", locationValue);
          } else {
            prev.delete("location");
          }
          prev.delete("level");
          prev.delete("salary_min");
          prev.delete("salary_max");
          levels.forEach((level) => prev.append("level", level));
          if (salary.min) prev.set("salary_min", salary.min);
          if (salary.max) prev.set("salary_max", salary.max);
          return prev;
        });
      } catch (error) {
        notification.error({
          message: "Lỗi",
          description: "Lọc bằng AI thất bại.",
        });
      }
    } else {
      const currentFilter = searchParams.get("filter") || "";
      const baseNamePart = currentFilter.match(
        /(name~'[^']*'|company~'[^']*')/
      );
      const baseLocationPart = currentFilter.match(/location~'[^']*'/);
      if (!baseNamePart) return;
      let newFilterParts = [baseNamePart[0]];
      if (baseLocationPart) newFilterParts.push(baseLocationPart[0]);
      if (salary.min) newFilterParts.push(`salary >= ${salary.min}`);
      if (salary.max) newFilterParts.push(`salary <= ${salary.max}`);
      if (levels.length > 0) {
        const levelConditions = levels
          .map((l) => `level = '${l}'`)
          .join(" or ");
        newFilterParts.push(`(${levelConditions})`);
      }
      setSearchParams((prev) => {
        prev.set("filter", newFilterParts.join(" and "));
        prev.set("page", "1");
        return prev;
      });
    }
  };

  const formatSalary = (salary: string | number) => {
    return (salary + "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleOnchangePage = (page: number, pageSize: number) => {
    setSearchParams((prev) => {
      prev.set("page", page.toString());
      prev.set("size", pageSize.toString());
      if (id) prev.set("id", id);
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
        meta.total > 0 && (
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
