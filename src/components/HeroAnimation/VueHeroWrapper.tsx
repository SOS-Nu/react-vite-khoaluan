// src/components/HeroAnimation/VueHeroWrapper.tsx
import i18next from "i18next"; // Import instance i18next global của dự án bạn
import I18NextVue from "i18next-vue";
import React, { useEffect, useRef } from "react";
import { App, createApp } from "vue";

import HeroSection from "./HeroSection.vue";

// Import CSS (Giữ nguyên)
import "./HeroDiagram.vue?inline&lang=scss";
import "./HeroSection.vue?inline&lang=scss";
import "./common/SvgNode.vue?inline&lang=scss";
import "./svg-elements/SvgBlueIndicator.vue?inline&lang=scss";
import "./svg-elements/SvgInputs.vue?inline&lang=scss";
import "./svg-elements/SvgOutputs.vue?inline&lang=scss";
import "./svg-elements/SvgPinkIndicator.vue?inline&lang=scss";

export const VueHeroWrapper: React.FC = () => {
  const vueAppRef = useRef<HTMLDivElement | null>(null);
  const vueInstanceRef = useRef<App | null>(null);

  useEffect(() => {
    if (vueAppRef.current && !vueInstanceRef.current) {
      // 1. Tạo app Vue
      const app = createApp(HeroSection);

      // 2. CÀI PLUGIN I18N VÀO VUE
      // Truyền i18next instance từ React vào để dùng chung Resource & Language
      app.use(I18NextVue, { i18next });

      // 3. Mount
      app.mount(vueAppRef.current);
      vueInstanceRef.current = app;
    }

    return () => {
      if (vueInstanceRef.current) {
        vueInstanceRef.current.unmount();
        vueInstanceRef.current = null;
      }
    };
  }, []); // Chỉ chạy 1 lần, không cần dependency vì i18next tự handle event

  return <div ref={vueAppRef} />;
};
