import {
  Button,
  Col,
  Form,
  Row,
  Select,
  notification,
  Input,
  Upload,
} from "antd";
import {
  SearchOutlined,
  ApartmentOutlined,
  FileTextOutlined,
  UploadOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { LOCATION_LIST } from "@/config/utils";
import { ProForm } from "@ant-design/pro-components";
// BƯỚC 1: Import thêm useState
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { callFindJobsByAI } from "@/config/api";
import Typewriter from "typewriter-effect";
import styles from "styles/client.module.scss";

const { Option } = Select;

const SearchClient = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [searchType, setSearchType] = useState("job");
  const [fileList, setFileList] = useState<any[]>([]);

  // BƯỚC 2: Tạo state để quản lý trạng thái loading của nút bấm
  const [isLoading, setIsLoading] = useState(false);

  const onFinish = async (values: any) => {
    // Bật loading ngay khi bắt đầu xử lý
    setIsLoading(true);

    try {
      const { searchQuery, location } = values;

      if (searchType === "ai") {
        if (!searchQuery && fileList.length === 0) {
          notification.error({
            message: "Lỗi",
            description: "Vui lòng nhập mô tả kỹ năng hoặc tải lên CV của bạn.",
          });
          return; // Nhớ return để dừng hàm
        }

        const formData = new FormData();
        formData.append(
          "skillsDescription",
          searchQuery ||
            "Tôi muốn tìm việc theo CV mà tôi đã upload lên với kỹ năng của tôi."
        );
        if (fileList.length > 0 && fileList[0].originFileObj) {
          formData.append("file", fileList[0].originFileObj);
        }

        const res = await callFindJobsByAI(formData);
        if (res && res.data && res.data.jobs) {
          const jobIds = res.data.jobs.map((item: any) => item.job.id);
          if (jobIds.length > 0) {
            const query = `filter=id in (${jobIds.join(",")})`;
            navigate(`/job?${query}`);
          } else {
            notification.info({ message: "Không tìm thấy công việc phù hợp." });
            navigate(`/job?filter=id in (0)`);
          }
        }
        return; // Dừng hàm sau khi xử lý xong
      }

      let filterParts = [];
      if (searchQuery) {
        filterParts.push(`name~~'${searchQuery}'`);
      }
      if (location && location !== "tatca") {
        filterParts.push(`location~'${location}'`);
      }

      if (filterParts.length === 0) {
        // Nếu không có query, vẫn điều hướng đến trang job mặc định
        if (searchType === "job") navigate("/job");
        if (searchType === "company") navigate("/company");
        return;
      }

      const query = `filter=${filterParts.join(" and ")}&sort=updatedAt,desc`;

      if (searchType === "job") {
        navigate(`/job?${query}`);
      } else if (searchType === "company") {
        navigate(`/company?${query}`);
      }
    } catch (error) {
      console.error("Search failed:", error);
      notification.error({
        message: "Lỗi",
        description: "Quá trình tìm kiếm đã xảy ra lỗi. Vui lòng thử lại.",
      });
    } finally {
      // Luôn tắt loading sau khi xử lý xong (kể cả khi có lỗi)
      setIsLoading(false);
    }
  };

  // ... (các hàm khác giữ nguyên: handleUploadChange, handleRemoveFile, renderSearchInput)
  const handleUploadChange = ({ fileList }: { fileList: any[] }) => {
    setFileList(fileList.slice(-1));
  };

  const handleRemoveFile = () => {
    setFileList([]);
    return false;
  };

  const renderSearchInput = () => {
    switch (searchType) {
      case "ai":
        return (
          <div className="ai-input-wrapper">
            <ProForm.Item name="searchQuery">
              <Input.TextArea
                placeholder="Nhập mô tả công việc bạn mong muốn, kỹ năng của bạn..."
                rows={1}
                bordered={false}
                autoSize={{ minRows: 1, maxRows: 1 }}
              />
            </ProForm.Item>
            <div className="ai-upload-container">
              {fileList.length > 0 ? (
                <div className="custom-upload-item">
                  <span className="file-name-text" title={fileList[0].name}>
                    {fileList[0].name}
                  </span>
                  <CloseOutlined
                    className="delete-icon"
                    onClick={handleRemoveFile}
                  />
                </div>
              ) : (
                <Upload
                  className="ai-upload-button"
                  fileList={fileList}
                  onChange={handleUploadChange}
                  beforeUpload={() => false}
                  showUploadList={false}
                  maxCount={1}
                >
                  <Button icon={<UploadOutlined />} type="text">
                    Tải lên CV
                  </Button>
                </Upload>
              )}
            </div>
          </div>
        );
      case "company":
        return (
          <div className="ai-input-wrapper">
            <ProForm.Item name="searchQuery">
              <Input
                placeholder="Nhập tên công ty bạn quan tâm..."
                bordered={false}
              />
            </ProForm.Item>
          </div>
        );
      case "job":
      default:
        return (
          <div className="ai-input-wrapper">
            <ProForm.Item name="searchQuery">
              <Input
                placeholder="Nhập tên công việc, ví dụ: Java, Frontend, DevOps..."
                bordered={false}
              />
            </ProForm.Item>
          </div>
        );
    }
  };

  return (
    <div className="search-form-container">
      <div className="search-form-overlay">
        <Row justify="center">
          <Col span={24} style={{ textAlign: "center", marginBottom: "20px" }}>
            <h2 className="typewriter-title">
              <Typewriter
                options={{
                  strings: [
                    "Tìm Việc làm nhanh chóng ",
                    "mới nhất toàn quốc",
                    "Tìm Việc làm Bởi AI",
                  ],
                  autoStart: true,
                  loop: true,
                  deleteSpeed: 120,
                }}
              />
            </h2>
          </Col>
        </Row>
        <ProForm
          form={form}
          // Sửa onFinish để không cần gọi trực tiếp từ button nữa
          onFinish={onFinish}
          submitter={{ render: () => <></> }}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              form.submit();
            }
          }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={17}>
              <div className="search-input-wrapper">
                <Input.Group compact className="custom-input-group">
                  <Select
                    value={searchType}
                    onChange={(value) => setSearchType(value)}
                    className="search-type-select"
                    dropdownClassName="search-type-dropdown"
                  >
                    <Option value="job">
                      <SearchOutlined /> Tên Job
                    </Option>
                    <Option value="company">
                      <ApartmentOutlined /> Công ty
                    </Option>
                    <Option value="ai">
                      <FileTextOutlined /> Dùng AI
                    </Option>
                  </Select>
                  {renderSearchInput()}
                </Input.Group>
              </div>
            </Col>
            <Col xs={24} md={4}>
              <div className="search-input-wrapper">
                <div className="custom-input-group">
                  <Form.Item name="location" noStyle>
                    <Select
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")
                          .includes(
                            input
                              .toLowerCase()
                              .normalize("NFD")
                              .replace(/[\u0300-\u036f]/g, "")
                          )
                      }
                      notFoundContent="Không tìm thấy"
                      allowClear
                      showArrow
                      placeholder="Địa Điểm"
                      optionLabelProp="label"
                      options={LOCATION_LIST}
                      className="location-select-standalone"
                      dropdownClassName="search-type-dropdown"
                      style={{
                        width: "100%",
                        paddingLeft: "6px",
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
            </Col>
            <Col xs={24} md={3}>
              {/* BƯỚC 3: Thêm prop `loading` và `htmlType` cho Button */}
              <Button
                type="primary"
                onClick={() => form.submit()}
                className="search-action-button"
                // Thêm prop loading
                loading={isLoading}
              >
                Tìm kiếm
              </Button>
            </Col>
          </Row>
        </ProForm>
      </div>
    </div>
  );
};

export default SearchClient;
