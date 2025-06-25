// src/components/client/panel/JobListPanel.tsx

import React from "react";
import { Pagination } from "antd";
import { IJob } from "@/types/backend";
import JobCard from "@/components/client/card/job.card";

interface IProps {
  jobList: IJob[] | null;
  isLoading: boolean;
  meta: {
    page: number;
    pageSize: number;
    total: number;
  };
  onPageChange: (page: number, pageSize: number) => void;
}

const JobListPanel = (props: IProps) => {
  const { jobList, isLoading, meta, onPageChange } = props;

  return (
    <div className="left-panel-container">
      <div className="left-panel-header">Việc làm liên quan</div>
      <div className="left-panel-body">
        <JobCard jobs={jobList} isLoading={isLoading} isListPage={true} />
      </div>
    </div>
  );
};

// React.memo sẽ ngăn component này re-render nếu props không đổi.
// Vì không còn nhận 'selectedJobId', nó sẽ không re-render khi bạn click job.
export default React.memo(JobListPanel);
