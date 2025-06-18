// SearchClient.js

import {
  Button,
  Col,
  Form,
  Row,
  Select,
  notification,
  Input,
  Upload,
  Tag,
} from "antd";
import {
  EnvironmentOutlined,
  MonitorOutlined,
  UploadOutlined,
  FileTextOutlined,
  SearchOutlined,
  ApartmentOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { LOCATION_LIST } from "@/config/utils";
import { ProForm } from "@ant-design/pro-components";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { callFindJobsByAI } from "@/config/api"; // Giả sử bạn đã tạo hàm này
import Typewriter from "typewriter-effect";

// Import file SCSS
const { Option } = Select;

const SearchClient = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();

  // State mới để quản lý loại tìm kiếm
  const [searchType, setSearchType] = useState("job"); // 'job', 'company', 'ai'
  const [fileList, setFileList] = useState([]);

  const optionsLocations = LOCATION_LIST;

  const handleRemoveFile = () => {
    setFileList([]);
    return false; // Ngăn chặn hành vi mặc định
  };

  // Hàm xử lý khi tìm kiếm
  const onFinish = async (values: any) => {
    const { searchQuery, location } = values;

    // Xử lý tìm kiếm bằng AI
    if (searchType === "ai") {
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
      if (fileList.length > 0) {
        formData.append("file", fileList[0].originFileObj);
      }

      try {
        // Giả sử bạn có hàm callFindJobsByAI để gọi API
        // const res = await callFindJobsByAI(formData);
        // if (res && res.data) {
        //   // Xử lý kết quả trả về, ví dụ điều hướng đến trang kết quả với dữ liệu
        //   navigate("/ai-results", { state: { jobs: res.data.result } });
        // }
        notification.success({
          message: "Đã gửi yêu cầu tìm kiếm bằng AI",
          description:
            "API endpoint: /api/v1/gemini/find-jobs. Body: FormData chứa skillsDescription và file.",
        });
        console.log("Calling AI API with FormData:", {
          skillsDescription: formData.get("skillsDescription"),
          file: formData.get("file"),
        });
      } catch (error) {
        notification.error({
          message: "Có lỗi xảy ra",
          description: "Không thể thực hiện tìm kiếm bằng AI.",
        });
      }
      return;
    }

    // Xử lý tìm kiếm công việc và công ty
    let query = "";
    if (searchQuery) {
      if (searchType === "job") {
        // API: http://localhost:8080/api/v1/jobs?sort=id,desc&filter=name~~'java'
        query = `filter=name~~'${searchQuery}'&sort=id,desc`;
        navigate(`/job?${query}`);
      }
      if (searchType === "company") {
        // API: http://localhost:8080/api/v1/companies?current=1&pageSize=10&filter=name~'apple'&sort=name,desc
        query = `filter=name~'${searchQuery}'&sort=name,desc`;
        navigate(`/company?${query}`); // Điều hướng đến trang công ty
      }
    } else {
      notification.error({
        message: "Chưa có thông tin",
        description: "Vui lòng nhập từ khóa tìm kiếm",
      });
    }
  };

  const handleUploadChange = ({ fileList }) => {
    // Chỉ cho phép tải lên 1 file
    setFileList(fileList.slice(-1));
  };

  const renderSearchInput = () => {
    switch (searchType) {
      case "ai":
        return (
          // Cấu trúc cho AI (giữ nguyên)
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
                  showUploadList={false} // Tắt danh sách mặc định
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
          // SỬA LỖI: Bọc trong cùng thẻ div với class "ai-input-wrapper"
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
          // SỬA LỖI: Bọc trong cùng thẻ div với class "ai-input-wrapper"
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
          onFinish={onFinish}
          submitter={{ render: () => <></> }}
        >
          <Row gutter={[16, 16]} align="middle">
            {/* 1. Ô tìm kiếm chính (kết hợp) */}
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

            {/* 2. Ô tìm kiếm theo địa điểm */}
            <Col xs={24} md={4}>
              <div className="search-input-wrapper">
                <div className="custom-input-group">
                  <Select
                    showSearch
                    filterOption={(input, option) =>
                      // Logic tìm kiếm: Chuyển cả chuỗi nhập và tên địa điểm về chữ thường, bỏ dấu rồi so sánh
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
                    options={optionsLocations}
                    // 2. Dùng class mới và bỏ các style/class không cần thiết
                    className="location-select-standalone"
                    dropdownClassName="search-type-dropdown"
                    // 3. Giữ lại width 100% để antd hiểu là cần co giãn
                    style={{
                      width: "100%",

                      paddingLeft: "6px",
                    }}
                  />
                </div>
              </div>
            </Col>

            {/* 3. Nút Search */}
            <Col xs={24} md={3}>
              <Button
                type="primary"
                onClick={() => form.submit()}
                className="search-action-button"
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
