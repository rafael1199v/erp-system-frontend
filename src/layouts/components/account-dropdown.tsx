import { useTranslation } from "react-i18next";
import { useRouter } from "@/routes/hooks";
import { useCompanyActions, useSelectedCompanyImage, useSelectedCompanyName } from "@/store/companyStore";
import { Button } from "@/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/ui/dropdown-menu";

/**
 * Account Dropdown
 */
export default function AccountDropdown() {
	const { replace } = useRouter();
	const companyImageUrl = useSelectedCompanyImage();
	const companyName = useSelectedCompanyName();
	const { clearCompanyData } = useCompanyActions();

	const { t } = useTranslation();
	const logout = () => {
		try {
			clearCompanyData();
		} catch (error) {
			console.log(error);
		} finally {
			replace("/company");
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="rounded-full">
					<img
						className="h-6 w-6 rounded-full"
						src={
							companyImageUrl ??
							"https://imgs.search.brave.com/0uLt8Hlx9Wor8PdPNyjFYOTYqD9EkJbomMFEurQ40Ck/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMjgv/MjAyLzM5Ni9zbWFs/bC9vbGQtbWFuLXRl/YWNoZXItZmFjZS0z/ZC1wcm9mZXNzaW9u/LWF2YXRhcnMtZnJl/ZS1wbmcucG5n"
						}
						alt=""
					/>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56">
				<div className="flex items-center gap-2 p-2">
					<img
						className="h-10 w-10 rounded-full"
						src={
							companyImageUrl ??
							"https://imgs.search.brave.com/0uLt8Hlx9Wor8PdPNyjFYOTYqD9EkJbomMFEurQ40Ck/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMjgv/MjAyLzM5Ni9zbWFs/bC9vbGQtbWFuLXRl/YWNoZXItZmFjZS0z/ZC1wcm9mZXNzaW9u/LWF2YXRhcnMtZnJl/ZS1wbmcucG5n"
						}
						alt=""
					/>
					<div className="flex flex-col items-start">
						<div className="text-text-primary text-sm font-medium">{companyName}</div>
					</div>
				</div>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="font-bold text-warning cursor-pointer" onClick={logout}>
					{t("sys.login.logout")}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
