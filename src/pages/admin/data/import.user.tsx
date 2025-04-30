import { App, Modal, Table } from "antd";
import { InboxOutlined } from '@ant-design/icons';
import { Upload } from 'antd';
import type { UploadProps } from 'antd';
import { useState } from "react";
import Exceljs from 'exceljs';
import { Buffer } from 'buffer';
import templateFile from "../../../assets/template/user.xlsx?url";

import { callBulkCreateUserAPI } from "@/config/api";
const { Dragger } = Upload;

interface IProps {
    openModalImport: boolean;
    setOpenModalImport: (v: boolean) => void;
    reloadTable: () => void;
}

interface IDataImport {
    name: string;
    email: string;
    gender: string;
    address: string;
    age: number;
    role: {
        id: number;
    };
    phone: string;
}

const ImportUser = (props: IProps) => {
    const { setOpenModalImport, openModalImport, reloadTable } = props;

    const { message, notification } = App.useApp();
    const [dataImport, setDataImport] = useState<IDataImport[]>([]);
    const [isSubmit, setIsSubmit] = useState<boolean>(false);

    const propsUpload: UploadProps = {
        name: 'file',
        multiple: false,
        maxCount: 1,
        accept: ".csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        customRequest({ file, onSuccess }) {
            setTimeout(() => {
                if (onSuccess) onSuccess("ok");
            }, 1000);
        },
        async onChange(info) {
            const { status } = info.file;
            if (status === 'done') {
                message.success(`${info.file.name} file uploaded successfully.`);
                if (info.fileList && info.fileList.length > 0) {
                    const file = info.fileList[0].originFileObj!;
                    const workbook = new Exceljs.Workbook();
                    const arrayBuffer = await file.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    await workbook.xlsx.load(buffer);

                    let jsonData: IDataImport[] = [];
                    workbook.worksheets.forEach(function (sheet) {
                        let firstRow = sheet.getRow(1);
                        if (!firstRow.cellCount) return;

                        let keys = firstRow.values as any[];
                        sheet.eachRow((row, rowNumber) => {
                            if (rowNumber === 1) return;
                            let values = row.values as any;
                            let obj: any = {};
                            for (let i = 1; i < keys.length; i++) {
                                obj[keys[i]] = values[i];
                            }
                            jsonData.push({
                                name: obj.name || "",
                                email: obj.email || "",
                                gender: obj.gender || "MALE", // Giá trị mặc định nếu không có
                                address: obj.address || "",
                                age: Number(obj.age) || 0,
                                role: { id: Number(obj.role_id) }, // Giả sử role_id là cột trong file Excel
                                phone: obj.phone || "",
                            });
                        });
                    });
                    jsonData = jsonData.map((item, index) => ({
                        ...item,
                        id: index + 1, // Thêm id tạm thời cho Table
                    }));
                    setDataImport(jsonData);
                }
            } else if (status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
    };

    const handleImport = async () => {
        setIsSubmit(true);
        const dataSubmit = dataImport.map(item => ({
            name: item.name,
            email: item.email,
            password: import.meta.env.VITE_USER_CREATE_DEFAULT_PASSWORD || "123456",
            gender: item.gender,
            address: item.address,
            age: item.age,
            role: { id: item.role.id },
        }));
    
        try {
            const res = await callBulkCreateUserAPI(dataSubmit);
            if (res.data) {
                notification.success({
                    message: "Bulk Create Users",
                    description: (
                        <div>
                            <p>Total: {res.data.total}</p>
                            <p>Success: {res.data.success}</p>
                            <p>Failed: {res.data.failed}</p>
                            {res.data.failedEmails && res.data.failedEmails.length > 0 && (
                                <div>
                                    <p>Failed Emails:</p>
                                    <ul>
                                        {res.data.failedEmails.map((email: string, index: number) => (
                                            <li key={index}>{email}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ),
                });
            }
        } catch (error) {
            notification.error({
                message: "Bulk Create Users Failed",
                description: "An error occurred while importing users. Please try again.",
            });
        }
        setIsSubmit(false);
        setOpenModalImport(false);
        setDataImport([]);
        reloadTable();
    };

    return (
        <Modal
            title="Import data user"
            width={"50vw"}
            open={openModalImport}
            onOk={handleImport}
            onCancel={() => {
                setOpenModalImport(false);
                setDataImport([]);
            }}
            okText="Import data"
            okButtonProps={{
                disabled: dataImport.length === 0,
                loading: isSubmit,
            }}
            maskClosable={false}
            destroyOnClose
        >
            <Dragger {...propsUpload}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">
                    Support for a single upload. Only accept .csv, .xls, .xlsx. or
                    <a onClick={e => e.stopPropagation()} href={templateFile} download>
                        Download Sample File
                    </a>
                </p>
            </Dragger>
            <div style={{ paddingTop: 20 }}>
                <Table
                    rowKey="id"
                    title={() => <span>Dữ liệu upload:</span>}
                    dataSource={dataImport}
                    columns={[
                        { dataIndex: 'name', title: 'Tên hiển thị' },
                        { dataIndex: 'email', title: 'Email' },
                        { dataIndex: 'phone', title: 'Số điện thoại' },
                        { dataIndex: 'gender', title: 'Giới tính' },
                        { dataIndex: 'address', title: 'Địa chỉ' },
                        { dataIndex: 'age', title: 'Tuổi' },
                        {
                            dataIndex: 'role',
                            title: 'Vai trò',
                            render: (role: { id: number }) => role.id,
                        },
                    ]}
                />
            </div>
        </Modal>
    );
};

export default ImportUser;