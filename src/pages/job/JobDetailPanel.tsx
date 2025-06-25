// src/components/client/panel/JobDetailPanel.tsx

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { IJob } from "@/types/backend";
import { callFetchJobById } from "@/config/api";
import parse from "html-react-parser";
import { Divider, Skeleton, Tag, Empty } from "antd";
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
import { useCurrentApp } from "@/components/context/app.context";

dayjs.extend(relativeTime);

const JobDetailPanel = () => {
  const [jobDetail, setJobDetail] = useState<IJob | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { theme } = useCurrentApp();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    const fetchJobDetail = async () => {
      if (id) {
        setIsLoading(true);
        const res = await callFetchJobById(id);
        setJobDetail(res?.data ?? null);
        setIsLoading(false);
      }
    };
    fetchJobDetail();
  }, [id]);

  return (
    <div className="right-panel-container">
      {isLoading ? (
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
                <div className="company-name">{jobDetail.company?.name}</div>
                {/* Thêm thông tin công ty */}
                {jobDetail.company && (
                  <div className="company-details">
                    <div className="company-address">
                      <HomeOutlined />
                      <span>
                        {" "}
                        {jobDetail.company.address || "Không có thông tin"}{" "}
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
            <button onClick={() => setIsModalOpen(true)} className="btn-apply">
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
                 {(jobDetail.salary + "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
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
      <ApplyModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        jobDetail={jobDetail}
      />
    </div>
  );
};

export default JobDetailPanel;
