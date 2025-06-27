import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { IJob } from "@/types/backend";
import { callFetchJobById } from "@/config/api";
import parse from "html-react-parser";
import { Divider, Skeleton, Tag, Pagination, Empty } from "antd";
import {
  DollarOutlined,
  EnvironmentOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { getLocationName } from "@/config/utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ApplyModal from "@/components/client/modal/apply.modal";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchJob } from "@/redux/slice/jobSlide";
import JobCard from "@/components/client/card/job.card";
import SearchClient from "@/components/client/search.client";
import JobDetailPanel from "./JobDetailPanel";

// KHÔNG CÒN IMPORT client.module.scss

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

  useEffect(() => {
    const searchType = searchParams.get("search_type");

    // Chỉ tìm nạp nếu đó không phải là kết quả của tìm kiếm AI
    // Trạng thái Redux (`jobList`) đã được điền bởi dispatch `findJobsByAI`
    if (searchType !== "ai") {
      const params = new URLSearchParams(searchParams);
      params.delete("id");

      if (!params.has("filter")) {
        params.set("sort", "updatedAt,desc");
        params.set("size", "6");
      }
      dispatch(fetchJob({ query: params.toString() }));
    }

    // Logic để tìm nạp chi tiết công việc không thay đổi
    const fetchJobDetail = async () => {
      if (id) {
        setIsLoadingDetail(true);
        const res = await callFetchJobById(id);
        setJobDetail(res?.data ?? null);
        setIsLoadingDetail(false);
      }
    };
    fetchJobDetail();
  }, [searchParams, dispatch, id]); // Thêm `id` vào mảng phụ thuộc

  const handleOnchangePage = (page: number, pageSize: number) => {
    setSearchParams((prev) => {
      prev.set("page", page.toString());
      prev.set("size", pageSize.toString());
      if (id) {
        prev.set("id", id);
      }
      return prev;
    });
  };

  return (
    // SỬ DỤNG CLASS NAME DẠNG CHUỖI BÌNH THƯỜNG

    <div className="container job-detail-page-container">
      <SearchClient />
      <div className="row g-4">
        {/* Left Column: Job List */}
        <div className="col-12 col-lg-4">
          <div className="left-panel-container">
            <div className="left-panel-body">
              <JobCard
                jobs={jobList}
                isLoading={isLoadingList}
                isListPage={true}
                selectedJobId={id}
                showButtonAllJob={true}
              />
            </div>
          </div>
        </div>
        {/* Right Column: Job Detail */}

        <div className="col-12 col-lg-8">
          <JobDetailPanel />
        </div>
      </div>
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
      <ApplyModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        jobDetail={jobDetail}
      />
    </div>
  );
};

export default ClientJobDetailPage;
