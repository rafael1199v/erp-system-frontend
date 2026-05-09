export enum BasicStatus {
	DISABLE = 0,
	ENABLE = 1,
}

export enum ResultStatus {
	SUCCESS = 0,
	ERROR = -1,
	TIMEOUT = 401,
}

export enum StorageEnum {
	UserInfo = "userInfo",
	UserToken = "userToken",
	Settings = "settings",
	I18N = "i18nextLng",
	CompanyId = "selectedCompanyId",
	CompanyCen = "selectedCompanyCen",
	CompanyName = "selectedCompanyName",
	CompanyImage = "selectedCompanyImage",
}

export enum ThemeMode {
	Light = "light",
	Dark = "dark",
}

export enum ThemeLayout {
	Vertical = "vertical",
	Horizontal = "horizontal",
	Mini = "mini",
}

export enum ThemeColorPresets {
	Default = "default",
	Cyan = "cyan",
	Purple = "purple",
	Blue = "blue",
	Orange = "orange",
	Red = "red",
}

export enum LocalEnum {
	en_US = "en_US",
	zh_CN = "zh_CN",
	es_ES = "es_ES",
}

export enum MultiTabOperation {
	FULLSCREEN = "fullscreen",
	REFRESH = "refresh",
	CLOSE = "close",
	CLOSEOTHERS = "closeOthers",
	CLOSEALL = "closeAll",
	CLOSELEFT = "closeLeft",
	CLOSERIGHT = "closeRight",
}

export enum PermissionType {
	GROUP = 0,
	CATALOGUE = 1,
	MENU = 2,
	COMPONENT = 3,
}

export enum HtmlDataAttribute {
	ColorPalette = "data-color-palette",
	ThemeMode = "data-theme-mode",
}

export enum ProductStatus {
	AVAILABLE = 1,
	UNAVAILABLE = 2,
}

export enum MovementStatus {
	DRAW = 1,
	COMPLETED = 2,
}

export enum MovementType {
	RECEIPT = 1,
	ISSUE = 2,
	ADJUSTMENT = 3,
}

export enum TransactionType {
	ADJUSTMENT = 1,
	IN = 2,
	OUT = 3,
}
