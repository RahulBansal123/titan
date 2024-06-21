"use client";

import { Avatar } from "@/components/catalyst/avatar";
import {
	Dropdown,
	DropdownButton,
	DropdownItem,
	DropdownLabel,
	DropdownMenu,
} from "@/components/catalyst/dropdown";
import {
	Navbar,
	NavbarItem,
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
	ArrowRightStartOnRectangleIcon,
	ChevronUpIcon,
} from "@heroicons/react/16/solid";
import {
	ArrowTrendingUpIcon,
	HomeIcon,
	Square2StackIcon,
	WrenchScrewdriverIcon,
} from "@heroicons/react/20/solid";
import { usePathname } from "next/navigation";

import { DynamicWidget, useDynamicContext } from "@/lib/dynamic";
import { useIsMounted } from "@/hooks/useIsMounted";
import { Button } from "@/components/catalyst/button";

function AccountDropdownMenu({
	anchor,
}: { anchor: "top start" | "bottom end" }) {
	return (
		<DropdownMenu className="min-w-64" anchor={anchor}>
			<DropdownItem href="#">
				<ArrowRightStartOnRectangleIcon />
				<DropdownLabel>Sign out</DropdownLabel>
			</DropdownItem>
		</DropdownMenu>
	);
}

export function ApplicationLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const { setShowAuthFlow, isAuthenticated } = useDynamicContext();
	const isMounted = useIsMounted();

	if (!isMounted) return;

	return (
		<SidebarLayout
			navbar={
				<Navbar>
					<NavbarSpacer />
					<NavbarSection>
						<Dropdown>
							<DropdownButton as={NavbarItem}>
								<Avatar src="/users/erica.jpg" square />
							</DropdownButton>
							<AccountDropdownMenu anchor="bottom end" />
						</Dropdown>
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
								href="/strategies"
								current={pathname.startsWith("/strategies")}
							>
								<ArrowTrendingUpIcon />
								<SidebarLabel>Opportunities</SidebarLabel>
							</SidebarItem>
							<SidebarItem
								href="/strategies"
								current={pathname.startsWith("/strategies")}
							>
								<WrenchScrewdriverIcon />
								<SidebarLabel>Strategies</SidebarLabel>
							</SidebarItem>
						</SidebarSection>

						<SidebarSection>
							<SidebarItem>
								<Avatar src="/networks/starknet.png" />
								<SidebarLabel>Starknet</SidebarLabel>
								{isAuthenticated ? (
									<DynamicWidget />
								) : (
									<Button onClick={() => setShowAuthFlow(true)}>Sign in</Button>
								)}
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
						<Dropdown>
							<DropdownButton as={SidebarItem}>
								<span className="flex min-w-0 items-center gap-3">
									<Avatar
										src="/users/erica.jpg"
										className="size-10"
										square
										alt=""
									/>
									<span className="min-w-0">
										<span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
											Erica
										</span>
										<span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
											erica@example.com
										</span>
									</span>
								</span>
								<ChevronUpIcon />
							</DropdownButton>
							<AccountDropdownMenu anchor="top start" />
						</Dropdown>
					</SidebarFooter>
				</Sidebar>
			}
		>
			{children}
		</SidebarLayout>
	);
}
