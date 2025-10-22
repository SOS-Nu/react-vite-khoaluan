// src/components/HeroAnimation/VueHeroWrapper.tsx
import React, { useEffect, useRef } from "react";
import { createApp, App } from "vue";

// Import component Vue GỐC (Vite sẽ tự động xử lý)
import HeroSection from "./HeroSection.vue";

// Import CSS/SCSS GỐC từ các file .vue.
// Chúng ta cần import thủ công các file style này
// để React có thể áp dụng chúng lên component Vue.
import "./HeroSection.vue?inline&lang=scss";
import "./HeroDiagram.vue?inline&lang=scss";
import "./common/SvgNode.vue?inline&lang=scss";
import "./svg-elements/SvgInputs.vue?inline&lang=scss";
import "./svg-elements/SvgOutputs.vue?inline&lang=scss";
import "./svg-elements/SvgBlueIndicator.vue?inline&lang=scss";
import "./svg-elements/SvgPinkIndicator.vue?inline&lang=scss";

export const VueHeroWrapper: React.FC = () => {
  const vueAppRef = useRef<HTMLDivElement | null>(null);
  const vueInstanceRef = useRef<App | null>(null);

  useEffect(() => {
    // Chỉ chạy một lần khi component được mount
    if (vueAppRef.current && !vueInstanceRef.current) {
      // Tạo một ứng dụng Vue mới
      const vueApp = createApp(HeroSection);

      // Mount ứng dụng Vue vào div
      vueApp.mount(vueAppRef.current);

      // Lưu lại instance để unmount sau
      vueInstanceRef.current = vueApp;
    }

    // Hàm dọn dẹp: Sẽ chạy khi component React bị unmount
    return () => {
      if (vueInstanceRef.current) {
        vueInstanceRef.current.unmount();
        vueInstanceRef.current = null;
      }
    };
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy 1 lần

  return (
    // Tạo một div để Vue "bám" vào
    <div ref={vueAppRef} />
  );
};
