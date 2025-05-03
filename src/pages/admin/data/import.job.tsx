import { App, Modal, Table } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { Upload } from "antd";
import type { UploadProps } from "antd";
import { useState } from "react";
import Exceljs from "exceljs";
import { Buffer } from "buffer";
import Dragger from "antd/lib/upload/Dragger";
<<<<<<< HEAD
import templateFile from "@/assets/template/user.xlsx?url";
import { callBulkCreateUserAPI } from "@/config/api";

interface IProps {
  openModalImport: boolean;
  setOpenModalImport: (v: boolean) => void;
=======
import templateFile from "@/assets/template/job.xlsx?url";
import { callBulkCreateJobAPI, callBulkCreateUserAPI } from "@/config/api";
import { Console } from "console";

interface IProps {
  openModalImportJob: boolean;
  setOpenModalImportJob: (v: boolean) => void;
>>>>>>> fixbug1
  reloadTable: () => void;
}

interface IDataImport {
  name: string;
<<<<<<< HEAD
  email: string;
  gender: string;
  address: string;
  age: number;
  role?: number;
}

const ImportUser = (props: IProps) => {
  const { setOpenModalImport, openModalImport, reloadTable } = props;
  console.log("ImportUser Props:", { openModalImport, reloadTable });

  const { message, notification } = App.useApp();
  const [dataImport, setDataImport] = useState<IDataImport[]>([]);
=======
  location: string;
  salary: string;
  company: { id: string };
  quantity: number;
  level: string;
  description: string;
  startDate: string;
  endDate: string;
  active: boolean;
  skills: {
    id: number;
  }[];
}

interface IDataShow {
  name: string;
  location: string;
  salary: string;
  company: { id: string };
  quantity: number;
  level: string;
  description: string;
  startDate: string;
  endDate: string;
  active: string;
  skills: {
    id: number;
  }[];
}

const ImportJob = (props: IProps) => {
  const { setOpenModalImportJob, openModalImportJob, reloadTable } = props;
  console.log("ImportJob Props:", { openModalImportJob, reloadTable });

  const { message, notification } = App.useApp();
  const [dataImport, setDataImport] = useState<IDataImport[]>([]);
  const [dataShow, setDataShow] = useState<IDataShow[]>([]);

>>>>>>> fixbug1
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  console.log("dataimport", dataImport);

  // Polyfill Buffer
  window.Buffer = window.Buffer || Buffer;

  const propsUpload: UploadProps = {
    name: "file",
    multiple: false,
    maxCount: 1,
    accept:
      ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    customRequest({ file, onSuccess }) {
      setTimeout(() => {
        if (onSuccess) onSuccess("ok");
      }, 1000);
    },
    async onChange(info) {
      const { status } = info.file;
      if (status === "done") {
        message.success(`${info.file.name} file uploaded successfully.`);
        if (info.fileList && info.fileList.length > 0) {
          const file = info.fileList[0].originFileObj!;
          console.log("Uploaded File:", file);

          try {
            const workbook = new Exceljs.Workbook();
            const arrayBuffer = await file.arrayBuffer();
            console.log("ArrayBuffer Size:", arrayBuffer.byteLength);
            const buffer = Buffer.from(arrayBuffer);
            console.log("Buffer Created:", buffer.length);
            await workbook.xlsx.load(buffer);

            console.log(
              "Worksheets:",
              workbook.worksheets.map((sheet) => sheet.name)
            );
            let jsonData: IDataImport[] = [];
            const sheet = workbook.worksheets[0];
            if (!sheet) {
              message.error("No valid worksheet found in the file.");
              console.log("Error: No worksheet found");
              return;
            }

            const firstRow = sheet.getRow(1);
            console.log("First Row Cell Count:", firstRow.cellCount);
            console.log("First Row Values:", firstRow.values);
            if (!firstRow.cellCount || !firstRow.values) {
              message.error("No header row found in the file.");
              return;
            }

            const keys = Array.isArray(firstRow.values)
              ? firstRow.values
                  .slice(1)
                  .map((key) => (key ? key.toString().trim() : ""))
              : [];
            console.log("Header Keys:", keys);
            if (keys.length === 0) {
              message.error("No valid headers found in the file.");
              return;
            }

            let rowCount = 0;
            sheet.eachRow((row, rowNumber) => {
              if (rowNumber === 1) return;
<<<<<<< HEAD
              console.log(`Row ${rowNumber} Values:`, row.values);
=======
>>>>>>> fixbug1
              const values = Array.isArray(row.values)
                ? row.values.slice(1)
                : [];
              const obj: any = {};
              keys.forEach((key, index) => {
<<<<<<< HEAD
                obj[key] = values[index] !== undefined ? values[index] : null;
              });
              console.log(`Row ${rowNumber} Object:`, obj);
              jsonData.push(obj);
              rowCount++;
=======
                if (key === "skills" && values[index]) {
                  // Parse chuỗi skills: "[id 1],[id 2]" thành [{ id: 1 }, { id: 2 }]
                  const skillsStr = values[index].toString(); // Đảm bảo là chuỗi
                  //   console.log("skillsStr", skillsStr.split(","));
                  //   console.log("values[index]", values[index]);

                  const skillIds = skillsStr
                    .split(",") // Tách thành mảng: ["[id 1]", "[id 2]"]
                    .map((idStr: string) => {
                      const idNum = parseInt(
                        idStr.replace(/\[id\s*/, "").replace("]", "")
                      ); // Lấy số: 1, 2
                      return { id: idNum };
                    });
                  obj[key] = skillIds;
                } else {
                  obj[key] = values[index] !== undefined ? values[index] : null;
                }
              });
              jsonData.push(obj);
>>>>>>> fixbug1
            });
            jsonData = jsonData.map((item, index) => {
              return { ...item, id: index + 1 };
            });

<<<<<<< HEAD
            setDataImport(jsonData);
=======
            const dataShow = jsonData.map((item) => ({
              ...item,
              active: item.active === true ? "true" : "false",
            }));
            console.log("dataShow", dataShow);

            setDataImport(jsonData);
            setDataShow(dataShow);
>>>>>>> fixbug1
            console.log("data", jsonData);
          } catch (error) {
            message.error(
              "Failed to parse the file. Please check the file format."
            );
          }
        }
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  const handleImport = async () => {
    setIsSubmit(true);
    const dataSubmit = dataImport.map((item) => ({
      name: item.name,
<<<<<<< HEAD
      email: item.email,
      gender: item.gender,
      address: item.address,
      age: item.age,
      role: { id: item.role },
      password: import.meta.env.VITE_USER_CREATE_DEFAULT_PASSWORD,
    }));
    const res = await callBulkCreateUserAPI(dataSubmit);
=======
      location: item.location,
      salary: item.salary,
      quantity: item.quantity,
      level: item.level,
      description: item.description,
      startDate: item.startDate,
      endDate: item.endDate,
      active: item.active,
      company: { id: item.company },
      skills: item.skills.map((item: { id: number }) => ({ id: item.id })),
      //item là mỗi phần trong mảng skills , trong trường hợp này nó là {"id": 1}
      // Lặp qua từng phần tử trong skills
    }));
    console.log("dataSubmit", dataSubmit);
    const res = await callBulkCreateJobAPI(dataSubmit);
>>>>>>> fixbug1
    if (res?.data) {
      notification.success({
        message: "Bulk Create Users",
        description: `total Users= ${res.data?.total}.||.Success = ${res.data.success}.||.Error = ${res.data.failed}`,
      });
    }
    setIsSubmit(false);
<<<<<<< HEAD
    setOpenModalImport(false);
=======
    setOpenModalImportJob(false);
>>>>>>> fixbug1
    setDataImport([]);
    reloadTable();
  };

