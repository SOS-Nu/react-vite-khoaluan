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
// BƯỚC 1: Import thêm useEffect
import { useState, useEffect } from "react";
// BƯỚC 2: Import thêm useSearchParams và useLocation để đọc URL
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { callFindJobsByAI } from "@/config/api";
import Typewriter from "typewriter-effect";
import styles from "styles/client.module.scss";

const { Option } = Select;

const SearchClient = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [searchType, setSearchType] = useState("job");
  const [fileList, setFileList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Khởi tạo các hook để đọc URL
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // BƯỚC 3: Thêm useEffect để đồng bộ URL với Form
  useEffect(() => {
    // Lấy chuỗi filter từ URL
    const filter = searchParams.get("filter");

    // Xác định search type dựa trên đường dẫn URL
    if (location.pathname.startsWith("/job")) {
      setSearchType("job");
    } else if (location.pathname.startsWith("/company")) {
      setSearchType("company");
    }

    if (filter) {
      // Dùng regex để trích xuất giá trị từ chuỗi filter
      const nameMatch = filter.match(/name~'([^']*)'/);
      const locationMatch = filter.match(/location~'([^']*)'/);

      const searchQueryValue = nameMatch ? nameMatch[1] : null;
      const locationValue = locationMatch ? locationMatch[1] : null;

      // Dùng setFieldsValue để điền dữ liệu vào form
      form.setFieldsValue({
        searchQuery: searchQueryValue,
        location: locationValue,
      });
    }
  }, [searchParams, form, location.pathname]); // Chạy lại khi URL hoặc path thay đổi

  const onFinish = async (values: any) => {
    setIsLoading(true);

    try {
      const { searchQuery, location } = values;

      if (searchType === "ai") {
        // ... logic AI giữ nguyên
        if (!searchQuery && fileList.length === 0) {
          notification.error({
            message: "Lỗi",
            description: "Vui lòng nhập mô tả kỹ năng hoặc tải lên CV của bạn.",
          });
          return;
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
          const query = `filter=id in (${jobIds.length > 0 ? jobIds.join(",") : "0"})`;
          navigate(`/job?${query}`);
        }
        return;
      }

      let filterParts = [];
      if (searchQuery) {
        filterParts.push(`name~'${searchQuery}'`);
      }
      if (location && location !== "tatca") {
        filterParts.push(`location~'${location}'`);
      }

      if (filterParts.length === 0) {
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
            <Form.Item name="searchQuery" noStyle>
              <Input.TextArea
                placeholder="Nhập mô tả công việc bạn mong muốn, kỹ năng của bạn..."
                rows={1}
                bordered={false}
                autoSize={{ minRows: 1, maxRows: 1 }}
              />
            </Form.Item>
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
                    {" "}
                    Tải lên CV{" "}
                  </Button>
                </Upload>
              )}
            </div>
          </div>
        );
      case "company":
        return (
          <div className="ai-input-wrapper">
            <Form.Item name="searchQuery" noStyle>
              <Input
                placeholder="Nhập tên công ty bạn quan tâm..."
                bordered={false}
              />
            </Form.Item>
          </div>
        );
      case "job":
      default:
        return (
          <div className="ai-input-wrapper">
            <Form.Item name="searchQuery" noStyle>
              <Input
                placeholder="Nhập tên công việc, ví dụ: Java, Frontend, DevOps..."
                bordered={false}
              />
            </Form.Item>
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
        <Form form={form} onFinish={onFinish}>
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
                      {" "}
                      <SearchOutlined /> Tên Job{" "}
                    </Option>
                    <Option value="company">
                      {" "}
                      <ApartmentOutlined /> Công ty{" "}
                    </Option>
                    <Option value="ai">
                      {" "}
                      <FileTextOutlined /> Dùng AI{" "}
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
                      style={{ width: "100%", paddingLeft: "6px" }}
                    />
                  </Form.Item>
                </div>
              </div>
            </Col>
            <Col xs={24} md={3}>
              <Button
                type="primary"
                onClick={() => form.submit()}
                className="search-action-button"
                loading={isLoading}
              >
                Tìm kiếm
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
};

export default SearchClient;
