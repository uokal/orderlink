/* eslint-disable react/jsx-no-target-blank */
import React from "react";
import { useIntl } from "react-intl";
import { SidebarMenuItem } from "./SidebarMenuItem";

const SidebarMenuMain = () => {
  const intl = useIntl();

  return (
    <>
      <SidebarMenuItem
        to="/dashboard"
        icon="element-11"
        title={intl.formatMessage({ id: "MENU.DASHBOARD" })}
        fontIcon="bi-app-indicator"
      />
      <SidebarMenuItem
          to="/data-table"
          title="Data Table"
          hasBullet={true}
        />
      
    </>
  );
};

export { SidebarMenuMain };
