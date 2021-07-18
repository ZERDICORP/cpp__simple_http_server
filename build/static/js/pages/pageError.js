let pageError = {
	sTitle: "ZERDICORP | ",
	sCssPrefix: "error__",
	baseHtml()
	{
		return `
			<div class="title_container ${this.sCssPrefix}title_container">
				<h1 class="title"></h1>
			</div>
			<div class="button back">
				menu
			</div>
		`;
	},
	render(errorCode, errorMessage)
	{
		tools.setPageTitle(this.sTitle + errorCode);
		tools.setHtml("wrapper", this.baseHtml());
		tools.setHtml("title", errorCode + " - " + errorMessage);
		
		tools.onClick("back", () => tools.redirectWithoutReload("/", renderer));
	}
};