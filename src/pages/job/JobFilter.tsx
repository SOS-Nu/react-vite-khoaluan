// src/components/client/JobFilter.tsx

import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const LEVELS = ["INTERN", "FRESHER", "JUNIOR", "MIDDLE", "SENIOR"];

interface IFilterData {
  levels: string[];
  salary: { min: string; max: string };
}

interface IProps {
  onFilter: (filterData: IFilterData) => void;
}

const JobFilter = (props: IProps) => {
  const { onFilter } = props;
  const [searchParams] = useSearchParams();

  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [minSalary, setMinSalary] = useState<string>("");
  const [maxSalary, setMaxSalary] = useState<string>("");

  // ===================================================================
  // >>> THAY THẾ TOÀN BỘ useEffect BẰNG KHỐI CODE NÀY <<<
  // Logic parser mới, "thông minh" hơn
  // ===================================================================
  useEffect(() => {
    const filterParam = searchParams.get("filter") || "";

    // 1. Logic đọc Level
    const levelGroupMatch = filterParam.match(/\(([^)]+)\)/); // Tìm chuỗi trong cặp dấu ngoặc (...)
    let currentLevels: string[] = [];
    if (levelGroupMatch && levelGroupMatch[1]) {
      // Nếu có nhóm (a or b), tìm tất cả các giá trị level bên trong nhóm đó
      const levelMatches = levelGroupMatch[1].matchAll(
        /level\s*=\s*'([^']+)'/g
      );
      currentLevels = Array.from(levelMatches, (match) => match[1]);
    } else {
      // Nếu không có nhóm, tìm một giá trị level đơn lẻ
      const singleLevelMatch = filterParam.match(/level\s*=\s*'([^']+)'/);
      if (singleLevelMatch) {
        currentLevels = [singleLevelMatch[1]];
      }
    }
    setSelectedLevels(currentLevels);

    // 2. Logic đọc Salary (giữ nguyên)
    const minSalaryMatch = filterParam.match(/salary\s*>=\s*(\d+)/);
    setMinSalary(minSalaryMatch ? minSalaryMatch[1] : "");

    const maxSalaryMatch = filterParam.match(/salary\s*<=\s*(\d+)/);
    setMaxSalary(maxSalaryMatch ? maxSalaryMatch[1] : "");
  }, [searchParams]);

  const handleLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSelectedLevels((prev) =>
      checked ? [...prev, value] : prev.filter((level) => level !== value)
    );
  };

  const handleApplyFilter = () => {
    onFilter({
      levels: selectedLevels,
      salary: {
        min: minSalary,
        max: maxSalary,
      },
    });
  };

  return (
    // ... JSX return không đổi ...
    <div className="job-filter-container bg-dark p-3 rounded mb-4 border border-secondary">
      <div className="row g-3 align-items-end">
        {/* Level Filter */}
        <div className="col-12 col-md-6">
          <label className="form-label text-white-50">Trình độ (Level)</label>
          <div className="d-flex flex-wrap gap-3">
            {LEVELS.map((level) => (
              <div className="form-check" key={level}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  value={level}
                  id={`level-${level}`}
                  checked={selectedLevels.includes(level)}
                  onChange={handleLevelChange}
                />
                <label
                  className="form-check-label text-white"
                  htmlFor={`level-${level}`}
                >
                  {level}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Salary Filter */}
        <div className="col-12 col-md-4">
          <label className="form-label text-white-50">Mức lương (VND)</label>
          <div className="input-group">
            <input
              type="number"
              className="form-control"
              placeholder="Từ"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
            />
            <span className="input-group-text">-</span>
            <input
              type="number"
              className="form-control"
              placeholder="Đến"
              value={maxSalary}
              onChange={(e) => setMaxSalary(e.target.value)}
            />
          </div>
        </div>

        {/* Apply Button */}
        <div className="col-12 col-md-2">
          <button className="btn btn-primary w-100" onClick={handleApplyFilter}>
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobFilter;
