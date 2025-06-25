import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { IJob } from "@/types/backend";
import { callFetchJobById } from "@/config/api";
import parse from "html-react-parser";
import { Divider, Skeleton, Tag, Pagination, Empty } from "antd";
import {
  DollarOutlined,
  EnvironmentOutlined,
  HistoryOutlined,
  HomeOutlined,
  TeamOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { getLocationName } from "@/config/utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ApplyModal from "@/components/client/modal/apply.modal";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchJob } from "@/redux/slice/jobSlide";
import JobCard from "@/components/client/card/job.card";
import SearchClient from "@/components/client/search.client";
import { useCurrentApp } from "@/components/context/app.context";

dayjs.extend(relativeTime);

const ClientJobDetailPage = () => {
  const [jobDetail, setJobDetail] = useState<IJob | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { theme } = useCurrentApp();
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
                <div className="job-detail-header">
                  <div className="company-info">
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${jobDetail.company?.logo}`}
                      alt="company logo"
                      className="company-logo"
                    />
                    <div className="job-info">
                      <h1
                        className="header"
                        style={{
                          ...(theme === "dark"
                            ? {
                                background:
                                  "linear-gradient(-45deg, #ff9100 10%, #ff9100 35%, #ff530f 70%, #e62c6d 100%)",
                                WebkitBackgroundClip: "text",
                                backgroundClip: "text",
                                color: "transparent",
                              }
                            : { color: "#000" }),
                          fontWeight: 700,
                          marginBottom: "0.25rem",
                        }}
                      >
                        {jobDetail.name}
                      </h1>
                      <div className="company-name">
                        {jobDetail.company?.name}
                      </div>
                      {/* Thêm thông tin công ty */}
                      {jobDetail.company && (
                        <div className="company-details">
                          <div className="company-address">
                            <HomeOutlined />
                            <span>
                              {" "}
                              {jobDetail.company.address ||
                                "Không có thông tin"}{" "}
                              {getLocationName(jobDetail.location)}
                            </span>
                          </div>
                          <div className="company-scale">
                            <TeamOutlined />
                            <span>
                              {" "}
                              {jobDetail.company.scale || "Không có thông tin"}
                            </span>
                          </div>
                          <div className="company-founding-year">
                            <CalendarOutlined />
                            <span>
                              {" "}
                              {jobDetail.company.foundingYear
                                ? `Thành lập năm ${jobDetail.company.foundingYear}`
                                : "Không có thông tin"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-apply"
                  >
                    Apply Now
                  </button>
                </div>

                <Divider />
                <div className="job-description">
                  <div className="skills">
                    Skill:
                    {""} {""}
                    {jobDetail?.skills?.map((item) => (
                      <Tag key={item.id} color="gold">
                        {item.name}
                      </Tag>
                    ))}
                  </div>
                  <div className="salary">
                    <DollarOutlined />
                    <span>
                       
                      {(jobDetail.salary + "").replace(
                        /\B(?=(\d{3})+(?!\d))/g,
                        ","
                      )}{" "}
                      đ
                    </span>
                  </div>
                  <div className="quantity">
                    <UserOutlined />
                    <span>
                      {" "}
                      {jobDetail.quantity
                        ? `${jobDetail.quantity} vị trí`
                        : "Không có thông tin"}
                    </span>
                  </div>

                  <div>
                    <HistoryOutlined />{" "}
                    {dayjs(jobDetail.updatedAt).locale("vi").fromNow()}
                  </div>
                  <span> {parse(jobDetail.description)}</span>
                </div>
              </>
            )}
          </div>
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
      <ApplyModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        jobDetail={jobDetail}
      />
    </div>
  );
};

export default ClientJobDetailPage;
