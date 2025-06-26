import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { IJob } from "@/types/backend";
import { callFetchJobById } from "@/config/api";
import parse from "html-react-parser";
import { Divider, Skeleton, Tag, Empty } from "antd";
import {
  DollarOutlined,
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

dayjs.extend(relativeTime);

const JobDetailPanel = () => {
  const [jobDetail, setJobDetail] = useState<IJob | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
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

  // Hàm định dạng lương an toàn
  const formatSalary = (salary: number | undefined | null) => {
    if (salary === null || salary === undefined) {
      return "Thoả thuận";
    }
    return (salary + "").replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " đ";
  };

  return (
    <div className="right-panel-container">
      {isLoading ? (
        // Giữ nguyên Skeleton khi đang tải
        <div className="job-detail-sticky-header">
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      ) : !id || !jobDetail ? (
        // Giữ nguyên Placeholder khi không có job nào được chọn
        <div className="empty-detail-placeholder">
          <Empty description="Chọn một công việc để xem chi tiết" />
        </div>
      ) : (
        // Phần hiển thị chi tiết job đã được làm cho an toàn hơn
        <>
          {/* PHẦN 1: HEADER STICKY */}
          <div className="job-detail-sticky-header">
            <div className="company-info">
              <img
                src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${jobDetail.company?.logo ?? "default-logo.png"}`} // Thêm fallback cho logo
                alt={jobDetail.company?.name ?? "company logo"}
                className="company-logo"
              />
              <div className="job-info">
                {/* Xóa style inline bị lỗi, để CSSจัดการ */}
                <h1 className="header">{jobDetail.name ?? "Tên công việc"}</h1>
                <div className="company-name">
                  {jobDetail.company?.name ?? "Tên công ty"}
                </div>
              </div>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="btn-apply">
              Apply Now
            </button>
            <Divider />
          </div>

          {/* PHẦN 2: NỘI DUNG CUỘN */}
          <div className="job-detail-scrollable-content">
            {/* Sử dụng optional chaining (?.) và nullish coalescing (??) để tránh lỗi */}
            <div className="skills">
              <strong>Kỹ năng:</strong>&nbsp;
              {jobDetail.skills && jobDetail.skills.length > 0
                ? jobDetail.skills.map((item) => (
                    <Tag key={item.id} color="gold">
                      {item.name}
                    </Tag>
                  ))
                : "Chưa yêu cầu"}
            </div>
            <div className="salary">
              <DollarOutlined />
              &nbsp;
              <strong>Lương:</strong>&nbsp;
              <span>{formatSalary(jobDetail.salary)}</span>
            </div>
            <div className="quantity">
              <UserOutlined />
              &nbsp;
              <strong>Số lượng:</strong>&nbsp;
              <span>{jobDetail.quantity ?? "Không giới hạn"}</span>
            </div>
            <div>
              <HistoryOutlined />
              &nbsp; Cập nhật&nbsp;
              {dayjs(jobDetail.updatedAt).locale("vi").fromNow()}
            </div>
            <Divider />

            {/* Thông tin chi tiết công ty */}
            {jobDetail.company && (
              <div className="company-details-bottom">
                <div className="company-address">
                  <HomeOutlined />
                  &nbsp;
                  <span>
                    {jobDetail.company.address ?? "Chưa cập nhật địa chỉ"} -{" "}
                    {getLocationName(jobDetail.location)}
                  </span>
                </div>
                <div className="company-scale">
                  <TeamOutlined />
                  &nbsp;
                  <span>
                    {jobDetail.company.scale ?? "Chưa cập nhật quy mô"}
                  </span>
                </div>
                <div className="company-founding-year">
                  <CalendarOutlined />
                  &nbsp;
                  <span>
                    {jobDetail.company.foundingYear
                      ? `Thành lập năm ${jobDetail.company.foundingYear}`
                      : "Chưa cập nhật năm thành lập"}
                  </span>
                </div>
              </div>
            )}
            <Divider />

            {/* Xử lý an toàn cho `description` trước khi parse */}
            <div className="job-description">
              {parse(jobDetail.description || "<p>Chưa có mô tả chi tiết.</p>")}
            </div>
          </div>
        </>
      )}

      {/* Modal vẫn giữ nguyên, nhưng nó cần có khả năng xử lý jobDetail có thể là null */}
      <ApplyModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        jobDetail={jobDetail}
      />
    </div>
  );
};

export default JobDetailPanel;
