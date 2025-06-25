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

// KHÔNG CÒN IMPORT client.module.scss

dayjs.extend(relativeTime);
<<<<<<< HEAD

const ClientJobPage = () => {
  const [jobDetail, setJobDetail] = useState<IJob | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

=======

const ClientJobDetailPage = () => {
  const [jobDetail, setJobDetail] = useState<IJob | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

>>>>>>> temp-branch
  const dispatch = useAppDispatch();
  const {
    result: jobList,
    isFetching: isLoadingList,
    meta,
  } = useAppSelector((state) => state.job);

  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    const query = searchParams.toString().replace(`id=${id}`, "");
    dispatch(fetchJob({ query: query || "sort=updatedAt,desc&size=10" }));
  }, [searchParams, dispatch]);

  useEffect(() => {
    const fetchJobDetail = async () => {
      if (id) {
        setIsLoadingDetail(true);
        const res = await callFetchJobById(id);
        setJobDetail(res?.data ?? null);
        setIsLoadingDetail(false);
      }
    };
    fetchJobDetail();
  }, [id]);

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
            <div className="left-panel-header">Việc làm liên quan</div>
            <div className="left-panel-body">
              <JobCard
                jobs={jobList}
                isLoading={isLoadingList}
                isListPage={true}
                selectedJobId={id}
              />
            </div>
            {!isLoadingList && meta.total > 0 && (
              <div className="left-panel-pagination">
                <Pagination
                  size="small"
                  current={meta.page}
                  total={meta.total}
                  pageSize={meta.pageSize}
                  onChange={handleOnchangePage}
                  responsive
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Job Detail */}
        <div className="col-12 col-lg-8">
          <div className="right-panel-container">
            {isLoadingDetail ? (
              <Skeleton active paragraph={{ rows: 15 }} />
            ) : !id || !jobDetail ? (
              <div
                style={{
                  display: "flex",
                  minHeight: "300px",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Empty description="Chọn một công việc để xem chi tiết" />
              </div>
            ) : (
              <>
                <h1 className="header">{jobDetail.name}</h1>
                <div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-apply"
                  >
                    Apply Now
                  </button>
                </div>
                <Divider />
                <div className="skills">
                  {jobDetail?.skills?.map((item) => (
                    <Tag key={item.id} color="gold">
                      {item.name}
                    </Tag>
                  ))}
                </div>
                <div className="salary">
                  <DollarOutlined />
                  <span>
                    &nbsp;
                    {(jobDetail.salary + "").replace(
                      /\B(?=(\d{3})+(?!\d))/g,
                      ","
                    )}{" "}
                    đ
                  </span>
                </div>
                <div className="location">
                  <EnvironmentOutlined style={{ color: "#58aaab" }} />
                  &nbsp;{getLocationName(jobDetail.location)}
                </div>
                <div>
                  <HistoryOutlined />{" "}
                  {dayjs(jobDetail.updatedAt).locale("vi").fromNow()}
                </div>
                <Divider />
                <div>{parse(jobDetail.description)}</div>
                <Divider />
                <div className="company-info">
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL}/images/company/${jobDetail.company?.logo}`}
                    alt="company logo"
                    className="company-logo"
                  />
                  <div className="company-name">{jobDetail.company?.name}</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <ApplyModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        jobDetail={jobDetail}
      />
    </div>
  );
};

export default ClientJobDetailPage;
