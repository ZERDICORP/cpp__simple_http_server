let pageMenu = {
	images: {},
	sTitle: "ZERDICORP",
	sCssPrefix: "menu__",
	state: {
		base: {
			bNeedToUpdate: true,
			bClick: false,
			bCopyActionState: null,
			beforeRerender(parent)
			{
				this.bNeedToUpdate = true;
				this.bClick = true;
				renderer();
			},
			clickHandler(callback)
			{
				if (!this.bClick)
				{
					callback();
					this.bClick = true;
				}
			},
			ifNeedToUpdateThenUpdate(parent)
			{
				if (this.bNeedToUpdate)
				{
					this.bClick = false;
					this.update(parent);
					this.bNeedToUpdate = false;
				}
			},
			update(parent)
			{
				tools.setPageTitle(parent.sTitle);
				tools.setHtml("wrapper", `
					<div class="title_container">
						<h1 class="title">ZERDICORP</h1>
					</div>
					<div class="content ${parent.sCssPrefix}content">
						<div class="button ${parent.sCssPrefix}about">
							<span>about</span>
						</div>
						<div class="button ${parent.sCssPrefix}portfolio">
							<span>portfolio</span>
						</div>
						<div class="button ${parent.sCssPrefix}github">
							<span>github</span>
						</div>
						<div class="button ${parent.sCssPrefix}telegram">
							<span>telegram</span>
						</div>
						<div class="button ${parent.sCssPrefix}cv">
							<span>curriculum vitae</span>
						</div>
						<div class="button ${parent.sCssPrefix}gmail"></div>
					</div>
				`);

				
				if (this.bCopyActionState < 0)
				{
					tools.addClass(parent.sCssPrefix + "gmail", parent.sCssPrefix + "no_hover");
					let input = document.createElement("input");
					input.value = "nikolaianikin2002@gmail.com";
					input.className = parent.sCssPrefix + "gmail_text";
					input.readOnly = true;
					tools.addChild(parent.sCssPrefix + "gmail", input);
					input.select();
				}
				else
				{
					tools.setHtml(parent.sCssPrefix + "gmail", "<span>gmail</span>");
					tools.onClick(parent.sCssPrefix + "gmail", async () => {
						this.bCopyActionState = await tools.copyToClipboard("nikolaianikin2002@gmail.com", (text) => msg.show(text));
						this.beforeRerender(parent);
					});
				}

				tools.addChild(parent.sCssPrefix + "about", parent.images["info"].cloneNode());
				tools.addChild(parent.sCssPrefix + "portfolio", parent.images["star"].cloneNode());
				tools.addChild(parent.sCssPrefix + "cv", parent.images["download"].cloneNode());
				tools.addChild(parent.sCssPrefix + "github", parent.images["reference"].cloneNode());
				tools.addChild(parent.sCssPrefix + "telegram", parent.images["reference"].cloneNode());
				tools.addChild(parent.sCssPrefix + "gmail", parent.images["copy"].cloneNode());

				tools.onClick(parent.sCssPrefix + "about", () => this.clickHandler(
					tools.redirectWithoutReload("/about", () => this.beforeRerender(parent))));
				tools.onClick(parent.sCssPrefix + "portfolio", () => this.clickHandler(
					tools.redirectWithoutReload("/portfolio", () => this.beforeRerender(parent))));
				tools.onClick(parent.sCssPrefix + "cv", () => {
					msg.show('Download: "zerdicorp_cv.pdf"');
					tools.redirect("/db/zerdicorp_cv.pdf");
				});
				tools.onClick(parent.sCssPrefix + "github", () => window.open("https://github.com/ZERDICORP"));
				tools.onClick(parent.sCssPrefix + "telegram", () => window.open("https://t.me/ZERDICORP"));
			}
		},
		preload: {
			bNeedToUpdate: true,
			async ifNeedToUpdateThenUpdate(parent)
			{
				if (this.bNeedToUpdate)
				{
					await this.update(parent);
					this.bNeedToUpdate = false;
				}
			},
			async update(parent)
			{
				let images = [
					["info", "/static/assets/info.png"],
					["star", "/static/assets/star.png"],
					["download", "/static/assets/download.png"],
					["reference", "/static/assets/ref.png"],
					["copy", "/static/assets/copy.png"],
					["close", "/static/assets/close.png"],
				];
				for (let i = 0; i < images.length; i++)
				{
					let img = new Image();
					img.src = images[i][1];
					img.alt = images[i][0];
					parent.images[images[i][0]] = img;
				}
			}
		}
	},
	async render()
	{
		await this.state.preload.ifNeedToUpdateThenUpdate(this);
		this.state.base.ifNeedToUpdateThenUpdate(this);

		return 200;
	}
};