  return (
    <Modal
      title="Import data user"
      width={"80vw"}
<<<<<<< HEAD
      open={openModalImport}
      onOk={() => handleImport()}
      onCancel={() => {
        setOpenModalImport(false);
=======
      open={openModalImportJob}
      onOk={() => handleImport()}
      onCancel={() => {
        setOpenModalImportJob(false);
>>>>>>> fixbug1
        setDataImport([]);
      }}
      okText="Import data"
      okButtonProps={{
        disabled: dataImport.length > 0 ? false : true,
        loading: isSubmit,
      }}
      maskClosable={false}
      destroyOnClose={true}
    >
      <Dragger {...propsUpload}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">
          Support for a single upload. Only accept .csv, .xls, .xlsx . or &nbsp;
          <a
<<<<<<< HEAD
            href={templateFile} // Ngăn lan truyền lên cha của Dragger
            download
            onClick={(e) => e.stopPropagation()}
=======
            href={templateFile}
            download
            onClick={(e) => e.stopPropagation()}
            // Ngăn lan truyền lên cha của Dragger
>>>>>>> fixbug1
          >
            Download Sample File
          </a>
        </p>
      </Dragger>

      <div style={{ paddingTop: 20 }}>
        <Table
          rowKey={"id"}
          key={dataImport.length}
          title={() => <span>Dữ liệu upload:</span>}
<<<<<<< HEAD
          dataSource={dataImport}
=======
          dataSource={dataShow}
>>>>>>> fixbug1
          columns={[
            {
              title: "STT",
              key: "stt",
<<<<<<< HEAD
              render: (_, __, index) => index + 1, // Hiển thị số thứ tự (index + 1)
            },
            { dataIndex: "name", title: "Tên hiển thị" },
            { dataIndex: "email", title: "Email" },
            { dataIndex: "gender", title: "Giới tính" },
            { dataIndex: "address", title: "Địa chỉ" },
            { dataIndex: "age", title: "Tuổi" },
            { dataIndex: "role", title: "vai trò" },
=======
              render: (_, __, index) => index + 1,
            },
            { dataIndex: "name", title: "Tên hiển thị" },
            { dataIndex: "location", title: "Địa điểm" },
            { dataIndex: "salary", title: "Lương" },
            { dataIndex: "quantity", title: "Số lượng" },
            { dataIndex: "level", title: "Cấp độ" },
            { dataIndex: "description", title: "Mô tả" },
            { dataIndex: "startDate", title: "Ngày bắt đầu" },
            { dataIndex: "endDate", title: "Ngày kết thúc" },
            { dataIndex: "active", title: "Trạng thái" },
            // {
            //   dataIndex: "company",
            //   title: "Công ty",
            //   render: (company) => company?.id || "N/A",
            // },
            // {
            //   dataIndex: "skills",
            //   title: "Kỹ năng",
            //   render: (skills) =>
            //     skills?.map((skill: { id: number }) => skill.id).join(", ") ||
            //     "N/A",
            // },
>>>>>>> fixbug1
          ]}
        />
      </div>
    </Modal>
  );
};

<<<<<<< HEAD
export default ImportUser;
=======
export default ImportJob;
>>>>>>> fixbug1
