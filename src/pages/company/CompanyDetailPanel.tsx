import { useEffect, useState } from "react";
import { hrCompany, ICompany } from "@/types/backend";
import { Skeleton, Divider, Tag, Empty } from "antd";
import {
  EnvironmentOutlined,
  HomeOutlined,
  TeamOutlined,
  CalendarOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import parse from "html-react-parser";
import { getLocationName } from "@/config/utils";

// Import file SCSS dùng chung cho các panel chi tiết
import "styles/panel-detail.scss";
import { callFetchCompanyById } from "@/config/api";
import CompanyReviews from "./CompanyReviews";
import { Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks";

interface IProps {
  companyId: string;
}

const CompanyDetailPanel = ({ companyId }: IProps) => {
  const [companyDetail, setCompanyDetail] = useState<ICompany | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const [hrCompany, setHrCompany] = useState<hrCompany | null>(null);

  const isAuthenticated = useAppSelector(
    (state) => state.account.isAuthenticated
  );
  useEffect(() => {
    const fetchCompanyDetail = async () => {
      setIsLoading(true);
      const res = await callFetchCompanyById(companyId);
      setCompanyDetail(res?.data ?? null);
      setHrCompany(res?.data?.hrCompany ?? null);
      setIsLoading(false);
    };

    fetchCompanyDetail();
  }, [companyId]);

  return (
    // Sử dụng class name chung cho panel sticky
    <div className="sticky-panel-container">
      {isLoading ? (
        <div style={{ padding: "1.5rem" }}>
          <Skeleton active paragraph={{ rows: 15 }} />
        </div>
      ) : companyDetail ? (
        <>
          {/* PHẦN HEADER CỐ ĐỊNH - ĐÃ CẬP NHẬT */}
          <div className="panel-header">
            {/* Cột Trái: Logo */}
            <img
              src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${
                companyDetail.logo
              }`}
              alt={`${companyDetail.name} logo`}
              className="company-logo"
            />

            {/* Cột Phải: Toàn bộ thông tin */}
            <div className="company-details-wrapper">
              <div className="company-title">
                <h1 className="name">{companyDetail.name}</h1>
                <div className="location">
                  <HomeOutlined />
                  &nbsp; {companyDetail.address}
                </div>
              </div>

              <div className="company-stats">
                <div className="stat-item">
                  <TeamOutlined />
                  &nbsp; Quy mô: {companyDetail.scale ?? "N/A"}
                </div>
                <div className="stat-item">
                  <CalendarOutlined />
                  &nbsp; Thành lập: {companyDetail.foundingYear ?? "N/A"}
                </div>
                {companyDetail.website && (
                  <div className="stat-item">
                    <GlobalOutlined />
                    &nbsp;{" "}
                    <a
                      href={companyDetail.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Website
                    </a>
                  </div>
                )}
              </div>

              {isAuthenticated ? (
                <Button
                  onClick={() => {
                    if (!hrCompany) return;
                    navigate("/chat/detail", {
                      state: {
                        receiverId: hrCompany.id,
                        // normalize: đảm bảo luôn có company để header dùng
                        receiver: {
                          ...hrCompany,
                          company: {
                            id: companyDetail?.id,
                            name: companyDetail?.name,
                            logoUrl: companyDetail?.logo,
                          },
                        },
                      },
                    });
                  }}
                  variant="primary"
                  className="mt-2"
                >
                  Nhắn tin
                </Button>
              ) : (
                <Button
                  variant="secondary" // Sử dụng variant khác cho trạng thái disabled
                  className="mt-2"
                  disabled={true}
                >
                  Vui lòng đăng nhập để nhắn tin
                </Button>
              )}
            </div>
          </div>

          {/* PHẦN NỘI DUNG CUỘN */}
          <div className="panel-content">
            <div className="content-section">
              <strong>Lĩnh vực:&nbsp;</strong>
              <Tag color="cyan">{companyDetail.field || "Chưa cập nhật"}</Tag>
            </div>
            <div className="content-section">
              <strong>Khu vực:&nbsp;</strong>
              <span>{getLocationName(companyDetail?.location!)}</span>
            </div>
            <Divider />
            <div className="description-html">
              {parse(
                companyDetail.description ??
                  "<p>Công ty chưa cập nhật mô tả chi tiết.</p>"
              )}
            </div>
            {/* === BẮT ĐẦU TÍCH HỢP REVIEW === */}
            <Divider>
              {" "}
              <span className="review-public">Đánh giá từ cộng đồng</span>
            </Divider>

            <CompanyReviews companyId={Number(companyId)} />
            {/* === KẾT THÚC TÍCH HỢP REVIEW === */}
          </div>
        </>
      ) : (
        <div style={{ padding: "1.5rem" }}>
          <Empty description="Không thể tải thông tin công ty." />
        </div>
      )}
    </div>
  );
};

export default CompanyDetailPanel;
