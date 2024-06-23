"use client";

import { Avatar } from "@/components/catalyst/avatar";
import {
  Navbar,
  NavbarSection,
  NavbarSpacer,
} from "@/components/catalyst/navbar";
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from "@/components/catalyst/sidebar";
import { SidebarLayout } from "@/components/catalyst/sidebar-layout";
import {
  ArrowTrendingUpIcon,
  HomeIcon,
  Square2StackIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/20/solid";
import { usePathname } from "next/navigation";

import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

export function ApplicationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSpacer />
          <NavbarSection>
            <DynamicWidget />
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <Avatar src="/logo.svg" className="size-7 ml-1" />
          </SidebarHeader>

          <SidebarBody>
            <SidebarSection>
              <SidebarItem href="/" current={pathname === "/"}>
                <HomeIcon />
                <SidebarLabel>Dashboard</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                href="/dapps"
                current={pathname.startsWith("/dapps")}
              >
                <Square2StackIcon />
                <SidebarLabel>DApps</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                disabled
                // href="/opportunities"
                current={pathname.startsWith("/strategies")}
              >
                <ArrowTrendingUpIcon />
                <SidebarLabel>Opportunities</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                disabled
                // href="/strategies"
                current={pathname.startsWith("/strategies")}
              >
                <WrenchScrewdriverIcon />
                <SidebarLabel>Strategies</SidebarLabel>
              </SidebarItem>
            </SidebarSection>

            <SidebarSpacer />

            <SidebarSection>
              <SidebarItem href="https://twitter.com/titanfi">
                <Avatar src="/twitter.svg" />
                <SidebarLabel>Twitter</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarBody>

          <SidebarFooter className="max-lg:hidden">
            <DynamicWidget />
          </SidebarFooter>
        </Sidebar>
      }
    >
      {children}
    </SidebarLayout>
  );
}
